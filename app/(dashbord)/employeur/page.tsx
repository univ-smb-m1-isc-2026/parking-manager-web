'use client';

import { useState } from 'react';
import { 
  MapPin, 
  Users, 
  Car, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Mail,
  Plus,
  Euro
} from 'lucide-react';
import Image from 'next/image';

// --- DONNÉES DE DÉMO (MOCK) ---
const DATA = {
  companyName: "TechCorp Solutions",
  stats: {
    totalParkings: 3,
    totalSpots: 180,
    activeEmployees: 42,
    pendingRequests: 2
  },
  parkings: [
    { 
      id: 1, 
      name: "Siege Social - Sous-sol", 
      desc: "Accès via badge, hauteur max 1.90m",
      mapsLink: "https://maps.google.com/?q=45.123,5.456",
      totalSpots: 50,
      occupied: 45,
      pricing: { annual: 1200, daily: 5 } // Tarif annuel / journalier
    },
    { 
      id: 2, 
      name: "Parking Extérieur Nord", 
      desc: "Zone grillagée, accès libre en journée",
      mapsLink: "https://maps.google.com/?q=45.789,5.123",
      totalSpots: 100,
      occupied: 20,
      pricing: { annual: 800, daily: 2 }
    }
  ],
  requests: [
    { id: 101, employee: "Jean Dupont", type: "PERMANENT", parking: "Siege Social - Sous-sol", date: "10/02/2026", status: "PENDING" },
    { id: 102, employee: "Sophie Martin", type: "TEMPORAIRE", parking: "Parking Extérieur Nord", date: "10/02/2026", status: "AUTO-CONFIRMED" },
    { id: 103, employee: "Luc Leroy", type: "PERMANENT", parking: "Siege Social - Sous-sol", date: "09/02/2026", status: "PENDING" },
  ],
  employees: [
    { id: 1, name: "Jean Dupont", email: "jean@techcorp.com", vehicle: "AB-123-CD", spot: null },
    { id: 2, name: "Sophie Martin", email: "sophie@techcorp.com", vehicle: "EF-456-GH", spot: "Permanent (Siège)" },
  ]
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, parkings, employees
  const [requests, setRequests] = useState(DATA.requests);

  // Simulation validation demande
  const handleRequestAction = (id: number, action: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: action === 'accept' ? 'APPROVED' : 'REJECTED' } : req
    ));
    alert(`Demande ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* --- SIDEBAR / NAVIGATION --- */}
      <nav className="fixed top-0 left-0 w-64 h-full bg-slate-900 text-white flex flex-col">
        {/* Partie Logo + Titre modifiée */}
        <div className="p-6 border-b border-slate-700 flex items-center gap-3">
          {/* Conteneur de l'image */}
          <div className="relative h-20 w-20 flex-shrink-0">
            <Image 
              src="/parking_manager.png" 
              alt="Logo Entreprise"
              fill
              className="object-contain rounded-lg"
            />
          </div>
          
          {/* Texte à côté */}
          <div>
            <h1 className="text-sm font-bold tracking-wide text-white">
              {DATA.companyName}
            </h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">
              Manager
            </p>
          </div>
        </div>
        
        <div className="flex-1 py-6 space-y-2 px-3">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <AlertCircle size={20} /> Vue d'ensemble
          </button>
          
          <button 
            onClick={() => setActiveTab('parkings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'parkings' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Car size={20} /> Mes Parkings
          </button>
          
          <button 
            onClick={() => setActiveTab('employees')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'}`}
          >
            <Users size={20} /> Salariés
          </button>
        </div>

        <div className="p-4 border-t border-slate-700 text-xs text-center text-slate-500">
          v1.0.0 - Admin View
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="ml-64 p-8">
        
        {/* HEADER */}
        <header className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'overview' && "Tableau de bord"}
              {activeTab === 'parkings' && "Gestion des Parkings"}
              {activeTab === 'employees' && "Annuaire Salariés"}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Bonjour, Admin</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">A</div>
          </div>
        </header>

        {/* --- VIEW: OVERVIEW --- */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* STATS CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="Parkings" value={DATA.stats.totalParkings} icon={<MapPin size={24} className="text-blue-500"/>} />
              <StatCard title="Places Totales" value={DATA.stats.totalSpots} icon={<Car size={24} className="text-indigo-500"/>} />
              <StatCard title="Salariés Inscrits" value={DATA.stats.activeEmployees} icon={<Users size={24} className="text-green-500"/>} />
              <StatCard title="Demandes en attente" value={requests.filter(r => r.status === 'PENDING').length} icon={<AlertCircle size={24} className="text-orange-500"/>} />
            </div>

            {/* ACTION REQUISE: DEMANDES */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <AlertCircle size={20} className="text-orange-500"/>
                Demandes de places permanentes (Action requise)
              </h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="px-4 py-3">Employé</th>
                      <th className="px-4 py-3">Parking demandé</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {requests.filter(r => r.status === 'PENDING' && r.type === 'PERMANENT').map((req) => (
                      <tr key={req.id}>
                        <td className="px-4 py-3 font-medium">{req.employee}</td>
                        <td className="px-4 py-3">{req.parking}</td>
                        <td className="px-4 py-3 text-gray-500">{req.date}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button onClick={() => handleRequestAction(req.id, 'reject')} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200">Refuser</button>
                          <button onClick={() => handleRequestAction(req.id, 'accept')} className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded shadow-sm">Valider</button>
                        </td>
                      </tr>
                    ))}
                    {requests.filter(r => r.status === 'PENDING' && r.type === 'PERMANENT').length === 0 && (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-gray-400">Aucune demande en attente.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- VIEW: PARKINGS --- */}
        {activeTab === 'parkings' && (
          <div>
            <div className="flex justify-end mb-6">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm">
                <Plus size={18} /> Ajouter un parking
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {DATA.parkings.map(parking => (
                <div key={parking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-gray-800">{parking.name}</h3>
                      <a href={parking.mapsLink} target="_blank" className="text-blue-500 hover:underline text-sm flex items-center gap-1">
                        <MapPin size={14} /> Maps
                      </a>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{parking.desc}</p>
                    
                    {/* Tarifs */}
                    <div className="bg-gray-50 p-3 rounded-lg mb-4 grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Place Permanente</span>
                        <p className="font-bold text-gray-800">{parking.pricing.annual} € / an</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Place Temporaire</span>
                        <p className="font-bold text-gray-800">{parking.pricing.daily} € / jour</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                       <div className="text-sm font-medium">Occupation :</div>
                       <div className="text-sm text-gray-600">{parking.occupied} / {parking.totalSpots} places</div>
                    </div>
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Gérer les places</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW: EMPLOYEES --- */}
        {activeTab === 'employees' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">Liste des salariés</h3>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50">
                <Mail size={18} /> Inviter un salarié
              </button>
            </div>
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                <tr>
                  <th className="px-6 py-4">Nom</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Véhicule</th>
                  <th className="px-6 py-4">Statut Place</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {DATA.employees.map(emp => (
                  <tr key={emp.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium">{emp.name}</td>
                    <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                    <td className="px-6 py-4 font-mono text-gray-600">{emp.vehicle}</td>
                    <td className="px-6 py-4">
                      {emp.spot ? (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">{emp.spot}</span>
                      ) : (
                        <span className="text-gray-400 italic">Aucune place</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </main>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

// Petit composant utilitaire pour les cartes de stats
function StatCard({ title, value, icon }: StatCardProps) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
        <div className="p-3 bg-gray-50 rounded-lg">
            {icon}
        </div>
        <div>
            <p className="text-gray-500 text-xs uppercase font-bold">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        </div>
  );
}