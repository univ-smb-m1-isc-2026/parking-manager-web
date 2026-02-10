'use client';

import Image from 'next/image';
import { AlertCircle, Car, Users, LogOut } from 'lucide-react';
import { logout } from '@/app/actions/auth'; // Ton action serveur

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  companyName: string;
}

export function Sidebar({ activeTab, setActiveTab, companyName }: SidebarProps) {
  const menuItems = [
    { id: 'overview', label: "Vue d'ensemble", icon: <AlertCircle size={20} /> },
    { id: 'parkings', label: "Mes Parkings", icon: <Car size={20} /> },
    { id: 'employees', label: "Salariés", icon: <Users size={20} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 w-64 h-full bg-slate-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700 flex items-center gap-3">
        <div className="relative h-16 w-16 flex-shrink-0">
          <Image 
            src="/parking_manager.png" 
            alt="Logo Entreprise" 
            fill 
            className="object-contain rounded-lg" 
          />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-white">{companyName}</h1>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest">Manager</p>
        </div>
      </div>

      {/* Menu */}
      <div className="flex-1 py-6 space-y-2 px-3">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === item.id ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 text-slate-300'
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button 
          onClick={() => logout()}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 transition w-full px-2 py-2 rounded-lg hover:bg-slate-800"
        >
          <LogOut size={20} />
          <span className="font-medium">Se déconnecter</span>
        </button>
      </div>
      
      <div className="p-4 border-t border-slate-700 text-xs text-center text-slate-500">
        v1.0.0 - Admin View
      </div>
    </nav>
  );
}