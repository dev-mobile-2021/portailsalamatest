import React, { useState, useEffect, useMemo } from "react";
import { Table, Button, Badge, Card, Form, Modal } from "react-bootstrap";
import { FaClipboardList, FaCheck, FaCalendarAlt, FaBarcode, FaInfoCircle, FaFileInvoice, FaPlus, FaTrash, FaTimes, FaBox, FaSearch, FaPrint, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import { useSousFamilles } from "../../hooks/useSousFamilles";
import { useNotification } from "../../hooks/useNotification";
import { createItem } from "../../api/crudService";
import { restClient } from "../../api/client";
import NotificationPopup from "../ui/NotificationPopup";
import { useArticles } from "../../hooks/useArticles";
import { User } from "../../types/user.types";
import CommentInput from "../ui/CommentInput";
import useTarifSage from '../../hooks/useTarifSage';
import useClients from '../../hooks/useClients';

interface VueGlobaleProps {
  Data: any;
  setData?: React.Dispatch<React.SetStateAction<any>>;
  onRefreshCommande?: () => Promise<void>;
  loadingFabricants?: boolean;
  errorFabricants?: string | null;
  handleSubmit?: (e: React.FormEvent) => Promise<void>;
  dashboardData?: any;
  fournisseurs?: any[];
  user?: User;
  orderType?:  'programme' | 'rc_public' | 'rc_prive' | 'tef' | 'be' | 'ferme' | 'urgence' | 'enlevement' | null;
}

const VueGlobale: React.FC<VueGlobaleProps> = ({
  Data,
  setData,
  onRefreshCommande,
  user,
  orderType
}) => {
  // État local pour les modifications
  const [localData, setLocalData] = useState(Data);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationConfirmation, setShowValidationConfirmation] = useState(false);
  const [isSubmittingRal, setIsSubmittingRal] = useState(false);
  const [isDownloadingRalPdf, setIsDownloadingRalPdf] = useState(false);
  const [ralActionError, setRalActionError] = useState<string | null>(null);
  
  // État pour la suppression d'article
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [itemToDeleteIndex, setItemToDeleteIndex] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // État pour le modal des lots
  const [showLotModal, setShowLotModal] = useState(false);
  const [selectedLots, setSelectedLots] = useState<any[]>([]);
  const [selectedProductName, setSelectedProductName] = useState('');
  const [selectedProductIndex, setSelectedProductIndex] = useState<number | null>(null);

  // État pour le modal d'ajout d'article
  const [showAddArticleModal, setShowAddArticleModal] = useState(false);
  const [newArticle, setNewArticle] = useState<any>({
    produit: '',
    code: '',
    quantite: 0,
    cmm: 0,
    prix: 0,
    famille_id: '',
    catalogue: 0,
    article_id: null
  });
  const [searchArticle, setSearchArticle] = useState('');

  // Hook pour récupérer les familles
  const { sousFamilles } = useSousFamilles();
  
  
  // Hook pour récupérer les articles du catalogue avec le client_id
  const { articles: catalogueArticles, loading: loadingArticles } = useArticles({ });
   
  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Hook pour récupérer les tarifs Sage
  const { fetchTarif, loading: loadingTarif } = useTarifSage();
  
  // Hook pour récupérer les clients (pour le codecategorie)
  const { clients } = useClients(user?.id || null);

  // État pour le filtre du tableau
  const [tableQuery, setTableQuery] = useState('');
  
  // État pour les articles dépliés/repliés
  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(new Set());

  // Mettre à jour les données locales quand Data change
  useEffect(() => {
    // Normaliser les données : si le backend envoie 'lignecommandes', le renommer en 'detailcommandes'
    const normalizedData = {
      ...Data,
      detailcommandes: Data.detailcommandes || Data.lignecommandes || []
    };
    setLocalData(normalizedData);
  }, [Data]);

  // Fonction pour regrouper les articles par leur article.id et combiner les lots
  const groupArticlesByLots = (details: any[]) => {
    const grouped = details.reduce((acc: any, detail: any) => {
      const articleId = detail.article?.id || detail.article_id;
      
      if (!articleId) {
        // Si pas d'ID article, ajouter tel quel
        acc[`no-id-${detail.id}`] = detail;
        return acc;
      }
      
      if (!acc[articleId]) {
        // Premier article de ce type, créer l'entrée
        acc[articleId] = {
          ...detail,
          detaillignecommandes: detail.detaillignecommandes || [],
          originalDetails: [detail],
          totalQuantite: detail.quantite || 0,
          // Créer des pseudo-lots basés sur les lignes si detaillignecommandes est vide
          groupedLots: detail.detaillignecommandes && detail.detaillignecommandes.length > 0 
            ? [...detail.detaillignecommandes]
            : [{
                id: detail.id,
                quantite: detail.quantite,
                prix: detail.prix,
                lot: detail.lot || `Ligne-${detail.id}`,
                dateperemption: detail.date_peremption || detail.dateperemption || ''
              }]
        };
      } else {
        // Article existant, combiner les lots et additionner les quantités
        if (detail.detaillignecommandes && detail.detaillignecommandes.length > 0) {
          acc[articleId].detaillignecommandes = [
            ...acc[articleId].detaillignecommandes,
            ...detail.detaillignecommandes
          ];
          acc[articleId].groupedLots = [
            ...acc[articleId].groupedLots,
            ...detail.detaillignecommandes
          ];
        } else {
          // Créer un pseudo-lot pour cette ligne
          acc[articleId].groupedLots.push({
            id: detail.id,
            quantite: detail.quantite,
            prix: detail.prix,
            lot: detail.lot || `Ligne-${detail.id}`,
            dateperemption: detail.date_peremption || detail.dateperemption || ''
          });
        }
        acc[articleId].totalQuantite += detail.quantite || 0;
        acc[articleId].originalDetails.push(detail);
      }
      
      return acc;
    }, {});
    
    return Object.values(grouped);
  };

  // Détermine si les articles doivent être regroupés par lots
  const shouldGroupByLots = useMemo(() => {
    return ['programme', 'tef', 'urgence', 'enlevement', 'rc_public'].includes(orderType || '');
  }, [orderType]);

  // Fonction pour toggle l'expansion d'un article regroupé
  const toggleArticleExpansion = (articleId: string) => {
    setExpandedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  };

  // Filtrer et éventuellement regrouper les détails selon la recherche
  const filteredDetails = useMemo(() => {
    if (!localData.detailcommandes) return [];
    
    // Filtrer d'abord par état
    let filtered = localData.detailcommandes.filter((detail: { etat: number; }) => detail.etat !== 0);
    
    // Appliquer la recherche si nécessaire
    if (tableQuery.trim()) {
      const query = tableQuery.toLowerCase().trim();
      filtered = filtered.filter((detail: any) => {
        const produit = (detail.produit || detail.designation || '').toLowerCase();
        const code = (detail.code || '').toLowerCase();
        return produit.includes(query) || code.includes(query);
      });
    }
    
    // Regrouper par lots si nécessaire et si les lots sont disponibles
    if (shouldGroupByLots) {
      // Vérifier s'il y a des articles en double basés sur article_id
      const articleCounts = filtered.reduce((acc: any, detail: any) => {
        const articleId = detail.article?.id || detail.article_id;
        if (articleId) {
          acc[articleId] = (acc[articleId] || 0) + 1;
        }
        return acc;
      }, {});
      
      const hasDuplicates = Object.values(articleCounts).some((count: any) => count > 1);
      
      if (hasDuplicates) {
        return groupArticlesByLots(filtered);
      }
    }
    
    return filtered;
  }, [localData.detailcommandes, tableQuery, shouldGroupByLots]);

  // Lignes RAL affichées dans le tableau (exclut etat = 0 comme le tableau principal)
  const ralDetails = useMemo(() => {
    const details = Data?.detailcommandes || localData?.detailcommandes || [];
    return details.filter((detail: any) =>
      (Number(detail?.is_ral ?? 0) === 1 || detail?.is_ral === true) && detail.etat !== 0
    );
  }, [Data?.detailcommandes, localData?.detailcommandes]);

  // Déterminer l'état d'avancement RAL (A, B, C)
  const ralState = useMemo<'A' | 'B' | 'C'>(() => {
    const validationClientRalEtape1 = Number(localData.validationclient_ral_etape1 ?? 0);
    const validationSalamaRalEtape1 = Number(localData.validationsalama_ral_etape1 ?? 0);

    if (validationSalamaRalEtape1 === 1) {
      return 'C';
    }

    if (validationClientRalEtape1 === 1 && validationSalamaRalEtape1 === 0) {
      return 'B';
    }

    return 'A';
  }, [localData.validationclient_ral_etape1, localData.validationsalama_ral_etape1]);

  const getRalMissingQuantity = (detail: any) => {
    const directQuantity = detail.quantite_manquante ?? detail.qte_manquante;
    if (directQuantity !== undefined && directQuantity !== null) {
      return Number(directQuantity) || 0;
    }

    const requestedQuantity = Number(detail.qte_commandee ?? detail.quantite ?? 0);
    const availableQuantity = Number(detail.qte_disponible ?? detail.stock_disponible ?? 0);

    if (availableQuantity > 0) {
      return Math.max(0, requestedQuantity - availableQuantity);
    }

    return requestedQuantity;
  };

  const getRalBadge = (detail: any) => {
    const apiBadgeClass =
      typeof detail?.etat_ral_badge === "string" ? detail.etat_ral_badge.trim() : "";
    const apiBadgeText =
      typeof detail?.etat_ral_text === "string" ? detail.etat_ral_text.trim() : "";

    if (apiBadgeClass) {
      return <Badge className={apiBadgeClass}>{apiBadgeText || "État RAL"}</Badge>;
    }

    if (apiBadgeText) {
      return <Badge bg="secondary">{apiBadgeText}</Badge>;
    }

    const etatRal = Number(detail?.etat_ral ?? 0);

    if (etatRal >= 4) {
      return <Badge bg="success">Validé</Badge>;
    }

    if (etatRal >= 3) {
      return <Badge bg="info">En cours</Badge>;
    }

    if (etatRal >= 2) {
      return <Badge bg="warning" text="dark">En attente</Badge>;
    }

    return <Badge bg="danger">En rupture</Badge>;
  };

  const handleConfirmRalNeed = async () => {
    if (!localData?.id) {
      showError("Erreur RAL", "Identifiant de commande introuvable.");
      return;
    }

    setIsSubmittingRal(true);
    setRalActionError(null);

    try {
      const payload = {
        id: localData.id,
        validationclient_ral_etape1: 1
      };

      const response = await createItem("api/commande/statut-ral", payload);
      const responseData = response?.data as { succes?: number | string | boolean; message?: string };

      if (Number(responseData?.succes ?? 0) !== 1) {
        const apiMessage = responseData?.message || "Impossible de confirmer le besoin RAL.";
        setRalActionError(apiMessage);
        return;
      }

      const updatedData = {
        ...localData,
        validationclient_ral_etape1: 1
      };

      setLocalData(updatedData);
      if (setData) {
        setData(updatedData);
      }

      showSuccess(
        "Besoin confirmé",
        responseData?.message || "Besoin confirmé — en attente de validation par Salama",
      );

      if (onRefreshCommande) {
        await onRefreshCommande();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de confirmer le besoin RAL.";
      setRalActionError(errorMessage);
    } finally {
      setIsSubmittingRal(false);
    }
  };

  const handleDownloadRalPdf = async () => {
    if (!localData?.id) {
      showError("Erreur RAL", "Identifiant de commande introuvable.");
      return;
    }

    setIsDownloadingRalPdf(true);

    try {
      const response = await restClient.get(`generer-pdf-ral/${localData.id}`, {
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      // Laisser le temps au navigateur de charger le blob dans le nouvel onglet.
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de télécharger le PDF RAL.";
      showError("Erreur PDF RAL", errorMessage);
    } finally {
      setIsDownloadingRalPdf(false);
    }
  };

  // Styles unifiés pour les champs
  const fieldStyles = {
    keyInput: {
      backgroundColor: '#fff3cd',
      border: '1px solid #ffc107',
      borderRadius: '6px',
      color: '#856404',
      fontWeight: '700',
      minWidth: '80px'
    },
    computed: {
      backgroundColor: '#e9ecef',
      border: '1px solid #ced4da',
      borderRadius: '6px',
      color: '#495057',
      fontWeight: '600',
      cursor: 'not-allowed',
      minWidth: '80px'
    },
    computedGreen: {
      backgroundColor: '#d1e7dd',
      border: '1px solid #198754',
      borderRadius: '6px',
      color: '#0f5132',
      fontWeight: '700',
      cursor: 'not-allowed',
      minWidth: '80px'
    }
  };

  // Fonction pour déterminer si la commande peut être modifiée
  const canModifyOrder = () => {
    if (orderType === 'programme') {
      // Pour les commandes programme, on peut modifier si etat_commande !== 1
      return Data.etat_commande !== 1;
    } else {
      // Pour les autres types, on peut modifier si etat <= 1 et validationclient === null
      return Data.etat <= 1 && Data.validationclient === null;
    }
  };

  // Fonction utilitaire pour calculer les champs dérivés d'une commande programme
  const calculateProgrammeFields = (detail: any) => {
    const D = Number(detail.qte_debut || 0);
    const E = Number(detail.qte_recue || 0);
    const F = Number(detail.qte_distribuee || 0);
    const G = Number(detail.qte_perdue || 0);
    const H = Number(detail.ajustement || 0);
    // const J = Number(detail.nb_jour_rupture || 0);
    const O = Number(detail.prix || 0);

    // I (Quantités restantes en fin de trimestre) = (D + E) - (F + G + H)
    const I = (D + E) - (F + G + H);

    // K (CMM ajustée) = ((F * 30) / 90) - J
    const K =  Number(detail.cmm || 0);

    // L (Stock Maximum) = K * 3
    const L = K * 3;

   // M (Quantité à commander) = L - I (ne peut pas être négative)
    const M = Math.max(0, L - I);

    // N (Quantité commandée arrondie au conditionnement)
    const N = M > 0 ? Math.ceil(M) : 0;

    // P (Montant) = N * O
    const P = N * O;

    return {
      qte_fin: I,
      cmm: K,
      stock_max: L,
      qte_commander_l: M,
      qte_commandee: N,
      montant: P
    };
  };

  // Fonction pour demander confirmation de modification
  const handleRequestModification = () => {
    setShowConfirmation(true);
  };

  // Fonction pour annuler la modification
  const handleCancelModification = () => {
    setShowConfirmation(false);
  };

  // Fonction pour demander confirmation de validation
  const handleRequestValidation = () => {
    setShowValidationConfirmation(true);
  };

  // Fonction pour annuler la validation
  const handleCancelValidation = () => {
    setShowValidationConfirmation(false);
  };
  const handleConfirmModification = async (isValidation: boolean = false) => {
    setShowConfirmation(false);
    setShowValidationConfirmation(false);

    // Validation quantité pour rc_public, urgence et enlevement
    if (['rc_public', 'urgence', 'enlevement', 'tef'].includes(orderType || '')) {
      const articlesAvecQteZero = (localData.detailcommandes || []).filter(
        (detail: any) => !detail.qte_commandee || detail.qte_commandee <= 0
      );
      if (articlesAvecQteZero.length > 0) {
        showError(
          "Quantité invalide",
          `${articlesAvecQteZero.length} article(s) ont une quantité à commander de 0. Veuillez saisir une quantité pour tous les articles.`
        );
        return;
      }
    }

    setIsSubmitting(true);
    setIsValidating(true);

    try {
      // Préparer le payload selon le type de commande
      let payload: any = {
        id: localData.id, // IMPORTANT: Inclure l'ID pour la modification
        client_id: user?.client_id || localData.client_id ,
        user_id: user?.id,
        commentaire: localData.commentaire || undefined,
      };

      // Ajouter validationclient: 1 UNIQUEMENT si c'est une validation (pas une simple modification)
      if (isValidation && orderType !== 'programme') {
        payload = {
          ...payload,
          validationclient: 1,
        };
      }

      // Adapter le payload selon le type de commande
      const typeCommandeMapping: { [key: string]: number } = {
        programme: 1,
        rc_public: 2,
        rc_prive: 6,
        be: 5,
        ferme: 4,
        tef: 3,
        urgence: 9,
        enlevement: 8,
      };

      const typeCommandeId = typeCommandeMapping[orderType || ''] || undefined;

      if (orderType === 'programme') {
        payload = {
          ...payload,
          programme_id: localData.programme?.id || localData.campagne?.programme?.id,
          campagne_id: localData.campagne?.id,
          typecommande_id: typeCommandeId,
          detailcommandes: localData.detailcommandes.map((detail: any) => ({
            article_id: detail.produit_id || detail.article_id,
            qte_debut: detail.qte_debut || 0,
            qte_recue: detail.qte_recue || 0,
            qte_distribuee: detail.qte_distribuee || 0,
            qte_perdue: detail.qte_perdue || 0,
            ajustement: detail.ajustement || 0,
            qte_fin: detail.qte_fin || 0,
            cmm: detail.cmm || 0,
            stock_max: detail.stock_max || 0,
            quantite: detail.qte_commandee || 0,
            qte_commandee: detail.qte_commandee || 0,
            nb_jour_rupture: detail.nb_jour_rupture || 0,
            msd: detail.msd || 0,
            qte_transferes: detail.qte_transferes || 0,
            qte_dfs: detail.qte_dfs || 0,
            lignesLot: detail.detaillignecommandes?.map((lot: any) => ({
              id: lot.id,
              lot: lot.lot,
              dateperemption: lot.dateperemption,
              quantite: lot.quantite,
            })) || [],
          })),
        };
      } else if (['rc_public', 'urgence', 'enlevement', 'tef'].includes(orderType || '')) {
        // Structure pour TEF, urgence, enlevement et rc_public
        payload = {
          ...payload,
          typecommande_id: typeCommandeId,
          detailcommandes: localData.detailcommandes.map((detail: any) => {
            const detailPayload: any = {
              article_id: detail.catalogue === 1 ? (detail.produit_id || detail.article_id) : undefined,
              qte_debut: detail.qte_debut || 0,
              qte_recue: detail.qte_recue || 0,
              qte_distribuee: detail.qte_distribuee || 0,
              qte_perdue: detail.qte_perdue || 0,
              ajustement: detail.ajustement || 0,
              qte_fin: detail.qte_fin || 0,
              cmm: detail.cmm || 0,
              stock_max: detail.stock_max || 0,
              quantite: detail.qte_commandee || 0,
              qte_commandee: detail.qte_commandee || 0,
              nb_jour_rupture: detail.nb_jour_rupture || 0,
              msd: detail.msd || 0,
              catalogue: detail.catalogue || (detail.type === 'Catalogue' ? 1 : 0),
              famille_id: detail.catalogue === 0 ? (detail.famille_id || detail.famille) : undefined,
              article_text: detail.catalogue === 0 ? (detail.produit || detail.designation || detail.articleHorsCatalogue || 'N/A') : undefined,
              lignesLot: detail.detaillignecommandes?.map((lot: any) => ({
                lot: lot.lot,
                dateperemption: lot.dateperemption,
                quantite: lot.quantite,
              })) || [],
            };
            
            // Ajouter pv_ht pour TEF, RC Public, Urgence et Enlèvement (valeur fixe de 100)
            if (['tef', 'rc_public', 'urgence', 'enlevement'].includes(orderType || '')) {
              detailPayload.pv_ht = 100;
            }
            
            return detailPayload;
          }),
        };
      } else if (['rc_prive', 'be'].includes(orderType || '')) {
        payload = {
          ...payload,
          typecommande_id: typeCommandeId,
          detailcommandes: localData.detailcommandes.map((detail: any) => ({
        article_id: detail.article_id || detail.produit_id,
        quantite: detail.quantite || 0,
        cmm: detail.cmm || detail.consoMoyenne || 0,
        catalogue: detail.catalogue || (detail.type === 'Catalogue' ? 1 : 0),
        pv_ht: detail.prix || 0,
        famille_id: detail.famille_id || detail.famille,
        article_text: detail.produit || detail.designation || detail.articleHorsCatalogue || 'N/A',
          })),
        };
      } else if (orderType === 'ferme') {
        payload = {
          ...payload,
          typecommande_id: typeCommandeId,
          detailcommandes: localData.detailcommandes.map((detail: any) => ({
        article_id: detail.catalogue === 1 ? detail.article_id : undefined,
        quantite: detail.quantite || 0,
        cmm: detail.cmm || detail.consoMoyenne || 0,
        catalogue: detail.catalogue || 0,
        famille_id: detail.famille_id || detail.famille,
        article_text: detail.produit || detail.designation || detail.articleHorsCatalogue || 'N/A',
        pv_ht: detail.prix || 0,
          })),
        };
      } else {
        // Type de commande par défaut
        payload = {
          ...payload,
          detailcommandes: localData.detailcommandes.map((detail: any) => ({
        article_id: detail.article_id || detail.produit_id,
        quantite: detail.quantite || 0,
        prix_unitaire: detail.prix_unitaire || 0,
          })),
        };
      }

      // Utilisation du service updateItem pour modifier la commande
      const response = await createItem("commande", payload, );

      if (response.status !== 200 && response.status !== 201) {
        console.error("Erreur HTTP lors de la modification :", response.status, response.statusText);
        throw new Error(`Erreur lors de la modification : ${response.statusText}`);
      }

      // Mettre à jour les données principales si setData est disponible
      if (setData) {
        setData(localData);
      }
      
      showSuccess("Commande modifiée", "La commande a été modifiée avec succès !");
      
          // Recharger la page après un court délai pour permettre à la notification d'être visible
    setTimeout(() => {
      window.location.reload();
    }, 3000); // Délai de 3 secondes
    
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      showError("Erreur de sauvegarde", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Fonction pour ouvrir le modal des lots
  const handleShowLotDetails = (lots: any[], productName: string, productIndex?: number) => {
    setSelectedLots([...lots]); // Copie pour éviter les mutations
    setSelectedProductName(productName);
    setSelectedProductIndex(productIndex ?? null);
    setShowLotModal(true);
  };

  // Fonction pour fermer le modal des lots
  const handleCloseLotModal = () => {
    setShowLotModal(false);
    setSelectedLots([]);
    setSelectedProductName('');
    setSelectedProductIndex(null);
  };

  // Fonction pour sauvegarder les modifications de lots
  const handleSaveLotChanges = () => {
    if (selectedProductIndex !== null) {
      const updatedDetails = [...localData.detailcommandes];
      updatedDetails[selectedProductIndex].detaillignecommandes = selectedLots;
      
      // Si c'est une commande de type programme, recalculer les champs après modification des lots
      if (['programme', 'tef', 'urgence', 'enlevement', 'rc_public'].includes(orderType || '')) {
        const calculatedFields = calculateProgrammeFields(updatedDetails[selectedProductIndex]);
        updatedDetails[selectedProductIndex] = {
          ...updatedDetails[selectedProductIndex],
          ...calculatedFields
        };
      }
      
      setLocalData({ ...localData, detailcommandes: updatedDetails });
    }
    handleCloseLotModal();
  };

  // Fonction pour modifier un lot dans le modal
  const handleUpdateLot = (lotIndex: number, field: string, value: any) => {
    const updatedLots = [...selectedLots];
    updatedLots[lotIndex] = { ...updatedLots[lotIndex], [field]: value };
    setSelectedLots(updatedLots);
  };

  // Fonction pour ajouter un lot dans le modal
  const handleAddLot = () => {
    const newLot = {
      id: Date.now(),
      lot: "",
      quantite: 0,
      dateperemption: ""
    };
    setSelectedLots([...selectedLots, newLot]);
  };

  // Fonction pour supprimer un lot dans le modal
  const handleRemoveLot = (lotIndex: number) => {
    const updatedLots = selectedLots.filter((_, index) => index !== lotIndex);
    setSelectedLots(updatedLots);
  };

  const handleDetailChange = (index: number, field: string, value: any) => {
    const updatedDetails = [...localData.detailcommandes];
    updatedDetails[index] = {
      ...updatedDetails[index],
      [field]: value
    };

    // Si c'est une commande de type programme, calculer automatiquement les champs dérivés
    if (['programme', 'tef', 'urgence', 'enlevement', 'rc_public'].includes(orderType || '')) {
      const calculatedFields = calculateProgrammeFields(updatedDetails[index]);
      
      // Si le champ modifié est qte_commander_l, ne pas écraser avec la valeur calculée
      if (field === 'qte_commander_l') {
        updatedDetails[index] = {
          ...updatedDetails[index],
          ...calculatedFields,
          qte_commander_l: value,
          qte_commandee: value > 0 ? Math.ceil(value) : 0
        };
      } else {
        updatedDetails[index] = {
          ...updatedDetails[index],
          ...calculatedFields
        };
      }
    }

    setLocalData({
      ...localData,
      detailcommandes: updatedDetails
    });
  };

  // Fonction pour ouvrir le modal d'ajout d'article
  const handleOpenAddArticleModal = () => {
    setNewArticle({
      produit: '',
      code: '',
      quantite: 0,
      cmm: 0,
      prix: 0,
      famille_id: '',
      catalogue: 0,
      article_id: null
    });
    setSearchArticle('');
    setShowAddArticleModal(true);
  };

  // Fonction pour fermer le modal d'ajout d'article
  const handleCloseAddArticleModal = () => {
    setShowAddArticleModal(false);
    setSearchArticle('');
    setNewArticle({
      produit: '',
      code: '',
      quantite: 0,
      cmm: 0,
      prix: 0,
      famille_id: '',
      catalogue: 0,
      article_id: null
    });
  };

  const normalizeText = (value: string) => value.trim().toLowerCase();

  const formatCatalogueOption = (article: any) => {
    const codeLabel = article.code ? `${article.code} - ` : '';
    return `${codeLabel}${article.designation}`;
  };

  const filteredCatalogueArticles = useMemo(() => {
    const normalizedQuery = normalizeText(searchArticle);

    return (catalogueArticles || [])
      .filter((article: any) => {
        if (!normalizedQuery) {
          return true;
        }

        const designationMatch = article.designation?.toLowerCase().includes(normalizedQuery);
        const codeMatch = article.code?.toLowerCase().includes(normalizedQuery);
        return designationMatch || codeMatch;
      })
      .slice(0, 100);
  }, [catalogueArticles, searchArticle]);

  // Fonction pour sélectionner un article du catalogue
  const handleSelectArticleFromCatalogue = async (article: any) => {
    let prix = article.pvht || article.prix || 0;

    // Pour tous les types sauf ferme, récupérer le tarif depuis Sage
    if (orderType !== 'ferme') {
      const clientId = Data?.client_id ?? user?.client_id;
      const client = clients.find((c: any) => c.id === clientId);
      const codeCategorie = client?.codecategorie || client?.COMPTE_0 || '';

      if (article.code && codeCategorie) {
        const tarifResult = await fetchTarif(article.code, codeCategorie);
        if (tarifResult && tarifResult.prix !== undefined && tarifResult.prix !== null) {
          prix = tarifResult.prix;
        }
      }
    }

    setNewArticle({
      ...newArticle,
      produit: article.designation,
      code: article.code || '',
      prix: prix,
      article_id: article.id,
      catalogue: 1
    });
    setSearchArticle(formatCatalogueOption(article));
  };

  const handleCatalogueSearchChange = (value: string) => {
    setSearchArticle(value);

    const normalizedValue = normalizeText(value);
    if (!normalizedValue) {
      return;
    }

    const matchedArticle = (catalogueArticles || []).find(
      (article: any) => normalizeText(formatCatalogueOption(article)) === normalizedValue
    );

    if (matchedArticle) {
      handleSelectArticleFromCatalogue(matchedArticle);
    }
  };

  // Fonction pour ajouter un article à la commande
  const handleAddArticle = () => {
    // Pour les types urgence, enlevement, tef et rc_public, pas besoin de quantité
    const isSimplifiedOrder = ['urgence', 'enlevement', 'tef', 'rc_public'].includes(orderType || '');
    
    if (!newArticle.produit) {
      showError("Erreur", "Veuillez sélectionner un produit");
      return;
    }
    
    if (!isSimplifiedOrder && newArticle.quantite <= 0) {
      showError("Erreur", "Veuillez remplir tous les champs obligatoires");
      return;
    }

    
    const newDetail: any = {
      id: Date.now(),
      produit: newArticle.produit,
      designation: newArticle.produit,
      code: newArticle.code,
      quantite: isSimplifiedOrder ? 0 : newArticle.quantite,
      cmm: isSimplifiedOrder ? 0 : (newArticle.cmm || 0),
      catalogue: newArticle.catalogue,
      famille_id: newArticle.famille_id || null,
      article_id: newArticle.article_id || null
    };

    // Ajouter le prix seulement pour RC, BE et Ferme
    if (orderType === 'rc_prive' || orderType === 'be' || orderType === 'ferme') {
      newDetail.prix = newArticle.prix || 0;
    }

    const updatedDetails = [...localData.detailcommandes, newDetail];
    setLocalData({
      ...localData,
      detailcommandes: updatedDetails
    });

    handleCloseAddArticleModal();
    showSuccess("Article ajouté", "L'article a été ajouté à la commande avec succès !");
  };

  // Fonction pour demander la suppression d'un article
  const handleRemoveArticle = (index: number) => {
    setItemToDeleteIndex(index);
    setShowDeleteConfirmation(true);
  };

  // Fonction pour annuler la suppression
  const handleCancelDelete = () => {
    setShowDeleteConfirmation(false);
    setItemToDeleteIndex(null);
  };

  // Fonction pour confirmer la suppression
  const handleConfirmDelete = async () => {
    if (itemToDeleteIndex === null) return;
    
    setIsDeleting(true);
    const itemToDelete = localData.detailcommandes[itemToDeleteIndex];
    
    // Vérifier si c'est un article existant (ID petit) ou nouveau (ID généré par Date.now() donc très grand)
    // Les IDs de base de données sont généralement petits, Date.now() est > 1.7e12
    const isPersistedItem = itemToDelete.id && typeof itemToDelete.id === 'string' && itemToDelete.id < 1000000000000;
 
    
    if (isPersistedItem) {
      try {
        // Appel API pour supprimer la ligne de commande
        const response = await createItem("api/deleteLignecommande", { id: itemToDelete.id });
        
        if (response.status !== 200 && response.status !== 201) {
           throw new Error("Erreur lors de la suppression");
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de la ligne:", error);
        showError("Erreur", "Impossible de supprimer l'article du serveur");
        setIsDeleting(false);
        setShowDeleteConfirmation(false);
        return;
      }
    }

    const updatedDetails = localData.detailcommandes.filter((_: any, i: number) => i !== itemToDeleteIndex);
    setLocalData({
      ...localData,
      detailcommandes: updatedDetails
    });
    
    showSuccess("Article supprimé", "L'article a été supprimé de la commande");
    setIsDeleting(false);
    setShowDeleteConfirmation(false);
    setItemToDeleteIndex(null);
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
    
    });
  };

  // Déterminer le statut de la commande et sa couleur
  const getStatusBadge = (status: string, badgeClass?: string) => {
    // Si une classe de badge spécifique est fournie (pour les commandes programme)
    if (badgeClass) {
      return <Badge className={badgeClass}>{status || "Non défini"}</Badge>;
    }
    
    // Logique par défaut basée sur le texte du statut
    let bgColor = "secondary";
    switch(status?.toLowerCase()) {
      case "validée":
      case "validee":
      case "valide":
        bgColor = "success";
        break;
      case "en attente":
      case "attente":
      case "en attente de validation":
      case "en attente salama":
        bgColor = "warning";
        break;
      case "refusée":
      case "refusee":
      case "refus":
        bgColor = "danger";
        break;
      case "en cours":
        bgColor = "info";
        break;
      default:
        bgColor = "secondary";
    }
    
    return <Badge bg={bgColor}>{status || "Non défini"}</Badge>;
  };

  // Calculer le montant total
  const calculateTotal = () => {
    if (!localData.detailcommandes) return 0;
    
    return localData.detailcommandes.reduce((total: number, detail: any) => {
      let montant = 0;
      
      if (orderType === 'programme') {
        montant = (detail.qte_commandee || 0) * (detail.prix || 0);
      } else if (orderType === 'rc_prive' || orderType === 'be' || orderType === 'ferme') {
        montant = (detail.quantite || 0) * (detail.prix || 0);
      } else if (!orderType) {
        montant = (detail.quantite || 0) * (detail.prix|| 0);
      }
      
      return total + montant;
    }, 0);
  };

  // Vérifier s'il y a des montants à afficher
  const hasAmounts = () => {
    return  orderType === 'rc_prive' || orderType === 'be' || orderType === 'ferme' || !orderType;
  };

  // Fonction pour rendre le sélecteur de famille
  const renderFamilleSelector = (detail: any, index: number) => {
    // Si c'est un médicament du catalogue, afficher en lecture seule
    if (detail.catalogue === 1 || detail.type === 'Catalogue') {
      return (
        <span style={{ minWidth: '100px', display: 'block' }}>
          Médicament
        </span>
      );
    }
    
    // Si c'est hors catalogue, permettre la sélection de famille
    return (
      <Form.Select
        size="sm"
        value={detail.famille_id || ""}
        onChange={(e) => handleDetailChange(index, 'famille_id', e.target.value)}
        style={{ minWidth: '150px' }}
        disabled={!canModifyOrder()}
      >
        <option value="">Sélectionner une famille</option>
        {sousFamilles.map((famille) => (
          <option key={famille.id} value={famille.id}>
            {famille.designation}
          </option>
        ))}
      </Form.Select>
    );
  };

  // Fonction pour vérifier si des modifications ont été faites
  const hasModifications = () => {
    return JSON.stringify(localData) !== JSON.stringify(Data);
  };

  // Fonction pour imprimer la commande
  // const handlePrint = () => {
  //   window.print();
  // };

  return (
    <div className="bg-white p-3 rounded-3 shadow-sm" style={{ border: "1.5px solid #1FB05B", borderRadius: "16px" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0 d-flex align-items-center gap-2" style={{ color: "#1FB05B", fontWeight: 700 }}>
          <FaClipboardList />
          Détails de la commande
        </h5>
        <div>
          <Button
            variant="outline-success"
            size="lg"
            // onClick={handlePrint}
            className="d-flex align-items-center gap-2"
            style={{
              borderRadius: "8px",
              padding: "8px 16px",
              fontWeight: "500",
              transition: "all 0.2s ease"
            }}
          >
            <FaPrint />
            Imprimer
          </Button>
        </div>
      </div>
      
      {/* Informations de la commande */}
      <Card className="border mb-4 shadow-sm" style={{ borderRadius: "16px", borderColor: "#e9f5ef" }}>
        <Card.Body className="p-4">
          <div className="row g-4">
            <div className="col-sm-6 col-lg-3">
              <div className="p-3 rounded-3 h-100" style={{ backgroundColor: "#f8fafb", border: "1px solid #edf2f7" }}>
                <div className="d-flex align-items-center mb-2">
                  <div className="icon-container bg-success-light p-2 rounded-2 me-2">
                    <FaBarcode className="text-light" style={{ fontSize: "1.1rem" }} />
                  </div>
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    N° Commande
                  </small>
                </div>
                <div className="ps-2">
                  <span className="fw-bold text-dark fs-6" style={{ wordBreak: "break-word" }}>
                    {Data.numero || Data.id || "Non défini"}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="p-3 rounded-3 h-100" style={{ backgroundColor: "#f8fafb", border: "1px solid #edf2f7" }}>
                <div className="d-flex align-items-center mb-2">
                  <div className="icon-container bg-success-light p-2 rounded-2 me-2">
                    <FaCalendarAlt  className="text-light" style={{ fontSize: "1.1rem" }} />
                  </div>
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Date
                  </small>
                </div>
                <div className="ps-2">
                  <span className="fw-bold text-dark fs-6">
                    {formatDate(Data.created_at || Data.date || Data.datecommande)}
                  </span>
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="p-3 rounded-3 h-100" style={{ backgroundColor: "#f8fafb", border: "1px solid #edf2f7" }}>
                <div className="d-flex align-items-center mb-2">
                  <div className="icon-container bg-success-light p-2 rounded-2 me-2">
                    <FaInfoCircle className="text-light" style={{ fontSize: "1.1rem" }} />
                  </div>
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Statut
                  </small>
                </div>
                <div className="ps-2 pt-1">
                  {orderType === "programme"
                    ? getStatusBadge(Data.etat_cd_text || "En attente", Data.etat_cd_badge)
                    : getStatusBadge(
                        Data.etat <= 1
                          ? Data.validationclient === null
                            ? "En attente de validation"
                            : Data.validationsalama === null
                            ? "En attente SALAMA"
                            : "Validée"
                          : "Validée"
                      )}
                </div>
              </div>
            </div>

            <div className="col-sm-6 col-lg-3">
              <div className="p-3 rounded-3 h-100" style={{ backgroundColor: "#f8fafb", border: "1px solid #edf2f7" }}>
                <div className="d-flex align-items-center mb-2">
                  <div className="icon-container bg-success-light p-2 rounded-2 me-2">
                    <FaFileInvoice className="text-light" style={{ fontSize: "1.1rem" }} />
                  </div>
                  <small className="text-muted fw-bold text-uppercase" style={{ fontSize: "0.75rem", letterSpacing: "0.5px" }}>
                    Code devis
                  </small>
                </div>
                <div className="ps-2">
                  <span className="fw-bold text-dark fs-6">
                    {Data.codedevis || "Non défini"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Informations Programme et Campagne - uniquement pour les commandes de type programme */}
      {orderType === 'programme' && (Data.programme || Data.campagne || Data.campagne?.programme) && (
        <Card className="border mb-4" style={{ borderRadius: "14px", borderColor: "#e9f5ef" }}>
          <Card.Body>
            <div className="row g-3">
              {(Data.programme || Data.campagne?.programme) && (
                <div className="col-md-6">
                  <div className="mb-3" style={{ backgroundColor: "white", borderRadius: "8px", padding: "15px", border: "1px solid #e9f5ef" }}>
                    <div className="d-flex align-items-center mb-2">
                      <FaClipboardList className="text-success me-2" />
                      <strong style={{ color: "#1FB05B" }}>Programme:</strong>
                    </div>
                    <div className="ps-3">
                      <div className="fw-bold text-dark mb-1">
                        {Data.programme?.designation || Data.programme?.nom || Data.campagne?.programme?.designation || Data.campagne?.programme?.nom || "Programme non défini"}
                      </div>
                      {(Data.programme?.objectif || Data.campagne?.programme?.objectif) && (
                        <div className="small text-muted">
                          Objectif: {Data.programme?.objectif || Data.campagne?.programme?.objectif}
                        </div>
                      )}
                      {(Data.programme?.missions || Data.campagne?.programme?.missions) && (
                        <div className="small text-muted">
                          Missions: {Data.programme?.missions || Data.campagne?.programme?.missions}
                        </div>
                      )}
                      {(Data.programme?.equipegestion?.designation || Data.campagne?.programme?.equipegestion?.designation) && (
                        <div className="small text-muted">
                          Équipe: {Data.programme?.equipegestion?.designation || Data.campagne?.programme?.equipegestion?.designation}
                        </div>
                      )}
                      {/* <div className="small text-muted">
                        ID Programme: {Data.programme?.id || Data.campagne?.programme?.id}
                      </div> */}
                    </div>
                  </div>
                </div>
              )}
              
              {Data.campagne && (
                <div className="col-md-6">
                  <div className="mb-3" style={{ backgroundColor: "white", borderRadius: "8px", padding: "15px", border: "1px solid #e9f5ef" }}>
                    <div className="d-flex align-items-center mb-2">
                      <FaCalendarAlt className="text-primary me-2" />
                      <strong style={{ color: "#0d6efd" }}>Planning Cyclique:</strong>
                    </div>
                    <div className="ps-3">
                      <div className="fw-bold text-dark mb-1">{Data.campagne.designation || Data.campagne.nom || "Campagne non définie"}</div>
                      {Data.campagne.date && (
                        <div className="small text-muted">
                          Date: {formatDate(Data.campagne.date)}
                        </div>
                      )}
                      {Data.campagne.statut && (
                        <div className="small">
                          Statut: <Badge bg={Data.campagne.statut === 'active' ? 'success' : 'secondary'} className="ms-1">
                            {Data.campagne.statut}
                          </Badge>
                        </div>
                      )}
                      {/* <div className="small text-muted">
                        ID Campagne: {Data.campagne.id}
                      </div> */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card.Body>
        </Card>
      )}
      
      <div className="card p-3" style={{ borderRadius: 14, border: "1px solid #e9f5ef" }}>
        {/* Barre d'outils */}
        <div className="mb-3 d-flex justify-content-between align-items-center" style={{
          padding: '12px 16px',
          backgroundColor: '#f8fafb',
          border: '1px solid #e5e7eb',
          borderRadius: '12px'
        }}>
          <div className="d-flex align-items-center gap-3 flex-grow-1">
            <div className="position-relative flex-grow-1" style={{ maxWidth: '400px' }}>
              <FaSearch className="position-absolute" style={{
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6b7280',
                fontSize: '14px',
                zIndex: 2
              }} />
              <Form.Control
                type="text"
                placeholder="Rechercher par produit ou code..."
                value={tableQuery}
                onChange={(e) => setTableQuery(e.target.value)}
                style={{
                  paddingLeft: '40px',
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px'
                }}
              />
            </div>
            <Badge bg="primary" className="px-3 py-2" style={{ fontSize: '0.875rem' }}>
              Affichés: {filteredDetails.length} / {localData.detailcommandes?.filter((d: any) => d.etat !== 0).length || 0}
            </Badge>
          </div>
          
          {/* Bouton d'ajout d'article - visible pour tous sauf programme */}
          {orderType !== 'programme' && canModifyOrder() && (
            <Button
              variant="success"
              size="sm"
              onClick={handleOpenAddArticleModal}
              className="d-flex align-items-center gap-2 ms-3"
            >
              <FaPlus />
              Ajouter un article
            </Button>
          )}
        </div>
        
        {/* Tableau produits avec scroll horizontal et vertical */}
        <div className="table-scroll" style={{
          borderRadius: '12px',
          border: '1px solid #e5e7eb',
          maxHeight: '600px',
          overflowY: 'auto',
          overflowX: 'auto',
          maxWidth: '100%'
        }}>
          <Table hover className="align-middle mb-0" style={{ 
            minWidth: ['programme', 'tef', 'urgence', 'enlevement', 'rc_public'].includes(orderType || '') ? '6000px' : '800px',
            borderCollapse: 'separate',
            borderSpacing: 0,
            marginBottom: 0
          }}>
            <thead style={{ 
              backgroundColor: '#f8fafb',
              borderBottom: '2px solid #e5e7eb',
              position: 'sticky',
              top: 0,
              zIndex: 10
            }}>
              <tr>
                <th className="border-0" style={{
                  padding: "16px 20px",
                  textAlign: "left",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  color: "#374151",
                  width: "400px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  position: "sticky",
                  left: 0,
                  backgroundColor: "#f8fafb",
                  zIndex: 10,
                  boxShadow: "2px 0 4px rgba(0,0,0,0.1)"
                }}>Produit</th>
                <th className="border-0" style={{
                  padding: "16px 20px",
                  textAlign: "center",
                  fontWeight: "600",
                  fontSize: "0.875rem",
                  color: "#374151",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  position: "sticky",
                  left: "400px",
                  backgroundColor: "#f8fafb",
                  zIndex: 10,
                  boxShadow: "2px 0 4px rgba(0,0,0,0.1)"
                }}>Code</th>
                
                {/* Colonnes spécifiques à chaque type de commande */}
                {(['programme', 'tef', 'urgence', 'enlevement', 'rc_public'].includes(orderType || '')) && (
                  <>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unité</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '150px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantité à commander</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '180px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantités disponibles en début du trimestre</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '180px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantités reçues au cours du trimestre</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '200px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantités distribuées aux clients au cours du trimestre</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '200px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantités perdues au cours du trimestre (pertes)</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '200px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantités transférées au cours du trimestre (ajustement)</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '180px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantités restantes en fin de trimestre</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '180px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantité disponible utilisable</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '150px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>LOT</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '180px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Nombre de jours de rupture de stock</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '120px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>CMM (Réelle pour les PhaG Dis, Ajusté pour les hopitaux )</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '120px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Stock Maximum</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '200px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantité commandée (arrondie au conditionnement)</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", minWidth: '150px', width: '350px', fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>MSD</th>
                  </>
                )}

                      {(orderType === 'rc_prive') && (
                  <>
                    <th className="border-0" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Famille</th>
                    <th className="border-0" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Type</th>
                  </>
                )}
                    

                {(orderType === 'rc_prive' || orderType === 'be') && (
                  <>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantité</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Conso Moyenne</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Prix unitaire</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Montant</th>
       
                  </>
                )}
                
          
                
                {(orderType === 'ferme'  ) && (
                  <>
                  <th className="border-0" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Type</th>
                    <th className="border-0" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Famille</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantité</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Conso Moyenne</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Prix unitaire</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Montant</th>
                  </>
                )}
                
                {/* Colonnes par défaut si pas de type spécifié */}
                {!orderType && (
                  <>
                    <th className="border-0" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Unité</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Quantité</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Prix unitaire</th>
                    <th className="border-0 text-center" style={{ padding: "16px 20px", fontWeight: "600", fontSize: "0.875rem", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>Montant</th>
                  </>
                )}
                
                {/* Colonne Actions pour tous types sauf programme */}
                {orderType !== 'programme' && (
                  <th className="border-0 text-center" style={{ 
                    padding: "16px 20px", 
                    fontWeight: "600", 
                    fontSize: "0.875rem", 
                    color: "#374151", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.5px",
                    position: "sticky",
                    right: 0,
                    backgroundColor: "#f8fafb",
                    zIndex: 10,
                    boxShadow: "-2px 0 4px rgba(0,0,0,0.1)"
                  }}>Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredDetails.map((detail: any, index: number) => {
                // Vérifier si c'est un article regroupé (plusieurs entrées combinées)
                const isGrouped = detail.originalDetails && detail.originalDetails.length > 1;
                // Les articles regroupés ne peuvent pas être édités directement
                const isEditDisabled = !canModifyOrder() || isGrouped;
                const articleKey = `article-${detail.article?.id || detail.article_id || detail.id}`;
                const isExpanded = expandedArticles.has(articleKey);
                
                return (
                <React.Fragment key={detail.id || index}>
                <tr 
                  className={`vg-row ${index % 2 === 0 ? 'vg-row--even' : ''}`}
                  style={{ 
                    borderBottom: isGrouped && isExpanded ? 'none' : '1px solid #f3f4f6',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: isGrouped ? '#fafbfc' : 'white'
                  }}
                >
                  <td style={{ 
                    padding: '16px 20px', 
                    verticalAlign: 'middle',
                    position: "sticky",
                    left: 0,
                    backgroundColor: isGrouped ? '#fafbfc' : 'white',
                    zIndex: 5,
                    boxShadow: "2px 0 4px rgba(0,0,0,0.05)"
                  }}>
                    <div className="d-flex align-items-start gap-2">
                      {isGrouped && (
                        <button
                          onClick={() => toggleArticleExpansion(articleKey)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px',
                            color: '#1FB05B',
                            display: 'flex',
                            alignItems: 'center',
                            marginTop: '2px'
                          }}
                          title={isExpanded ? "Replier" : "Déplier pour voir les détails"}
                        >
                          {isExpanded ? <FaChevronDown size={14} /> : <FaChevronRight size={14} />}
                        </button>
                      )}
                      <div className="d-flex flex-column gap-1" style={{ flex: 1 }}>
                        <span className="text-wrap" style={{ minWidth: '150px', display: 'block', fontSize: '0.9rem', color: '#111827', fontWeight: '500' }}>
                          {detail.produit || detail.designation || detail.article?.designation || "Non défini"}
                        </span>
                        {isGrouped && (
                          <>
                            <Badge bg="info" className="d-flex align-items-center gap-1" style={{ width: 'fit-content', fontSize: '0.75rem' }}>
                              <FaBox style={{ fontSize: '0.7rem' }} />
                              Regroupé - {detail.originalDetails.length} entrées combinées
                            </Badge>
                            <small className="text-muted" style={{ fontSize: '0.7rem', fontStyle: 'italic' }}>
                              Total lignes : {detail.groupedLots?.length || detail.detaillignecommandes?.length || 0} | Quantité totale : {detail.totalQuantite?.toLocaleString('fr-FR') || 0}
                            </small>
                          </>
                        )}
                      </div>
                    </div>
                    {!isGrouped && (
                      <div className="d-flex flex-column gap-1">
                        {detail.etat < 0 && (
                          <Badge bg="danger" className="d-flex align-items-center gap-1" style={{ width: 'fit-content', fontSize: '0.75rem' }}>
                            <FaTimes style={{ fontSize: '0.7rem' }} />
                            Article refusé
                          </Badge>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="text-center" style={{ 
                    padding: '16px 20px', 
                    verticalAlign: 'middle',
                    position: "sticky",
                    left: "400px",
                    backgroundColor: "white",
                    zIndex: 5,
                    boxShadow: "2px 0 4px rgba(0,0,0,0.05)"
                  }}>
                    <span style={{ minWidth: '80px', display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>
                      {detail.code || "N/A"}
                    </span>
                  </td>
                  
                  {/* Cellules spécifiques à chaque type de commande */}
                  {(['programme', 'tef', 'urgence', 'enlevement', 'rc_public'].includes(orderType || '')) && (
                    <>
                      <td className="text-center" style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span style={{ minWidth: '80px', display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>
                          {detail.unite || 'N/A'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.qte_commander_l || 0}
                          onChange={(e) => handleDetailChange(index, 'qte_commander_l', Number.parseFloat(e.target.value) || 0)}
                          style={isGrouped ? fieldStyles.computed : fieldStyles.keyInput}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.qte_debut || 0}
                          onChange={(e) => handleDetailChange(index, 'qte_debut', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.qte_recue || 0}
                          onChange={(e) => handleDetailChange(index, 'qte_recue', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.qte_distribuee || 0}
                          onChange={(e) => handleDetailChange(index, 'qte_distribuee', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.qte_perdue || 0}
                          onChange={(e) => handleDetailChange(index, 'qte_perdue', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.ajustement || 0}
                          onChange={(e) => handleDetailChange(index, 'ajustement', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span className="text-center" style={{ 
                          minWidth: '80px', 
                          display: 'block',
                          backgroundColor: '#e9ecef',
                          padding: '6px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          color: '#495057'
                        }}>
                          {detail.qte_fin || ((detail.qte_debut || 0) + (detail.qte_recue || 0) - (detail.qte_distribuee || 0) - (detail.qte_perdue || 0) + (detail.ajustement || 0))}
                        </span>
                      </td>
                      <td className="text-center" style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Badge bg="primary" className="px-3 py-2" style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                          {isGrouped 
                            ? (detail.totalQuantite || 0).toLocaleString('fr-FR')
                            : (detail.detaillignecommandes?.reduce((sum: number, lot: { quantite?: number }) => sum + (lot.quantite || 0), 0).toLocaleString('fr-FR') || detail.quantite?.toLocaleString('fr-FR') || 0)
                          }
                        </Badge>
                      </td>
                      <td className="text-center" style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <div style={{ minWidth: '150px' }}>
                          {(detail.groupedLots && detail.groupedLots.length > 0) || (detail.detaillignecommandes && detail.detaillignecommandes.length > 0) ? (
                            <div>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => handleShowLotDetails(
                                  detail.groupedLots || detail.detaillignecommandes, 
                                  detail.produit || detail.designation || detail.articleHorsCatalogue || "Produit",
                                  index // Passer l'index pour permettre l'édition
                                )}
                                className="mb-2"
                                disabled={isEditDisabled}
                                title={isGrouped ? "Article regroupé - Affichage de toutes les specs combinées" : "Gérer les specs"}
                              >
                                <FaClipboardList className="me-1" />
                                {(detail.groupedLots || detail.detaillignecommandes).length} spec(s)
                              </Button>
                              <div>
                                {((detail.groupedLots || detail.detaillignecommandes).length > 3) && (
                                  <Badge bg="info" className="mb-1">
                                    +{(detail.groupedLots || detail.detaillignecommandes).length - 3} autres
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ) : (
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleShowLotDetails(
                                [], 
                                detail.produit || detail.designation || detail.articleHorsCatalogue || "Produit",
                                index // Passer l'index pour permettre l'édition
                              )}
                              disabled={isEditDisabled}
                              title={isGrouped ? "Les articles regroupés ne peuvent pas être édités" : "Ajouter des specs"}
                            >
                              <FaPlus className="me-1" />
                              Ajouter specs
                            </Button>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.nb_jour_rupture || 0}
                          onChange={(e) => handleDetailChange(index, 'nb_jour_rupture', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.cmm || 0}
                          onChange={(e) => handleDetailChange(index, 'cmm', Number.parseFloat(e.target.value) || 0)}
                          style={{ 
                            minWidth: '80px',
                            backgroundColor: '#e9ecef',
                            border: '1px solid #ced4da',
                            borderRadius: '6px',
                            color: '#495057'
                          }}
                          disabled={isEditDisabled}
                          title={isGrouped ? "Les articles regroupés ne peuvent pas être édités directement" : ""}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.stock_max?.toFixed() || 0}
                          readOnly
                          style={fieldStyles.computed}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.qte_commandee || 0}
                          readOnly
                          style={fieldStyles.computedGreen}
                        />
                      </td>
                      
                      
                      <td className="text-center" style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Badge bg="warning" className="px-3 py-2" style={{ fontSize: '0.95rem', fontWeight: '600' }}>
                          {detail.cmm > 0
                            ? ((isGrouped 
                                ? detail.totalQuantite 
                                : (detail.detaillignecommandes?.reduce((sum: number, lot: { quantite?: number }) => sum + (lot.quantite || 0), 0) || detail.quantite || 0)
                              ) / detail.cmm).toFixed(2)
                            : "N/A"}
                        </Badge>
                      </td>
                    </>
                  )}

                     {(orderType === 'rc_prive') && (
                    <>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        {renderFamilleSelector(detail, index)}
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span style={{ minWidth: '120px', display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>
                          {detail.catalogue ===1 ? "Catalogue" : "Hors Catalogue"}
                        </span>
                      </td>
                    </>
                  )}
                  
                  {(orderType === 'ferme' ) && (
                    <>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span style={{ minWidth: '120px', display: 'block', fontSize: '0.875rem', color: '#6b7280' }}>
                          {detail.catalogue ===1 ? "Catalogue" : "Hors Catalogue"}
                        </span>
                      </td>                    
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        {renderFamilleSelector(detail, index)}
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.quantite || 0}
                          onChange={(e) => handleDetailChange(index, 'quantite', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={!canModifyOrder()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.cmm || 0}
                          onChange={(e) => handleDetailChange(index, 'cmm', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={!canModifyOrder()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.prix || 0}
                          onChange={(e) => handleDetailChange(index, 'prix', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={!canModifyOrder()}
                        />
                      </td>
                      <td className="text-center" style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#059669' }}>{((detail.quantite || 0) * (detail.prix || 0)).toLocaleString()} AR</strong>
                      </td>
                    </>

                  )}
                  {(orderType === 'rc_prive' || orderType === 'be') && (
                    <>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.quantite || 0}
                          onChange={(e) => handleDetailChange(index, 'quantite', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={!canModifyOrder()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.cmm || 0}
                          onChange={(e) => handleDetailChange(index, 'cmm', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={!canModifyOrder()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span className="text-center" style={{ minWidth: '100px', display: 'block', fontSize: '0.875rem', color: '#111827', fontWeight: '500' }}>
                          {(detail.prix || 0).toLocaleString()} AR
                        </span>
                      </td>
                      <td className="text-center" style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#059669' }}>{((detail.quantite || 0) * (detail.prix || 0)).toLocaleString()} AR</strong>
                      </td>
                    </>
                  )}
                  {/* Cellules par défaut si pas de type spécifié */}
                  {!orderType && (
                    <>
                      {/* <td>
                        <Form.Control
                          type="text"
                          size="sm"
                          value={detail.unite || ""}
                          onChange={(e) => handleDetailChange(index, 'unite', e.target.value)}
                          style={{ minWidth: '80px' }}
                        />
                      </td> */}
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={detail.quantite || 0}
                          onChange={(e) => handleDetailChange(index, 'quantite', Number.parseFloat(e.target.value) || 0)}
                          style={{ minWidth: '80px' }}
                          disabled={!canModifyOrder()}
                        />
                      </td>
                      <td style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <span className="text-center" style={{ minWidth: '100px', display: 'block', fontSize: '0.875rem', color: '#111827', fontWeight: '500' }}>
                          {(detail.prix_unitaire || 0).toLocaleString()} AR
                        </span>
                      </td>
                      <td className="text-center" style={{ padding: '16px 20px', verticalAlign: 'middle' }}>
                        <strong style={{ fontSize: '0.95rem', color: '#059669' }}>{((detail.quantite || 0) * (detail.prix_unitaire || 0)).toLocaleString()} AR</strong>
                      </td>
                    </>
                  )}
                  
                  {/* Colonne Actions pour tous types sauf programme */}
                  {orderType !== 'programme' && (
                    <td className="text-center" style={{ 
                      padding: '16px 20px', 
                      verticalAlign: 'middle',
                      position: "sticky",
                      right: 0,
                      backgroundColor: "white",
                      zIndex: 5,
                      boxShadow: "-2px 0 4px rgba(0,0,0,0.05)"
                    }}>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleRemoveArticle(index)}
                        disabled={!canModifyOrder()}
                        title="Supprimer cet article"
                        style={{
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  )}
                </tr>
                
                {/* Lignes dépliées pour les articles regroupés */}
                {isGrouped && isExpanded && detail.originalDetails?.map((originalDetail: any, subIndex: number) => (
                  <tr 
                    key={`${detail.id}-sub-${subIndex}`}
                    style={{
                      backgroundColor: '#f8f9fa',
                      borderBottom: subIndex === detail.originalDetails.length - 1 ? '1px solid #f3f4f6' : '1px solid #e9ecef'
                    }}
                  >
                    <td style={{ 
                      padding: '12px 20px 12px 50px',
                      verticalAlign: 'middle',
                      position: "sticky",
                      left: 0,
                      backgroundColor: '#f8f9fa',
                      zIndex: 5,
                      boxShadow: "2px 0 4px rgba(0,0,0,0.05)"
                    }}>
                      <div className="d-flex flex-column">
                        <small className="text-muted" style={{ fontSize: '0.85rem' }}>
                          ↳ Lot #{originalDetail.id}
                        </small>
                                                </div>
                    </td>
                    <td className="text-center" style={{ 
                      padding: '12px 20px', 
                      verticalAlign: 'middle',
                      position: "sticky",
                      left: "400px",
                      backgroundColor: '#f8f9fa',
                      zIndex: 5,
                      boxShadow: "2px 0 4px rgba(0,0,0,0.05)"
                    }}>
                      <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>-</small>
                    </td>
                    
                    {(['programme', 'tef', 'urgence', 'enlevement', 'rc_public'].includes(orderType || '')) && (
                      <>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>-</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <Badge bg="secondary" style={{ fontSize: '0.8rem' }}>{originalDetail.qte_commander_l || 0}</Badge>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.qte_debut || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.qte_recue || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.qte_distribuee || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.qte_perdue || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.ajustement || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.qte_fin || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <Badge bg="primary" style={{ fontSize: '0.8rem' }}>{originalDetail.quantite?.toLocaleString('fr-FR') || 0}</Badge>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small className="text-muted" style={{ fontSize: '0.75rem' }}>-</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.nb_jour_rupture || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.cmm || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.stock_max || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.qte_commandee || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.msd || 0}</small>
                        </td>
                      </>
                    )}
                    
                    {(orderType === 'rc_prive') && (
                      <>
                        <td style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small className="text-muted" style={{ fontSize: '0.85rem' }}>-</small>
                        </td>
                        <td style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.catalogue === 1 ? "Catalogue" : "Hors Catalogue"}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <Badge bg="secondary" style={{ fontSize: '0.8rem' }}>{originalDetail.quantite || 0}</Badge>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.cmm || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{(originalDetail.prix || 0).toLocaleString()} AR</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>{((originalDetail.quantite || 0) * (originalDetail.prix || 0)).toLocaleString()} AR</small>
                        </td>
                      </>
                    )}
                    
                    {(orderType === 'ferme') && (
                      <>
                        <td style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.catalogue === 1 ? "Catalogue" : "Hors Catalogue"}</small>
                        </td>
                        <td style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small className="text-muted" style={{ fontSize: '0.85rem' }}>-</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <Badge bg="secondary" style={{ fontSize: '0.8rem' }}>{originalDetail.quantite || 0}</Badge>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.cmm || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{(originalDetail.prix || 0).toLocaleString()} AR</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>{((originalDetail.quantite || 0) * (originalDetail.prix || 0)).toLocaleString()} AR</small>
                        </td>
                      </>
                    )}
                    
                    {(orderType === 'be') && (
                      <>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <Badge bg="secondary" style={{ fontSize: '0.8rem' }}>{originalDetail.quantite || 0}</Badge>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{originalDetail.cmm || 0}</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{(originalDetail.prix || 0).toLocaleString()} AR</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>{((originalDetail.quantite || 0) * (originalDetail.prix || 0)).toLocaleString()} AR</small>
                        </td>
                      </>
                    )}
                    
                    {!orderType && (
                      <>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <Badge bg="secondary" style={{ fontSize: '0.8rem' }}>{originalDetail.quantite || 0}</Badge>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#6b7280' }}>{(originalDetail.prix_unitaire || 0).toLocaleString()} AR</small>
                        </td>
                        <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', backgroundColor: '#f8f9fa' }}>
                          <small style={{ fontSize: '0.85rem', color: '#059669', fontWeight: '600' }}>{((originalDetail.quantite || 0) * (originalDetail.prix_unitaire || 0)).toLocaleString()} AR</small>
                        </td>
                      </>
                    )}
                    
                    {orderType !== 'programme' && (
                      <td className="text-center" style={{ padding: '12px 20px', verticalAlign: 'middle', position: "sticky", right: 0, backgroundColor: '#f8f9fa', zIndex: 5, boxShadow: "-2px 0 4px rgba(0,0,0,0.05)" }}>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>-</small>
                      </td>
                    )}
                  </tr>
                ))}
                </React.Fragment>
              );
              })}
            </tbody>
            {/* Ligne de total si il y a des montants */}
            {hasAmounts() && (
              <tfoot>
              <tr style={{ 
                backgroundColor: '#f0fdf4',
                borderTop: '2px solid #1FB05B'
              }}>
              
                     {(orderType === 'rc_prive') && (
                      <>
                      <td style={{ padding: '16px 20px' }}></td>
                      <td style={{ padding: '16px 20px' }}></td>
                      </>
                     )}
              <td colSpan={orderType === 'programme' ? 16 : orderType === 'rc_prive' || orderType === 'be' ? 5 : 4} className="text-end" style={{ padding: '16px 20px' }}>
              <strong style={{ fontSize: '1rem', color: '#374151' }}>Total :</strong>
              </td>
              <td className="text-center" style={{ padding: '16px 20px' }}>
              <strong className="text-success" style={{ fontSize: '1.1rem', fontWeight: '700' }}>
                {calculateTotal().toLocaleString()} AR
              </strong>
              </td>
              </tr>
              </tfoot>
            )}
          </Table>
        </div>
      </div>

      {/* Section RAL - affichée uniquement s'il existe des lignes en rupture */}
      {ralDetails.length > 0 && (
        <Card className="border mt-4 shadow-sm" style={{ borderRadius: '14px', borderColor: '#F0C060' }}>
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{ backgroundColor: '#FFFBF0', borderBottom: '1px solid #F0C060' }}
          >
            <h6 className="mb-0 d-flex align-items-center gap-2" style={{ color: '#1FB05B', fontWeight: 700 }}>
              <FaBox />
              Articles en rupture de stock (RAL)
            </h6>
            <Badge bg="danger" className="px-3 py-2" style={{ fontSize: '0.875rem' }}>
              {ralDetails.length} article(s)
            </Badge>
          </Card.Header>

          <Card.Body>
            <div className="table-responsive" style={{ border: '1px solid #F0C060', borderRadius: '10px' }}>
              <Table hover className="mb-0 align-middle">
                <thead style={{ backgroundColor: '#FFFBF0' }}>
                  <tr>
                    <th style={{ padding: '12px 16px', color: '#1FB05B' }}>Produit</th>
                    <th style={{ padding: '12px 16px', color: '#1FB05B' }}>Code</th>
                    <th className="text-center" style={{ padding: '12px 16px', color: '#1FB05B' }}>Quantité manquante</th>
                    <th className="text-center" style={{ padding: '12px 16px', color: '#1FB05B' }}>État RAL</th>
                  </tr>
                </thead>
                <tbody>
                  {ralDetails.map((detail: any, index: number) => (
                    <tr key={`ral-${detail.id || index}`}>
                      <td style={{ padding: '12px 16px' }}>
                        {detail.produit || detail.designation || detail.article_text || 'N/A'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>{detail.code || '-'}</td>
                      <td className="text-center" style={{ padding: '12px 16px' }}>
                        <strong>{getRalMissingQuantity(detail).toLocaleString('fr-FR')}</strong>
                      </td>
                      <td className="text-center" style={{ padding: '12px 16px' }}>
                        {getRalBadge(detail)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>

            <div
              className="mt-3 p-3 rounded-3"
              style={{
                backgroundColor: ralState === 'C' ? '#FFFBF0' : '#FFFBF0',
                border: ralState === 'C' ? '1px solid #F0C060' : '1px solid #F0C060'
              }}
            >
              {ralState === 'A' ? (
                <div className="d-flex flex-column gap-3">
                  <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3">
                    <p className="mb-0" style={{ color: '#1FB05B', fontWeight: 500 }}>
                      Souhaitez-vous toujours recevoir ces articles ?
                    </p>
                    <Button
                      variant="success"
                      onClick={handleConfirmRalNeed}
                      disabled={isSubmittingRal}
                      className="d-flex align-items-center gap-2"
                      style={{ fontWeight: 600 }}
                    >
                      {isSubmittingRal ? (
                        <>
                          <div className="spinner-border spinner-border-sm" role="status">
                            <span className="visually-hidden">Envoi...</span>
                          </div>
                          Envoi...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Confirmer mon besoin
                        </>
                      )}
                    </Button>
                  </div>
                  {ralActionError && (
                    <div className="text-danger" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                      {ralActionError}
                    </div>
                  )}
                </div>
              ) : ralState === 'B' ? (
                <p className="mb-0" style={{ color: '#1FB05B', fontWeight: 600 }}>
                  Besoin confirmé — en attente de validation par Salama
                </p>
              ) : (
                <p className="mb-0" style={{ color: '#1FB05B', fontWeight: 600 }}>
                  Besoin validé par Salama. Consultez l'onglet Facture Proforma pour valider la proforma RAL.
                </p>
              )}
            </div>

            <div className="mt-3 d-flex justify-content-end">
              <Button
                variant="outline-primary"
                onClick={handleDownloadRalPdf}
                disabled={isDownloadingRalPdf}
                className="d-flex align-items-center gap-2"
              >
                {isDownloadingRalPdf ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <FaPrint />
                    Télécharger le PDF RAL
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Section Commentaire */}
      <div className="mt-4">
        <CommentInput
          value={localData.commentaire || ''}
          onChange={(value) => setLocalData((prev: any) => ({ ...prev, commentaire: value }))}
          placeholder="Ajouter ou modifier le commentaire de la commande..."
          label="Commentaire de la commande"
          disabled={!canModifyOrder()}
        />
      </div>
      
      <div className="mt-4 d-flex justify-content-between align-items-center">
        <div className="text-muted">
          {Data.detailcommandes.length} produit(s) dans la commande
        </div>
        {user?.login && (
            <div className="d-flex gap-2">
              {/* Pour les commandes de type programme */}
              {(
                // Pour les autres types de commandes (rc, tef, be, ferme)
                <>
                  {/* Si aucune modification n'a été faite et que l'utilisateur est validateur */}
                  {!hasModifications() && (user?.role_id === 11 || 1===1) && Data.etat <= 1 && Data.validationclient === null ? (
                    <Button 
                      variant="primary"
                      className="d-flex align-items-center gap-2"
                      onClick={handleRequestValidation}
                      disabled={isValidating}
                    >
                      <FaCheck />
                      {isValidating ? "Validation..." : "Confirmer la commande"}
                    </Button>
                  ) : (
                  null
                  )}
                </>
              )}
              {Data.etat <= 1 && Data.validationclient === null && (
                      <Button 
                        variant="success"
                        className="d-flex align-items-center gap-2"
                        onClick={handleRequestModification}
                        disabled={isSubmitting}
                      >
                        <FaCheck />
                        {isSubmitting ? "Modification..." : "Modifier la commande"}
                      </Button>
                    )}
            </div>
        )}
      </div>

      {/* Modal pour afficher les détails des lots */}
      <Modal 
        show={showLotModal} 
        onHide={handleCloseLotModal} 
        size="lg" 
        centered
      >
        <Modal.Header style={{ 
          backgroundColor: '#f8fdf9', 
          borderBottom: '2px solid #1FB05B',
          padding: '20px 24px'
        }}>
          <div style={{ flex: 1 }}>
            <Modal.Title style={{ 
              color: '#1FB05B', 
              fontSize: '1.25rem',
              fontWeight: '600',
              marginBottom: '4px'
            }}>
              Gestion des lots
            </Modal.Title>
            <p style={{ 
              margin: 0, 
              color: '#6b7280', 
              fontSize: '0.875rem',
              fontWeight: '500'
            }}>
              {selectedProductName}
            </p>
          </div>
          <button
            onClick={handleCloseLotModal}
            style={{
              background: 'none',
              border: 'none',
              color: '#6b7280',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.color = '#374151';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#6b7280';
            }}
          >
            <FaTimes size={20} />
          </button>
        </Modal.Header>
        
        <Modal.Body style={{ padding: '24px' }}>
          {/* Résumé */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: '#f0fdf4',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #bbf7d0'
          }}>
            <div>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Nombre de lots</span>
              <p style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1FB05B' 
              }}>
                {selectedLots.length}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>Quantité totale</span>
              <p style={{ 
                margin: 0, 
                fontSize: '1.5rem', 
                fontWeight: '700', 
                color: '#1FB05B' 
              }}>
                {selectedLots.reduce((sum, lot) => sum + Number(lot.quantite || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Bouton d'ajout */}
          <button
            onClick={handleAddLot}
            disabled={!canModifyOrder()}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '12px',
              border: '2px dashed #1FB05B',
              borderRadius: '8px',
              backgroundColor: '#f8fdf9',
              color: '#1FB05B',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: canModifyOrder() ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s ease',
              marginBottom: '20px',
              outline: 'none',
              opacity: canModifyOrder() ? 1 : 0.5
            }}
            onMouseEnter={(e) => {
              if (canModifyOrder()) {
                e.currentTarget.style.backgroundColor = '#1FB05B';
                e.currentTarget.style.color = 'white';
                e.currentTarget.style.borderStyle = 'solid';
              }
            }}
            onMouseLeave={(e) => {
              if (canModifyOrder()) {
                e.currentTarget.style.backgroundColor = '#f8fdf9';
                e.currentTarget.style.color = '#1FB05B';
                e.currentTarget.style.borderStyle = 'dashed';
              }
            }}
          >
            <FaPlus size={16} />
            <span>Ajouter un nouveau lot</span>
          </button>

          {/* Liste des lots */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '12px',
            maxHeight: '400px',
            overflowY: 'auto',
            paddingRight: '4px'
          }}>
            {selectedLots.length > 0 ? (
              selectedLots.map((lot: any, index: number) => (
                <div
                  key={lot.id || index}
                  style={{
                    position: 'relative',
                    padding: '16px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '10px',
                    backgroundColor: 'white',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#1FB05B';
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(31,176,91,0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
                  }}
                >
                  {/* Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '12px',
                    paddingBottom: '12px',
                    borderBottom: '1px solid #f3f4f6'
                  }}>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      color: '#1FB05B',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      backgroundColor: '#f0fdf4',
                      padding: '4px 12px',
                      borderRadius: '12px'
                    }}>
                      Lot {index + 1}
                    </span>
                    <button
                      onClick={() => handleRemoveLot(index)}
                      disabled={!canModifyOrder()}
                      style={{
                        padding: '6px 12px',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        backgroundColor: 'white',
                        color: '#dc2626',
                        cursor: canModifyOrder() ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '0.813rem',
                        fontWeight: '500',
                        outline: 'none',
                        opacity: canModifyOrder() ? 1 : 0.5
                      }}
                      onMouseEnter={(e) => {
                        if (canModifyOrder()) {
                          e.currentTarget.style.backgroundColor = '#fef2f2';
                          e.currentTarget.style.borderColor = '#ef4444';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (canModifyOrder()) {
                          e.currentTarget.style.backgroundColor = 'white';
                          e.currentTarget.style.borderColor = '#fecaca';
                        }
                      }}
                      title="Supprimer"
                    >
                      <FaTrash size={12} />
                      <span>Supprimer</span>
                    </button>
                  </div>

                  {/* Champs du lot */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '12px'
                  }}>
                    {/* N° de Lot */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaBarcode style={{ color: '#1FB05B' }} />
                        N° de Lot
                      </label>
                      <Form.Control
                        type="text"
                        size="sm"
                        placeholder="Numéro du lot"
                        value={lot.lot || ""}
                        onChange={(e) => handleUpdateLot(index, 'lot', e.target.value)}
                        disabled={!canModifyOrder()}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          padding: '8px 12px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#1FB05B';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,176,91,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Quantité */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaBox style={{ color: '#1FB05B' }} />
                        Quantité
                      </label>
                      <Form.Control
                        type="number"
                        size="sm"
                        placeholder="0"
                        value={lot.quantite || ""}
                        onChange={(e) => handleUpdateLot(index, 'quantite', Number(e.target.value) || 0)}
                        disabled={!canModifyOrder()}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          padding: '8px 12px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#1FB05B';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(31,176,91,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>

                    {/* Date de péremption */}
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '6px'
                    }}>
                      <label style={{ 
                        fontSize: '0.75rem', 
                        color: '#6b7280', 
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaCalendarAlt style={{ color: '#dc2626' }} />
                        Date d'expiration
                      </label>
                      <Form.Control
                        type="date"
                        size="sm"
                        value={lot.dateperemption || ""}
                        onChange={(e) => handleUpdateLot(index, 'dateperemption', e.target.value)}
                        disabled={!canModifyOrder()}
                        style={{
                          borderRadius: '8px',
                          border: '1px solid #d1d5db',
                          padding: '8px 12px',
                          fontSize: '0.875rem',
                          transition: 'all 0.2s ease'
                        }}
                        onFocus={(e) => {
                          e.currentTarget.style.borderColor = '#dc2626';
                          e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220,38,38,0.1)';
                        }}
                        onBlur={(e) => {
                          e.currentTarget.style.borderColor = '#d1d5db';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Indicateur d'expiration */}
                  {lot.dateperemption && new Date(lot.dateperemption) < new Date() && (
                    <div style={{ marginTop: '12px' }}>
                      <div style={{
                        padding: '8px 12px',
                        backgroundColor: '#fef2f2',
                        border: '1px solid #fecaca',
                        borderRadius: '6px',
                        color: '#dc2626',
                        fontSize: '0.813rem',
                        fontWeight: '500',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        ⚠️ Ce lot est expiré depuis le {new Date(lot.dateperemption).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{
                padding: '48px 24px',
                textAlign: 'center',
                color: '#9ca3af',
                fontSize: '0.875rem',
                backgroundColor: '#f9fafb',
                borderRadius: '8px',
                border: '2px dashed #e5e7eb'
              }}>
                <p style={{ margin: 0, fontSize: '1rem', fontWeight: '500', marginBottom: '8px' }}>
                  Aucun lot défini
                </p>
                <p style={{ margin: 0, fontSize: '0.813rem' }}>
                  Cliquez sur "Ajouter un nouveau lot" pour commencer
                </p>
              </div>
            )}
          </div>
        </Modal.Body>
        
        <Modal.Footer style={{ 
          backgroundColor: '#f9fafb', 
          borderTop: '1px solid #e5e7eb',
          padding: '16px 24px',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end'
        }}>
          <Button 
            variant="outline-secondary"
            onClick={handleCloseLotModal}
            style={{
              borderRadius: '8px',
              padding: '10px 24px',
              fontWeight: '500',
              fontSize: '0.875rem',
              border: '1px solid #d1d5db',
              color: '#6b7280',
              backgroundColor: 'white',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f3f4f6';
              e.currentTarget.style.borderColor = '#9ca3af';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            Annuler
          </Button>
          {selectedProductIndex !== null && (
            <Button 
              variant="success"
              onClick={handleSaveLotChanges}
              disabled={!canModifyOrder()}
              style={{
                borderRadius: '8px',
                padding: '10px 24px',
                fontWeight: '500',
                fontSize: '0.875rem',
                backgroundColor: '#1FB05B',
                border: 'none',
                color: 'white',
                transition: 'all 0.2s ease',
                opacity: canModifyOrder() ? 1 : 0.5,
                cursor: canModifyOrder() ? 'pointer' : 'not-allowed'
              }}
              onMouseEnter={(e) => {
                if (canModifyOrder()) {
                  e.currentTarget.style.backgroundColor = '#18a04b';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(31,176,91,0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (canModifyOrder()) {
                  e.currentTarget.style.backgroundColor = '#1FB05B';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              <FaCheck className="me-1" />
              Sauvegarder
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Modal d'ajout d'article */}
      <Modal 
        show={showAddArticleModal} 
        onHide={handleCloseAddArticleModal} 
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#1FB05B" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaPlus />
            Ajouter un article à la commande
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4">
          <Form>
            <div className="row g-3">
              {/* Type (Catalogue / Hors Catalogue) */}
              <div className="col-12">
                <Form.Group>
                  <Form.Label><strong>Type d'article</strong></Form.Label>
                  <Form.Select
                    value={newArticle.catalogue}
                    onChange={(e) => {
                      const isCatalogue = Number(e.target.value);
                      setNewArticle({ 
                        ...newArticle, 
                        catalogue: isCatalogue,
                        produit: '',
                        code: '',
                        prix: 0,
                        article_id: null,
                        famille_id: ''
                      });
                      setSearchArticle('');
                    }}
                  >
                    <option value={0}>Hors Catalogue</option>
                    <option value={1}>Catalogue</option>
                  </Form.Select>
                </Form.Group>
              </div>

              {/* Recherche dans le catalogue si Catalogue est sélectionné */}
              {newArticle.catalogue === 1 ? (
                <div className="col-12">
                  <Form.Group>
                    <Form.Label>
                      <strong>Rechercher un article  </strong> <span className="text-danger">*</span>
                    </Form.Label>
                    <div style={{ position: 'relative' }}>
                      <Form.Control
                        type="text"
                        list="catalogue-articles-options"
                        placeholder="Tapez pour rechercher ou dérouler..."
                        value={searchArticle}
                        onChange={(e) => handleCatalogueSearchChange(e.target.value)}
                        autoComplete="off"
                      />
                      <FaSearch 
                        style={{ 
                          position: 'absolute', 
                          right: '12px', 
                          top: '50%', 
                          transform: 'translateY(-50%)',
                          color: '#6c757d',
                          pointerEvents: 'none'
                        }} 
                      />
                      <datalist id="catalogue-articles-options">
                        {filteredCatalogueArticles.map((article: any) => (
                          <option
                            key={article.id}
                            value={formatCatalogueOption(article)}
                          >
                            {article.designation}
                          </option>
                        ))}
                      </datalist>
                    </div>

                    {loadingArticles && (
                      <div className="mt-2 text-muted small d-flex align-items-center gap-2">
                        <div className="spinner-border spinner-border-sm" role="status">
                          <span className="visually-hidden">Chargement...</span>
                        </div>
                        Chargement du catalogue...
                      </div>
                    )}
                    {!loadingArticles && searchArticle && !newArticle.article_id && filteredCatalogueArticles.length === 0 && (
                      <div className="mt-2 text-danger small">
                      Aucun article ne correspond à votre recherche.
                      </div>
                    )}
                  </Form.Group>

                  {/* Afficher les détails de l'article sélectionné */}
                  {newArticle.article_id && (
                    <div 
                      className="mt-3 p-3" 
                      style={{ 
                        backgroundColor: '#e7f5ec', 
                        borderRadius: '8px',
                        border: '1px solid #1FB05B'
                      }}
                    >
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <FaCheck style={{ color: '#1FB05B' }} />
                        <strong style={{ color: '#1FB05B' }}>Article sélectionné</strong>
                      </div>
                      <div><strong>Nom:</strong> {newArticle.produit}</div>
                      <div><strong>Code:</strong> {newArticle.code || 'N/A'}</div>
                      {/* Prix masqué pour urgence, enlevement, tef et rc_public */}
                      {!['urgence', 'enlevement', 'tef', 'rc_public'].includes(orderType || '') && (
                        <div><strong>Prix:</strong> {newArticle.prix.toLocaleString()} AR</div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {/* Nom du produit - pour hors catalogue */}
                  <div className="col-md-6">
                    <Form.Group>
                      <Form.Label>
                        <strong>Nom du produit</strong> <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Entrez le nom du produit"
                        value={newArticle.produit}
                        onChange={(e) => setNewArticle({ ...newArticle, produit: e.target.value })}
                      />
                    </Form.Group>
                  </div>
 

                  {/* Famille - pour hors catalogue */}
                  <div className="col-6">
                    <Form.Group>
                      <Form.Label><strong>Famille</strong></Form.Label>
                      <Form.Select
                        value={newArticle.famille_id}
                        onChange={(e) => setNewArticle({ ...newArticle, famille_id: e.target.value })}
                      >
                        <option value="">Sélectionner une famille</option>
                        {sousFamilles.map((famille) => (
                          <option key={famille.id} value={famille.id}>
                            {famille.designation}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </div>
                </>
              )}

              {/* Quantité - masqué pour urgence, enlevement, tef et rc_public */}
              {!['urgence', 'enlevement', 'tef', 'rc_public'].includes(orderType || '') && (
                <div className="col-md-4">
                  <Form.Group>
                  <Form.Label>
                    <strong>Quantité</strong> <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    min="0"
                    placeholder="0"
                    value={newArticle.quantite}
                    onChange={(e) => {
                    const value = Number(e.target.value) || 0;
                    setNewArticle({ ...newArticle, quantite: value });
                    }}
                  />
                  {newArticle.catalogue === 1 && newArticle.quantite % 10 !== 0 && (
                    <div className="text-danger mt-2" style={{ fontSize: "0.875rem" }}>
                    La quantité doit être un multiple de 10  
                    </div>
                  )}
                  </Form.Group>
                </div>
              )}

              {/* CMM - masqué pour urgence, enlevement, tef et rc_public */}
              {!['urgence', 'enlevement', 'tef', 'rc_public'].includes(orderType || '') && (
                <div className="col-md-7">
                  <Form.Group>
                    <Form.Label><strong>Consommation Moyenne (CMM)</strong></Form.Label>
                    <Form.Control
                      type="number"
                      min="0"
                      placeholder="0"
                      value={newArticle.cmm}
                      onChange={(e) => setNewArticle({ ...newArticle, cmm: Number(e.target.value) || 0 })}
                    />
                  </Form.Group>
                </div>
              )}


              {/* Afficher le prix pour les articles du catalogue */}
              {!['urgence', 'enlevement', 'tef', 'rc_public'].includes(orderType || '') && (orderType === 'rc_prive' || orderType === 'be' || orderType === 'ferme') && newArticle.catalogue === 1 && newArticle.article_id && (
                <div className="col-md-4">
                  <Form.Group>
                    <Form.Label>
                      <strong>Prix unitaire</strong>
                      {loadingTarif && orderType !== 'ferme' && (
                        <span className="ms-2 text-muted" style={{ fontSize: '0.8rem' }}>
                          <span className="spinner-border spinner-border-sm me-1" role="status" />
                          Chargement...
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="number"
                      value={newArticle.prix || 0}
                      onChange={(e) => {
                        if (orderType === 'ferme') {
                          setNewArticle({ ...newArticle, prix: parseFloat(e.target.value) || 0 });
                        }
                      }}
                      disabled={orderType !== 'ferme'}
                      readOnly={orderType !== 'ferme'}
                      style={{
                        backgroundColor: orderType === 'ferme' ? '#fff' : '#e9ecef',
                        fontWeight: '600'
                      }}
                    />
                  </Form.Group>
                </div>
              )}
            </div>
          </Form>
        </Modal.Body>
        
        <Modal.Footer style={{ borderTop: '1px solid #e5e7eb' }}>
          <Button 
            variant="outline-secondary" 
            onClick={handleCloseAddArticleModal}
          >
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={handleAddArticle}
            className="d-flex align-items-center gap-2"
          >
            <FaPlus />
            Ajouter
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation pour la modification */}
      <Modal 
        show={showConfirmation} 
        onHide={handleCancelModification} 
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#1FB05B" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaClipboardList />
            Confirmation de modification
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <FaClipboardList style={{ fontSize: '48px', color: '#1FB05B' }} />
          </div>
          <h5 className="mb-3">Modifier la commande</h5>
          <p className="text-muted">
            Êtes-vous sûr de vouloir sauvegarder les modifications apportées à cette commande ?
          </p>
          
          {/* Message d'avertissement pour les utilisateurs validateurs (sauf pour les commandes programme) */}
          {(1===1 || user?.login && user?.role_id === 11) && orderType !== 'programme' && (
            <div 
              className="alert alert-warning mt-3 mb-0" 
              style={{ 
                backgroundColor: '#fff3cd',
                borderColor: '#ffc107',
                borderRadius: '8px',
                fontSize: '0.875rem'
              }}
            >
              <strong>⚠️ Attention :</strong> En tant qu'utilisateur validateur, cette modification 
              <strong> validera automatiquement la commande</strong>. 
              Vous ne pourrez plus effectuer de modifications après cette action.
            </div>
          )}
          
          {/* Message pour les commandes programme */}
          
          {/* Message par défaut */}
          {(!user?.login || !(user?.role_id === 11)) && orderType !== 'programme' && (
            <div className="text-muted small">
              Cette action modifiera définitivement les données de la commande.
            </div>
          )}
        </Modal.Body>
        
        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancelModification}
            className="px-4 me-2"
          >
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleConfirmModification(false)}
            className="px-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Modification...</span>
                </div>
                Modification...
              </>
            ) : (
              <>
                <FaCheck className="me-1" />
                Confirmer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation pour la validation */}
      <Modal 
        show={showValidationConfirmation} 
        onHide={handleCancelValidation} 
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#1FB05B" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaCheck />
            Confirmation de validation
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <FaCheck style={{ fontSize: '48px', color: '#1FB05B' }} />
          </div>
          <h5 className="mb-3">Valider la commande</h5>
          <p className="text-muted">
            Êtes-vous sûr de vouloir valider cette commande ?
          </p>
          <div className="text-muted small">
            Cette action marquera la commande comme validée par le client.
          </div>
        </Modal.Body>
        
        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancelValidation}
            className="px-4 me-2"
          >
            Annuler
          </Button>
          <Button 
            variant="success" 
            onClick={() => handleConfirmModification(true)}
            className="px-4"
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Validation...</span>
                </div>
                Validation...
              </>
            ) : (
              <>
                <FaCheck className="me-1" />
                Confirmer la validation
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation pour la suppression */}
      <Modal 
        show={showDeleteConfirmation} 
        onHide={handleCancelDelete} 
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#1FB05B" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2 text-white fs-4">
            <FaTrash /> 
            suppression
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <FaTrash style={{ fontSize: '48px', color: '#dc3545' }} />
          </div>
          <p className="text-muted fs-5">
            Êtes-vous sûr de vouloir supprimer cet article de la commande ?
          </p>
          <div className="text-muted small">
            Cette action est irréversible.
          </div>
        </Modal.Body>
        
        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancelDelete}
            className="px-4 me-2"
          >
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmDelete}
            className="px-4"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Suppression...</span>
                </div>
                Suppression...
              </>
            ) : (
              <>
                <FaTrash className="me-1" />
                Supprimer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Notification Popup */}
      {notification.isVisible && (
        <NotificationPopup
          isVisible={notification.isVisible}
          type={notification.type}
          title={notification.title}
          message={notification.message}
          onClose={hideNotification}
        />
      )}

      {/* Styles pour l'impression et tableau */}
      <style>{`
        /* Styles pour le tableau */
        .vg-row {
          background-color: transparent;
        }
        .vg-row--even {
          background-color: #f9fafb;
        }
        .vg-row:hover {
          background-color: #f3f4f6 !important;
        }
        .vg-row:hover td[style*="position: sticky"] {
          background-color: #f3f4f6 !important;
        }
        .vg-row--even td[style*="position: sticky"] {
          background-color: #f9fafb !important;
        }
        .table-scroll {
          scrollbar-width: auto;
          scrollbar-color: #0f8c4b #e5e7eb;
        }
        .table-scroll::-webkit-scrollbar {
          width: 18px;
          height: 18px;
        }
        .table-scroll::-webkit-scrollbar-track {
          background: #d1d5db;
          border-radius: 8px;
          margin: 4px 0;
        }
        .table-scroll::-webkit-scrollbar-thumb {
          background: #0f8c4b;
          border-radius: 8px;
          min-height: 44px;
          border: 2px solid #d1d5db;
        }
        .table-scroll::-webkit-scrollbar-thumb:hover {
          background: #0a5c33;
          box-shadow: 0 0 8px rgba(15, 140, 75, 0.5);
        }
        .table-scroll::-webkit-scrollbar-thumb:active {
          background: #064620;
        }
        /* Accessibility: Focus visible pour navigation au clavier */
        .table-scroll:focus-visible {
          outline: 3px solid #1FB05B;
          outline-offset: 2px;
        }
        
        @media print {
          /* Masquer les boutons et éléments non nécessaires à l'impression */
          button,
          .btn,
          .modal,
          .modal-backdrop {
            display: none !important;
          }

          /* Optimiser la mise en page pour l'impression */
          body {
            background: white !important;
          }

          .bg-white {
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }

          /* Assurer que les tableaux s'impriment correctement */
          .table-responsive {
            overflow: visible !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          thead {
            display: table-header-group;
          }

          /* Ajuster les marges pour l'impression */
          @page {
            margin: 1cm;
          }

          /* Conserver les couleurs pour les badges et titres */
          .badge,
          h5 {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default VueGlobale;
