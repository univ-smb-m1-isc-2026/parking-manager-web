"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { ParkingsTab } from "@/components/dashboard/ParkingsTab";
import { EmployeesTab } from "@/components/dashboard/EmployeesTab";
import { fetchWithAuth } from "@/lib/api";
import { getEntrepriseIdFromToken, getUserNameFromToken, getUserEmailFromToken} from "@/lib/auth";
import { X, Save } from "lucide-react";

// --- Interfaces ---
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  // États pour la modale de profil
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    name: '',
    surname: '',
    mail: '',
    password: ''
  });

  useEffect(() => {
    const idEntreprise = getEntrepriseIdFromToken();
    const nameFromToken = getUserNameFromToken();
    const userEmail = getUserEmailFromToken();

    if (nameFromToken) setUserName(nameFromToken);
    
    if (!idEntreprise) {
      console.error("Impossible de trouver l'ID de l'entreprise");
      setIsLoading(false);
      return;
    }

    async function loadAllData() {
      try {
        // On lance les 4 requêtes principales
        const [parkingsRes, employeesRes, requestsRes, entrepriseRes] = await Promise.all([
          fetchWithAuth(`/api/parking/getParkingByEntreprise/${idEntreprise}`),
          fetchWithAuth(`/api/users/entreprise/${idEntreprise}`),
          fetchWithAuth(`/api/demandePermanante/entreprise/${idEntreprise}`),
          fetchWithAuth(`/api/entreprise/getEntrepriseById/${idEntreprise}`)
        ]);

        let rawEmployees: any[] = [];
        let rawRequests: any[] = [];

        // 1. Traitement Entreprise
        if (entrepriseRes.ok) {
          const entrepriseData = await entrepriseRes.json();
          if (entrepriseData.nom) setCompanyName(entrepriseData.nom);
        }

        // 2. Traitement Demandes (pour l'affichage dans les cartes employés après)
        if (requestsRes.ok) {
          rawRequests = await requestsRes.json();
          setRequests(rawRequests.map((req: any) => ({
            id: req.idDemandePlacePermanante,
            employee: `${req.user.name} ${req.user.surname}`,
            status: req.etat === 1 ? "PENDING" : (req.etat === 2 ? "APPROVED" : "REJECTED"),
            type: "PERMANENT",
            date: "Aujourd'hui",
            parking: req.place?.parking?.name || "Parking non spécifié",
          })));
        }

        // 3. Traitement Employés & Profil
        if (employeesRes.ok) {
          rawEmployees = await employeesRes.json();
          
          // IDENTIFICATION DU PROFIL (Lien avec le token sub/email)
          const me = rawEmployees.find((u: any) => u.mail === userEmail);
          if (me) setCurrentUser(me);

          const vehiclesPromises = rawEmployees.map(user => 
            fetchWithAuth(`/api/vehicule/getVehiculeByUserId/${user.idUser}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );

          const allVehiclesArrays = await Promise.all(vehiclesPromises);

          const formattedEmployees: Employee[] = rawEmployees.map((user: any, index: number) => {
            const approvedRequest = rawRequests.find((req: any) => req.user?.idUser === user.idUser && req.etat == 2);
            let spotName = approvedRequest?.place ? `Place n°${approvedRequest.place.idPlace || approvedRequest.place.id}` : null;

            return {
              id: user.idUser,
              name: `${user.name} ${user.surname}`,
              email: user.mail,
              isBoss: user.status === true || user.role === 1,
              vehicles: (allVehiclesArrays[index] || []).map((veh: any) => ({
                plate: veh.immatriculation || "Inconnu",
                spot: null 
              })),
              spot: spotName
            };
          });

          formattedEmployees.sort((a, b) => (a.isBoss === b.isBoss ? 0 : a.isBoss ? -1 : 1));
          setEmployees(formattedEmployees);
        }

        // 4. Traitement Parkings
        if (parkingsRes.ok) {
          const rawParkings = await parkingsRes.json();
          const placesPromises = rawParkings.map((p: any) => 
            fetchWithAuth(`/api/place/getPlaceByParkingId/${p.idParking || p.id}`)
              .then(res => res.ok ? res.json() : [])
              .catch(() => [])
          );

          const allPlacesArrays = await Promise.all(placesPromises);

          setParkings(rawParkings.map((parking: any, index: number) => {
            const places = allPlacesArrays[index] || [];
            return {
              id: parking.idParking || parking.id,
              name: parking.name,
              description: parking.description,
              linkMaps: parking.linkMaps,
              totalSpots: places.length,
              occupied: places.filter((pl: any) => pl.etat === true || pl.user !== null).length,
              pricing: { 
                annual: places[0]?.tarifAnnuel || "--", 
                daily: places[0]?.tarifJournalier || "--" 
              }
            };
          }));
        }

      } catch (error) {
        console.error("Erreur globale:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadAllData();
  }, []);

  // Pré-remplissage dès que la modale s'ouvre
  useEffect(() => {
    if (isProfileModalOpen && currentUser) {
      setProfileFormData({
        name: currentUser.name || '',
        surname: currentUser.surname || '',
        mail: currentUser.mail || '',
        password: ''
      });
    }
  }, [isProfileModalOpen, currentUser]);

  const dynamicStats = {
    totalParkings: parkings.length,
    totalSpots: parkings.reduce((acc, p) => acc + (p.totalSpots || 0), 0), 
    activeEmployees: employees.length > 0 ? employees.length - 1 : 0,
    pendingRequests: requests.filter((r) => r.status === "PENDING").length,
  };

  // --- ACTIONS ---
  const handleRequestAction = async (id: number, action: string) => {
    let apiAction = action === "accept" || action === "accepter" ? "accepter" : "refuser";
    const res = await fetchWithAuth(`/api/demandePermanante/${id}/${apiAction}`, { method: 'PATCH' });
    if (res.ok) setRequests(prev => prev.map(req => req.id === id ? { ...req, status: apiAction === "accepter" ? "APPROVED" : "REJECTED" } : req));
  };

  const handleDeleteParking = async (id: number) => {
    const res = await fetchWithAuth(`/api/parking/deleteParking/${id}`, { method: 'DELETE' });
    if (res.ok) setParkings(prev => prev.filter(p => p.id !== id));
  };

  const handleGenerateSpots = async (parkingId: number, data: any) => {
    const res = await fetchWithAuth('/api/place/generer', { method: 'POST', body: JSON.stringify({ parkingId, ...data }) });
    if (res.ok) window.location.reload();
  };

  const handleEditParking = async (id: number, updatedData: any) => {
    const res = await fetchWithAuth(`/api/parking/editParking/${id}`, { method: 'PUT', body: JSON.stringify({ ...updatedData, entrepriseId: getEntrepriseIdFromToken() }) });
    if (res.ok) setParkings(prev => prev.map(p => p.id === id ? { ...p, ...updatedData } : p));
  };

  const handleAddParking = async (newData: any) => {
    const res = await fetchWithAuth('/api/parking/addParking', { method: 'POST', body: JSON.stringify({ ...newData, entrepriseId: getEntrepriseIdFromToken() }) });
    if (res.ok) window.location.reload();
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSavingProfile(true);

    const payload = {
      ...currentUser,
      name: profileFormData.name.trim() || currentUser.name,
      surname: profileFormData.surname.trim() || currentUser.surname,
      mail: profileFormData.mail.trim() || currentUser.mail,
      password: profileFormData.password !== '' ? profileFormData.password : currentUser.password 
    };

    try {
      const res = await fetchWithAuth(`/api/users/${currentUser.idUser}`, { method: 'PUT', body: JSON.stringify(payload) });
      if (res.ok) {
        setIsProfileModalOpen(false);
        window.location.reload(); 
      }
    } catch (error) { console.error(error); } finally { setIsSavingProfile(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} companyName={companyName} />
      <main className="ml-64 p-8">  
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {activeTab === "overview" && "Tableau de bord"}
            {activeTab === "parkings" && "Gestion des Parkings"}
            {activeTab === "employees" && "Annuaire Salariés"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">
              Bonjour, {currentUser ? `${currentUser.name}` : "Patron"}
            </span>
            <button 
              onClick={() => setIsProfileModalOpen(true)} 
              className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase hover:bg-blue-200 transition hover:scale-105 shadow-sm"
            >
              {currentUser ? currentUser.name.charAt(0) : userName.charAt(0)}
            </button>
          </div>
        </header>

        {isLoading ? <div className="flex justify-center p-10">Chargement...</div> : (
          <>
            {activeTab === "overview" && <OverviewTab stats={dynamicStats} requests={requests} onRequestAction={handleRequestAction} />}
            {activeTab === "parkings" && <ParkingsTab parkings={parkings} onDelete={handleDeleteParking} onEditSubmit={handleEditParking} onAddSubmit={handleAddParking} onGenerateSubmit={handleGenerateSpots} />}
            {activeTab === "employees" && <EmployeesTab employees={employees} entrepriseId={getEntrepriseIdFromToken() || 0} companyName={companyName} />}
          </>
        )}
      </main>

      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Mon Profil</h2>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" value={profileFormData.name} onChange={(e) => setProfileFormData({...profileFormData, name: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Prénom" required />
                <input type="text" value={profileFormData.surname} onChange={(e) => setProfileFormData({...profileFormData, surname: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nom" required />
              </div>
              <input type="email" value={profileFormData.mail} onChange={(e) => setProfileFormData({...profileFormData, mail: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Email" required />
              <input type="password" value={profileFormData.password} onChange={(e) => setProfileFormData({...profileFormData, password: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nouveau mot de passe (optionnel)" />
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium text-sm">Annuler</button>
                <button type="submit" disabled={isSavingProfile} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm disabled:opacity-70">
                  {isSavingProfile ? 'Envoi...' : <><Save size={16} /> Mettre à jour</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}