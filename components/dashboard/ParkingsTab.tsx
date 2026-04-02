'use client';

import { useState, useEffect } from 'react';
import { Plus, MapPin, Trash2, Edit, X, Save, AlertTriangle, KeySquare } from 'lucide-react';
import { Parking } from '@/app/(dashbord)/employeur/page';

interface ParkingsTabProps {
  parkings: Parking[];
  onDelete: (id: number) => void;
  onEditSubmit: (id: number, updatedData: any) => Promise<void>;
  onAddSubmit: (newData: any) => Promise<void>;
  onGenerateSubmit: (parkingId: number, data: any) => Promise<void>;
}

export function ParkingsTab({ parkings, onDelete, onEditSubmit, onAddSubmit, onGenerateSubmit }: ParkingsTabProps) {
  // États des modales
  const [editingParking, setEditingParking] = useState<Parking | null>(null);
  const [parkingToDelete, setParkingToDelete] = useState<number | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [generatingForParking, setGeneratingForParking] = useState<Parking | null>(null);

  // Formulaire d'édition
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    linkMaps: ''
  });

  // Formulaire de génération de places
  const [generateFormData, setGenerateFormData] = useState({
    quantite: 10,
    tarifJournalier: 5,
    tarifAnnuel: 800
  });

  // Formulaire d'ajout
  const [addFormData, setAddFormData] = useState({ 
    name: '', 
    description: '', 
    linkMaps: '' 
  });

  // Pré-remplir l'édition
  useEffect(() => {
    if (editingParking) {
      setEditFormData({
        name: editingParking.name || '',
        description: editingParking.description || '',
        linkMaps: editingParking.linkMaps || ''
      });
    }
  }, [editingParking]);

  // 1. SOUMISSION DE L'ÉDITION
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingParking) return;

    setIsSaving(true);
    await onEditSubmit(editingParking.id, editFormData);
    setIsSaving(false);
    setEditingParking(null);
  };

  // 2. SOUMISSION DE L'AJOUT
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onAddSubmit(addFormData);
    setIsSaving(false);
    setIsAdding(false);
    setAddFormData({ name: '', description: '', linkMaps: '' }); // Nettoyage
  };

  // 3. SOUMISSION DE LA GÉNÉRATION DE PLACES
  const handleGenerateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatingForParking) return;
    setIsSaving(true);
    await onGenerateSubmit(generatingForParking.id, generateFormData);
    setIsSaving(false);
    setGeneratingForParking(null);
    setGenerateFormData({ quantite: 10, tarifJournalier: 5, tarifAnnuel: 800 }); // Reset
  };

  // 4. CONFIRMATION SUPPRESSION
  const confirmDelete = () => {
    if (parkingToDelete !== null) {
      onDelete(parkingToDelete);
      setParkingToDelete(null);
    }
  };

  return (
    <div className="relative">
      <div className="flex justify-end mb-6">
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 shadow-sm"
        >
          <Plus size={18} /> Ajouter un parking
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {parkings.map(parking => (
          <div key={parking.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{parking.name}</h3>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => setEditingParking(parking)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => setParkingToDelete(parking.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                </div>
                <a href={parking.linkMaps || "#"} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline text-sm flex items-center gap-1 mb-2">
                  <MapPin size={14} /> Maps
                </a>
                <p className="text-gray-500 text-sm mb-4">{parking.description || "Aucune description"}</p>
                
                <div className="bg-gray-50 p-3 rounded-lg mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Place Permanente</span>
                        <p className="font-bold text-gray-800">{parking.pricing?.annual || "--"} € / an</p>
                    </div>
                    <div>
                        <span className="text-xs text-gray-400 uppercase font-semibold">Place Temporaire</span>
                        <p className="font-bold text-gray-800">{parking.pricing?.daily || "--"} € / jour</p>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2">
                    <div className="text-sm font-medium">Occupation :</div>
                    <div className="text-sm text-gray-600">{parking.occupied || "0"} / {parking.totalSpots || "--"} places</div>
                </div>
                <button 
                  onClick={() => setGeneratingForParking(parking)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1"
                >
                  <KeySquare size={16} /> Générer les places
                </button>
            </div>
          </div>
        ))}

        {parkings.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center py-10 text-gray-500">
                Aucun parking enregistré pour le moment.
            </div>
        )}
      </div>

      {/* --- MODALE D'AJOUT --- */}
      {isAdding && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Ajouter un parking</h2>
              <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du parking</label>
                <input 
                  type="text" 
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                  placeholder="Ex: Parking Nord"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={addFormData.description}
                  onChange={(e) => setAddFormData({...addFormData, description: e.target.value})}
                  placeholder="Zone grillagée, accès badge..."
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lien Google Maps</label>
                <input 
                  type="url" 
                  value={addFormData.linkMaps}
                  onChange={(e) => setAddFormData({...addFormData, linkMaps: e.target.value})}
                  placeholder="https://maps.google.com/..."
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium text-sm">
                  Annuler
                </button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-70">
                  {isSaving ? 'Création...' : <><Plus size={16} /> Créer le parking</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE D'ÉDITION --- */}
      {editingParking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Modifier le parking</h2>
              <button onClick={() => setEditingParking(null)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>

            {/* CORRECTION ICI : handleEditSubmit au lieu de handleSubmit */}
            <form onSubmit={handleEditSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nom du parking</label>
                <input 
                  type="text" 
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lien Google Maps</label>
                <input 
                  type="url" 
                  value={editFormData.linkMaps}
                  onChange={(e) => setEditFormData({...editFormData, linkMaps: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setEditingParking(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium text-sm"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-70"
                >
                  {isSaving ? 'Enregistrement...' : <><Save size={16} /> Enregistrer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE GÉNÉRATION DE PLACES */}
      {generatingForParking && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800">Générer des places</h2>
              <button onClick={() => setGeneratingForParking(null)} className="text-slate-400 hover:text-slate-600 transition"><X size={20} /></button>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Générer de nouvelles places pour le parking <span className="font-bold text-slate-700">{generatingForParking.name}</span>.
            </p>

            <form onSubmit={handleGenerateSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quantité de places à créer</label>
                <input 
                  type="number" min="1"
                  value={generateFormData.quantite}
                  onChange={(e) => setGenerateFormData({...generateFormData, quantite: parseInt(e.target.value) || 0})}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tarif Journalier (€)</label>
                  <input 
                    type="number" min="0" step="0.01"
                    value={generateFormData.tarifJournalier}
                    onChange={(e) => setGenerateFormData({...generateFormData, tarifJournalier: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tarif Annuel (€)</label>
                  <input 
                    type="number" min="0" step="0.01"
                    value={generateFormData.tarifAnnuel}
                    onChange={(e) => setGenerateFormData({...generateFormData, tarifAnnuel: parseFloat(e.target.value) || 0})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
                    required
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setGeneratingForParking(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium text-sm">Annuler</button>
                <button type="submit" disabled={isSaving} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-70">
                  {isSaving ? 'Génération...' : <><KeySquare size={16} /> Générer</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODALE DE SUPPRESSION --- */}
      {parkingToDelete !== null && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-4 mb-4 text-red-600">
              <div className="bg-red-100 p-3 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Supprimer ce parking ?</h2>
            </div>
            
            <p className="text-slate-600 mb-6 text-sm">
              Êtes-vous sûr de vouloir supprimer ce parking ? Cette action est définitive et toutes les places associées seront perdues.
            </p>

            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setParkingToDelete(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium text-sm"
              >
                Annuler
              </button>
              <button 
                onClick={confirmDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-700 transition font-medium text-sm shadow-sm"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}