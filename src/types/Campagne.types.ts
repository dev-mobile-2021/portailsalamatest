import { General } from "./general.types";
import { User } from "./user.types";

export interface Campagne {
    id: number;
    date: string;
    designation: string;
    statut: string;
    programme: Programme;
    programme_id: string;
    phasedepots: Phasedepot[];
    image: string;
    lignecommandes: Lignecommande[];
    etat_badge: string;
    etat_text: string;
    datefin: string;
}


export interface Lignecommande {
    id: number;
    commande_id: number;
    article_id: number;
    quantite: number;
    prix: number;
    avg: number;
    commande: Commande;
    article: Article;
    programme: Programme;
    campagne: Campagne;
    programme_id: number;
    campagne_id: number;
    catalogue?: number; // Added for VueGlobale table
    famille_id?: number; // Added for VueGlobale table
}

export interface Article {
    id: number;
    designation: string;
    prix: number;
    quantite: number;
    description: string;
    categorie_id: number;
    image: string;
    code: string;
    unite_id: number;
    categorie: General;
    unite: General;
}

export interface Programme {
    id: number;
    designation: string;
    equipegestion_id: string;
    objectif: string;
    missions: string;
    date: string;
    equipegestion: Equipegestion;
    lignecommandes: Lignecommande[];
}


export interface Phasedepot {
    id: number;
    datedeb: string;
    datefin: string;
    campagne_id: string;
    etat: number;
    campagne: Campagne;
}



export interface Commande {
    id: number;
    codedevis?: string|null;
    codeproforma_agence?: string|null;
    codeproforma_central?: string|null;
    datecommande: string;
    datereception: string;
    statut: number;
    commentaire?: string;
    etat: number ;
    validationclient: number | null;
    validationsalama: number | null;
    validationclient_ral_etape1?: number | null;
    validationsalama_ral_etape1?: number | null;
    validationclient_ral_etape2?: number | null;
    validation_dm_ral_etape2?: number | null;
    validation_dvm_ral_etape2?: number | null;
    numero_proforma_ral?: string | null;
    numero_bc_ral?: string | null;
    date_generation_bc_ral?: string | null;
    dateprevulivraison: string;
    client_id: number;
    typelivraison_id: number;
    client: Client;
    qte_debut: number;
    qte_fin: number;
    detailcommandes: DetailCommande[];
    typelivraison: Typelivraison;
    campagne: Campagne,
    etat_badge: string;
    etat_text: string| null;
    etat_cd_text: string | null; // reserver au commande de type programme
    etat_cd_badge: string | null;  // reserver au commande de type programme
    etat_commande : number|null;  // reserver au commande de type programme
}


export interface Equipegestion {
    id: number;
    designation: string;
    description: string;
    personnels: User[];
}

export interface Client {
    id: number;
    designation: string;
    telfixe: string;
    telmobile: string;
    region: string;
    district: string;
    categorieclient_id: number;
    user_id: number;
    axe?: { id: number|null; designation: string|null };
    created_at: string;
    created_at_fr: string;
    updated_at: string;
    updated_at_fr: string;
    deleted_at: string;
    deleted_at_fr: string;
}


export interface Typelivraison {
    id: number;
    designation: string;
    description: string;
}

export interface DetailCommande {
  id: number;
  etat?: number;
  is_ral?: boolean | number;
  etat_ral?: number;
  etat_ral_text?: string;
  etat_ral_badge?: string;
  article_id: number;
  quantite: number;
  prix: number;
  avg: number;
  remisepourcentage?: number| null; // Added for VueGlobale table
  article: {
    id: number;
    designation: string;
    prix: number;
    quantite: number;
    description: string;
    categorie_id: number;
    image: string;
    code: string;
    unite_id: number;
    categorie: {
      id: number;
      designation: string;
      description: string;
    };
    unite: {
      id: number;
      designation: string;
      description: string;
    };
  };
  produit?: string; // Added for VueGlobale table
  code?: string; // Added for VueGlobale table
  unite?: string; // Added for VueGlobale table
  qte_demandee?: number; // Added for VueGlobale table
    qte_debut?: number; // Added for VueGlobale table
    lot?: string; // Added for VueGlobale table
    date_peremption?: string; // Added for VueGlobale table
    cmm?: number; // Added for VueGlobale table
    stock_max?: number; // Added for VueGlobale table
    qte_commander_l?: number; // Added for VueGlobale table
    qte_commandee?: number; // Added for VueGlobale table
    nb_jour_rupture?: number; // Added for VueGlobale table
    msd?: number; // Added for VueGlobale table
    qte_transferes?: number; // Added for VueGlobale table
    qte_dfs?: number; // Added for VueGlobale table
    lignesLot?: { id: number; lot: string; date_peremption: string; quantite: number }[]; // Added for lot details
  qte_recue?: number; // Added for VueGlobale table
  qte_distribuee?: number; // Added for VueGlobale table
  qte_perdue?: number; // Added for VueGlobale table
  ajustement?: number; // Added for VueGlobale table
  qte_finale?: number; // Added for VueGlobale table
}
