import { useState, useEffect, useCallback } from "react";

// Types pour le hook
export interface BcInfo {
  id: number;
  acompte: number;
  totalbc: number;
  etat_bc: number;
  mntacompte: number;
  etat_text: string;
  etat: string;
  etat_suivi_text: string;
  etat_suivi_badge: string;
  motif_resiliation?: string;
}

export interface Notification {
  show: boolean;
  type: 'success' | 'error';
  message: string;
}

interface UseBonDeCommandeProps {
  soumissionId?: number | string;
  codeFournisseur?: string;
  referenceAO?: string;
}

interface UseBonDeCommandeReturn {
  // États
  bcInfo: BcInfo | null;
  loadingBc: boolean;
  errorBc: string | null;
  pdfUrl: string;
  validatingBc: boolean;
  rejectingBc: boolean;
  notification: Notification;
  
  // Actions
  handleValidateBc: () => Promise<void>;
  handleRejectBc: () => Promise<void>;
  clearNotification: () => void;
  refetchBcInfo: () => void;
}

export const useBonDeCommande = ({
  soumissionId,
  codeFournisseur,
  referenceAO,
}: UseBonDeCommandeProps): UseBonDeCommandeReturn => {
  // États
  const [bcInfo, setBcInfo] = useState<BcInfo | null>(null);
  const [loadingBc, setLoadingBc] = useState(false);
  const [errorBc, setErrorBc] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [validatingBc, setValidatingBc] = useState(false);
  const [rejectingBc, setRejectingBc] = useState(false);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    type: 'success',
    message: ''
  });

  // Fonction pour récupérer les informations du BC
  const fetchBcInfo = useCallback(async () => {
    if (!soumissionId) return;
    
    setLoadingBc(true);
    setErrorBc(null);
    
    try {
      const response = await fetch(
        `https://backsignup.h-tsoft.com//graphql?query={suiviemarches(soumission_id:${soumissionId}){id,etat_text,etat_bc,acompte,totalbc,detailsuiviemarches{id,motif_resiliation},mntacompte,etat,etat_suivi_text,etat_suivi_badge}}`
      );
      const data = await response.json();
      const info = data?.data?.suiviemarches?.[0];
      
      if (info) {
        setBcInfo({
          id: info.id,
          acompte: info.acompte,
          totalbc: info.totalbc,
          etat_bc: info.etat_bc === 0 ? 1 : info.etat_bc, 
          mntacompte: info.mntacompte,
          etat_text: info.etat_text,
          etat: info.etat,
          etat_suivi_text: info.etat_suivi_text,
          etat_suivi_badge: info.etat_suivi_badge,
          motif_resiliation: info.detailsuiviemarches?.[0]?.motif_resiliation,
        });
        console.log("📄 [useBonDeCommande] État du BC:", info.etat_text);
        console.log("📄 [useBonDeCommande] ID du suiviemarche:", info.id);
      } else {
        setErrorBc("Aucune information trouvée pour ce bon de commande.");
      }
    } catch (error) {
      console.error("❌ [useBonDeCommande] Erreur fetch:", error);
      setErrorBc("Erreur lors de la récupération des informations du bon de commande.");
    } finally {
      setLoadingBc(false);
    }
  }, [soumissionId]);

  // useEffect pour récupérer les infos du BC
  useEffect(() => {
    fetchBcInfo();
  }, [fetchBcInfo]);

  // useEffect pour générer l'URL du PDF
  useEffect(() => {
    console.log("📄 [useBonDeCommande] Génération URL PDF avec:", {
      codeFournisseur,
      referenceAO
    });
    
    if (codeFournisseur && referenceAO) {
      const generatedUrl = `https://backsignup.h-tsoft.com//pdf.generate-pdf-bc/BPSNUM_0:"${codeFournisseur}",YNUMMARCHE_0:"${referenceAO}"`;
      setPdfUrl(generatedUrl);
      console.log("📄 [useBonDeCommande] URL du PDF générée:", generatedUrl);
    } else {
      console.log("📄 [useBonDeCommande] Données manquantes pour générer l'URL du PDF:", {
        codeFournisseur,
        referenceAO
      });
    }
  }, [codeFournisseur, referenceAO]);

  // Fonction pour effacer la notification
  const clearNotification = useCallback(() => {
    setNotification({ show: false, type: 'success', message: '' });
  }, []);

  // Fonction pour valider le bon de commande
  const handleValidateBc = useCallback(async () => {
    if (!bcInfo?.id) {
      console.error("❌ [useBonDeCommande] Impossible de valider : ID du suiviemarche manquant");
      setNotification({
        show: true,
        type: 'error',
        message: "Erreur : ID du bon de commande manquant"
      });
      setTimeout(clearNotification, 5000);
      return;
    }

    setValidatingBc(true);
    console.log("📤 [useBonDeCommande] Validation du BC - Start");
    console.log("📤 Payload:", {
      id: bcInfo.id,
      champ: "etat_bc",
      status: 2
    });

    try {
      const response = await fetch("https://backsignup.h-tsoft.com//suiviemarche/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bcInfo.id,
          champ: "etat_bc",
          status: 2
        }),
      });

      const result = await response.json();
      console.log("✅ [useBonDeCommande] Réponse API:", result);

      if (result.error) {
        console.error("❌ [useBonDeCommande] Erreur API:", result.error);
        setNotification({
          show: true,
          type: 'error',
          message: `Erreur : ${result.error}`
        });
        setTimeout(clearNotification, 5000);
      } else {
        console.log("✅ [useBonDeCommande] Validation réussie!");
        setNotification({
          show: true,
          type: 'success',
          message: result.message || 'Bon de commande validé avec succès !'
        });
        setTimeout(clearNotification, 5000);
        
        // Recharger les informations du BC après validation
        await fetchBcInfo();
      }
    } catch (error) {
      console.error("❌ [useBonDeCommande] Erreur lors de la validation:", error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Erreur lors de la validation du bon de commande'
      });
      setTimeout(clearNotification, 5000);
    } finally {
      setValidatingBc(false);
    }
  }, [bcInfo?.id, clearNotification, fetchBcInfo]);

  // Fonction pour rejeter le bon de commande
  const handleRejectBc = useCallback(async () => {
    if (!bcInfo?.id) {
      console.error("❌ [useBonDeCommande] Impossible de rejeter : ID du suiviemarche manquant");
      setNotification({
        show: true,
        type: 'error',
        message: "Erreur : ID du bon de commande manquant"
      });
      setTimeout(clearNotification, 5000);
      return;
    }

    setRejectingBc(true);
    console.log("📤 [useBonDeCommande] Rejet du BC - Start");
    console.log("📤 Payload:", {
      id: bcInfo.id,
      champ: "etat_bc",
      status: -2
    });

    try {
      const response = await fetch("https://backsignup.h-tsoft.com//suiviemarche/status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: bcInfo.id,
          champ: "etat_bc",
          status: -2
        }),
      });

      const result = await response.json();
      console.log("✅ [useBonDeCommande] Réponse API:", result);

      if (result.error) {
        console.error("❌ [useBonDeCommande] Erreur API:", result.error);
        setNotification({
          show: true,
          type: 'error',
          message: `Erreur : ${result.error}`
        });
        setTimeout(clearNotification, 5000);
      } else {
        console.log("✅ [useBonDeCommande] Rejet réussi!");
        setNotification({
          show: true,
          type: 'success',
          message: result.message || 'Bon de commande rejeté avec succès !'
        });
        setTimeout(clearNotification, 5000);
        
        // Recharger les informations du BC après rejet
        await fetchBcInfo();
      }
    } catch (error) {
      console.error("❌ [useBonDeCommande] Erreur lors du rejet:", error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Erreur lors du rejet du bon de commande'
      });
      setTimeout(clearNotification, 5000);
    } finally {
      setRejectingBc(false);
    }
  }, [bcInfo?.id, clearNotification, fetchBcInfo]);

  return {
    // États
    bcInfo,
    loadingBc,
    errorBc,
    pdfUrl,
    validatingBc,
    rejectingBc,
    notification,
    
    // Actions
    handleValidateBc,
    handleRejectBc,
    clearNotification,
    refetchBcInfo: fetchBcInfo,
  };
};

export default useBonDeCommande;
