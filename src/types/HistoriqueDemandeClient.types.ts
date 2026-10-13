// Types pour l'historique des demandes clients

export interface HistoriqueDemandeClient {
  id: number;
  quantite_actuelle: number;
  quantite_demandee: number;
  motif_demande: string;
  affecter_nouveau_lot: boolean | number | string;
  lignecommande_id: number;
  statut: string | number;
  motif_refus?: string;
  demandeur_id: number;
  validateur_id?: number;
  date_demande: string;
  date_traitement?: string;
}
