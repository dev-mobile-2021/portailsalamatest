/**
 * ============================================================================
 * TEMPLATE POUR CRÉER UN TYPE DE RÉPONSE
 * ============================================================================
 * 
 * INSTRUCTIONS :
 * 1. Copier ce fichier et renommer en "[NomDuType].types.ts"
 * 2. Remplacer "YourResponse" par le nom de votre type (ex: TarifResponse, ClientResponse)
 * 3. Déclarer les champs selon la structure de votre API
 * 4. Importer ce type dans votre hook
 * 
 * ============================================================================
 */

// TODO: Renommer ce type selon votre contexte
export type YourResponse = {
  // TODO: Ajouter les champs retournés par votre API
  // Exemples :
  
  // Pour des nombres (peuvent être null si absents)
  // id: number;
  // prix: number | null;
  // quantite: number;
  
  // Pour des chaînes de caractères
  // nom: string;
  // description: string | null;
  // devise: string;
  
  // Pour des booléens
  // actif: boolean;
  // disponible: boolean;
  
  // Pour des dates
  // createdAt: string; // Format ISO 8601
  // updatedAt: string;
  
  // Pour des tableaux
  // items: Item[];
  // tags: string[];
  
  // Pour des objets imbriqués
  // user: {
  //   id: number;
  //   name: string;
  // };
  
  // Pour des erreurs de l'API
  // errors: any; // ou string[] selon votre API
};

// ============================================================================
// EXEMPLES DE TYPES RÉELS
// ============================================================================

/**
 * EXEMPLE 1 : Type pour une réponse de tarif (comme TarifResponse)
 */
export type ExempleTarifResponse = {
  prix: number | null;
  devise: string | null;
  mesure: string | null;
  errors: any;
};

/**
 * EXEMPLE 2 : Type pour une liste de clients (comme Client)
 */
export type ExempleClient = {
  id: number;
  nom: string;
  email: string;
  telephone: string | null;
  adresse: string | null;
  actif: boolean;
  createdAt: string;
  updatedAt: string;
};

/**
 * EXEMPLE 3 : Type pour une commande complexe
 */
export type ExempleCommande = {
  id: number;
  numero: string;
  montantTotal: number;
  devise: string;
  status: "en_attente" | "validee" | "expediee" | "livree" | "annulee";
  client: {
    id: number;
    nom: string;
  };
  articles: Array<{
    id: number;
    produitId: number;
    quantite: number;
    prixUnitaire: number;
  }>;
  createdAt: string;
};
