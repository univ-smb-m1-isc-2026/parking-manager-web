'use client';

import { useState } from 'react';
import { Mail, Car, Star, X, Send } from 'lucide-react';

export interface VehicleInfo {
  plate: string;
}

export interface Employee {
  id: number;
  name: string;
  email: string;
  vehicles: VehicleInfo[]; // Tableau de véhicules
  isBoss: boolean;
  spot: string | null;
}

interface EmployeesTabProps {
  employees: Employee[];
  entrepriseId: number;
  companyName: string;
}

export function EmployeesTab({ employees, entrepriseId, companyName }: EmployeesTabProps) {
  // États pour gérer la modale d'invitation
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const inviteLink = `https://parking-manager.oups.net/signInSalarier?entrepriseId=${entrepriseId}`;

    // --- OPTION 1 : Simulation avec l'application mail locale (mailto:) ---
    const subject = encodeURIComponent(`Invitation à rejoindre Parking Manager - ${companyName}`);
    const body = encodeURIComponent(
`Bonjour,

Le manager de ${companyName} vous invite à rejoindre la plateforme Parking Manager pour gérer vos accès au parking de l'entreprise.

Cliquez sur ce lien pour créer votre compte :
${inviteLink}

À très vite sur Parking Manager !`
    );
    
    // Ouvre le client mail par défaut (Outlook, Mail, etc.)
    window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;

    // On simule un petit temps de chargement pour le style
    setTimeout(() => {
      setIsSending(false);
      setIsModalOpen(false);
      setInviteEmail('');
    }, 800);
  };
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center">
        <h3 className="font-bold text-lg">Liste des salariés</h3>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm shadow-sm"
        >
          <Mail size={16} /> Inviter un salarié
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
              <tr 
                key={emp.id} 
                className={`transition align-top ${emp.isBoss ? 'bg-amber-50 hover:bg-amber-100/50' : 'hover:bg-gray-50'}`}
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  <div className="flex items-center gap-2">
                    {emp.name}
                    {emp.isBoss && (
                      <span className="flex items-center gap-1 bg-amber-200 text-amber-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border border-amber-300">
                        <Star size={10} className="fill-amber-800" />
                        Manager
                      </span>
                    )}
                  </div>
                </td>
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

                {/* Colonne Places : Indépendante des véhicules */}
                <td className="px-6 py-4">
                  <div className="h-6 flex items-center">
                    {emp.spot ? (
                      <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold border border-green-200">
                        {emp.spot}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic text-xs px-2">
                        --
                      </span>
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

      {/* --- LA FENÊTRE MODALE D'INVITATION --- */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-slate-800">Inviter un collaborateur</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition">
                <X size={20} />
              </button>
            </div>
            
            <p className="text-sm text-slate-500 mb-6">
              Un email contenant un lien d'inscription sécurisé sera préparé pour rejoindre <span className="font-bold text-slate-700">{companyName}</span>.
            </p>

            <form onSubmit={handleInvite} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">Adresse email du salarié</label>
                <input 
                  type="email" 
                  id="email" 
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="jean.dupont@entreprise.com" 
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition font-medium text-sm"
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isSending}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition font-medium text-sm shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSending ? 'Préparation...' : <><Send size={16} /> Créer l'invitation</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}