import { z } from "zod";

// ==========================================
// SCHÉMAS ZOD (Pour les formulaires POST/PUT)
// ==========================================

// Schéma d'ajout d'un Parking
export const parkingSchema = z.object({
  name: z.string().min(1, "Le nom du parking est requis"),
  description: z.string().min(1, "La description est requise"),
  linkMaps: z.string().url("Veuillez entrer une URL valide").optional().or(z.literal('')),
  entrepriseId: z.number(),
});

// Schéma d'ajout d'un Véhicule (par un employé)
export const vehiculeSchema = z.object({
  immatriculation: z.string().min(4, "L'immatriculation est invalide"),
});

// Schéma de mise à jour d'un Utilisateur (profil)
export const updateUserSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
  surname: z.string().min(1, "Le prénom est requis"),
  mail: z.email("Format d'email invalide"),
});


// ==========================================
// TYPES TYPESCRIPT (Pour la lecture GET depuis l'API)
// ==========================================

export interface Entreprise {
  idEntreprise: number;
  nom: string;
}

export interface User {
  idUser: number;
  name: string;
  surname: string;
  mail: string;
  status: boolean;
  entreprise?: Entreprise;
}

export interface Vehicule {
  idVehicule: number;
  immatriculation: string;
  user?: User;
}

export interface Parking {
  id: number;
  name: string;
  description: string;
  linkMaps: string;
  entrepriseId: number;
  entrepriseNom: string;
}

// Types déduits des schémas Zod pour tes formulaires React
export type ParkingInput = z.infer<typeof parkingSchema>;
export type VehiculeInput = z.infer<typeof vehiculeSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;