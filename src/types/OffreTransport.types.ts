// Interfaces pour les offres de transport

import { Attachment } from "./AO.types";

export interface Tonnage {
  id: number;
  designation: string;
  tonnage: number;
  min: number;
  max: number;
  volume_min: number;
  volume_max: number;
}

export interface DetailOffreTransportTonnage {
  id: number;
  tonnage_id: number;
  quantite: number;
  prix_unitaire: number;
  montant_total: number;
  tonnage: Tonnage;
}

export interface Axe {
  id: number;
  designation: string;
}

export interface DetailOffreTransport {
  id: number;
  axe_id: number;
  axe: Axe;
  detailoffretransporttonnages: DetailOffreTransportTonnage[];
}

export interface OffreTransport {
  id: number;
  reference: string;
  annee: number;
  designation: string;
  date: string;
  est_publier: boolean;
  est_valider: boolean;
  datepublication: string;
  datelimite: string;
  dateouverture: string;
  a_fichetechnique: boolean;
  a_infchauffeur: boolean;
  attachments?: Attachment[];
  offretransportdocspecifis: OffreTransportDocSpecifi[];
  detailoffretransports: DetailOffreTransport[];
}

 export interface OffreTransportDocSpecifi {
    id: number;
    documentspecifications_id: number;
    url: string;
    designation: string;
    date: string;
    documentspecification: documentspecification;
    }

    
    export interface documentspecification{
    id:number
    designation: string;
    etape: string;
    etatetexte?: string;
    section: string;
    sectiontexte: string;
    nature: string;
    typemarche_id: number;
    } 


export interface OffresTransportResponse {
  offretransports: OffreTransport[];
}

export interface UseOffresTransportProps {
  id?: number;
}
