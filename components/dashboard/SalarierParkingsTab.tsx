'use client';

import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

export interface Parking {
  id: number;
  name: string;
  description: string;
  linkMaps: string;
  totalSpots: number;
  occupied: number;
}

interface SalarierParkingsTabProps {
  parkings: Parking[];
  onRequestPlace: (parkingId: number, type: 'PERMANENT' | 'TEMPORAIRE', vehicleId?: number) => Promise<void>;
}

export function SalarierParkingsTab({ parkings, onRequestPlace }: SalarierParkingsTabProps) {
  
  const [loadingParkingId, setLoadingParkingId] = useState<number | null>(null);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [requestType, setRequestType] = useState<'PERMANENT' | 'TEMPORAIRE'>('PERMANENT');

  const handleRequest = async (parkingId: number) => {
    
    if (requestType === 'TEMPORAIRE') {
      console.warn("⚠️ Validation échouée: type TEMPORAIRE");
      alert('Veuillez sélectionner une place permanente pour faire une demande.');
      return;
    }

    try {
      setLoadingParkingId(parkingId);
      await onRequestPlace(parkingId, requestType || undefined);
      alert(`Demande de place ${requestType.toLowerCase()} créée avec succès !`);
      setSelectedParkingId(null);
    } catch (error) {
      console.error("❌ Erreur lors de la création de la demande:", error);
      alert(`Erreur lors de la création de la demande: ${error}`);
    } finally {
      setLoadingParkingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Parkings disponibles</h2>

      {parkings.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
          <p className="text-gray-400">Aucun parking disponible.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {parkings.map((parking,index) => {

            return (
              <div key={parking.id || `parking-${index}`} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{parking.name}</h3>
                    <a 
                      href={parking.linkMaps} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline text-sm flex items-center gap-1"
                    >
                      <MapPin size={14} /> Maps
                    </a>
                  </div>
                  <p className="text-gray-500 text-sm mb-4">{parking.description}</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Occupation :</div>
                    <div className="text-sm text-gray-600">{parking.occupied || "0"} / {parking.totalSpots || "--"} places</div>
                </div>

                {/* Bouton et formulaire */}
                <div className="border-t border-gray-100 pt-4">
                  {selectedParkingId !== parking.id ? (
                    <button
                      onClick={() => {
                        setSelectedParkingId(parking.id);
                      }}
                      className="w-full mb-3 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Demander une place
                    </button>
                  ) : null}

                  {/* Formulaire de demande */}
                  {selectedParkingId === parking.id &&  (
                    <div className="bg-blue-50 p-4 rounded-lg space-y-3 border border-blue-200">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Type de place
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="PERMANENT"
                              checked={requestType === 'PERMANENT'}
                              onChange={(e) => setRequestType(e.target.value as 'PERMANENT')}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Permanente</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              value="TEMPORAIRE"
                              checked={requestType === 'TEMPORAIRE'}
                              onChange={(e) => setRequestType(e.target.value as 'TEMPORAIRE')}
                              className="w-4 h-4"
                            />
                            <span className="text-sm text-gray-700">Temporaire</span>
                          </label>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          handleRequest(parking.id);
                        }}
                        disabled={loadingParkingId === parking.id}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                      >
                        {loadingParkingId === parking.id ? 'Envoi...' : 'Confirmer la demande'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
