// Types pour les parkings et véhicules

export interface Tonnage {
  id: string;
  designation: string;
  tonnage: number;
}

export interface TypeVehicule {
  id: string;
  designation: string;
}

export interface Vehicule {
  id: string;
  matricule: string;
  marque: string;
  description: string;
  volume: number;
  etat: string;
  tonnage_id: string;
  tonnage: Tonnage;
  typevehicule_id: string;
  typevehicule: TypeVehicule;
}

export interface Parking {
  id: string;
  vehicules: Vehicule[];
}
