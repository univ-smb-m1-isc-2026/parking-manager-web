'use client';

import { useState } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { ParkingsTab } from '@/components/dashboard/ParkingsTab';
import { EmployeesTab } from '@/components/dashboard/EmployeesTab';
// --- DONNÉES DE DÉMO ---
// Tu peux même déplacer ça dans un fichier lib/data.ts plus tard
const DATA = {
  companyName: "TechCorp Solutions",
  stats: { totalParkings: 3, totalSpots: 180, activeEmployees: 42, pendingRequests: 2 },
  parkings: [
    { id: 1, name: "Siege Social - Sous-sol", desc: "Accès via badge", mapsLink: "#", totalSpots: 50, occupied: 45, pricing: { annual: 1200, daily: 5 } },
    { id: 2, name: "Parking Extérieur Nord", desc: "Zone grillagée", mapsLink: "#", totalSpots: 100, occupied: 20, pricing: { annual: 800, daily: 2 } }
  ],
  requests: [
    { id: 101, employee: "Jean Dupont", type: "PERMANENT", parking: "Siege Social - Sous-sol", date: "10/02/2026", status: "PENDING" },
    { id: 102, employee: "Elliott Moiroud", type: "PERMANENT", parking: "Siege Social - Sous-sol", date: "10/02/2026", status: "PENDING" },
    { id: 103, employee: "Sophie Martin", type: "TEMPORAIRE", parking: "Parking Extérieur Nord", date: "10/02/2026", status: "AUTO-CONFIRMED" }
  ],
  employees: [
    { 
      id: 1, 
      name: "Jean Dupont", 
      email: "jean@techcorp.com", 
      vehicles: [
        { plate: "AB-123-CD", spot: "P1-12" },
        { plate: "XY-999-ZZ", spot: null }
      ]
    },
    { 
      id: 2, 
      name: "Elliott Moiroud", 
      email: "elliott@techcorp.com", 
      vehicles: [
        { plate: "CD-456-EF", spot: "P2-04" }
      ] 
    },
    {
      id: 3,
      name: "Alice Martin",
      email: "alice@techcorp.com",
      vehicles: []
    }
  ]
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [requests, setRequests] = useState(DATA.requests);

  const handleRequestAction = (id: number, action: string) => {
    setRequests(requests.map(req => 
      req.id === id ? { ...req, status: action === 'accept' ? 'APPROVED' : 'REJECTED' } : req
    ));
    alert(`Demande ${action === 'accept' ? 'acceptée' : 'refusée'} avec succès.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      
      {/* 1. Sidebar Component */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        companyName={DATA.companyName} 
      />

      <main className="ml-64 p-8">
        {/* 2. Header  */}
        <header className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-slate-800">
            {activeTab === 'overview' && "Tableau de bord"}
            {activeTab === 'parkings' && "Gestion des Parkings"}
            {activeTab === 'employees' && "Annuaire Salariés"}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500">Bonjour, Admin</span>
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">A</div>
          </div>
        </header>

        {/* 3. Conditional Content */}
        {activeTab === 'overview' && (
          <OverviewTab 
            stats={DATA.stats} 
            requests={requests} 
            onRequestAction={handleRequestAction} 
          />
        )}

        {activeTab === 'parkings' && (
          <ParkingsTab parkings={DATA.parkings} />
        )}

        {activeTab === 'employees' && (
          <EmployeesTab employees={DATA.employees} />
        )}

      </main>
    </div>
  );
}