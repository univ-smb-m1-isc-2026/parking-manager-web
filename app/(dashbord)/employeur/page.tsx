"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ParkingsTab } from "@/components/dashboard/ParkingsTab";
import { EmployeesTab } from "@/components/dashboard/EmployeesTab";
import { fetchWithAuth } from "@/lib/api";
import { getEntrepriseIdFromToken, getUserNameFromToken } from "@/lib/auth";
// --- DONNÉES DE DÉMO ---
// Tu peux même déplacer ça dans un fichier lib/data.ts plus tard
const DATA = {
  companyName: "TechCorp Solutions",
  stats: {
    totalParkings: 3,
    totalSpots: 180,
    activeEmployees: 42,
    pendingRequests: 2,
  },
  parkings: [
    {
      id: 1,
      name: "Siege Social - Sous-sol",
      desc: "Accès via badge",
      mapsLink: "#",
      totalSpots: 50,
      occupied: 45,
      pricing: { annual: 1200, daily: 5 },
    },
    {
      id: 2,
      name: "Parking Extérieur Nord",
      desc: "Zone grillagée",
      mapsLink: "#",
      totalSpots: 100,
      occupied: 20,
      pricing: { annual: 800, daily: 2 },
    },
  ],
  requests: [
    {
      id: 101,
      employee: "Jean Dupont",
      type: "PERMANENT",
      parking: "Siege Social - Sous-sol",
      date: "10/02/2026",
      status: "PENDING",
    },
    {
      id: 102,
      employee: "Elliott Moiroud",
      type: "PERMANENT",
      parking: "Siege Social - Sous-sol",
      date: "10/02/2026",
      status: "PENDING",
    },
    {
      id: 103,
      employee: "Sophie Martin",
      type: "TEMPORAIRE",
      parking: "Parking Extérieur Nord",
      date: "10/02/2026",
      status: "AUTO-CONFIRMED",
    },
  ],
  employees: [
    {
      id: 1,
      name: "Jean Dupont",
      email: "jean@techcorp.com",
      vehicles: [
        { plate: "AB-123-CD", spot: "P1-12" },
        { plate: "XY-999-ZZ", spot: null },
      ],
    },
    {
      id: 2,
      name: "Elliott Moiroud",
      email: "elliott@techcorp.com",
      vehicles: [{ plate: "CD-456-EF", spot: "P2-04" }],
    },
    {
      id: 3,
      name: "Alice Martin",
      email: "alice@techcorp.com",
      vehicles: [],
    },
  ],
};

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
}

interface Entreprise {
  idEntreprise: number;
  nomEntreprise: string;
}

interface Parking {
  idParking: number;
  name: string;
  description: string;
  linkMaps: string;
  entreprise?: Entreprise;
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

        if (parkingsRes.ok) setParkings(await parkingsRes.json());
        if (employeesRes.ok) {
          const rawEmployees = await employeesRes.json();
          
          // On formate les données de l'API pour coller à l'interface Employee attendue par l'onglet
          const formattedEmployees: Employee[] = rawEmployees.map((user: any) => ({
            id: user.idUser,
            name: `${user.name} ${user.surname}`,
            email: user.mail,
            vehicles: [] ,
            isBoss: user.status === true || user.status === 1 || user.role === 1
          }));

          formattedEmployees.sort((a, b) => (a.isBoss === b.isBoss ? 0 : a.isBoss ? -1 : 1));

          setEmployees(formattedEmployees);
        }
        if (entrepriseRes.ok) {
          const entrepriseData = await entrepriseRes.json();
          if (entrepriseData.nom) setCompanyName(entrepriseData.nom);
        }
        if (requestsRes.ok) {
          const data = await requestsRes.json();
          
          const formattedRequests = data.map((req: any) => ({
            id: req.idDemandePlacePermanante,
            employee: `${req.user.name} ${req.user.surname}`,
            status: req.etat === 1 ? "PENDING" : (req.etat === 2 ? "APPROVED" : "REJECTED"),
            type: "PERMANENT",
            date: "Aujourd'hui",
            parking: req.place?.parking?.name || "Parking non spécifié",
          }));

          setRequests(formattedRequests);
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
    totalSpots: "--",
    activeEmployees: employees.length-1,
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
        alert(`Demande ${action}ée avec succès.`);
      }
    } catch (error) {
      alert("Erreur lors de l'action sur la demande.");
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
            {activeTab === "parkings" && <ParkingsTab parkings={DATA.parkings} />}

            {/* Onglet Salariés */}
            {activeTab === "employees" && (
              <EmployeesTab employees={employees} />
            )}
          </>
        )}
      </main>
    </div>
  );
}
