import { useState, useEffect } from "react";
import { fetchGraphQL } from "../api/graphql/graphqlService";
import { 
  getExpeditionsTransporteurQuery, 
  getExpeditionDetailQuery,
  getMissionsTransporteurQuery,
  getMissionByIdQuery 
} from "../api/graphql/queries";
import { 
  ExpeditionData, 
  ExpeditionAxeTransporteur, 
  ExpeditionsResponse 
} from "../types/Expedition.types";
import { Mission } from "../types/Mission.types";
import { mockExpeditions, findMockExpeditionById } from "../mocks/expeditionMock";

// ====================================
// CONFIGURATION MOCK
// ====================================
// Mettre à true pour utiliser les données mock (test)
// Mettre à false pour utiliser l'API réelle
const USE_MOCK = false;
// ====================================

// ====================================
// TYPES API RÉELLE
// ====================================
interface ApiVehicule {
  id: string;
  matricule: string;
  marque: string;
  tonnage: { id: string; designation: string; tonnage: number };
}

interface ApiExpeditionAxe {
  id: string;
  tonnage_restant: number;
  tonnage_couvert: number;
  volume_restant: number;
  volume_couvert: number;
  axe: { id: number; designation: string };
  expedition: { id: string; code: string; date_expedition: string; statut: number };
}

interface ApiExpeditionClient {
  id: string;
  tonnage_affecte: number;
  volume_affecte: number;
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
    id: string;
    codelivraison?: string;
    poidsexpedition?: number;
    volume?: number;
    statut_livraison?: number;
    statut_livraison_text?: string;
    statut_livraison_badge?: string;
    date_cloture_livraison?: string;
    commentaire_livraison?: string;
    date_livraison?: string;
    url_pvrd?: string;
    url_bl_signe?: string;
    url_bon_retour?: string;
    url_fiche_pointage?: string;
    client: { id: string; designation: string };
  };
}

interface ApiConvoyeur {
  id: string;
  nom: string;
  adresse: string;
  telephone: string;
}

