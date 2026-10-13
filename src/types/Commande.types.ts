import { Campagne } from "./Campagne.types";
import { General } from "./general.types";

export interface CommandeArticle {
  id: number;
  designation: string;
  
}

export interface CommandeFamille {
  id: number;
  designation: string;
}

export interface CommandeLigneCommande {
  id: number;
  etat: number;
  is_ral?: boolean | number;
  etat_ral?: number;
  etat_ral_text?: string;
  etat_ral_badge?: string;
  article?: General;
  qte_debut: number;
  qte_recue: number;
  qte_distribuee: number;
  qte_perdue: number;
  ajustement: number;
  qte_fin: number;
  cmm: number;
  stock_max: number;
  quantite: number;
  qte_commandee: number;
  nb_jour_rupture: number;
  msd: number;
  qte_transferes: number;
  remisepourcentage: number| null;
 detaillignecommandes: DetailsLigneCommande[];
  qte_dfs: number;
  article_text?: string;
  catalogue: number;
  famille_id?: number;
  famille?: CommandeFamille;
  pv_ht: number;
  prix?: string;
  dateperemption?: string;
  source_lot?: string;
}

export interface CommandeCampagne {
  id: number;
  designation: string;
}

export interface CommandeClient {
  id: number;
  designation: string;
  COMPTE_0: string;
  axe?: General;
}

export interface CommandeTypeCommande {
  id: number;
  designation: string;
}

export interface Commande {
  id: number;
  code?: string;
  statut: number;
  commentaire?: string;
  validationclient_ral_etape1?: number | null;
  validationsalama_ral_etape1?: number | null;
  validationclient_ral_etape2?: number | null;
  validation_dm_ral_etape2?: number | null;
  validation_dvm_ral_etape2?: number | null;
  numero_proforma_ral?: string | null;
  numero_bc_ral?: string | null;
  date_generation_bc_ral?: string | null;
  campagne?: Campagne;
  programme?: General;
  etat_text: string|null;
  etat_cd_text: string;  // reserver au commande de type programme
  etat_cd_badge: string; // reserver au commande de type programme
  etat_commande : number|null; // reserver au commande de type programme
  etat: number|null;
  codedevis: string|null;
  codeproforma_agence: string|null;
  codeproforma_central: string|null;
  validationclient: number|null;
  validationsalama: number|null;
  dateprevulivraison: string;
  client_id: number;
  typecommande_id: number;
  typecommande?: CommandeTypeCommande;
  datecommande: string;
  client?: CommandeClient;
  lignecommandes: CommandeLigneCommande[];
}

export interface CommandesResponse {
  commandes: Commande[];
}

export interface CommandesPaginatedResponse {
  commandespaginated: {
    metadata: {
      total: number;
      per_page: number;
      current_page: number;
      last_page: number;
    };
    data: Commande[];
  };
}


export interface DetailsLigneCommande {
  id: number;
  lot: string;
  quantite: number;
  dateperemption: string;
}