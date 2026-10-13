import React, { useState, useMemo } from "react";
import { FaClipboardCheck,  FaDownload, FaCircle, FaCheck, FaBoxOpen, FaCalendarAlt } from "react-icons/fa";
import ConfirmationPopup from "../ui/ConfirmationPopup";
import { Badge, Card, Table, Button, Modal } from "react-bootstrap";
import { restClient } from "../../api/client";
import { createItem } from "../../api/crudService";
import { useNotification } from "../../hooks/useNotification";
import NotificationPopup from "../ui/NotificationPopup";
import { User } from "../../types/user.types";

// interface Document {
//   id: string | number;
//   label: string;
//   pdfUrl: string;
//   date: string;
//   status?: string;
//   numeroCommande?: string;
//   destination?: string;
//   transporteur?: string;
// }

// Comprehensive Article interface for BonCommande
interface BonCommandeArticle {
  id: string | number;
  code: string;
  designation: string;
  quantite_commandee?: number;
  quantite?: number;
  prix_unitaire?: number;
  prixvente?: number;
  pvht?: number;
  montant?: number;
  unite?: string;
  cmm?: string | number;
  stock_max?: string | number;
  nb_jour_rupture?: number;
  consoMoyenne?: string | number;
  type?: string;
  conditionnement?: number;
  lot?: string;
  date_peremption?: string;
  statut?: string;
  quantite_allouee?: number;
  documents?: any[];
  sourceLot?: string; // Source du produit (SALAMA, FOURNISSEUR_EXTERNE, etc.)
  etat?: number; // -3 = article refusé, 3 = en attente validation, 4 = validé/accepté
  id_ligne?: number; // ID de la ligne de commande pour le refus
  is_ral?: boolean | number;
  etat_ral?: number;
  etat_ral_text?: string;
  etat_ral_badge?: string;
}

interface BonCommandeRalLine {
  id: string | number;
  id_ligne?: number;
  code: string;
  designation: string;
  quantite: number;
  etat_ral: number;
  etat_ral_text: string;
  etat_ral_badge: string;
  lot: string;
}

interface BonCommandeProps {
  data?: any;
  orderType?:  'programme' | 'rc_public' | 'rc_prive' | 'tef' | 'be' | 'ferme' | 'urgence' | 'enlevement' | null;
  Data?: any; // Données de la commande complète
  setData?: React.Dispatch<React.SetStateAction<any>>;
  user?: User
}