interface ApiRemplacement {
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

interface ApiExpeditionAxeTransporteur {
  id: string;
  statut: number;
  etat_text: string;
  etat_badge?: string;
  convoyeur: ApiConvoyeur;
  chauffeur: { id: string; nom: string; email?: string ;telephone?: string};
  validation_fournisseur: 0 | 1 | 99;  // 0 = non validé, 1 = validé , 99 = refusé
  pvrd_chauffeur_disponible: boolean;
  bon_retour_chauffeur_disponible: boolean;
  fiche_pointage_disponible: boolean;
  bl_transporteur_disponible: boolean;
  chrono_disponible: boolean;
  ordremission_disponible: boolean;
  tonnage_affecte: number;
  volume_affecte: number;
  cout_transport: number;
  vehicule: ApiVehicule;
  expeditionaxe: ApiExpeditionAxe;
  expeditionaxetransporteurclients: ApiExpeditionClient[];
  remplacements?: ApiRemplacement[];
}

interface ApiMissionsResponse {
  expeditionaxetransporteurs: ApiExpeditionAxeTransporteur[];
}

// ====================================
// ADAPTATEUR API → MISSION
// ====================================
/**
 * Convertit les données de l'API réelle vers le format Mission attendu par l'UI
 * Cette fonction permet de garder l'implémentation UI intacte
 */
const adaptApiToMission = (apiData: ApiExpeditionAxeTransporteur): Mission => {
  const vehiculeTonnage = apiData.vehicule?.tonnage?.tonnage || 0;
  const tonnageAffecte = apiData.tonnage_affecte || 0;
  
  // Calculer le pourcentage de remplissage
  const pourcentageRemplissageTonnage = vehiculeTonnage > 0 
    ? Math.round((tonnageAffecte / vehiculeTonnage) * 100 * 100) / 100
    : 0;

  // Mapper le statut numérique vers string
  const mapStatut = (statut: number): Mission["statut"] => {
    switch (statut) {
      case 0: return "attente";
      case 1: return "nouveau";
      case 2: return "en_cours";
      case 3: return "livre";
      case 4: return "annule";
      default: return "nouveau";
    }
  };

  return {
    id: apiData.id,
    code: apiData.expeditionaxe?.expedition?.code || "N/A",
    expedition_id: apiData.expeditionaxe?.expedition?.id || apiData.id,
    validation_fournisseur: apiData.validation_fournisseur,
    convoyeur: apiData.convoyeur,
    pvrd_chauffeur_disponible: apiData.pvrd_chauffeur_disponible,
    bon_retour_chauffeur_disponible: apiData.bon_retour_chauffeur_disponible,
    fiche_pointage_disponible: apiData.fiche_pointage_disponible,
    bl_transporteur_disponible: apiData.bl_transporteur_disponible,
    chrono_disponible: apiData.chrono_disponible,
    ordremission_disponible: apiData.ordremission_disponible,
    date_expedition: apiData.expeditionaxe?.expedition?.date_expedition || "",
    statut: mapStatut(apiData.statut),
    etat_text: apiData.etat_text || "",
    axe: {
      id: apiData.expeditionaxe?.axe?.id || 0,
      designation: apiData.expeditionaxe?.axe?.designation || "N/A"
    },
    tonnage_affecte: tonnageAffecte,
    volume_affecte: apiData.volume_affecte || 0,
    pourcentage_remplissage_tonnage: pourcentageRemplissageTonnage,
    pourcentage_remplissage_volume: 0, // Calculé si nécessaire
    vehicule: {
      id: apiData.vehicule?.id || "0",
      matricule: apiData.vehicule?.matricule || "N/A",
      marque: apiData.vehicule?.marque || "N/A",
      tonnage: vehiculeTonnage,
      tonnage_id: parseInt(apiData.vehicule?.tonnage?.id || "0")
    },
    chauffeur: {
      id: apiData.chauffeur?.id || "0",
      nom: apiData.chauffeur?.nom || "N/A",
      telephone: apiData.chauffeur?.telephone || "N/A",
      email: apiData.chauffeur?.email || "N/A"
    },
    clients: (apiData.expeditionaxetransporteurclients || []).map(c => ({
      expedition_client_id: parseInt(c.expeditionclient.id || "0"),
      id: parseInt(c.expeditionclient?.client?.id || "0"),
      designation: c.expeditionclient?.client?.designation || "N/A",
      tonnage_affecte: c.tonnage_affecte || 0,
      volume_affecte: c.volume_affecte || 0,
      ordre_chargement: c.ordre_chargement,
      statut_portion: c.statut_portion,
      statut_portion_text: c.statut_portion_text,
      statut_portion_badge: c.statut_portion_badge,
      date_livraison_portion: c.date_livraison_portion,
      observation_livraison: c.observation_livraison,
      codelivraison: c.expeditionclient?.codelivraison,
      poidsexpedition: c.expeditionclient?.poidsexpedition,
      volume_expedition: c.expeditionclient?.volume,
      statut_livraison: c.expeditionclient?.statut_livraison,
      statut_livraison_text: c.expeditionclient?.statut_livraison_text,
      statut_livraison_badge: c.expeditionclient?.statut_livraison_badge,
      date_cloture_livraison: c.expeditionclient?.date_cloture_livraison,
      commentaire_livraison: c.expeditionclient?.commentaire_livraison,
      date_livraison: c.expeditionclient?.date_livraison,
      url_pvrd: c.expeditionclient?.url_pvrd,
      url_bl_signe: c.expeditionclient?.url_bl_signe,
      url_bon_retour: c.expeditionclient?.url_bon_retour,
      url_fiche_pointage: c.expeditionclient?.url_fiche_pointage,
      bl_url: c.bl_url || "",
      documents: c.documents || []
    })),
    cout_transport: apiData.cout_transport || 0,
    remplacements: apiData.remplacements || []
  };
};

// ====================================

/**
 * Fonction pour aplatir la structure imbriquée en liste de missions
 * Note: Cette fonction est utilisée uniquement pour les données MOCK
 */
export const flattenToMissions = (expeditions: ExpeditionData[]): Mission[] => {
  return expeditions.flatMap(annuaire =>
    annuaire.vehiculesannuairetransporteurs.flatMap(vehicule =>
      vehicule.expeditionaxetransporteurs.map(exp => ({
        id: exp.id,
        code: exp.expeditionaxe.expedition.code,
        expedition_id: exp.id, // On utilise l'id de l'expédition transporteur
        date_expedition: exp.expeditionaxe.expedition.date_expedition,
        statut: exp.statut as Mission["statut"],
        etat_text: exp.etat_text,
        validation_fournisseur: exp.validation_fournisseur,
        convoyeur: exp.convoyeur || { id: "0", nom: "N/A", adresse: "", telephone: "" },
        pvrd_chauffeur_disponible: exp.pvrd_chauffeur_disponible,
        bon_retour_chauffeur_disponible: exp.bon_retour_chauffeur_disponible,
        fiche_pointage_disponible: exp.fiche_pointage_disponible,
        bl_transporteur_disponible: exp.bl_transporteur_disponible,
        chrono_disponible: exp.chrono_disponible,
        ordremission_disponible: exp.ordremission_disponible,
        axe: {
          id: 0, // ID non disponible dans les mocks
          designation: exp.expeditionaxe.axe.designation
        },
        tonnage_affecte: exp.tonnage_affecte,
        volume_affecte: exp.volume_affecte,
        pourcentage_remplissage_tonnage: exp.pourcentage_remplissage_tonnage,
        pourcentage_remplissage_volume: exp.pourcentage_remplissage_volume,
        vehicule: {
          id: "0", // ID non disponible dans les mocks
          matricule: vehicule.vehicule.matricule,
          marque: vehicule.vehicule.marque,
          tonnage: vehicule.vehicule.tonnage.tonnage,
          tonnage_id: vehicule.vehicule.tonnage.id || 0
        },
        chauffeur: {
          id: "0", // ID non disponible dans les mocks
          nom: vehicule.vehicule.chauffeur.nom,
          telephone: vehicule.vehicule.chauffeur.telephone,
          email: vehicule.vehicule.chauffeur.email
        },
        clients: exp.expeditionaxetransporteurclients.map((c: any) => ({
          expedition_client_id: parseInt(c.id || "0"),
          id: parseInt(c.expeditionclient?.client?.id || "0"),
          designation: c.expeditionclient.client.designation,
          tonnage_affecte: c.tonnage_affecte,
          volume_affecte: c.volume_affecte || 0,
          ordre_chargement: c.ordre_chargement,
          statut_portion: c.statut_portion,
          statut_portion_text: c.statut_portion_text,
          statut_portion_badge: c.statut_portion_badge,
          date_livraison_portion: c.date_livraison_portion,
          observation_livraison: c.observation_livraison,
          codelivraison: c.expeditionclient?.codelivraison,
          poidsexpedition: c.expeditionclient?.poidsexpedition,
          volume_expedition: c.expeditionclient?.volume,
          statut_livraison: c.expeditionclient?.statut_livraison,
          statut_livraison_text: c.expeditionclient?.statut_livraison_text,
          statut_livraison_badge: c.expeditionclient?.statut_livraison_badge,
          date_cloture_livraison: c.expeditionclient?.date_cloture_livraison,
          commentaire_livraison: c.expeditionclient?.commentaire_livraison,
          date_livraison: c.expeditionclient?.date_livraison,
          url_pvrd: c.expeditionclient?.url_pvrd,
          url_bl_signe: c.expeditionclient?.url_bl_signe,
          url_bon_retour: c.expeditionclient?.url_bon_retour,
          url_fiche_pointage: c.expeditionclient?.url_fiche_pointage,
          bl_url: c.bl_url || "",
          documents: c.documents || []
        })),
        cout_transport: exp.cout_transport,
        remplacements: exp.remplacements || []
      }))
    )
  );
};

interface UseExpeditionsProps {
  fournisseur_id?: number;
}

/**
 * Hook pour récupérer les expéditions d'un transporteur
 */
export const useExpeditions = (props?: UseExpeditionsProps) => {
  const [expeditions, setExpeditions] = useState<ExpeditionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpeditions = async () => {
      if (!props?.fournisseur_id && !USE_MOCK) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Utiliser les mocks si USE_MOCK est activé
        if (USE_MOCK) {
          console.log("📊 [useExpeditions] Mode MOCK activé - Utilisation des données de test");
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 500));
          setExpeditions(mockExpeditions);
          return;
        }

