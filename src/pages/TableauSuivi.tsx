import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import dashboard_icon from "../assets/images/dashbord_icon.png";
// import { useAOContext } from "../context/AOContext";
import { useCrud } from "../hooks/useCrud";
import { useAuthContext } from "../hooks/useUserhook";
import NotificationPopup from "../components/ui/NotificationPopup";
import { useNotification } from "../hooks/useNotification";
import SmallHeader from "../components/const/SmallHeader";
import useDevises from "../hooks/useDevises";
import useFabricants from "../hooks/useFabricants";
import { BASE_URL } from "../utils/variable";

// Import des composants d'onglets
import VueGlobale from "../components/tabs/VueGlobaleAO";
import AMMPrequalification from "../components/tabs/AMMPrequalificationAO";
import BonDeCommande from "../components/tabs/BonDeCommandeAO";
import Livraisons from "../components/tabs/LivraisonsAO";
import Factures from "../components/tabs/FacturesAO";


// Accepte un paramètre id (via route ou props)
const TableauSuivi = (props: { id?: string }) => {
  // 🧪 Flag pour activer/désactiver les données mock de spécification
  const USE_MOCK_SPECIFICATION_DATA = false; // Désactivé - backend prêt

  // Récupère l'id depuis les props ou l'URL
  const params = useParams<{ id?: string }>();
  const id = props.id || params.id;
  const [activeTab, setActiveTab] = useState<
    "Vue globale" | "AMM / Préqualification" | "Bon de commande" | "livraisons" | "factures"
  >("Vue globale");

  // Hook pour la soumission - Utilisation de useCreateFormData pour gérer les fichiers
  const { useCreateFormData } = useCrud<any>("api/soumission", "soumission");
  const updateSoumissionFormData = useCreateFormData();
  const { user, fournisseur } = useAuthContext();

  // Hook pour les fabricants (fournisseurs)
  const {
    fabricantsValides: fournisseurs,
    loading: loadingFabricants,
    error: errorFabricants,
    fetchFabricantsValide
  } = useFabricants();

  // ID du DDP pour les termes commerciaux
  const [ddpId, setDdpId] = useState<number | null>(null);

  // Hook pour les devises
  const { devises, loading: loadingDevises } = useDevises();

  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  // État pour les documents fournis par l'utilisateur (déjà sur le serveur)
  const [documentsFournis, setDocumentsFournis] = useState<Array<{
    id: string;
    file: string;
    attachement_id: string;
    ao_id: string;
  }>>([]);

  // 🆕 État pour les documents uploadés localement (nouveaux uploads)
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File[]>>({});

  // 🆕 État pour déclencher un refresh des données après soumission
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // 🆕 État pour vérifier si l'API suivimarche est disponible
  const [suivimarcheAvailable, setSuivimarcheAvailable] = useState<boolean | null>(null);

  // 🆕 État pour stocker les données de suivimarche (notamment l'état pour détecter la clôture)
  const [suivimarcheData, setSuivimarcheData] = useState<{
    id: number;
    etat: number; // < 0 = contrat clôturé/résilié
    etat_text: string;
    etat_bc: number;
  } | null>(null);

  useEffect(() => {
    // Charger les fabricants valides via le hook (utilise le cache)
    fetchFabricantsValide();

    // Charger l'ID du DDP
    fetch(
      "https://backsignup.h-tsoft.com//graphql?query={typeconditions{id,designation}}"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data?.data?.typeconditions) {
          const ddpTerm = data.data.typeconditions.find(
            (term: any) => term.designation.toLowerCase() === "ddp"
          );
          if (ddpTerm) {
            setDdpId(ddpTerm.id);
          }
        }
      })
      .catch(() =>
        console.error("Erreur lors du chargement des termes commerciaux")
      );
  }, []);

  // Données fictives basées sur l'image
  const [Data, setData] = useState<any>({
    stats: {
      dossiers: 3,
      bonsCommande: 2,
      factures: 2,
    },
    currentTender: {
      title: "Acquisition de Matériel de Laboratoire",
      reference: "LAB.2025",
      publishedDate: "10 juillet 2025",
      deadline: "25 Juillet 2025",
      status: "En cours de traitement (2/2)",
    },
    articles: [],
  });

  const [dashboardData, setDashboardData] = useState<{
    documentsAConsulter: Array<{
      id: string;
      designation: string;
      url: string;
      isannexe: number;
    }>;
    documentsFournis: Array<{
      id: string;
      designation: string;
      url: string;
      documentspecification: {
        id: string;
        designation: string;
      }
      isannexe: number;
    }>;
  }>({
    documentsAConsulter: [],
    documentsFournis: [],
  });
  //recupere le tender correspondant

  // Effet pour charger les données réelles si id fourni
  useEffect(() => {
    if (id) {
      // 🆕 Requêtes GraphQL - Base (sans specification) et Enrichie (avec specification)
      const baseQuery = `{soumissions(fournisseur_id:${user?.fournisseur_id},ao_id:${id}){id,ao_id,ao{id,TSSCOD_0_0,targetpricestatus,reference,datecloture,typemarche{id,designation}attachments{id,designation,isannexe,documentspecification{id,designation},url}aoarticles{id,coeff,targetpricestatus,detailda_id,article{id}}},soumissionarticles{id,coeff,delailivraison,devise_id,dureedevie,dateperemption,article{id,designation}quantitedemande,targetprice,datelivraison,quantitepropose,prixunitairepropose,fabricant{id,designation},typecondition_text,typecondition{designation,id},soumissionarticlelots{id,lot,dateperemption,quantite,dureedevie,fabricant_id,conditionnement_id,soumissionarticle_id} detailprixfabricants {id,fabricant_id,prixunitaire,devise_id}}}}`;

      // Requête enrichie avec les specifications (sera active quand le backend sera prêt)
      const enrichedQuery = `{soumissions(fournisseur_id:${user?.fournisseur_id},ao_id:${id}){id,ao_id,ao{id,TSSCOD_0_0,targetpricestatus,reference,datecloture,typemarche{id,designation}attachments{id,designation,isannexe,documentspecification{id,designation},url}aoarticles{id,coeff,targetpricestatus,detailda_id,article{id}}},soumissionarticles{id,coeff,delailivraison,devise_id,dureedevie,dateperemption,article{id,designation}quantitedemande,targetprice,datelivraison,quantitepropose,prixunitairepropose,fabricant{id,designation},typecondition_text,typecondition{designation,id},soumissionarticlelots{id,lot,dateperemption,quantite,dureedevie,fabricant_id,conditionnement_id,soumissionarticle_id} detailprixfabricants {id,fabricant_id,prixunitaire,devise_id,fabricant { id, designation },devise { id, designation, taux }},specificationtech{confirmation_specifications,confirmation_normes,conformite_conditionnement,conformite_conditionnement_ecart,conformite_quantite,conformite_quantite_ecart,conformite_dimensions,conformite_dimensions_ecart,conformite_poids_net,conformite_poids_net_ecart,conformite_conservation,conformite_conservation_ecart,conformite_med_produit,conformite_med_produit_ecart,conformite_med_autorisations,conformite_med_autorisations_ecart,conformite_med_stabilite,conformite_med_stabilite_ecart,conformite_bes_identification,conformite_bes_identification_ecart,conformite_bes_garantie,conformite_bes_garantie_ecart,conformite_bes_technique,conformite_bes_technique_ecart,commentaire_fournisseur,piece_justificative}}}}`;

      // Fonction helper pour mapper les articles
      const mapArticles = (soumission: any, hasSpecification: boolean) => {
        return soumission.soumissionarticles
          ?.map((a: any) => ({
            id: a.id,
            article_id: a.article?.id,
            nom: a.article?.designation,
            prix: a.targetprice,
            targetpricestatus: soumission.ao.aoarticles.find(
              (aoa: any) => aoa.article.id === a.article?.id
            )?.targetpricestatus
              ? soumission.ao.aoarticles.find(
                (aoa: any) => aoa.article.id === a.article?.id
              )?.targetpricestatus
              : 0,
            detailda_id: soumission.ao.aoarticles.find(
              (aoa: any) => aoa.article.id === a.article?.id
            )?.detailda_id || null,
            coeff: a.coeff,
            devise_id: a.devise_id || null, // Devise sélectionnée
            quantiteDemandee: a.quantitedemande,
            quantiteProposee: a.quantitepropose ?? 0,
            prixUnitairePropose: a.prixunitairepropose,
            dateLivraison: a.datelivraison,
            dureeVie: a.dureedevie,
            datePeremption: a.dateperemption,
            delaiLivraison: a.delailivraison,
            fabricant: a.fabricant ?? { id: null, designation: "N/A" },
            typeCondition:
              !a.typecondition_text ||
                a.typecondition_text.toLowerCase() === "ddp"
                ? "DDP"
                : "Autre",
            commentaireTerme:
              !a.typecondition_text ||
                a.typecondition_text.toLowerCase() === "ddp"
                ? ""
                : a.typecondition_text,
            statut: "En cours de traitement",
            sousTotal: 0,
            lots: (a.soumissionarticlelots || []).map((lot: any) => {
              const detailPrix = (a.detailprixfabricants || []).find((dp: any) => dp.fabricant_id === lot.fabricant_id);
              return {
                ...lot,
                prixunitaire: detailPrix ? detailPrix.prixunitaire : 0,
                devise_id: detailPrix ? detailPrix.devise_id : (lot.devise_id || a.devise_id),
              };
            }),
            // 🆕 Passer les détails de prix par fabricant directement
            detailprixfabricants: a.detailprixfabricants || [],
            // Mapper les spécifications techniques fournisseur
            specificationTechnique:
              (hasSpecification && a.specificationtech) ? {
                confirmationSpecifications: a.specificationtech.confirmation_specifications || false,
                confirmationNormes: a.specificationtech.confirmation_normes || false,
                conformiteConditionnement: a.specificationtech.conformite_conditionnement || '',
                conformiteConditionnementEcart: a.specificationtech.conformite_conditionnement_ecart || '',
                conformiteQuantite: a.specificationtech.conformite_quantite || '',
                conformiteQuantiteEcart: a.specificationtech.conformite_quantite_ecart || '',
                conformiteDimensions: a.specificationtech.conformite_dimensions || '',
                conformiteDimensionsEcart: a.specificationtech.conformite_dimensions_ecart || '',
                conformitePoidsNet: a.specificationtech.conformite_poids_net || '',
                conformitePoidsNetEcart: a.specificationtech.conformite_poids_net_ecart || '',
                conformiteConservation: a.specificationtech.conformite_conservation || '',
                conformiteConservationEcart: a.specificationtech.conformite_conservation_ecart || '',
                conformiteMedProduit: a.specificationtech.conformite_med_produit || '',
                conformiteMedProduitEcart: a.specificationtech.conformite_med_produit_ecart || '',
                conformiteMedAutorisations: a.specificationtech.conformite_med_autorisations || '',
                conformiteMedAutorisationsEcart: a.specificationtech.conformite_med_autorisations_ecart || '',
                conformiteMedStabilite: a.specificationtech.conformite_med_stabilite || '',
                conformiteMedStabiliteEcart: a.specificationtech.conformite_med_stabilite_ecart || '',
                conformiteBesIdentification: a.specificationtech.conformite_bes_identification || '',
                conformiteBesIdentificationEcart: a.specificationtech.conformite_bes_identification_ecart || '',
                conformiteBesGarantie: a.specificationtech.conformite_bes_garantie || '',
                conformiteBesGarantieEcart: a.specificationtech.conformite_bes_garantie_ecart || '',
                conformiteBesTechnique: a.specificationtech.conformite_bes_technique || '',
                conformiteBesTechniqueEcart: a.specificationtech.conformite_bes_technique_ecart || '',
                commentaireFournisseur: a.specificationtech.commentaire_fournisseur || '',
                pieceJustificativeUrl: a.specificationtech.piece_justificative
                  ? `${BASE_URL}${a.specificationtech.piece_justificative}`
                  : null,
              } :
                USE_MOCK_SPECIFICATION_DATA ? {
                  // 🧪 MOCK DATA pour test
                  confirmationSpecifications: true,
                  confirmationNormes: true,
                  conformiteConditionnement: 'oui',
                  conformiteConditionnementEcart: '',
                  conformiteQuantite: 'oui',
                  conformiteQuantiteEcart: '',
                  conformiteDimensions: 'non',
                  conformiteDimensionsEcart: '25 x 15 x 10 cm (au lieu de 30 x 20 x 15 cm)',
                  conformitePoidsNet: 'oui',
                  conformitePoidsNetEcart: '',
                  conformiteConservation: 'oui',
                  conformiteConservationEcart: '',
                  conformiteMedProduit: 'oui',
                  conformiteMedProduitEcart: '',
                  conformiteMedAutorisations: 'non',
                  conformiteMedAutorisationsEcart: 'AMM: 2024/001 - Pays: Maroc',
                  conformiteMedStabilite: 'oui',
                  conformiteMedStabiliteEcart: '',
                  conformiteBesIdentification: '',
                  conformiteBesIdentificationEcart: '',
                  conformiteBesGarantie: '',
                  conformiteBesGarantieEcart: '',
                  conformiteBesTechnique: '',
                  conformiteBesTechniqueEcart: '',
                  commentaireFournisseur: 'Produit conforme aux normes européennes CE et ISO 9001.',
                  pieceJustificativeUrl: `${BASE_URL}/storage/documents/exemple_certificat.pdf`,
                } : null,
          }))
          .map((article: any) => {
            const baseTotal = (article.prixUnitairePropose || 0) * (article.quantiteProposee || 0);
            article.sousTotal = article.typeCondition !== "DDP" && article.coeff
              ? baseTotal * article.coeff
              : baseTotal;
            return article;
          }) || [];
      };

      // Fonction helper pour traiter la réponse
      const processSoumission = (soumission: any, hasSpecification: boolean) => {
        setData((prev: any) => ({
          ...prev,
          soumissionId: soumission.id,
          ao_id: soumission.ao_id,
          datecloture: soumission.ao.datecloture,
          targetpricestatus: soumission.ao.targetpricestatus,
          tender: {
            id: soumission.ao.id,
            TSSCOD_0_0: soumission.ao.TSSCOD_0_0,
            reference: soumission.ao.reference,
            typemarche: {
              designation: soumission.ao.typemarche.designation,
              id: soumission.ao.typemarche.id,
            },
            attachements: soumission.ao.attachments,
          },
          articles: mapArticles(soumission, hasSpecification),
        }));

        setDashboardData({
          documentsAConsulter: soumission.ao.attachments.filter(
            (att: { isannexe: number }) => att.isannexe === 0
          ),
          documentsFournis: soumission.ao.attachments.filter(
            (att: { isannexe: number }) => att.isannexe === 1
          ),
        });
      };

      // 🔄 ÉTAPE 1: Récupérer les données de base (toujours fonctionne)
      fetch(`https://backsignup.h-tsoft.com//graphql?query=${baseQuery}`)
        .then((res) => res.json())
        .then((obj) => {
          // console.log("📊 [TableauSuivi] Données de base récupérées :", obj);
          const soumission = obj?.data?.soumissions[0];

          if (soumission) {
        

            // Traiter les données de base
            processSoumission(soumission, false);
            // console.log("✅ [TableauSuivi] Données de base chargées");

            // 🔄 ÉTAPE 2: Tenter de récupérer les données enrichies avec specifications
            fetch(`https://backsignup.h-tsoft.com//graphql?query=${enrichedQuery}`)
              .then((res) => res.json())
              .then((enrichedObj) => {
                // Vérifier si la requête enrichie a réussi (pas d'erreur GraphQL)
                if (enrichedObj?.data?.soumissions?.[0] && !enrichedObj.errors) {
                  // console.log("✅ [TableauSuivi] Données enrichies avec specifications récupérées !");
                  processSoumission(enrichedObj.data.soumissions[0], true);
                } else {
                  //  console.log("ℹ️ [TableauSuivi] Backend pas encore prêt pour les specifications, utilisation des données de base");
                }
              })
              .catch((_error) => {
                // console.log("ℹ️ [TableauSuivi] Requête enrichie échouée (backend pas prêt), données de base conservées:", _error.message);
              });

            // 🆕 Récupérer les documents déjà fournis par l'utilisateur
            // console.log("📄 [TableauSuivi] Récupération des documents fournis pour soumission ID:", soumission.id);

            fetch(
              `https://backsignup.h-tsoft.com//graphql?query={soumissionspecdocuments(soumission_id:${soumission.id}){id,file,attachement_id,ao_id}}`
            )
              .then((res) => res.json())
              .then((docsObj) => {
                // console.log("📄 [TableauSuivi] Documents fournis récupérés:", docsObj);
                if (docsObj?.data?.soumissionspecdocuments) {
                  setDocumentsFournis(
                    // [{
                    //   id: "5",
                    //   file: "document_exemple.pdf",
                    //   attachement_id: "att-001",
                    //   ao_id: "ao-001"
                    // }]
                    docsObj.data.soumissionspecdocuments
                  );
                  // console.log("📄 [TableauSuivi] Documents fournis mis à jour:", docsObj.data.soumissionspecdocuments);
                } else {
                  // console.log("📄 [TableauSuivi] Aucun document fourni trouvé");
                  setDocumentsFournis([]);
                }
              })
              .catch((error) => {
                console.error("❌ [TableauSuivi] Erreur lors de la récupération des documents fournis:", error);
                setDocumentsFournis([]);
              });
          }
        });
    }
  }, [id, user?.fournisseur_id, refreshTrigger]);

  // 🆕 Vérifier la disponibilité de l'API suivimarche
  useEffect(() => {
    if (Data?.soumissionId) {
      // console.log("📊 [TableauSuivi] Vérification disponibilité API suivimarche pour soumission ID:", Data.soumissionId);
      fetch(
        `https://backsignup.h-tsoft.com//graphql?query={suiviemarches(soumission_id:${Data.soumissionId}){id,etat_text,etat_bc,acompte,totalbc,mntacompte,etat,etat_suivi_text,etat_suivi_badge}}`
        // `https://backsignup.h-tsoft.com//graphql?query={suiviemarches(soumission_id:3){id,etat_text,etat_bc,acompte,totalbc,mntacompte,etat,etat_suivi_text,etat_suivi_badge}}`

      )
        .then((res) => res.json())
        .then((data) => {
          const info = data?.data?.suiviemarches?.[0];
          if (info) {
            // console.log("✅ [TableauSuivi] API suivimarche disponible, données:", info);
            setSuivimarcheAvailable(true);
            // Stocker les données complètes de suivimarche
            setSuivimarcheData({
              id: info.id,
              etat: info.etat,
              etat_text: info.etat_text,
              etat_bc: info.etat_bc
            });
            // console.log("📊 [TableauSuivi] État du contrat:", info.etat, "- Clôturé:", Number(info.etat) < 0);
          } else {
            // console.log("⚠️ [TableauSuivi] API suivimarche - Aucune donnée disponible");
            setSuivimarcheAvailable(false);
            setSuivimarcheData(null);
          }
        })
        .catch((_error) => {
          // console.error("❌ [TableauSuivi] Erreur API suivimarche:", _error);
          setSuivimarcheAvailable(false);
          setSuivimarcheData(null);
        });
    }
  }, [Data?.soumissionId]);

  // Données statiques pour l'affichage des bons de commande, groupés par date de livraison
  const staticPurchaseOrdersByDate: Array<
    [
      string,
      Array<{
        id: string | number;
        label: string;
        pdfUrl: string;
        etat: string;
      }>
    ]
  > = [
      [
        "20/09/2025",
        [
          {
            id: "bc-001",
            label: "Bon de commande",
            pdfUrl:
              "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
            etat: "en attente",
          },
        ],
      ],
    ];

  // 🆕 Fonction pour gérer l'upload des documents manquants
  const handleDocumentUpload = (documentId: string, files: File | File[]) => {
    const fileArray = Array.isArray(files) ? files : [files];
    // console.log(`📄 [TableauSuivi] Upload de ${fileArray.length} fichier(s) pour le document ID:`, documentId);

    // Mettre à jour l'état uploadedDocs
    setUploadedDocs(prev => ({
      ...prev,
      [documentId]: fileArray
    }));

    // console.log(`📄 [TableauSuivi] Fichiers ajoutés à uploadedDocs pour ${documentId}:`, fileArray.map(f => f.name));

    showSuccess(
      "Document ajouté",
      `${fileArray.length} fichier(s) prêt(s) à être envoyé(s)`
    );
  };

  // 🆕 Fonction pour supprimer un document (uploadé localement OU déjà sur le serveur)
  const handleDocumentReset = (documentId: string) => {
    // console.log("📄 [TableauSuivi] Suppression du document ID:", documentId);

    // Retirer le document de uploadedDocs (documents uploadés localement)
    setUploadedDocs(prev => {
      const newDocs = { ...prev };
      delete newDocs[documentId];
      return newDocs;
    });

    // Retirer aussi de documentsFournis (documents déjà sur le serveur)
    // Cela permet de réafficher l'upload pour ce document
    setDocumentsFournis(prev =>
      prev.filter(doc => doc.attachement_id !== documentId)
    );

    showSuccess("Document retiré", "Le document a été retiré avec succès");
  };

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

  // const { aos, loading, error } = useAOContext();

  // Données fictives pour les documents de la vue global

  // Fonction pour soumettre à nouveau
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation des termes commerciaux
    for (const article of Data.articles) {
      if (
        article.typeCondition !== "DDP" &&
        article.typeCondition &&
        !article.commentaireTerme?.trim()
      ) {
        showError(
          "Validation échouée",
          `Un commentaire est obligatoire pour le terme commercial "Autre" du produit: ${article.nom}`
        );
        return;
      }
    }

    console.log("📤 [TableauSuivi] Construction du payload de mise à jour - Start");
    console.log("📤 Articles data:", Data.articles);
    console.log("📤 Uploaded docs:", uploadedDocs);

    // Construction du payload pour l'API
    const soumissionarticles = Data.articles.map((article: any) => {
      console.log(`📤 Processing article ${article.article_id}:`, article);

      const articlePayload: any = {
        article_id: article.article_id,
        prixunitairepropose: article.prixUnitairePropose || 0,
        quantitepropose: article.quantiteProposee || 0,
        devise_id: article.devise_id || null, // ID de la devise sélectionnée
        datelivraison: article.dateLivraison || null,
        delailivraison: article.delaiLivraisonData?.total ?? article.delaiLivraison ?? null,
        dureedevie: article.dureeVie || null,
        dateperemption: article.datePeremption || null,

        fabricant_id:
          typeof article.fabricant === "object" ? article.fabricant.id : null,
      };

      // Logique pour les termes commerciaux - même que soumissionAO
      if (article.typeCondition === "DDP" && ddpId) {
        articlePayload.typecondition_id = ddpId;
        console.log(`📤 Article ${article.article_id} - Terme DDP (ID: ${ddpId})`);
      } else if (
        article.typeCondition === "Autre" &&
        article.commentaireTerme
      ) {
        articlePayload.typecondition_texte = article.commentaireTerme;
        console.log(`📤 Article ${article.article_id} - Terme Autre: ${article.commentaireTerme}`);
      }

      // 🆕 AJOUT DE LA GESTION DES LOTS
      if (article.lots && article.lots.length > 0) {
        console.log(`📤 Article ${article.article_id} - Lots trouvés:`, article.lots);

        articlePayload.lots = article.lots.map((lot: any) => ({
          lot: lot.lot || `L${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Nom du lot
          dateperemption: lot.dateperemption || null,
          quantite: lot.quantite || 0,
          prixunitaire: lot.prixunitaire || 0,
          dureedevie: lot.dureedevie || null,
          fabricant_id: lot.fabricant_id || articlePayload.fabricant_id || null,
          conditionnement_id: lot.conditionnement_id || null,
          devise_id: lot.devise_id || articlePayload.devise_id || null
        }));

        console.log(`📤 Article ${article.article_id} - Lots formatés:`, articlePayload.lots);
      } else {
        console.log(`📤 Article ${article.article_id} - Aucun lot`);
        articlePayload.lots = [];
      }

      articlePayload.detailprixfabricants = Array.isArray(article.detailprixfabricants)
        ? article.detailprixfabricants
        : [];

      // 🆕 AJOUT DE LA GESTION DES SPÉCIFICATIONS TECHNIQUES
      if (article.specificationTechnique) {
        const spec = typeof article.specificationTechnique === 'string'
          ? JSON.parse(article.specificationTechnique)
          : article.specificationTechnique;
        console.log(`📤 Article ${article.article_id} - Specification trouvée:`, spec);

        articlePayload.specification = {
          // Confirmations obligatoires
          confirmation_specifications: spec.confirmationSpecifications || false,
          confirmation_normes: spec.confirmationNormes || false,
          // Conformité générale
          conformite_conditionnement: spec.conformiteConditionnement || '',
          conformite_conditionnement_ecart: spec.conformiteConditionnementEcart || null,
          conformite_quantite: spec.conformiteQuantite || '',
          conformite_quantite_ecart: spec.conformiteQuantiteEcart || null,
          conformite_dimensions: spec.conformiteDimensions || '',
          conformite_dimensions_ecart: spec.conformiteDimensionsEcart || null,
          conformite_poids_net: spec.conformitePoidsNet || '',
          conformite_poids_net_ecart: spec.conformitePoidsNetEcart || null,
          conformite_conservation: spec.conformiteConservation || '',
          conformite_conservation_ecart: spec.conformiteConservationEcart || null,
          // Champs MED (Médicaments)
          conformite_med_produit: spec.conformiteMedProduit || '',
          conformite_med_produit_ecart: spec.conformiteMedProduitEcart || null,
          conformite_med_autorisations: spec.conformiteMedAutorisations || '',
          conformite_med_autorisations_ecart: spec.conformiteMedAutorisationsEcart || null,
          conformite_med_stabilite: spec.conformiteMedStabilite || '',
          conformite_med_stabilite_ecart: spec.conformiteMedStabiliteEcart || null,
          // Champs BES (Équipements)
          conformite_bes_identification: spec.conformiteBesIdentification || '',
          conformite_bes_identification_ecart: spec.conformiteBesIdentificationEcart || null,
          conformite_bes_garantie: spec.conformiteBesGarantie || '',
          conformite_bes_garantie_ecart: spec.conformiteBesGarantieEcart || null,
          conformite_bes_technique: spec.conformiteBesTechnique || '',
          conformite_bes_technique_ecart: spec.conformiteBesTechniqueEcart || null,
          // Commentaire et fichier
          commentaire_fournisseur: spec.commentaireFournisseur || '',
          piece_justificative: spec.pieceJustificative || null,
        };
        console.log(`📤 Article ${article.article_id} - Spec formatée:`, articlePayload.specification);
      } else {
        console.log(`📤 Article ${article.article_id} - Aucune specification`);
      }

      console.log(`📤 Article ${article.article_id} - Payload final:`, articlePayload);
      return articlePayload;
    });

    // 🆕 Construction des specdocuments au format simplifié
    const specdocuments: Array<{ attachement_id: number; file: File }> = [];
    Object.entries(uploadedDocs).forEach(([docId, files]) => {
      if (files && files.length > 0) {
        files.forEach((file) => {
          specdocuments.push({
            attachement_id: Number(docId),
            file: file
          });
        });
      }
    });

    console.log("📄 Specdocuments construits:", specdocuments.map(s => ({
      attachement_id: s.attachement_id,
      fileName: s.file.name
    })));

    // Construction du FormData
    const formData = new FormData();
    formData.append("id", String(Data.soumissionId)); // ID de la soumission à modifier
    formData.append("ao_id", String(Data.ao_id));
    formData.append("fournisseur_id", String(user?.fournisseur_id));
    formData.append("date", new Date().toISOString().slice(0, 19).replace("T", " "));

    // Ajout des articles au FormData
    soumissionarticles.forEach((article: any, idx: number) => {
      formData.append(`soumissionarticles[${idx}][article_id]`, String(article.article_id));
      formData.append(`soumissionarticles[${idx}][prixunitairepropose]`, String(article.prixunitairepropose));
      formData.append(`soumissionarticles[${idx}][quantitepropose]`, String(article.quantitepropose));
      formData.append(`soumissionarticles[${idx}][datelivraison]`, article.datelivraison || "");
      formData.append(`soumissionarticles[${idx}][delailivraison]`, article.delailivraison || "");
      formData.append(`soumissionarticles[${idx}][dureedevie]`, article.dureedevie || "");
      formData.append(`soumissionarticles[${idx}][dateperemption]`, article.dateperemption || "");

      if (article.fabricant_id) formData.append(`soumissionarticles[${idx}][fabricant_id]`, String(article.fabricant_id));
      if (article.devise_id) formData.append(`soumissionarticles[${idx}][devise_id]`, String(article.devise_id));
      if (article.typecondition_id) formData.append(`soumissionarticles[${idx}][typecondition_id]`, String(article.typecondition_id));
      if (article.typecondition_texte) formData.append(`soumissionarticles[${idx}][typecondition_texte]`, article.typecondition_texte);

      // Ajout des lots
      if (article.lots) {
        article.lots.forEach((lot: any, lotIdx: number) => {
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][lot]`, lot.lot);
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][dateperemption]`, lot.dateperemption || "");
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][quantite]`, String(lot.quantite));
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][prixunitaire]`, String(lot.prixunitaire));
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][dureedevie]`, lot.dureedevie || "");
          if (lot.fabricant_id) formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][fabricant_id]`, String(lot.fabricant_id));
          if (lot.conditionnement_id) formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][conditionnement_id]`, String(lot.conditionnement_id));
          if (lot.devise_id) formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][devise_id]`, String(lot.devise_id));
        });
      }

      const detailPrixMap = new Map<string, { prixunitaire: number; devise_id?: number | null }>();

      if (Array.isArray(article.detailprixfabricants)) {
        article.detailprixfabricants.forEach((detail: any) => {
          const fabricantId = detail?.fabricant_id ?? detail?.fabricant?.id;
          const prixunitaire = detail?.prixunitaire ?? detail?.prixUnitaire;
          if (fabricantId === undefined || fabricantId === null || prixunitaire === undefined || prixunitaire === null) return;
          const deviseId = detail?.devise_id ?? detail?.devise?.id ?? article.devise_id ?? null;
          detailPrixMap.set(String(fabricantId), { prixunitaire, devise_id: deviseId });
        });
      }

      if (article.lots) {
        article.lots.forEach((lot: any) => {
          if (!lot.fabricant_id || lot.prixunitaire === undefined || lot.prixunitaire === null) return;
          const key = String(lot.fabricant_id);
          if (!detailPrixMap.has(key)) {
            detailPrixMap.set(key, { prixunitaire: lot.prixunitaire, devise_id: lot.devise_id || article.devise_id });
          }
        });
      }

      let dIdx = 0;
      detailPrixMap.forEach((details: any, fabricant_id) => {
        formData.append(`soumissionarticles[${idx}][detailprixfabricants][${dIdx}][fabricant_id]`, String(fabricant_id));
        formData.append(`soumissionarticles[${idx}][detailprixfabricants][${dIdx}][prixunitaire]`, String(details.prixunitaire));
        if (details.devise_id) {
          formData.append(`soumissionarticles[${idx}][detailprixfabricants][${dIdx}][devise_id]`, String(details.devise_id));
        }
        dIdx++;
      });

      // 🆕 Ajout des spécifications techniques (conformité) par article
      if (article.specification) {
        const spec = article.specification;
        // Confirmations obligatoires
        formData.append(`soumissionarticles[${idx}][specification][confirmation_specifications]`, String(spec.confirmation_specifications));
        formData.append(`soumissionarticles[${idx}][specification][confirmation_normes]`, String(spec.confirmation_normes));
        // Conformité générale
        formData.append(`soumissionarticles[${idx}][specification][conformite_conditionnement]`, spec.conformite_conditionnement || "");
        if (spec.conformite_conditionnement_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_conditionnement_ecart]`, spec.conformite_conditionnement_ecart);
        formData.append(`soumissionarticles[${idx}][specification][conformite_quantite]`, spec.conformite_quantite || "");
        if (spec.conformite_quantite_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_quantite_ecart]`, spec.conformite_quantite_ecart);
        formData.append(`soumissionarticles[${idx}][specification][conformite_dimensions]`, spec.conformite_dimensions || "");
        if (spec.conformite_dimensions_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_dimensions_ecart]`, spec.conformite_dimensions_ecart);
        formData.append(`soumissionarticles[${idx}][specification][conformite_poids_net]`, spec.conformite_poids_net || "");
        if (spec.conformite_poids_net_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_poids_net_ecart]`, spec.conformite_poids_net_ecart);
        formData.append(`soumissionarticles[${idx}][specification][conformite_conservation]`, spec.conformite_conservation || "");
        if (spec.conformite_conservation_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_conservation_ecart]`, spec.conformite_conservation_ecart);
        // Champs MED (Médicaments)
        if (spec.conformite_med_produit) {
          formData.append(`soumissionarticles[${idx}][specification][conformite_med_produit]`, spec.conformite_med_produit);
          if (spec.conformite_med_produit_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_med_produit_ecart]`, spec.conformite_med_produit_ecart);
        }
        if (spec.conformite_med_autorisations) {
          formData.append(`soumissionarticles[${idx}][specification][conformite_med_autorisations]`, spec.conformite_med_autorisations);
          if (spec.conformite_med_autorisations_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_med_autorisations_ecart]`, spec.conformite_med_autorisations_ecart);
        }
        if (spec.conformite_med_stabilite) {
          formData.append(`soumissionarticles[${idx}][specification][conformite_med_stabilite]`, spec.conformite_med_stabilite);
          if (spec.conformite_med_stabilite_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_med_stabilite_ecart]`, spec.conformite_med_stabilite_ecart);
        }
        // Champs BES (Équipements)
        if (spec.conformite_bes_identification) {
          formData.append(`soumissionarticles[${idx}][specification][conformite_bes_identification]`, spec.conformite_bes_identification);
          if (spec.conformite_bes_identification_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_bes_identification_ecart]`, spec.conformite_bes_identification_ecart);
        }
        if (spec.conformite_bes_garantie) {
          formData.append(`soumissionarticles[${idx}][specification][conformite_bes_garantie]`, spec.conformite_bes_garantie);
          if (spec.conformite_bes_garantie_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_bes_garantie_ecart]`, spec.conformite_bes_garantie_ecart);
        }
        if (spec.conformite_bes_technique) {
          formData.append(`soumissionarticles[${idx}][specification][conformite_bes_technique]`, spec.conformite_bes_technique);
          if (spec.conformite_bes_technique_ecart) formData.append(`soumissionarticles[${idx}][specification][conformite_bes_technique_ecart]`, spec.conformite_bes_technique_ecart);
        }
        // Commentaire fournisseur
        if (spec.commentaire_fournisseur) formData.append(`soumissionarticles[${idx}][specification][commentaire_fournisseur]`, spec.commentaire_fournisseur);
        // Pièce justificative (fichier)
        if (spec.piece_justificative) {
          // Vérifier que c'est bien un objet File
          if (spec.piece_justificative instanceof File) {
            formData.append(`soumissionarticles[${idx}][specification][piece_justificative]`, spec.piece_justificative);
            console.log(`📦 [FormData] piece_justificative ajoutée pour article ${idx}:`, spec.piece_justificative.name);
          } else {
            console.warn(`⚠️ [FormData] piece_justificative n'est pas un File pour article ${idx}:`, typeof spec.piece_justificative);
          }
        }
      }
    });

    // 🆕 Ajout des specdocuments au FormData
    specdocuments.forEach((specDoc, idx) => {
      formData.append(`specdocuments[${idx}][attachement_id]`, String(specDoc.attachement_id));
      formData.append(`specdocuments[${idx}][file]`, specDoc.file);
    });

    console.log("📤 [TableauSuivi] FormData construit, contenu:");
    for (const pair of formData.entries()) {
      if (pair[1] instanceof File) {
        console.log(`${pair[0]}: [File] ${(pair[1] as File).name}`);
      } else {
        console.log(`${pair[0]}: ${pair[1]}`);
      }
    }

    console.log("📤 [TableauSuivi] Envoi du FormData de mise à jour...");

    return new Promise<void>((resolve, reject) => {
      updateSoumissionFormData.mutate(formData, {
        onSuccess: (_result: any) => {
          // console.log("✅ [TableauSuivi] Mise à jour réussie!");
          // console.log("✅ Réponse API:", result);
          // console.log("✅ Documents uploadés:", specdocuments.length, "specdocument(s)");

          showSuccess(
            "Mise à jour réussie !",
            "Votre soumission a été mise à jour avec succès. Les modifications et documents ont été enregistrés."
          );

          // Réinitialiser les documents uploadés après succès
          setUploadedDocs({});

          // 🆕 Déclencher un refresh des données pour récupérer les documents mis à jour
          setRefreshTrigger(prev => prev + 1);
          
          resolve();
        },
        onError: (err: any) => {
          console.error("❌ [TableauSuivi] Erreur lors de la mise à jour:");
          console.error("❌ Erreur complète:", err);
          console.error("❌ Message:", err?.message);
          console.error("❌ Response data:", err?.response?.data);
          console.error("❌ Status:", err?.response?.status);

          showError("Erreur de mise à jour", err);
          
          reject(err);
        },
      });
    });
  };

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
              Tableau de suivi
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
              }}
            > Ref : {Data?.tender?.reference || "N/A"}
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
              {Data?.tender?.typemarche?.designation || "N/A"}
            </span>
          </div>
        </div>

        <hr style={{ margin: "10px 0 18px 0" }} />

        {/* Navigation Tabs */}
        <div style={{ ...tabStyles.container, justifyContent: "left" }}>
          {/* Afficher tous les onglets ou seulement "Vue globale" et "AMM / Préqualification" si l'API suivimarche n'est pas disponible */}
          {(suivimarcheAvailable === true
            ? ["Vue globale", "AMM / Préqualification", "Bon de commande", "livraisons", "factures"]
            : ["Vue globale", "AMM / Préqualification"]
          )
            .filter(tab => !(tab === "AMM / Préqualification" && Data?.tender?.TSSCOD_0_0 === "BES"))
            .map((tab) => (
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

        {/* Affichage conditionnel selon le tab sélectionné */}
        {activeTab === "Vue globale" && (
          <>
            <VueGlobale
              Data={Data}
              setData={setData}
              dashboardData={dashboardData}
              fournisseurs={fournisseurs}
              loadingFabricants={loadingFabricants}
              errorFabricants={typeof errorFabricants === 'string' ? errorFabricants : null}
              devises={devises}
              loadingDevises={loadingDevises}
              handleSubmit={handleSubmit}
              documentsFournis={documentsFournis}
              uploadedDocs={uploadedDocs}
              onDocumentUpload={handleDocumentUpload}
              onDocumentReset={handleDocumentReset}
              isContratCloture={suivimarcheData ? suivimarcheData.etat < 0 : false}
            />
          </>
        )}

        {activeTab === "Bon de commande" && (
          <BonDeCommande
            staticPurchaseOrdersByDate={staticPurchaseOrdersByDate}
            Data={Data}
            fournisseur={fournisseur || undefined}
          />
        )}

        {activeTab === "AMM / Préqualification" && (
          <AMMPrequalification Data={Data} />
        )}

        {activeTab === "livraisons" && <Livraisons />}

        {activeTab === "factures" && <Factures />}
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

export default TableauSuivi;
