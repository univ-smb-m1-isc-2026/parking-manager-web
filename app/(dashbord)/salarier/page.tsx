"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { SalarierSidebar } from "@/components/dashboard/SalarierSidebar";
import { SalarierOverviewTab } from "@/components/dashboard/SalarierOverviewTab";
import { SalarierVehiclesTab } from "@/components/dashboard/SalarierVehiclesTab";
import { SalarierParkingsTab } from "@/components/dashboard/SalarierParkingsTab";
import { createClient } from "@/lib/client";

export default function SalarierDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [userName, setUserName] = useState("Salarié");
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [entrepriseId, setEntrepriseId] = useState<number | null>(null);
  
  // AJOUT : Stocker l'ID numérique de la BDD Java
  const [javaUserId, setJavaUserId] = useState<number | null>(null);
  
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [parkings, setParkings] = useState<any[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [demandes, setDemandes] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserAndData() {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        const rawToken = Cookies.get("session_token");
        const apiToken = rawToken?.replace(/"/g, ""); 

        if (!user || !apiToken) {
          window.location.href = "/signIn";
          return;
        }

        const headers = { 
          "Authorization": `Bearer ${apiToken}`,
          "Content-Type": "application/json"
        };

        // 1. Récupérer l'ID Java et attendre le résultat
        const userInfosRes = await fetch(`http://localhost:8080/api/auth/me?mail=${user.email}`, { headers });
        
        if (userInfosRes.ok) {
          const userData = await userInfosRes.json();
          const currentUserId = userData.idUser; // On extrait l'ID ici
          setJavaUserId(currentUserId);
          setEntrepriseId(userData.entrepriseId);
          
          // Mettre à jour les infos profil
          setUserName(userData.name || user.user_metadata?.full_name || "Salarié");
          setUserEmail(userData.mail || user.email);

          // 2. Charger les données en utilisant currentUserId
          const [vehiclesRes, parkingsRes, demandesRes, placesRes] = await Promise.all([
            fetch(`http://localhost:8080/api/vehicule/getVehiculeByUserId/${currentUserId}`, { headers })
              .then(r => r.ok ? r.json() : [])
              .catch(() => []),
            fetch(`http://localhost:8080/api/parking/getParkingByEntreprise/${userData.entrepriseId}`, { headers })
              .then(r => r.ok ? r.json() : [])
              .catch(() => []),
            fetch(`http://localhost:8080/api/demandePermanante/user/${currentUserId}`, { headers })
              .then(r => r.ok ? r.json() : [])
              .catch(() => []),
            fetch(`http://localhost:8080/api/place/getPlaceByUserId/${currentUserId}`, { headers })
              .then(r => r.ok ? r.json() : [])
              .catch(() => []),
          ]);

          setVehicles(Array.isArray(vehiclesRes) ? vehiclesRes : []);
          
          // Charger les places pour chaque parking pour calculer l'occupation
          const rawParkings = Array.isArray(parkingsRes) ? parkingsRes : [];
          const placesPromises = rawParkings.map((p: any) => 
            fetch(`http://localhost:8080/api/place/getPlaceByParkingId/${p.idParking || p.id}`, { headers })
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );
          const allPlacesArrays = await Promise.all(placesPromises);
          
          const parkingsWithOccupancy = rawParkings.map((parking: any, index: number) => {
            const places = allPlacesArrays[index] || [];
            return {
              ...parking,
              totalSpots: places.length,
              occupied: places.filter((pl: any) => pl.etat === true || pl.user !== null).length,
            };
          });
          setParkings(parkingsWithOccupancy);
          
          // Mapper les places pour correspondre à l'interface PlaceAssignee
          const placesMapped = Array.isArray(placesRes) ? placesRes.map((p: any) => ({
            id: p.idPlace,
            parkingName: p.parking?.name || 'Parking',
            spot: p.numero || `Place n°${p.idPlace}`,
            type: p.type || 'PERMANENT',
            vehiclePlate: p.user?.immatriculation || '--',
            status: p.etat === true ? 'ACTIVE' : 'EXPIRED'
          })) : [];
          setPlaces(placesMapped);
          
          // Mapper les demandes pour correspondre à l'interface Demande
          const demandesMapped = Array.isArray(demandesRes) ? demandesRes.map((d: any) => ({
            id: d.idDemandePlacePermanante,
            parkingName: d.place?.parking?.name || 'Parking',
            type: d.type || 'PERMANENT',
            date: d.dateCreation || new Date().toISOString().split('T')[0],
            status: d.etat === 1 ? 'PENDING' : (d.etat === 2 ? 'APPROVED' : 'REJECTED')
          })) : [];
          setDemandes(demandesMapped);
        } else {
          console.error("Impossible de récupérer les infos utilisateur Java");
        }

      } catch (error) {
        console.error("❌ Erreur chargement:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadUserAndData();
  }, []);

  const handleAddVehicle = async (newVehicle: any) => {
  try {
    const apiToken = Cookies.get("session_token")?.replace(/"/g, "");
    if (!javaUserId || !apiToken) return;

    const payload = {
      immatriculation: newVehicle.immatriculation,
      userId: javaUserId,
    };

    const response = await fetch("http://localhost:8080/api/vehicule/addVehicule", {
      method: "POST",
      headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiToken}` 
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const contentType = response.headers.get("content-type");
      
      if (contentType && contentType.includes("application/json")) {
        const addedVehicle = await response.json();
        setVehicles([...vehicles, addedVehicle]);
      } else {
        console.log("Le serveur a répondu avec succès (mais pas de JSON)");
        
        setVehicles([...vehicles, { ...payload, idVehicule: Date.now() }]); 
      }
    } else {
      const errorText = await response.text();
      alert(`❌ Erreur: ${errorText}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout:", error);
  }
};

  const handleDeleteVehicle = async (vehicleId: number) => {
    try {
      const apiToken = Cookies.get("session_token");
      const response = await fetch(`http://localhost:8080/api/vehicule/deleteVehicule/${vehicleId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${apiToken}` },
      });

      if (response.ok) {
        setVehicles(vehicles.filter((v) => v.idVehicule !== vehicleId));
        alert("✅ Véhicule supprimé");
      }
    } catch (error) {
      alert("❌ Erreur lors de la suppression");
    }
  };

  const handleRequestPlace = async (parkingId: number) => {
        if (!parkingId) {
            console.error("❌ parkingId undefined !");
            return;
        }
        try {
            const apiToken = Cookies.get("session_token")?.replace(/"/g, "");

            if (!javaUserId || !entrepriseId || !apiToken) {
                throw new Error("Utilisateur non connecté ou informations incomplètes");
            }

            const response = await fetch("http://localhost:8080/api/demandePermanante", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiToken}`,
                },
                body: JSON.stringify({
                    userId: javaUserId,
                    entrepriseId: entrepriseId,
                    parkingId: parkingId,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();

            setDemandes((prev) => [...prev, data]);

        } catch (error) {
            console.error("Erreur demande:", error);
            throw error; 
        }
    };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <SalarierSidebar activeTab={activeTab} setActiveTab={setActiveTab} userName={userName} />

      <main className="ml-64 p-8">
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {activeTab === "overview" && "Mes places"}
            {activeTab === "vehicles" && "Mes véhicules"}
            {activeTab === "parkings" && "Parkings disponibles"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Bonjour, {userName}</span>
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold uppercase">
              {userName.charAt(0)}
            </div>
          </div>
        </header>

        {isLoading ? (
          <div className="flex justify-center p-10 font-medium text-gray-400">Chargement des données...</div>
        ) : (
          <>
            {activeTab === "overview" && <SalarierOverviewTab places={places} demandes={demandes} />}
            {activeTab === "vehicles" && (
              <SalarierVehiclesTab 
                vehicles={vehicles} 
                onDeleteVehicle={handleDeleteVehicle} 
                onAddVehicle={handleAddVehicle} 
              />
            )}
            {activeTab === "parkings" && (
              <SalarierParkingsTab 
                parkings={parkings} 
                onRequestPlace={handleRequestPlace} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}