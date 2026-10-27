import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Modal, Button, Card, Badge, Alert, Form } from "react-bootstrap";
import {
  FaTrash,
  FaBox,
  FaCalendarAlt,
  FaPlusCircle,
  FaPlus,
  FaTimes,
  FaClipboardList,
  FaBarcode,
} from "react-icons/fa";
import { useAuthContext } from "../../hooks/useUserhook";
import { useNotification } from "../../hooks/useNotification";
import { Programme } from "../../types/Campagne.types";
import SmallHeader from "../../components/const/SmallHeader";
import InfoDisplay from "../../components/InfoDisplay";
import SelectDisplay from "../../components/SelectDisplay";
import { createItem } from "../../api/crudService";
import back_icon from "../../assets/images/back.png";
import ClientSelect from "../../components/ClientSelect";
import { toast } from "react-toastify";
import CommentInput from "../../components/ui/CommentInput";
import OrderAddingModal from "../../components/ui/OrderAddingModal";
import { extractApiErrorMessage } from "../../utils/extractApiErrorMessage";

// Interface for Article (Product)
interface Article {
  id: number;
  designation: string;
  code: string;
  description?: string;
  image?: string;
  prix?: number;
  quantite?: number;
  quantite_commande?: number;
  prix_commande?: number;
  unite?: { id: number; designation: string };
}

// Interface pour les lignes de commande
interface ArticlesCampagnes {
  id: number;
  quantite: number;
  prix: number;
  article: Article;
}

// Interface pour les campagnes
interface Campagne {
  id: number;
  articlescampagnes: ArticlesCampagnes[];
}

// Interface for Enhanced Programme with UI properties
interface EnhancedProgramme extends Programme {
  planningCyclique: string;
  color: string;
}

