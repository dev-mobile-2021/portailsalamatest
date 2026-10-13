import { ExpeditionData, ExpeditionAxeTransporteur } from '../types/Expedition.types';

// Mock data pour les expéditions transporteur
export const mockExpeditions: ExpeditionData[] = [
  {
    id: "1",
    axe: { designation: "Antananarivo " },
    tonnage: { designation: "10 Tonnes", tonnage: 10 },
    fournisseur: { nom: "Transport Express Madagascar", score: 95 },
    annuairetransporteur: {
      reference: "AT-2026-001",
      annee: "2026",
      periode_deb: "2026-01-01",
      periode_fin: "2026-12-31",
    },
    vehiculesannuairetransporteurs: [
      {
        ordre: 1,
        montant: 2500000,
        vehicule: {
          matricule: "1234 TBA",
          marque: "Mercedes Actros",
          tonnage: { tonnage: 15, id: 1 },
          chauffeur: { id: "1",nom: "Jean Rakoto",email: "jean.rakoto@htsoft.com",telephone: "034567890" },
        },
        expeditionaxetransporteurs: [
          {
            id: "exp-001",
            statut: "en_cours",
            etat_text: "En cours de livraison",
            bl_transporteur_disponible: false,
            bon_retour_chauffeur_disponible: false,
            fiche_pointage_disponible: false,
            pvrd_chauffeur_disponible: false,
            validation_fournisseur: 0,
            chrono_disponible: true,
            ordremission_disponible: true,
            tonnage_affecte: 8,
            volume_affecte: 25,
            cout_transport: 1200000,
            pourcentage_remplissage_tonnage: 80,
            pourcentage_remplissage_volume: 65,
            expeditionaxe: {
              axe: { designation: "Antananarivo " },
              expedition: {
                code: "EXP-2026-0001",
                date_expedition: "2026-01-10",
              },
            },
            expeditionaxetransporteurclients: [
              {
                tonnage_affecte: 5,
                volume_affecte: 15,
                ordre_chargement: 1,
                statut_portion: 1,
                statut_portion_text: "Livré",
                statut_portion_badge: "success",
                date_livraison_portion: "2026-01-10",
                observation_livraison: "Livraison effectuée à 10h30",
                bl_url: "https://example.com/bl_pharmacie.pdf",
                documents: [
                  {
                    id: 1,
                    nom: "BL Pharmacie Centrale",
                    url: "https://example.com/bl_pharmacie_centrale.pdf",
                    type: "bl",
                  },
                ],
                expeditionclient: { 
                  id: "101",
                  codelivraison: "LIV-2026-001",
                  poidsexpedition: 5,
                  volume: 15,
                  statut_livraison: 1,
                  statut_livraison_text: "Livré",
                  statut_livraison_badge: "success",
                  date_cloture_livraison: "2026-01-10",
                  commentaire_livraison: "Livraison reçue et validée par le responsable",
                  date_livraison: "2026-01-10",
                  client: { id: "1", designation: "Pharmacie Centrale" } 
                },
              },
              {
                tonnage_affecte: 3,
                volume_affecte: 10,
                ordre_chargement: 2,
                statut_portion: 0,
                statut_portion_text: "En cours",
                statut_portion_badge: "warning",
                bl_url: "https://example.com/bl_hopital.pdf",
                documents: [
                  {
                    id: 2,
                    nom: "BL Hôpital HJRA",
                    url: "https://example.com/bl_hjra.pdf",
                    type: "bl",
                  },
                ],
                expeditionclient: { 
                  id: "102",
                  codelivraison: "LIV-2026-002",
                  poidsexpedition: 3,
                  volume: 10,
                  statut_livraison: 0,
                  statut_livraison_text: "En cours",
                  statut_livraison_badge: "warning",
                  client: { id: "2", designation: "Hôpital HJRA" } 
                },
              },
            ],
            remplacements: [
              {
                id: "remp-001",
                motif: "Panne moteur - véhicule immobilisé",
                statut: 0,
                statut_text: "En attente de validation",
                est_en_attente: true,
                vehicule_actuel: {
                  matricule: "1234 TBA",
                  tonnage: { tonnage: 15 },
                },
                vehicule_remplacement: {
                  matricule: "9999 TBZ",
                  tonnage: { tonnage: 20 },
                },
                difference_tonnage: 5,
                est_amelioration_capacite: true,
              },
            ],
          },
          {
            id: "exp-002",
            statut: "livre",
            etat_text: "Livré",
            tonnage_affecte: 12,
            bl_transporteur_disponible: false,
            bon_retour_chauffeur_disponible: false,
            fiche_pointage_disponible: true,
            pvrd_chauffeur_disponible: false,
            validation_fournisseur: 0,
            chrono_disponible: true,
            ordremission_disponible: true,
            volume_affecte: 40,
            cout_transport: 1500000,
            pourcentage_remplissage_tonnage: 100,
            pourcentage_remplissage_volume: 85,
            expeditionaxe: {
              axe: { designation: "Antananarivo " },
              expedition: {
                code: "EXP-2026-0002",
                date_expedition: "2026-01-05",
              },
            },
            expeditionaxetransporteurclients: [
              {
                tonnage_affecte: 7,
                volume_affecte: 20,
                ordre_chargement: 1,
                statut_portion: 1,
                statut_portion_text: "Livré",
                expeditionclient: { 
                  id: "201",
                  codelivraison: "LIV-2026-010",
                  statut_livraison: 1,
                  statut_livraison_text: "Livré",
                  date_cloture_livraison: "2026-01-06",
                  commentaire_livraison: "Livraison complète - Client satisfait",
                  client: { id: "3", designation: "CSB II Antsirabe" } 
                },
              },
              {
                tonnage_affecte: 5,
                volume_affecte: 15,
                ordre_chargement: 2,
                statut_portion: 1,
                statut_portion_text: "Livré",
                expeditionclient: { 
                  id: "202",
                  codelivraison: "LIV-2026-011",
                  statut_livraison: 1,
                  statut_livraison_text: "Livré",
                  date_cloture_livraison: "2026-01-06",
                  commentaire_livraison: "Réception confirmée",
                  client: { id: "4", designation: "Dépôt Régional Est" } 
                },
              },
            ],
          },
        ],
      },
      {
        ordre: 2,
        montant: 1800000,
        vehicule: {
          matricule: "5678 TBC",
          marque: "Renault Master",
          tonnage: { tonnage: 8,id : 1 },
          chauffeur: {id: "1", nom: "Pierre Andria",email: "pierre.andria@htsoft.com",telephone: "034567890" },
        },
        expeditionaxetransporteurs: [
          {
            id: "exp-003",
            statut: "attente",
            etat_text: "En attente de chargement",
               bl_transporteur_disponible: false,
            bon_retour_chauffeur_disponible: false,
            fiche_pointage_disponible: false,
            pvrd_chauffeur_disponible: false,
            validation_fournisseur: 0,
            chrono_disponible: true,
            ordremission_disponible: true,
            tonnage_affecte: 6,
            volume_affecte: 20,
            cout_transport: 800000,
            pourcentage_remplissage_tonnage: 75,
            pourcentage_remplissage_volume: 60,
            expeditionaxe: {
              axe: { designation: "Antananarivo " },
              expedition: {
                code: "EXP-2026-0003",
                date_expedition: "2026-01-15",
              },
            },
            expeditionaxetransporteurclients: [
              {
                tonnage_affecte: 6,
                volume_affecte: 18,
                ordre_chargement: 1,
                statut_portion: 2,
                statut_portion_text: "Partiel",
                expeditionclient: { 
                  id: "301",
                  codelivraison: "LIV-2026-020",
                  statut_livraison: 2,
                  statut_livraison_text: "Partiellement livré",
                  statut_livraison_badge: "warning",
                  commentaire_livraison: "Livraison partielle - 4T sur 6T livrés, reste en attente",
                  client: { id: "5", designation: "Pharmacie du Port" } 
                },
              },
            ],
            remplacements: [
              {
                id: "remp-002",
                motif: "Accident de circulation",
                statut: 1,
                statut_text: "Approuvé",
                est_en_attente: false,
                vehicule_actuel: {
                  matricule: "5678 TBC",
                  tonnage: { tonnage: 8 },
                },
                vehicule_remplacement: {
                  matricule: "4444 TBY",
                  tonnage: { tonnage: 10 },
                },
                difference_tonnage: 2,
                est_amelioration_capacite: true,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "2",
    axe: { designation: "Fianarantsoa" },
    tonnage: { designation: "15 Tonnes", tonnage: 15 },
    fournisseur: { nom: "Transport Express Madagascar", score: 95 },
    annuairetransporteur: {
      reference: "AT-2026-002",
      annee: "2026",
      periode_deb: "2026-01-01",
      periode_fin: "2026-12-31",
    },
    vehiculesannuairetransporteurs: [
      {
        ordre: 1,
        montant: 3200000,
        vehicule: {
          matricule: "9012 TBD",
          marque: "Volvo FH",
          tonnage: { tonnage: 20, id :1 },
          chauffeur: { nom: "Hery Razaka",email: "hery.razaka@htsoft.com",telephone: "034567890",id: "1" },
        },
        expeditionaxetransporteurs: [
          {
            id: "exp-004",
            statut: "en_cours",
            etat_text: "En transit",
            validation_fournisseur: 99,
            bl_transporteur_disponible: false,
            bon_retour_chauffeur_disponible: false,
            fiche_pointage_disponible: false,
            pvrd_chauffeur_disponible: false,
            chrono_disponible: false,
            ordremission_disponible: false,
            tonnage_affecte: 18,
            volume_affecte: 60,
            cout_transport: 2800000,
            pourcentage_remplissage_tonnage: 90,
            pourcentage_remplissage_volume: 80,
            expeditionaxe: {
              axe: { designation: "Fianarantsoa" },
              expedition: {
                code: "EXP-2026-0004",
                date_expedition: "2026-01-12",
              },
            },
            expeditionaxetransporteurclients: [
              {
                tonnage_affecte: 10,
                volume_affecte: 35,
                ordre_chargement: 1,
                statut_portion: 99,
                statut_portion_text: "Échec",
                expeditionclient: { 
                  id: "401",
                  codelivraison: "LIV-2026-030",
                  statut_livraison: 99,
                  statut_livraison_text: "Échec de livraison",
                  statut_livraison_badge: "danger",
                  commentaire_livraison: "Client absent - Tentative reportée",
                  client: { id: "6", designation: "CHU Fianarantsoa" } 
                },
              },
              {
                tonnage_affecte: 8,
                volume_affecte: 25,
                ordre_chargement: 2,
                statut_portion: 0,
                statut_portion_text: "En attente",
                expeditionclient: { 
                  id: "402",
                  codelivraison: "LIV-2026-031",
                  statut_livraison: 0,
                  statut_livraison_text: "En attente",
                  client: { id: "7", designation: "Grossiste Betsileo" } 
                },
              },
            ],
            remplacements: [
              {
                id: "remp-003",
                motif: "Indisponibilité chauffeur titulaire",
                statut: 2,
                statut_text: "Refusé",
                est_en_attente: false,
                vehicule_actuel: {
                  matricule: "9012 TBD",
                  tonnage: { tonnage: 20 },
                },
                vehicule_remplacement: {
                  matricule: "1111 TBX",
                  tonnage: { tonnage: 15 },
                },
                difference_tonnage: -5,
                est_amelioration_capacite: false,
              },
            ],
          },
        ],
      },
    ],
  },
];

// Mock pour une expédition spécifique
export const mockExpeditionDetail: ExpeditionAxeTransporteur = {
  id: "exp-001",
  statut: "en_cours",
  etat_text: "En cours de livraison",
  tonnage_affecte: 8,
  volume_affecte: 25,
  bl_transporteur_disponible: true,
  chrono_disponible: true,
  ordremission_disponible: true,
  bon_retour_chauffeur_disponible: true,
  fiche_pointage_disponible: true,
  pvrd_chauffeur_disponible: true,
  validation_fournisseur:1,
  cout_transport: 1200000,
  pourcentage_remplissage_tonnage: 80,
  pourcentage_remplissage_volume: 65,
  expeditionaxe: {
    axe: { designation: "Antananarivo " },
    expedition: {
      code: "EXP-2026-0001",
      date_expedition: "2026-01-10",
    },
  },
  expeditionaxetransporteurclients: [
    {
      tonnage_affecte: 5,
      bl_url: "https://example.com/bl.pdf",
      documents: [
        {
          id: 1,
          nom: "BL Pharmacie Centrale",
          url: "https://example.com/bl_pharmacie_centrale.pdf",
          type: "bl",
        },
      ],
      expeditionclient: { client: { designation: "Pharmacie Centrale" } },
    },
    {
      tonnage_affecte: 3,
      bl_url: "https://example.com/bl.pdf",
      documents: [
        {
          id: 1,
          nom: "BL Pharmacie Centrale",
          url: "https://example.com/bl_pharmacie_centrale.pdf",
          type: "bl",
        },
      ],
      expeditionclient: { client: { designation: "Hôpital HJRA" } },
    },
  ],
};

// Fonction pour trouver une expédition par ID dans les mocks
export const findMockExpeditionById = (id: string): ExpeditionAxeTransporteur | null => {
  for (const expedition of mockExpeditions) {
    for (const vehicule of expedition.vehiculesannuairetransporteurs) {
      for (const exp of vehicule.expeditionaxetransporteurs) {
        if (exp.id === id) {
          return exp;
        }
      }
    }
  }
  return null;
};
