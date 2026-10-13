// Types pour les expéditions des transporteurs

export interface ExpeditionAxe {
  designation: string;
}

export interface ExpeditionTonnage {
  designation: string;
  tonnage: number;
}

export interface ExpeditionFournisseur {
  nom: string;
  score: number;
}

export interface ExpeditionAnnuaireTransporteur {
  reference: string;
  annee: string;
  periode_deb: string;
  periode_fin: string;
}

export interface ExpeditionVehicule {
  matricule: string;
  marque: string;
  tonnage: { id: number; tonnage: number };
  chauffeur: Chauffeur;
}

export interface Chauffeur {
  id: string;
  nom: string;
  telephone?: string;
  email?: string;
}

export interface ExpeditionClient {
  tonnage_affecte: number;
  volume_affecte?: number;
  ordre_chargement?: number;
  statut_portion?: number;
  statut_portion_text?: string;
  statut_portion_badge?: string;
  date_livraison_portion?: string;
  observation_livraison?: string;
  bl_url?: string;
  documents?: Array<{
    id?: number;
    nom?: string;
    url: string;
    type?: string;
  }>;
  expeditionclient: {
    id?: string;
    codelivraison?: string;
    poidsexpedition?: number;
    volume?: number;
    statut_livraison?: number;
    statut_livraison_text?: string;
    statut_livraison_badge?: string;
    date_cloture_livraison?: string;
    commentaire_livraison?: string;
    date_livraison?: string;
    client: { id?: string; designation: string };
  };
}

export interface ExpeditionAxeDetail {
  axe: { designation: string };
  expedition: {
    code: string;
    date_expedition: string;
  };
}

export interface ExpeditionRemplacement {
  id: string;
  motif: string;
  statut: number;
  statut_text: string;
  est_en_attente: boolean;
  vehicule_actuel: {
    matricule: string;
    tonnage: { tonnage: number };
  };
  vehicule_remplacement: {
    matricule: string;
    tonnage: { tonnage: number };
  } | null;
  difference_tonnage: number;
  est_amelioration_capacite: boolean;
}

export interface ExpeditionAxeTransporteur {
  id: string;
  statut: string;
  etat_text: string;
  convoyeur?: ExpeditionConvoyeur;
  validation_fournisseur: 0 | 1 | 99; // 0 = non validé, 1 = validé , 99 = refusé
  pvrd_chauffeur_disponible: boolean;
  bon_retour_chauffeur_disponible: boolean;
  fiche_pointage_disponible: boolean;
  bl_transporteur_disponible: boolean;
  chrono_disponible: boolean;
  ordremission_disponible: boolean;
  tonnage_affecte: number;
  volume_affecte: number;
  cout_transport: number;
  pourcentage_remplissage_tonnage: number;
  pourcentage_remplissage_volume: number;
  expeditionaxe: ExpeditionAxeDetail;
  expeditionaxetransporteurclients: ExpeditionClient[];
  remplacements?: ExpeditionRemplacement[];
}

export interface VehiculeAnnuaireTransporteur {
  ordre: number;
  montant: number;
  vehicule: ExpeditionVehicule;
  expeditionaxetransporteurs: ExpeditionAxeTransporteur[];
}
export interface ExpeditionConvoyeur {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
}



export interface ExpeditionData {
  id: string;
  axe: ExpeditionAxe;
  tonnage: ExpeditionTonnage;
  fournisseur: ExpeditionFournisseur;
  annuairetransporteur: ExpeditionAnnuaireTransporteur;
  vehiculesannuairetransporteurs: VehiculeAnnuaireTransporteur[];
}

export interface ExpeditionsResponse {
  detailsannuairetransporteurs: ExpeditionData[];
}