export default function Commande() {
  const navigate = useNavigate();
  const [selectedProgramme, setSelectedProgramme] =
    useState<EnhancedProgramme | null>(null);
  const { user } = useAuthContext();
  const [commande, setCommande] = useState({
    client: user?.name || "Client Demo",
    client_id: (user?.client_id as number | null) || null,
    typelivraison: "Cyclique",
    planningCyclique: "",
    lignecommandes: [] as any[],
    commentaire: "",
  });
  const {} = useNotification();

  useEffect(() => {
    if (!user?.client_id) return;
    setCommande((prev) =>
      prev.client_id === null ? { ...prev, client_id: user.client_id } : prev,
    );
  }, [user]);

  const [showModal, setShowModal] = useState(false);
  const [produitForm, setProduitForm] = useState<any>({
    produit_id: null,
    produit: "",
    code: "",
    unite: "",
    qte_debut: 0,
    qte_recue: 0,
    qte_distribuee: 0,
    qte_perdue: 0,
    ajustement: 0,
    qte_fin: 0,
    lignesLot: [] as any[],
    cmm: 0,
    stock_max: 0,
    qte_commander_l: 0,
    qte_commandee: 0,
    nb_jour_rupture: 0,
    msd: 0,
    qte_transferes: 0,
    qte_dfs: 0,
  });

  // State for data fetching
  const [programmes, setProgrammes] = useState<Programme[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState({
    programmes: false,
    articles: false,
  });
  const [error, setError] = useState({
    programmes: "",
    articles: "",
  });
  const [plannings, setPlannings] = useState<any[]>([]);
  const [selectedPlanning, setSelectedPlanning] = useState<string | null>(null);

  // États pour le modal d'ajout de commande
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderStatus, setOrderStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [orderError, setOrderError] = useState("");

  // États pour la gestion des lots (comme VueGlobale)
  const [showLotModal, setShowLotModal] = useState(false);
  const [selectedLots, setSelectedLots] = useState<any[]>([]);
  const [selectedProductName, setSelectedProductName] = useState("");
  const [selectedProductIndex, setSelectedProductIndex] = useState<
    number | null
  >(null);

  // Fetch programmes from API using useEffect
  useEffect(() => {
    setLoading((prev) => ({ ...prev, programmes: true }));

    // fetch(`https://backsignup.h-tsoft.com/graphql?query={programmes{id,designation,objectif}}`)
    fetch(
      `https://backsignup.h-tsoft.com/graphql?query={programmes(client_id: ${user?.client_id || 0}){id,designation,objectif}}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Raw programmes API response:", data);
        if (data?.data?.programmes) {
          console.log("Programmes data structure:", data.data.programmes);
          // Ensure IDs are numbers for consistency
          const processedProgrammes = data.data.programmes.map((p: any) => ({
            ...p,
            id: Number(p.id), // Ensure ID is a number
          }));
          setProgrammes(processedProgrammes);
          setError((prev) => ({ ...prev, programmes: "" }));
        } else {
          setError((prev) => ({
            ...prev,
            programmes: "Aucun programme trouvé",
          }));
        }
      })
      .catch((err) => {
        console.error("Erreur lors du chargement des programmes:", err);
        setError((prev) => ({
          ...prev,
          programmes: "Erreur lors du chargement des programmes",
        }));
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, programmes: false }));
      });
  }, []);

  // Map to add planning cyclique and color for UI purposes
  const enhancedProgrammes = programmes.map(
    (prog: Programme): EnhancedProgramme => {
      const planningMap: { [key: number]: string } = {
        1: "FIARANTSOA T1",
        2: "ANTANANARIVO T1",
        3: "FIARANTSOA T2",
      };
      const colorMap: { [key: number]: string } = {
        1: "primary",
        2: "success",
        3: "warning",
      };

      return {
        ...prog,
        planningCyclique: planningMap[prog.id] || `PLANNING ${prog.id}`,
        color: colorMap[prog.id] || "secondary",
      };
    },
  );

  console.log("Programmes fetched:", enhancedProgrammes);
  console.log("Articles fetched:", articles);

  // Choix programme
  const handleProgrammeChange = (id: number) => {
    console.log("Programme selected, id:", id);
    console.log("Available programmes:", enhancedProgrammes);

    const numId = Number(id);
    const programme = enhancedProgrammes.find((p) => Number(p.id) === numId);

    if (programme) {
      setSelectedProgramme(programme);
      setCommande((prev) => ({
        ...prev,
        planningCyclique: programme.planningCyclique || "",
      }));

      // Fetch plannings cycliques for the selected programme
      // fetch(`https://backsignup.h-tsoft.com/graphql?query={campagnes(programme_id:${numId},){id,date,designation,statut}}`)

      fetch(
        `https://backsignup.h-tsoft.com/graphql?query={campagnes(programme_id:${numId},client_id:${user?.client_id || 0}){id,date,designation,statut}}`,
      )
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          if (data?.data?.campagnes && data.data.campagnes.length > 0) {
            setPlannings(data.data.campagnes);
            const firstPlanningId = data.data.campagnes[0]?.id;
            setSelectedPlanning(firstPlanningId || null); // Default to the first planning

            // Si un planning est automatiquement sélectionné, récupérer ses articles
            if (firstPlanningId) {
              // Récupérer les articles du premier planning
              setLoading((prev) => ({ ...prev, articles: true }));
              fetch(
                `https://backsignup.h-tsoft.com/graphql?query={campagnes(id:${firstPlanningId}){id,articlescampagnes{id,quantite,article{id,designation,quantite,description,code,unite{id,designation},image,prix}}}}`,
              )
                .then((response) => {
                  if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                  }
                  return response.json();
                })
                .then((articlesData) => {
                  console.log(
                    "Articles du planning récupérés automatiquement:",
                    articlesData,
                  );
                  if (
                    articlesData?.data?.campagnes &&
                    articlesData.data.campagnes.length > 0
                  ) {
                    const campagne = articlesData.data.campagnes[0] as Campagne;
                    if (
                      campagne.articlescampagnes &&
                      campagne.articlescampagnes.length > 0
                    ) {
                      // Extraire et transformer les articles des lignes de commande
                      const campagneArticles = campagne.articlescampagnes
                        .filter((ligne: ArticlesCampagnes) => ligne.article)
                        .map((ligne: ArticlesCampagnes) => ({
                          ...ligne.article,
                          quantite_commande: ligne.quantite || 0,
                          prix_commande: ligne.prix || 0,
                        }));

                      setArticles(campagneArticles);
                      setError((prev) => ({ ...prev, articles: "" }));

                      // Mettre à jour le planning cyclique dans la commande
                      setCommande((prev) => ({
                        ...prev,
                        planningCyclique:
                          data.data.campagnes[0]?.designation ||
                          programme.planningCyclique ||
                          "",
                      }));

                      // NOUVELLE FONCTIONNALITÉ: Ajouter automatiquement les articles au tableau de commande
                      // Créer des détails de commande à partir des articles récupérés
                      const detailsCommande = campagneArticles.map(
                        (article) => ({
                          id: Date.now() + Math.floor(Math.random() * 1000), // ID unique
                          produit_id: article.id,
                          produit: article.designation,
                          code:
                            article.code ||
                            `P-${article.id.toString().padStart(3, "0")}`,
                          unite: article.unite?.designation || "",
                          qte_debut: 0,
                          qte_recue: 0,
                          qte_distribuee: 0,
                          qte_perdue: 0,
                          ajustement: 0,
                          qte_fin: 0,
                          lignesLot: [
                            // { id: Date.now(), lot: "001", date_peremption: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], quantite: 0 },
                          ],
                          cmm: 0,
                          stock_max: 0,
                          qte_commander_l: 0,
                          qte_commandee: article.quantite_commande || 0,
                          nb_jour_rupture: 0,
                          msd: 0,
                          qte_transferes: 0,
                          qte_dfs: 0,
                          prix: article.prix_commande || article.prix || 0,
                        }),
                      );

                      // Ajouter les articles au tableau de commande
                      setCommande((prev) => ({
                        ...prev,
                        lignecommandes: detailsCommande,
                      }));
                    } else {
                      setError((prev) => ({
                        ...prev,
                        articles: "Aucun article trouvé dans ce planning",
                      }));
                    }
                  } else {
                    setError((prev) => ({
                      ...prev,
                      articles: "Planning sans articles",
                    }));
                  }
                })
                .catch((err) => {
                  console.error(
                    "Erreur lors du chargement automatique des articles du planning:",
                    err,
                  );
                  setError((prev) => ({
                    ...prev,
                    articles: "Erreur lors du chargement des articles",
                  }));
                })
                .finally(() => {
                  setLoading((prev) => ({ ...prev, articles: false }));
                });
            }
          } else {
            setPlannings([]);
            setSelectedPlanning(null);
          }
        })
        .catch((err) => {
          console.error(
            "Erreur lors du chargement des plannings cycliques:",
            err,
          );
          setPlannings([]);
          setSelectedPlanning(null);
        });
    } else {
      console.error("Programme not found for id:", id);
    }
  };

  const handlePlanningChange = (planningId: string) => {
    setSelectedPlanning(planningId);
    setCommande((prev) => ({
      ...prev,
      planningCyclique:
        plannings.find((p) => p.id === planningId)?.designation || "",
    }));

    // Récupérer les articles associés au planning sélectionné
    setLoading((prev) => ({ ...prev, articles: true }));

    fetch(
      `https://backsignup.h-tsoft.com/graphql?query={campagnes(id:${planningId}){id,articlescampagnes{id,quantite,article{id,designation,quantite,description,code,image,prix,unite{id,designation}}}}}`,
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Articles du planning récupérés:", data);
        if (data?.data?.campagnes && data?.data?.campagnes?.length > 0) {
          const campagne = data.data.campagnes[0] as Campagne;
          if (
            campagne.articlescampagnes &&
            campagne.articlescampagnes.length > 0
          ) {
            // Extraire et transformer les articles des lignes de commande
            const campagneArticles = campagne.articlescampagnes
              .filter((ligne: ArticlesCampagnes) => ligne.article) // Filtrer les lignes sans article
              .map((ligne: ArticlesCampagnes) => ({
                ...ligne.article,
                quantite_commande: ligne.quantite || 0,
                prix_commande: ligne.prix || 0,
              }));

            setArticles(campagneArticles);
            setError((prev) => ({ ...prev, articles: "" }));

            // NOUVELLE FONCTIONNALITÉ: Ajouter automatiquement les articles au tableau de commande
            // Créer des détails de commande à partir des articles récupérés
            const detailsCommande = campagneArticles.map((article) => ({
              id: Date.now() + Math.floor(Math.random() * 1000), // ID unique
              produit_id: article.id,
              produit: article.designation,
              code:
                article.code || `P-${article.id.toString().padStart(3, "0")}`,
              unite: article.quantite
                ? "Unité"
                : Math.random() > 0.5
                  ? "Carton"
                  : "Boîte",
              qte_debut: 0,
              qte_recue: 0,
              qte_distribuee: 0,
              qte_perdue: 0,
              ajustement: 0,
              qte_fin: 0,
              lignesLot: [
                {
                  id: Date.now(),
                  lot: "001",
                  date_peremption: new Date(
                    Date.now() + 30 * 24 * 60 * 60 * 1000,
                  )
                    .toISOString()
                    .split("T")[0],
                  quantite: 0,
                },
              ],
              cmm: 0,
              stock_max: 0,
              qte_commander_l: 0,
              qte_commandee: article.quantite_commande || 0,
              nb_jour_rupture: 0,
              msd: 0,
              qte_transferes: 0,
              qte_dfs: 0,
              prix: article.prix_commande || article.prix || 0,
            }));

            // Remplacer les articles du tableau de commande avec les nouveaux articles
            setCommande((prev) => ({
              ...prev,
              lignecommandes: detailsCommande,
            }));
          } else {
            setError((prev) => ({
              ...prev,
              articles: "Aucun article trouvé dans ce planning",
            }));
            // Vider le tableau de commande si aucun article
            setCommande((prev) => ({
              ...prev,
              lignecommandes: [],
            }));
          }
        } else {
          setError((prev) => ({ ...prev, articles: "Planning sans articles" }));
          // Vider le tableau de commande si planning sans articles
          setCommande((prev) => ({
            ...prev,
            lignecommandes: [],
          }));
        }
      })
      .catch((err) => {
        console.error(
          "Erreur lors du chargement des articles du planning:",
          err,
        );
        setError((prev) => ({
          ...prev,
          articles: "Erreur lors du chargement des articles",
        }));
      })
      .finally(() => {
        setLoading((prev) => ({ ...prev, articles: false }));
      });
  };

  // Choix produit dans modal
  const handleProduitChange = (id: number) => {
    const article = articles.find((p: Article) => p.id === id);
    if (!article) return;

    const finalPrice = article.prix || 0;

    let unite = "Pièce";
    if (article?.unite?.designation) {
      unite = article.unite.designation;
    } else if (article?.quantite) {
      unite = "Unité";
    } else {
      unite = Math.random() > 0.5 ? "Boîte" : "Pièce";
    }

    setProduitForm((prev: any) => ({
      ...prev,
      produit_id: article?.id,
      produit: article?.designation,
      code: article?.code || `P-${article?.id.toString().padStart(3, "0")}`,
      unite,
      prix: finalPrice,
      // Si l'article vient d'un planning, initialiser les champs avec les données du planning
      ...(article?.quantite_commande
        ? {
            qte_commandee: article.quantite_commande,
          }
        : {}),
      ...(article?.prix_commande
        ? {
            prix: finalPrice, // On privilégie le prix récupéré si possible
          }
        : {}),
    }));
  };

  // Ajouter une ligne Lot
  const handleAddLotLine = () => {
    setProduitForm((prev: any) => {
      const newLignes = [
        ...prev.lignesLot,
        { id: Date.now(), lot: "", date_peremption: "", quantite: 0 },
      ];
      const total = newLignes.reduce(
        (sum: number, l: any) => sum + Number(l.quantite || 0),
        0,
      );
      return { ...prev, lignesLot: newLignes, qte_fin: total };
    });
  };

  // Modifier une ligne Lot
  const handleLotChange = (id: number, field: string, value: any) => {
    setProduitForm((prev: any) => {
      const newLignes = prev.lignesLot.map((l: any) =>
        l.id === id
          ? { ...l, [field]: field === "quantite" ? Number(value) : value }
          : l,
      );
      const total = newLignes.reduce(
        (sum: number, l: any) => sum + Number(l.quantite || 0),
        0,
      );
      return { ...prev, lignesLot: newLignes, qte_fin: total };
    });
  };

  // Supprimer une ligne Lot
  const handleDeleteLotLine = (id: number) => {
    setProduitForm((prev: any) => {
      const newLignes = prev.lignesLot.filter((l: any) => l.id !== id);
      const total = newLignes.reduce(
        (sum: number, l: any) => sum + Number(l.quantite || 0),
        0,
      );
      return { ...prev, lignesLot: newLignes, qte_fin: total };
    });
  };

  // Fonctions pour gérer les lots (comme VueGlobale)
  const handleShowLotDetails = (
    lots: any[],
    productName: string,
    productIndex?: number,
  ) => {
    setSelectedLots([...lots]); // Copie pour éviter les mutations
    setSelectedProductName(productName);
    setSelectedProductIndex(productIndex ?? null);
    setShowLotModal(true);
  };

  const handleCloseLotModal = () => {
    setShowLotModal(false);
    setSelectedLots([]);
    setSelectedProductName("");
    setSelectedProductIndex(null);
  };

  const removeProduct = (idx: number) => {
    const updated = [...commande.lignecommandes];
    updated.splice(idx, 1);
    setCommande({ ...commande, lignecommandes: updated });
    toast.success("Produit supprimé !");
  };

  const handleSaveLotChanges = () => {
    if (selectedProductIndex !== null) {
      setCommande((prev) => {
        const updatedLigneCommandes = [...prev.lignecommandes];
        updatedLigneCommandes[selectedProductIndex].lignesLot = selectedLots;
        // Recalculer qte_fin basé sur les lots
        // const totalQuantity = selectedLots.reduce((sum: number, lot: any) => sum + (Number(lot.quantite) || 0), 0);
        // updatedLigneCommandes[selectedProductIndex].qte_fin = totalQuantity;
        return { ...prev, lignecommandes: updatedLigneCommandes };
      });
    }
    handleCloseLotModal();
  };

  const handleUpdateLot = (lotIndex: number, field: string, value: any) => {
    const updatedLots = [...selectedLots];
    updatedLots[lotIndex] = { ...updatedLots[lotIndex], [field]: value };
    setSelectedLots(updatedLots);
  };

  const handleAddLot = () => {
    const newLot = {
      id: Date.now(),
      lot: "",
      quantite: 0,
      date_peremption: "",
    };
    setSelectedLots([...selectedLots, newLot]);
  };

  const handleRemoveLot = (lotIndex: number) => {
    const updatedLots = selectedLots.filter((_, index) => index !== lotIndex);
    setSelectedLots(updatedLots);
  };

  // Ajouter produit
  const [editingProductId, setEditingProductId] = useState<number | null>(null);

  const handleAddProduit = () => {
    if (!produitForm.produit_id) {
      return;
    }

    setCommande((prev) => {
      const updatedlignecommandes = editingProductId
        ? prev.lignecommandes.map((p) =>
            p.id === editingProductId
              ? { ...produitForm, id: editingProductId }
              : p,
          ) // Update the existing product
        : [...prev.lignecommandes, { ...produitForm, id: Date.now() }]; // Add a new product

      return {
        ...prev,
        lignecommandes: updatedlignecommandes,
      };
    });

    setShowModal(false); // Close the modal
    setEditingProductId(null); // Reset the editing product ID
    setProduitForm({
      produit_id: null,
      produit: "",
      code: "",
      unite: "",
      qte_debut: 0,
      qte_recue: 0,
      qte_distribuee: 0,
      qte_perdue: 0,
      ajustement: 0,
      qte_fin: 0,
      lignesLot: [],
      cmm: 0,
      stock_max: 0,
      qte_commander_l: 0,
      qte_commandee: 0,
      nb_jour_rupture: 0,
      msd: 0,
      qte_transferes: 0,
      qte_dfs: 0,
    });
  };

  // Supprimer produit
  // const handleDeleteProduit = (id: number) => {
  //   setCommande((prev) => ({
  //     ...prev,
  //     lignecommandes: prev.lignecommandes.filter((p) => p.id !== id),
  //   }));
  // };

  // Modifier produit
  // const handleEditProduit = (prod: any) => {
  //   setProduitForm(prod); // Populate the form with the product data
  //   setEditingProductId(prod.id); // Store the ID of the product being edited
  //   setShowModal(true); // Show the modal
  // };

  // Fonction pour calculer automatiquement toutes les valeurs dérivées
  const calculateDerivedValues = (prod: any) => {
    const D = Number(prod.qte_debut || 0);
    const E = Number(prod.qte_recue || 0);
    const F = Number(prod.qte_distribuee || 0);
    const G = Number(prod.qte_perdue || 0);
    const H = Number(prod.ajustement || 0);
    const O = Number(prod.prix || 0);

    // I (Quantités restantes en fin de trimestre) = (D + E) - (F + G + H)
    const I = D + E - (F + G + H);

    // K (CMM ajustée) = ((F * 30) / 90) - J
    const K = Number(prod.cmm || 0);

    // L (Stock Maximum) = K * 3(le coefficient de sécurité est de 3 si il n est pas spécifié dans user)
    const L = K * 3;

    // M (Quantité à commander) = L - I (ne peut pas être négative)
    const M = Math.max(0, L - I);

    // N (Quantité commandée arrondie au conditionnement)
    const N = M > 0 ? Math.ceil(M) : 0;

    // P (Montant) = N * O
    const P = N * O;

    return {
      qte_fin: I,
      stock_max: L,
      qte_commander_l: M,
      qte_commandee: N,
      montant: P,
    };
  };

  // Mettre à jour un champ d'un produit directement dans le tableau
  const updateProductField = (id: number, field: string, value: any) => {
    setCommande((prev) => ({
      ...prev,
      lignecommandes: prev.lignecommandes.map((prod) => {
        if (prod.id === id) {
          // Mettre à jour le champ modifié
          const updatedProd = { ...prod, [field]: value };

          // Recalculer les valeurs dérivées
          const derivedValues = calculateDerivedValues(updatedProd);

          // Si le champ modifié est qte_commander_l, ne pas écraser avec la valeur calculée
          if (field === "qte_commander_l") {
            return {
              ...updatedProd,
              ...derivedValues,
              qte_commander_l: value,
              qte_commandee: value > 0 ? Math.ceil(value) : 0,
            };
          }

          // Retourner le produit avec toutes les valeurs mises à jour
          return { ...updatedProd, ...derivedValues };
        }
        return prod;
      }),
    }));
  };

  // Valider commande
  const handleValider = async () => {
    try {
      console.log("Début de la validation de la commande...");
      console.log("Données de la commande avant envoi :", commande);

      // Si client_id n'est pas choisi, utiliser celui du user (sauf si admin doit choisir explicitement)
      let clientIdToUse = commande.client_id;
      if (!clientIdToUse && user?.client_id) {
        clientIdToUse = user.client_id;
      }

      if (!clientIdToUse) {
        toast.error(
          "Veuillez sélectionner un client avant de valider la commande",
        );
        return;
      }

      const payload = {
        // datecommande: new Date().toISOString().split("T")[0], // Date actuelle
        client_id: clientIdToUse,
        user_id: user?.id, // ID de l'utilisateur
        programme_id: selectedProgramme?.id || 0, // ID du programme sélectionné
        campagne_id: selectedPlanning || 0, // ID de la campagne sélectionnée
        typecommande_id: 1, // ID du type de commande (exemple : Programme)
        commentaire: commande.commentaire || undefined,
        detailcommandes: commande.lignecommandes.map((detail) => ({
          article_id: detail.produit_id,
          qte_debut: detail.qte_debut,
          qte_recue: detail.qte_recue,
          qte_distribuee: detail.qte_distribuee,
          qte_perdue: detail.qte_perdue,
          ajustement: detail.ajustement,
          qte_fin: detail.qte_fin,
          cmm: detail.cmm,
          stock_max: detail.stock_max,
          quantite: detail.qte_commandee, // Quantité à commander
          qte_commandee: detail.qte_commandee,
          nb_jour_rupture: detail.nb_jour_rupture,
          msd: detail.msd,
          qte_transferes: detail.qte_transferes,
          qte_dfs: detail.qte_dfs,
          pv_ht: detail.prix,
          lignesLot: detail.lignesLot.map(
            (lot: {
              lot: string;
              date_peremption: string;
              quantite: number;
            }) => ({
              lot: lot.lot,
              dateperemption: lot.date_peremption,
              quantite: lot.quantite,
            }),
          ),
        })),
      };

      console.log("Payload préparé pour l'envoi :", payload);

      // Afficher le modal de chargement
      setShowOrderModal(true);
      setOrderStatus("loading");
      setOrderError("");

      // Utilisation du service createItem pour envoyer la commande
      const response = await createItem("commande", payload);

      console.log("Réponse de l'API :", response);

      if (response.status !== 200 && response.status !== 201) {
        console.error(
          "Erreur HTTP lors de l'envoi de la commande :",
          response.status,
          response.statusText,
        );
        throw new Error(
          `Erreur lors de l'envoi de la commande : ${response.statusText}`,
        );
      }

      console.log("Commande envoyée avec succès !");
      setOrderStatus("success");

      // La redirection est gérée par le modal
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement ou de l'envoi de la commande :",
        error,
      );
      const details = extractApiErrorMessage(error);
      setOrderStatus("error");
      setOrderError(
        "Une erreur s'est produite lors de l'enregistrement ou de l'envoi de la commande." +
          (details ? ` Détails : ${details}` : ""),
      );
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: "90vw" }}>
      <div className="greenSadow">
        <SmallHeader />
      </div>

      <div
        className="mb-4 align-items-center"
        style={{
          position: "relative",
          zIndex: 3,
          textAlign: "center",
          marginTop: "-110px",
        }}
      >
        <div className="d-flex justify-content-center text-white mb-3">
          <div className="bg-white w-40 rounded-2 shadow-sm">
            <h4
              className="m-0 p-2 text-theme text-center m-2"
              style={{ fontWeight: "600", fontSize: "18px" }}
            >
              COMMANDE PROGRAMME - Gestion des commandes de programmes
            </h4>
          </div>
        </div>
      </div>
      <div
        style={{ marginBottom: "50px", fontSize: "1rem", fontWeight: "600" }}
      ></div>
      <button
        className="btn bg-theme my-2 rounded-2 border-none px-2 py-2 mb-4"
        onClick={() => {
          navigate(`/listeType`);
        }}
      >
        <img src={back_icon} className="icon-size w-75" alt="" />
      </button>

      {/* Informations générales */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-4">
          <div
            className="mb-4 mt-2 "
            style={{
              backgroundColor: "white",
              borderRadius: "8px",
              padding: "15px",
            }}
          >
            <div className="d-flex  mb-4 gap-3">
              <div>
                {!user?.client_id ? (
                  <ClientSelect
                    value={commande.client_id}
                    user_id={user?.id || 0}
                    placeholder="Choisissez un client pour récupérer les articles"
                    onChange={(clientId) =>
                      setCommande((prev) => ({ ...prev, client_id: clientId }))
                    }
                    onLoadError={(message) =>
                      toast.error(
                        `Erreur lors de la récupération des clients: ${message}`,
                      )
                    }
                  />
                ) : (
                  <InfoDisplay
                    label="Client"
                    value={user?.name || "Non connecté"}
                    isEnabled={false}
                    inputStyle={{ backgroundColor: "#F6F6F6" }}
                    labelStyle={{ color: "#CBCBCB" }}
                    width={"100%"}
                  />
                )}
              </div>

              <InfoDisplay
                label="Type livraison"
                value={commande.typelivraison}
                isEnabled={false}
                width={"100%"}
                inputStyle={{ backgroundColor: "#F6F6F6" }}
                labelStyle={{ color: "#CBCBCB" }}
              />
              <div className="mb-3 col-md-8">
                {loading.programmes ? (
                  <div className="text-center py-3">
                    <output className="spinner-border text-primary">
                      <span className="visually-hidden">Chargement...</span>
                    </output>
                    <p className="mt-2 text-muted">
                      Chargement des programmes...
                    </p>
                  </div>
                ) : error.programmes ? (
                  <Alert variant="danger" className="my-2">
                    {error.programmes}
                  </Alert>
                ) : (
                  <SelectDisplay
                    label="Programme"
                    optionname="un programme"
                    options={enhancedProgrammes.map((p: EnhancedProgramme) => ({
                      value: p.id.toString(),
                      label: p.designation,
                    }))}
                    selectedValue={selectedProgramme?.id?.toString() || ""}
                    onChange={(value) => handleProgrammeChange(Number(value))}
                  />
                )}
              </div>
            </div>

            {selectedProgramme && (
              <Alert variant="info" className="border-0 shadow-sm">
                <div className="d-flex align-items-center">
                  <FaCalendarAlt className="me-2" />
                  <div className="w-100">
                    <strong className="d-block">Planning cyclique :</strong>
                    {plannings.length > 0 ? (
                      <div className="mt-1">
                        <select
                          className="fs-6 mt-1 border-0 text-white fw-bold"
                          value={selectedPlanning || ""}
                          onChange={(e) => handlePlanningChange(e.target.value)}
                          style={{
                            maxWidth: "250px",
                            backgroundColor: "#0d6efd",
                            padding: "0.35em 0.65em",
                            borderRadius: "0.375rem",
                            textAlign: "center",
                            cursor: "pointer",
                            appearance: "none",
                            WebkitAppearance: "none",
                            MozAppearance: "none",
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23ffffff' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 0.5rem center",
                            backgroundSize: "16px 12px",
                            paddingRight: "2rem",
                          }}
                        >
                          {plannings.map((planning) => (
                            <option
                              key={planning.id}
                              value={planning.id}
                              style={{
                                color: "#212529",
                                backgroundColor: "#fff",
                              }}
                            >
                              {planning.designation}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <Badge bg="primary" className="fs-6 mt-1">
                        {selectedProgramme.planningCyclique}
                      </Badge>
                    )}
                    <div className="mt-2 text-muted small">
                      Désignation: {selectedProgramme.designation}
                    </div>
                  </div>
                </div>
              </Alert>
            )}
          </div>
        </Card.Body>
      </Card>

      {/* Section Produits */}
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-0 py-3">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="m-0 text-dark fw-bold">
              Produits de la commande → ({commande.lignecommandes.length})
            </h5>
            {/* <Button 
              variant="success" 
              onClick={() => setShowModal(true)}
              className="d-flex align-items-center gap-2 p-2 px-3"
            >
              <FaPlusCircle className="me-2" /> Ajouter un produit
            </Button> */}
          </div>
        </Card.Header>

        <Card.Body className="p-4">
          {/* Tableau produits avec scroll horizontal */}
          <div className="overflow-x-auto rounded-lg">
            <div style={{ overflowX: "auto" }}></div>
            <table
              className="w-full bg-white"
              style={{
                width: "6000px",
                border: "none",
                borderCollapse: "separate",
                borderSpacing: "0 12px",
              }}
            >
              <thead>
                <tr style={{ backgroundColor: "#1FB05B", color: "white" }}>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "left",
                      fontWeight: "600",
                      borderTopLeftRadius: "8px",
                      width: "400px",
                      borderBottomLeftRadius: "8px",
                    }}
                  >
                    Désignation, Forme et Dosage
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      width: "250px",
                      fontWeight: "600",
                    }}
                  >
                    Code
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      width: "250px",
                      fontWeight: "600",
                    }}
                  >
                    Unité
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantité à commander
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités disponibles en début du trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités reçues au cours du trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités distribuées aux clients au cours du trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités perdues au cours du trimestre (pertes)
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités transférées au cours du trimestre (ajustement)
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantités restantes en fin de trimestre
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantité disponible utilisable
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    LOT
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Nombre de jours de rupture de stock
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    CMM (Réelle pour les PhaG Dis, Ajusté pour les hopitaux )
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Stock Maximum
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      width: "350px",
                      textAlign: "center",
                      fontWeight: "600",
                    }}
                  >
                    Quantité commandée (arrondie au conditionnement)
                  </th>
                  {/* <th style={{ padding: "6px 8px",  width:"350px", textAlign: "center", fontWeight: "600" }}>Prix Unitaire par conditionnement (Ariary)</th> */}
                  {/* <th style={{
                  padding: "6px 8px",
                  textAlign: "center", 
                  width: "350px",
                  fontWeight: "600",
                  borderTopRightRadius: "8px",
                  borderBottomRightRadius: "8px",
                }}>Montant (Ariary)</th> */}
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      width: "350px",
                      fontWeight: "600",
                    }}
                  >
                    MSD
                  </th>
                  <th
                    style={{
                      padding: "6px 8px",
                      textAlign: "center",
                      width: "80px",
                      fontWeight: "600",
                      borderTopRightRadius: "8px",
                      borderBottomRightRadius: "8px",
                      position: "sticky",
                      right: 0,
                      backgroundColor: "#1FB05B",
                      zIndex: 10,
                      boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {commande.lignecommandes.length === 0 ? (
                  <tr>
                    <td
                      colSpan={20}
                      className="text-center py-4 text-muted bg-white"
                      style={{ borderRadius: "8px" }}
                    >
                      <div className="py-5">
                        <FaBox className="fs-1 mb-3 opacity-25" />
                        <div>Aucun produit ajouté</div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  commande.lignecommandes.map((prod, index) => (
                    <tr
                      key={prod.id}
                      style={{
                        backgroundColor: "#fff",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      {/* Désignation */}
                      <td style={{ padding: "12px", fontWeight: 600 }}>
                        {prod.produit}
                      </td>

                      {/* Code */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="light"
                          text="dark"
                          style={{ fontWeight: "normal" }}
                        >
                          {prod.code}
                        </Badge>
                      </td>

                      {/* Unité */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="secondary"
                          text="white"
                          style={{ fontWeight: "normal" }}
                        >
                          {prod.unite || "N/A"}
                        </Badge>
                      </td>

                      {/* Quantité à commander */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control fw-bold"
                          value={prod.qte_commander_l || 0}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_commander_l",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#fff3cd",
                            border: "1px solid #ffc107",
                            borderRadius: "6px",
                            color: "#856404",
                          }}
                        />
                      </td>

                      {/* Quantités disponibles en début du trimestre */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_debut}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_debut",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>

                      {/* Quantités reçues au cours du trimestre */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_recue}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_recue",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>

                      {/* Quantités distribuées aux clients au cours du trimestre */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_distribuee}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_distribuee",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>

                      {/* Quantités perdues au cours du trimestre (pertes) */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.qte_perdue}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "qte_perdue",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>

                      {/* Quantités transférées au cours du trimestre (ajustement) */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.ajustement}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "ajustement",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#F6F6F6",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>

                      {/* Quantités restantes en fin de trimestre */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="info"
                          className="px-3 py-2"
                          style={{ fontSize: "0.95rem", fontWeight: "600" }}
                        >
                          {prod.qte_fin?.toLocaleString("fr-FR") || 0}
                        </Badge>
                      </td>

                      {/* Quantité disponible utilisable */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="primary"
                          className="px-3 py-2"
                          style={{ fontSize: "0.95rem", fontWeight: "600" }}
                        >
                          {prod.lignesLot
                            ?.reduce(
                              (sum: number, lot: { quantite?: number }) =>
                                sum + (lot.quantite || 0),
                              0,
                            )
                            .toLocaleString("fr-FR") || 0}
                        </Badge>
                      </td>

                      {/* LOT */}
                      <td
                        style={{ padding: "12px", textAlign: "center" }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        {prod.lignesLot && prod.lignesLot.length > 0 ? (
                          <div>
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() =>
                                handleShowLotDetails(
                                  prod.lignesLot,
                                  prod.produit || "Produit",
                                  index,
                                )
                              }
                              className="mb-2"
                            >
                              <FaClipboardList className="me-1" />
                              {prod.lignesLot.length} lot(s)
                            </Button>
                            <div>
                              {prod.lignesLot.length > 3 && (
                                <Badge bg="info" className="mb-1">
                                  +{prod.lignesLot.length - 3} autres
                                </Badge>
                              )}
                            </div>
                          </div>
                        ) : (
                          <Button
                            variant="outline-success"
                            size="sm"
                            onClick={() =>
                              handleShowLotDetails(
                                [],
                                prod.produit || "Produit",
                                index,
                              )
                            }
                          >
                            <FaPlus className="me-1" />
                            Ajouter lots
                          </Button>
                        )}
                      </td>

                      {/* Nombre de jours de rupture de stock */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.nb_jour_rupture}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "nb_jour_rupture",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor:
                              prod.nb_jour_rupture > 0 ? "#ffeaea" : "#eaffea",
                            border: "1px solid #e0e0e0",
                            borderRadius: "6px",
                          }}
                        />
                      </td>

                      {/* CMM ajustée */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.cmm}
                          onChange={(e) =>
                            updateProductField(
                              prod.id,
                              "cmm",
                              Number(e.target.value),
                            )
                          }
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#e9ecef",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            color: "#495057",
                          }}
                        />
                      </td>

                      {/* Stock Maximum */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control"
                          value={prod.stock_max?.toFixed() || 0}
                          readOnly
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#e9ecef",
                            border: "1px solid #ced4da",
                            borderRadius: "6px",
                            cursor: "not-allowed",
                            color: "#495057",
                          }}
                        />
                      </td>

                      {/* Quantité commandée (arrondie au conditionnement) */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <input
                          type="number"
                          className="form-control fw-bold"
                          value={prod.qte_commandee || 0}
                          readOnly
                          style={{
                            width: "80%",
                            margin: "0 auto",
                            backgroundColor: "#d1e7dd",
                            border: "1px solid #198754",
                            borderRadius: "6px",
                            cursor: "not-allowed",
                            color: "#0f5132",
                          }}
                        />
                      </td>

                      {/* Prix Unitaire par conditionnement (Ariary) */}
                      {/* <td style={{ padding: "12px", textAlign: "center" }}>
                    <input 
                    type="number" 
                    className="form-control" 
                    value={prod.prix || 0} 
                    onChange={(e) => updateProductField(prod.id, "prix", Number(e.target.value))}
                    style={{
                      width: "70%", 
                      margin: "0 auto", 
                      backgroundColor: "#F6F6F6",
                      border: "1px solid #e0e0e0",
                      borderRadius: "6px"
                    }}
                    />
                  </td>
                   */}
                      {/* Montant (Ariary) */}
                      {/* <td style={{ padding: "12px", textAlign: "center" }}>
                    <Badge bg="success" className="px-3 py-2" style={{ fontSize: "0.95rem", fontWeight: "700" }}>
                      {((prod.montant || 0)).toLocaleString('fr-FR')} Ar
                    </Badge>
                  </td> */}
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <Badge
                          bg="warning"
                          className="px-3 py-2"
                          style={{ fontSize: "0.95rem", fontWeight: "600" }}
                        >
                          {prod.cmm > 0
                            ? (
                                prod.lignesLot?.reduce(
                                  (sum: number, lot: { quantite?: number }) =>
                                    sum + (lot.quantite || 0),
                                  0,
                                ) / prod.cmm
                              ).toFixed(2)
                            : "N/A"}
                        </Badge>
                      </td>

                      {/* Action - Remove Button */}
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          position: "sticky",
                          right: 0,
                          backgroundColor: "white",
                          zIndex: 5,
                          boxShadow: "-2px 0 4px rgba(0,0,0,0.05)",
                        }}
                      >
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => removeProduct(index)}
                          title="Supprimer ce produit"
                          style={{ borderRadius: "6px" }}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card.Body>

        {/* Section Commentaire */}
        <div className="px-4 pb-3">
          <CommentInput
            value={commande.commentaire}
            onChange={(value) =>
              setCommande((prev) => ({ ...prev, commentaire: value }))
            }
            placeholder="Ajouter un commentaire à votre commande..."
          />
        </div>

        <Card.Footer className="bg-white  border-0 py-3 justify-content-right">
          <div className="d-flex justify-content-right align-items-right">
            <Button
              variant="success"
              size="lg"
              onClick={handleValider}
              disabled={commande.lignecommandes.length === 0}
              className="px-4 d-flex align-items-center gap-2"
            >
              Valider la commande
            </Button>
          </div>
        </Card.Footer>
      </Card>

      {/* Modal ajout produit */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="xl"
        centered
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#1FB05B" }}
          className="text-white"
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaPlusCircle />
            Ajouter un produit
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <div className="row g-3">
            {/* Sélection produit */}
            <div className="col-md-6">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <label
                  htmlFor="produit-select"
                  className="form-label mb-0"
                  style={{ color: "#CBCBCB" }}
                >
                  Produit :
                </label>
                {selectedPlanning && (
                  <Badge bg="primary" className="py-1 px-2">
                    <FaCalendarAlt className="me-1" size={12} />
                    Filtrés par planning:{" "}
                    {
                      plannings.find((p) => p.id === selectedPlanning)
                        ?.designation
                    }
                  </Badge>
                )}
              </div>
              {loading.articles ? (
                <div className="text-center py-3">
                  <output className="spinner-border text-primary">
                    <span className="visually-hidden">Chargement...</span>
                  </output>
                  <p className="mt-2 text-muted">Chargement des produits...</p>
                </div>
              ) : error.articles ? (
                <Alert variant="danger" className="my-2">
                  {error.articles}
                </Alert>
              ) : (
                <select
                  id="produit-select"
                  className="form-select"
                  value={produitForm.produit_id || ""}
                  onChange={(e) => handleProduitChange(Number(e.target.value))}
                  style={{
                    backgroundColor: "#F6F6F6",
                    border: "1px solid #e0e0e0",
                    borderRadius: "6px",
                    padding: "10px 15px",
                    height: "auto",
                  }}
                >
                  <option value="">Sélectionner un produit</option>
                  {articles.map((p: Article) => (
                    <option key={p.id} value={p.id}>
                      {p.designation}{" "}
                      {p.quantite_commande
                        ? `(Qté: ${p.quantite_commande})`
                        : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="col-md-3">
              <label
                htmlFor="code-input"
                className="form-label"
                style={{ color: "#CBCBCB" }}
              >
                Code :
              </label>
              <input
                id="code-input"
                type="text"
                className="form-control"
                value={produitForm.code}
                disabled
                style={{
                  backgroundColor: "#F6F6F6",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  padding: "10px 15px",
                  height: "auto",
                }}
              />
            </div>

            <div className="col-md-3">
              <label
                htmlFor="unite-input"
                className="form-label"
                style={{ color: "#CBCBCB" }}
              >
                Unité :
              </label>
              <input
                id="unite-input"
                type="text"
                className="form-control"
                value={produitForm.unite}
                disabled
                style={{
                  backgroundColor: "#F6F6F6",
                  border: "1px solid #e0e0e0",
                  borderRadius: "6px",
                  padding: "10px 15px",
                  height: "auto",
                }}
              />
            </div>
          </div>

          {/* Gestion des lots */}
          <Card className="mt-4 border-0 shadow-sm">
            <Card.Header
              style={{ backgroundColor: "#F5F5F5", border: "none" }}
              className="py-3"
            >
              <h6 className="m-0 d-flex align-items-center gap-2 text-dark">
                <FaClipboardList className="text-success" /> Gestion des lots et
                péremptions
              </h6>
            </Card.Header>
            <Card.Body>
              <Button
                variant="success"
                onClick={handleAddLotLine}
                className="d-flex align-items-center gap-2 mb-3 py-2 px-3"
                style={{ borderRadius: "6px" }}
              >
                <FaPlusCircle />
                Ajouter une ligne de lot
              </Button>

              <div className="table-responsive">
                <table
                  className="table"
                  style={{ borderCollapse: "separate", borderSpacing: "0 8px" }}
                >
                  <thead style={{ backgroundColor: "#F5F5F5" }}>
                    <tr>
                      <th
                        style={{
                          padding: "10px 15px",
                          borderRadius: "6px 0 0 6px",
                        }}
                      >
                        Lot
                      </th>
                      <th style={{ padding: "10px 15px" }}>Date péremption</th>
                      <th style={{ padding: "10px 15px" }}>Quantité</th>
                      <th
                        style={{
                          padding: "10px 15px",
                          borderRadius: "0 6px 6px 0",
                          width: "100px",
                        }}
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {produitForm.lignesLot.map((l: any) => (
                      <tr
                        key={l.id}
                        style={{
                          backgroundColor: "#fff",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                        }}
                      >
                        <td style={{ padding: "8px" }}>
                          <input
                            type="text"
                            className="form-control"
                            value={l.lot}
                            onChange={(e) =>
                              handleLotChange(l.id, "lot", e.target.value)
                            }
                            placeholder="N° de lot"
                            style={{
                              backgroundColor: "#F6F6F6",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              padding: "8px 12px",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="date"
                            className="form-control"
                            value={l.date_peremption}
                            onChange={(e) =>
                              handleLotChange(
                                l.id,
                                "date_peremption",
                                e.target.value,
                              )
                            }
                            style={{
                              backgroundColor: "#F6F6F6",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              padding: "8px 12px",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px" }}>
                          <input
                            type="number"
                            className="form-control"
                            value={l.quantite}
                            onChange={(e) =>
                              handleLotChange(l.id, "quantite", e.target.value)
                            }
                            min="0"
                            style={{
                              backgroundColor: "#F6F6F6",
                              border: "1px solid #e0e0e0",
                              borderRadius: "6px",
                              padding: "8px 12px",
                            }}
                          />
                        </td>
                        <td style={{ padding: "8px", textAlign: "center" }}>
                          <Button
                            variant="outline-danger"
                            onClick={() => handleDeleteLotLine(l.id)}
                            className="d-flex align-items-center justify-content-center p-2 mx-auto"
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "6px",
                              border: "1px solid #e0e0e0",
                            }}
                          >
                            <FaTrash style={{ fontSize: "14px" }} />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <Alert variant="info" className="mt-3">
                <strong>Total quantité fin = </strong>
                <Badge bg="primary" className="fs-6 ms-2">
                  {produitForm.qte_fin}
                </Badge>
              </Alert>
            </Card.Body>
          </Card>

          {/* Champs quantités */}
          {/* <Card className="mt-4 border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="m-0">Informations de stock et commande</h6>
            </Card.Header>
            <Card.Body>
              <div className="row g-3">
                {[
                  { key: "qte_debut", label: "Qté début", color: "secondary" },
                  { key: "qte_recue", label: "Qté reçue", color: "info" },
                  { key: "qte_distribuee", label: "Qté distribuée", color: "success" },
                  { key: "qte_perdue", label: "Qté perdue", color: "danger" },
                  { key: "ajustement", label: "Ajustement", color: "warning" },
                  { key: "cmm", label: "CMM", color: "primary" },
                  { key: "stock_max", label: "Stock Max", color: "primary" },
                  { key: "qte_commander_l", label: "Qté à commander (L)", color: "warning" },
                  { key: "qte_commandee", label: "Qté commandée", color: "success" },
                  { key: "nb_jour_rupture", label: "Nb jours rupture", color: "danger" },
                  { key: "msd", label: "MSD", color: "info" },
                  { key: "qte_transferes", label: "Qté transférés", color: "secondary" },
                  { key: "qte_dfs", label: "Qté DFS", color: "secondary" },
                ].map((f) => (
                  <div className="col-md-4" key={f.key}>
                    <label className="form-label small fw-semibold">{f.label} :</label>
                    <input
                      type="number"
                      className="form-control"
                      value={produitForm[f.key]}
                      onChange={(e) =>
                        setProduitForm((prev: any) => ({ ...prev, [f.key]: Number(e.target.value) }))
                      }
                    />
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card> */}
        </Modal.Body>

        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4">
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            className="d-flex align-items-center gap-2"
            style={{ padding: "10px 20px", borderRadius: "6px" }}
          >
            Annuler
          </Button>
          <Button
            variant="success"
            onClick={handleAddProduit}
            className="d-flex align-items-center gap-2"
            style={{ padding: "10px 20px", borderRadius: "6px" }}
            disabled={!produitForm.produit_id}
          >
            <FaPlusCircle />
            Ajouter le produit
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal pour afficher les détails des lots (comme VueGlobale) */}
      <Modal
        show={showLotModal}
        onHide={handleCloseLotModal}
        size="lg"
        centered
      >
        <Modal.Header
          style={{
            backgroundColor: "#f8fdf9",
            borderBottom: "2px solid #1FB05B",
            padding: "20px 24px",
          }}
        >
          <div style={{ flex: 1 }}>
            <Modal.Title
              style={{
                color: "#1FB05B",
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              Gestion des lots
            </Modal.Title>
            <p
              style={{
                margin: 0,
                color: "#6b7280",
                fontSize: "0.875rem",
                fontWeight: "500",
              }}
            >
              {selectedProductName}
            </p>
          </div>
          <button
            onClick={handleCloseLotModal}
            style={{
              background: "none",
              border: "none",
              color: "#6b7280",
              cursor: "pointer",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "6px",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.color = "#374151";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
            }}
          >
            <FaTimes size={20} />
          </button>
        </Modal.Header>

        <Modal.Body style={{ padding: "24px" }}>
          {/* Résumé */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px",
              backgroundColor: "#f0fdf4",
              borderRadius: "8px",
              marginBottom: "20px",
              border: "1px solid #bbf7d0",
            }}
          >
            <div>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Nombre de lots
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1FB05B",
                }}
              >
                {selectedLots.length}
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ color: "#6b7280", fontSize: "0.875rem" }}>
                Quantité totale
              </span>
              <p
                style={{
                  margin: 0,
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1FB05B",
                }}
              >
                {selectedLots
                  .reduce((sum, lot) => sum + Number(lot.quantite || 0), 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>

          {/* Bouton d'ajout */}
          <button
            onClick={handleAddLot}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              padding: "12px",
              border: "2px dashed #1FB05B",
              borderRadius: "8px",
              backgroundColor: "#f8fdf9",
              color: "#1FB05B",
              fontSize: "0.875rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              marginBottom: "20px",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1FB05B";
              e.currentTarget.style.color = "white";
              e.currentTarget.style.borderStyle = "solid";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fdf9";
              e.currentTarget.style.color = "#1FB05B";
              e.currentTarget.style.borderStyle = "dashed";
            }}
          >
            <FaPlus size={16} />
            <span>Ajouter un nouveau lot</span>
          </button>

          {/* Liste des lots */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              maxHeight: "400px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {selectedLots.length > 0 ? (
              selectedLots.map((lot: any, index: number) => (
                <div
                  key={lot.id || index}
                  style={{
                    position: "relative",
                    padding: "16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "10px",
                    backgroundColor: "white",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1FB05B";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(31,176,91,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.boxShadow =
                      "0 1px 3px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "12px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "700",
                        color: "#1FB05B",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        backgroundColor: "#f0fdf4",
                        padding: "4px 12px",
                        borderRadius: "12px",
                      }}
                    >
                      Lot {index + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveLot(index)}
                      style={{
                        padding: "6px 12px",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        backgroundColor: "white",
                        color: "#dc2626",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.813rem",
                        fontWeight: "500",
                        outline: "none",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#fef2f2";
                        e.currentTarget.style.borderColor = "#ef4444";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                        e.currentTarget.style.borderColor = "#fecaca";
                      }}
                      title="Supprimer"
                    >
                      <FaTrash size={12} />
                      <span>Supprimer</span>
                    </button>
                  </div>

                  {/* Champs du lot */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(3, 1fr)",
                      gap: "12px",
                    }}
                  >
                    {/* N° de Lot */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaBarcode style={{ color: "#1FB05B" }} />
                        N° de Lot
                      </label>
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Numéro du lot"
                        value={lot.lot || ""}
                        onChange={(e) =>
                          handleUpdateLot(index, "lot", e.target.value)
                        }
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          padding: "8px 12px",
                          fontSize: "0.875rem",
                          transition: "all 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#1FB05B";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(31,176,91,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Quantité */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaBox style={{ color: "#1FB05B" }} />
                        Quantité
                      </label>
                      <Form.Control
                        type="number"
                        size="sm"
                        placeholder="0"
                        value={lot.quantite || ""}
                        onChange={(e) =>
                          handleUpdateLot(
                            index,
                            "quantite",
                            Number(e.target.value) || 0,
                          )
                        }
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          padding: "8px 12px",
                          fontSize: "0.875rem",
                          transition: "all 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#1FB05B";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(31,176,91,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>

                    {/* Date de péremption */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                      }}
                    >
                      <label
                        style={{
                          fontSize: "0.75rem",
                          color: "#6b7280",
                          fontWeight: "600",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <FaCalendarAlt style={{ color: "#dc2626" }} />
                        Date d'expiration
                      </label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={lot.date_peremption || ""}
                        onChange={(e) =>
                          handleUpdateLot(
                            index,
                            "date_peremption",
                            e.target.value,
                          )
                        }
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #d1d5db",
                          padding: "8px 12px",
                          fontSize: "0.875rem",
                          transition: "all 0.2s ease",
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = "#dc2626";
                          e.currentTarget.style.boxShadow =
                            "0 0 0 3px rgba(220,38,38,0.1)";
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = "#d1d5db";
                          e.currentTarget.style.boxShadow = "none";
                        }}
                      />
                    </div>
                  </div>

                  {/* Indicateur d'expiration */}
                  {lot.date_peremption &&
                    new Date(lot.date_peremption) < new Date() && (
                      <div style={{ marginTop: "12px" }}>
                        <div
                          style={{
                            padding: "8px 12px",
                            backgroundColor: "#fef2f2",
                            border: "1px solid #fecaca",
                            borderRadius: "6px",
                            color: "#dc2626",
                            fontSize: "0.813rem",
                            fontWeight: "500",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          ⚠️ Ce lot est expiré depuis le{" "}
                          {new Date(lot.date_peremption).toLocaleDateString(
                            "fr-FR",
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "48px 24px",
                  textAlign: "center",
                  color: "#9ca3af",
                  fontSize: "0.875rem",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  border: "2px dashed #e5e7eb",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: "500",
                    marginBottom: "8px",
                  }}
                >
                  Aucun lot défini
                </p>
                <p style={{ margin: 0, fontSize: "0.813rem" }}>
                  Cliquez sur "Ajouter un nouveau lot" pour commencer
                </p>
              </div>
            )}
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{
            backgroundColor: "#f9fafb",
            borderTop: "1px solid #e5e7eb",
            padding: "16px 24px",
            display: "flex",
            gap: "12px",
            justifyContent: "flex-end",
          }}
        >
          <Button
            variant="outline-secondary"
            onClick={handleCloseLotModal}
            style={{
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: "500",
              fontSize: "0.875rem",
              border: "1px solid #d1d5db",
              color: "#6b7280",
              backgroundColor: "white",
              transition: "all 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            Annuler
          </Button>
          {selectedProductIndex !== null && (
            <Button
              variant="success"
              onClick={handleSaveLotChanges}
              style={{
                borderRadius: "8px",
                padding: "10px 24px",
                fontWeight: "500",
                fontSize: "0.875rem",
                backgroundColor: "#1FB05B",
                border: "none",
                color: "white",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#18a04b";
                e.currentTarget.style.boxShadow =
                  "0 2px 4px rgba(31,176,91,0.2)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#1FB05B";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Enregistrer les modifications
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <OrderAddingModal
        show={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          if (orderStatus === "success") {
            navigate("/orders_client?type=programme");
          }
        }}
        status={orderStatus}
        errorMessage={orderError}
        successMessage="Commande enregistrée et envoyée avec succès !"
        redirectPath="/orders_client?type=programme"
      />
    </div>
  );
}
