'use client';

import { MapPin, Car, Users, AlertCircle } from 'lucide-react';
import { StatCard } from './StatCard';

// On définit les types pour les props
interface OverviewTabProps {
  stats: any;
  requests: any[];
  onRequestAction: (id: number, action: string) => void;
}

export function OverviewTab({ stats, requests, onRequestAction }: OverviewTabProps) {
  const pendingRequests = requests.filter(r => r.status === 'PENDING' && r.type === 'PERMANENT');

  return (
    <div className="space-y-8">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Parkings" value={stats.totalParkings} icon={<MapPin size={24} className="text-blue-500"/>} />
        <StatCard title="Places Totales" value={stats.totalSpots} icon={<Car size={24} className="text-indigo-500"/>} />
        <StatCard title="Salariés Inscrits" value={stats.activeEmployees} icon={<Users size={24} className="text-green-500"/>} />
        <StatCard title="Demandes en attente" value={requests.filter((r:any) => r.status === 'PENDING').length} icon={<AlertCircle size={24} className="text-orange-500"/>} />
      </div>

      {/* TABLEAU */}
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
              {pendingRequests.map((req) => (
                <tr key={req.id}>
                  <td className="px-4 py-3 font-medium">{req.employee}</td>
                  <td className="px-4 py-3">{req.parking}</td>
                  <td className="px-4 py-3 text-gray-500">{req.date}</td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => onRequestAction(req.id, 'reject')} className="px-3 py-1 text-red-600 hover:bg-red-50 rounded border border-red-200">Refuser</button>
                    <button onClick={() => onRequestAction(req.id, 'accept')} className="px-3 py-1 bg-green-600 text-white hover:bg-green-700 rounded shadow-sm">Valider</button>
                  </td>
                </tr>
              ))}
              {pendingRequests.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">Aucune demande en attente.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}