'use client';

import { CheckCircle, Clock, XCircle } from 'lucide-react';
import { StatCard } from './StatCard';

interface SalarierOverviewTabProps {
  places: PlaceAssignee[];
  demandes: Demande[];
}

interface PlaceAssignee {
  id: number;
  parkingName: string;
  spot: string;
  type: string; // PERMANENT ou TEMPORAIRE
  vehiclePlate: string;
  status: string; // ACTIVE, PENDING, EXPIRED
}

interface Demande {
  id: number;
  parkingName: string;
  type: string;
  date: string;
  status: string; // PENDING, APPROVED, REJECTED
}

export function SalarierOverviewTab({ places, demandes }: SalarierOverviewTabProps) {
  const activePlaces = places.filter(p => p.status === 'ACTIVE');
  const pendingDemandes = demandes.filter(d => d.status === 'PENDING');

  const stats = {
    activePlaces: activePlaces.length,
    pendingRequests: pendingDemandes.length,
    totalSpots: places.length,
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'APPROVED': return 'bg-green-100 text-green-800 border-green-300';
      case 'REJECTED': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'PENDING': return <Clock size={16} />;
      case 'APPROVED': return <CheckCircle size={16} />;
      case 'REJECTED': return <XCircle size={16} />;
      default: return null;
    }
  };

  return (
    <div className="space-y-8">

      {/* MES PLACES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <CheckCircle size={20} className="text-green-500"/>
          Mes places
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Parking</th>
                <th className="px-4 py-3">Place</th>
                <th className="px-4 py-3">Véhicule</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {activePlaces.map((place) => (
                <tr key={place.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{place.parkingName}</td>
                  <td className="px-4 py-3">
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-200">
                      {place.spot}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs bg-gray-100 px-2 py-1 rounded border border-gray-200 w-fit">
                    {place.vehiclePlate}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{place.type}</td>
                  <td className="px-4 py-3">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold border border-green-200">
                      ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
              {activePlaces.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-gray-400">Aucune place attribuée.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DEMANDES */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-orange-500"/>
          Mes demandes
        </h3>
        
        <div className="overflow-auto max-h-96">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="px-4 py-3">Parking</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {demandes.map((demande, index) => (
                <tr key={demande.id ?? `demande-${index}`} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{demande.parkingName}</td>
                  <td className="px-4 py-3 text-gray-600">{demande.type}</td>
                  <td className="px-4 py-3 text-gray-500">{demande.date}</td>
                  <td className="px-4 py-3">
                    <span className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-bold border ${getStatusColor(demande.status)}`}>
                      {getStatusIcon(demande.status)}
                      {demande.status}
                    </span>
                  </td>
                </tr>
              ))}
              {demandes.length === 0 && (
                <tr><td colSpan={4} className="text-center py-6 text-gray-400">Aucune demande.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { MapPin } from 'lucide-react';
