/**
 * Données mock pour le composant VueGlobaleAO
 * 📌 Ces mocks correspondent à l'AON id="15" dans aoMocks.ts
 * "AON - Produits alimentaires pour hôpitaux" (AON-2025-002)
 * Type: AON (Appel d'offres National) - MED (Médicaments/Produits de santé)
 * Statut: Attribué - Fournisseur: AgroNutrition Madagascar
 */

// Mock des données principales (Data) - Correspond à l'AON id="15"
export const mockVueGlobaleData = {
  soumissionId: "32", // ID de la soumission dans aoMocks.soumissions
  ao_id: "15", // ID de l'AO dans aoMocks
  datecloture: "2026-11-01", // Même date que dans aoMocks
  targetpricestatus: 0,
  stats: {
    dossiers: 2,
    bonsCommande: 1,
    factures: 1,
  },
  currentTender: {
    title: "AON - Produits alimentaires pour hôpitaux",
    reference: "AON-2025-002",
    publishedDate: "10 août 2025",
    deadline: "01 Novembre 2026",
    status: "Attribué",
  },
  tender: {
    id: "15",
    TSSCOD_0_0: "MED", // Médicaments - correspond à aoMocks (affichera pharma_products.png)
    reference: "AON-2025-002",
    typemarche: {
      id: "2",
      designation: "AON", // Type AON
    },
    attachements: [
      { id: "32", designation: "DAO Produits alimentaires", url: "/docs/dao-alimentaire.pdf", isannexe: 0 },
      { id: "33", designation: "Cahier des charges nutritionnel", url: "/docs/cdc-nutrition.pdf", isannexe: 1 },
    ],
  },
  // Articles correspondant aux aoarticles de l'AON id="15"
  articles: [
    {
      id: "32", // Correspond à soumissionarticles[0].id et aoarticles[0].id
      article_id: "32",
      nom: "Riz nutritif enrichi", // Correspond à article.designation
      prix: 85, // Target price de aoMocks
      targetpricestatus: 1, // Alerte sur le prix cible
      coeff: 1.2,
      quantiteDemandee: 5000, // Quantité de aoMocks
      quantiteProposee: 5000, // Quantité proposée par le fournisseur (de soumissionarticles)
      prixUnitairePropose: 85, // Prix proposé (de soumissionarticles)
      dateLivraison: "2026-09-15",
      dureeVie: "24 mois",
      datePeremption: "2028-09-15",
      delaiLivraison: "30 jours",
      fabricant: { id: "32", designation: "AgroNutrition Madagascar" }, // De soumissionarticles
      typeCondition: "Autre",
      commentaireTerme: "CIF", // CIF de soumissionarticles
      statut: "Conforme - Qualité supérieure", // resultatevaluation
      sousTotal: 41000, // 5000 * 85
      lots: [
        {
          id: "lot-riz-001",
          lot: "RIZ-2026-A",
          quantite: 2500,
          dateperemption: "2028-06-15",
          dureedevie: "24",
          fabricant_id: "32",
          conditionnement_id: "1"
        },
        {
          id: "lot-riz-002",
          lot: "RIZ-2026-B",
          quantite: 2500,
          dateperemption: "2028-09-20",
          dureedevie: "24",
          fabricant_id: "32",
          conditionnement_id: "1"
        }
      ],
    //   specificationTechnique: {
    //     description: "Riz nutritif enrichi en vitamines A, B1, B3, B6, B12, fer et zinc. Certification CODEX Alimentarius.",
    //     fichierTechnique: "/uploads/spec-riz-nutritif.pdf"
    //   }
    },
    {
      id: "33", // Correspond à aoarticles[1].id
      article_id: "33",
      nom: "Lait thérapeutique", // Correspond à article.designation
      prix: 120, // Target price de aoMocks
      targetpricestatus: 0,
      coeff: 1.15,
      quantiteDemandee: 3000, // Quantité de aoMocks
      quantiteProposee: 3000,
      prixUnitairePropose: 120,
      dateLivraison: "2026-09-01",
      dureeVie: "18 mois",
      datePeremption: "2028-03-01",
      delaiLivraison: "21 jours",
      fabricant: { id: "32", designation: "AgroNutrition Madagascar" },
      typeCondition: "DDP",
      commentaireTerme: "",
      statut: "En cours d'évaluation",
      sousTotal: 34500, // 3000 * 120
      lots: [
        {
          id: "lot-lait-001",
          lot: "LAIT-2026-A",
          quantite: 3000,
          dateperemption: "2028-03-01",
          dureedevie: "18",
          fabricant_id: "32",
          conditionnement_id: "2"
        }
      ],
    //   specificationTechnique: {
    //     description: "Lait thérapeutique F-75/F-100 pour malnutrition aiguë sévère. Conforme aux standards OMS/UNICEF.",
    //     fichierTechnique: "/uploads/spec-lait-therapeutique.pdf"
    //   }
    }
  ]
};

