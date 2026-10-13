import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  Button,
  Badge,
  Card,
  Alert,
  Modal,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import {
  FaFileInvoiceDollar,
  FaCalendarAlt,
  FaCircle,
  FaDownload,
  FaCheck,
  FaHistory,
  FaBoxOpen,
  FaBan,
  FaClock,
} from "react-icons/fa";
import { createItem } from "../../api/crudService";

import { restClient } from "../../api/client";
import { useNotification } from "../../hooks/useNotification";
import useHistoriqueDemandeClientBatch from "../../hooks/useHistoriqueDemandeClient";
import NotificationPopup from "../ui/NotificationPopup";
import HistoriqueDemandeModal from "../modals/HistoriqueDemandeModal";
import { User } from "../../types/user.types";

// Liste des clients spéciaux qui verront la colonne "Fabricant"
const SPECIAL_CLIENTS = [
  "DSF",
  "MSF",
  "MDM",
  "ACF",
  "MSM",
  "IPM",
  "International SOS",
  "OPERATION SMILE",
  "CRS",
  "ARZTE DOCTORS FOR MADAGASCAR",
  "CHAINE DE L'ESPOIR",
];

// Définition des types
interface Article {
  code: string;
  designation: string;
  fabricant?: string;
  quantite: number;
  quantite_acceptee_client?: number; // Quantité que le client s'engage à réceptionner/traiter
  prix_unitaire: number;
  date_peremption: string;
  montant: number;
  sourceLot?: string; // Source du produit (ex: "SALAMA", "FOURNISSEUR_A", etc.)
  etat?: number; // -2 = article refusé, 2 = en attente validation, 3 = validé/accepté
  id_ligne?: number; // ID de la ligne de commande pour le refus
  remise?: number; // Remise en pourcentage
  is_ral?: boolean | number;
  etat_ral?: number;
  etat_ral_text?: string;
  etat_ral_badge?: string;
  lot?: string;
}

interface HistoriqueModification {
  date: string;
  motif: string;
  utilisateur: string;
}

interface Totaux {
  ht: number;
  imp: number;
  ttc: number;
}

interface Encours {
  autorise: number;
  reel: number;
}

interface Alertes {
  encours_depasse: boolean;
  rupture_stock: boolean;
  peremption_proche: boolean;
}

interface FactureProformaData {
  numero: string;
  date_emission: string;
  statut: string;
  etat: number;
  validationclient: number | null;
  validationsalama: number | null;
  codeproforma_agence?: string | null;
  codeproforma_central?: string | null;
  status?: string;
  type_commande?: string;
  articles: Article[];
  totaux: Totaux;
  encours?: Encours;
  historique_modifications?: HistoriqueModification[];
  alertes?: Alertes;
}

interface FactureProformaProps {
  data?: FactureProformaData;
  user?: User;
  orderType?:
    | "programme"
    | "rc_public"
    | "rc_prive"
    | "tef"
    | "be"
    | "ferme"
    | "urgence"
    | "enlevement"
    | null;
  Data?: any; // Données de la commande complète
  setData?: React.Dispatch<React.SetStateAction<any>>;
  onRefreshCommande?: () => Promise<void>;
  onGoToVueGlobale?: () => void;
}

interface RalProformaLine {
  id: string | number;
  id_ligne?: number;
  code: string;
  designation: string;
  quantite: number;
  prixUnitaire: number;
  montant: number;
  etat_ral: number;
  etat_ral_text: string;
  etat_ral_badge: string;
  lot: string;
}

// Données de mock pour tester le composant
const mockFactureProforma: FactureProformaData = {
  numero: "FP-2025-0123",
  date_emission: "2025-10-05T14:30:00",
  statut: "en attente validation",
  etat: 2,
  validationclient: null,
  validationsalama: null,
  type_commande: "BE",
  articles: [
    {
      code: "MED-001",
      designation: "CODV complexe homeopathique - flacon de 25 ml PQT6",
      fabricant: "SANOFI",
      quantite: 500,
      prix_unitaire: 1200,
      date_peremption: "2026-03-30",
      montant: 600000,
      sourceLot: "SALAMA",
    },
    {
      code: "MED-003",
      designation: "PARACETAMOL 500mg - Boîte de 20 comprimés",
      fabricant: "PFIZER",
      quantite: 1000,
      prix_unitaire: 800,
      date_peremption: "2026-06-20",
      montant: 800000,
      sourceLot: "FOURNISSEUR_EXTERNE",
    },
    {
      code: "MED-004",
      designation: "AMOXICILLINE 1g - Boîte de 14 gélules",
      fabricant: "SANOFI",
      quantite: 300,
      prix_unitaire: 3500,
      date_peremption: "2026-08-15",
      montant: 1050000,
      sourceLot: "FOURNISSEUR_EXTERNE",
    },
  ],
  totaux: {
    ht: 2450000,
    imp: 196000,
    ttc: 2646000,
  },
  encours: {
    autorise: 5000000,
    reel: 3500000,
  },
  historique_modifications: [
    {
      date: "2025-10-06T09:15:00",
      motif: "Ajustement des quantités",
      utilisateur: "Jean Dupont (Pharmacien)",
    },
  ],
  alertes: {
    encours_depasse: false,
    rupture_stock: false,
    peremption_proche: true,
  },
};

