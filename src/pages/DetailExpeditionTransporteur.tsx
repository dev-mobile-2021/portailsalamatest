import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dashboard_icon from "../assets/images/dashbord_icon.png";
import SmallHeader from "../components/const/SmallHeader";
import { useAuthContext } from "../hooks/useUserhook";
import NotificationPopup from "../components/ui/NotificationPopup";
import { useNotification } from "../hooks/useNotification";
import { useMission } from "../hooks/useExpeditions";
import useChauffeurs from "../hooks/useChauffeurs";
import useParkings from "../hooks/useParkings";
import { useCrud } from "../hooks/useCrud";
import { LivraisonClient } from "../types/Mission.types";
import ExpeditionDossierTab from "../components/expedition/ExpeditionDossierTab";
import MissionClosureTab from "../components/expedition/MissionClosureTab";

type TabType = "details" | "cloture";

const DetailExpeditionTransporteur = () => {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const navigate = useNavigate();
  const { user,fournisseur } = useAuthContext();
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const [activeTab, setActiveTab] = useState<TabType>("details");
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadingOM, setDownloadingOM] = useState(false);
  const [acceptingMission, setAcceptingMission] = useState(false);
  const [rejectingMission, setRejectingMission] = useState(false);

  // États pour la clôture
  const [submitting, setSubmitting] = useState(false);
  const [livraisons, setLivraisons] = useState<Record<string, LivraisonClient>>({});

  // Hooks useCrud pour les API de changement
  const { useCreateItem: useChangerChauffeur } = useCrud<any>("expeditionaxetransporteur/changer-chauffeur", "changer-chauffeur");
  const { useCreateItem: useProposerRemplacement } = useCrud<any>("api/remplacement/proposer", "remplacement");
  
  const changerChauffeurMutation = useChangerChauffeur();
  const proposerRemplacementMutation = useProposerRemplacement();

  // Récupération de la mission - DOIT être avant useParkings
  const { mission, loading, error, refetch } = useMission(id, user?.fournisseur_id);

  // Chauffeurs disponibles pour changement via API
  const { chauffeurs, loading: loadingChauffeurs } = useChauffeurs({ 
    fournisseur_id: fournisseur?.id
  });
  
  // Véhicules disponibles pour changement via API
  const { vehicules, loading: loadingVehicules } = useParkings({
    fournisseur_id: fournisseur?.id || user?.fournisseur_id || 0,
    tonnage_id: mission?.vehicule?.tonnage_id || 0
  });
  
  // Adapter les chauffeurs au format attendu par ExpeditionDossierTab
  const chauffeursDisponibles = chauffeurs.map(c => ({
    id: String(c.id),
    nom: c.nom,
    telephone: c.telephone,
    email: c.email
  }));

  // Adapter les véhicules au format attendu
  const vehiculesDisponibles = vehicules.map(v => ({
    id: String(v.id),
    matricule: v.matricule,
    marque: v.marque,
    tonnage: v.tonnage?.tonnage || 0,
    tonnage_designation: v.tonnage?.designation || '',
    typevehicule: v.typevehicule?.designation || '',
  }));

  // Handler pour changer de chauffeur - API: POST /expeditionaxetransporteur/changer-chauffeur
  const handleChangeChauffeur = (chauffeurId: string) => {
    if (!mission?.id) {
      showError("Erreur", "Informations de la mission manquantes.");
      return;
    }

    const payload = {
      expeditionaxetransporteur_id: Number(mission.id),
      chauffeur_id: Number(chauffeurId)
    };

    console.log("[ChangeChauffeur] Appel API /expeditionaxetransporteur/changer-chauffeur:", payload);

    changerChauffeurMutation.mutate(payload, {
      onSuccess: () => {
        console.log("[ChangeChauffeur] Changement réussi");
        showSuccess(
          "Chauffeur modifié",
          "Le chauffeur a été changé avec succès."
        );
        // Recharger les données après 1 seconde
        setTimeout(() => {
          refetch();
        }, 1000);
      },
      onError: (error: any) => {
        console.error("[ChangeChauffeur] Erreur:", error);
        const errorMessage = error?.response?.data?.message || "Impossible de changer le chauffeur. Veuillez réessayer.";
        showError("Erreur", errorMessage);
      }
    });
  };

  // Handler pour changer de véhicule - API: POST /api/remplacement/proposer
  const handleChangeVehicule = (vehiculeId: string) => {
    if (!mission || !fournisseur?.id) {
      showError("Erreur", "Informations manquantes pour proposer le remplacement.");
      return;
    }

    const payload = {
      expeditionaxetransporteur_id: Number(mission.id),
      fournisseur_id: fournisseur.id,
      vehicule_remplacement_id: Number(vehiculeId),
      motif: "Changement de véhicule demandé par le transporteur"
    };

    console.log("[ChangeVehicule] Appel API /api/remplacement/proposer:", payload);

    proposerRemplacementMutation.mutate(payload, {
      onSuccess: (response) => {
        console.log("[ChangeVehicule] Réponse API:", response.data);
        if (response.data?.success) {
          showSuccess(
            "Demande envoyée",
            "Votre demande de changement de véhicule a été soumise. Elle est en attente de validation."
          );
        } else {
          showError("Erreur", response.data?.message || "Impossible de proposer le remplacement.");
        }
      },
      onError: (error: any) => {
        console.error("[ChangeVehicule] Erreur:", error);
        const errorMessage = error?.response?.data?.message || "Impossible de proposer le remplacement. Veuillez réessayer.";
        showError("Erreur", errorMessage);
      }
    });
  };



  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Initialiser les livraisons quand la mission est chargée
  useEffect(() => {
    if (mission) {
      const initialLivraisons: Record<string, LivraisonClient> = {};
      mission.clients.forEach((client, idx) => {
        const key = `${idx}`;
        initialLivraisons[key] = {
          expedition_client_id: client.expedition_client_id,
          client_id: client.id,
          client_designation: client.designation,
          date: "",
          heure: "",
          bl_signe: null,
          pvrd_signe: null,
          bon_retour_signe: null,
          fiche_pointage_signe: null,
        };
      });
      setLivraisons(initialLivraisons);
    }
  }, [mission]);

  const updateLivraison = (key: string, field: keyof LivraisonClient, value: any) => {
    setLivraisons(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const getCompletedCount = (): number => {
    if (!mission) return 0;
    return mission.clients.filter((client, idx) => {
      const key = `${idx}`;
      const liv = livraisons[key];
      // Check local files
      const localComplete = !!(liv && liv.bl_signe && liv.pvrd_signe && liv.bon_retour_signe && liv.fiche_pointage_signe);
      
      // Check API docs
      const hasType = (type: string) => client.documents?.some(d => d.type === type);
      const apiComplete = hasType('bl_signe') && hasType('pvrd') && hasType('bon_retour') && hasType('fiche_pointage');

      return localComplete || apiComplete;
    }).length;
  };

  /**
   * Upload un document vers l'API
   * POST /expedition/upload-document
   * Content-Type: multipart/form-data
   */
  const uploadDocument = async (
    expeditionClientId: number,
    documentType: 'pvrd' | 'bl_signe' | 'bon_retour' | 'fiche_pointage',
    file: File
  ): Promise<boolean> => {
    const formData = new FormData();
    formData.append('type', 'expeditionclient');
    formData.append('id', String(expeditionClientId));
    formData.append('document_type', documentType);
    formData.append('file', file);

    console.log(`[UploadDocument] Uploading ${documentType} for client ${expeditionClientId}`);

    try {
      const response = await fetch('https://backsignup.h-tsoft.com//expedition/upload-document', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[UploadDocument] Erreur HTTP ${response.status}:`, errorText);
        return false;
      }

      console.log(`[UploadDocument] ✓ ${documentType} uploadé avec succès`);
      return true;
    } catch (error) {
      console.error(`[UploadDocument] Erreur réseau pour ${documentType}:`, error);
      return false;
    }
  };

  const handleSubmitCloture = async (clientKey: string) => {
    const livraison = livraisons[clientKey];
    if (!livraison || !mission) return;

    setSubmitting(true);
    
    try {
      console.log(`[ClotureMission] Démarrage de l'upload des documents pour le client ${livraison.client_designation}...`);
      
      const expeditionClientId = livraison.expedition_client_id;
      if (!expeditionClientId) {
        showError("Erreur", "Identifiant client manquant");
        setSubmitting(false);
        return;
      }

      // Collecter tous les uploads à effectuer pour ce client
      const uploadPromises: Promise<boolean>[] = [];
      const uploadDescriptions: string[] = [];

      // Upload BL signé
      if (livraison.bl_signe) {
        uploadPromises.push(uploadDocument(expeditionClientId, 'bl_signe', livraison.bl_signe));
        uploadDescriptions.push(`BL signé`);
      }

      // Upload PVRD signé
      if (livraison.pvrd_signe) {
        uploadPromises.push(uploadDocument(expeditionClientId, 'pvrd', livraison.pvrd_signe));
        uploadDescriptions.push(`PVRD`);
      }

      // Upload Bon de retour signé
      if (livraison.bon_retour_signe) {
        uploadPromises.push(uploadDocument(expeditionClientId, 'bon_retour', livraison.bon_retour_signe));
        uploadDescriptions.push(`Bon de retour`);
      }

      // Upload Fiche de pointage signée
      if (livraison.fiche_pointage_signe) {
        uploadPromises.push(uploadDocument(expeditionClientId, 'fiche_pointage', livraison.fiche_pointage_signe));
        uploadDescriptions.push(`Fiche de pointage`);
      }

      console.log(`[ClotureMission] ${uploadPromises.length} documents à uploader:`, uploadDescriptions);

      // Exécuter tous les uploads en parallèle
      const results = await Promise.all(uploadPromises);
      
      // Vérifier les résultats
      const successCount = results.filter(r => r).length;
      const failCount = results.filter(r => !r).length;

      console.log(`[ClotureMission] Résultats: ${successCount} succès, ${failCount} échecs`);

      if (failCount > 0) {
        showError(
          "Erreur partielle",
          `${failCount} document(s) n'ont pas pu être uploadés. Veuillez réessayer.`
        );
      } else {
        showSuccess(
          "Documents envoyés",
          `Les documents pour ${livraison.client_designation} ont été uploadés avec succès.`
        );
        
        // Rafraîchir la page après 2 secondes pour mettre à jour l'état
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (err: any) {
      console.error("[ClotureMission] Erreur:", err);
      showError("Erreur", "Impossible de clôturer la mission pour ce client. Veuillez réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!id || !user?.fournisseur_id || !mission) return;
    
    setDownloadingPdf(true);
    try {
      const response = await fetch(
        `https://backsignup.h-tsoft.com//pdf.generate-pdf-bcfournisseur/${mission.expedition_id}/${user.fournisseur_id}`,
        {
          method: "GET",
          headers: { Accept: "application/pdf" },
        }
      );

      if (!response.ok) throw new Error("Erreur lors de la génération du PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `OM-${mission.code}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      showSuccess("Téléchargement réussi", "L'ordre de mission a été téléchargé.");
    } catch (error) {
      console.error("Erreur téléchargement PDF:", error);
      showError("Erreur", "Impossible de télécharger l'ordre de mission.");
    } finally {
      setDownloadingPdf(false);
    }
  };

  // Documents download handlers
  const downloadDocument = async (url: string, filename: string) => {
    try {
      showSuccess("Téléchargement lancé", "Veuillez patienter...");
      const response = await fetch(url, {
        method: "GET",
        headers: { Accept: "application/pdf" },
      });

      if (!response.ok) throw new Error("Erreur lors de la génération du PDF");

      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(downloadUrl);
      document.body.removeChild(a);
      
      showSuccess("Téléchargement réussi", `${filename} a été téléchargé.`);
    } catch (error) {
      console.error("Erreur téléchargement:", error);
      showError("Erreur", `Impossible de télécharger ${filename}.`);
    }
  };

  const handleDownloadOM = async () => {
    if (!mission?.axe?.id || !mission?.chauffeur?.id) {
      showError("Erreur", "Informations manquantes pour télécharger l'OM.");
      return;
    }
    setDownloadingOM(true);
    try {
      const url = `https://backsignup.h-tsoft.com//pdf.generate-pdf-bctransporteur/${mission.axe.id}/${mission.chauffeur.id}`;
      await downloadDocument(url, `OM-Chauffeur-${mission.chauffeur.nom}-${mission.code}.pdf`);
    } finally {
      setDownloadingOM(false);
    }
  };

  const handleDownloadPVRD = () => {
    if (!mission?.axe?.id || !mission?.chauffeur?.id) return;
    const url = `https://backsignup.h-tsoft.com//pdf.generate-pdf-pvrd-chauffeur/${mission.axe.id}/${mission.chauffeur.id}`;
    downloadDocument(url, `PVRD-${mission.code}.pdf`);
  };

  const handleDownloadBonRetour = () => {
    if (!mission?.axe?.id || !mission?.chauffeur?.id) return;
    const url = `https://backsignup.h-tsoft.com//pdf.generate-pdf-bonretour-chauffeur/${mission.axe.id}/${mission.chauffeur.id}`;
    downloadDocument(url, `BonRetour-${mission.code}.pdf`);
  };

  const handleDownloadFichePointage = () => {
    if (!mission?.axe?.id || !mission?.chauffeur?.id) return;
    const url = `https://backsignup.h-tsoft.com//pdf.generate-pdf-fichepointage/${mission.axe.id}/${mission.chauffeur.id}`;
    downloadDocument(url, `FichePointage-${mission.code}.pdf`);
  };

  const handleDownloadBLTransporteur = () => {
    if (!mission?.id) return;
    const url = `https://backsignup.h-tsoft.com//pdf.generate-pdf-bl-transporteur/${mission.id}`;
    downloadDocument(url, `BL-Transporteur-${mission.code}.pdf`);
  };

  const handleAcceptMission = async () => {
    if (!mission || !user?.fournisseur_id || mission.validation_fournisseur === 1) return;
    
    setAcceptingMission(true);
    try {
      const payload = {
        expeditionaxetransporteur_id: mission.id,
        validation: 1, // 1 = Validé
      };
      
      console.log("[AcceptMission] Appel API /expeditionaxetransporteur/validation-fournisseur:", payload);
      
      const response = await fetch('https://backsignup.h-tsoft.com//expeditionaxetransporteur/validation-fournisseur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[AcceptMission] Erreur HTTP:", response.status, errorText);
        throw new Error("Erreur lors de l'acceptation de la mission");
      }

      const result = await response.json();
      console.log("[AcceptMission] Réponse API:", result);
      
      showSuccess(
        "Mission acceptée",
        "Vous avez confirmé votre accord pour effectuer cette livraison. Le donneur d'ordre en sera informé."
      );
      
      // Recharger la page pour mettre à jour les données
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.error("[AcceptMission] Erreur:", err);
      showError("Erreur", "Impossible d'accepter la mission. Veuillez réessayer.");
    } finally {
      setAcceptingMission(false);
    }
  };

  const handleRejectMission = async () => {
    if (!mission || !user?.fournisseur_id) return;
    
    // Confirmation avant rejet
    const confirmed = window.confirm(
      "Êtes-vous sûr de vouloir refuser cette mission ? Cette action est irréversible."
    );
    if (!confirmed) return;
    
    setRejectingMission(true);
    try {
      const payload = {
        expeditionaxetransporteur_id: mission.id,
        validation: 99, // 99 = Rejeté
      };
      
      console.log("[RejectMission] Appel API /expeditionaxetransporteur/validation-fournisseur:", payload);
      
      const response = await fetch('https://backsignup.h-tsoft.com//expeditionaxetransporteur/validation-fournisseur', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("[RejectMission] Erreur HTTP:", response.status, errorText);
        throw new Error("Erreur lors du rejet de la mission");
      }

      const result = await response.json();
      console.log("[RejectMission] Réponse API:", result);
      
      showSuccess(
        "Mission refusée",
        "Cette affectation a été refusée. Vous allez être redirigé vers la liste des missions."
      );
      
      // Rediriger vers la liste après un court délai
      setTimeout(() => {
        navigate('/portailTransporteur');
      }, 2000);
    } catch (err: any) {
      console.error("[RejectMission] Erreur:", err);
      showError("Erreur", "Impossible de refuser la mission. Veuillez réessayer.");
    } finally {
      setRejectingMission(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusConfig = () => {
    const status = mission?.etat_text || mission?.statut || "";
    if (status.toLowerCase().includes("livr")) {
      return { bg: "#28a745", color: "white", label: "Livré" };
    } else if (status.toLowerCase().includes("cours") || status.toLowerCase().includes("transit")) {
      return { bg: "#ffc107", color: "#212529", label: "En cours" };
    } else if (status.toLowerCase().includes("attent")) {
      return { bg: "#17a2b8", color: "white", label: "En attente" };
    }
    return { bg: "#6c757d", color: "white", label: status || "N/A" };
  };

  if (loading) {
    return (
      <>
        <SmallHeader />
        <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
          <div className="container pt-5 text-center">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <p className="mt-3" style={{ color: "#6c757d" }}>Chargement des détails...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !mission) {
    return (
      <>
        <SmallHeader />
        <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
          <div className="container pt-5">
            <div className="alert alert-danger">{error || "Mission non trouvée"}</div>
            <button
              className="btn btn-outline-secondary"
              onClick={() => navigate("/portailTransporteur")}
            >
              ← Retour à la liste
            </button>
          </div>
        </div>
      </>
    );
  }

  const statusConfig = getStatusConfig();
  const completedCount = getCompletedCount();
  const totalClients = mission.clients.length;
  const progressPercent = totalClients > 0 ? Math.round((completedCount / totalClients) * 100) : 0;

  // Styles pour les onglets
  const tabStyle = (isActive: boolean) => ({
    padding: "12px 24px",
    backgroundColor: isActive ? "white" : "transparent",
    color: isActive ? "#1FB05B" : "#6c757d",
    border: "none",
    borderBottom: isActive ? "3px solid #1FB05B" : "3px solid transparent",
    fontWeight: isActive ? 600 : 500,
    fontSize: "15px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginRight: "8px",
  });

  return (
    <>
      <SmallHeader />
      <div style={{ backgroundColor: "#f5f7fa", minHeight: "100vh", paddingBottom: "40px" }}>
        <div className="container py-4">
          {/* Header Card */}
          <div
            className="card mb-4"
            style={{
              borderRadius: "12px",
              border: "none",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
                padding: "20px 24px",
              }}
            >
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center" style={{ gap: "16px" }}>
                  <button
                    className="btn btn-sm"
                    onClick={() => navigate("/portailTransporteur")}
                    style={{
                      backgroundColor: "rgba(255,255,255,0.2)",
                      color: statusConfig.color,
                      border: "none",
                      borderRadius: "8px",
                      padding: "8px 16px",
                    }}
                  >
                    ← Retour
                  </button>
                  <img
                    src={dashboard_icon}
                    alt="Dashboard"
                    style={{ height: "32px", width: "32px", objectFit: "contain" }}
                  />
                  <div>
                    <h4 style={{ margin: 0, fontWeight: 600 }}>Mission {mission.code}</h4>
                    <span style={{ opacity: 0.9, fontSize: "14px" }}>{statusConfig.label}</span>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "24px", fontWeight: 700 }}>
                    {mission.cout_transport?.toLocaleString()} MGA
                  </div>
                  <div style={{ opacity: 0.9, fontSize: "13px" }}>Montant mission</div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div
              style={{
                backgroundColor: "#f8f9fa",
                borderBottom: "1px solid #e9ecef",
                padding: "0 16px",
              }}
            >
              <button
                style={tabStyle(activeTab === "details")}
                onClick={() => setActiveTab("details")}
              >
                 Liasse expédition
              </button>
              <button
                style={tabStyle(activeTab === "cloture")}
                onClick={() => setActiveTab("cloture")}
              >
                 Clôturer la mission
              </button>
            </div>
          </div>

          {/* Tab Content: Détails */}
  {activeTab === "details" && (
            <ExpeditionDossierTab
              mission={mission}
              formatDate={formatDate}
              downloadingPdf={downloadingPdf}
              onDownloadBC={handleDownloadPdf}
              acceptingMission={acceptingMission}
              onAcceptMission={handleAcceptMission}
              rejectingMission={rejectingMission}
              onRejectMission={handleRejectMission}
              downloadingOM={downloadingOM}
              onDownloadOM={handleDownloadOM}
              onDownloadPVRD={handleDownloadPVRD}
              onDownloadBonRetour={handleDownloadBonRetour}
              onDownloadFichePointage={handleDownloadFichePointage}
              onDownloadBL={handleDownloadBLTransporteur}
              chauffeursDisponibles={chauffeursDisponibles}
              loadingChauffeurs={loadingChauffeurs}
              onChangeChauffeur={handleChangeChauffeur}
              vehiculesDisponibles={vehiculesDisponibles}
              loadingVehicules={loadingVehicules}
              onChangeVehicule={handleChangeVehicule}
              showSuccess={showSuccess}
            />
          )}

          {/* Tab Content: Clôture */}
          {activeTab === "cloture" && (
            <MissionClosureTab
              mission={mission}
              completedCount={completedCount}
              totalClients={totalClients}
              progressPercent={progressPercent}
              livraisons={livraisons}
              updateLivraison={updateLivraison}
              submitting={submitting}
              onBackToDetails={() => setActiveTab("details")}
              onSubmit={handleSubmitCloture}
            />
          )}
        </div>
      </div>

      <NotificationPopup
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoCloseDelay={5000}
      />
    </>
  );
};

export default DetailExpeditionTransporteur;
