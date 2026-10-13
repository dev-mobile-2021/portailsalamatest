// Types pour les missions simplifiées du portail transporteur

/**
 * Interface Mission - Structure aplatie pour l'affichage
 */
export interface Mission {
  // === IDENTIFIANTS ===
  id: string;                          // ID unique de l'expédition transporteur
  code: string;                        // Ex: "EXP-2026-001"
  expedition_id: string;               // Pour l'API PDF
  
  // === DATES ===
  date_expedition: string;             // Ex: "2026-01-08"
  
  // === STATUT ===
  statut: "nouveau" | "en_cours" | "livre" | "attente" | "annule";
  etat_text: string;                   // Ex: "Nouveau", "En cours"
  validation_fournisseur: 0 | 1 | 99; // 0 = non validé, 1 = validé , 99 = refusé
  pvrd_chauffeur_disponible: boolean;
  bon_retour_chauffeur_disponible: boolean;
  fiche_pointage_disponible: boolean;
  bl_transporteur_disponible: boolean;
  chrono_disponible: boolean;
  ordremission_disponible: boolean;
  convoyeur: Convoyeur;
  // === ITINÉRAIRE ===
  axe: {
    id: number;                        // ID de l'axe pour l'API PDF
    designation: string;               // Ex: "Antananarivo → Toamasina"
  };
  
  // === CHARGE ===
  tonnage_affecte: number;             // Ex: 12.5
  volume_affecte: number;              // Ex: 18.5
  pourcentage_remplissage_tonnage: number;  // Ex: 83.33
  pourcentage_remplissage_volume: number;   // Ex: 41.11
  
  // === VÉHICULE ASSIGNÉ ===
  vehicule: {
    id: string;                        // ID du véhicule pour l'API
    matricule: string;                 // Ex: "1234-TAO"
    marque: string;                    // Ex: "ISUZU"
    tonnage: number;  
    tonnage_id: number;                 // Ex: 15
  };
  
  // === CHAUFFEUR ===
  chauffeur: {
    id: string;                        // ID du chauffeur pour l'API PDF
    nom: string;                       // Ex: "RAKOTO Jean"
    telephone?: string;
    email?: string;
  };
  
  // === CLIENTS À LIVRER ===
  clients: Array<{
    expedition_client_id?: number;     // ID de expeditionaxetransporteurclient (pour l'API upload)
    id?: number;                       // ID du client
    designation: string;               // Ex: "District Moramanga"
    tonnage_affecte: number;           // Ex: 2.5
    volume_affecte?: number;           // Ex: 5.0
    ordre_chargement?: number;         // Ordre de chargement
    statut_portion?: number;           // Statut de la portion
    statut_portion_text?: string;      // Texte du statut portion
    statut_portion_badge?: string;     // Badge du statut portion
    date_livraison_portion?: string;   // Date de livraison de la portion
    observation_livraison?: string;    // Observation sur la livraison
    codelivraison?: string;            // Code de livraison
    poidsexpedition?: number;          // Poids de l'expédition
    volume_expedition?: number;        // Volume de l'expédition
    statut_livraison?: number;         // Statut livraison du client
    statut_livraison_text?: string;    // Texte du statut livraison
    statut_livraison_badge?: string;   // Badge du statut livraison
    date_cloture_livraison?: string;   // Date de clôture livraison
    commentaire_livraison?: string;    // Commentaire sur la livraison
    date_livraison?: string;           // Date de livraison prévue
    url_pvrd?: string;                 // URL du PVRD uploadé
    url_bl_signe?: string;             // URL du BL signé uploadé
    url_bon_retour?: string;           // URL du bon de retour uploadé
    url_fiche_pointage?: string;       // URL de la fiche de pointage signée uploadée
    bl_url?: string;                   // URL pour télécharger le BL si disponible
    documents?: Array<{                // Documents associés au client
      id?: number;
      nom?: string;
      url: string;
      type?: string;                   // Ex: "bl", "facture", etc.
    }>;
  }>;
  
  // === FINANCIER ===
  cout_transport: number;              // Ex: 2500000
  
  // === REMPLACEMENTS DE VÉHICULE ===
  remplacements?: Remplacement[];      // Historique des demandes de remplacement
  
  // === FACTURATION (pour clôture) ===
  facture_soumise?: boolean;           // true si déjà facturé
  facture_statut?: "en_attente" | "validee" | "payee";
}

// Convoyeur
export interface Convoyeur {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
}

// Remplacement de véhicule
export interface Remplacement {
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

/**
 * Interface pour une livraison client dans le formulaire de clôture
 */
export interface LivraisonClient {
  expedition_client_id?: number;
  client_id?: number;
  client_designation: string;
  date: string;                        // Ex: "2026-01-08"
  heure: string;                       // Ex: "10:30"
  bl_signe: File | null;               // Fichier PDF du BL signé
  pvrd_signe: File | null;             // Fichier PDF du PVRD signé
  bon_retour_signe: File | null;       // Fichier PDF du bon de retour signé
  fiche_pointage_signe: File | null;   // Fichier PDF de la fiche de pointage signée
}

/**
 * Interface pour soumettre la clôture d'une mission
 */
export interface ClotureMissionData {
  expedition_id: string;
  fournisseur_id: number;
  
  // BL par client
  clients_livraisons: LivraisonClient[];
  
  // Infos générales
  km_parcourus: number;                // Ex: 650
  
  // Facture
  facture_pdf: File | null;            // Fichier PDF de la facture
  montant_facture: number;             // Ex: 2500000
}

/**
 * Type pour les filtres de statut
 */
export type StatutFiltre = "tous" | "nouveau" | "en_cours" | "livre" | "attente";
