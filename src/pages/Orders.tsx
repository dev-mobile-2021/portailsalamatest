import { Container, Row, Col, Badge, Form, Spinner } from "react-bootstrap";
import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { useCrudGraph } from "../hooks/useCrudGraph";
import { Order } from "../types/order.types";
import { Commande } from "../types/Commande.types";

import dossier_icon from "../assets/images/dossier.png";
import { useNavigate } from "react-router-dom";
import { FaBoxOpen, FaCalendarAlt, FaFilter, FaSearch } from "react-icons/fa";
import back_icon from "../assets/images/back.png";
import { useAuthContext } from "../hooks/useUserhook";
import SmallHeader from "../components/const/SmallHeader";
import { useCommandesListPaginatedWithControls } from "../hooks/useCommandes";
import useTypeCommandes from "../hooks/useTypeCommandes";
import { General } from "../types/general.types";
import ClientSelect from "../components/ClientSelect";
import PaginationComponent from "../components/PaginationComponent";

type FilterType =
  | "programme"
  | "rc_public"
  | "rc_prive"
  | "tef"
  | "be"
  | "ferme"
  | "urgence"
  | "enlevement";

const FILTER_CONFIG: { key: FilterType; label: string; search: string }[] = [
  {
    key: "programme",
    label: "Commande Programme",
    search: "Commande Programme",
  },
  {
    key: "rc_public",
    label: "Commande RC Public",
    search: "Commande RC Public",
  },
  { key: "rc_prive", label: "Commande RC Privé", search: "Commande RC Privé" },
  { key: "tef", label: "Commande TEF", search: "Commande TEF" },
  { key: "be", label: "Commande BE", search: "Commande BE" },
  { key: "ferme", label: "Commande Ferme", search: "Commande FERME" },
  { key: "urgence", label: "Commande D'urgence", search: "Commande D'urgence" },
  {
    key: "enlevement",
    label: "Commande Enlèvement",
    search: "Commande Enlèvement",
  },
];

// Fonction pour mapper les nouvelles commandes vers l'ancien format
const mapCommandeToOrder = (commande: Commande): Order => {
  // console.log("Mapping commande:", commande);
  // console.log("Campagne dans commande:", commande.campagne);
  // console.log("Programme dans campagne:", commande.programme);
  return {
    id: commande.id,
    statut: commande.statut,
    code: commande.code,
    etat_text: commande.etat_text || "", // Valeur par défaut
    etat_badge: "bg-info", // Valeur par défaut
    etat_cd_text: commande.etat_cd_text || "", // Valeur pour les commandes de type programme
    etat_cd_badge: commande.etat_cd_badge || "", // Valeur pour les commandes de type programme
    etat_commande: commande.etat_commande || null, // Valeur pour les commandes de type programme
    detailcommandes: commande.lignecommandes.map((ligne) => ({
      id: Math.random(), // Génération d'un ID temporaire
      prix: ligne.pv_ht,
      avg: ligne.cmm,
      quantite: ligne.quantite,
      article_id: ligne.article?.id || 0,
      // Mapping des détails de lots pour les commandes de type programme
      detaillignecommandes: ligne.detaillignecommandes || [],
      // Propriétés pour la vue globale programme
      produit:
        ligne.article?.designation ||
        ligne.article_text ||
        "Article non spécifié",
      code: ligne.article?.id?.toString() || "",
      qte_debut: ligne.qte_debut || 0,
      qte_recue: ligne.qte_recue || 0,
      qte_distribuee: ligne.qte_distribuee || 0,
      qte_perdue: ligne.qte_perdue || 0,
      ajustement: ligne.ajustement || 0,
      qte_fin: ligne.qte_fin || 0,
      cmm: ligne.cmm || 0,
      stock_max: ligne.stock_max || 0,
      qte_commander_l: ligne.qte_commandee || 0,
      qte_commandee: ligne.qte_commandee || 0,
      nb_jour_rupture: ligne.nb_jour_rupture || 0,
      msd: ligne.msd || 0,
      qte_transferes: ligne.qte_transferes || 0,
      qte_dfs: ligne.qte_dfs || 0,
      // Propriétés pour autres types de commandes (RC, BE, etc.)
      famille: ligne.famille?.designation || "",
      type: ligne.catalogue === 1 ? "Catalogue" : "Hors catalogue",
      prixvent: ligne.pv_ht,
      consoMoyenne: ligne.cmm,
      quantit: ligne.quantite,
      article: ligne.article
        ? {
            id: ligne.article.id,
            designation: ligne.article.designation,
            prix: ligne.pv_ht,
            quantite: ligne.quantite,
            description: ligne.article_text || "",
            categorie_id: ligne.famille_id || 0,
            image: "",
            code: "",
            unite_id: 0,
            categorie: ligne.famille
              ? {
                  id: ligne.famille.id,
                  designation: ligne.famille.designation,
                  description: "",
                }
              : {
                  id: 0,
                  designation: "Non spécifié",
                  description: "",
                },
            unite: {
              id: 0,
              designation: "Non spécifié",
              description: "",
            },
          }
        : {
            id: 0,
            designation: ligne.article_text || "Article non spécifié",
            prix: ligne.pv_ht,
            quantite: ligne.quantite,
            description: ligne.article_text || "",
            categorie_id: ligne.famille_id || 0,
            image: "",
            code: "",
            unite_id: 0,
            categorie: {
              id: 0,
              designation: "Non spécifié",
              description: "",
            },
            unite: {
              id: 0,
              designation: "Non spécifié",
              description: "",
            },
          },
    })),
    datecommande: commande.datecommande,
    datereception: "", // Pas disponible dans la nouvelle API
    client_id: commande.client_id,
    typelivraison_id: commande.typecommande_id,
    client: {
      id: commande.client?.id || commande.client_id,
      name: commande.client?.designation || "Client non spécifié",
      COMPTE_0: commande.client?.COMPTE_0 || "Client non spécifié",
      email: "",
      login: "",
      role_id: 0,
      role: { id: 0, designation: "Client", description: "Client", isadmin: 0 },
      image: null,
      profilable_id: commande.client_id,
      profilable_type: "client",
      created_at: "",
      updated_at: "",
      TSSCOD_0_0: "TRANS",
    },
    typelivraison: {
      id: commande.typecommande?.id || commande.typecommande_id,
      designation: commande.typecommande?.designation || "Type non spécifié",
      description: commande.typecommande?.designation || "Type non spécifié",
    },
    campagne: commande.campagne
      ? {
          id: commande.campagne.id,
          designation: commande.campagne.designation,
          datefin: commande.campagne.datefin || "",
          date: commande.campagne.date || "",
          etat_text: commande.campagne.etat_text || "",
          etat_badge: commande.campagne.etat_badge || "",
          image: commande.campagne.image || "",
          statut: commande.campagne.statut || "",
          programme: commande.campagne.programme
            ? {
                id: commande.campagne.programme.id,
                designation: commande.campagne.programme.designation,
                equipegestion_id:
                  commande.campagne.programme.equipegestion_id || "",
                objectif: commande.campagne.programme.objectif || "",
                missions: commande.campagne.programme.missions || "",
                date: commande.campagne.programme.date || "",
                equipegestion: commande.campagne.programme.equipegestion
                  ? {
                      id: commande.campagne.programme.equipegestion.id,
                      designation:
                        commande.campagne.programme.equipegestion.designation,
                      description:
                        commande.campagne.programme.equipegestion.description ||
                        "",
                      personnels:
                        commande.campagne.programme.equipegestion.personnels ||
                        [],
                    }
                  : {
                      id: 0,
                      designation: "",
                      description: "",
                      personnels: [],
                    },
                lignecommandes:
                  commande.campagne.programme.lignecommandes || [],
              }
            : {
                id: 0,
                designation: "",
                equipegestion_id: "",
                objectif: "",
                missions: "",
                date: "",
                equipegestion: {
                  id: 0,
                  designation: "",
                  description: "",
                  personnels: [],
                },
                lignecommandes: [],
              },
          programme_id: commande.campagne.programme_id || "",
          phasedepots: commande.campagne.phasedepots || [],
          lignecommandes: commande.campagne.lignecommandes || [],
        }
      : {
          id: 0,
          designation: "Campagne non spécifiée",
          datefin: "",
          date: "",
          etat_text: "",
          etat_badge: "",
          image: "",
          statut: "",
          programme: {
            id: 0,
            designation: "",
            equipegestion_id: "",
            objectif: "",
            missions: "",
            date: "",
            equipegestion: {
              id: 0,
              designation: "",
              description: "",
              personnels: [],
            },
            lignecommandes: [],
          },
          programme_id: "",
          phasedepots: [],
          lignecommandes: [],
        },
    programme: commande.programme,
  };
};

