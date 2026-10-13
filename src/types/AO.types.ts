export interface AO {
  id: string;
  isnotationfournisseur: number;
  isnotationarticle: number;
  isnotationadministrative: number;
  TSSCOD_0_0: string;
  targetpricestatus: number;
  statut: number | string;
  date: string;
  datecloture?: string;
  soumissions: Soumission[];
  etat_text: string;
  etat_badge: string;
  attachments:Attachment[];
  reference: string;
  designation: string;
  typemarche_id: string;
  typemarche: { id: string; designation: string };
  typeprocedure_id: string;
  typeprocedure: { id: string; designation: string };
  datepublication: string;
  aoarticles: Article[];
  aofournisseurs:   { id: string; fournisseur: Fournisseur }[];
  offretransports?: OffreTransport[];
}

export interface Article {
  id: string;
  quantite?: number;
  targetpricestatus: number;
  targetprice?: number;
  detailda_id?: string;
  coeff?: number;
  article: { id: string; code: string; designation: string; };
}

export interface Attachment { 
  id: string;
  designation: string;
  url: string;
  documentspecification: DocumentSpecification;
  isannexe:number 
};

export interface DocumentSpecification {
  id: string;
  designation: string;
  etatetexte: string;
  nature: string;
}

export interface Soumission {
  id: string;
  statut: string | number;
  date: string;
  score: number;
  isbc?: boolean | number;
  iscontrat?: boolean | number;
  ao_id?: string;
  fournisseur_id?: string;
  fournisseur?: Fournisseur;
  soumissionarticles?: SoumissionArticle[];
}


export interface SoumissionArticle {
  id: string;
  isselected: boolean | number;
  resultatevaluation: string;
  prixunitairepropose: number;
  presenceechantillon: boolean | number;
  presencedossierstech: boolean | number;
  pays_id: string;
  observationsaq: string;
  prequalification: string;
  statutamm: string;
  fabricant_id: string;
  fabricant: { id: string; designation: string };
  article_id: string;
  article: { id: string; designation: string; code: string; prix?: number,  quantite:number|undefined };
  score: number;
  typecondition_id: string;
  typecondition: { id: string; designation: string };
}


export interface Fournisseur {
  id: string;
  nom: string;
  email: string;
  score: number;
  telephone: string;
  adresse: string;
  typefournisseur: null | { id: string; designation: string };
  categoriefournisseur: null | { id: string; designation: string };
}

export interface Fabricant {
  id: number;
  designation: string;
}

export interface Province {
  id: number;
}

export interface Tonnage {
  designation: string;
  tonnage: number;
}

export interface AxeTonnage {
  id: string;
  tonnage: Tonnage;
}

export interface Axe {
  id: number;
  designation: string;
  province: Province;
  axetonnages: AxeTonnage[];
}

export interface DetailOffreTransport {
  id: string;
  axe: Axe;
  offretransport_id: number;
  unite: string | null;
  unite_id: string | null;
}

export interface OffreTransport {
  id: string;
  detailoffretransports: DetailOffreTransport[];
}