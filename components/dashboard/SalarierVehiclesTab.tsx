'use client';

import { Trash2, Plus, Car } from 'lucide-react';
import { useState } from 'react';

export interface Vehicle {
  idVehicule: number;
  immatriculation: string;
}

interface SalarierVehiclesTabProps {
  vehicles: Vehicle[];
  onDeleteVehicle: (id: number) => Promise<void>;
  onAddVehicle: (vehicle: { immatriculation: string }) => Promise<void>;
}

export function SalarierVehiclesTab({ vehicles, onDeleteVehicle, onAddVehicle }: SalarierVehiclesTabProps) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    immatriculation: ''
  });
  const [loading, setLoading] = useState(false);

  const handleDelete = async (id: number) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce véhicule ?')) {
      try {
        setLoading(true);
        await onDeleteVehicle(id);
      } catch (error) {
        alert('Erreur lors de la suppression du véhicule');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.immatriculation.trim()) {
      alert('Veuillez entrer une plaque d\'immatriculation');
      return;
    }

    try {
      setLoading(true);
      await onAddVehicle(formData);
      setFormData({ immatriculation: '' });
      setShowForm(false);
    } catch (error) {
      alert('Erreur lors de l\'ajout du véhicule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Bouton ajouter */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm transition"
        >
          <Plus size={18} /> Ajouter un véhicule
        </button>
      </div>

      {/* Formulaire d'ajout */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold mb-4">Ajouter un véhicule</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Plaque d'immatriculation *
              </label>
              <input
                type="text"
                value={formData.immatriculation}
                onChange={(e) => setFormData({ immatriculation: e.target.value.toUpperCase() })}
                placeholder="AB-123-CD"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste des véhicules */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Car size={20} className="text-blue-500"/>
          Mes véhicules ({vehicles.length})
        </h3>

        {vehicles.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Aucun véhicule enregistré.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vehicles.map((vehicle) => (
              <div key={vehicle.idVehicule} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2 flex-1">
                    <Car size={20} className="text-gray-600" />
                    <div>
                      <p className="font-mono font-bold text-gray-800">{vehicle.immatriculation}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(vehicle.idVehicule)}
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                    disabled={loading}
                    title="Supprimer le véhicule"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
