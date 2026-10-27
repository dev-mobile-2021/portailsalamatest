import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import back_btn from "../assets/images/back_btn.png";
import SmallHeader from "../components/const/SmallHeader";
import ArticlesTab from "../components/tabs/ArticlesTabAO";
import DocumentsTab from "../components/tabs/DocumentsTabAO";
import InternationalTab, { validateInternationalForm } from "../components/tabs/InternationalTabAO";

import { useAOContext } from "../context/AOContext";
import { useCrud } from "../hooks/useCrud";
import { useAuthContext } from "../hooks/useUserhook";
import NotificationPopup from "../components/ui/NotificationPopup";
import { useNotification } from "../hooks/useNotification";
import SpecificationTechnniquesTab from "../components/tabs/SpecificationTechnniquesTabAO";
import useDevises from "../hooks/useDevises";
import useFabricants from "../hooks/useFabricants";

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

const FormulaireSoumission = () => {

// Hook pour les devises
  const { devises } = useDevises();

  // Hook pour les fabricants
  const { 
    fabricantsValides: fabricant, 
    loading: loadingFabricants, 
    error: errorFabricant, 
    fetchFabricantsValide 
  } = useFabricants();

  // Liste des termes commerciaux et ID du DDP
  const [ddpId, setDdpId] = useState<number | null>(null);



  // Hook pour les notifications
  const { notification, showSuccess, showError, hideNotification } =
    useNotification();

  useEffect(() => {
    // Charger les fabricants valides via le hook (utilise le cache)
    fetchFabricantsValide();

    // Charger les termes commerciaux pour récupérer l'ID du DDP
    fetch(
      "https://backsignup.h-tsoft.com/graphql?query={typeconditions{id,designation}}"
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
  }, [fetchFabricantsValide]);

  const { id } = useParams<{ id: string }>();
  const { aos, loading, error } = useAOContext();
  const tender = aos.find((t) => t.id === id);
  const [activeTab, setActiveTab] = useState<"Documents" | "Articles " | "International" | "techniques">("Articles ");
  
  const navigate = useNavigate();

  const [form, setForm] = useState<{
    produits: Record<
      number,
      {
        id: number;
        quantiteDisponible: number;
        prixUnitaire?: number;
        detailprixfabricants: { fabricant_id: number; prixunitaire: number; devise_id?: number }[];
        devise_id?: number; // ID de la devise sélectionnée
        commentaire: string;
        datelivraison: string;
        delailivraison?: string;
        delaiLivraison?: any; // Nouveau format ventilé: { production, acheminement, dedouanement, total }
        dureedevie?: string;
        dateperemption?: string;
        coeff: number | null;
        termeCommercial: "DDP" | "Autre" | "";
        fabricant_id?: number;
        lots?: any[]; // Ajout de la propriété lots
        specification?: any; // Données de conformité des spécifications techniques
      }
    >;
    termeCommercial: "DDP" | "Autre" | "";
    commentaireTerme: string;
    transitaire: string;
    cabinetExpertise: string;
    fichier?: File | null;
    international?: any;
  }>({
    produits: {},
    termeCommercial: "DDP",
    commentaireTerme: "",
    transitaire: "",
    cabinetExpertise: "",
    fichier: null,
    international: undefined,
  });

  
  const { user,fournisseur } = useAuthContext(); 
  // Hook pour la soumission - Utilisation de useCreateFormData pour gérer les fichiers
  const { useCreateFormData } = useCrud<any>("api/soumission", "soumission");
  const createSoumissionFormData = useCreateFormData();

  // Initialiser tous les produits avec DDP dès que tender est disponible
  useEffect(() => {
    // Variable soumissionData à déclarer selon votre logique d'API (ex: const { data: soumissionData } = useQuery(...))
    // On simule pour l'instant un fallback sécurisé si absent du fichier actuel
    const soumissionData: any = null; 

    if (tender?.aoarticles) {
      const initialProduits: typeof form.produits = {};
      tender.aoarticles.forEach((article) => {
        initialProduits[Number(article.article.id)] = {
          id: Number(article.article.id),
          quantiteDisponible: 0,
          prixUnitaire: 0,
          detailprixfabricants: [],
          commentaire: "",
          datelivraison: "",
          delailivraison: "",
          dureedevie: "",
          dateperemption: "",
          coeff: article.coeff || null,
          termeCommercial: "DDP", // Initialiser avec DDP
          lots: [],
        };
      });

      if (soumissionData?.soumissionarticles) {
        soumissionData.soumissionarticles.forEach((sArticle: any) => {
          const articleId = Number(sArticle.article?.id || sArticle.article_id);
          if (initialProduits[articleId]) {
            initialProduits[articleId] = {
              ...initialProduits[articleId],
              quantiteDisponible: Number(sArticle.quantitepropose) || 0,
              prixUnitaire: Number(sArticle.prixunitairepropose) || 0,
              detailprixfabricants: (sArticle.detailprixfabricants || []).map((dp: any) => ({
                fabricant_id: Number(dp.fabricant_id),
                prixunitaire: Number(dp.prixunitaire),
                devise_id: dp.devise_id ? Number(dp.devise_id) : undefined,
              })),
              lots: (sArticle.soumissionarticlelots || []).map((lot: any) => ({
                lot: lot.lot,
                quantite: Number(lot.quantite),
                fabricant_id: Number(lot.fabricant?.id || lot.fabricant_id),
                dateperemption: lot.dateperemption || "",
                dureedevie: lot.dureedevie || "",
                conditionnement_id: lot.conditionnement_id || "",
                devise_id: lot.devise_id ? Number(lot.devise_id) : undefined,
              })),
              datelivraison: sArticle.datelivraison || "",
              termeCommercial: sArticle.typecondition?.designation === "DDP" ? "DDP" : "Autre",
              devise_id: sArticle.devise_id ? Number(sArticle.devise_id) : undefined,
            };
          }
        });
      }

      setForm((prev) => ({
        ...prev,
        produits: initialProduits,
      }));
    }
  }, [tender]);

  // Ajout de l'état pour les documents uploadés (Documents tab) - stocker les fichiers
  const [uploadedDocs, setUploadedDocs] = useState<Record<string, File[]>>({});
  
  // État pour le loader de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Ajout de l'état pour les fichiers de spécifications techniques
  // const [specDocs, setSpecDocs] = useState<Record<number, File[]>>({});

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="text-danger">Erreur : {error}</div>;
  if (!tender) {
    return (
      <div className="container mt-5 text-danger">
        Appel d'offre introuvable
      </div>
    );
  }

  const handlePrixFabricantChange = (
    produitId: number,
    fabricantId: number,
    prixunitaire: number,
    devise_id?: number
  ) => {
    setForm((prev) => {
      const prevProduit = prev.produits[produitId];
      if (!prevProduit) return prev;
      const detailprixfabricants = [...(prevProduit.detailprixfabricants || [])];
      const index = detailprixfabricants.findIndex(
        (d) => String(d.fabricant_id) === String(fabricantId)
      );
      if (index !== -1) {
        detailprixfabricants[index] = {
          ...detailprixfabricants[index],
          prixunitaire,
          devise_id: devise_id !== undefined ? devise_id : detailprixfabricants[index].devise_id,
        };
      } else {
        detailprixfabricants.push({ fabricant_id: fabricantId, prixunitaire, devise_id });
      }
      return {
        ...prev,
        produits: {
          ...prev.produits,
          [produitId]: { ...prevProduit, detailprixfabricants },
        },
      };
    });
  };

  const handleProduitChange = (
    produitId: number,
    field: string,
    value: string | number | null
  ) => {
    
    setForm((prev) => {
      const newForm = {
        ...prev,
        produits: {
          ...prev.produits,
          [produitId]: {
            ...prev.produits[produitId],
            [field]: value,
          },
        },
      };
      
      
      return newForm;
    });
  };

  const handleProduitTermeChange = (
    produitId: number,
    terme: "DDP" | "Autre"
  ) => {
    setForm((prev) => ({
      ...prev,
      produits: {
        ...prev.produits,
        [produitId]: {
          ...prev.produits[produitId],
          termeCommercial: terme,
          // Réinitialiser le commentaire si on passe à DDP
          commentaire:
            terme === "DDP" ? "" : prev.produits[produitId]?.commentaire || "",
        },
      },
    }));
  };

  // Handler pour changer la devise d'un article et propager à ses lots
  const handleDeviseChange = (produitId: number, devise_id: number) => {
    setForm(prev => {
      const produit = prev.produits[produitId];
      if (!produit) return prev;
      return {
        ...prev,
        produits: {
          ...prev.produits,
          [produitId]: {
            ...produit,
            devise_id,
            detailprixfabricants: (produit.detailprixfabricants || []).map(d => ({
              ...d, devise_id
            })),
          }
        }
      };
    });
  };

  // Handler pour ajouter un lot vide
  const handleAddLot = (produitId: number) => {
    setForm(prev => {
      const produit = prev.produits[produitId];
      if (!produit) return prev;
      const lots = [...(produit.lots || [])];
      lots.push({
        lot: `L${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        quantite: 0,
        fabricant_id: undefined,
        dateperemption: '',
        dureedevie: '',
        conditionnement_id: undefined,
        devise_id: produit.devise_id,
      });
      return {
        ...prev,
        produits: {
          ...prev.produits,
          [produitId]: { ...produit, lots }
        }
      };
    });
  };

  // Handler pour supprimer un lot
  const handleDeleteLot = (produitId: number, lotIndex: number) => {
    setForm(prev => {
      const produit = prev.produits[produitId];
      if (!produit) return prev;
      const lots = (produit.lots || []).filter((_: any, i: number) => i !== lotIndex);
      return {
        ...prev,
        produits: {
          ...prev.produits,
          [produitId]: { ...produit, lots }
        }
      };
    });
  };

  // Handler pour modifier un champ d'un lot
  const handleLotChange = (
    produitId: number,
    lotIndex: number,
    field: string,
    value: any
  ) => {
    setForm(prev => {
      const produit = prev.produits[produitId];
      if (!produit) return prev;
      const lots = [...(produit.lots || [])];
      lots[lotIndex] = { ...lots[lotIndex], [field]: value };
      return {
        ...prev,
        produits: {
          ...prev.produits,
          [produitId]: { ...produit, lots }
        }
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (form.termeCommercial === "Autre" && !form.commentaireTerme.trim()) {
      showError(
        "Validation échouée",
        "Un commentaire est obligatoire pour le terme commercial Autre"
      );
      return;
    }

    for (const [produitId, data] of Object.entries(form.produits)) {
      if (data.termeCommercial === "Autre" && !data.commentaire.trim()) {
        const produit = tender.aoarticles.find((p) => p.id === produitId);
        showError(
          "Validation échouée",
          `Un commentaire est obligatoire pour le terme commercial "Autre" du produit: ${produit?.article.designation}`
        );
        return;
      }
    }

    if (
      tender.typemarche.designation === "International" &&
      form.termeCommercial === "Autre" &&
      !form.transitaire
    ) {
      showError(
        "Sélection requise",
        "La sélection d'un transitaire est obligatoire pour les termes Autre"
      );
      return;
    }

    if (
      tender.typemarche.designation === "International" &&
      !form.cabinetExpertise
    ) {
      showError(
        "Sélection requise",
        "La sélection d'un cabinet d'expertise est obligatoire"
      );
      return;
    }

    // Validation spécifique pour les marchés internationaux
    if (tender.typemarche.designation === "International" && form.international) {
      const isTransitaireRequired = form.termeCommercial !== "DDP";
      const internationalErrors = validateInternationalForm(form.international, isTransitaireRequired);
      
      if (Object.keys(internationalErrors).length > 0) {
        const firstError = Object.values(internationalErrors)[0];
        showError(
          "Validation échouée - Section International",
          firstError
        );
        return;
      }
    }


    // console.log("🚀 SpecDocs state:", specDocs);
    
    // Construction du payload pour l'API
    const soumissionarticles = Object.entries(form.produits).map(
      ([produitId, data]) => {
        // console.log(`\n📦 [Article ${produitId}] Processing article...`);
        // console.log(`📦 Article data:`, data);
        
        // Parser le délai de livraison ventilé si présent
        let delaiLivraisonData = null;
        if (data.delaiLivraison) {
          try {
            delaiLivraisonData = typeof data.delaiLivraison === 'string' 
              ? JSON.parse(data.delaiLivraison) 
              : data.delaiLivraison;
          } catch {
            // console.log(`📦 Could not parse delaiLivraison for article ${produitId}`);
          }
        }
        
        const article: any = {
          article_id: Number(produitId),
          prixunitairepropose: 0, // Fallback mis à 0 selon la documentation technique
          detailprixfabricants: data.detailprixfabricants || [],
          quantitepropose: data.quantiteDisponible || 0,
          devise_id: data.devise_id || null, // ID de la devise sélectionnée
          datelivraison: data.datelivraison || null,
          // Délai de livraison ventilé
          delai_production: delaiLivraisonData?.production || null,
          delai_acheminement: delaiLivraisonData?.acheminement || null,
          delai_dedouanement: delaiLivraisonData?.dedouanement || null,
          delai_total: delaiLivraisonData?.total || null,
          // Ancien format pour rétrocompatibilité (valeur totale en string si disponible)
          delailivraison: delaiLivraisonData ? String(delaiLivraisonData.total) : (data.delailivraison || null),
        };

        // Logique pour les termes commerciaux
        if (data.termeCommercial === "DDP" && ddpId) {
          article.typecondition_id = ddpId;
          // console.log(`📦 Terme commercial DDP - ID:`, ddpId);
        } else if (data.termeCommercial === "Autre" && data.commentaire) {
          article.typecondition_texte = data.commentaire;
          // console.log(`📦 Terme commercial Autre - Commentaire:`, data.commentaire);
        }

        // Ajouter le commentaire des spécifications techniques
        if (data.commentaire) {
          article.spec_comment = data.commentaire;
          // console.log(`📦 Spec comment:`, data.commentaire);
        }

        // Ajouter les documents des spécifications techniques
        // const produitSpecDocs = specDocs[Number(produitId)] || [];
        // console.log(`📦 Spec docs for article ${produitId}:`, produitSpecDocs.map(f => ({ name: f.name, size: f.size })));
        
        /* article.soumissionspecdocuments = produitSpecDocs.map((file, index) => ({
          attachement_id: index + 1, // ID temporaire, à adapter selon votre logique
          file: file
        }));
        console.log(`📦 Formatted soumissionspecdocuments:`, article.soumissionspecdocuments.map((doc: any) => ({ 
          attachement_id: doc.attachement_id, 
          fileName: doc.file.name 
        }))); */

        // Gestion des lots selon le nouveau format
        if (data.lots) {
          const lots = typeof data.lots === 'string' ? JSON.parse(data.lots) : data.lots;
          // console.log(`📦 Raw lots data:`, lots);
          
          article.lots = lots.map((lot: any) => ({
            lot: lot.lot || `L${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
            dateperemption: lot.dateperemption || null,
            quantite: lot.quantite || 0,
            dureedevie: lot.dureedevie || null,
            fabricant_id: lot.fabricant_id || data.fabricant_id || null,
            conditionnement_id: lot.conditionnement_id || null,
            devise_id: lot.devise_id || data.devise_id || null
          }));
          // console.log(`📦 Formatted lots:`, article.lots);
        } else {
          // console.log(`📦 No lots data for article ${produitId}`);
        }

        // Gestion des spécifications techniques (conformité)
        if (data.specification) {
          const spec = typeof data.specification === 'string' 
            ? JSON.parse(data.specification) 
            : data.specification;
          // console.log(`📦 Raw specification data:`, spec);
          
          article.specification = {
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
          // console.log(`📦 Formatted specification:`, article.specification);
        } else {
          // console.log(`📦 No specification data for article ${produitId}`);
        }

        // console.log(`📦 Final article payload:`, article);
        return article;
      }
    );

    // console.log("🚀 Final soumissionarticles:", soumissionarticles);

    // Construction du FormData
    const formData = new FormData();
    formData.append("ao_id", tender.id);
    formData.append("fournisseur_id", user?.fournisseur_id);
    formData.append("date", new Date().toISOString().slice(0, 19).replace("T", " "));

    // Ajout des articles
    soumissionarticles.forEach((article, idx) => {
      formData.append(`soumissionarticles[${idx}][article_id]`, String(article.article_id));
      
      if (article.detailprixfabricants) {
        article.detailprixfabricants.forEach((detail: any, dIdx: number) => {
          formData.append(`soumissionarticles[${idx}][detailprixfabricants][${dIdx}][fabricant_id]`, String(detail.fabricant_id));
          formData.append(`soumissionarticles[${idx}][detailprixfabricants][${dIdx}][prixunitaire]`, String(detail.prixunitaire));
          if (detail.devise_id) {
            formData.append(`soumissionarticles[${idx}][detailprixfabricants][${dIdx}][devise_id]`, String(detail.devise_id));
          }
        });
      }

      formData.append(`soumissionarticles[${idx}][prixunitairepropose]`, "0");
      formData.append(`soumissionarticles[${idx}][quantitepropose]`, String(article.quantitepropose));
      formData.append(`soumissionarticles[${idx}][datelivraison]`, article.datelivraison || "");
      formData.append(`soumissionarticles[${idx}][delailivraison]`, article.delailivraison || "");
      // Devise
      if (article.devise_id) formData.append(`soumissionarticles[${idx}][devise_id]`, String(article.devise_id));
      // Délai de livraison ventilé
      if (article.delai_production !== null) formData.append(`soumissionarticles[${idx}][delai_production]`, String(article.delai_production));
      if (article.delai_acheminement !== null) formData.append(`soumissionarticles[${idx}][delai_acheminement]`, String(article.delai_acheminement));
      if (article.delai_dedouanement !== null) formData.append(`soumissionarticles[${idx}][delai_dedouanement]`, String(article.delai_dedouanement));
      if (article.delai_total !== null) formData.append(`soumissionarticles[${idx}][delai_total]`, String(article.delai_total));
      if (article.typecondition_id) formData.append(`soumissionarticles[${idx}][typecondition_id]`, String(article.typecondition_id));
      if (article.typecondition_texte) formData.append(`soumissionarticles[${idx}][typecondition_texte]`, article.typecondition_texte);
      if (article.spec_comment) formData.append(`soumissionarticles[${idx}][spec_comment]`, article.spec_comment);
      // Ajout des fichiers de spécifications techniques
      if (article.soumissionspecdocuments) {
        article.soumissionspecdocuments.forEach((doc: any, docIdx: number) => {
          if (doc.file) {
             formData.append(`soumissionarticles[${idx}][soumissionspecdocuments][${docIdx}][file]`, doc.file); 
             formData.append(`soumissionarticles[${idx}][soumissionspecdocuments][${docIdx}][attachement_id]`, String(doc.attachement_id));
            }
        });
      }
      // Ajout des lots
      if (article.lots) {
        article.lots.forEach((lot: any, lotIdx: number) => {
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][lot]`, lot.lot);
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][dateperemption]`, lot.dateperemption || "");
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][quantite]`, String(lot.quantite));
          formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][dureedevie]`, lot.dureedevie || "");
          if (lot.fabricant_id) formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][fabricant_id]`, String(lot.fabricant_id));
          if (lot.conditionnement_id) formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][conditionnement_id]`, String(lot.conditionnement_id));
          if (lot.devise_id) formData.append(`soumissionarticles[${idx}][lots][${lotIdx}][devise_id]`, String(lot.devise_id));
        });
      }
      
      // Ajout des spécifications techniques (conformité) par article
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
            // console.log(`📦 [FormData] piece_justificative ajoutée pour article ${idx}:`, spec.piece_justificative.name);
          } else {
            console.warn(`⚠️ [FormData] piece_justificative n'est pas un File pour article ${idx}:`, typeof spec.piece_justificative);
          }
        }
      }
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

    // console.log("📄 Specdocuments construits:", specdocuments.map(s => ({ 
    //   attachement_id: s.attachement_id, 
    //   fileName: s.file.name 
    // })));

    // 🆕 Ajout des specdocuments au FormData
    specdocuments.forEach((specDoc, idx) => {
      formData.append(`specdocuments[${idx}][attachement_id]`, String(specDoc.attachement_id));
      formData.append(`specdocuments[${idx}][file]`, specDoc.file);
    });

    // console.log("voici le formData avant envoi:");
    // for (let pair of formData.entries()) {
    //   console.log(`${pair[0]}: ${pair[1]}`);
    // }

    // Activer le loader
    setIsSubmitting(true);

    // Envoi via le nouveau hook
    createSoumissionFormData.mutate(formData, {
      onSuccess: () => {
        setIsSubmitting(false);
        showSuccess("Soumission envoyée !", "Votre soumission a été envoyée avec succès. Vous allez être redirigé vers le tableau de suivi.");
        setTimeout(() => {
          navigate(`/tableauSuivi/${tender.id}`);
        }, 2000);
      },
      onError: (err) => {
        setIsSubmitting(false);
        showError("Erreur de soumission", err);
      },
    });
  };

  const calculerTotal = () => {
    return Object.entries(form.produits).reduce((total, [produitId, data]) => {
      const produit = tender.aoarticles.find((p) => String(p.article.id) === String(produitId));
      if (produit) {
        let baseTotal = 0;
        const lots = typeof data.lots === 'string' ? JSON.parse(data.lots) : (data.lots || []);
        const detailsPrix = data.detailprixfabricants || [];
        const quantitesParFabricant = lots.reduce((acc: any, lot: any) => {
          acc[lot.fabricant_id] = (acc[lot.fabricant_id] || 0) + Number(lot.quantite);
          return acc;
        }, {});
        Object.entries(quantitesParFabricant).forEach(([fabId, qte]) => {
          const detailPrix = detailsPrix.find((d: any) => String(d.fabricant_id) === String(fabId));
          const prix = detailPrix ? Number(detailPrix.prixunitaire) : 0;
          baseTotal += prix * Number(qte);
        });
        const coefficient = data.termeCommercial === "Autre" ? (produit.coeff || 1) : 1;
        return total + (baseTotal * coefficient);
      }
      return total;
    }, 0);
  };

  return (
    <>
      <SmallHeader />
      <form onSubmit={handleSubmit}>
        <div
          className="mx-auto  mt-5"
          style={{ marginBottom: "5vh", width: "95.5%" }}
        >
          <div
            className="bg-white p-4 rounded-3 shadow-sm  "
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
              <h5 className="mb-0 " style={{ color: "#1FB05B" }}>
                Formulaire pour postuler
              </h5>
              </div>
                <span
              className={`badge ms-3`}
              style={{ backgroundColor: "#1FB05B",marginRight:'20px' }}
            >
              {tender.typemarche?.designation}
            </span>
            </div>

            <hr className="mb-4" />

            {/* Chips d'onglets */}

            <div className="mb-2" style={tabStyles.container}>
              {/* articles */}
              <div
                style={{
                  ...tabStyles.chip,
                  ...(activeTab === "Articles " ? tabStyles.activeChip : {}),
                }}
                onClick={() => setActiveTab("Articles ")}
              >
                Articles
              </div>
              
              {/* spécifications techniques */}
              <div
                style={{
                  ...tabStyles.chip,
                  ...(activeTab === "techniques" ? tabStyles.activeChip : {}),
                }}
                onClick={() => setActiveTab("techniques")}
              >
                spécifications techniques 
              </div>
              
              {/* conditions internationales */}
              {fournisseur?.categoriefournisseur_text !== "FLOC" && (
                <div
                  style={{
                    ...tabStyles.chip,
                    ...(activeTab === "International" ? tabStyles.activeChip : {}),
                  }}
                  onClick={() => setActiveTab("International")}
                >
                  conditions internationales
                </div>
              )}

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
            {/* Onglets rendus avec display au lieu de rendu conditionnel pour préserver l'état */}
            <div style={{ display: activeTab === "Documents" ? "block" : "none" }}>
              <DocumentsTab
                tender={tender}
                uploadedDocs={uploadedDocs}
                setUploadedDocs={setUploadedDocs}
              />
            </div>

            {/* section articles */}
            <div style={{ display: activeTab === "Articles " ? "block" : "none" }}>
              <ArticlesTab
                tender={tender}
                form={form}
                fabricant={fabricant}
                loadingFabricants={loadingFabricants}
                errorFabricant={typeof errorFabricant === 'string' ? errorFabricant : null}
                devises={devises}
                handlePrixFabricantChange={handlePrixFabricantChange}
                handleProduitChange={handleProduitChange}
                handleProduitTermeChange={handleProduitTermeChange}
                calculerTotal={calculerTotal}
                handleDeviseChange={handleDeviseChange}
                handleAddLot={handleAddLot}
                handleDeleteLot={handleDeleteLot}
                handleLotChange={handleLotChange}
              />
            </div>

            <div style={{ display: activeTab === "techniques" ? "block" : "none" }}>
              <SpecificationTechnniquesTab
                tender={tender}
                form={form}
                fabricant={fabricant}
                loadingFabricants={loadingFabricants}
                errorFabricant={typeof errorFabricant === 'string' ? errorFabricant : null}
                handleProduitChange={handleProduitChange}
              />
            </div>

            {/*{tender.typemarche.designation === "International" && (*/}
            {fournisseur?.categoriefournisseur_text !== "FLOC" && (
              <div style={{ display: activeTab === "International" ? "block" : "none" }}>
                <InternationalTab
                  form={form}
                  setForm={setForm}
                />
              </div>
            )}
            <br />
          </div>
        </div>

        <div
          className="mt-1 mx-auto"
          style={{ width: "95.5%", margin: "10vh" }}
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-white d-block py-3 px-5 text-center w-100"
            style={{
              fontSize: "1.1rem",
              borderRadius: "12px",
              boxShadow: isSubmitting ? "none" : "0 0 5px #1FB05B",
              border: "1px solid #1FB05B",
              backgroundColor: isSubmitting ? "#f0f0f0" : "white",
              color: isSubmitting ? "#999" : "#1FB05B",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              opacity: isSubmitting ? 0.7 : 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
            }}
          >
            {isSubmitting && (
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
                style={{ borderColor: "#1FB05B", borderRightColor: "transparent" }}
              ></span>
            )}
            {isSubmitting ? "Envoi en cours..." : "Postuler"}
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

export default FormulaireSoumission;