        // Sinon, appeler l'API réelle
        const response = await fetchGraphQL<{ data: ExpeditionsResponse }>(
          getExpeditionsTransporteurQuery(props!.fournisseur_id!)
        );

        if (response.data?.data?.detailsannuairetransporteurs) {
          console.log("📊 [useExpeditions] Expéditions récupérées:", response.data.data.detailsannuairetransporteurs);
          setExpeditions(response.data.data.detailsannuairetransporteurs);
        } else {
          setExpeditions([]);
        }
      } catch (err: any) {
        console.error(" [useExpeditions] Erreur:", err);
        setError(err.message || "Erreur lors du chargement des expéditions");
      } finally {
        setLoading(false);
      }
    };

    fetchExpeditions();
  }, [props?.fournisseur_id]);

  // Compter le total d'expéditions
  const getTotalExpeditions = () => {
    let total = 0;
    expeditions.forEach((exp) => {
      exp.vehiculesannuairetransporteurs?.forEach((vehicule) => {
        total += vehicule.expeditionaxetransporteurs?.length || 0;
      });
    });
    return total;
  };

  return { expeditions, loading, error, getTotalExpeditions };
};

/**
 * Hook pour récupérer une expédition spécifique par ID
 */
export const useExpedition = (id?: string, fournisseur_id?: number) => {
  const [expedition, setExpedition] = useState<ExpeditionAxeTransporteur | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExpedition = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      if (!fournisseur_id && !USE_MOCK) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Utiliser les mocks si USE_MOCK est activé
        if (USE_MOCK) {
          console.log("📊 [useExpedition] Mode MOCK activé - Recherche de l'expédition:", id);
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const foundExpedition = findMockExpeditionById(id);
          if (foundExpedition) {
            console.log("📊 [useExpedition] Expédition trouvée:", foundExpedition);
            setExpedition(foundExpedition);
          } else {
            setError("Expédition non trouvée");
          }
          return;
        }

        // Sinon, appeler l'API réelle
        const response = await fetchGraphQL<{ data: ExpeditionsResponse }>(
          getExpeditionDetailQuery(fournisseur_id!)
        );

        if (response.data?.data?.detailsannuairetransporteurs) {
          // Chercher l'expédition par ID dans les résultats
          let foundExpedition: ExpeditionAxeTransporteur | null = null;
          
          for (const annuaire of response.data.data.detailsannuairetransporteurs) {
            for (const vehicule of annuaire.vehiculesannuairetransporteurs || []) {
              for (const exp of vehicule.expeditionaxetransporteurs || []) {
                if (exp.id === id) {
                  foundExpedition = exp;
                  break;
                }
              }
              if (foundExpedition) break;
            }
            if (foundExpedition) break;
          }

          if (foundExpedition) {
            console.log("📊 [useExpedition] Expédition trouvée:", foundExpedition);
            setExpedition(foundExpedition);
          } else {
            setError("Expédition non trouvée");
          }
        } else {
          setError("Aucune donnée trouvée");
        }
      } catch (err: any) {
        console.error("❌ [useExpedition] Erreur:", err);
        setError(err.message || "Erreur lors du chargement de l'expédition");
      } finally {
        setLoading(false);
      }
    };

    fetchExpedition();
  }, [id, fournisseur_id]);

  return { expedition, loading, error };
};

