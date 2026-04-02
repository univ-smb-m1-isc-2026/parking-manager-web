"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ParkingsTab } from "@/components/dashboard/ParkingsTab";
import { EmployeesTab } from "@/components/dashboard/EmployeesTab";
import { fetchWithAuth } from "@/lib/api";
import { getEntrepriseIdFromToken, getUserNameFromToken } from "@/lib/auth";

// Interface

export interface VehicleInfo {
  plate: string;
  spot: string | null;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  vehicles: VehicleInfo[];
  isBoss: boolean;
  spot: string | null;
}

interface Entreprise {
  idEntreprise: number;
  nomEntreprise: string;
}

export interface Parking {
  id: number;
  name: string;
  description: string;
  linkMaps: string;
  entrepriseId?: number;
  entrepriseNom?: string;
  totalSpots?: number;
  occupied?: number;
  pricing?: {
    annual: number | string;
    daily: number | string;
  };
}


interface FormattedRequest {
  id: number;
  employee: string;
  status: string;
  type: string;
  date: string;
  parking: string;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // États pour les données API
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [requests, setRequests] = useState<FormattedRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Admin");
  const [companyName, setCompanyName] = useState("Chargement...");

  useEffect(() => {
    const idEntreprise = getEntrepriseIdFromToken();
    const nameFromToken = getUserNameFromToken();

    if (nameFromToken) setUserName(nameFromToken);
    if (!idEntreprise) {
      console.error("Impossible de trouver l'ID de l'entreprise dans le token");
      setIsLoading(false);
      return;
    }
    async function loadAllData() {
      try {
        // On lance les 4 requêtes principales en parallèle
        const [parkingsRes, employeesRes, requestsRes, entrepriseRes] = await Promise.all([
          fetchWithAuth(`/api/parking/getParkingByEntreprise/${idEntreprise}`),
          fetchWithAuth(`/api/users/entreprise/${idEntreprise}`),
          fetchWithAuth(`/api/demandePermanante/entreprise/${idEntreprise}`),
          fetchWithAuth(`/api/entreprise/getEntrepriseById/${idEntreprise}`)
        ]);

        // On stocke les résultats bruts
        let rawEmployees: any[] = [];
        let rawRequests: any[] = [];

        if (parkingsRes.ok) {
          const rawParkings = await parkingsRes.json();
          
          // 1. On crée les requêtes pour récupérer les places de chaque parking
          // Note: On vérifie p.idParking ou p.id au cas où Spring le nomme différemment
          const placesPromises = rawParkings.map((p: any) => 
            fetchWithAuth(`/api/place/getPlaceByParkingId/${p.idParking || p.id}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );

          // 2. On attend que toutes les places soient récupérées
          const allPlacesArrays = await Promise.all(placesPromises);

          // 3. On formate les parkings en ajoutant les stats des places
          const formattedParkings: Parking[] = rawParkings.map((parking: any, index: number) => {
            const places = allPlacesArrays[index] || [];
            
            // Calcul des statistiques
            const totalSpots = places.length;
            const occupied = places.filter((pl: any) => pl.etat === true || pl.user !== null).length;
            
            let annual = "--";
            let daily = "--";
            if (places.length > 0) {
              annual = places[0].tarifAnnuel;
              daily = places[0].tarifJournalier;
            }

            return {
              id: parking.idParking || parking.id,
              name: parking.name,
              description: parking.description,
              linkMaps: parking.linkMaps,
              totalSpots,
              occupied,
              pricing: { annual, daily }
            };
          });

          setParkings(formattedParkings);
        }
        
        if (entrepriseRes.ok) {
          const entrepriseData = await entrepriseRes.json();
          if (entrepriseData.nom) setCompanyName(entrepriseData.nom);
        }
        if (requestsRes.ok) {
          rawRequests = await requestsRes.json();
          
          const formattedRequests = rawRequests.map((req: any) => ({
            id: req.idDemandePlacePermanante,
            employee: `${req.user.name} ${req.user.surname}`,
            status: req.etat === 1 ? "PENDING" : (req.etat === 2 ? "APPROVED" : "REJECTED"),
            type: "PERMANENT",
            date: "Aujourd'hui",
            parking: req.place?.parking?.name || "Parking non spécifié",
          }));

          setRequests(formattedRequests);
        }

        if (employeesRes.ok) {
          rawEmployees = await employeesRes.json();
          
          // On crée un tableau de promesses pour aller chercher les véhicules de CHAQUE employé en parallèle
          const vehiclesPromises = rawEmployees.map(user => 
            fetchWithAuth(`/api/vehicule/getVehiculeByUserId/${user.idUser}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => []) // Sécurité en cas d'erreur
          );

          // On attend que toutes les requêtes de véhicules soient terminées !
          const allVehiclesArrays = await Promise.all(vehiclesPromises);

          // On formate enfin nos employés avec leurs véhicules et leurs places
          const formattedEmployees: Employee[] = rawEmployees.map((user: any, index: number) => {
            
            // a. On cherche la demande approuvée
            const approvedRequest = rawRequests.find((req: any) => 
              req.user?.idUser === user.idUser && req.etat == 2
            );

            //DEBUG
            if (approvedRequest) {
               console.log(`Demande approuvée trouvée pour ${user.name}:`, approvedRequest);
            }
            
            // b. On récupère le nom de la place
            let spotName = null;
            if (approvedRequest && approvedRequest.place) {
              // On teste "idPlace", "id", ou si l'API a juste renvoyé le chiffre direct
              const placeId = approvedRequest.place.idPlace || approvedRequest.place.id || approvedRequest.place;
              spotName = `Place n°${placeId}`;
            }

            // c. On formate ses véhicules (sans s'occuper de la place ici !)
            const rawUserVehicles = allVehiclesArrays[index] || [];
            const formattedVehicles = rawUserVehicles.map((veh: any) => ({
              plate: veh.immatriculation || veh.plaque || veh.marque || "Inconnu",
              spot: null 
            }));

            // d. On retourne l'objet
            return {
              id: user.idUser,
              name: `${user.name} ${user.surname}`,
              email: user.mail,
              isBoss: user.status === true || user.status === 1 || user.role === 1,
              vehicles: formattedVehicles,
              spot: spotName
            };
          });

          formattedEmployees.sort((a, b) => (a.isBoss === b.isBoss ? 0 : a.isBoss ? -1 : 1));

          setEmployees(formattedEmployees);
        }

      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllData();
  }, []);

  // On recalcule les stats avec la longueur réelle de la liste
  const dynamicStats = {
    totalParkings: parkings.length,
    totalSpots: parkings.reduce((acc, parking) => acc + (parking.totalSpots || 0), 0), 
    activeEmployees: employees.length > 0 ? employees.length - 1 : 0,
    pendingRequests: requests.filter((r) => r.status === "PENDING").length,
  };

  // Gestion des actions sur les demandes (PATCH)
  const handleRequestAction = async (id: number, action: string) => {
    try {
      // On vérifie que l'action est correcte avant l'appel
      let apiAction = "";
      if (action === "accept" || action === "accepter") {
        apiAction = "accepter";
      } else if (action === "reject" || action === "refuser") {
        apiAction = "refuser";
      } else {
        console.error("Action inconnue :", action);
        return;
      }
      const response = await fetchWithAuth(`/api/demandePermanante/${id}/${apiAction}`, {
        method: 'PATCH'
      });

      if (response.ok) {
        setRequests(prev => prev.map(req => 
          req.id === id ? { ...req, status: action === "accepter" ? "APPROVED" : "REJECTED" } : req
        ));
      }
    } catch (error) {
      alert("Erreur lors de l'action sur la demande.");
    }
  };

  // GESTION DES PARKINGS
  const handleDeleteParking = async (id: number) => {
    try {
      const response = await fetchWithAuth(`/api/parking/deleteParking/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        setParkings(prev => prev.filter(p => p.id !== id));
      } else {
        alert("Erreur lors de la suppression du parking.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau lors de la suppression.");
    }
  };

  const handleGenerateSpots = async (parkingId: number, data: {quantite: number, tarifJournalier: number, tarifAnnuel: number}) => {
    try {
      const response = await fetchWithAuth('/api/place/generer', {
        method: 'POST',
        body: JSON.stringify({
          parkingId: parkingId,
          quantite: data.quantite,
          tarifJournalier: data.tarifJournalier,
          tarifAnnuel: data.tarifAnnuel
        })
      });

      if (response.ok) {
        setParkings(prev => prev.map(p => {
          if (p.id === parkingId) {
            return {
              ...p,
              totalSpots: (p.totalSpots || 0) + data.quantite,
              pricing: {
                annual: data.tarifAnnuel,
                daily: data.tarifJournalier
              }
            };
          }
          return p;
        }));
      } else {
        alert("Erreur lors de la génération des places.");
      }
    } catch (error) {
      console.error("Erreur génération places:", error);
      alert("Erreur réseau lors de la génération.");
    }
  };

  const handleEditParking = async (id: number, updatedData: any) => {
    // On assemble les données du formulaire avec l'ID de l'entreprise
    const finalData = {
      ...updatedData,
      entrepriseId: getEntrepriseIdFromToken() || 1 // Remplace par l'id par défaut si besoin
    };

    try {
      const response = await fetchWithAuth(`/api/parking/editParking/${id}`, {
        method: 'PUT',
        body: JSON.stringify(finalData)
      });

      if (response.ok) {
        // On met à jour l'interface React instantanément
        setParkings(prev => prev.map(p => 
          p.id === id ? { ...p, ...finalData } : p
        ));
      } else {
        alert("Erreur lors de la modification du parking.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau lors de la modification.");
    }
  };

  const handleAddParking = async (newData: any) => {
    const idEntreprise = getEntrepriseIdFromToken();
    if (!idEntreprise) return;

    // Le JSON attendu par ton API
    const payload = {
      ...newData,
      entrepriseId: idEntreprise
    };

    try {
      const response = await fetchWithAuth('/api/parking/addParking', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        let newId = Date.now(); // ID temporaire
        try {
          const createdParking = await response.json();
          if (createdParking.idParking || createdParking.id) {
             newId = createdParking.idParking || createdParking.id;
          }
        } catch (e) {
        }

        const parkingCard: Parking = {
          id: newId,
          name: payload.name,
          description: payload.description,
          linkMaps: payload.linkMaps,
          entrepriseId: payload.entrepriseId,
          totalSpots: 0, // Un nouveau parking a 0 place
          occupied: 0,
          pricing: { annual: "--", daily: "--" }
        };

        setParkings(prev => [...prev, parkingCard]);
      } else {
        alert("Erreur lors de la création du parking.");
      }
    } catch (error) {
      console.error(error);
      alert("Erreur réseau lors de la création.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* 1. Sidebar Component */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        companyName={companyName}
      />

      <main className="ml-64 p-8">  
        {/* 2. Header  */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {activeTab === "overview" && "Tableau de bord"}
            {activeTab === "parkings" && "Gestion des Parkings"}
            {activeTab === "employees" && "Annuaire Salariés"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Bonjour, {userName}</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        {/* 3. Conditional Content */}
        {isLoading ? (
          <div className="flex justify-center p-10">
            Chargement des données...
          </div>
        ) : (
          <>
            {/* Vue d'ensemble avec les vraies stats */}
            {activeTab === "overview" && (
              <OverviewTab
                stats={dynamicStats}
                requests={requests}
                onRequestAction={handleRequestAction}
              />
            )}

            {/* Onglet Parkings */}
            {activeTab === "parkings" && (
              <ParkingsTab 
                parkings={parkings} 
                onDelete={handleDeleteParking} 
                onEditSubmit={handleEditParking}
                onAddSubmit={handleAddParking}
                onGenerateSubmit={handleGenerateSpots}
              />
            )}

            {/* Onglet Salariés */}
            {activeTab === "employees" && (
              <EmployeesTab
                employees={employees} 
                // On passe les deux nouvelles props ici !
                entrepriseId={getEntrepriseIdFromToken() || 0} 
                companyName={companyName}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}
