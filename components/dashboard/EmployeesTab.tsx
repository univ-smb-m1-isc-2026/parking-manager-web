'use client';

import { Mail, Car } from 'lucide-react';

// Nouvelle structure : Un véhicule a une plaque et potentiellement une place
export interface VehicleInfo {
  plate: string;
  spot: string | null; // null = pas de place attribuée pour ce véhicule
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  vehicles: VehicleInfo[]; // Tableau de véhicules
}

interface EmployeesTabProps {
  employees: Employee[];
}

export function EmployeesTab({ employees }: EmployeesTabProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-lg">Liste des salariés</h3>
        <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition">
          <Mail size={18} /> Inviter un salarié
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
            <tr>
              <th className="px-6 py-4">Nom</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Flotte de véhicules</th>
              <th className="px-6 py-4">Places attribuées</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {employees.map((emp) => (
              <tr key={emp.id} className="hover:bg-gray-50 transition align-top">
                {/* Nom et Email restent inchangés */}
                <td className="px-6 py-4 font-medium text-gray-800">{emp.name}</td>
                <td className="px-6 py-4 text-gray-500">{emp.email}</td>
                
                {/* Colonne Véhicules : On boucle sur la liste */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    {emp.vehicles.length > 0 ? emp.vehicles.map((v, index) => (
                      <div key={index} className="flex items-center gap-2 h-6">
                        <Car size={14} className="text-gray-400" />
                        <span className="font-mono text-gray-700 bg-gray-100 px-2 py-0.5 rounded text-xs border border-gray-200">
                          {v.plate}
                        </span>
                      </div>
                    )) : (
                      <span className="text-gray-400 italic text-xs">Aucun véhicule</span>
                    )}
                  </div>
                </td>

                {/* Colonne Places : On boucle aussi pour aligner avec les véhicules */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    {emp.vehicles.length > 0 ? emp.vehicles.map((v, index) => (
                      <div key={index} className="h-6 flex items-center">
                        {v.spot ? (
                          <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                            {v.spot}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic text-xs border border-transparent px-2">
                            --
                          </span>
                        )}
                      </div>
                    )) : (
                      <span className="text-gray-400 italic text-xs">--</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
             {employees.length === 0 && (
                <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-400">Aucun salarié enregistré.</td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}