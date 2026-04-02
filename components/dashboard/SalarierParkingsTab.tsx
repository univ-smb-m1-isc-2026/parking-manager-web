'use client';

import { MapPin, Plus } from 'lucide-react';
import { useState } from 'react';

export interface Parking {
  idParking: number;
  name: string;
  description: string;
  linkMaps: string;
  totalSpots: number;
  occupied: number;
  pricing: {
    annual: number;
    daily: number;
  };
}

interface SalarierParkingsTabProps {
  parkings: Parking[];
  onRequestPlace: (parkingId: number, type: 'PERMANENT' | 'TEMPORAIRE', vehicleId?: number) => Promise<void>;
  userVehicles: any[];
}

export function SalarierParkingsTab({ parkings, onRequestPlace, userVehicles }: SalarierParkingsTabProps) {
  const [loadingParkingId, setLoadingParkingId] = useState<number | null>(null);
  const [selectedParkingId, setSelectedParkingId] = useState<number | null>(null);
  const [requestType, setRequestType] = useState<'PERMANENT' | 'TEMPORAIRE'>('PERMANENT');
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(userVehicles[0]?.idVehicule || null);

  const handleRequest = async (parkingId: number) => {
    if (!selectedVehicle && requestType === 'PERMANENT') {
      alert('Veuillez sélectionner un véhicule');
      return;
    }

    try {
      setLoadingParkingId(parkingId);
      await onRequestPlace(parkingId, requestType, selectedVehicle || undefined);
      alert(`Demande de place ${requestType.toLowerCase()} créée avec succès !`);
      setSelectedParkingId(null);
    } catch (error) {
      alert('Erreur lors de la création de la demande');
    } finally {
      setLoadingParkingId(null);
    }
  };

  const getAvailableSpots = (parking: Parking) => {
    return parking.totalSpots - parking.occupied;
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
          {parkings.map((parking) => {
            const availableSpots = getAvailableSpots(parking);
            const occupancyPercentage = (parking.occupied / parking.totalSpots) * 100;

            return (
              <div key={parking.idParking} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
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

                  {/* Tarifs */}
                  <div className="bg-gray-50 p-3 rounded-lg mb-4 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-semibold">Place Permanente</span>
                      <p className="font-bold text-gray-800">{parking.pricing.annual} €/an</p>
                    </div>
                    <div>
                      <span className="text-xs text-gray-400 uppercase font-semibold">Place Temporaire</span>
                      <p className="font-bold text-gray-800">{parking.pricing.daily} €/jour</p>
                    </div>
                  </div>

                  {/* Barre d'occupation */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Occupation</span>
                      <span className="text-sm text-gray-600">{parking.occupied}/{parking.totalSpots} places</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${occupancyPercentage}%` }}
                      ></div>
                    </div>
                    <p className={`text-xs mt-1 ${availableSpots > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {availableSpots > 0 ? `${availableSpots} place${availableSpots > 1 ? 's' : ''} disponible${availableSpots > 1 ? 's' : ''}` : 'Complet'}
                    </p>
                  </div>
                </div>

                {/* Bouton et formulaire */}
                <div className="border-t border-gray-100 pt-4">
                  <button
                    onClick={() => setSelectedParkingId(selectedParkingId === parking.idParking ? null : parking.idParking)}
                    className="w-full mb-3 text-blue-600 hover:text-blue-800 text-sm font-medium py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2"
                    disabled={loadingParkingId === parking.idParking || availableSpots === 0}
                  >
                    <Plus size={16} />
                    Demander une place
                  </button>

                  {/* Formulaire de demande */}
                  {selectedParkingId === parking.idParking && availableSpots > 0 && (
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

                      {requestType === 'PERMANENT' && userVehicles.length > 0 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Véhicule
                          </label>
                          <select
                            value={selectedVehicle || ''}
                            onChange={(e) => setSelectedVehicle(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Sélectionner un véhicule</option>
                            {userVehicles.map((v) => (
                              <option key={v.idVehicule} value={v.idVehicule}>
                                {v.immatriculation}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      <button
                        onClick={() => handleRequest(parking.idParking)}
                        disabled={loadingParkingId === parking.idParking}
                        className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
                      >
                        {loadingParkingId === parking.idParking ? 'Envoi...' : 'Confirmer la demande'}
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
