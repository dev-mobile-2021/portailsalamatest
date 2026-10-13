import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dashboard_icon from "../assets/images/dashbord_icon.png";
import { useCrud } from "../hooks/useCrud";
import { useAuthContext } from "../hooks/useUserhook";
import NotificationPopup from "../components/ui/NotificationPopup";
import { useNotification } from "../hooks/useNotification";
import SmallHeader from "../components/const/SmallHeader";
import { useOffreTransport } from "../hooks/useOffresTransport";
import { OffreTonnageData } from "../components/tabs/OffresTransportTabAO";
import { FlotteSelection } from "../components/tabs/FlotteTransportTabAO";

// Import des composants d'onglets
import VueGlobaleTransport from "../components/tabs/VueGlobaleTransportAO";

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

const TableauSuiviTransport = (props: { id?: string }) => {
  const params = useParams<{ id?: string }>();
  const id = props.id || params.id;
  const [activeTab, setActiveTab] = useState<"Vue globale" | "Historique">("Vue globale");

  const { user } = useAuthContext();
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // Récupérer l'offre de transport
  const { offreTransport: offre, loading: loadingOffre, error: errorOffre } = useOffreTransport(Number(id));

  // État pour les documents uploadés
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File[]>>({});
  const [documentsFournis, setDocumentsFournis] = useState<Array<{
    id: string;
    file: string;
    attachement_id: string;
    ao_id: string;
    designation?: string;
    offretransportdocspecifi_id?: string;
  }>>([]);

  // État pour les offres de transport (prix, délais, etc.)
  const [offresTransport, setOffresTransport] = useState<Record<string, OffreTonnageData>>({});
  
  // État pour la flotte (véhicules existants et nouveaux)
  const [flotteSelection, setFlotteSelection] = useState<FlotteSelection>({
    vehicules_existants: [],
    nouveaux_vehicules: [],
  });

  // État des données
  const [Data, setData] = useState<any>({
    soumissionId: null,
    offretransport_id: id,
    tender: null,
    articles: [],
  });

  const [dashboardData, setDashboardData] = useState<{
    documentsAConsulter: any[];
    documentsFournis: any[];
  }>({
    documentsAConsulter: [],
    documentsFournis: [],
  });

  // Refresh trigger
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Hook pour mise à jour
  const { useCreateFormData } = useCrud<any>("offretransport/submitSoumission", "offretransport/submitSoumission");
  const updateSoumissionFormData = useCreateFormData();

  // Charger les données de soumission transport
  useEffect(() => {
    if (id && user?.fournisseur_id) {
      // Récupérer la soumission transport avec la nouvelle requête
      fetch(
        `https://backsignup.h-tsoft.com//graphql?query={soumissiontrans(offretransport_id:"${id}",fournisseur_id:"${user.fournisseur_id}"){id,reference,date_soumission,montant_total,commentaire,vehiculesoumissions{id,vehicule{id,matricule,marque,typevehicule{designation},chauffeur{id,nom,telephone}}},fournisseur{id,nom,code,email,telephone},offretransport{id,reference,designation},detailsoumissiontrans{id,axe_id,delai_livraison,commentaire,axe{id,designation},soumissiontonnages{id,tonnage_id,prix_unitaire,quantite,montant_total,tonnage{id,designation}}},soumissiontransdocuments{id,file,designation,date_upload,offretransportdocspecifi{id,designation}}}}`
      )
        .then((res) => res.json())
        .then((obj) => {
          const soumissionArray = obj?.data?.soumissiontrans;
          
          // Chercher la soumission dont le fournisseur_id correspond à celui de l'utilisateur
          const soumission = soumissionArray?.find(
            (s: { fournisseur?: { id?: string | number } }) => 
              String(s.fournisseur?.id) === String(user?.fournisseur_id)
          );
          
          // Si une soumission valide est trouvée, charger ses données
          if (soumission) {
            setData((prev: any) => ({
              ...prev,
              soumissionId: soumission.id,
              offretransport_id: id,
              reference: soumission.reference,
              date: soumission.date_soumission,
              montant_total: soumission.montant_total,
              commentaire: soumission.commentaire,
              tender: {
                id: soumission.offretransport?.id,
                designation: soumission.offretransport?.designation,
                reference: soumission.offretransport?.reference,
                TSSCOD_0_0: "TRS",
              },
              detailsoumissions: soumission.detailsoumissiontrans || [],
            }));

            // Pré-remplir les offres de transport à partir des données existantes
            console.log("🔍 [DEBUT] Traitement des prix de soumission");
            console.log("🔍 [Details] detailsoumissiontrans:", soumission.detailsoumissiontrans);
            const offresMap: Record<string, OffreTonnageData> = {};
            soumission.detailsoumissiontrans?.forEach((detail: any) => {
              console.log(`🔍 [Detail] Traitement axe ${detail.axe_id}:`, detail);
              detail.soumissiontonnages?.forEach((tonnage: any) => {
                // Générer l'ID unique avec des strings pour la clé
                const axeTonnageId = `axe_${String(detail.axe_id)}_tonnage_${String(tonnage.tonnage_id)}`;
                console.log(`💾 [Soumission] Stockage prix pour ${axeTonnageId}: ${tonnage.prix_unitaire}`);
                offresMap[axeTonnageId] = {
                  axeTonnageId,
                  axe_id: parseInt(String(detail.axe_id), 10),
                  tonnage_id: parseInt(String(tonnage.tonnage_id), 10),
                  prixPropose: Number(tonnage.prix_unitaire),
                };
              });
            });
            console.log("💾 [Soumission] offresMap final:", offresMap);
            setOffresTransport(offresMap);

            // Pré-remplir la flotte à partir des données existantes
            // Les véhicules sont maintenant au niveau global, pas par axe
            const vehiculesExistants: number[] = [];


              soumission.vehiculesoumissions?.forEach((vehiculeSoum: any) => {
                if (vehiculeSoum.vehicule?.id) {
                  const vehiculeId = parseInt(String(vehiculeSoum.vehicule.id), 10);
                  if (!vehiculesExistants.includes(vehiculeId)) {
                    vehiculesExistants.push(vehiculeId);
                  }
                }
              });

            console.log("🚚 [TableauSuiviTransport] Véhicules existants extraits:", vehiculesExistants);

            setFlotteSelection({
              vehicules_existants: vehiculesExistants,
              nouveaux_vehicules: [],
            });

            // Documents déjà fournis (serveur)
            if (Array.isArray(soumission.soumissiontransdocuments)) {
              const docsFournisServeur = soumission.soumissiontransdocuments
                .filter((doc: any) => !!doc)
                .map((doc: any) => {
                  const docSpecId = String(doc?.offretransportdocspecifi?.id ?? doc?.offretransportdocspecifi_id ?? "");
                  return {
                    id: String(doc?.id ?? ""),
                    file: String(doc?.file ?? ""),
                    attachement_id: docSpecId,
                    ao_id: String(soumission?.offretransport?.id ?? id ?? ""),
                    designation: doc?.designation ?? doc?.offretransportdocspecifi?.designation ?? "",
                    offretransportdocspecifi_id: docSpecId,
                  };
                })
                .filter((d: any) => !!d.id && !!d.file);

              setDocumentsFournis(docsFournisServeur);
            }
          }
        })
        .catch((err) => {
          console.error("❌ [TableauSuiviTransport] Erreur:", err);
        });
    }
  }, [id, user?.fournisseur_id, refreshTrigger]);

  // Compléter les données avec l'offre de transport complète
  useEffect(() => {
    if (offre) {
 
      
      // Transformer detailoffretransports en offreGroups
      const offreGroups: any[] = [];
      
      if (offre.detailoffretransports && offre.detailoffretransports.length > 0) {
        offre.detailoffretransports.forEach((detail: any) => {
          const axe = detail.axe;
          if (!axe) return;
          
          // Créer les capacityRanges depuis les tonnages
          const capacityRanges: any[] = [];
          
          if (detail.detailoffretransporttonnages && detail.detailoffretransporttonnages.length > 0) {
            detail.detailoffretransporttonnages.forEach((tonnageDetail: any) => {
              const tonnage = tonnageDetail.tonnage;
              if (!tonnage) return;
              
              // Créer un ID unique pour cet axe-tonnage (en s'assurant que les IDs sont des strings)
              const axeTonnageId = `axe_${String(axe.id)}_tonnage_${String(tonnage.id)}`;
              
              // Chercher le prix déjà soumis dans offresTransport (depuis soumission)
              const prixSoumis = offresTransport[axeTonnageId]?.prixPropose || 0;
              
              console.log(`🔍 Axe ${axe.designation}, Tonnage ${tonnage.designation}:`);
              console.log(`   - axeTonnageId: ${axeTonnageId}`);
              console.log(`   - Prix soumis trouvé: ${prixSoumis}`);
              
              capacityRanges.push({
                id: tonnageDetail.id || `${axe.id}-${tonnage.id}`,
                axeTonnageId: axeTonnageId,
                tonnageMin: Number((tonnage as any).min ?? 0) || 0,
                tonnageMax: Number((tonnage as any).max ?? (tonnage as any).tonnage ?? 0) || 0,
                volumeMin: Number((tonnage as any).volume_min ?? 0) || 0,
                volumeMax: Number((tonnage as any).volume_max ?? 0) || 0,
                prixPropose: Number(prixSoumis), // Prix depuis la soumission existante
              });
            });
          }
          
          // Ajouter le groupe d'offres pour cet axe
          offreGroups.push({
            sectionId: `axe-${axe.id}`,
            axeDesignation: axe.designation || `Axe ${axe.id}`,
            province: axe.province?.designation || axe.region?.designation || "Province non spécifiée",
            capacityRanges: capacityRanges,
          });
        });
      }
      
      console.log("✅ [TableauSuiviTransport] offreGroups construits:", offreGroups);
      
      // Mettre à jour ou compléter les données du tender avec l'offre complète
      setData((prev: any) => ({
        ...prev,
        tender: {
          ...prev.tender,
          id: offre.id,
          designation: offre.designation,
          reference: offre.reference,
          annee: offre.annee,
          datelimite: offre.datelimite,
          datecloture: offre.datelimite, // Utiliser datelimite comme datecloture
          TSSCOD_0_0: "TRS",
          detailoffretransports: offre.detailoffretransports,
          attachments: offre.attachments,
        },
        offreGroups: offreGroups, // Ajouter offreGroups au Data
        datecloture: offre.datelimite, // Ajouter datecloture au Data
      }));

      // Compléter les documents à consulter et les documents requis à fournir depuis l'offre
      const documentsAConsulter = Array.isArray(offre.attachments)
        ? offre.attachments.filter((att: any) => att?.isannexe === 0)
        : [];

      const documentsRequisFromOffreTransport = Array.isArray((offre as any).offretransportdocspecifis)
        ? (offre as any).offretransportdocspecifis
            .filter((doc: any) => {
              const etat = doc?.documentspecification?.etatetexte;
              return !etat || etat === "A la soumission";
            })
            .map((doc: any) => ({
              id: String(doc?.id ?? ""),
              designation: doc?.documentspecification?.designation ?? doc?.designation ?? "",
              documentspecification: {
                id: String(doc?.documentspecification?.id ?? doc?.id ?? ""),
                designation: doc?.documentspecification?.designation ?? doc?.designation ?? "",
              },
              url: "",
              isannexe: 1,
            }))
            .filter((d: any) => !!d.id)
        : [];

      const documentsRequisFromAttachments = Array.isArray(offre.attachments)
        ? offre.attachments
            .filter((att: any) => att?.isannexe === 1 && att?.documentspecification?.etatetexte === "A la soumission")
            .map((att: any) => ({
              id: String(att?.id ?? ""),
              designation: att?.documentspecification?.designation ?? att?.designation ?? "",
              documentspecification: {
                id: String(att?.documentspecification?.id ?? att?.id ?? ""),
                designation: att?.documentspecification?.designation ?? att?.designation ?? "",
              },
              url: att?.url || "",
              isannexe: 1,
            }))
            .filter((d: any) => !!d.id)
        : [];

      setDashboardData(() => ({
        documentsAConsulter,
        documentsFournis:
          documentsRequisFromOffreTransport.length > 0
            ? documentsRequisFromOffreTransport
            : documentsRequisFromAttachments,
      }));
    }
  }, [offre, offresTransport]);

  const handleDocumentUpload = (documentId: string, files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    setUploadedDocs((prev) => ({
      ...prev,
      [documentId]: fileArray,
    }));
    showSuccess("Document ajouté", `${fileArray.length} fichier(s) prêt(s) à être envoyé(s)`);
  };

  const handleDocumentReset = (documentId: string) => {
    setUploadedDocs((prev) => {
      const newDocs = { ...prev };
      delete newDocs[documentId];
      return newDocs;
    });
    setDocumentsFournis((prev) => prev.filter((doc) => doc.attachement_id !== documentId));
    showSuccess("Document retiré", "Le document a été retiré avec succès");
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

    console.log("📤 [TableauSuiviTransport] Construction du payload - Start");
    console.log("📤 Offres transport:", offresTransport);
    console.log("📤 Flotte selection:", flotteSelection);

    // ===== CONSTRUCTION DU PAYLOAD JSON (nouvelle structure API 2026) =====
    
    // 1. Grouper les offres par axe_id
    const axesMap: Record<number, { 
      axe_id: number; 
      tonnages: Array<{ 
        tonnage_id: number; 
        quantite: number;
        prix_unitaire: number;
      }>;
    }> = {};

    // Parser les offres de transport et les grouper par axe
    Object.entries(offresTransport).forEach(([axeTonnageId, data]) => {
      if (data.prixPropose > 0) {
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
      id: Data.soumissionId,
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
    if (Data.soumissionId) {
      formData.append("id", String(Data.soumissionId));
    }
    formData.append("offretransport_id", String(offre.id));
    formData.append("fournisseur_id", String(user?.fournisseur_id));

    // Ajouter les véhicules existants (au niveau global)
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
    updateSoumissionFormData.mutate(formData, {
      onSuccess: () => {
        showSuccess(
          "Mise à jour réussie !",
          "Votre soumission a été mise à jour avec succès."
        );
        setUploadedDocs({});
        setRefreshTrigger((prev) => prev + 1);
      },
      onError: (err: any) => {
        showError("Erreur de mise à jour", String(err));
      },
    });
  };

  if (loadingOffre) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
          <p className="mt-3">Chargement du suivi...</p>
        </div>
      </>
    );
  }

  if (errorOffre) {
    return (
      <>
        <SmallHeader />
        <div className="container mt-5 text-danger">Erreur : {errorOffre}</div>
      </>
    );
  }

  return (
    <>
      <SmallHeader />
      <div
        className="card p-3 m-4"
        style={{ borderRadius: "18px", boxShadow: "0 2px 8px #e0e0e0" }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between mb-3"
          style={{ gap: "12px" }}
        >
          <div className="d-flex align-items-center" style={{ gap: "12px" }}>
            <img
              src={dashboard_icon}
              alt="Dashboard"
              style={{
                height: "38px",
                width: "38px",
                objectFit: "contain",
                marginRight: "8px",
              }}
            />
            <h2
              style={{
                color: "#1FB05B",
                margin: 0,
                fontSize: "1.35rem",
                fontWeight: 700,
                letterSpacing: "1px",
              }}
            >
              Suivi - Offre de Transport
            </h2>
          </div>
          <div>
            <span
              className="chip"
              style={{
                background: "#1FB05B",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "18px",
                padding: "8px 22px",
                minWidth: "120px",
                textAlign: "center",
                boxShadow: "0 2px 8px #e0e0e0",
                marginRight: "10px",
              }}
            >
              Ref : {Data?.tender?.reference || offre?.reference || "N/A"}
            </span>
            <span
              className="chip"
              style={{
                background: "#1FB05B",
                color: "white",
                fontWeight: 600,
                fontSize: "1rem",
                borderRadius: "18px",
                padding: "8px 22px",
                minWidth: "120px",
                textAlign: "center",
                boxShadow: "0 2px 8px #e0e0e0",
              }}
            >
              Transport
            </span>
          </div>
        </div>

        <hr style={{ margin: "10px 0 18px 0" }} />

        {/* Navigation Tabs */}
        <div style={{ ...tabStyles.container, justifyContent: "left" }}>
          {["Vue globale",].map((tab) => (
            <div
              key={tab}
              style={{
                ...tabStyles.chip,
                ...(activeTab === tab ? tabStyles.activeChip : {}),
                fontSize: "15px",
                minWidth: "140px",
                textAlign: "center",
              }}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Contenu selon l'onglet */}
        {activeTab === "Vue globale" && (
          <VueGlobaleTransport
            Data={Data}
            setData={setData}
            dashboardData={dashboardData}
            handleSubmit={handleSubmit}
            isSubmitting={updateSoumissionFormData.isPending}
            documentsFournis={documentsFournis}
            uploadedDocs={uploadedDocs}
            onDocumentUpload={handleDocumentUpload}
            onDocumentReset={handleDocumentReset}
            offresTransport={offresTransport}
            onOffresChange={setOffresTransport}
            flotteSelection={flotteSelection}
            onFlotteChange={setFlotteSelection}
          />
        )}

        
      </div>

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

export default TableauSuiviTransport;