const FactureProforma: React.FC<FactureProformaProps> = ({
  data = mockFactureProforma,
  user,
  Data,
  setData,
  onRefreshCommande,
  onGoToVueGlobale,
}) => {
  const dataRecord = data as unknown as Record<string, unknown>;

  // États pour la validation
  const [isValidating, setIsValidating] = useState(false);
  const [showValidationConfirmation, setShowValidationConfirmation] =
    useState(false);
  const [
    showClientValidationConfirmation,
    setShowClientValidationConfirmation,
  ] = useState(false);
  const [isClientValidating, setIsClientValidating] = useState(false);
  const [selectedSourceLotToValidate, setSelectedSourceLotToValidate] =
    useState<string | null>(null);

  // États pour le refus
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);
  const [selectedSourceLotToReject, setSelectedSourceLotToReject] = useState<
    string | null
  >(null);

  // États pour le refus d'article individuel
  const [showArticleRejectModal, setShowArticleRejectModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [articleRejectReason, setArticleRejectReason] = useState("");
  const [isRejectingArticle, setIsRejectingArticle] = useState(false);
  // const [rejectedArticles, setRejectedArticles] = useState<Set<string>>(new Set());

  // États pour le modal de quantité acceptée
  const [showQuantiteModal, setShowQuantiteModal] = useState(false);
  const [selectedArticleForQuantite, setSelectedArticleForQuantite] =
    useState<Article | null>(null);
  const [quantiteAcceptee, setQuantiteAcceptee] = useState<number>(0);
  const [motifQuantite, setMotifQuantite] = useState("");
  const [isSavingQuantite, setIsSavingQuantite] = useState(false);
  const [affecterNouveauLot, setAffecterNouveauLot] = useState<boolean>(false);

  // États pour le modal d'historique des demandes
  const [showHistoriqueModal, setShowHistoriqueModal] = useState(false);
  const [selectedArticleForHistorique, setSelectedArticleForHistorique] =
    useState<Article | null>(null);

  // État pour le téléchargement PDF
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);
  const [isDownloadingRalProformaPdf, setIsDownloadingRalProformaPdf] =
    useState(false);
  const [isSubmittingRalEtape2, setIsSubmittingRalEtape2] = useState(false);
  const [ralEtape2ErrorMessage, setRalEtape2ErrorMessage] = useState<string | null>(null);
  const [isRalEtape2Validated, setIsRalEtape2Validated] = useState(
    Number(
      Data?.validationclient_ral_etape2 ??
        (dataRecord.validationclient_ral_etape2 as
          | number
          | string
          | null
          | undefined) ??
        0,
    ) === 1,
  );

  useEffect(() => {
    setIsRalEtape2Validated(
      Number(
        Data?.validationclient_ral_etape2 ??
          (dataRecord.validationclient_ral_etape2 as
            | number
            | string
            | null
            | undefined) ??
          0,
      ) === 1,
    );
  }, [Data?.validationclient_ral_etape2, dataRecord.validationclient_ral_etape2]);
  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  // Récupérer tous les IDs de lignes pour le hook batch
  const allLigneIds = useMemo(() => {
    const ids = (data?.articles || []).map(
      (article: Article) => article.id_ligne,
    );
    // console.log("[FactureProforma] data.articles:", data?.articles);
    // console.log("[FactureProforma] allLigneIds extraits:", ids);
    return ids;
  }, [data?.articles]);

  // Hook pour récupérer l'historique des demandes client (batch)
  const {
    hasDemandeEnCours,
    getDerniereDemande,
    getHistorique,
    // loading: loadingHistorique
  } = useHistoriqueDemandeClientBatch(allLigneIds);

  // Vérifier si le client est dans la liste spéciale (pour affichage de la colonne fabricant)
  const isSpecialClient = SPECIAL_CLIENTS.includes(user?.organization || "");

  // Vérifier si le client a IMP (pour affichage des montants)
  const hasIMP = user?.type === "AVEC_IMP";
  const quantiteReference = selectedArticleForQuantite?.quantite ?? 0;
  const remainingQuantity = Math.max(0, quantiteReference - quantiteAcceptee);

  // Fonction pour ouvrir le modal de quantité acceptée
  const handleOpenQuantiteModal = (article: Article) => {
    setSelectedArticleForQuantite(article);
    setQuantiteAcceptee(article.quantite_acceptee_client ?? article.quantite);
    setMotifQuantite("");
    setAffecterNouveauLot(false);
    setShowQuantiteModal(true);
  };

  // Fonction pour fermer le modal de quantité acceptée
  const handleCloseQuantiteModal = () => {
    setShowQuantiteModal(false);
    setSelectedArticleForQuantite(null);
    setQuantiteAcceptee(0);
    setMotifQuantite("");
    setAffecterNouveauLot(false);
  };

  // Fonction pour sauvegarder la quantité acceptée
  const handleSaveQuantiteAcceptee = async () => {
    if (!selectedArticleForQuantite) return;

    // Validation de la quantité
    if (quantiteAcceptee < 0) {
      showError(
        "Quantité invalide",
        "La quantité acceptée ne peut pas être négative.",
      );
      return;
    }

    // Validation de la quantité (on n'interdit plus de dépasser la quantité proposée)
    // if (quantiteAcceptee > selectedArticleForQuantite.quantite) {
    //   showError("Quantité excessive", `La quantité acceptée ne peut pas dépasser ${selectedArticleForQuantite.quantite}.`);
    //   return;
    // }

    // Motif facultatif
    // if (quantiteAcceptee < selectedArticleForQuantite.quantite && motifQuantite.trim().length < 10) {
    //   showError("Motif requis", "Veuillez préciser un motif d'au moins 10 caractères pour la réduction de quantité.");
    //   return;
    // }

    setIsSavingQuantite(true);

    try {
      // console.log("💾 Sauvegarde de la quantité acceptée...");
      // console.log("📦 Article:", selectedArticleForQuantite.code);
      // console.log("📋 Quantité acceptée:", quantiteAcceptee);
      // console.log("📝 Motif:", motifQuantite);
      // console.log("📦 Affecter à nouveau lot:", affecterNouveauLot);

      // Vérifier que l'article a un id_ligne
      if (!selectedArticleForQuantite.id_ligne) {
        showError(
          "Erreur",
          "Impossible de traiter cette demande : ID de ligne manquant.",
        );
        return;
      }

      // Appel API pour sauvegarder la demande client
      const payload = {
        lignecommande_id: selectedArticleForQuantite.id_ligne,
        quantite_demande: quantiteAcceptee,
        motif_demande: motifQuantite.trim(),
        affecter_nouveau_lot: affecterNouveauLot ? 1 : 0,
      };

      // console.log("📤 Payload de demande client:", payload);

      const response = await createItem(
        "api/commande/addDemandeClient",
        payload,
      );

      console.log("✅ Réponse de l'API:", response);

      // Vérifier si la réponse contient une erreur
      const responseData = response?.data as {
        succes?: null | boolean;
        success?: null | boolean;
        message?: string;
      };
      if (responseData?.succes === null || responseData?.success === null) {
        throw new Error(
          responseData?.message ||
            "Erreur lors de l'enregistrement de la demande",
        );
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        throw new Error(
          `Erreur HTTP ${response.status}: ${response.statusText}`,
        );
      }

      showSuccess(
        "Demande enregistrée",
        `Votre demande pour l'article ${selectedArticleForQuantite.code} a été enregistrée avec succès.`,
      );

      handleCloseQuantiteModal();

      // Recharger après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("❌ Erreur lors de la sauvegarde:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showError(
        "Erreur de sauvegarde",
        `Impossible d'enregistrer la quantité : ${errorMessage}`,
      );
    } finally {
      setIsSavingQuantite(false);
    }
  };

  // Formatter les dates
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  // Obtenir la couleur du badge selon le statut
  const getStatusBadge = (status: string, badgeClass?: string) => {
    // Si une classe de badge spécifique est fournie (pour les commandes programme)
    if (badgeClass) {
      return <Badge className={badgeClass}>{status || "Non défini"}</Badge>;
    }

    // Logique par défaut basée sur le texte du statut
    let bgColor = "secondary";
    switch (status?.toLowerCase()) {
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

  // Vérifier si une date de péremption est proche (moins de 6 mois)
  const isPeremptionProche = (datePeremption: string) => {
    try {
      const peremption = new Date(datePeremption);
      const maintenant = new Date();
      const sixMois = 15768000000; // 6 mois en millisecondes
      return peremption.getTime() - maintenant.getTime() < sixMois;
    } catch {
      return false;
    }
  };

  const getArticleMontantNet = (article: Article) => {
    const quantite = Number(article.quantite ?? 0);
    const prixUnitaire = Number(article.prix_unitaire ?? 0);
    const remise = Number(article.remise ?? 0);
    const montantBrut = quantite * prixUnitaire;
    const montantNet = montantBrut * (1 - remise / 100);

    return Math.max(0, Math.round(montantNet));
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

  // Fonction pour annuler la validation client
  const handleCancelClientValidation = () => {
    setShowClientValidationConfirmation(false);
  };

  const handleRequestClientValidation = () => {
    setShowClientValidationConfirmation(true);
    setIsClientValidating(false);
  };

  // Fonction pour valider la commande côté client (validation de la facture proforma)
  const handleConfirmClientValidation = async () => {
    setShowClientValidationConfirmation(false);
    setIsClientValidating(true);

    try {
      console.log("🔄 Début de la validation client de la facture proforma...");
      console.log("📋 ID Commande:", Data?.id);
      console.log("👤 ID Utilisateur:", user?.id);

      // Préparer le payload pour la validation client
      const clientValidationPayload = {
        id: data.numero,
        user_id: user?.id,
        validationclient: 1,
      };

      console.log("📤 Payload de validation client:", clientValidationPayload);

      const response = await createItem(
        "api/commande/statut",
        clientValidationPayload,
      );

      console.log("✅ Réponse de l'API de validation client:", response);

      if (response.status !== 200 && response.status !== 201) {
        console.error(
          "❌ Erreur HTTP lors de la validation client:",
          response.status,
          response.statusText,
        );
        throw new Error(
          `Erreur lors de la validation client : ${response.statusText}`,
        );
      }

      console.log("✅ Facture proforma validée avec succès par le client!");

      // Mettre à jour les données locales pour refléter la validation client
      if (Data && setData) {
        const updatedData = { ...Data, validationclient: 1 };
        setData(updatedData);
      }

      showSuccess(
        "Facture validée",
        "La facture proforma a été validée avec succès !",
      );

      // Recharger la page après un court délai pour permettre à la notification d'être visible
      setTimeout(() => {
        window.location.reload();
      }, 3000); // Délai de 3 secondes
    } catch (error) {
      console.error("❌ Erreur lors de la validation client:", error);
      showError(
        "Erreur de validation",
        `Impossible de valider la facture : ${error}`,
      );
    } finally {
      setIsClientValidating(false);
    }
  };

  // Fonction pour valider une facture spécifique (par sourceLot)
  const handleConfirmValidation = async () => {
    setShowValidationConfirmation(false);
    setIsValidating(true);

    try {
      console.log("🔄 Début de la validation de la facture...");
      console.log("📋 ID Commande:", data.numero);
      console.log("📦 SourceLot ciblé:", selectedSourceLotToValidate);
      console.log("👤 ID Utilisateur:", user?.id);

      if (
        !selectedSourceLotToValidate ||
        selectedSourceLotToValidate.trim() === ""
      ) {
        showError("Erreur", "Aucune facture sélectionnée pour validation.");
        setIsValidating(false);
        return;
      }

      // Récupérer tous les id_ligne des articles de ce sourceLot
      const articlesInSourceLot = (data?.articles || []).filter(
        (article: Article) => {
          const articleSource =
            article.sourceLot && article.sourceLot.trim() !== ""
              ? article.sourceLot
              : "STOCK_PRINCIPAL";
          return (
            articleSource === selectedSourceLotToValidate && article.etat !== -2
          );
        },
      );

      const ligneIds = articlesInSourceLot
        .map((article: Article) => article.id_ligne)
        .filter((id): id is number => id !== undefined);

      if (ligneIds.length === 0) {
        showError(
          "Erreur",
          "Aucune ligne valide à valider pour cette facture.",
        );
        setIsValidating(false);
        return;
      }

      console.log("📦 Lignes à valider:", ligneIds);

      // Utiliser l'API pour valider toutes les lignes de cette facture
      const validationPayload = {
        ligne_ids: ligneIds,
        nouvel_etat: 3,
        user_id: user?.id,
      };

      console.log("📤 Payload de validation:", validationPayload);
      const response = await createItem(
        "api/commande/valider-lignes-facture",
        validationPayload,
      );

      console.log("✅ Réponse de l'API de finalisation:", response);

      // Vérifier si la réponse contient une erreur (success: null ou succes: null)
      const responseData = response?.data as {
        succes?: null | boolean;
        success?: null | boolean;
        message?: string;
      };
      if (responseData?.succes === null || responseData?.success === null) {
        const errorMessage =
          responseData?.message || "Erreur lors de la finalisation";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de finalisation", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error(
          "❌ Erreur HTTP lors de la finalisation:",
          response.status,
          response.statusText,
        );
        const errorMessage = responseData?.message || response.statusText;
        showError(
          "Erreur de finalisation",
          `La finalisation a échoué : ${errorMessage}`,
        );
        throw new Error(`Erreur lors de la finalisation : ${errorMessage}`);
      }

      console.log("✅ Réponse de l'API:", response);

      // Vérifier si la réponse contient une erreur
      const validationResponseData = response?.data as {
        succes?: null | boolean;
        success?: null | boolean;
        message?: string;
      };
      if (
        validationResponseData?.succes === null ||
        validationResponseData?.success === null
      ) {
        const errorMessage =
          validationResponseData?.message || "Erreur lors de la validation";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de validation", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error(
          "❌ Erreur HTTP lors de la validation:",
          response.status,
          response.statusText,
        );
        const errorMessage =
          validationResponseData?.message || response.statusText;
        showError(
          "Erreur de validation",
          `La validation a échoué : ${errorMessage}`,
        );
        throw new Error(`Erreur lors de la validation : ${errorMessage}`);
      }

      console.log("✅ Facture validée avec succès!");

      showSuccess(
        "Facture validée",
        `La facture proforma (${selectedSourceLotToValidate}) a été validée avec succès.`,
      );

      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("❌ Erreur lors de la validation:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showError(
        "Erreur de validation",
        `Impossible de valider la facture : ${errorMessage}`,
      );
    } finally {
      setIsValidating(false);
      setSelectedSourceLotToValidate(null);
    }
  };

  // Fonction pour ouvrir le modal de refus
  const handleRequestReject = (sourceLot?: string | null) => {
    setSelectedSourceLotToReject(sourceLot || null);
    setShowRejectModal(true);
    setRejectReason("");
  };

  // Fonction pour annuler le refus
  const handleCancelReject = () => {
    setShowRejectModal(false);
    setRejectReason("");
    setSelectedSourceLotToReject(null);
  };

  // Fonction pour confirmer le refus d'une facture spécifique
  const handleConfirmReject = async () => {
    // Validation du motif de refus
    if (!rejectReason.trim() || rejectReason.trim().length < 10) {
      showError(
        "Motif requis",
        "Veuillez indiquer un motif de refus d'au moins 10 caractères.",
      );
      return;
    }

    setShowRejectModal(false);
    setIsRejecting(true);

    try {
      console.log("🔄 Début du refus de la facture...");
      console.log("📋 ID Commande:", data.numero);
      console.log("📦 SourceLot ciblé:", selectedSourceLotToReject);
      console.log("👤 ID Utilisateur:", user?.id);
      console.log("📝 Motif de refus:", rejectReason);

      if (
        !selectedSourceLotToReject ||
        selectedSourceLotToReject.trim() === ""
      ) {
        showError("Erreur", "Aucune facture sélectionnée pour refus.");
        setIsRejecting(false);
        return;
      }

      // Récupérer tous les id_ligne des articles de ce sourceLot
      const articlesInSourceLot = (data?.articles || []).filter(
        (article: Article) => {
          const articleSource =
            article.sourceLot && article.sourceLot.trim() !== ""
              ? article.sourceLot
              : "STOCK_PRINCIPAL";
          return (
            articleSource === selectedSourceLotToReject && article.etat !== -2
          );
        },
      );

      const ligneIds = articlesInSourceLot
        .map((article: Article) => article.id_ligne)
        .filter((id): id is number => id !== undefined);

      if (ligneIds.length === 0) {
        showError(
          "Erreur",
          "Aucune ligne valide à refuser pour cette facture.",
        );
        setIsRejecting(false);
        return;
      }

      console.log("📦 Lignes à refuser:", ligneIds);

      // Utiliser l'API pour refuser toutes les lignes de cette facture
      const rejectPayload = {
        ligne_ids: ligneIds,
        motif: rejectReason.trim(),
        etape: 2,
      };

      console.log("📤 Payload de refus:", rejectPayload);
      const response = await createItem(
        "api/commande/toutrejeterlignecommande",
        rejectPayload,
      );

      console.log("✅ Réponse de l'API de refus:", response);

      // Vérifier si la réponse contient une erreur
      const rejectResponseData = response?.data as {
        succes?: null | boolean;
        success?: null | boolean;
        message?: string;
      };
      if (
        rejectResponseData?.succes === null ||
        rejectResponseData?.success === null
      ) {
        const errorMessage =
          rejectResponseData?.message || "Erreur lors du refus";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de refus", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error(
          "❌ Erreur HTTP lors du refus:",
          response.status,
          response.statusText,
        );
        const errorMessage = rejectResponseData?.message || response.statusText;
        showError("Erreur de refus", `Le refus a échoué : ${errorMessage}`);
        throw new Error(`Erreur lors du refus : ${errorMessage}`);
      }

      console.log("✅ Facture refusée avec succès!");

      showSuccess(
        "Facture refusée",
        `La facture proforma (${selectedSourceLotToReject}) a été refusée avec succès.`,
      );

      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("❌ Erreur lors du refus:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showError(
        "Erreur de refus",
        `Impossible de refuser la facture : ${errorMessage}`,
      );
    } finally {
      setIsRejecting(false);
      setRejectReason("");
      setSelectedSourceLotToReject(null);
    }
  };

  // Fonction pour ouvrir le modal de refus d'article
  const handleRequestArticleReject = (article: Article) => {
    setSelectedArticle(article);
    setShowArticleRejectModal(true);
    setArticleRejectReason("");
  };

  // Fonction pour annuler le refus d'article
  const handleCancelArticleReject = () => {
    setShowArticleRejectModal(false);
    setSelectedArticle(null);
    setArticleRejectReason("");
  };

  // Fonction pour confirmer le refus d'un article
  const handleConfirmArticleReject = async () => {
    if (!selectedArticle) return;

    // Validation du motif de refus
    if (!articleRejectReason.trim() || articleRejectReason.trim().length < 10) {
      showError(
        "Motif requis",
        "Veuillez indiquer un motif de refus d'au moins 10 caractères.",
      );
      return;
    }

    // Vérifier que l'article a un id_ligne
    if (!selectedArticle.id_ligne) {
      showError(
        "Erreur",
        "Impossible de refuser cet article : ID de ligne manquant.",
      );
      return;
    }

    setShowArticleRejectModal(false);
    setIsRejectingArticle(true);

    try {
      console.log("🔄 Début du refus de l'article...");
      console.log(
        "📦 Article:",
        selectedArticle.code,
        selectedArticle.designation,
      );
      console.log("📋 ID Ligne:", selectedArticle.id_ligne);
      console.log("📝 Motif de refus:", articleRejectReason);

      // Préparer le payload pour le refus d'article
      const articleRejectPayload = {
        id: selectedArticle.id_ligne,
        motif: articleRejectReason.trim(),
        etape: 2,
      };

      console.log("📤 Payload de refus d'article:", articleRejectPayload);

      // Appel API pour rejeter la ligne de commande
      const response = await createItem(
        "api/commande/rejeterlignecommande",
        articleRejectPayload,
      );

      console.log("✅ Réponse de l'API:", response);

      // Vérifier si la réponse contient une erreur
      const responseData = response?.data as {
        succes?: null | boolean;
        success?: null | boolean;
        message?: string;
      };
      if (responseData?.succes === null || responseData?.success === null) {
        const errorMessage =
          responseData?.message || "Erreur lors du refus de l'article";
        console.error("❌ Erreur API:", errorMessage);
        showError("Erreur de refus", errorMessage);
        throw new Error(errorMessage);
      }

      // Vérifier le statut HTTP
      if (response.status !== 200 && response.status !== 201) {
        console.error(
          "❌ Erreur HTTP lors du refus:",
          response.status,
          response.statusText,
        );
        const errorMessage = responseData?.message || response.statusText;
        showError("Erreur de refus", `Le refus a échoué : ${errorMessage}`);
        throw new Error(`Erreur lors du refus : ${errorMessage}`);
      }

      console.log("✅ Article refusé avec succès!");

      showSuccess(
        "Article refusé",
        `L'article ${selectedArticle.code} a été refusé avec succès.`,
      );

      // Recharger la page après un court délai
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("❌ Erreur lors du refus de l'article:", error);
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      showError(
        "Erreur de refus",
        `Impossible de refuser l'article : ${errorMessage}`,
      );
    } finally {
      setIsRejectingArticle(false);
      setArticleRejectReason("");
      setSelectedArticle(null);
    }
  };

  // Fonction pour regrouper les articles par sourceLot
  const groupArticlesBySourceLot = () => {
    const groups: { [key: string]: Article[] } = {};

    (data?.articles || []).forEach((article: Article) => {
      // Ne pas inclure les articles sans sourceLot (vide ou null)
      if (!article.sourceLot || article.sourceLot.trim() === "") {
        return; // Skip cet article
      }

      const source = article.sourceLot.trim();

      if (!groups[source]) {
        groups[source] = [];
      }
      groups[source].push(article);
    });

    return groups;
  };

  // Fonction pour vérifier s'il y a au moins un article valide (etat === 2 ou etat === 3)
  const hasValidArticles = () => {
    return (data?.articles || []).some(
      (article: Article) => article.etat === 2 || article.etat === 3,
    );
  };

  // Fonction pour générer le numéro de facture par sourceLot
  const generateFactureNumber = (
    baseNumero: string,
    index: number,
    sourceLot?: string,
  ) => {
    // Si on a un code proforma spécifique dans les données
    if (sourceLot === "Magasin Central" && data?.codeproforma_central) {
      return data.codeproforma_central;
    } else if (sourceLot !== "Magasin Central" && data?.codeproforma_agence) {
      return data.codeproforma_agence;
    }

    // Fallback : Extraire l'année du numéro de base (format attendu: FP-XXXX ou similaire)
    const currentYear = new Date().getFullYear();

    // Format: PF-numero-annee-index (ex: PF-0123-2025-1, PF-0123-2025-2)
    const numeroOnly = baseNumero.replace(/[^\d]/g, ""); // Extraire uniquement les chiffres
    return `PF-${numeroOnly}-${currentYear}-${index}`;
  };

  // Calculer les totaux par sourceLot
  const calculateTotalsForGroup = (articles: Article[]) => {
    const ht = articles.reduce(
      (sum, article) => sum + getArticleMontantNet(article),
      0,
    );
    const imp = hasIMP ? ht * 0.08 : 0;
    const ttc = ht + imp;

    return { ht, imp, ttc };
  };

  // Fonction pour télécharger le PDF d'une facture
  const handleDownloadPDF = async (
    articles: Article[],
    factureNumber: string,
    sourceLot: string,
  ) => {
    const ligneIds = articles
      .map((article: Article) => article.id_ligne)
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
        "pdf/facture-proforma",
        { ligne_ids: ligneIds },
        { responseType: "blob" },
      );

      // Créer un blob à partir de la réponse
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Créer un lien temporaire pour télécharger le fichier
      const link = document.createElement("a");
      link.href = url;
      link.download = `${factureNumber}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Nettoyer
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess(
        "Téléchargement réussi",
        `La facture ${factureNumber} a été téléchargée avec succès.`,
      );
    } catch (error) {
      console.error("❌ Erreur lors du téléchargement PDF:", error);
      showError(
        "Erreur de téléchargement",
        "Impossible de télécharger le PDF. Veuillez réessayer.",
      );
    } finally {
      setIsDownloadingPdf(null);
    }
  };

  // Regrouper les articles par sourceLot
  const articlesBySourceLot = groupArticlesBySourceLot();
  const sourceLots = Object.keys(articlesBySourceLot);

  const sourceDataLines = useMemo(() => {
    const detailsFromCommande = Array.isArray(Data?.detailcommandes)
      ? (Data.detailcommandes as Record<string, unknown>[])
      : Array.isArray(Data?.lignecommandes)
        ? (Data.lignecommandes as Record<string, unknown>[])
        : [];

    const fallbackArticles = Array.isArray(dataRecord.articles)
      ? (dataRecord.articles as Record<string, unknown>[])
      : [];

    return detailsFromCommande.length > 0 ? detailsFromCommande : fallbackArticles;
  }, [Data?.detailcommandes, Data?.lignecommandes, dataRecord.articles]);

  const hasAnyRalLines = useMemo(
    () =>
      sourceDataLines.some(
        (line) => Number(line?.is_ral ?? 0) === 1 || line?.is_ral === true,
      ),
    [sourceDataLines],
  );

  const validationsalamaRalEtape1 = Number(
    Data?.validationsalama_ral_etape1 ??
      (dataRecord.validationsalama_ral_etape1 as
        | number
        | string
        | null
        | undefined) ??
      0,
  );

  const validationDvmRalEtape2 = Number(
    Data?.validation_dvm_ral_etape2 ??
      (dataRecord.validation_dvm_ral_etape2 as
        | number
        | string
        | null
        | undefined) ??
      0,
  );

  const shouldShowRalProformaSection = validationsalamaRalEtape1 === 1;

  const ralLines = useMemo<RalProformaLine[]>(() => {
    return sourceDataLines
      .filter((line) => {
        const isRal = Number(line?.is_ral ?? 0) === 1 || line?.is_ral === true;
        const etatLigne = Number(line?.etat ?? 0);
        return isRal && etatLigne > 0;
      })
      .map((line, index) => {
        const articleRecord =
          (line?.article as Record<string, unknown> | undefined) || {};
        const quantite = Number(line?.qte_commandee ?? line?.quantite ?? 0);
        const prixUnitaire = Number(
          line?.prix_unitaire ?? line?.prix ?? line?.pv_ht ?? 0,
        );
        const montant = Number(line?.montant ?? quantite * prixUnitaire);
        const lineId = line?.id ?? line?.id_ligne;
        const lot =
          (typeof line?.lot === "string" && line.lot) ||
          (typeof line?.source_lot === "string" && line.source_lot) ||
          "";

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

        console.log(`🔍 Ligne RAL ${index}: id_ligne=${id_ligne}, id=${line?.id}, id_ligne_field=${line?.id_ligne}, code=${line?.code}`);

        return {
          id:
            typeof lineId === "number" || typeof lineId === "string"
              ? lineId
              : `ral-ligne-${index}`,
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
          quantite,
          prixUnitaire,
          montant,
          etat_ral: Number(line?.etat_ral ?? 0),
          etat_ral_text:
            (typeof line?.etat_ral_text === "string" && line.etat_ral_text) ||
            "",
          etat_ral_badge:
            (typeof line?.etat_ral_badge === "string" && line.etat_ral_badge) ||
            "",
          lot,
        };
      });
  }, [sourceDataLines]);

  const getRalStatusBadge = (line: RalProformaLine) => {
    if (line.etat_ral_badge) {
      return (
        <Badge className={line.etat_ral_badge}>
          {line.etat_ral_text || "État RAL"}
        </Badge>
      );
    }

    if (line.etat_ral_text) {
      return <Badge bg="secondary">{line.etat_ral_text}</Badge>;
    }

    if (line.etat_ral >= 4) {
      return <Badge bg="success">Validé</Badge>;
    }

    if (line.etat_ral >= 3) {
      return <Badge bg="info">En cours</Badge>;
    }

    return (
      <Badge bg="warning" text="dark">
        Traitement initial
      </Badge>
    );
  };

  const handleValidateRalProforma = async () => {
    const commandeId = Data?.id ?? dataRecord.id ?? data?.numero;

    if (!commandeId) {
      showError("Erreur RAL", "Identifiant de commande introuvable.");
      return;
    }

    setIsSubmittingRalEtape2(true);
    setRalEtape2ErrorMessage(null);

    try {
      const payload = {
        id: commandeId,
        validationclient_ral_etape2: 1,
      };

      const response = await createItem("api/commande/statut-ral", payload);
      const responseData = response?.data as {
        succes?: number | string | boolean;
        message?: string;
      };

      if (Number(responseData?.succes ?? 0) !== 1) {
        const apiMessage =
          responseData?.message || "Impossible de valider la proforma RAL.";
        setRalEtape2ErrorMessage(apiMessage);

        if (apiMessage.trim() === "Le client doit valider son besoin d'abord.") {
          showError(
            "Étape RAL 1 manquante",
            "Le besoin RAL doit être validé dans l'onglet Vue globale avant cette étape.",
          );
          if (onGoToVueGlobale) {
            onGoToVueGlobale();
          }
        }
        return;
      }

      setIsRalEtape2Validated(true);
      if (Data && setData) {
        setData({ ...Data, validationclient_ral_etape2: 1 });
      }

      showSuccess(
        "Proforma RAL validée",
        responseData?.message || "Proforma RAL validée — en attente de validation interne (DM et DVM)",
      );

      if (onRefreshCommande) {
        await onRefreshCommande();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      setRalEtape2ErrorMessage(errorMessage);
    } finally {
      setIsSubmittingRalEtape2(false);
    }
  };

  const shouldRenderRalProformaSection =
    hasAnyRalLines && shouldShowRalProformaSection;

  const handleDownloadRalProformaPdf = async () => {
    const validRalLines = ralLines.filter(
      (line): line is RalProformaLine & { id_ligne: number } =>
        line.id_ligne !== undefined,
    );

    if (validRalLines.length === 0) {
      showError("Erreur", "Aucune ligne RAL valide pour générer le PDF.");
      return;
    }

    setIsDownloadingRalProformaPdf(true);

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

      validRalLines.forEach((line) => {
        formData.append("ligne_ids[]", String(line.id_ligne));
        formData.append(`lots[${line.id_ligne}]`, line.lot || "");
      });

      const response = await restClient.post(
        "pdf/facture-proforma",
        formData,
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          responseType: "blob",
        },
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");

      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 60000);

      showSuccess(
        "Téléchargement réussi",
        "Le PDF de la Proforma RAL a été téléchargé avec succès.",
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      showError(
        "Erreur de téléchargement",
        `Impossible de télécharger le PDF de la Proforma RAL : ${errorMessage}`,
      );
    } finally {
      setIsDownloadingRalProformaPdf(false);
    }
  };

  return (
    <div
      className="bg-white p-3 rounded-3 shadow-sm"
      style={{ border: "1.5px solid #1FB05B", borderRadius: "16px" }}
    >
      <h5
        className="mb-3 d-flex align-items-center gap-2"
        style={{ color: "#1FB05B", fontWeight: 700 }}
      >
        <FaFileInvoiceDollar />
        Facture Proforma
      </h5>
      {/* En-tête de la facture */}
      <Card
        className="border mb-4"
        style={{ borderRadius: "14px", borderColor: "#e9f5ef" }}
      >
        <Card.Body>
          <div className="row g-3">
            <div className="col-md-3">
              <div className="d-flex align-items-center justify-content-center">
                <FaCircle
                  className="text-success me-2"
                  style={{ fontSize: "0.7rem" }}
                />
                <strong className="me-2">Statut:</strong>
                {getStatusBadge(
                  data.etat <= 2
                    ? data.validationclient === null
                      ? "En attente de validation"
                      : data.validationsalama === null
                        ? "En attente SALAMA"
                        : "Validée"
                    : "Validée",
                )}
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Affichage des factures par sourceLot */}
      {sourceLots.length > 0 ? (
        sourceLots.map((sourceLot, groupIndex) => {
          const articlesInGroup = articlesBySourceLot[sourceLot];
          const factureNumber = generateFactureNumber(
            data?.numero || "",
            groupIndex + 1,
            sourceLot,
          );
          const groupTotals = calculateTotalsForGroup(articlesInGroup);

          return (
            <div key={sourceLot} className="mb-4">
              {/* En-tête de la facture par sourceLot */}
              <Card
                className="border-0 shadow-sm mb-3"
                style={{
                  borderRadius: "18px",
                  background:
                    "linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%)",
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
                          <FaFileInvoiceDollar
                            className="text-success"
                            style={{ fontSize: "1.5rem" }}
                          />
                        </div>
                        <div>
                          <small
                            className="text-muted d-block mb-1"
                            style={{ fontSize: "0.8rem", fontWeight: 500 }}
                          >
                            Facture N°
                          </small>
                          <div
                            style={{
                              fontSize: "1.3rem",
                              fontWeight: 800,
                              color: "#1FB05B",
                              letterSpacing: "0.5px",
                              textShadow: "0 2px 4px rgba(31, 176, 91, 0.1)",
                            }}
                          >
                            {factureNumber}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="d-flex align-items-center gap-2">
                        <div
                          className="p-2 rounded"
                          style={{ backgroundColor: "#e8f8f0" }}
                        >
                          <FaCalendarAlt
                            className="text-success"
                            style={{ fontSize: "1rem" }}
                          />
                        </div>
                        <div>
                          <small
                            className="text-muted d-block"
                            style={{ fontSize: "0.75rem", fontWeight: 500 }}
                          >
                            Date émission
                          </small>
                          <strong
                            style={{ fontSize: "0.95rem", color: "#2c3e50" }}
                          >
                            {data?.date_emission
                              ? formatDate(data.date_emission)
                              : "N/A"}
                          </strong>
                        </div>
                      </div>
                    </div>

                    <div className="col-md-3">
                      <div className="text-end">
                        <div
                          className="d-flex align-items-center justify-content-end gap-2 p-2 rounded"
                          style={{ backgroundColor: "#f8fdf9" }}
                        >
                          <FaBoxOpen
                            className="text-success"
                            style={{ fontSize: "1.1rem" }}
                          />
                          <strong
                            className="text-success"
                            style={{ fontSize: "1.2rem", fontWeight: 700 }}
                          >
                            {articlesInGroup.length}
                          </strong>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.85rem", fontWeight: 500 }}
                          >
                            article{articlesInGroup.length > 1 ? "s" : ""}
                          </small>
                        </div>
                      </div>
                    </div>

                    {/* Boutons d'action pour cette facture spécifique */}
                    {(1 === 1 || user?.role_id === 11) &&
                      data.etat === 2 &&
                      data.validationclient === null && (
                        <div className="col-12 mt-3">
                          <div className="d-flex justify-content-end gap-2">
                            <Button
                              variant="outline-success"
                              size="sm"
                              className="d-flex align-items-center gap-2"
                              onClick={() =>
                                handleRequestStateValidation(sourceLot)
                              }
                              disabled={
                                isValidating ||
                                isRejecting ||
                                articlesInGroup.every(
                                  (art) => art.etat === -2 || art.etat === 3,
                                )
                              }
                              style={{ borderRadius: "8px", fontWeight: 600 }}
                              title={
                                articlesInGroup.every((art) => art.etat === -2)
                                  ? "Tous les articles sont refusés"
                                  : ""
                              }
                            >
                              <FaCheck style={{ fontSize: "0.9rem" }} />
                              Valider cette facture ({factureNumber})
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              className="d-flex align-items-center gap-2"
                              onClick={() => handleRequestReject(sourceLot)}
                              disabled={
                                isValidating ||
                                isRejecting ||
                                articlesInGroup.every(
                                  (art) => art.etat === -2 || art.etat === 3,
                                )
                              }
                              style={{ borderRadius: "8px", fontWeight: 600 }}
                            >
                              <FaBan style={{ fontSize: "0.9rem" }} />
                              Refuser cette facture ({factureNumber})
                            </Button>
                          </div>
                        </div>
                      )}
                  </div>
                </Card.Body>
              </Card>

              {/* Tableau des articles pour ce sourceLot */}
              <Card
                className="border-0 shadow-sm mb-3"
                style={{ borderRadius: "16px" }}
              >
                <Card.Body className="p-0">
                  <div
                    className="p-3 d-flex justify-content-between align-items-center"
                    style={{
                      backgroundColor: "#f8fdf9",
                      borderTopLeftRadius: "16px",
                      borderTopRightRadius: "16px",
                      borderBottom: "2px solid #e8f8f0",
                    }}
                  >
                    <h6
                      className="text-muted mb-0 d-flex align-items-center gap-2"
                      style={{ fontSize: "1rem", fontWeight: 700 }}
                    >
                      <i
                        className="fas fa-list text-success"
                        style={{ fontSize: "1rem" }}
                      ></i>
                      Liste des articles
                    </h6>
                  </div>

                  <div className="table-responsive">
                    <Table
                      hover
                      className="align-middle mb-0"
                      style={{ borderCollapse: "separate", borderSpacing: 0 }}
                    >
                      <thead
                        style={{
                          backgroundColor: "#f8f9fa",
                          borderRadius: "8px",
                        }}
                      >
                        <tr>
                          <th
                            className="border-0 py-3 px-3"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#495057",
                            }}
                          >
                            Code
                          </th>
                          <th
                            className="border-0 py-3"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#495057",
                            }}
                          >
                            Désignation
                          </th>
                          {isSpecialClient && (
                            <th
                              className="border-0 py-3"
                              style={{
                                fontSize: "0.85rem",
                                fontWeight: 700,
                                color: "#495057",
                              }}
                            >
                              Fabricant
                            </th>
                          )}
                          <th
                            className="der-0 text-center py-3"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#495057",
                            }}
                          >
                            Quantité
                          </th>
                          <th
                            className="border-0 text-end py-3"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#495057",
                            }}
                          >
                            Prix unitaire
                          </th>
                          <th
                            className="border-0 text-end py-3"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#495057",
                            }}
                          >
                            Remise (%)
                          </th>
                          <th
                            className="border-0 text-center py-3"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#495057",
                            }}
                          >
                            Date péremption
                          </th>
                          <th
                            className="border-0 text-end py-3"
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#495057",
                            }}
                          >
                            Montant
                          </th>
                          {(1 === 1 || user?.role_id === 11) &&
                            data.etat === 2 &&
                            data.validationclient === null && (
                              <th
                                className="border-0 text-center py-3"
                                style={{
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                  color: "#495057",
                                }}
                              >
                                Actions
                              </th>
                            )}
                        </tr>
                      </thead>
                      <tbody>
                        {articlesInGroup.map(
                          (article: Article, index: number) => {
                            const isRejected = article.etat === -2;
                            const isValidated = article.etat === 3;
                            return (
                              <tr
                                key={article.code || index}
                                style={{
                                  opacity: isRejected ? 0.6 : 1,
                                  backgroundColor: isRejected
                                    ? "#fee"
                                    : isValidated
                                      ? "#e8f5e9"
                                      : "transparent",
                                  borderBottom: "1px solid #f0f0f0",
                                }}
                              >
                                <td className="py-3 px-3">
                                  <div className="d-flex align-items-center gap-2">
                                    <span
                                      style={{
                                        fontSize: "0.9rem",
                                        fontWeight: 600,
                                        color: "#2c3e50",
                                      }}
                                    >
                                      {article.code}
                                    </span>
                                    {isRejected && (
                                      <Badge
                                        bg="danger"
                                        className="px-2 py-1"
                                        style={{
                                          fontSize: "0.7rem",
                                          fontWeight: 600,
                                          borderRadius: "6px",
                                          boxShadow:
                                            "0 2px 4px rgba(220, 53, 69, 0.2)",
                                        }}
                                      >
                                        <i
                                          className="fas fa-ban me-1"
                                          style={{ fontSize: "0.65rem" }}
                                        ></i>
                                        Refusé
                                      </Badge>
                                    )}
                                    {isValidated && (
                                      <Badge
                                        bg="success"
                                        className="px-2 py-1"
                                        style={{
                                          fontSize: "0.7rem",
                                          fontWeight: 600,
                                          borderRadius: "6px",
                                          boxShadow:
                                            "0 2px 4px rgba(31, 176, 91, 0.2)",
                                        }}
                                      >
                                        <i
                                          className="fas fa-check me-1"
                                          style={{ fontSize: "0.65rem" }}
                                        ></i>
                                        Validé
                                      </Badge>
                                    )}
                                  </div>
                                </td>
                                <td className="py-3">
                                  <strong
                                    style={{
                                      fontSize: "0.9rem",
                                      color: "#2c3e50",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {article.designation}
                                  </strong>
                                </td>
                                {isSpecialClient && (
                                  <td
                                    className="py-3"
                                    style={{
                                      fontSize: "0.9rem",
                                      color: "#495057",
                                    }}
                                  >
                                    {article.fabricant || "N/A"}
                                  </td>
                                )}
                                <td className="text-center py-3">
                                  <Badge
                                    bg="light"
                                    text="dark"
                                    className="px-3 py-2"
                                    style={{
                                      fontSize: "0.9rem",
                                      fontWeight: 700,
                                      borderRadius: "8px",
                                      border: "1px solid #e9ecef",
                                    }}
                                  >
                                    {article.quantite || 0}
                                  </Badge>
                                </td>
                                <td
                                  className="text-end py-3"
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: "#495057",
                                  }}
                                >
                                  {article.prix_unitaire
                                    ? article.prix_unitaire.toLocaleString(
                                        "fr-FR",
                                      )
                                    : 0}{" "}
                                  Ar
                                </td>
                                <td
                                  className="text-end py-3"
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 600,
                                    color: "#495057",
                                  }}
                                >
                                  {article.remise
                                    ? article.remise.toFixed(2)
                                    : "0.00"}{" "}
                                  %
                                </td>
                                <td className="text-center py-3">
                                  <span
                                    style={{
                                      fontSize: "0.85rem",
                                      color: "#6c757d",
                                    }}
                                  >
                                    {formatDate(article.date_peremption)}
                                  </span>
                                  {isPeremptionProche(
                                    article.date_peremption,
                                  ) && (
                                    <Badge
                                      bg="warning"
                                      className="ms-2"
                                      style={{
                                        fontSize: "0.7rem",
                                        fontWeight: 600,
                                      }}
                                    >
                                      Proche
                                    </Badge>
                                  )}
                                </td>
                                <td
                                  className="text-end py-3"
                                  style={{
                                    fontSize: "0.95rem",
                                    fontWeight: 700,
                                    color: "#1FB05B",
                                  }}
                                >
                                  {getArticleMontantNet(article).toLocaleString("fr-FR")} Ar
                                </td>
                                {data.validationclient === null &&
                                  data.etat === 2 &&
                                  (user?.role_id === 11 || 1 === 1) && (
                                    <td className="text-center py-3">
                                      {isRejected || isValidated ? (
                                        <Badge
                                          bg={
                                            article.quantite_acceptee_client &&
                                            article.quantite_acceptee_client <
                                              article.quantite
                                              ? "warning"
                                              : "success"
                                          }
                                          className="px-3 py-2"
                                          style={{
                                            fontSize: "0.85rem",
                                            fontWeight: 600,
                                          }}
                                        >
                                          {article.quantite_acceptee_client ||
                                            article.quantite}
                                        </Badge>
                                      ) : (
                                        <div className="d-flex flex-column gap-2 align-items-center">
                                          {/* Indicateur de demande en cours */}
                                          {article.id_ligne &&
                                            (() => {
                                              const historique = getHistorique(
                                                article.id_ligne,
                                              );
                                              const derniereDemande =
                                                getDerniereDemande(
                                                  article.id_ligne,
                                                );
                                              const demandeEnCours =
                                                hasDemandeEnCours(
                                                  article.id_ligne,
                                                );

                                              if (historique.length > 0) {
                                                return (
                                                  <OverlayTrigger
                                                    placement="top"
                                                    overlay={
                                                      <Tooltip
                                                        id={`tooltip-demande-${article.id_ligne}`}
                                                      >
                                                        <div className="text-start">
                                                          <strong>
                                                            Dernière demande:
                                                          </strong>
                                                          <br />
                                                          Quantité demandée:{" "}
                                                          {
                                                            derniereDemande?.quantite_demandee
                                                          }
                                                          <br />
                                                          Motif:{" "}
                                                          {derniereDemande?.motif_demande ||
                                                            "N/A"}
                                                          <br />
                                                          Date:{" "}
                                                          {derniereDemande?.date_demande
                                                            ? new Date(
                                                                derniereDemande.date_demande,
                                                              ).toLocaleDateString(
                                                                "fr-FR",
                                                              )
                                                            : "N/A"}
                                                          <br />
                                                          Statut:{" "}
                                                          {demandeEnCours
                                                            ? "En attente"
                                                            : "Traitée"}
                                                        </div>
                                                      </Tooltip>
                                                    }
                                                  >
                                                    <Badge
                                                      bg={
                                                        demandeEnCours
                                                          ? "warning"
                                                          : "info"
                                                      }
                                                      className="mb-1 px-2 py-1 d-flex align-items-center gap-1"
                                                      style={{
                                                        cursor: "pointer",
                                                        fontSize: "0.75rem",
                                                        fontWeight: 600,
                                                      }}
                                                      onClick={() => {
                                                        setSelectedArticleForHistorique(
                                                          article,
                                                        );
                                                        setShowHistoriqueModal(
                                                          true,
                                                        );
                                                      }}
                                                    >
                                                      {demandeEnCours ? (
                                                        <>
                                                          <FaClock
                                                            style={{
                                                              fontSize:
                                                                "0.65rem",
                                                            }}
                                                          />{" "}
                                                          Demande en cours
                                                        </>
                                                      ) : (
                                                        <>
                                                          <FaHistory
                                                            style={{
                                                              fontSize:
                                                                "0.65rem",
                                                            }}
                                                          />{" "}
                                                          {historique.length}{" "}
                                                          demande(s)
                                                        </>
                                                      )}
                                                    </Badge>
                                                  </OverlayTrigger>
                                                );
                                              }
                                              return null;
                                            })()}

                                          <div className="d-flex gap-2 justify-content-center">
                                            <Button
                                              variant="outline-primary"
                                              size="sm"
                                              onClick={() =>
                                                handleOpenQuantiteModal(article)
                                              }
                                              className="px-3 py-2"
                                              style={{
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                borderWidth: "2px",
                                              }}
                                              title="Préciser la quantité que vous pouvez gérer"
                                            >
                                              <i className="fas fa-edit me-1"></i>
                                              {article.quantite_acceptee_client !==
                                                undefined &&
                                              article.quantite_acceptee_client !==
                                                null
                                                ? `${article.quantite_acceptee_client} / ${article.quantite}`
                                                : "Nouvelle demande"}
                                            </Button>
                                            <Button
                                              variant="outline-danger"
                                              size="sm"
                                              onClick={() =>
                                                handleRequestArticleReject(
                                                  article,
                                                )
                                              }
                                              disabled={isRejectingArticle}
                                              title="Refuser cet article"
                                              className="px-3 py-2"
                                              style={{
                                                borderRadius: "8px",
                                                fontWeight: 600,
                                                borderWidth: "2px",
                                              }}
                                            >
                                              <i className="fas fa-ban me-1"></i>
                                              Refuser
                                            </Button>
                                          </div>
                                        </div>
                                      )}
                                    </td>
                                  )}
                                {(1 === 1 || user?.role_id === 11) &&
                                  data.etat === 2 &&
                                  data.validationclient === null && (
                                    <td
                                      className="text-center py-3"
                                      style={{ display: "none" }}
                                    >
                                      {/* Cellule masquée pour éviter décalage - le contenu est dans la colonne partagée ci-dessus */}
                                    </td>
                                  )}
                              </tr>
                            );
                          },
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Résumé des articles refusés pour ce groupe */}
                  {articlesInGroup.some((article) => article.etat === -2) && (
                    <div
                      className="mt-4 p-3 rounded-3"
                      style={{
                        backgroundColor: "#fff5f5",
                        border: "2px solid #ff4d4f",
                        borderLeft: "5px solid #ff4d4f",
                        boxShadow: "0 2px 8px rgba(255, 77, 79, 0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="p-2 rounded-circle me-3"
                          style={{
                            backgroundColor: "#ffe5e5",
                            minWidth: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <i
                            className="fas fa-exclamation-circle text-danger"
                            style={{ fontSize: "1.3rem" }}
                          ></i>
                        </div>
                        <div className="flex-grow-1">
                          <strong
                            className="text-danger d-block"
                            style={{ fontSize: "1rem", fontWeight: 700 }}
                          >
                            {
                              articlesInGroup.filter(
                                (article) => article.etat === -2,
                              ).length
                            }{" "}
                            article(s) refusé(s)
                          </strong>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.9rem" }}
                          >
                            Ces articles ne seront pas inclus dans cette facture
                          </small>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Résumé des articles validés pour ce groupe */}
                  {articlesInGroup.some((article) => article.etat === 3) && (
                    <div
                      className="mt-4 p-3 rounded-3"
                      style={{
                        backgroundColor: "#f0f9f4",
                        border: "2px solid #1FB05B",
                        borderLeft: "5px solid #1FB05B",
                        boxShadow: "0 2px 8px rgba(31, 176, 91, 0.1)",
                      }}
                    >
                      <div className="d-flex align-items-center">
                        <div
                          className="p-2 rounded-circle me-3"
                          style={{
                            backgroundColor: "#e8f8f0",
                            minWidth: "48px",
                            height: "48px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <i
                            className="fas fa-check-circle text-success"
                            style={{ fontSize: "1.3rem" }}
                          ></i>
                        </div>
                        <div className="flex-grow-1">
                          <strong
                            className="text-success d-block"
                            style={{ fontSize: "1rem", fontWeight: 700 }}
                          >
                            {
                              articlesInGroup.filter(
                                (article) => article.etat === 3,
                              ).length
                            }{" "}
                            article(s) validé(s)
                          </strong>
                          <small
                            className="text-muted"
                            style={{ fontSize: "0.9rem" }}
                          >
                            Ces articles ont été validés et seront inclus dans
                            la facture
                          </small>
                        </div>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              {/* Section totaux pour ce sourceLot */}
              <Card
                className="border-0 shadow-sm mb-4"
                style={{
                  borderRadius: "16px",
                  background:
                    "linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%)",
                  boxShadow: "0 4px 12px rgba(31, 176, 91, 0.08)",
                }}
              >
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h6
                      className="mb-0 d-flex align-items-center gap-2"
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#2c3e50",
                      }}
                    >
                      <div
                        className="p-2 rounded"
                        style={{ backgroundColor: "#e8f8f0" }}
                      >
                        <i
                          className="fas fa-calculator text-success"
                          style={{ fontSize: "1.1rem" }}
                        ></i>
                      </div>
                      Total de la facture
                    </h6>
                  </div>
                  <div className="row justify-content-end">
                    <div className="col-md-5">
                      <div
                        className="p-3 rounded-3"
                        style={{
                          backgroundColor: "#fff",
                          border: "2px solid #e8f8f0",
                          boxShadow: "0 2px 8px rgba(31, 176, 91, 0.08)",
                        }}
                      >
                        <div
                          className="d-flex justify-content-between align-items-center mb-3 pb-2"
                          style={{ borderBottom: "2px solid #f0f0f0" }}
                        >
                          <span
                            style={{
                              fontSize: "0.95rem",
                              fontWeight: 600,
                              color: "#6c757d",
                            }}
                          >
                            Total HT:
                          </span>
                          <span
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#2c3e50",
                            }}
                          >
                            {groupTotals.ht.toLocaleString("fr-FR")} Ar
                          </span>
                        </div>
                        {hasIMP && groupTotals.imp > 0 && (
                          <>
                            <div
                              className="d-flex justify-content-between align-items-center mb-3 pb-2"
                              style={{ borderBottom: "2px solid #f0f0f0" }}
                            >
                              <span
                                style={{
                                  fontSize: "0.95rem",
                                  fontWeight: 600,
                                  color: "#6c757d",
                                }}
                              >
                                IMP (8%):
                              </span>
                              <span
                                style={{
                                  fontSize: "1rem",
                                  fontWeight: 600,
                                  color: "#2c3e50",
                                }}
                              >
                                {groupTotals.imp.toLocaleString("fr-FR")} Ar
                              </span>
                            </div>
                            <div className="d-flex justify-content-between align-items-center pt-2">
                              <span
                                className="d-flex align-items-center gap-2"
                                style={{
                                  fontSize: "1.05rem",
                                  fontWeight: 700,
                                  color: "#495057",
                                }}
                              >
                                <i
                                  className="fas fa-money-bill-wave text-success"
                                  style={{ fontSize: "1.2rem" }}
                                ></i>
                                Total TTC:
                              </span>
                              <span
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: 900,
                                  color: "#1FB05B",
                                  textShadow:
                                    "0 2px 4px rgba(31, 176, 91, 0.15)",
                                  letterSpacing: "0.5px",
                                }}
                              >
                                {groupTotals.ttc.toLocaleString("fr-FR")} Ar
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {/* Bouton de téléchargement PDF pour cette facture */}
              <div className="d-flex justify-content-center mb-2">
                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center gap-2 px-4 py-2"
                  style={{
                    borderRadius: "10px",
                    fontWeight: 600,
                    borderWidth: "2px",
                    boxShadow: "0 2px 8px rgba(13, 110, 253, 0.15)",
                  }}
                  disabled={isDownloadingPdf === sourceLot}
                  onClick={() =>
                    handleDownloadPDF(articlesInGroup, factureNumber, sourceLot)
                  }
                >
                  {isDownloadingPdf === sourceLot ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <FaDownload style={{ fontSize: "1rem" }} />
                      Télécharger PDF - {factureNumber}
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })
      ) : (
        <Alert variant="warning" className="text-center">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Aucun article disponible pour cette facture proforma.
        </Alert>
      )}

      {/* Section totaux globaux (tous les sourceLots combinés) */}
      {sourceLots.length > 1 && (
        <div
          className="card border-0 shadow mt-5 p-4"
          style={{
            borderRadius: 18,
            background: "linear-gradient(135deg, #1FB05B 0%, #17a34a 100%)",
            color: "white",
          }}
        >
          <div className="d-flex align-items-center mb-4">
            <div
              className="p-3 rounded-circle me-3"
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <FaFileInvoiceDollar
                style={{ fontSize: "1.8rem", color: "white" }}
              />
            </div>
            <h5
              className="mb-0"
              style={{ fontSize: "1.3rem", fontWeight: 700 }}
            >
              Totaux Généraux
            </h5>
          </div>

          <div className="row justify-content-end">
            <div className="col-md-5">
              <div
                className="p-4 rounded-3"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                }}
              >
                {data?.totaux && (
                  <>
                    <div
                      className="d-flex justify-content-between align-items-center mb-3 pb-3"
                      style={{ borderBottom: "2px solid #e9ecef" }}
                    >
                      <span
                        style={{
                          fontSize: "1rem",
                          fontWeight: 600,
                          color: "#6c757d",
                        }}
                      >
                        Total HT:
                      </span>
                      <span
                        style={{
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#2c3e50",
                        }}
                      >
                        {data.totaux.ht
                          ? data.totaux.ht.toLocaleString("fr-FR")
                          : 0}{" "}
                        Ar
                      </span>
                    </div>
                    {hasIMP && data.totaux.imp && (
                      <>
                        <div
                          className="d-flex justify-content-between align-items-center mb-3 pb-3"
                          style={{ borderBottom: "2px solid #e9ecef" }}
                        >
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 600,
                              color: "#6c757d",
                            }}
                          >
                            IMP (8%):
                          </span>
                          <span
                            style={{
                              fontSize: "1.1rem",
                              fontWeight: 700,
                              color: "#2c3e50",
                            }}
                          >
                            {data.totaux.imp.toLocaleString("fr-FR")} Ar
                          </span>
                        </div>
                        <div className="d-flex justify-content-between align-items-center pt-2">
                          <span
                            style={{
                              fontSize: "1.15rem",
                              fontWeight: 700,
                              color: "#1FB05B",
                            }}
                          >
                            Total TTC:
                          </span>
                          <span
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: 900,
                              color: "#1FB05B",
                              textShadow: "0 2px 6px rgba(31, 176, 91, 0.2)",
                              letterSpacing: "0.5px",
                            }}
                          >
                            {data.totaux.ttc
                              ? data.totaux.ttc.toLocaleString("fr-FR")
                              : 0}{" "}
                            Ar
                          </span>
                        </div>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Résumé global des articles refusés (tous sourceLots) */}
      {(() => {
        const totalRejected = Object.values(articlesBySourceLot)
          .flat()
          .filter((article) => article.etat === -2).length;

        return totalRejected > 0 ? (
          <Card
            className="border-0 shadow-sm mb-4"
            style={{
              backgroundColor: "#fff5f5",
              borderLeft: "6px solid #ff4d4f",
              borderRadius: "16px",
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-start">
                <div
                  className="p-3 rounded-circle me-3"
                  style={{
                    backgroundColor: "#ffe5e5",
                    minWidth: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(255, 77, 79, 0.15)",
                  }}
                >
                  <i
                    className="fas fa-exclamation-triangle text-danger"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </div>
                <div className="flex-grow-1">
                  <strong
                    className="text-danger d-block mb-2"
                    style={{ fontSize: "1.2rem", fontWeight: 800 }}
                  >
                    {totalRejected} article(s) refusé(s) au total
                  </strong>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                  >
                    Ces articles ne seront pas inclus dans les factures proforma
                    finales. Ils nécessitent une révision ou une modification
                    avant validation.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : null;
      })()}

      {/* Résumé global des articles validés (tous sourceLots) */}
      {(() => {
        const totalValidated = Object.values(articlesBySourceLot)
          .flat()
          .filter((article) => article.etat === 3).length;

        return totalValidated > 0 ? (
          <Card
            className="border-0 shadow-sm mb-4"
            style={{
              backgroundColor: "#f0f9f4",
              borderLeft: "6px solid #1FB05B",
              borderRadius: "16px",
            }}
          >
            <Card.Body className="p-4">
              <div className="d-flex align-items-start">
                <div
                  className="p-3 rounded-circle me-3"
                  style={{
                    backgroundColor: "#e8f8f0",
                    minWidth: "56px",
                    height: "56px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(31, 176, 91, 0.15)",
                  }}
                >
                  <i
                    className="fas fa-check-circle text-success"
                    style={{ fontSize: "1.5rem" }}
                  ></i>
                </div>
                <div className="flex-grow-1">
                  <strong
                    className="text-success d-block mb-2"
                    style={{ fontSize: "1.2rem", fontWeight: 800 }}
                  >
                    {totalValidated} article(s) validé(s) au total
                  </strong>
                  <p
                    className="text-muted mb-0"
                    style={{ fontSize: "0.95rem", lineHeight: "1.6" }}
                  >
                    Ces articles ont été validés et seront inclus dans les
                    factures proforma finales.
                  </p>
                </div>
              </div>
            </Card.Body>
          </Card>
        ) : null;
      })()}

      {/* Section RAL - affichée uniquement après validation Salama étape 1 */}
      {shouldRenderRalProformaSection && (
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
              Proforma RAL — Articles en rupture
            </h6>
          </Card.Header>

          <Card.Body>
            <div className="table-responsive" style={{ borderRadius: "10px" }}>
              <Table hover className="align-middle mb-0">
                <thead style={{ backgroundColor: "#FFFBF0" }}>
                  <tr>
                    <th className="py-3">Code</th>
                    <th className="py-3">Désignation</th>
                    <th className="py-3 text-center">Quantité</th>
                    <th className="py-3 text-end">Prix unitaire</th>
                    <th className="py-3 text-end">Montant</th>
                    <th className="py-3 text-center">État RAL</th>
                  </tr>
                </thead>
                <tbody>
                  {ralLines.length > 0 ? (
                    ralLines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-3">{line.code}</td>
                        <td className="py-3">{line.designation}</td>
                        <td className="py-3 text-center">{line.quantite}</td>
                        <td className="py-3 text-end">
                          {line.prixUnitaire.toLocaleString("fr-FR")} Ar
                        </td>
                        <td
                          className="py-3 text-end"
                          style={{ fontWeight: 700, color: "#1FB05B" }}
                        >
                          {line.montant.toLocaleString("fr-FR")} Ar
                        </td>
                        <td className="py-3 text-center">{getRalStatusBadge(line)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        Aucun article RAL disponible pour cette proforma.
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            <div
              className="mt-3 p-3 rounded-3"
              style={{
                backgroundColor: isRalEtape2Validated ? "#FFFBF0" : "#FFFBF0",
                border: isRalEtape2Validated
                  ? "1px solid #F0C060"
                  : "1px solid #F0C060",
              }}
            >
              {!isRalEtape2Validated ? (
                <div className="d-flex flex-column gap-3">
                  <p className="mb-0" style={{ color: "#1FB05B", fontWeight: 500 }}>
                    Salama a préparé cette proforma pour vos articles en rupture. Veuillez la valider pour continuer.
                  </p>

                  <div className="d-flex flex-column flex-md-row gap-2">
                    <Button
                      variant="success"
                      onClick={handleValidateRalProforma}
                      disabled={isSubmittingRalEtape2}
                      className="d-flex align-items-center gap-2"
                      style={{ fontWeight: 600 }}
                    >
                      {isSubmittingRalEtape2 ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Validation...
                        </>
                      ) : (
                        <>
                          <FaCheck />
                          Valider la proforma RAL
                        </>
                      )}
                    </Button>

                    <Button
                      variant="outline-primary"
                      className="d-flex align-items-center gap-2"
                      onClick={handleDownloadRalProformaPdf}
                      disabled={isDownloadingRalProformaPdf}
                    >
                      {isDownloadingRalProformaPdf ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Téléchargement...
                        </>
                      ) : (
                        <>
                          <FaDownload />
                          Télécharger le PDF de la Proforma RAL
                        </>
                      )}
                    </Button>
                  </div>

                  {ralEtape2ErrorMessage && (
                    <div className="text-danger" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                      {ralEtape2ErrorMessage}
                    </div>
                  )}
                </div>
              ) : validationDvmRalEtape2 === 0 ? (
                <p className="mb-0" style={{ color: "#1FB05B", fontWeight: 600 }}>
                  Proforma RAL validée — en attente de validation interne (DM et DVM)
                </p>
              ) : (
                <p className="mb-0" style={{ color: "#1FB05B", fontWeight: 600 }}>
                  Proforma RAL validée et traitée en interne. Consultez l'onglet Bon de Commande pour la suite.
                </p>
              )}
            </div>

            {isRalEtape2Validated && (
              <div className="mt-3 d-flex justify-content-end">
                <Button
                  variant="outline-primary"
                  className="d-flex align-items-center gap-2"
                  onClick={handleDownloadRalProformaPdf}
                  disabled={isDownloadingRalProformaPdf}
                >
                  {isDownloadingRalProformaPdf ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                      Téléchargement...
                    </>
                  ) : (
                    <>
                      <FaDownload />
                      Télécharger le PDF de la Proforma RAL
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card.Body>
        </Card>
      )}

      {/* Section encours pour clients RC */}
      {/* {isRCClient && data?.encours && (
        <div className="card mt-3 p-3" style={{ borderRadius: 14, border: "1px solid #e9f5ef" }}>
          <h6 className="mb-3">Situation encours</h6>
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex justify-content-between mb-1">
                <span>Encours autorisé:</span>
                <strong>{data.encours.autorise ? data.encours.autorise.toLocaleString('fr-FR') : 0} Ar</strong>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span>Encours réel:</span>
                <strong>{data.encours.reel ? data.encours.reel.toLocaleString('fr-FR') : 0} Ar</strong>
              </div>
              <ProgressBar 
                now={encoursPercentage} 
                label={`${encoursPercentage}%`}
                variant={getProgressVariant()}
              />
            </div>
          </div>
        </div>
      )}
       */}
      {/* Historique des modifications */}
      {data?.historique_modifications &&
        data.historique_modifications.length > 0 && (
          <div
            className="card mt-3 p-3"
            style={{ borderRadius: 14, border: "1px solid #e9f5ef" }}
          >
            <h6 className="d-flex align-items-center gap-2 mb-3">
              <FaHistory />
              Historique des modifications
            </h6>
            <table className="table table-sm">
              <thead className="bg-light">
                <tr>
                  <th>Date</th>
                  <th>Motif</th>
                  <th>Utilisateur</th>
                </tr>
              </thead>
              <tbody>
                {data.historique_modifications.map(
                  (histo: HistoriqueModification, index: number) => (
                    <tr key={histo.date || index}>
                      <td>{formatDate(histo.date)}</td>
                      <td>{histo.motif}</td>
                      <td>{histo.utilisateur}</td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}

      {/* Actions disponibles */}
      <div className="mt-4 d-flex flex-wrap gap-2">
        {(() => {
          // Bloc de code sécurisé pour vérifier le statut
          if (!data?.statut || typeof data.statut !== "string") return null;
        })()}

        {/* Boutons de validation et refus - Pour passer de Facture Proforma (état 2) à Bon de Commande (état 3) */}
        {(1 === 1 || user?.role_id === 11) &&
          data.etat === 2 &&
          data.validationclient === null && (
            <Card
              className="border-0 shadow-sm w-100"
              style={{
                borderRadius: "16px",
                background: "linear-gradient(135deg, #f8fdf9 0%, #ffffff 100%)",
              }}
            >
              <Card.Body className="p-4">
                {/* Message d'alerte si aucun article valide */}
                {!hasValidArticles() && (
                  <Alert
                    variant="danger"
                    className="mb-3 d-flex align-items-center"
                  >
                    <FaBan className="me-2" style={{ fontSize: "1.2rem" }} />
                    <div>
                      <strong>Validation impossible</strong>
                      <div className="small mt-1">
                        Tous les articles de cette facture ont été refusés. La
                        validation n'est pas possible.
                      </div>
                    </div>
                  </Alert>
                )}

                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div
                      className="p-3 rounded-circle"
                      style={{ backgroundColor: "#e8f8f0" }}
                    >
                      <FaFileInvoiceDollar
                        className="text-success"
                        style={{ fontSize: "1.5rem" }}
                      />
                    </div>
                    <div>
                      <h6
                        className="mb-1"
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          color: "#2c3e50",
                        }}
                      >
                        Validation de la facture proforma
                      </h6>
                      <small
                        className="text-muted"
                        style={{ fontSize: "0.9rem" }}
                      >
                        Validez ou refusez cette facture pour générer le bon de
                        commande
                      </small>
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <Button
                      variant="success"
                      size="lg"
                      className="d-flex align-items-center gap-2 px-4 py-2"
                      style={{
                        borderRadius: "10px",
                        fontWeight: 600,
                        boxShadow: "0 3px 8px rgba(31, 176, 91, 0.2)",
                      }}
                      onClick={handleRequestClientValidation}
                      disabled={
                        isValidating || isRejecting || !hasValidArticles()
                      }
                      title={
                        !hasValidArticles()
                          ? "Aucun article valide pour validation"
                          : ""
                      }
                    >
                      <FaCheck style={{ fontSize: "1.1rem" }} />
                      {isValidating
                        ? "Validation..."
                        : "Valider l'étape facture proforma"}
                    </Button>

                    {/* Le bouton de refus global est maintenant remplacé par des boutons individuels par facture */}
                  </div>
                </div>
              </Card.Body>
            </Card>
          )}
      </div>

      {/* Modal pour gérer la quantité demandée */}
      <Modal
        show={showQuantiteModal}
        onHide={handleCloseQuantiteModal}
        centered
        size="lg"
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#1FB05B" }}
          className="text-white"
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="fas fa-boxes"></i>
            Quantité à gérer
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          {selectedArticleForQuantite && (
            <>
              <div className="mb-4">
                <h5 className="mb-3">Article sélectionné</h5>
                <Card className="bg-light border-0">
                  <Card.Body>
                    <div className="row g-3">
                      <div className="col-12">
                        <small className="text-muted d-block mb-1">
                          Désignation
                        </small>
                        <p
                          className="mb-0"
                          style={{ fontSize: "1rem", fontWeight: 700 }}
                        >
                          {selectedArticleForQuantite.designation}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                          Quantité proposée
                        </small>
                        <Badge
                          bg="light"
                          text="dark"
                          className="px-3 py-2"
                          style={{ fontSize: "1rem", fontWeight: 500 }}
                        >
                          {selectedArticleForQuantite.quantite}
                        </Badge>
                      </div>

                      <div className="col-md-6">
                        <small className="text-muted d-block mb-1">
                          Date de peremption
                        </small>
                        <Badge
                          bg="light"
                          text="dark"
                          className="px-3 py-2"
                          style={{ fontSize: "1rem", fontWeight: 500 }}
                        >
                          {selectedArticleForQuantite.date_peremption
                            ? formatDate(
                                selectedArticleForQuantite.date_peremption,
                              )
                            : "N/A"}
                        </Badge>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>

              <div className="mb-4">
                <h5 className="mb-3">Nouvelle demande</h5>
                <div className="form-group">
                  <div className="d-flex flex-wrap gap-3 mb-3">
                    <div className="flex-fill">
                      <div className="border rounded-3 px-3 py-2 bg-white">
                        <small className="text-muted text-uppercase d-block mb-1">
                          Quantité proposée
                        </small>
                        <strong className="fs-5 text-dark">
                          {selectedArticleForQuantite.quantite}
                        </strong>
                      </div>
                    </div>
                    <div className="flex-fill">
                      <div className="border rounded-3 px-3 py-2 bg-white">
                        <small className="text-muted text-uppercase d-block mb-1">
                          Quantité demandée
                        </small>
                        <input
                          type="number"
                          min="0"
                          value={quantiteAcceptee}
                          onChange={(e) =>
                            setQuantiteAcceptee(parseInt(e.target.value) || 0)
                          }
                          className="form-control fs-5 text-success border-0 p-0"
                          style={{ background: "transparent", fontWeight: 700 }}
                        />
                      </div>
                    </div>
                    <div className="flex-fill">
                      <div className="border rounded-3 px-3 py-2 bg-white">
                        <small className="text-muted text-uppercase d-block mb-1">
                          Quantité restante
                        </small>
                        <strong className="fs-5">{remainingQuantity}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="d-flex justify-content-end mb-2">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="assignRemainingToLot"
                        className="form-check-input"
                        checked={affecterNouveauLot}
                        onChange={(e) =>
                          setAffecterNouveauLot(e.target.checked)
                        }
                        disabled={remainingQuantity === 0}
                      />
                      <label
                        htmlFor="assignRemainingToLot"
                        className="form-check-label"
                      >
                        Attribuer le restant à un autre lot
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <h5 className="mb-3">Motif de la réduction</h5>
                <div className="form-group">
                  <textarea
                    id="motifQuantite"
                    className="form-control"
                    rows={4}
                    placeholder="Exemple: Capacité de stockage limitée, contraintes logistiques, budget insuffisant..."
                    value={motifQuantite}
                    onChange={(e) => setMotifQuantite(e.target.value)}
                    style={{
                      borderColor: "#ced4da",
                      borderWidth: "2px",
                      resize: "vertical",
                    }}
                  />
                  <small className="text-muted">
                    Motif de la demande (optionnel)
                  </small>
                </div>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer
          style={{ border: "none" }}
          className="px-4 pb-4 justify-content-center"
        >
          <Button
            variant="outline-secondary"
            onClick={handleCloseQuantiteModal}
            className="px-4 me-2"
            disabled={isSavingQuantite}
          >
            <i className="fas fa-times me-1"></i>
            Annuler
          </Button>
          <Button
            variant="success"
            onClick={handleSaveQuantiteAcceptee}
            className="px-4"
            disabled={isSavingQuantite || quantiteAcceptee <= 0}
          >
            {isSavingQuantite ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Enregistrement...</span>
                </div>
                Enregistrement...
              </>
            ) : (
              <>
                <i className="fas fa-save me-1"></i>
                Enregistrer
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de confirmation pour la validation client */}
      <Modal
        show={showClientValidationConfirmation}
        onHide={handleCancelClientValidation}
        centered
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#1FB05B" }}
          className="text-white"
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaCheck />
            Confirmation de validation
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <FaCheck style={{ fontSize: "48px", color: "#1FB05B" }} />
          </div>
          <h5 className="mb-3">Valider la facture proforma</h5>
          <p className="text-muted">
            Êtes-vous sûr de vouloir valider cette facture proforma ?
          </p>
          <div className="text-muted small">
            Cette action marquera l étape facture proformat comme validée par le
            client.
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{ border: "none" }}
          className="px-4 pb-4 justify-content-center"
        >
          <Button
            variant="outline-secondary"
            onClick={handleCancelClientValidation}
            className="px-4 me-2"
          >
            Annuler
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmClientValidation}
            className="px-4"
            disabled={isClientValidating}
          >
            {isClientValidating ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
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

      {/* Modal de confirmation pour la validation d'état */}
      <Modal
        show={showValidationConfirmation}
        onHide={handleCancelStateValidation}
        centered
      >
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#1FB05B" }}
          className="text-white"
        >
          <Modal.Title className="d-flex align-items-center gap-2">
            <FaCheck />
            Validation de la facture
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4 text-center">
          <div className="mb-3">
            <FaCheck style={{ fontSize: "48px", color: "#1FB05B" }} />
          </div>
          <div className="alert alert-info mb-3">
            <br />
            <small className="text-muted">
              Seules les lignes de cette facture seront validées.
            </small>
          </div>
          <h5 className="mb-3">Valider cette facture proforma</h5>
          <p className="text-muted">
            Êtes-vous sûr de vouloir valider cette facture proforma ?
          </p>
          <div className="text-muted small">
            Les lignes de cette facture passeront à l'état validé (état 3).
          </div>
        </Modal.Body>

        <Modal.Footer
          style={{ border: "none" }}
          className="px-4 pb-4 justify-content-center"
        >
          <Button
            variant="outline-secondary"
            onClick={handleCancelStateValidation}
            className="px-4 me-2"
          >
            Annuler
          </Button>
          <Button
            variant="success"
            onClick={handleConfirmValidation}
            className="px-4"
            disabled={isValidating}
          >
            {isValidating ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
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
      <Modal show={showRejectModal} onHide={handleCancelReject} centered>
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#dc3545" }}
          className="text-white"
        >
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <i className="fas fa-times-circle"></i>
            Refuser la facture proforma
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <div className="mb-3 text-center">
            <i
              className="fas fa-exclamation-triangle"
              style={{ fontSize: "48px", color: "#dc3545" }}
            ></i>
          </div>
          <div className="alert alert-info mb-3">
            <strong>Facture ciblée :</strong> {selectedSourceLotToReject}
            <br />
            <small className="text-muted">
              Tous les articles de cette facture seront refusés.
            </small>
          </div>
          <h5 className="mb-3 text-center">Motif de refus</h5>
          <p className="text-muted text-center mb-4">
            Veuillez indiquer la raison pour laquelle vous refusez cette
            facture.
          </p>

          <div className="form-group">
            <label htmlFor="rejectReason" className="form-label fw-semibold">
              Motif de refus <span className="text-danger">*</span>
            </label>
            <textarea
              id="rejectReason"
              className="form-control"
              rows={4}
              placeholder="Exemple: Prix trop élevés, articles non conformes, quantités incorrectes..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              style={{
                borderColor:
                  rejectReason.trim().length >= 10 ? "#1FB05B" : "#ced4da",
                resize: "vertical",
              }}
            />
            <small className="text-muted">
              Minimum 10 caractères requis ({rejectReason.trim().length}/10)
            </small>
          </div>

          <Alert variant="warning" className="mt-3 d-flex align-items-start">
            <i className="fas fa-info-circle me-2 mt-1"></i>
            <div>
              <strong>Attention :</strong> Le refus de la facture renverra la
              commande à SALAMA pour révision. Vous serez notifié une fois les
              modifications effectuées.
            </div>
          </Alert>
        </Modal.Body>

        <Modal.Footer
          style={{ border: "none" }}
          className="px-4 pb-4 justify-content-center"
        >
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
            disabled={
              !rejectReason.trim() ||
              rejectReason.trim().length < 10 ||
              isRejecting
            }
          >
            {isRejecting ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Refus...</span>
                </div>
                Refus en cours...
              </>
            ) : (
              <>
                <i className="fas fa-times-circle me-1"></i>
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
        <Modal.Header
          closeButton
          style={{ backgroundColor: "#dc3545" }}
          className="text-white"
        >
          <Modal.Title className="d-flex align-items-center gap-2 text-white">
            <i className="fas fa-box-open"></i>
            Refuser l'article
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4">
          <div className="mb-3 text-center">
            <i
              className="fas fa-exclamation-triangle"
              style={{ fontSize: "48px", color: "#dc3545" }}
            ></i>
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
                      <strong>Quantité:</strong> {selectedArticle.quantite}
                    </div>
                    <div className="col-12 mt-2">
                      <strong>Désignation:</strong>
                      <br />
                      {selectedArticle.designation}
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Prix unitaire:</strong>{" "}
                      {selectedArticle.prix_unitaire?.toLocaleString("fr-FR")}{" "}
                      Ar
                    </div>
                    <div className="col-md-6 mt-2">
                      <strong>Montant:</strong>{" "}
                      {getArticleMontantNet(selectedArticle).toLocaleString("fr-FR")} Ar
                    </div>
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
            <label
              htmlFor="articleRejectReason"
              className="form-label fw-semibold"
            >
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
                borderColor:
                  articleRejectReason.trim().length >= 10
                    ? "#1FB05B"
                    : "#ced4da",
                resize: "vertical",
              }}
            />
            <small className="text-muted">
              Minimum 10 caractères requis ({articleRejectReason.trim().length}
              /10)
            </small>
          </div>

          <Alert variant="info" className="mt-3 d-flex align-items-start">
            <i className="fas fa-info-circle me-2 mt-1"></i>
            <div>
              <strong>Information :</strong> Le refus de cet article sera
              notifié à SALAMA. L'article ne sera pas inclus dans la commande
              finale.
            </div>
          </Alert>
        </Modal.Body>

        <Modal.Footer
          style={{ border: "none" }}
          className="px-4 pb-4 justify-content-center"
        >
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
            disabled={
              !articleRejectReason.trim() ||
              articleRejectReason.trim().length < 10 ||
              isRejectingArticle
            }
          >
            {isRejectingArticle ? (
              <>
                <div
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                >
                  <span className="visually-hidden">Refus...</span>
                </div>
                Refus en cours...
              </>
            ) : (
              <>
                <i className="fas fa-times-circle me-1"></i>
                Refuser l'article
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal d'historique des demandes */}
      <HistoriqueDemandeModal
        show={showHistoriqueModal}
        onHide={() => {
          setShowHistoriqueModal(false);
          setSelectedArticleForHistorique(null);
        }}
        articleDesignation={selectedArticleForHistorique?.designation}
        historique={
          selectedArticleForHistorique?.id_ligne
            ? getHistorique(selectedArticleForHistorique.id_ligne)
            : []
        }
      />

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

export default FactureProforma;