// Mock des données du dashboard - Correspond aux attachments de l'AON id="15"
export const mockDashboardData = {
  documentsAConsulter: [
    { 
      id: "32", 
      designation: "DAO Produits alimentaires", 
      url: "/docs/dao-alimentaire.pdf", 
      isannexe: 0 
    },
  ],
  documentsFournis: [
    { 
      id: "33", 
      designation: "CDC", 
      url: "/docs/cdc-nutrition.pdf", 
      documentspecification: { id: "33", designation: "CDC" },
      isannexe: 1 
    },
 
  ]
};

// Mock des fournisseurs/fabricants - Producteurs alimentaires malgaches
export const mockFournisseurs = [
  { id: 32, designation: "AgroNutrition Madagascar" },
  { id: 33, designation: "Nutri-Mada SARL" },
  { id: 34, designation: "Alimentation Santé Mada" },
  { id: 35, designation: "Bio-Nutrition Antsirabe" },
];

// Mock des documents fournis par l'utilisateur - VIDE pour simulation
// (le fournisseur n'a pas encore uploadé ses documents)
export const mockDocumentsFournis: Array<{
  id: string;
  file: string;
  attachement_id: string;
  ao_id: string;
}> = [];

// Mock des conditionnements
export const mockConditionnements = [
  { id: "1", designation: "Sac de 25kg" },
  { id: "2", designation: "Carton de 24 boîtes" },
  { id: "3", designation: "Palette (40 sacs)" },
];

// Mock des termes commerciaux (Incoterms)
export const mockTermesCommerciaux = [
  { id: "1", designation: "DDP" },
  { id: "2", designation: "CIF" },
  { id: "3", designation: "FCA" },
];

// Mock pour les bons de commande - Correspond à la soumission attribuée
export const mockPurchaseOrdersByDate: Array<[string, Array<{
  id: string | number;
  label: string;
  pdfUrl: string;
  etat: string;
}>]> = [
  [
    "15/09/2026",
    [
      {
        id: "bc-alim-001",
        label: "BC-2026-ALIM-001",
        pdfUrl: "/docs/bc-riz-nutritif.pdf",
        etat: "validé",
      },
      {
        id: "bc-alim-002",
        label: "BC-2026-ALIM-002",
        pdfUrl: "/docs/bc-lait-therapeutique.pdf",
        etat: "validé",
      },
    ],
  ],
];

/**
 * 📌 CORRESPONDANCE AVEC aoMocks.ts (AON id="15")
 * 
 * - Référence: AON-2025-002
 * - Désignation: "AON - Produits alimentaires pour hôpitaux"
 * - Type procédure: AON (Appel d'offres National)
 * - TSSCOD: MED (affichera pharma_products.png)
 * - Statut: Attribué (score: 89)
 * - Articles:
 *   • Riz nutritif enrichi (5000 unités à 8.2 MGA)
 *   • Lait thérapeutique (3000 unités à 11.5 MGA)
 * - Fournisseur attribué: AgroNutrition Madagascar
 * 
 * Pour votre vidéo de démonstration:
 * 1. Page d'accueil → l'AO "AON-2025-002" avec l'image pharma_products.png (MED)
 * 2. Cliquer sur l'AO → Détails avec statut "Attribué"
 * 3. Tableau de suivi (/tableauSuivi/15) → VueGlobale avec données complètes
 */
export const useMockVueGlobale = () => {
  return {
    Data: mockVueGlobaleData,
    dashboardData: mockDashboardData,
    fournisseurs: mockFournisseurs,
    documentsFournis: mockDocumentsFournis,
    loadingFabricants: false,
    errorFabricants: null as string | null,
    purchaseOrdersByDate: mockPurchaseOrdersByDate,
  };
};

export default {
  mockVueGlobaleData,
  mockDashboardData,
  mockFournisseurs,
  mockDocumentsFournis,
  mockConditionnements,
  mockTermesCommerciaux,
  mockPurchaseOrdersByDate,
  useMockVueGlobale,
};