const Orders = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialFilter = (searchParams.get("type") as FilterType) || "programme";
  const validFilter = FILTER_CONFIG.some((f) => f.key === initialFilter)
    ? initialFilter
    : "programme";
  const [activeFilter, setActiveFilter] = useState<FilterType>(validFilter);
  const { user } = useAuthContext();
  const { typeCommandes, loading: loadingTypes } = useTypeCommandes();

  // États pour les filtres de date
  const [dateDebut, setDateDebut] = useState<string>("");
  const [dateFin, setDateFin] = useState<string>("");
  const [showDateFilter, setShowDateFilter] = useState<boolean>(false);

  // États pour les filtres Programme et Campagne (uniquement pour commandes programme)
  const [selectedProgramme, setSelectedProgramme] = useState<number | null>(
    null,
  );
  const [selectedCampagne, setSelectedCampagne] = useState<number | null>(null);
  const [showProgrammeFilter, setShowProgrammeFilter] =
    useState<boolean>(false);

  // État pour le filtre de statut
  const [ selectedStatut, setSelectedStatut] = useState<number | null>(1);

  // État pour le filtre de client
  const [selectedClient, setSelectedClient] = useState<number | null>(null);

  // État pour le filtre par code
  const [selectedCode, setSelectedCode] = useState<string | undefined>(
    undefined,
  );
  const [tempCode, setTempCode] = useState<string>("");

  // Liste des statuts disponibles basés sur l'état de la commande
  const getStatutsDisponibles = () => {
    return [
      { value: null, label: "Tous les statuts" },
      { value: 1, label: "Devis" },
      { value: 2, label: "Facture Proforma" },
      { value: 3, label: "Bon de Commande" },
      { value: 4, label: "Livraison" },
      { value: 5, label: "Facture" },
    ];
  };

  // Récupérer les programmes via GraphQL - TOUJOURS appeler le hook, mais activer conditionnellement
  const programmesQuery = `{programmes(client_id: ${user?.client_id || 0}){id,designation,objectif}}`;
  const shouldFetchProgrammes =
    activeFilter === "programme" && !!user?.client_id;
  const { data: programmes = [], isLoading: isLoadingProgrammes } =
    useCrudGraph<General>("programmes").useFetchAll(
      programmesQuery,
      {},
      { enabled: shouldFetchProgrammes },
    );

  // Récupérer les campagnes via GraphQL - TOUJOURS appeler le hook, mais activer conditionnellement
  const campagnesQuery = `{campagnes(programme_id:${selectedProgramme || 0},client_id:${user?.client_id || 0}){id,date,designation,statut}}`;
  const shouldFetchCampagnes =
    activeFilter === "programme" && !!selectedProgramme && !!user?.client_id;
  const { data: campagnes = [], isLoading: isLoadingCampagnes } =
    useCrudGraph<General>("campagnes").useFetchAll(
      campagnesQuery,
      {
        // Ajouter une clé unique basée sur le programme sélectionné pour forcer le refetch
        queryKey: ["campagnes", selectedProgramme, user?.client_id],
      },
      { enabled: shouldFetchCampagnes },
    );

  // Gérer le changement de programme
  const handleProgrammeChange = (programmeId: number | null) => {
    setSelectedProgramme(programmeId);
    // Réinitialiser la campagne sélectionnée quand on change de programme
    setSelectedCampagne(null);
  };

  // Filtrer les onglets à afficher basés sur les types disponibles
  const visibleTabs = useMemo(() => {
    // En mode mock, on affiche tout

    // Si les données sont en cours de chargement
    if (loadingTypes && typeCommandes.length === 0) return [];

    // Sinon on vérifie si le type existe dans la réponse API
    return FILTER_CONFIG.filter((def) =>
      typeCommandes.some((tc) => tc.designation.includes(def.search)),
    );
  }, [typeCommandes, loadingTypes]);

  // Récupérer l'ID du type de commande sélectionné
  const getTypeCommandeId = (filterType: FilterType): number | undefined => {
    const config = FILTER_CONFIG.find((c) => c.key === filterType);
    if (!config) return undefined;

    const typeCommande = typeCommandes.find((tc) =>
      tc.designation.includes(config.search),
    );

    return typeCommande?.id;
  };

  // Obtenir l'ID du type de commande
  const typeCommandeId = getTypeCommandeId(activeFilter);

  // Vérifier si les données nécessaires sont disponibles
  const shouldFetchCommandes =
    (user?.client_id || user?.role.isadmin === 1 || 1 === 1) &&
    typeCommandeId &&
    typeCommandes.length > 0;

  // Utiliser le hook optimisé pour récupérer les commandes avec contrôles de pagination
  const {
    commandes: newCommandes,
    metadata,
    loading: loadingNewCommandes,
    error,
    page,
    count,
    goToPage,
    changeCount,
  } = useCommandesListPaginatedWithControls(
    shouldFetchCommandes
      ? {
          client_id: selectedClient || user?.client_id,
          typecommande_id: typeCommandeId,
          user_id: user?.id,
          code: selectedCode,
          status: selectedStatut ?? undefined,
        }
      : undefined,
  );

  // Déterminer les données à utiliser
  let commandesData;

  commandesData = [
    {
      data: newCommandes.map(mapCommandeToOrder),
      metadata: {
        total: newCommandes.length,
        per_page: 10,
        current_page: 1,
        last_page: 1,
      },
    },
  ];

  // Loading state - affiché seulement si on n'utilise pas les mocks et que les données sont en cours de chargement
  const isLoading = loadingTypes || loadingNewCommandes;

  if (error) {
    console.error("Erreur lors du chargement des commandes:", error);
  }

  const filterCommands = (orders: Order[], filterType: FilterType) => {
    let filtered = orders;

    // Filtrage par client (en local pour les mocks ou si déjà chargé)
    if (selectedClient) {
      filtered = filtered.filter((order) => order.client_id === selectedClient);
    }

    // Si on utilise les nouvelles commandes, elles sont déjà filtrées par type
    if (newCommandes.length > 0) {
      filtered = orders;
    } else {
      // Logique de filtrage pour les anciennes données et mocks
      switch (filterType) {
        case "programme":
          filtered = orders.filter((order) =>
            order.typelivraison?.designation
              ?.toLowerCase()
              .includes("programme"),
          );
          break;
        case "rc_public":
          filtered = orders.filter((order) =>
            order.typelivraison?.designation
              ?.toLowerCase()
              .includes("rc public"),
          );
          break;
        case "rc_prive":
          filtered = orders.filter((order) =>
            order.typelivraison?.designation?.toLowerCase().includes("rc priv"),
          );
          break;
        case "tef":
          filtered = orders.filter((order) =>
            order.typelivraison?.designation?.toLowerCase().includes("tef"),
          );
          break;
        case "be":
          filtered = orders.filter((order) =>
            order.typelivraison?.designation?.toLowerCase().includes("be"),
          );
          break;
        case "ferme":
          filtered = orders.filter((order) =>
            order.typelivraison?.designation?.toLowerCase().includes("ferme"),
          );
          break;
        case "urgence":
          filtered = orders.filter((order) =>
            order.typelivraison?.designation?.toLowerCase().includes("urgence"),
          );
          break;
        case "enlevement":
          filtered = orders.filter(
            (order) =>
              order.typelivraison?.designation
                ?.toLowerCase()
                .includes("enlèvement") ||
              order.typelivraison?.designation
                ?.toLowerCase()
                .includes("enlevement"),
          );
          break;
        default:
          filtered = orders;
      }
    }

    // Filtrage par programme (uniquement pour commandes programme)
    if (filterType === "programme" && selectedProgramme) {
      filtered = filtered.filter((order) => {
        // Récupérer l'ID du programme depuis la campagne ou directement
        const programmeId =
          order.campagne?.programme?.id || order.programme?.id;

        // Convertir les deux valeurs en nombres pour la comparaison
        // Car l'API GraphQL retourne des strings et selectedProgramme est un number
        const programmeIdNum =
          typeof programmeId === "string"
            ? parseInt(programmeId, 10)
            : programmeId;

        return programmeIdNum === selectedProgramme;
      });
    }

    // Filtrage par campagne (uniquement pour commandes programme)
    if (filterType === "programme" && selectedCampagne) {
      filtered = filtered.filter((order) => {
        // Récupérer l'ID de la campagne
        const campagneId = order.campagne?.id;

        // Convertir les deux valeurs en nombres pour la comparaison
        const campagneIdNum =
          typeof campagneId === "string"
            ? parseInt(campagneId, 10)
            : campagneId;

        return campagneIdNum === selectedCampagne;
      });
    }

    // Filtrage par statut (état de la commande)
    // if (selectedStatut !== null) {
    //   filtered = filtered.filter((order) => {
    //     // Récupérer l'état de la commande
    //     const etatCommande = order.statut;

    //     // Comparer avec le statut sélectionné
    //     return etatCommande === selectedStatut;
    //   });
    // }

    // Filtrage par date
    if (dateDebut || dateFin) {
      filtered = filtered.filter((order) => {
        if (!order.datecommande) return false;

        const orderDate = new Date(order.datecommande);
        const debut = dateDebut ? new Date(dateDebut) : null;
        const fin = dateFin ? new Date(dateFin) : null;

        if (debut && fin) {
          return orderDate >= debut && orderDate <= fin;
        } else if (debut) {
          return orderDate >= debut;
        } else if (fin) {
          return orderDate <= fin;
        }

        return true;
      });
    }

    // Filtrage par code
    if (selectedCode) {
      filtered = filtered.filter((order) =>
        order.code?.toLowerCase().includes(selectedCode.toLowerCase()),
      );
    }

    return filtered;
  };

  const filteredCommandes = filterCommands(
    commandesData[0]?.data || [],
    activeFilter,
  );

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "---";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR");
  };

  const handleOrderClick = (order: Order) => {
    navigate(`/detail_orders_client/${order.id}?type=${activeFilter}`);
  };

  const handleFilterClick = (filterType: FilterType) => {
    setActiveFilter(filterType);
    // Réinitialiser les filtres programme/campagne si on change de type
    if (filterType !== "programme") {
      setSelectedProgramme(null);
      setSelectedCampagne(null);
      setShowProgrammeFilter(false);
    }
    // Réinitialiser le filtre de statut lors du changement de type
    setSelectedStatut(1);
    // Réinitialiser le filtre de code lors du changement de type
    setSelectedCode(undefined);
    setTempCode("");
    // On garde le client sélectionné par défaut, sauf si besoin spécifique
  };

  const clearDateFilters = () => {
    setDateDebut("");
    setDateFin("");
  };

  const clearClientFilter = () => {
    setSelectedClient(null);
  };

  const clearProgrammeFilters = () => {
    setSelectedProgramme(null);
    setSelectedCampagne(null);
  };

  // Fonctions utilitaires pour trouver le programme et la campagne sélectionnés avec conversion de type
  const getSelectedProgramme = () => {
    if (!selectedProgramme) return null;
    return programmes.find((p: General) => {
      const pId = typeof p.id === "string" ? parseInt(p.id, 10) : p.id;
      return pId === selectedProgramme;
    });
  };

  const getSelectedCampagne = () => {
    if (!selectedCampagne) return null;
    return campagnes.find((c: General) => {
      const cId = typeof c.id === "string" ? parseInt(c.id, 10) : c.id;
      return cId === selectedCampagne;
    });
  };

  return (
    <Container className="py-4 " style={{ maxWidth: "90%", zoom: 0.7 }}>
      <div className="greenShadow">
        <SmallHeader />
      </div>
      <div className="filter-tabs-container mb-5">
        <div className="filter-tabs justify-content-center">
          {visibleTabs.map((tab) => (
            <button
              key={tab.key}
              className={`filter-tab ${activeFilter === tab.key ? "active" : ""}`}
              onClick={() => handleFilterClick(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <style>
        {`
                .filter-tabs-container {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                    padding: 1.5rem;
                    border-radius: 12px;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .filter-tabs {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1rem;
                }

                .filter-tab {
                    background: #ffffff;
                    border: 2px solid #d1d5db;
                    color: #6b7280;
                    padding: 0.75rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 24px;
                    text-align: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .filter-tab:hover {
                    background: #f9fafb;
                    color: #374151;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                }

                .filter-tab.active {
                    background: #22c55e;
                    color: white;
                    border-color: #22c55e;
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }

                @media (max-width: 768px) {
                    .filter-tabs {
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    .filter-tab {
                        width: 100%;
                        text-align: center;
                    }
                }
                `}
      </style>
      <div>
        <div className="d-flex align-items-center gap-3 mb-4">
          <button
            className="btn bg-theme rounded-2 border-none px-2 py-2"
            onClick={() => {
              navigate(`/`);
            }}
          >
            <img src={back_icon} className="icon-size w-75" alt="" />
          </button>
          <div className="results-header m-0">
            <h5 className="results-title mb-0">
              {activeFilter === "programme" && "Commandes Programme"}
              {activeFilter === "rc_public" && "Commandes RC Public"}
              {activeFilter === "rc_prive" && "Commandes RC Privé"}
              {activeFilter === "tef" && "Commandes TEF"}
              {activeFilter === "be" && "Commandes BE"}
              {activeFilter === "ferme" && "Commandes Ferme"}
              {activeFilter === "urgence" && "Commandes D'urgence"}
              {activeFilter === "enlevement" && "Commandes Enlèvement"}
              <span className="results-count">
                ({filteredCommandes.length})
              </span>
            </h5>
          </div>
        </div>
      </div>

      {/* Section Statut - Tabs (Déplacé ici pour être visible directement) */}
      <div className="status-tabs-container mb-4">
        <div className="status-tabs">
          {getStatutsDisponibles().map((statut) => (
            <button
              key={statut.value ?? "all"}
              className={`status-tab ${selectedStatut === statut.value ? "active" : ""}`}
              onClick={() => setSelectedStatut(statut.value)}
              title={statut.label}
            >
              <i
                className={`fas ${
                  statut.value === null
                    ? "fa-th-large"
                    : statut.value === 1
                      ? "fa-eye"
                      : statut.value === 2
                        ? "fa-file-invoice"
                        : statut.value === 3
                          ? "fa-shopping-cart"
                          : statut.value === 4
                            ? "fa-truck"
                            : "fa-receipt"
                } me-2`}
              ></i>
              {statut.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filtre par Programme et Campagne - Uniquement pour commandes programme */}
      {activeFilter === "programme" && (
        <div className="modern-unified-filter mb-4">
          <div
            className="filter-header"
            onClick={() => setShowProgrammeFilter(!showProgrammeFilter)}
          >
            <div className="filter-header-content">
              <div className="filter-icon-wrapper">
                <FaFilter className="filter-main-icon" />
              </div>
              <div className="filter-header-text">
                <h6 className="filter-title mb-0">Filtres Avancés</h6>
                <small className="filter-subtitle">
                  {selectedProgramme ||
                  selectedCampagne ||
                  selectedStatut ||
                  dateDebut ||
                  dateFin ||
                  selectedClient ? (
                    <>
                      {selectedClient &&
                        `Client: ${filteredCommandes[0]?.client?.name || selectedClient}`}
                      {selectedClient &&
                        (selectedProgramme ||
                          selectedCampagne ||
                          selectedStatut ||
                          dateDebut ||
                          dateFin) &&
                        " • "}
                      {selectedProgramme &&
                        `Programme: ${getSelectedProgramme()?.designation || selectedProgramme}`}
                      {selectedProgramme && selectedCampagne && " • "}
                      {selectedCampagne &&
                        `Planning: ${getSelectedCampagne()?.designation || selectedCampagne}`}
                      {(selectedProgramme || selectedCampagne) &&
                        selectedStatut &&
                        " • "}
                      {selectedStatut &&
                        `Statut: ${getStatutsDisponibles().find((s) => s.value === selectedStatut)?.label || selectedStatut}`}
                      {selectedStatut && selectedCode && " • "}
                      {selectedCode && `Code: ${selectedCode}`}
                      {(selectedProgramme ||
                        selectedCampagne ||
                        selectedStatut ||
                        selectedCode) &&
                        (dateDebut || dateFin) &&
                        " • "}
                      {dateDebut &&
                        `Du ${new Date(dateDebut).toLocaleDateString("fr-FR")}`}
                      {dateDebut && dateFin && " au "}
                      {dateFin && !dateDebut && `Jusqu'au `}
                      {dateFin && new Date(dateFin).toLocaleDateString("fr-FR")}
                    </>
                  ) : (
                    "Filtrer par client, programme, planning cyclique, statut ou période"
                  )}
                </small>
              </div>
            </div>
            <div className="filter-toggle">
              <FaFilter
                className={
                  showProgrammeFilter ? "icon-rotate-up" : "icon-rotate-down"
                }
              />
            </div>
          </div>

          {showProgrammeFilter && (
            <div className="filter-content">
              {/* Section Programme et Planning cyclique */}
              <div className="filter-section mb-4">
                <div className="section-header">
                  <FaCalendarAlt className="section-icon" />
                  <h6 className="section-title">
                    Programme et Planning Cyclique
                  </h6>
                </div>
                <Row className="g-3">
                  <Col md={5}>
                    <div className="modern-input-group">
                      <label className="modern-label">Programme</label>
                      <Form.Select
                        value={selectedProgramme || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          handleProgrammeChange(value);
                        }}
                        className="modern-date-input"
                        disabled={isLoadingProgrammes}
                      >
                        <option value="">
                          {isLoadingProgrammes
                            ? "Chargement..."
                            : "Tous les programmes"}
                        </option>
                        {programmes.map((programme: General) => (
                          <option key={programme.id} value={programme.id}>
                            {programme.designation}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Col>
                  <Col md={5}>
                    <div className="modern-input-group">
                      <label className="modern-label">
                        Planning cyclique
                        {!selectedProgramme && (
                          <small
                            className="text-muted ms-2"
                            style={{ fontSize: "0.7rem", fontWeight: "normal" }}
                          >
                            (Programme requis)
                          </small>
                        )}
                      </label>
                      <Form.Select
                        value={selectedCampagne || ""}
                        onChange={(e) => {
                          const value = e.target.value
                            ? parseInt(e.target.value)
                            : null;
                          setSelectedCampagne(value);
                        }}
                        className="modern-date-input"
                        disabled={!selectedProgramme || isLoadingCampagnes}
                      >
                        <option value="">
                          {!selectedProgramme
                            ? "Sélectionnez un programme d'abord"
                            : isLoadingCampagnes
                              ? "Chargement..."
                              : campagnes.length === 0
                                ? "Aucun planning disponible"
                                : "Tous les plannings"}
                        </option>
                        {campagnes.map((campagne: any) => (
                          <option key={campagne.id} value={campagne.id}>
                            {campagne.designation}
                          </option>
                        ))}
                      </Form.Select>
                    </div>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <button
                      className="btn-action-filter w-100"
                      onClick={clearProgrammeFilters}
                      disabled={!selectedProgramme && !selectedCampagne}
                      title="Effacer les filtres programme/planning"
                    >
                      <FaBoxOpen className="me-1" />
                      Effacer
                    </button>
                  </Col>
                </Row>

                {selectedProgramme && isLoadingCampagnes && (
                  <div className="loading-message mt-3">
                    <div
                      className="spinner-border spinner-border-sm text-success me-2"
                      role="status"
                    >
                      <span className="visually-hidden">Chargement...</span>
                    </div>
                    <span>Chargement des plannings cycliques...</span>
                  </div>
                )}

                {selectedProgramme &&
                  !isLoadingCampagnes &&
                  campagnes.length === 0 && (
                    <div className="warning-message mt-3">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      <span>Aucun planning cyclique pour ce programme.</span>
                    </div>
                  )}
              </div>

              {/* Section Code Commande */}
              <div className="filter-section mb-4">
                <div className="section-header">
                  <i className="fas fa-barcode section-icon"></i>
                  <h6 className="section-title">Code Commande</h6>
                </div>
                <Row className="g-3">
                  <Col md={8}>
                    <div className="modern-input-group">
                      <Form.Control
                        type="text"
                        value={tempCode}
                        onChange={(e) => setTempCode(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            setSelectedCode(tempCode || undefined);
                          }
                        }}
                        className="modern-date-input"
                        placeholder="Rechercher par code (ex: CMD-XXXX)..."
                      />
                    </div>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <button
                      className="btn btn-success w-100 rounded-pill"
                      onClick={() => setSelectedCode(tempCode || undefined)}
                      style={{ height: "45px" }}
                    >
                      <FaSearch className="me-1" />
                      Rechercher
                    </button>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <button
                      className="btn-action-filter w-100"
                      onClick={() => {
                        setSelectedCode(undefined);
                        setTempCode("");
                      }}
                      disabled={!selectedCode && !tempCode}
                      title="Effacer le filtre code"
                      style={{ height: "45px" }}
                    >
                      <FaBoxOpen className="me-1" />
                      Effacer
                    </button>
                  </Col>
                </Row>
              </div>

              {/* Section Client */}
              {!user?.client_id && (
              <div className="filter-section mb-4">
                <div className="section-header">
                  <i className="fas fa-user section-icon"></i>
                  <h6 className="section-title">Client</h6>
                </div>
                <Row className="g-3">
                  <Col md={10}>
                    <ClientSelect
                      user_id={user?.id || null}
                      value={selectedClient}
                      onChange={setSelectedClient}
                      label=""
                      placeholder="Rechercher un client..."
                      styles={{
                        control: (base: any) => ({
                          ...base,
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          minHeight: "45px",
                          height: "45px",
                        }),
                        valueContainer: (base: any) => ({
                          ...base,
                          height: "45px",
                        }),
                      }}
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <button
                      className="btn-action-filter w-100"
                      onClick={clearClientFilter}
                      disabled={!selectedClient}
                      title="Effacer le filtre client"
                      style={{ height: "45px" }}
                    >
                      <FaBoxOpen className="me-1" />
                      Effacer
                    </button>
                  </Col>
                </Row>
              </div>
              )}

              {/* Séparateur
                            <div className="filter-divider"></div> */}

              {/* Section Période */}
              <div className="filter-section">
                <div className="section-header">
                  <FaCalendarAlt className="section-icon" />
                  <h6 className="section-title">Période</h6>
                </div>
                <Row className="g-3">
                  <Col md={5}>
                    <div className="modern-input-group">
                      <label className="modern-label">Date de début</label>
                      <Form.Control
                        type="date"
                        value={dateDebut}
                        onChange={(e) => setDateDebut(e.target.value)}
                        className="modern-date-input"
                        placeholder="Sélectionner..."
                      />
                    </div>
                  </Col>
                  <Col md={5}>
                    <div className="modern-input-group">
                      <label className="modern-label">Date de fin</label>
                      <Form.Control
                        type="date"
                        value={dateFin}
                        onChange={(e) => setDateFin(e.target.value)}
                        className="modern-date-input"
                        placeholder="Sélectionner..."
                      />
                    </div>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <button
                      className="btn-action-filter w-100"
                      onClick={clearDateFilters}
                      disabled={!dateDebut && !dateFin}
                      title="Effacer les filtres de période"
                    >
                      <FaBoxOpen className="me-1" />
                      Effacer
                    </button>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Filtre par date - Design amélioré (Pour les autres types de commandes) */}
      {activeFilter !== "programme" && (
        <div className="modern-date-filter mb-4">
          <div
            className="filter-header"
            onClick={() => setShowDateFilter(!showDateFilter)}
          >
            <div className="filter-header-content">
              <div className="filter-icon-wrapper">
                <FaCalendarAlt className="filter-main-icon" />
              </div>
              <div className="filter-header-text">
                <h6 className="filter-title mb-0">Filtres</h6>
                <small className="filter-subtitle">
                  {selectedStatut || dateDebut || dateFin || selectedClient ? (
                    <>
                      {selectedClient &&
                        `Client: ${filteredCommandes[0]?.client?.name || selectedClient}`}
                      {selectedClient &&
                        (selectedStatut || dateDebut || dateFin) &&
                        " • "}
                      {selectedStatut &&
                        `Statut: ${getStatutsDisponibles().find((s) => s.value === selectedStatut)?.label || selectedStatut}`}
                      {selectedStatut && selectedCode && " • "}
                      {selectedCode && `Code: ${selectedCode}`}
                      {selectedStatut && (dateDebut || dateFin) && " • "}
                      {dateDebut &&
                        `Du ${new Date(dateDebut).toLocaleDateString("fr-FR")}`}
                      {dateDebut && dateFin && " - "}
                      {dateFin &&
                        `Au ${new Date(dateFin).toLocaleDateString("fr-FR")}`}
                    </>
                  ) : (
                    "Filtrer par client, statut ou période"
                  )}
                </small>
              </div>
            </div>
            <div className="filter-toggle">
              <FaFilter
                className={
                  showDateFilter ? "icon-rotate-up" : "icon-rotate-down"
                }
              />
            </div>
          </div>

          {showDateFilter && (
            <div className="filter-content">
              {/* Section Client */}
              <div className="filter-section mb-4">
                <div className="section-header">
                  <i className="fas fa-user section-icon"></i>
                  <h6 className="section-title">Client</h6>
                </div>
                <Row className="g-3">
                  <Col md={10}>
                    <ClientSelect
                      user_id={user?.id || null}
                      value={selectedClient}
                      onChange={setSelectedClient}
                      label=""
                      placeholder="Rechercher un client..."
                      styles={{
                        control: (base: any) => ({
                          ...base,
                          backgroundColor: "white",
                          border: "1px solid #e5e7eb",
                          borderRadius: "12px",
                          minHeight: "45px",
                          height: "45px",
                        }),
                        valueContainer: (base: any) => ({
                          ...base,
                          height: "45px",
                        }),
                      }}
                    />
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <button
                      className="btn-action-filter w-100"
                      onClick={clearClientFilter}
                      disabled={!selectedClient}
                      title="Effacer le filtre client"
                      style={{ height: "45px" }}
                    >
                      <FaBoxOpen className="me-1" />
                      Effacer
                    </button>
                  </Col>
                </Row>
              </div>

              {/* Section Code Commande */}
              <div className="filter-section mb-4">
                <div className="section-header">
                  <i className="fas fa-barcode section-icon"></i>
                  <h6 className="section-title">Code Commande</h6>
                </div>
                <Row className="g-3">
                  <Col md={10}>
                    <div className="modern-input-group">
                      <Form.Control
                        type="text"
                        value={selectedCode}
                        onChange={(e) => setSelectedCode(e.target.value)}
                        className="modern-date-input"
                        placeholder="Rechercher par code (ex: CMD-XXXX)..."
                      />
                    </div>
                  </Col>
                  <Col md={2} className="d-flex align-items-end">
                    <button
                      className="btn-action-filter w-100"
                      onClick={() => setSelectedCode(undefined)}
                      disabled={!selectedCode}
                      title="Effacer le filtre code"
                      style={{ height: "45px" }}
                    >
                      <FaBoxOpen className="me-1" />
                      Effacer
                    </button>
                  </Col>
                </Row>
              </div>

              {/* Section Période */}
              <Row className="g-3">
                <Col md={5}>
                  <div className="modern-input-group">
                    <label className="modern-label">
                      <FaCalendarAlt className="me-2" />
                      Date de début
                    </label>
                    <Form.Control
                      type="date"
                      value={dateDebut}
                      onChange={(e) => setDateDebut(e.target.value)}
                      className="modern-date-input"
                      placeholder="Sélectionner..."
                    />
                  </div>
                </Col>
                <Col md={5}>
                  <div className="modern-input-group">
                    <label className="modern-label">
                      <FaCalendarAlt className="me-2" />
                      Date de fin
                    </label>
                    <Form.Control
                      type="date"
                      value={dateFin}
                      onChange={(e) => setDateFin(e.target.value)}
                      className="modern-date-input"
                      placeholder="Sélectionner..."
                    />
                  </div>
                </Col>
                <Col md={2} className="d-flex align-items-end">
                  <button
                    className="btn-reset-filter w-100"
                    onClick={clearDateFilters}
                    disabled={!dateDebut && !dateFin}
                  >
                    <FaBoxOpen className="me-2" />
                    Effacer
                  </button>
                </Col>
              </Row>

              {(dateDebut || dateFin) && (
                <div className="active-filters-badge">
                  <FaFilter className="me-2" />
                  <span className="fw-bold">Période sélectionnée:</span>
                  <span className="ms-2">
                    {dateDebut &&
                      new Date(dateDebut).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    {dateDebut && dateFin && " → "}
                    {dateFin &&
                      new Date(dateFin).toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {isLoading ? (
        <div
          className="d-flex justify-content-center align-items-center py-5 my-5"
          style={{ minHeight: "300px" }}
        >
          <div className="text-center">
            <Spinner
              animation="border"
              variant="success"
              style={{ width: "3rem", height: "3rem" }}
            />
            <p className="mt-3 text-muted fw-medium">
              Chargement des commandes...
            </p>
          </div>
        </div>
      ) : (
        <>
          <Row className="bg-transparent rounded-0 shadow-none">
            {filteredCommandes.map((order: Order) => (
              <Col
                key={order.id}
                md={3}
                sm={6}
                className="mb-4"
                onClick={() => handleOrderClick(order)}
              >
                <div className="folder-icon">
                  <div className="folder-image d-flex justify-content-center position-relative">
                    <img
                      src={dossier_icon}
                      alt="Folder"
                      style={{ width: "100px" }}
                    />
                    {/* Badge nombre d'articles */}
                    {order.detailcommandes &&
                      order.detailcommandes.length > 0 && (
                        <div className="article-count-badge">
                          {order.detailcommandes.length}
                        </div>
                      )}
                  </div>
                  <div className="folder-label mt-2">
                    {/* En-tête avec client et statut */}
                    <div className="client-header rounded-3 p-2 mb-2 d-flex align-items-center justify-content-between">
                      <span className="client-name text-truncate">
                        {order.client ? order.client.name : "Client non défini"}
                      </span>
                      <Badge
                        className={`status-badge ${
                          activeFilter === "programme"
                            ? order.etat_cd_badge
                            : order.etat_badge
                        }`}
                      >
                        {activeFilter === "programme"
                          ? order.etat_cd_text?.split(",")[0] || "En attente"
                          : order.etat_text?.split(",")[0] || "En attente"}
                      </Badge>
                    </div>

                    {/* Informations de la commande */}
                    <div className="order-details">
                      {/* Numéro de commande */}
                      <div className="detail-item mb-1">
                        <i className="fas fa-hashtag me-1 text-primary"></i>
                        <span className="detail-label">N° Commande:</span>
                        <span className="detail-value fw-bold text-success">
                          {order.id}
                        </span>
                      </div>

                      {/* Code de la commande */}
                      {order.code && (
                        <div className="detail-item mb-1">
                          <i className="fas fa-barcode me-1 text-primary"></i>
                          <span className="detail-label">Code:</span>
                          <span className="detail-value fw-bold text-success">
                            {order.code}
                          </span>
                        </div>
                      )}

                      {/* Designation Client Badge */}
                      <div className="detail-item mb-1">
                        <i className="fas fa-user me-1 text-primary"></i>
                        <span className="detail-label">Code client:</span>
                        <Badge
                          bg="light"
                          text="dark"
                          className="ms-2 border "
                          style={{ fontSize: "0.7rem" }}
                        >
                          <span className="text-truncate d-block text-center">
                            {order.client.COMPTE_0 || "Client non défini"}
                          </span>
                        </Badge>
                      </div>

                      {/* Programme et Campagne - Uniquement pour les commandes Programme */}
                      {activeFilter === "programme" && order.campagne && (
                        <div className="detail-item mb-1">
                          <i className="fas fa-calendar-check me-1 text-primary"></i>
                          <span className="detail-label">
                            Planning cyclique:
                          </span>
                          <span className="detail-value text-truncate">
                            {order.campagne.designation}
                          </span>
                        </div>
                      )}

                      {activeFilter === "programme" &&
                        order.campagne?.programme && (
                          <div className="detail-item mb-1">
                            <i className="fas fa-project-diagram me-1 text-success"></i>
                            <span className="detail-label">Programme:</span>
                            <span className="detail-value text-truncate">
                              {order.campagne.programme.designation}
                            </span>
                          </div>
                        )}

                      {/* Date de commande */}
                      <div className="detail-item mb-1">
                        <i className="fas fa-calendar me-1 text-info"></i>
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">
                          {formatDate(order.datecommande)}
                        </span>
                      </div>

                      {/* Date de livraison si disponible */}
                      {order.datereception && (
                        <div className="detail-item mb-1">
                          <i className="fas fa-truck me-1 text-warning"></i>
                          <span className="detail-label">Livraison:</span>
                          <span className="detail-value">
                            {formatDate(order.datereception)}
                          </span>
                        </div>
                      )}

                      {/* Nombre d'articles */}
                      <div className="detail-item">
                        <i className="fas fa-boxes me-1 text-danger"></i>
                        <span className="detail-label">Articles:</span>
                        <span className="detail-value fw-bold">
                          {order.detailcommandes?.length || 0} article(s)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Col>
            ))}
          </Row>

          {filteredCommandes.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                {" "}
                <FaBoxOpen className="me-2 text-4xl" />{" "}
              </div>
              <h5>Aucune commande trouvée</h5>
            </div>
          )}

          {/* Pagination du bas */}
          {filteredCommandes.length > 0 && (
            <PaginationComponent
              currentPage={page}
              totalPages={metadata.last_page}
              onPageChange={goToPage}
              perPage={count}
              onPerPageChange={changeCount}
              totalItems={metadata.total}
            />
          )}
        </>
      )}

      <style>
        {`
                .filter-tabs-container {
                    background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c8 100%);
                    padding: 2rem;
                    border-radius: 0;
                    margin: 0 -15px;
                    overflow-x: auto;
                }

                .filter-tabs {
                    display: flex;
                    justify-content: flex-start;
                    gap: 1rem;
                    max-width: 100%;
                    margin: 0 auto;
                    flex-wrap: nowrap;
                    min-width: min-content;
                }

                .filter-tab {
                    background: #ffffff;
                    border: 1px solid #d1d5db;
                    color: #6b7280;
                    padding: 12px 24px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    border-radius: 18px;
                    min-width: 150px;
                    text-align: center;
                    white-space: nowrap;
                    flex-shrink: 0;
                }

                .filter-tab:first-child {
                    border-radius: 18px;
                }

                .filter-tab:last-child {
                    border-radius: 18px;
                }

                .filter-tab:not(:first-child) {
                    border-radius: 18px;
                }

                .filter-tab:hover {
                    background: #f9fafb;
                    color: #374151;
                }

                .filter-tab.active {
                    background: #22c55e;
                    color: white;
                    border-color: #22c55e;
                    z-index: 1;
                    position: relative;
                }

                .results-header {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                    padding: 1rem 0;
                    border-bottom: 2px solid #f1f5f9;
                }

                .results-title {
                    margin: 0;
                    color: #1e293b;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                .results-count {
                    background: #22c55e;
                    color: white;
                    padding: 0.25rem 0.75rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    font-weight: 600;
                }

                .empty-state {
                    text-align: center;
                    padding: 4rem 2rem;
                    color: #6b7280;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                }

                .folder-icon {
                    cursor: pointer;
                    padding: 15px 10px;
                    border-radius: 12px;
                    transition: all 0.3s ease;
                    background-color: #ffffff;
                    border: 2px solid #e5e7eb;
                    height: 100%;
                    display: block;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                }

                .folder-icon:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(34, 197, 94, 0.15);
                    background-color: #f0fdf4;
                    border-color: #22c55e;
                }

                a:hover {
                    text-decoration: none !important;
                }

                .folder-image {
                    transition: transform 0.3s ease;
                    position: relative;
                }

                .folder-icon:hover .folder-image {
                    transform: scale(1.08);
                }

                .article-count-badge {
                    position: absolute;
                    top: -5px;
                    right: 20px;
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    font-size: 0.75rem;
                    font-weight: 700;
                    padding: 4px 10px;
                    border-radius: 20px;
                    box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
                    min-width: 24px;
                    text-align: center;
                }

                .folder-label {
                    text-align: left;
                    margin-top: 10px;
                }

                .client-header {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    font-weight: 600;
                    font-size: 0.85rem;
                    box-shadow: 0 2px 6px rgba(34, 197, 94, 0.2);
                }

                .client-name {
                    flex: 1;
                    font-size: 0.9rem;
                    font-weight: 600;
                    color: white;
                }

                .status-badge {
                    font-size: 0.65rem;
                    padding: 3px 8px;
                    border-radius: 10px;
                    white-space: nowrap;
                    font-weight: 600;
                }

                .order-details {
                    background: #f9fafb;
                    padding: 10px;
                    border-radius: 8px;
                    font-size: 0.75rem;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    color: #374151;
                }

                .detail-item i {
                    font-size: 0.85rem;
                    min-width: 16px;
                }

                .detail-label {
                    font-weight: 600;
                    color: #6b7280;
                    white-space: nowrap;
                }

                .detail-value {
                    color: #1f2937;
                    font-weight: 500;
                    flex: 1;
                }

                .badge {
                    font-size: 0.75rem;
                    padding: 3px 8px;
                    border-radius: 12px;
                }

                .bg-info {
                    background-color: #3b82f6 !important;
                }

                .bg-success {
                    background-color: #22c55e !important;
                }

                .bg-warning {
                    background-color: #f59e0b !important;
                }

                .bg-danger {
                    background-color: #ef4444 !important;
                }

                .bg-secondary {
                    background-color: #6b7280 !important;
                }
                
                /* Filtre de dates moderne */
                .modern-date-filter {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                }
                
                .filter-header {
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    padding: 1.25rem 1.5rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.3s ease;
                    border-bottom: 2px solid transparent;
                }
                
                .filter-header:hover {
                    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                    border-bottom-color: #22c55e;
                }
                
                .filter-header-content {
                    display: flex;
                    align-items: center;
                    gap: 1rem;
                }
                
                .filter-icon-wrapper {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }
                
                .filter-main-icon {
                    color: white;
                    font-size: 1.25rem;
                }
                
                .filter-header-text {
                    flex: 1;
                }
                
                .filter-title {
                    color: #1f2937;
                    font-weight: 700;
                    font-size: 1.1rem;
                    margin: 0;
                }
                
                .filter-subtitle {
                    color: #6b7280;
                    font-size: 0.875rem;
                    display: block;
                    margin-top: 0.25rem;
                }
                
                .filter-toggle {
                    background: white;
                    width: 36px;
                    height: 36px;
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #22c55e;
                    font-size: 0.9rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .filter-header:hover .filter-toggle {
                    transform: scale(1.1);
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
                }
                
                .icon-rotate-down {
                    transform: rotate(0deg);
                    transition: transform 0.3s ease;
                }
                
                .icon-rotate-up {
                    transform: rotate(180deg);
                    transition: transform 0.3s ease;
                }
                
                .filter-content {
                    padding: 1.5rem;
                    background: #fafafa;
                    animation: slideDown 0.3s ease-in-out;
                }
                
                .modern-input-group {
                    display: flex;
                    flex-direction: column;
                    gap: 0.5rem;
                }
                
                .modern-label {
                    color: #374151;
                    font-weight: 600;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    margin: 0;
                }
                
                .modern-label i {
                    color: #22c55e;
                }
                
                .modern-date-input {
                    border: 2px solid #e5e7eb;
                    border-radius: 8px;
                    padding: 0.75rem 1rem;
                    font-size: 0.95rem;
                    transition: all 0.3s ease;
                    background: white;
                    position: relative;
                }
                
                .modern-date-input::-webkit-calendar-picker-indicator {
                    cursor: pointer;
                    opacity: 1;
                    color: #22c55e;
                    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='%2322c55e' viewBox='0 0 16 16'%3E%3Cpath d='M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z'/%3E%3C/svg%3E");
                    width: 20px;
                    height: 20px;
                }
                
                .modern-date-input:focus {
                    border-color: #22c55e;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
                    outline: none;
                }
                
                .btn-reset-filter {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                }
                
                .btn-reset-filter:hover:not(:disabled) {
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                
                .btn-reset-filter:disabled {
                    background: #d1d5db;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                
                .active-filters-badge {
                    margin-top: 1rem;
                    padding: 0.75rem 1rem;
                    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                    border-left: 4px solid #22c55e;
                    border-radius: 8px;
                    color: #166534;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    animation: fadeIn 0.3s ease-in-out;
                }
                
                /* Styles pour la section unifiée */
                .modern-unified-filter {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                }
                
                .filter-section {
                    padding: 1.5rem;
                    background: #fafafa;
                }
                
                .filter-section:first-of-type {
                    border-bottom: 1px solid #e5e7eb;
                }
                
                .section-header {
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    margin-bottom: 1.25rem;
                    padding-bottom: 0.75rem;
                    border-bottom: 2px solid #22c55e;
                }
                
                .section-icon {
                    color: #22c55e;
                    font-size: 1.1rem;
                }
                
                .section-title {
                    color: #1f2937;
                    font-weight: 700;
                    font-size: 1rem;
                    margin: 0;
                }
                
                .filter-divider {
                    height: 2px;
                    background: linear-gradient(90deg, transparent 0%, #22c55e 50%, transparent 100%);
                    margin: 0;
                }
                
                .active-filters-summary {
                    padding: 1.25rem 1.5rem;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border-top: 2px solid #22c55e;
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 0.75rem;
                }
                
                .filter-tag {
                    background: white;
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    font-size: 0.875rem;
                    color: #166534;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
                    border: 1px solid #22c55e;
                }
                
                .filter-tag i {
                    color: #22c55e;
                }
                
                /* Badges de statut avec couleurs spécifiques */
                .status-tag-all, .status-tag- {
                    background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
                    border-color: #9ca3af;
                    color: #374151;
                }
                
                .status-tag-all i, .status-tag- i {
                    color: #6b7280;
                }
                
                .status-tag-1 {
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    border-color: #3b82f6;
                    color: #1e40af;
                }
                
                .status-tag-1 i {
                    color: #3b82f6;
                }
                
                .status-tag-2 {
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-color: #f59e0b;
                    color: #92400e;
                }
                
                .status-tag-2 i {
                    color: #f59e0b;
                }
                
                .status-tag-3 {
                    background: linear-gradient(135deg, #ddd6fe 0%, #c4b5fd 100%);
                    border-color: #8b5cf6;
                    color: #5b21b6;
                }
                
                .status-tag-3 i {
                    color: #8b5cf6;
                }
                
                .status-tag-4 {
                    background: linear-gradient(135deg, #fed7aa 0%, #fdba74 100%);
                    border-color: #f97316;
                    color: #9a3412;
                }
                
                .status-tag-4 i {
                    color: #f97316;
                }
                
                .status-tag-5 {
                    background: linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%);
                    border-color: #22c55e;
                    color: #166534;
                }
                
                .status-tag-5 i {
                    color: #22c55e;
                }
                
                .clear-all-filters-btn {
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    border: none;
                    padding: 0.5rem 1.25rem;
                    border-radius: 20px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-left: auto;
                }
                
                .clear-all-filters-btn:hover {
                    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
                }
                
                .btn-action-filter {
                    background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                    color: white;
                    border: none;
                    padding: 0.75rem 1rem;
                    border-radius: 8px;
                    font-weight: 600;
                    font-size: 0.875rem;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    width: 100%;
                }
                
                .btn-action-filter:hover:not(:disabled) {
                    background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(34, 197, 94, 0.3);
                }
                
                .btn-action-filter:disabled {
                    background: #d1d5db;
                    cursor: not-allowed;
                    opacity: 0.6;
                }
                
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }
                
                /* Messages informatifs */
                .info-message {
                    padding: 0.875rem 1rem;
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
                    border-left: 4px solid #3b82f6;
                    border-radius: 8px;
                    color: #1e40af;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: flex-start;
                    animation: fadeIn 0.3s ease-in-out;
                    line-height: 1.5;
                }
                
                .info-message i {
                    margin-top: 0.125rem;
                    font-size: 1rem;
                }
                
                .loading-message {
                    padding: 0.875rem 1rem;
                    background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
                    border-left: 4px solid #22c55e;
                    border-radius: 8px;
                    color: #166534;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    animation: fadeIn 0.3s ease-in-out;
                }
                
                .warning-message {
                    padding: 0.875rem 1rem;
                    background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
                    border-left: 4px solid #f59e0b;
                    border-radius: 8px;
                    color: #92400e;
                    font-size: 0.875rem;
                    display: flex;
                    align-items: center;
                    animation: fadeIn 0.3s ease-in-out;
                }
                
                .warning-message i {
                    font-size: 1rem;
                }
                
                /* Select désactivé */
                .modern-date-input:disabled {
                    background-color: #f3f4f6;
                    color: #9ca3af;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                @media (max-width: 768px) {
                    .filter-tabs-container {
                        padding: 1rem;
                        margin: 0 -15px;
                    }
                    
                    .filter-tabs {
                        flex-direction: column;
                        gap: 0;
                    }
                    
                    .filter-tab {
                        min-width: auto;
                        border-radius: 0 !important;
                    }
                    
                    .filter-tab:first-child {
                        border-top-left-radius: 8px !important;
                        border-top-right-radius: 8px !important;
                    }
                    
                    .filter-tab:last-child {
                        border-bottom-left-radius: 8px !important;
                        border-bottom-right-radius: 8px !important;
                    }
                    
                    .filter-tab:not(:first-child) {
                        border-left: 1px solid #d1d5db;
                        border-top: none;
                    }

                    .col-md-4 {
                        flex: 0 0 50%;
                        max-width: 50%;
                    }

                    .client-name {
                        font-size: 0.8rem;
                    }

                    .detail-item {
                        font-size: 0.7rem;
                    }
                }

                @media (max-width: 480px) {
                    .filter-tabs-container {
                        padding: 1rem;
                    }

                    .col-md-4 {
                        flex: 0 0 100%;
                        max-width: 100%;
                    }

                    .article-count-badge {
                        right: 10px;
                    }
                }
                `}
      </style>
    </Container>
  );
};

export default Orders;