/**
 * Hook pour récupérer les missions (structure aplatie)
 */
export const useMissions = (props?: UseExpeditionsProps) => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMissions = async () => {
      if (!props?.fournisseur_id && !USE_MOCK) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          console.log("📊 [useMissions] Mode MOCK activé - Utilisation des données de test");
          await new Promise(resolve => setTimeout(resolve, 500));
          const flatMissions = flattenToMissions(mockExpeditions);
          console.log("📊 [useMissions] Missions aplaties:", flatMissions);
          setMissions(flatMissions);
          return;
        }

        // === UTILISER LA NOUVELLE API RÉELLE ===
        console.log("📊 [useMissions] Appel API réelle avec fournisseur_id:", props!.fournisseur_id);
        const response = await fetchGraphQL<{ data: ApiMissionsResponse }>(
          getMissionsTransporteurQuery(props!.fournisseur_id!)
        );

        if (response.data?.data?.expeditionaxetransporteurs) {
          // Utiliser l'adaptateur pour convertir les données API vers Mission
          const adaptedMissions = response.data.data.expeditionaxetransporteurs.map(adaptApiToMission);
          console.log("📊 [useMissions] Missions adaptées depuis API:", adaptedMissions);
          setMissions(adaptedMissions);
        } else {
          console.log("📊 [useMissions] Aucune mission trouvée dans la réponse");
          setMissions([]);
        }
      } catch (err: any) {
        console.error("❌ [useMissions] Erreur:", err);
        setError(err.message || "Erreur lors du chargement des missions");
      } finally {
        setLoading(false);
      }
    };

    fetchMissions();
  }, [props?.fournisseur_id]);
  return { missions, loading, error, total: missions.length };
};