const BonCommande: React.FC<BonCommandeProps> = ({ 
  data: propsData, 
  orderType, 
  Data, 
  setData, 
  user 
}) => {
  const [confirmation, setConfirmation] = useState({
    isVisible: false,
    action: () => {},
    title: "",
    message: "",
  });

  // États pour la validation d'état
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationConfirmation, setShowValidationConfirmation] = useState(false);
  const [selectedSourceLotToValidate, setSelectedSourceLotToValidate] = useState<string | null>(null);
  
  // États pour le refus
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedSourceLotToReject, setSelectedSourceLotToReject] = useState<string | null>(null);
  
  // États pour le refus d'article individuel
  const [showArticleRejectModal, setShowArticleRejectModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<BonCommandeArticle | null>(null);
  const [articleRejectReason, setArticleRejectReason] = useState('');
  const [isRejectingArticle, setIsRejectingArticle] = useState(false);
  // const [rejectedArticles, setRejectedArticles] = useState<Set<string>>(new Set());
  
  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  
    // État pour le téléchargement PDF
    const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);
    const [isDownloadingRalPdf, setIsDownloadingRalPdf] = useState(false);
    
  // Données du bon de commande (à remplacer par des props ou API call)
  const mockBonCommande = {
    numero: "BC-2025-0123",
    date_generation: "12 Octobre 2025",
    statut: "En préparation",
    reference_commande_client: "CC-2025-0456",
    reference_tef: "TEF-2025-0789",
    client: {
      nom: "Jean Dupont",
      adresse_livraison: "Lot II A 45, Antananarivo, Madagascar",
      contact: "+261 34 12 345 67",
      type_planning: "Cycliques",
    },
    articles: [
      {
        id: "ART-001",
        code: "ART-001",
        designation: "CODV complexe homeopathique - flacon de 25 ml PQT6",
        quantite_commandee: 100,
        quantite_allouee: 80,
        prix_unitaire: 5000,
        montant: 400000,
        lot: "LOT-123",
        date_peremption: "01/01/2026",
        statut: "Allocation partielle",
        sourceLot: "SALAMA",
      },
      {
        id: "ART-002",
        code: "ART-002",
        designation: "BAUME FOSA - Pot /30G - PAQUET /6",
        quantite_commandee: 50,
        quantite_allouee: 50,
        prix_unitaire: 10000,
        montant: 500000,
        lot: "LOT-456",
        date_peremption: "31/12/2025",
        statut: "Alloué",
        sourceLot: "SALAMA",
      },
      {
        id: "ART-003",
        code: "ART-003",
        designation: "Paracetamol 500mg - Boîte de 100 comprimés",
        quantite_commandee: 200,
        quantite_allouee: 200,
        prix_unitaire: 8000,
        montant: 1600000,
        lot: "LOT-789",
        date_peremption: "30/06/2026",
        statut: "Alloué",
        sourceLot: "FOURNISSEUR_EXTERNE",
      },
      {
        id: "ART-004",
        code: "ART-004",
        designation: "Amoxicilline 250mg - Boîte de 50 gélules",
        quantite_commandee: 150,
        quantite_allouee: 150,
        prix_unitaire: 12000,
        montant: 1800000,
        lot: "LOT-012",
        date_peremption: "31/08/2026",
        statut: "Alloué",
        sourceLot: "FOURNISSEUR_EXTERNE",
      },
    ],
    logistique: {
      type_livraison: "Standard",
      date_previsionnelle: "15 Octobre 2025",
      preparateur: "Marie Rasoa",
      statut_preparation: "En cours",
    },
    documents: [
      { id: "doc1", label: "Facture Proforma", url: "/docs/facture-proforma.pdf" },
      { id: "doc2", label: "Bon de Livraison", url: "/docs/bon-livraison.pdf" },
      { id: "doc3", label: "Facture Définitive", url: "/docs/facture-definitive.pdf" },
    ],
    timeline: [
      { id: "step1", etape: "BC généré", statut: "Complété", date: "12/10/2025 14:30" },
      { id: "step2", etape: "En préparation", statut: "En cours", date: null },
      { id: "step3", etape: "Préparé", statut: "En attente", date: null },
      { id: "step4", etape: "Expédié", statut: "En attente", date: null },
      { id: "step5", etape: "Livré", statut: "En attente", date: null },
    ],
  };

  // Données statiques des livraisons (à remplacer par des props si nécessaire)
  // const livraisonsByDate: Array<[string, Array<Document>]> = [
  //   [
  //     "15 Novembre 2025",
  //     [
  //       { 
  //         id: "l002", 
  //         date: "17 Novembre 2025", 
  //         label: "Bordereau de livraison 002", 
  //         pdfUrl: "/docs/bordereau-002.pdf",
  //         status: "En attente",
  //         numeroCommande: "1",
  //         destination: "Antananarivo",
  //         transporteur: "SOTRAMAD" 
  //       },
  //     ],
  //   ],
  // ];

  // const handleConfirm = (docId: string | number) => {
  //   setConfirmation({
  //     isVisible: true,
  //     action: () => {
  //       console.log(`Livraison ${docId} confirmée`);
  //       setConfirmation(prev => ({ ...prev, isVisible: false }));
  //     },
  //     title: "Confirmer la livraison",
  //     message: `Voulez-vous vraiment confirmer la livraison ${docId} ?`,
  //   });
  // };

  // const handleReject = (docId: string | number) => {
  //   setConfirmation({
  //     isVisible: true,
  //     action: () => {
  //       console.log(`Livraison ${docId} rejetée`);
  //       setConfirmation(prev => ({ ...prev, isVisible: false }));
  //     },
  //     title: "Rejeter la livraison",
  //     message: `Voulez-vous vraiment rejeter la livraison ${docId} ?`,
  //   });
  // };
  
  // Déterminer le statut de la livraison et sa couleur
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

  // Fonction pour demander confirmation de validation d'état
  const handleRequestStateValidation = (sourceLot?: string | null) => {
    setSelectedSourceLotToValidate(sourceLot || null);
    setShowValidationConfirmation(true);
  };

  // Fonction pour annuler la validation d'état
  const handleCancelStateValidation = () => {
    setShowValidationConfirmation(false);
    setSelectedSourceLotToValidate(null);
  };

  // Fonction pour valider un bon de commande spécifique (par sourceLot)
  const handleConfirmValidation = async () => {
    setShowValidationConfirmation(false);
    setIsValidating(true);

    try {
      console.log("🔄 Début de la validation du bon de commande...");
      console.log("📋 ID Commande:", Data?.numero || data?.numero);
      console.log("📦 SourceLot ciblé:", selectedSourceLotToValidate);
      console.log("👤 ID Utilisateur:", user?.id);

      if (!selectedSourceLotToValidate || selectedSourceLotToValidate.trim() === '') {
        showError("Erreur", "Aucun bon de commande sélectionné pour validation.");
        setIsValidating(false);
        return;
      }

      // Récupérer tous les id_ligne des articles de ce sourceLot
      const articlesInSourceLot = (data?.articles || []).filter(
        (article: BonCommandeArticle) => {
          const articleSource = article.sourceLot && article.sourceLot.trim() !== '' 
            ? article.sourceLot 
            : 'STOCK_PRINCIPAL';
          return articleSource === selectedSourceLotToValidate && article.etat !== -3;
        }
      );
      
      const ligneIds = articlesInSourceLot
        .map((article: BonCommandeArticle) => article.id_ligne)
        .filter((id: number | undefined): id is number => id !== undefined);

      if (ligneIds.length === 0) {
        showError("Erreur", "Aucune ligne valide à valider pour ce bon de commande.");
        setIsValidating(false);
        return;
      }

      console.log("📦 Lignes à valider:", ligneIds);

      // Utiliser l'API pour valider toutes les lignes de ce bon de commande
      const validationPayload = {
        ligne_ids: ligneIds,
        nouvel_etat: 4,
        user_id: user?.id
      };

      console.log("📤 Payload de validation:", validationPayload);
      const response = await createItem("api/commande/valider-lignes-bc", validationPayload);

      console.log("✅ Réponse de l'API:", response);

      // Vérifier si la réponse contient une erreur
      const validationResponseData = response?.data as { succes?: null | boolean; success?: null | boolean; message?: string };
      if (validationResponseData?.succes === null || validationResponseData?.success === null) {
        const errorMessage = validationResponseData?.message || "Erreur lors de la validation";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de validation", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error("❌ Erreur HTTP lors de la validation:", response.status, response.statusText);
        const errorMessage = validationResponseData?.message || response.statusText;
        showError("Erreur de validation", `La validation a échoué : ${errorMessage}`);
        throw new Error(`Erreur lors de la validation : ${errorMessage}`);
      }

      console.log("✅ Bon de commande validé avec succès!");
      
      showSuccess(
        "Bon de commande validé", 
        `Le bon de commande (${selectedSourceLotToValidate}) a été validé avec succès.`
      );

      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("❌ Erreur lors de la validation:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError("Erreur de validation", `Impossible de valider le bon de commande : ${errorMessage}`);
    } finally {
      setIsValidating(false);
      setSelectedSourceLotToValidate(null);
    }
  };

  // Fonction pour valider l'état après confirmation (passage de état 3 à état 4)
  const handleConfirmStateValidation = async () => {
    setShowValidationConfirmation(false);
    setIsValidating(true);

    try {
      console.log("🔄 Début de la validation d'état (Bon de Commande -> Livraison)...");
      console.log("📋 ID Commande:", Data?.numero);
      console.log("👤 ID Utilisateur:", user?.id);

      // Préparer le payload pour passer de l'état 3 (Bon de Commande) à l'état 4 (Livraison)
      const stateValidationPayload = {
        id: Data?.numero || data?.numero,
        user_id: user?.id,
        validationclient: 1
      };

      console.log("📤 Payload de validation d'état:", stateValidationPayload);

      const response = await createItem("api/commande/statut", stateValidationPayload);

    
      console.log("✅ Réponse de l'API de finalisation:", response);

      // Vérifier si la réponse contient une erreur (success: null ou succes: null)
      const responseData = response?.data as { succes?: null | boolean; success?: null | boolean; message?: string };
      if (responseData?.succes === null || responseData?.success === null) {
        const errorMessage = responseData?.message || "Erreur lors de la finalisation";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de finalisation", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error("❌ Erreur HTTP lors de la finalisation:", response.status, response.statusText);
        const errorMessage = responseData?.message || response.statusText;
        showError("Erreur de finalisation", `La finalisation a échoué : ${errorMessage}`);
        throw new Error(`Erreur lors de la finalisation : ${errorMessage}`);
      }

      console.log("✅ Commande finalisée avec succès!");
      
      
      // Mettre à jour les données locales pour refléter le changement d'état
      if (Data && setData) {
        const updatedData = { ...Data, etat: 5 };
        setData(updatedData);
      }
      
      showSuccess("Commande finalisée", "La commande a été finalisée avec succès !");

          // Recharger la page après un court délai pour permettre à la notification d'être visible
    setTimeout(() => {
      window.location.reload();
    }, 2000); // Délai de 2 secondes
    } catch (error) {
      console.error("❌ Erreur lors de la finalisation:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError("Erreur de finalisation", `Impossible de finaliser la commande : ${errorMessage}`);
    } finally {
      setIsValidating(false);
    }
  };

  // Fonction pour ouvrir le modal de refus

  // Fonction pour annuler le refus
  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedSourceLotToReject(null);
  };

  // Fonction pour confirmer le refus d'un bon de commande spécifique
  const handleConfirmReject = async () => {
    // Validation du motif de refus
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      showError("Motif requis", "Veuillez indiquer un motif de refus d'au moins 10 caractères.");
      return;
    }

    setShowRejectModal(false);
    setIsRejecting(true);

    try {
      console.log("🔄 Début du refus du bon de commande...");
      console.log("📋 ID Commande:", Data?.numero || data?.numero);
      console.log("📦 SourceLot ciblé:", selectedSourceLotToReject);
      console.log("👤 ID Utilisateur:", user?.id);
      console.log("📝 Motif de refus:", rejectReason);

      if (!selectedSourceLotToReject || selectedSourceLotToReject.trim() === '') {
        showError("Erreur", "Aucun bon de commande sélectionné pour refus.");
        setIsRejecting(false);
        return;
      }

      // Récupérer tous les id_ligne des articles de ce sourceLot
      const articlesInSourceLot = (data?.articles || []).filter(
        (article: BonCommandeArticle) => {
          const articleSource = article.sourceLot && article.sourceLot.trim() !== '' 
            ? article.sourceLot 
            : 'STOCK_PRINCIPAL';
          return articleSource === selectedSourceLotToReject && article.etat !== -3;
        }
      );
      
      const ligneIds = articlesInSourceLot
        .map((article: BonCommandeArticle) => article.id_ligne)
        .filter((id: number | undefined): id is number => id !== undefined);

      if (ligneIds.length === 0) {
        showError("Erreur", "Aucune ligne valide à refuser pour ce bon de commande.");
        setIsRejecting(false);
        return;
      }

      console.log("📦 Lignes à refuser:", ligneIds);

      // Utiliser l'API pour refuser toutes les lignes de ce bon de commande
      const rejectPayload = {
        ligne_ids: ligneIds,
        motif: rejectReason.trim(),
        etape: 3
      };

      console.log("📤 Payload de refus:", rejectPayload);
      const response = await createItem("api/commande/toutrejeterlignecommande", rejectPayload);

      console.log("✅ Réponse de l'API de refus:", response);

      // Vérifier si la réponse contient une erreur
      const rejectResponseData = response?.data as { succes?: null | boolean; success?: null | boolean; message?: string };
      if (rejectResponseData?.succes === null || rejectResponseData?.success === null) {
        const errorMessage = rejectResponseData?.message || "Erreur lors du refus";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de refus", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error("❌ Erreur HTTP lors du refus:", response.status, response.statusText);
        const errorMessage = rejectResponseData?.message || response.statusText;
        showError("Erreur de refus", `Le refus a échoué : ${errorMessage}`);
        throw new Error(`Erreur lors du refus : ${errorMessage}`);
      }

      console.log("✅ Bon de commande refusé avec succès!");
      
      showSuccess(
        "Bon de commande refusé", 
        `Le bon de commande a été refusé avec succès.`
      );
      
      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("❌ Erreur lors du refus:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError("Erreur de refus", `Impossible de refuser le bon de commande : ${errorMessage}`);
    } finally {
      setIsRejecting(false);
      setRejectReason('');
      setSelectedSourceLotToReject(null);
    }
  };



  // Fonction pour ouvrir le modal de refus d'article

  // Fonction pour annuler le refus d'article
  const handleCancelArticleReject = () => {
    setShowArticleRejectModal(false);
    setSelectedArticle(null);
    setArticleRejectReason('');
  };

  // Fonction pour confirmer le refus d'un article
  const handleConfirmArticleReject = async () => {
    if (!selectedArticle) return;

    // Validation du motif de refus
    if (!articleRejectReason.trim() || articleRejectReason.trim().length < 10) {
      showError("Motif requis", "Veuillez indiquer un motif de refus d'au moins 10 caractères.");
      return;
    }

    // Vérifier que l'article a un id_ligne
    if (!selectedArticle.id_ligne) {
      showError("Erreur", "Impossible de refuser cet article : ID de ligne manquant.");
      return;
    }

    setShowArticleRejectModal(false);
    setIsRejectingArticle(true);

    try {
      console.log("🔄 Début du refus de l'article...");
      console.log("📦 Article:", selectedArticle.code, selectedArticle.designation);
      console.log("📋 ID Ligne:", selectedArticle.id_ligne);
      console.log("📝 Motif de refus:", articleRejectReason);

      // Préparer le payload pour le refus d'article
      const articleRejectPayload = {
        id: selectedArticle.id_ligne,
        motif: articleRejectReason.trim()
      };

      console.log("📤 Payload de refus d'article:", articleRejectPayload);

      // Appel API pour rejeter la ligne de commande
      const response = await createItem("api/commande/rejeterlignecommande", articleRejectPayload);

      console.log("✅ Réponse de l'API:", response);

      // Vérifier si la réponse contient une erreur
      const responseData = response?.data as { succes?: null | boolean; success?: null | boolean; message?: string };
      if (responseData?.succes === null || responseData?.success === null) {
        const errorMessage = responseData?.message || "Erreur lors du refus de l'article";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de refus", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error("❌ Erreur HTTP lors du refus:", response.status, response.statusText);
        const errorMessage = responseData?.message || response.statusText;
        showError("Erreur de refus", `Le refus a échoué : ${errorMessage}`);
        throw new Error(`Erreur lors du refus : ${errorMessage}`);
      }

      console.log("✅ Article refusé avec succès!");
      
      showSuccess("Article refusé", `L'article ${selectedArticle.code} a été refusé avec succès.`);
      
      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error("❌ Erreur lors du refus de l'article:", error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError("Erreur de refus", `Impossible de refuser l'article : ${errorMessage}`);
    } finally {
      setIsRejectingArticle(false);
      setArticleRejectReason('');
      setSelectedArticle(null);
    }
  };

  // Données à afficher
  const data =  propsData || mockBonCommande;

  // Fonction pour regrouper les articles par sourceLot (avec fallback à STOCK_PRINCIPAL)
  const groupArticlesBySourceLot = () => {
    const groups: { [key: string]: BonCommandeArticle[] } = {};
    
    (data?.articles || []).forEach((article: BonCommandeArticle) => {
      // Ignorer les articles sans sourceLot
      if (!article.sourceLot || article.sourceLot.trim() === '') {
        return;
      }
      const source = article.sourceLot.trim();
      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(article);
    });
    
    return groups;
  };

  // Fonction pour générer le numéro de bon de commande par sourceLot
  const generateBonCommandeNumber = (baseNumero: string, index: number) => {
    // Extraire l'année du numéro de base
    const currentYear = new Date().getFullYear();
    
    // Format: BC-numero-annee-index (ex: BC-190-2025-1, BC-190-2025-2)
    const numeroOnly = baseNumero.replace(/[^\d]/g, ''); // Extraire uniquement les chiffres
    return `BC-${numeroOnly}-${currentYear}-${index}`;
  };

  // Calculer les totaux par sourceLot
  const calculateTotalsForGroup = (articles: BonCommandeArticle[]) => {
    const total = articles.reduce((sum, article) => sum + (article.montant || 0), 0);
    return total;
  };

  // Regrouper les articles par sourceLot
  const articlesBySourceLot = groupArticlesBySourceLot();
  const sourceLots = Object.keys(articlesBySourceLot);

  // Section RAL (lecture seule)
  const ralSourceLines = useMemo(() => {
    const detailsFromCommande = Array.isArray(Data?.detailcommandes)
      ? (Data.detailcommandes as Array<Record<string, unknown>>)
      : Array.isArray(Data?.lignecommandes)
        ? (Data.lignecommandes as Array<Record<string, unknown>>)
        : [];

    const fallbackArticles = Array.isArray(data?.articles)
      ? (data.articles as Array<Record<string, unknown>>)
      : [];

    return detailsFromCommande.length > 0 ? detailsFromCommande : fallbackArticles;
  }, [Data?.detailcommandes, Data?.lignecommandes, data?.articles]);

  const hasAnyRalLines = useMemo(
    () =>
      ralSourceLines.some(
        (line) => Number(line?.is_ral ?? 0) === 1 || line?.is_ral === true,
      ),
    [ralSourceLines],
  );

  const isRalSectionVisible =
    hasAnyRalLines &&
    Number(Data?.validationclient_ral_etape2 ?? data?.validationclient_ral_etape2 ?? 0) === 1;

  const isDvmRalValidated =
    Number(Data?.validation_dvm_ral_etape2 ?? data?.validation_dvm_ral_etape2 ?? 0) === 1;

  const ralLines: BonCommandeRalLine[] = useMemo(
    () =>
      ralSourceLines
        .filter((line) => {
          const isRal = Number(line?.is_ral ?? 0) === 1 || line?.is_ral === true;
          const etatLigne = Number(line?.etat ?? 0);
          return isRal && etatLigne > 0;
        })
        .map((line, index) => {
          const articleRecord =
            (line?.article as Record<string, unknown> | undefined) || {};
          const lineId = line?.id ?? line?.id_ligne;

          // Améliorer le mapping de id_ligne avec plusieurs sources possibles
          let id_ligne: number | undefined;
          if (typeof line?.id_ligne === "number") {
            id_ligne = line.id_ligne;
          } else if (typeof line?.id_ligne === "string") {
            id_ligne = parseInt(line.id_ligne, 10);
          } else if (typeof line?.id === "number") {
            id_ligne = line.id;
          } else if (typeof line?.id === "string") {
            id_ligne = parseInt(line.id, 10);
          } else if (typeof line?.ligne_id === "number") {
            id_ligne = line.ligne_id;
          } else if (typeof line?.ligne_id === "string") {
            id_ligne = parseInt(line.ligne_id, 10);
          }

          // Valider que id_ligne est un nombre valide
          if (typeof id_ligne === "number" && isNaN(id_ligne)) {
            id_ligne = undefined;
          }

          console.log(`🔍 Ligne BC RAL ${index}: id_ligne=${id_ligne}, id=${line?.id}, id_ligne_field=${line?.id_ligne}, code=${line?.code}`);

          return {
            id:
              typeof lineId === "number" || typeof lineId === "string"
                ? lineId
                : `bc-ral-${index}`,
            id_ligne,
            code:
              (typeof line?.code === "string" && line.code) ||
              (typeof articleRecord.code === "string" && articleRecord.code) ||
              "-",
            designation:
              (typeof line?.designation === "string" && line.designation) ||
              (typeof line?.produit === "string" && line.produit) ||
              (typeof line?.article_text === "string" && line.article_text) ||
              (typeof articleRecord.designation === "string" &&
                articleRecord.designation) ||
              "N/A",
            quantite: Number(line?.qte_commandee ?? line?.quantite ?? 0),
            etat_ral: Number(line?.etat_ral ?? 0),
            etat_ral_text:
              (typeof line?.etat_ral_text === "string" && line.etat_ral_text) ||
              "",
            etat_ral_badge:
              (typeof line?.etat_ral_badge === "string" && line.etat_ral_badge) ||
              "",
            lot:
              (typeof line?.lot === "string" && line.lot) ||
              (typeof line?.source_lot === "string" && line.source_lot) ||
              "",
          };
        }),
    [ralSourceLines],
  );

  const ralLinesReadyForBc = useMemo(
    () => ralLines.filter((line) => line.etat_ral >= 3),
    [ralLines],
  );

  const bcRalNumero =
    (Data?.numero_bc_ral as string | undefined) ||
    (data?.numero_bc_ral as string | undefined) ||
    "BC-RAL-N/A";

  const bcRalDateGenerationRaw =
    (Data?.date_generation_bc_ral as string | undefined) ||
    (data?.date_generation_bc_ral as string | undefined) ||
    (data?.date_generation as string | undefined) ||
    undefined;

  const formatRalDate = (dateValue?: string) => {
    if (!dateValue) {
      return "N/A";
    }
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      return dateValue;
    }
    return parsed.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getRalStatusBadge = (line: BonCommandeRalLine) => {
    if (line.etat_ral_badge) {
      return (
        <Badge className={line.etat_ral_badge}>
          {line.etat_ral_text || "État RAL"}
        </Badge>
      );
    }

    if (line.etat_ral >= 4) {
      return <Badge bg="success">{line.etat_ral_text || "Validé"}</Badge>;
    }
    if (line.etat_ral >= 3) {
      return <Badge bg="info">{line.etat_ral_text || "En cours"}</Badge>;
    }
    return (
      <Badge bg="warning" text="dark">
        {line.etat_ral_text || "Traitement initial"}
      </Badge>
    );
  };

  const handleDownloadRalPdf = async () => {
    const validLines = ralLinesReadyForBc.filter(
      (line): line is BonCommandeRalLine & { id_ligne: number } =>
        line.id_ligne !== undefined,
    );

    if (validLines.length === 0) {
      showError("Erreur", "Aucune ligne RAL valide pour générer le PDF.");
      return;
    }

    setIsDownloadingRalPdf(true);

    try {
      const csrfToken =
        (
          document.querySelector('meta[name="csrf-token"]') as
            | HTMLMetaElement
            | null
        )?.content || localStorage.getItem("csrf_token") || "";

      const formData = new URLSearchParams();
      if (csrfToken) {
        formData.append("_token", csrfToken);
      }
      formData.append("bon_index", "0");

      validLines.forEach((line) => {
        formData.append("ligne_ids[]", String(line.id_ligne));
        formData.append(`lots[${line.id_ligne}]`, line.lot || "");
      });

      const response = await restClient.post("pdf/bon-commande", formData, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        responseType: "blob",
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);

      showSuccess(
        "Téléchargement réussi",
        "Le PDF du bon de commande RAL a été téléchargé avec succès.",
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(
        "Erreur de téléchargement",
        `Impossible de télécharger le PDF du BC RAL : ${errorMessage}`,
      );
    } finally {
      setIsDownloadingRalPdf(false);
    }
  };

  console.log("data bon de commande:", data);

    // Fonction pour télécharger le PDF d'une facture
    const handleDownloadPDF = async (
      articles: BonCommandeArticle[], 
      factureNumber: string, 
      sourceLot: string
    ) => {
      // Récupérer les ligne_ids des articles de cette facture
      const ligneIds = articles
        .map((article: BonCommandeArticle ) => article.id_ligne)
        .filter((id): id is number => id !== undefined);
  
      if (ligneIds.length === 0) {
        showError("Erreur", "Aucun article valide pour générer le PDF.");
        return;
      }
  
      setIsDownloadingPdf(sourceLot);
      console.log(`📥 Téléchargement PDF pour la facture: ${factureNumber}`);
      console.log("📦 Ligne IDs:", ligneIds);
  
      try {
        const response = await restClient.post(
          "pdf/bon-commande",
          { ligne_ids: ligneIds },
          { responseType: 'blob' }
        );
  
        // Créer un blob à partir de la réponse
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        
        // Créer un lien temporaire pour télécharger le fichier
        const link = document.createElement('a');
        link.href = url;
        link.download = `${factureNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        
        // Nettoyer
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        showSuccess("Téléchargement réussi", `La facture ${factureNumber} a été téléchargée avec succès.`);
      } catch (error) {
        console.error("❌ Erreur lors du téléchargement PDF:", error);
        showError("Erreur de téléchargement", "Impossible de télécharger le PDF. Veuillez réessayer.");
      } finally {
        setIsDownloadingPdf(null);
      }
    };

  return (
    <div
      className="bg-white p-3 rounded-3 shadow-sm"
      style={{ border: "1.5px solid #1FB05B", borderRadius: "16px" }}
    >
      <h5
        className="mb-4 d-flex align-items-center gap-2"
        style={{ color: "#1FB05B", fontWeight: 700 }}
      >
        <FaClipboardCheck />
        Bon de commande
      </h5>
      
      {/* En-tête du bon de commande */}
      <Card className="mb-4">
        <Card.Body>
          <div className="row g-3">
         
            <div className="">
              <div className="d-flex align-items-center">
                <FaCircle className="text-success me-2" style={{ fontSize: '0.7rem' }} />
                <strong className="me-2">Statut:</strong>
                {getStatusBadge(
                  (Data?.etat || data?.etat) <= 3 
                    ? ((Data?.validationclient || data?.validationclient) === null 
                        ? "En attente de validation" 
                        : (Data?.validationsalama || data?.validationsalama) === null 
                          ? "En attente SALAMA" 
                          : "Validée")
                    : "Validée"
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>
      
     
      {/* Détails des articles groupés par sourceLot */}
      {sourceLots.length > 0 ? (
        sourceLots.map((sourceLot, groupIndex) => {
          const articlesInGroup = articlesBySourceLot[sourceLot];
          const bonCommandeNumber = generateBonCommandeNumber(data?.numero || '', groupIndex + 1);
          const groupTotal = calculateTotalsForGroup(articlesInGroup);
          
          return (
            <div key={sourceLot} className="mb-4">
              {/* En-tête du bon de commande par sourceLot */}
              <Card className="border-0 shadow-sm mb-3" style={{ 
                borderRadius: "18px", 
                background: "linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%)",
                borderLeft: "5px solid #1FB05B",
                boxShadow: "0 4px 12px rgba(31, 176, 91, 0.08)"
              }}>
                <Card.Body className="p-4">
                  <div className="row g-4 align-items-center">
                    <div className="col-md-4">
                      <div className="d-flex align-items-center gap-3">
                        <div className="p-3 rounded-circle" style={{ 
                          backgroundColor: "#e8f8f0",
                          boxShadow: "0 2px 8px rgba(31, 176, 91, 0.12)"
                        }}>
                          <FaClipboardCheck className="text-success" style={{ fontSize: '1.5rem' }} />
                        </div>
                        <div>
                          <small className="text-muted d-block mb-1" style={{ fontSize: '0.8rem', fontWeight: 500 }}>Bon de Commande N°</small>
                          <div style={{ 
                            fontSize: '1.3rem', 
                            fontWeight: 800, 
                            color: '#1FB05B', 
                            letterSpacing: '0.5px',
                            textShadow: '0 2px 4px rgba(31, 176, 91, 0.1)'
                          }}>
                            {bonCommandeNumber}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <div className="p-2 rounded" style={{ backgroundColor: "#e8f8f0" }}>
                          <FaCalendarAlt className="text-success" style={{ fontSize: '1rem' }} />
                        </div>
                        <div>
                          <small className="text-muted d-block" style={{ fontSize: '0.75rem', fontWeight: 500 }}>Date génération</small>
                          <strong style={{ fontSize: '0.95rem', color: '#2c3e50' }}>
                            {data.date_generation || new Date().toLocaleDateString()}
                          </strong>
                        </div>
                      </div>
                    </div>
                    

                    
                    <div className="col-md-2">
                      <div className="text-end">
                        <div className="d-flex align-items-center justify-content-end gap-2 p-2 rounded" style={{ backgroundColor: '#f8fdf9' }}>
                          <FaBoxOpen className="text-success" style={{ fontSize: '1.1rem' }} />
                          <strong className="text-success" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
                            {articlesInGroup.length}
                          </strong>
                          <small className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 500 }}>
                            article{articlesInGroup.length > 1 ? 's' : ''}
                          </small>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Tableau des articles pour ce sourceLot */}
              <Card className="border-0 shadow-sm mb-3" style={{ borderRadius: "16px" }}>
                <Card.Body className="p-0">
                  <div className="p-3 d-flex justify-content-between align-items-center" style={{ 
                    backgroundColor: '#f8fdf9',
                    borderTopLeftRadius: '16px',
                    borderTopRightRadius: '16px',
                    borderBottom: '2px solid #e8f8f0'
                  }}>
                    <h6 className="text-muted mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700 }}>
                      <i className="fas fa-list text-success" style={{ fontSize: '1rem' }}></i>
                      Liste des articles
                    </h6>
                    <Badge 
                      bg="light" 
                      text="dark"
                      className="px-3 py-2"
                      style={{ 
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        borderRadius: '8px',
                        border: '1px solid #e8f8f0'
                      }}
                    >
                      Source: <strong className="text-success ms-1">{sourceLot}</strong>
                    </Badge>
                  </div>
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead style={{ backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                        <tr>
                          <th className="border-0 py-3 px-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Code</th>
                          <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Désignation</th>
                          
                          {/* Colonnes spécifiques au type de commande */}
                          {orderType === 'programme' && (
                            <>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Unité</th>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité commandée</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>CMM</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Stock max</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Nb jours rupture</th>
                            </>
                          )}
                          
                          {orderType === 'rc_prive' && (
                            <>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité commandée</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Conso moyenne</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Prix unitaire</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Montant</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Type</th>
                            </>
                          )}
                          
                          {orderType === 'tef' && (
                            <>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité commandée</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Prix unitaire HT</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Montant HT</th>
                            </>
                          )}
                          
                          {orderType === 'be' && (
                            <>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité commandée</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Prix unitaire HT</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Montant HT</th>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité allouée</th>
                            </>
                          )}
                          
                          {orderType === 'ferme' && (
                            <>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité commandée</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Prix unitaire</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Montant</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Lot</th>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Date péremption</th>
                            </>
                          )}
                          
                          {/* Colonnes par défaut si pas de type spécifié */}
                          {!orderType && (
                            <>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité commandée</th>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Quantité allouée</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Prix unitaire</th>
                              <th className="border-0 text-end py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Montant</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Lot</th>
                              <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Date péremption</th>
                              <th className="border-0 py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Statut</th>
                            </>
                          )}
                          
                          {/* Colonne Actions pour le refus d'articles */}
                          {/* {user?.role_id === 11 && (Data?.etat || data?.etat) === 3 && (Data?.validationclient || data?.validationclient) === null && (
                            <th className="border-0 text-center py-3" style={{ fontSize: '0.85rem', fontWeight: 700, color: '#495057' }}>Actions</th>
                          )} */}
                        </tr>
                      </thead>
                      <tbody>
                        {articlesInGroup.map((article: BonCommandeArticle, index: number) => {
                          const isRejected = article.etat === -3;
                          const isValidated = article.etat === 4;
                          return (
                          <tr 
                            key={article.id || index}
                            style={{ 
                              opacity: isRejected ? 0.6 : 1,
                              backgroundColor: isRejected ? '#fee' : isValidated ? '#e8f5e9' : 'transparent',
                              borderBottom: '1px solid #f0f0f0'
                            }}
                          >
                            <td className="py-3 px-3">
                              <div className="d-flex align-items-center gap-2">
                                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: '#2c3e50' }}>{article.code}</span>
                                {isRejected && (
                                  <Badge bg="danger" className="px-2 py-1" style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
                                  }}>
                                    <i className="fas fa-ban me-1" style={{ fontSize: '0.65rem' }}></i>
                                    Refusé
                                  </Badge>
                                )}
                                {isValidated && (
                                  <Badge bg="success" className="px-2 py-1" style={{ 
                                    fontSize: '0.7rem', 
                                    fontWeight: 600,
                                    borderRadius: '6px',
                                    boxShadow: '0 2px 4px rgba(31, 176, 91, 0.2)'
                                  }}>
                                    <i className="fas fa-check me-1" style={{ fontSize: '0.65rem' }}></i>
                                    Validé
                                  </Badge>
                                )}
                              </div>
                            </td>
                            <td className="py-3">
                              <strong style={{ fontSize: '0.9rem', color: '#2c3e50', fontWeight: 600 }}>{article.designation}</strong>
                            </td>
                            
                            {/* Cellules spécifiques selon type de commande */}
                            {orderType === 'programme' && (
                              <>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article?.unite || "-"}</td>
                                <td className="text-center py-3">
                                  <Badge bg="light" text="dark" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    {article.quantite_commandee || article.quantite || 0}
                                  </Badge>
                                </td>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article?.cmm || "-"}</td>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article?.stock_max || "-"}</td>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article?.nb_jour_rupture || 0}</td>
                              </>
                            )}
                            
                            {orderType === 'rc_prive' && (
                              <>
                                <td className="text-center py-3">
                                  <Badge bg="light" text="dark" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    {article.quantite_commandee || article.quantite || 0}
                                  </Badge>
                                </td>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article?.consoMoyenne || "-"}</td>
                                <td className="text-end py-3" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057' }}>
                                  {(article.prix_unitaire || article.prixvente || 0).toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1FB05B' }}>
                                  {(article.montant || (article.quantite && article.prix_unitaire ? article.quantite * article.prix_unitaire : 0) || 0).toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article?.type || "-"}</td>
                              </>
                            )}
                            
                            {orderType === 'tef' && (
                              <>
                                <td className="text-center py-3">
                                  <Badge bg="light" text="dark" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    {article.quantite_commandee || article.quantite || 0}
                                  </Badge>
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057' }}>
                                  {(article.prix_unitaire || article.pvht || 0).toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1FB05B' }}>
                                  {(article.montant || (article.quantite && article.prix_unitaire ? article.quantite * article.prix_unitaire : 0) || 0).toLocaleString('fr-FR')} Ar
                                </td>
                              </>
                            )}
                            
                            {orderType === 'be' && (
                              <>
                                <td className="text-center py-3">
                                  <Badge bg="light" text="dark" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    {article.quantite_commandee || article.quantite || 0}
                                  </Badge>
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057' }}>
                                  {(article.prix_unitaire || article.pvht || 0).toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1FB05B' }}>
                                  {(article.montant || (article.quantite && article.prix_unitaire ? article.quantite * article.prix_unitaire : 0) || 0).toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="text-center py-3">
                                  <Badge bg="info" text="white" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(13, 110, 253, 0.2)'
                                  }}>
                                    {article.quantite_allouee || "-"}
                                  </Badge>
                                </td>
                              </>
                            )}
                            
                            {orderType === 'ferme' && (
                              <>
                                <td className="text-center py-3">
                                  <Badge bg="light" text="dark" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    {article.quantite_commandee || article.quantite || 0}
                                  </Badge>
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057' }}>
                                  {(article.prix_unitaire || 0).toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1FB05B' }}>
                                  {(article.montant || (article.quantite && article.prix_unitaire ? article.quantite * article.prix_unitaire : 0) || 0).toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article.lot || "-"}</td>
                                <td className="text-center py-3" style={{ fontSize: '0.85rem', color: '#6c757d' }}>{article.date_peremption || "-"}</td>
                              </>
                            )}
                            
                            {/* Cellules par défaut si pas de type spécifié */}
                            {!orderType && (
                              <>
                                <td className="text-center py-3">
                                  <Badge bg="light" text="dark" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    {article.quantite_commandee || article.quantite || 0}
                                  </Badge>
                                </td>
                                <td className="text-center py-3">
                                  <Badge bg="info" text="white" className="px-3 py-2" style={{ 
                                    fontSize: '0.9rem', 
                                    fontWeight: 700,
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(13, 110, 253, 0.2)'
                                  }}>
                                    {article.quantite_allouee || "-"}
                                  </Badge>
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.9rem', fontWeight: 600, color: '#495057' }}>
                                  {article.prix_unitaire?.toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="text-end py-3" style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1FB05B' }}>
                                  {article.montant?.toLocaleString('fr-FR')} Ar
                                </td>
                                <td className="py-3" style={{ fontSize: '0.9rem', color: '#495057' }}>{article.lot || "-"}</td>
                                <td className="text-center py-3" style={{ fontSize: '0.85rem', color: '#6c757d' }}>{article.date_peremption || "-"}</td>
                                <td className="py-3">{getStatusBadge(article.statut || '')}</td>
                              </>
                            )}
                            
                            {/* Colonne Actions pour le refus d'article */}
                            {/* {user?.role_id === 11 && (Data?.etat || data?.etat) === 3 && (Data?.validationclient || data?.validationclient) === null && (
                              <td className="text-center py-3">
                                {isRejected ? (
                                  <Badge bg="danger" className="px-3 py-2" style={{ 
                                    fontSize: '0.85rem',
                                    fontWeight: 600,
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 4px rgba(220, 53, 69, 0.2)'
                                  }}>
                                    <i className="fas fa-ban me-1"></i>
                                    Refusé
                                  </Badge>
                                ) : (
                                  <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => handleRequestArticleReject(article)}
                                    disabled={isRejectingArticle}
                                    title="Refuser cet article"
                                    className="px-3 py-2"
                                    style={{ 
                                      borderRadius: '8px',
                                      fontWeight: 600,
                                      borderWidth: '2px'
                                    }}
                                  >
                                    <i className="fas fa-ban me-1"></i>
                                    Refuser
                                  </Button>
                                )}
                              </td>
                            )} */}
                          </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                  
                  {/* Résumé des articles validés pour ce groupe */}
                  {articlesInGroup.some(article => article.etat === 4) && (
                    <div className="mt-4 p-3 rounded-3" style={{ 
                      backgroundColor: '#e8f5e9', 
                      border: '2px solid #1FB05B',
                      borderLeft: '5px solid #1FB05B',
                      boxShadow: '0 2px 8px rgba(31, 176, 91, 0.1)'
                    }}>
                      <div className="d-flex align-items-center">
                        <div className="p-2 rounded-circle me-3" style={{ 
                          backgroundColor: '#c8e6c9',
                          minWidth: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="fas fa-check-circle text-success" style={{ fontSize: '1.3rem' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <strong className="text-success d-block" style={{ fontSize: '1rem', fontWeight: 700 }}>
                            {articlesInGroup.filter(article => article.etat === 4).length} article(s) validé(s)
                          </strong>
                          <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Ces articles ont été validés et seront inclus dans le bon de commande
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Résumé des articles refusés pour ce groupe */}
                  {articlesInGroup.some(article => article.etat === -2) && (
                    <div className="mt-4 p-3 rounded-3" style={{ 
                      backgroundColor: '#fff5f5', 
                      border: '2px solid #ff4d4f',
                      borderLeft: '5px solid #ff4d4f',
                      boxShadow: '0 2px 8px rgba(255, 77, 79, 0.1)'
                    }}>
                      <div className="d-flex align-items-center">
                        <div className="p-2 rounded-circle me-3" style={{ 
                          backgroundColor: '#ffe5e5',
                          minWidth: '48px',
                          height: '48px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          <i className="fas fa-exclamation-circle text-danger" style={{ fontSize: '1.3rem' }}></i>
                        </div>
                        <div className="flex-grow-1">
                          <strong className="text-danger d-block" style={{ fontSize: '1rem', fontWeight: 700 }}>
                            {articlesInGroup.filter(article => article.etat === -3).length} article(s) refusé(s)
                          </strong>
                          <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                            Ces articles ne seront pas inclus dans ce bon de commande
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
              
              {/* Section total pour ce sourceLot */}
              <Card className="border-0 shadow-sm mb-4" style={{ 
                borderRadius: "16px",
                background: "linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%)",
                boxShadow: "0 4px 12px rgba(31, 176, 91, 0.08)"
              }}>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6 className="mb-0 d-flex align-items-center gap-2" style={{ fontSize: '1rem', fontWeight: 700, color: '#2c3e50' }}>
                      <div className="p-2 rounded" style={{ backgroundColor: "#e8f8f0" }}>
                        <i className="fas fa-calculator text-success" style={{ fontSize: '1.1rem' }}></i>
                      </div>
                      Total du bon de commande
                    </h6>
                  </div>
                  <div className="row justify-content-end">
                    <div className="col-md-5">
                      <div className="p-3 rounded-3" style={{ 
                        backgroundColor: '#fff', 
                        border: '2px solid #e8f8f0',
                        boxShadow: '0 2px 8px rgba(31, 176, 91, 0.08)'
                      }}>
                        <div className="d-flex justify-content-between align-items-center">
                          <span className="d-flex align-items-center gap-2" style={{ fontSize: '1.05rem', fontWeight: 700, color: '#495057' }}>
                            <i className="fas fa-money-bill-wave text-success" style={{ fontSize: '1.2rem' }}></i>
                            Total:
                          </span>
                          <span style={{ 
                            fontSize: '1.5rem', 
                            fontWeight: 900, 
                            color: '#1FB05B',
                            textShadow: '0 2px 4px rgba(31, 176, 91, 0.15)',
                            letterSpacing: '0.5px'
                          }}>
                            {groupTotal.toLocaleString('fr-FR')} Ar
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  {/* Boutons d'action par sourceLot */}
                  {(1===1 || user?.role_id === 11 )&& (Data?.etat || data?.etat) === 3 && (Data?.validationclient || data?.validationclient) === null && (
                    <div className="row mt-4">
                      <div className="col-12">
                        <div className="d-flex justify-content-end gap-3 p-3 rounded-3" style={{ backgroundColor: '#f8fdf9' }}>
                          <Button 
                            variant="success"
                            size="sm"
                            className="d-flex align-items-center gap-2 px-4 py-2"
                            style={{ 
                              borderRadius: '10px',
                              fontWeight: 300,
                              boxShadow: '0 3px 8px rgba(31, 176, 91, 0.2)'
                            }}
                            onClick={() => handleRequestStateValidation(sourceLot)}
                            disabled={isValidating || isRejecting || articlesInGroup.every(article => article.etat === -3 || article.etat === 4)}  // Désactivé si tous les articles sont refusés
                          >
                            <FaCheck style={{ fontSize: '1.1rem' }} />
                            {isValidating && selectedSourceLotToValidate === sourceLot ? "Validation..." : `Valider le bon de commande   ${bonCommandeNumber}`}
                          </Button>
                          

                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
              {/* Bouton de téléchargement PDF pour cette facture */}
              <div className="d-flex justify-content-center mb-2">
                <Button 
                  variant="outline-primary" 
                  className="d-flex align-items-center gap-2 px-4 py-2"
                  style={{ 
                    borderRadius: '10px',
                    fontWeight: 600,
                    borderWidth: '2px',
                    boxShadow: '0 2px 8px rgba(13, 110, 253, 0.15)'
                  }}
                  disabled={isDownloadingPdf === sourceLot}
                  onClick={() => handleDownloadPDF(articlesInGroup, bonCommandeNumber, sourceLot)}
                >
                  {isDownloadingPdf === sourceLot ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <FaDownload style={{ fontSize: '1rem' }} />
                      Télécharger PDF - {bonCommandeNumber}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "16px" }}>
          <Card.Body className="p-5 text-center">
            <div className="p-4 rounded-circle d-inline-block mb-3" style={{ backgroundColor: '#fff5f5' }}>
              <i className="fas fa-exclamation-triangle text-warning" style={{ fontSize: '3rem' }}></i>
            </div>
            <h5 className="text-muted mb-2" style={{ fontWeight: 600 }}>Aucun article disponible</h5>
            <p className="text-muted mb-0" style={{ fontSize: '0.95rem' }}>
              Il n'y a aucun article à afficher pour ce bon de commande.
            </p>
          </Card.Body>
        </Card>
      )}

      {/* Section RAL en lecture seule */}
      {isRalSectionVisible && (
        <Card
          className="border-0 shadow-sm mb-4"
          style={{ borderRadius: "16px", border: "1px solid #F0C060" }}
        >
          <Card.Header
            className="py-3"
            style={{
              backgroundColor: "#FFFBF0",
              borderBottom: "1px solid #F0C060",
            }}
          >
            <h6
              className="mb-0 d-flex align-items-center gap-2"
              style={{ color: "#1FB05B", fontWeight: 700 }}
            >
              <FaBoxOpen />
              Bon de Commande RAL — Articles en rupture
            </h6>
          </Card.Header>

          <Card.Body>
            {!isDvmRalValidated ? (
              <div
                className="mt-3 p-3 rounded-3"
                style={{ backgroundColor: "#FFFBF0", border: "1px solid #F0C060" }}
              >
                <div className="d-flex flex-column gap-2">
                  <div>
                    <Badge bg="warning" text="dark">En attente de traitement interne</Badge>
                  </div>
                  <p className="mb-0" style={{ color: "#1FB05B", fontWeight: 500 }}>
                    En attente de validation DM et DVM. Vous serez notifié quand le bon de commande RAL sera disponible.
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Card
                  className="border-0 shadow-sm mt-3"
                  style={{
                    borderRadius: "18px",
                    background: "linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%)",
                    borderLeft: "5px solid #1FB05B",
                    boxShadow: "0 4px 12px rgba(31, 176, 91, 0.08)",
                  }}
                >
                  <Card.Body className="p-4">
                    <div className="row g-4 align-items-center">
                      <div className="col-md-4">
                        <div className="d-flex align-items-center gap-3">
                          <div
                            className="p-3 rounded-circle"
                            style={{
                              backgroundColor: "#e8f8f0",
                              boxShadow: "0 2px 8px rgba(31, 176, 91, 0.12)",
                            }}
                          >
                            <FaClipboardCheck className="text-success" style={{ fontSize: "1.5rem" }} />
                          </div>
                          <div>
                            <small className="text-muted d-block mb-1" style={{ fontSize: "0.8rem", fontWeight: 500 }}>
                              Bon de Commande RAL N°
                            </small>
                            <div style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1FB05B", letterSpacing: "0.5px" }}>
                              {bcRalNumero}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="d-flex align-items-center gap-2">
                          <div className="p-2 rounded" style={{ backgroundColor: "#e8f8f0" }}>
                            <FaCalendarAlt className="text-success" style={{ fontSize: "1rem" }} />
                          </div>
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: "0.75rem", fontWeight: 500 }}>
                              Date génération
                            </small>
                            <strong style={{ fontSize: "0.95rem", color: "#2c3e50" }}>
                              {formatRalDate(bcRalDateGenerationRaw)}
                            </strong>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-4">
                        <div className="text-md-end">
                          <div className="d-flex align-items-center justify-content-md-end gap-2 p-2 rounded" style={{ backgroundColor: "#f8fdf9" }}>
                            <FaBoxOpen className="text-success" style={{ fontSize: "1.1rem" }} />
                            <strong className="text-success" style={{ fontSize: "1.2rem", fontWeight: 700 }}>
                              {ralLinesReadyForBc.length}
                            </strong>
                            <small className="text-muted" style={{ fontSize: "0.85rem", fontWeight: 500 }}>
                              article{ralLinesReadyForBc.length > 1 ? "s" : ""}
                            </small>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>

                <div className="table-responsive mt-3" style={{ borderRadius: "10px", border: "1px solid #F0C060" }}>
                  <Table hover className="align-middle mb-0">
                    <thead style={{ backgroundColor: "#FFFBF0" }}>
                      <tr>
                        <th className="py-3">Code</th>
                        <th className="py-3">Désignation</th>
                        <th className="py-3 text-center">Quantité</th>
                        <th className="py-3 text-center">État RAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ralLinesReadyForBc.length > 0 ? (
                        ralLinesReadyForBc.map((line) => (
                          <tr key={`ready-${line.id}`}>
                            <td className="py-3">{line.code}</td>
                            <td className="py-3">{line.designation}</td>
                            <td className="py-3 text-center">{line.quantite}</td>
                            <td className="py-3 text-center">{getRalStatusBadge(line)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted">
                            Aucun article RAL prêt pour le bon de commande.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </Table>
                </div>

                <div className="mt-3 d-flex justify-content-end">
                  <Button
                    variant="success"
                    className="d-flex align-items-center gap-2"
                    onClick={handleDownloadRalPdf}
                    disabled={isDownloadingRalPdf}
                  >
                    {isDownloadingRalPdf ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                        Téléchargement...
                      </>
                    ) : (
                      <>
                        <FaDownload />
                        Télécharger le PDF du BC RAL
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Résumé global des articles validés (tous sourceLots) */}
      {(() => {
        const totalValidated = Object.values(articlesBySourceLot)
          .flat()
          .filter(article => article.etat === 4)
          .length;

        return totalValidated > 0 ? (
          <Card className="border-0 shadow-sm mb-4" style={{ 
            backgroundColor: '#e8f5e9',
            borderLeft: '6px solid #1FB05B',
            borderRadius: '16px'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-start">
                <div className="p-3 rounded-circle me-3" style={{ 
                  backgroundColor: '#c8e6c9',
                  minWidth: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(31, 176, 91, 0.15)'
                }}>
                  <i className="fas fa-check-circle text-success" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <strong className="text-success d-block mb-2" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {totalValidated} article(s) validé(s) au total
                  </strong>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Ces articles ont été validés et seront inclus dans les bons de commande finaux.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : null;
      })()}

      {/* Résumé global des articles refusés (tous sourceLots) */}
      {(() => {
        const totalRejected = Object.values(articlesBySourceLot)
          .flat()
          .filter(article => article.etat === -3)
          .length;

        return totalRejected > 0 ? (
          <Card className="border-0 shadow-sm mb-4" style={{ 
            backgroundColor: '#fff5f5',
            borderLeft: '6px solid #ff4d4f',
            borderRadius: '16px'
          }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-start">
                <div className="p-3 rounded-circle me-3" style={{ 
                  backgroundColor: '#ffe5e5',
                  minWidth: '56px',
                  height: '56px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(255, 77, 79, 0.15)'
                }}>
                  <i className="fas fa-exclamation-triangle text-danger" style={{ fontSize: '1.5rem' }}></i>
                </div>
                <div className="flex-grow-1">
                  <strong className="text-danger d-block mb-2" style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                    {totalRejected} article(s) refusé(s) au total
                  </strong>
                  <p className="text-muted mb-0" style={{ fontSize: '0.95rem', lineHeight: '1.6' }}>
                    Ces articles ne seront pas inclus dans les bons de commande finaux. 
                    Ils nécessitent une révision ou une modification avant validation.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : null;
      })()}

      {/* Section des actions pour la validation d'état */}
      {(1===1 || user?.role_id === 11 )&& (Data?.etat || data?.etat) === 3 && (Data?.validationclient || data?.validationclient) === null && (
        <Card className="border-0 shadow-sm mb-4" style={{ 
          borderRadius: "16px",
          background: "linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%)"
        }}>
          <Card.Body className="p-4">
            <div className="d-flex align-items-center justify-content-between">
              <div className="d-flex align-items-center gap-3">
                <div className="p-3 rounded-circle" style={{ backgroundColor: "#e8f8f0" }}>
                  <FaClipboardCheck className="text-success" style={{ fontSize: '1.5rem' }} />
                </div>
                <div>
                  <h6 className="mb-1" style={{ fontSize: '1.1rem', fontWeight: 700, color: '#2c3e50' }}>
                    Validation du bon de commande
                  </h6>
                  <small className="text-muted" style={{ fontSize: '0.9rem' }}>
                    Validez ou refusez ce bon de commande pour continuer le traitement
                  </small>
                </div>
              </div>

              <div className="d-flex gap-3">
                <Button 
                  variant="success"
                  size="lg"
                  className="d-flex align-items-center gap-2 px-4 py-2"
                  style={{ 
                    borderRadius: '10px',
                    fontWeight: 600,
                    boxShadow: '0 3px 8px rgba(31, 176, 91, 0.2)'
                  }}
                  onClick={() => handleRequestStateValidation()}
                  disabled={isValidating || isRejecting}
                >
                  <FaCheck style={{ fontSize: '1.1rem' }} />
                  {isValidating ? "Validation..." : "Valider l etape du bon de commande"}
                </Button>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      <ConfirmationPopup
        isVisible={confirmation.isVisible}
        title={confirmation.title}
        message={confirmation.message}
        onConfirm={confirmation.action}
        onCancel={() => setConfirmation(prev => ({ ...prev, isVisible: false }))}
      />

      {/* Modal de confirmation pour la validation d'état */}
      <Modal 
        show={showValidationConfirmation} 
        onHide={handleCancelStateValidation} 
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#1FB05B" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaCheck />
            Validation d'état
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <FaCheck style={{ fontSize: '48px', color: '#1FB05B' }} />
          </div>
          <h5 className="mb-3">Validation du bon de commande</h5>
          {selectedSourceLotToValidate ? (
            <>
              <p className="text-muted mb-2">
                Êtes-vous sûr de vouloir valider le bon de commande suivant ?
              </p>
             
              <div className="text-muted small">
                Cette action validera tous les articles de ce bon de commande.
              </div>
            </>
          ) : (
            <>
              <p className="text-muted">  
                Êtes-vous sûr de vouloir valider ce bon de commande et passer à l'étape "Livraison" ?
              </p>
              <div className="text-muted small">
                Cette action fera progresser la commande vers l'étape de livraison.
              </div>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancelStateValidation}
            className="px-4 me-2"
          >
            Annuler
          </Button>
          <Button 
            variant="primary" 
            onClick={() => {
              if (selectedSourceLotToValidate) {
                handleConfirmValidation();
              } else {
                handleConfirmStateValidation();
              }
            }}
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

      {/* Modal de refus avec justification */}
      <Modal 
        show={showRejectModal} 
        onHide={handleCancelReject} 
        centered
      >
        <Modal.Header closeButton style={{ backgroundColor: "#dc3545" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <i className="fas fa-ban"></i>
            Refuser le bon de commande
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4">
          <div className="mb-3 text-center">
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#dc3545' }}></i>
          </div>
          <h5 className="mb-3 text-center">Refus du bon de commande</h5>
          
          {selectedSourceLotToReject && (
            <div className="mb-3">
              <p className="text-muted text-center mb-2">
                Vous êtes sur le point de refuser le bon de commande suivant :
              </p>
              <div className="p-3 rounded-3 text-center" style={{ backgroundColor: '#fff5f5', border: '2px solid #ff4d4f' }}>
                <strong className="text-danger" style={{ fontSize: '1.1rem' }}>
                  {selectedSourceLotToReject}
                </strong>
              </div>
            </div>
          )}
          
          <p className="text-muted text-center mb-4">
            Veuillez indiquer la raison pour laquelle vous refusez ce bon de commande.
          </p>
          
          <div className="form-group">
            <label htmlFor="rejectReason" className="form-label fw-semibold">
              Motif de refus <span className="text-danger">*</span>
            </label>
            <textarea
              id="rejectReason"
              className="form-control"
              rows={4}
              placeholder="Exemple: Quantités incorrectes, articles manquants, erreur de prix..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{ 
                borderColor: rejectReason.trim().length >= 10 ? '#1FB05B' : '#ced4da',
                resize: 'vertical'
              }}
            />
            <small className="text-muted">
              Minimum 10 caractères requis ({rejectReason.trim().length}/10)
            </small>
          </div>

          <div className="alert alert-warning mt-3 d-flex align-items-start">
            <i className="fas fa-info-circle me-2 mt-1"></i>
            <div>
              <strong>Attention :</strong> Le refus du bon de commande renverra la commande à SALAMA pour révision. 
              Vous serez notifié une fois les modifications effectuées.
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancelReject}
            className="px-4 me-2"
          >
            <i className="fas fa-arrow-left me-1"></i>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmReject}
            className="px-4"
            disabled={!rejectReason.trim() || rejectReason.trim().length < 10 || isRejecting}
          >
            {isRejecting ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Refus...</span>
                </div>
                Refus en cours...
              </>
            ) : (
              <>
                <i className="fas fa-ban me-1"></i>
                Confirmer le refus
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de refus d'article individuel */}
      <Modal 
        show={showArticleRejectModal} 
        onHide={handleCancelArticleReject} 
        centered
        size="lg"
      >
        <Modal.Header closeButton style={{ backgroundColor: "#dc3545" }} className="text-white">
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <i className="fas fa-box-open"></i>
            Refuser l'article
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="p-4">
          <div className="mb-3 text-center">
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '48px', color: '#dc3545' }}></i>
          </div>
          
          {selectedArticle && (
            <div className="mb-4">
              <h5 className="mb-3 text-center">Article sélectionné</h5>
              <div className="card bg-light">
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <strong>Code:</strong> {selectedArticle.code}
                    </div>
                    <div className="col-md-6">
                      <strong>Quantité commandée:</strong> {selectedArticle.quantite_commandee || selectedArticle.quantite || 0}
                    </div>
                    <div className="col-12 mt-2">
                      <strong>Désignation:</strong><br/>
                      {selectedArticle.designation}
                    </div>
                    {selectedArticle.prix_unitaire && (
                      <>
                        <div className="col-md-6 mt-2">
                          <strong>Prix unitaire:</strong> {selectedArticle.prix_unitaire?.toLocaleString('fr-FR')} Ar
                        </div>
                        <div className="col-md-6 mt-2">
                          <strong>Montant:</strong> {selectedArticle.montant?.toLocaleString('fr-FR')} Ar
                        </div>
                      </>
                    )}
                    {selectedArticle.lot && (
                      <div className="col-md-6 mt-2">
                        <strong>Lot:</strong> {selectedArticle.lot}
                      </div>
                    )}
                    {selectedArticle.date_peremption && (
                      <div className="col-md-6 mt-2">
                        <strong>Date péremption:</strong> {selectedArticle.date_peremption}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <h5 className="mb-3 text-center">Motif de refus</h5>
          <p className="text-muted text-center mb-4">
            Veuillez indiquer pourquoi vous refusez cet article spécifiquement.
          </p>
          
          <div className="form-group">
            <label htmlFor="articleRejectReason" className="form-label fw-semibold">
              Motif de refus <span className="text-danger">*</span>
            </label>
            <textarea
              id="articleRejectReason"
              className="form-control"
              rows={4}
              placeholder="Exemple: Prix trop élevé, article non conforme, quantité incorrecte, produit non souhaité..."
              value={articleRejectReason}
              onChange={(e) => setArticleRejectReason(e.target.value)}
              style={{ 
                borderColor: articleRejectReason.trim().length >= 10 ? '#1FB05B' : '#ced4da',
                resize: 'vertical'
              }}
            />
            <small className="text-muted">
              Minimum 10 caractères requis ({articleRejectReason.trim().length}/10)
            </small>
          </div>

          <div className="alert alert-info mt-3 d-flex align-items-start">
            <i className="fas fa-info-circle me-2 mt-1"></i>
            <div>
              <strong>Information :</strong> Le refus de cet article sera notifié à SALAMA. 
              L'article ne sera pas inclus dans la commande finale.
            </div>
          </div>
        </Modal.Body>
        
        <Modal.Footer style={{ border: "none" }} className="px-4 pb-4 justify-content-center">
          <Button 
            variant="outline-secondary" 
            onClick={handleCancelArticleReject}
            className="px-4 me-2"
          >
            <i className="fas fa-arrow-left me-1"></i>
            Annuler
          </Button>
          <Button 
            variant="danger" 
            onClick={handleConfirmArticleReject}
            className="px-4"
            disabled={!articleRejectReason.trim() || articleRejectReason.trim().length < 10 || isRejectingArticle}
          >
            {isRejectingArticle ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Refus...</span>
                </div>
                Refus en cours...
              </>
            ) : (
              <>
                <i className="fas fa-ban me-1"></i>
                Refuser l'article
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
    </div>
  );
};

export default BonCommande;