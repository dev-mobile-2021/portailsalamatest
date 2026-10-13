import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import back_btn from "../assets/images/back_btn.png";
import SmallHeader from "../components/const/SmallHeader";
import DocumentsTab from "../components/tabs/DocumentsTabAO";
import OffresTransportTab, { OffreTonnageData } from "../components/tabs/OffresTransportTabAO";
import FlotteTransportTab, { FlotteSelection } from "../components/tabs/FlotteTransportTabAO";

import { useCrud } from "../hooks/useCrud";
import { useAuthContext } from "../hooks/useUserhook";
import NotificationPopup from "../components/ui/NotificationPopup";
import { useNotification } from "../hooks/useNotification";
import { useOffreTransport } from "../hooks/useOffresTransport";

const tabStyles = {
  container: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    padding: "0 15px",
  },
  chip: {
    padding: "10px 20px",
    borderRadius: "20px",
    border: "1px solid #1FB05B",
    backgroundColor: "white",
    color: "#1FB05B",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "all 0.3s ease",
  },
  activeChip: {
    backgroundColor: "#1FB05B",
    color: "white",
  },
};

const SoumissionTransport = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthContext();
  
  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Récupérer l'offre de transport par ID
  const { offreTransport: offre, loading, error } = useOffreTransport(Number(id));
  
 
  // Onglet actif
  const [activeTab, setActiveTab] = useState<"Transport" | "Flotte" | "Documents">("Transport");

  // État pour les offres de transport (prix, délais, etc.)
  const [offresTransport, setOffresTransport] = useState<Record<string, OffreTonnageData>>({});
  
  // État pour la flotte (véhicules existants et nouveaux)
  const [flotteSelection, setFlotteSelection] = useState<FlotteSelection>({
    vehicules_existants: [],
    nouveaux_vehicules: [],
  });

  // État pour les documents uploadés
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File[]>>({});

  // Hook pour la soumission
  const { useCreateFormData } = useCrud<any>("/offretransport/submitSoumission", "/offretransport/submitSoumission");
  const createSoumissionFormData = useCreateFormData();

  // Handler pour les offres de transport
  const handleOffreTransportChange = (
    axeTonnageId: string,
    field: keyof OffreTonnageData,
    value: string | number | boolean,
    axe_id?: number,
    tonnage_id?: number
  ) => {
    setOffresTransport((prev) => ({
      ...prev,
      [axeTonnageId]: {
        ...prev[axeTonnageId],
        axeTonnageId,
        axe_id: axe_id ?? prev[axeTonnageId]?.axe_id ?? 0,
        tonnage_id: tonnage_id ?? prev[axeTonnageId]?.tonnage_id ?? 0,
        [field]: value,
        // Initialiser les valeurs par défaut si c'est une nouvelle entrée
        prixPropose: field === "prixPropose" ? value as number : (prev[axeTonnageId]?.prixPropose ?? 0),
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!offre) {
      showError("Erreur", "Offre de transport non trouvée");
      return;
    }

    // Validation: au moins une offre de tonnage doit être remplie
    const offresRemplies = Object.values(offresTransport).filter(
      (o) => o.prixPropose > 0
    );

    if (offresRemplies.length === 0) {
      showError(
        "Validation échouée",
        "Veuillez remplir au moins une offre de prix pour un tonnage"
      );
      return;
    }

    console.log(" [SoumissionTransport] Construction du payload - Start");
    console.log(" Offres transport:", offresTransport);
    console.log(" Flotte selection:", flotteSelection);

    // ===== CONSTRUCTION DU PAYLOAD JSON =====
    
    // 1. Grouper les offres par axe_id
    const axesMap: Record<number, { 
      axe_id: number; 
      tonnages: Array<{ 
        tonnage_id: number; 
        quantite: number;
        prix_unitaire: number;
      }>;
      commentaire?: string;
      delai_livraison?: number;
    }> = {};

    // Parser les offres de transport et les grouper par axe
    Object.entries(offresTransport).forEach(([axeTonnageId, data]) => {
      if (data.prixPropose > 0) {
        // Utiliser les axe_id et tonnage_id stockés dans data
        const axeId = data.axe_id;
        const tonnageId = data.tonnage_id;
        
        if (!axeId || !tonnageId) {
          console.warn(`Offre ${axeTonnageId} sans axe_id ou tonnage_id, ignorée`);
          return;
        }

        if (!axesMap[axeId]) {
          axesMap[axeId] = {
            axe_id: axeId,
            tonnages: [],
          };
        }

        // Ajouter le tonnage avec son prix
        axesMap[axeId].tonnages.push({
          tonnage_id: tonnageId,
          quantite: 1,
          prix_unitaire: data.prixPropose,
        });
      }
    });

    // 2. Préparer les nouveaux véhicules
    const nouveauxVehiculesPayload = flotteSelection.nouveaux_vehicules.map((vehicule) => ({
      typevehicule_id: parseInt(String(vehicule.typevehicule_id), 10),
      matricule: vehicule.matricule,
      marque: vehicule.marque,
      tonnage_id: parseInt(String(vehicule.tonnage_id), 10),
      description: vehicule.description || "",
      volume: vehicule.volume || 0,
      nouveau_chauffeur: vehicule.nouveau_chauffeur ? {
        nom: vehicule.nouveau_chauffeur.nom,
        email: vehicule.nouveau_chauffeur.email || "",
        telephone: vehicule.nouveau_chauffeur.telephone,
        adresse: vehicule.nouveau_chauffeur.adresse || "",
        code: vehicule.nouveau_chauffeur.code || "",
      } : undefined,
    }));

    // 3. Construire le tableau des axes
    const axesArray = Object.values(axesMap).map((axe) => ({
      axe_id: axe.axe_id,
      tonnages: axe.tonnages,
    }));

    // 4. Construire les documents
    const docDesignationById: Record<string, string> = {};
    if (Array.isArray(offre.offretransportdocspecifis) && offre.offretransportdocspecifis.length > 0) {
      offre.offretransportdocspecifis
        .filter((doc: any) => {
          const etat = doc?.documentspecification?.etatetexte;
          return !etat || etat === "A la soumission";
        })
        .forEach((doc: any) => {
          const docId = String(doc?.id);
          if (!docId || docId === "undefined") return;
          const designation =
            doc?.documentspecification?.designation ??
            doc?.designation ??
            "";
          if (designation) docDesignationById[docId] = designation;
        });
    } else if (Array.isArray(offre.attachments) && offre.attachments.length > 0) {
      offre.attachments
        .filter((att: any) => att?.isannexe === 1 && att?.documentspecification?.etatetexte === "A la soumission")
        .forEach((att: any) => {
          const docId = String(att?.id);
          if (!docId || docId === "undefined") return;
          const designation = att?.documentspecification?.designation ?? "";
          if (designation) docDesignationById[docId] = designation;
        });
    }

    const documents: Array<{ offretransportdocspecifi_id: number; designation: string; file: File }> = [];
    Object.entries(uploadedDocs).forEach(([docId, files]) => {
      if (files && files.length > 0) {
        files.forEach((file) => {
          documents.push({
            offretransportdocspecifi_id: Number(docId),
            designation: docDesignationById[docId] || file.name,
            file: file,
          });
        });
      }
    });

    // 5. Construire le payload final (nouvelle structure API 2026)
    const payload = {
      offretransport_id: offre.id,
      fournisseur_id: user?.fournisseur_id,
      vehicules_existants: flotteSelection.vehicules_existants,
      nouveaux_vehicules: nouveauxVehiculesPayload,
      axes: axesArray,
      documents: documents.map(d => ({
        offretransportdocspecifi_id: d.offretransportdocspecifi_id,
        designation: d.designation,
      })),
    };

    console.log("📄 Payload JSON:", JSON.stringify(payload, null, 2));

    // 6. Construction du FormData pour l'envoi
    const formData = new FormData();
    
    // Ajouter le payload complet en JSON (pour parsing côté backend)
    formData.append("data", JSON.stringify(payload));
    
    // Également ajouter les champs individuels pour compatibilité
    formData.append("offretransport_id", String(offre.id));
    formData.append("fournisseur_id", String(user?.fournisseur_id));

    // Ajouter les véhicules existants (au niveau global, pas par axe)
    flotteSelection.vehicules_existants.forEach((vehiculeId, vIdx) => {
      formData.append(`vehicules_existants[${vIdx}]`, String(vehiculeId));
    });

    // Ajouter les nouveaux véhicules (au niveau global)
    nouveauxVehiculesPayload.forEach((vehicule, vIdx) => {
      formData.append(`nouveaux_vehicules[${vIdx}][typevehicule_id]`, String(vehicule.typevehicule_id));
      formData.append(`nouveaux_vehicules[${vIdx}][matricule]`, vehicule.matricule);
      formData.append(`nouveaux_vehicules[${vIdx}][marque]`, vehicule.marque);
      formData.append(`nouveaux_vehicules[${vIdx}][tonnage_id]`, String(vehicule.tonnage_id));
      formData.append(`nouveaux_vehicules[${vIdx}][description]`, vehicule.description || "");
      formData.append(`nouveaux_vehicules[${vIdx}][volume]`, String(vehicule.volume || 0));
      
      if (vehicule.nouveau_chauffeur) {
        formData.append(`nouveaux_vehicules[${vIdx}][nouveau_chauffeur][nom]`, vehicule.nouveau_chauffeur.nom);
        formData.append(`nouveaux_vehicules[${vIdx}][nouveau_chauffeur][email]`, vehicule.nouveau_chauffeur.email || "");
        formData.append(`nouveaux_vehicules[${vIdx}][nouveau_chauffeur][telephone]`, vehicule.nouveau_chauffeur.telephone);
        formData.append(`nouveaux_vehicules[${vIdx}][nouveau_chauffeur][adresse]`, vehicule.nouveau_chauffeur.adresse || "");
        formData.append(`nouveaux_vehicules[${vIdx}][nouveau_chauffeur][code]`, vehicule.nouveau_chauffeur.code || "");
      }
    });

    // Ajouter les axes avec leurs tonnages
    axesArray.forEach((axe, axeIdx) => {
      formData.append(`axes[${axeIdx}][axe_id]`, String(axe.axe_id));
      
      // Tonnages
      axe.tonnages.forEach((tonnage, tonnageIdx) => {
        formData.append(`axes[${axeIdx}][tonnages][${tonnageIdx}][tonnage_id]`, String(tonnage.tonnage_id));
        formData.append(`axes[${axeIdx}][tonnages][${tonnageIdx}][quantite]`, String(tonnage.quantite));
        formData.append(`axes[${axeIdx}][tonnages][${tonnageIdx}][prix_unitaire]`, String(tonnage.prix_unitaire));
      });
    });

    // Ajouter les documents (fichiers)
    documents.forEach((doc, idx) => {
      formData.append(`documents[${idx}][offretransportdocspecifi_id]`, String(doc.offretransportdocspecifi_id));
      formData.append(`documents[${idx}][designation]`, doc.designation);
      formData.append(`documents[${idx}][file]`, doc.file);
    });

    console.log("📄 FormData avant envoi:");
    for (const pair of formData.entries()) {
      console.log(`${pair[0]}: ${pair[1]}`);
    }

    // Envoi via le hook
    createSoumissionFormData.mutate(formData, {
      onSuccess: () => {
        showSuccess(
          "Soumission envoyée !",
          "Votre soumission pour l'offre de transport a été envoyée avec succès."
        );
        setTimeout(() => {
          navigate(`/tableauSuiviTransport/${offre.id}`);
        }, 2000);
      },
      onError: (err) => {
        showError("Erreur de soumission", String(err));
      },
    });
  };

  if (loading) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement de l'offre de transport...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-danger">Erreur : {error}</div>
      </>
    );
  }

  if (!offre) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-danger">
          Offre de transport introuvable
        </div>
      </>
    );
  }

  // Adapter l'offre de transport au format attendu par les composants
  const tenderForTabs = {
    id: String(offre.id),
    designation: offre.designation,
    reference: offre.reference,
    TSSCOD_0_0: "TRS",
    offretransports: [{
      id: offre.id,
      designation: offre.designation,
      reference: offre.reference,
      annee: offre.annee,
      detailoffretransports: offre.detailoffretransports,
    }],
    attachments: offre.attachments || [],
    offretransportdocspecifis: offre.offretransportdocspecifis || [],
  };

  return (
    <>
      <SmallHeader />
      <form onSubmit={handleSubmit}>
        <div
          className="mx-auto mt-5"
          style={{ marginBottom: "5vh", width: "95.5%" }}
        >
          <div
            className="bg-white p-4 rounded-3 shadow-sm"
            style={{ border: "1px solid #1FB05B" }}
          >
            <div className="d-flex align-items-center justify-content-between mb-1">
              <div className="d-flex align-items-center">
                <img
                  src={back_btn}
                  alt="retour"
                  onClick={() => navigate(-1)}
                  style={{ cursor: "pointer", height: "4vh", padding: "0 10px" }}
                />
                <h5 className="mb-0" style={{ color: "#1FB05B" }}>
                  Formulaire de soumission - Transport
                </h5>
              </div>
              <span
                className="badge ms-3"
                style={{ backgroundColor: "#1FB05B", marginRight: "20px" }}
              >
                Transport
              </span>
            </div>

            <p className="text-muted mb-0 ps-5">
              <strong>Réf:</strong> {offre.reference} | <strong>Année:</strong> {offre.annee}
            </p>

            <hr className="mb-4" />

            {/* Chips d'onglets */}
            <div className="mb-2" style={tabStyles.container}>
              <div
                style={{
                  ...tabStyles.chip,
                  ...(activeTab === "Transport" ? tabStyles.activeChip : {}),
                }}
                onClick={() => setActiveTab("Transport")}
              >
                Offres Transport
              </div>
              <div
                style={{
                  ...tabStyles.chip,
                  ...(activeTab === "Flotte" ? tabStyles.activeChip : {}),
                }}
                onClick={() => setActiveTab("Flotte")}
              >
                Flotte
              </div>
              <div
                style={{
                  ...tabStyles.chip,
                  ...(activeTab === "Documents" ? tabStyles.activeChip : {}),
                }}
                onClick={() => setActiveTab("Documents")}
              >
                Documents
              </div>
            </div>

            <br />

            {/* Onglet Transport */}
            <div style={{ display: activeTab === "Transport" ? "block" : "none" }}>
              <OffresTransportTab
                tender={tenderForTabs as any}
                offres={offresTransport}
                handleOffreChange={handleOffreTransportChange}
              />
            </div>

            {/* Onglet Flotte */}
            <div style={{ display: activeTab === "Flotte" ? "block" : "none" }}>
              <FlotteTransportTab
                tender={tenderForTabs as any}
                flotteSelection={flotteSelection}
                onFlotteChange={setFlotteSelection}
              />
            </div>

            {/* Onglet Documents */}
            <div style={{ display: activeTab === "Documents" ? "block" : "none" }}>
              <DocumentsTab
                tender={tenderForTabs as any}
                uploadedDocs={uploadedDocs}
                setUploadedDocs={setUploadedDocs}
              />
            </div>

            <br />
          </div>
        </div>

        <div
          className="mt-1 mx-auto"
          style={{ width: "95.5%", margin: "10vh" }}
        >
          <button
            type="submit"
            className="btn-white d-block py-3 px-5 text-center w-100"
            disabled={createSoumissionFormData.isPending}
            style={{
              fontSize: "1.1rem",
              borderRadius: "12px",
              boxShadow: "0 0 5px #1FB05B",
              border: "1px solid #1FB05B",
              backgroundColor: createSoumissionFormData.isPending ? "#f0f0f0" : "white",
              color: createSoumissionFormData.isPending ? "#999" : "#1FB05B",
              cursor: createSoumissionFormData.isPending ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {createSoumissionFormData.isPending ? (
              <>
                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                Envoi en cours...
              </>
            ) : (
              "Soumettre ma candidature"
            )}
          </button>
        </div>
      </form>

      {/* Composant de notification */}
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

export default SoumissionTransport;