/**
 * Hook pour récupérer une mission par son ID (structure aplatie)
 */
export const useMission = (id: string | undefined, fournisseur_id?: number) => {
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Fonction pour forcer le rechargement des données
  const refetch = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchMission = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      if (!fournisseur_id && !USE_MOCK) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        if (USE_MOCK) {
          console.log("📊 [useMission] Mode MOCK activé - Recherche de la mission:", id);
          await new Promise(resolve => setTimeout(resolve, 300));
          const allMissions = flattenToMissions(mockExpeditions);
          const foundMission = allMissions.find(m => m.id === id);
          if (foundMission) {
            console.log("📊 [useMission] Mission trouvée:", foundMission);
            setMission(foundMission);
          } else {
            setError("Mission non trouvée");
          }
          return;
        }

        // === UTILISER LA NOUVELLE API RÉELLE ===
        console.log("📊 [useMission] Appel API réelle pour mission ID:", id);
        const response = await fetchGraphQL<{ data: ApiMissionsResponse }>(
          getMissionByIdQuery(id)
        );

        if (response.data?.data?.expeditionaxetransporteurs && response.data.data.expeditionaxetransporteurs.length > 0) {
          // Adapter la première mission trouvée
          const adaptedMission = adaptApiToMission(response.data.data.expeditionaxetransporteurs[0]);
          console.log("📊 [useMission] Mission adaptée depuis API:", adaptedMission);
          setMission(adaptedMission);
        } else {
          setError("Mission non trouvée");
        }
      } catch (err: any) {
        console.error("❌ [useMission] Erreur:", err);
        setError(err.message || "Erreur lors du chargement de la mission");
      } finally {
        setLoading(false);
      }
    };

    fetchMission();
  }, [id, fournisseur_id, refreshKey]);

  return { mission, loading, error, refetch };
};
