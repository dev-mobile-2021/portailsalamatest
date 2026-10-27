import React, { useState } from "react";
import doc_info_icon from "../../assets/images/doc_info_icon.png";
import doc_icon from "../../assets/images/doc_icon.png";
import PaginationComponent from "../PaginationComponent";
import { FaExclamationCircle, FaFileAlt, FaPlus, FaChevronDown, FaChevronRight, FaIndustry, FaEdit, FaTrash, FaSearch } from "react-icons/fa";
import { BASE_URL } from "../../utils/variable";
import LotModal, { LotData } from "../ui/LotModal";
import LotsManagerModal from "../ui/LotsManagerModal";
import DelaiLivraisonModal, { DelaiLivraisonData } from "../ui/DelaiLivraisonModal";
import UploadDocument from "../UploadDocument";
import SearchableSelect from "../ui/SearchableSelect";
import SpecificationTechniqueFournisseurModal, { SpecificationTechniqueFournisseurData } from "../ui/SpecificationTechniqueFournisseurModal";
import SpecificationTechniqueSalamaModal, { SpecificationTechniqueSalamaData } from "../ui/SpecificationTechniqueSalamaModal";
import PricesModal from "../ui/PricesModal";
import { Devise } from "../../types/Devise.types";
import { Fabricant } from "../../types/AO.types";

interface VueGlobaleProps {
  Data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  dashboardData: {
    documentsAConsulter: Array<{ id: string; designation: string; url: string; isannexe: number }>;
    documentsFournis: Array<{ id: string; designation: string; documentspecification: {
        id: string; 
      designation: string;
      };  url: string; isannexe: number }>;
  };
  fournisseurs: Fabricant[];
  loadingFabricants: boolean;
  errorFabricants: string | null;
  devises: Devise[]; // Liste des devises de l'API
  loadingDevises?: boolean; // État de chargement des devises
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  // 🆕 Props pour la gestion des documents fournis
  documentsFournis?: Array<{
    id: string;
    file: string;
    attachement_id: string;
    ao_id: string;
  }>;
  // 🆕 Documents uploadés localement (nouveaux uploads)
  uploadedDocs?: Record<string, File[]>;
  onDocumentUpload?: (documentId: string, files: File | File[]) => void;
  onDocumentReset?: (documentId: string) => void;
  // 🆕 Indique si le contrat est clôturé/résilié (etat < 0) - aucune action possible
  isContratCloture?: boolean;
}

const VueGlobale: React.FC<VueGlobaleProps> = ({
  Data,
  setData,
  dashboardData,
  fournisseurs,
  loadingFabricants,
  errorFabricants,
  devises,
  loadingDevises = false,
  handleSubmit,
  documentsFournis = [],
  uploadedDocs = {},
  onDocumentUpload,
  onDocumentReset,
  isContratCloture = false,
}) => {

  // States for lot and delivery delay management
  const [openAccordions, setOpenAccordions] = useState<Record<string | number, boolean>>({});
  const [showDelaiModal, setShowDelaiModal] = useState(false);
  const [selectedArticleForDelai, setSelectedArticleForDelai] = useState<any>(null);

  // States for lot management modals
  const [showLotsManager, setShowLotsManager] = useState(false);
  const [showLotFormModal, setShowLotFormModal] = useState(false);
  const [selectedArticleId, setSelectedArticleId] = useState<string | number | null>(null);
  const [editLotIdx, setEditLotIdx] = useState<number | null>(null);
  const [selectedFabricantToAdd, setSelectedFabricantToAdd] = useState<Record<string | number, number | "">>({});
  const [showPricesModal, setShowPricesModal] = useState(false);
  const [articleSearch, setArticleSearch] = useState("");

  // Missing specification states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSpecModal, setShowSpecModal] = useState(false);
  const [selectedArticleForSpec, setSelectedArticleForSpec] = useState<any>(null);
  const [showSalamaSpecModal, setShowSalamaSpecModal] = useState(false);
  const [selectedArticleForSalamaSpec, setSelectedArticleForSalamaSpec] = useState<any>(null);

  const [salamaSpecData, setSalamaSpecData] = useState<SpecificationTechniqueSalamaData | null>(null);
  const [loadingSalamaSpec, setLoadingSalamaSpec] = useState(false);
  const [errorSalamaSpec, setErrorSalamaSpec] = useState<string | null>(null);

  const toggleAccordion = (articleId: string | number) => {
    setOpenAccordions(prev => ({ ...prev, [articleId]: !prev[articleId] }));
  };

  const getLots = (article: any): any[] => {
    if (!article) return [];
    const lots = article.lots;
    if (!lots) return [];
    return typeof lots === 'string' ? JSON.parse(lots) : lots;
  };

  const getSelectedArticleInfo = () => {
    if (!selectedArticleId) return null;
    const article = Data.articles.find((p: any) => String(p.id) === String(selectedArticleId));
    return {
      productName: article?.nom || "",
      quantiteDisponible: Number(article?.quantiteProposee) || 0,
      lots: getLots(article),
      formData: article || {} as any
    };
  };

  const selectedInfo = getSelectedArticleInfo();

  const handleProduitChange = (articleId: string | number, field: string, value: any) => {
    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(articleId));
    if (index !== -1) {
      const article = { ...updatedArticles[index] };
      
      article[field] = value;

      if (field === "quantiteDisponible") {
        article.quantiteProposee = value;
      } else if (field === "quantiteProposee") {
        article.quantiteDisponible = value;
      }

      if (field === "lots") {
        const parsedLots = typeof value === 'string' ? JSON.parse(value) : value;
        const totalQuantite = parsedLots.reduce((sum: number, lot: any) => sum + (Number(lot.quantite) || 0), 0);
        article.quantiteProposee = totalQuantite;
        article.quantiteDisponible = totalQuantite;
      }

      // Recalculate sousTotal
      const lots = getLots(article);
      const details = article.detailprixfabricants || [];
      let baseSousTotal = 0;
      if (lots.length > 0) {
        if (details.length > 0) {
          baseSousTotal = lots.reduce((sum: number, lot: any) => {
            const detail = details.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
            return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
          }, 0);
        } else {
          baseSousTotal = lots.reduce((sum: number, lot: any) => sum + ((Number(lot.quantite) || 0) * (Number(lot.prixunitaire) || 0)), 0);
        }
      } else {
        if (details.length === 1) {
          baseSousTotal = (Number(details[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
        } else {
          baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
        }
      }

      article.sousTotal = article.typeCondition === "Autre" && article.coeff
        ? baseSousTotal * article.coeff
        : baseSousTotal;

      updatedArticles[index] = article;
      setData({ ...Data, articles: updatedArticles });
    }
  };

  const handlePrixFabricantChange = (
    articleId: string | number,
    fabricantId: number,
    prixunitaire: number,
    devise_id?: number
  ) => {
    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(articleId));
    if (index !== -1) {
      const article = { ...updatedArticles[index] };
      
      const detailprixfabricants = [...(article.detailprixfabricants || [])];
      const detailIdx = detailprixfabricants.findIndex(
        (d: any) => String(d.fabricant_id) === String(fabricantId)
      );
      if (detailIdx !== -1) {
        detailprixfabricants[detailIdx] = {
          ...detailprixfabricants[detailIdx],
          prixunitaire,
          devise_id: devise_id !== undefined ? devise_id : detailprixfabricants[detailIdx].devise_id,
        };
      } else {
        detailprixfabricants.push({ fabricant_id: fabricantId, prixunitaire, devise_id });
      }
      article.detailprixfabricants = detailprixfabricants;

      let lots = getLots(article);
      lots = lots.map((lot: any) => {
        if (String(lot.fabricant_id) === String(fabricantId)) {
          return {
            ...lot,
            prixunitaire,
            devise_id: devise_id !== undefined ? devise_id : lot.devise_id,
          };
        }
        return lot;
      });
      article.lots = lots;

      // Recalculate sousTotal
      let baseSousTotal = 0;
      if (lots.length > 0) {
        baseSousTotal = lots.reduce((sum: number, lot: any) => {
          const detail = detailprixfabricants.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
          return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
        }, 0);
      } else {
        if (detailprixfabricants.length === 1) {
          baseSousTotal = (Number(detailprixfabricants[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
        } else {
          baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
        }
      }

      article.sousTotal = article.typeCondition === "Autre" && article.coeff
        ? baseSousTotal * article.coeff
        : baseSousTotal;

      updatedArticles[index] = article;
      setData({ ...Data, articles: updatedArticles });
    }
  };

  const handleGlobalDeviseChange = (newDeviseId: number | null) => {
    const updatedArticles = Data.articles.map((art: any) => {
      let artLots = getLots(art);
      if (artLots && artLots.length > 0) {
        artLots = artLots.map((lot: any) => ({ ...lot, devise_id: newDeviseId }));
      }
      let details = art.detailprixfabricants || [];
      if (details.length > 0) {
        details = details.map((d: any) => ({ ...d, devise_id: newDeviseId }));
      }
      return {
        ...art,
        devise_id: newDeviseId,
        lots: artLots,
        detailprixfabricants: details
      };
    });
    setData({ ...Data, articles: updatedArticles });
  };

  const handleProduitTermeChange = (articleId: string | number, terme: "DDP" | "Autre") => {
    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(articleId));
    if (index !== -1) {
      const article = { ...updatedArticles[index] };
      article.typeCondition = terme;
      if (terme === "DDP") {
        article.commentaireTerme = "";
      }

      // Recalculate sousTotal
      const lots = getLots(article);
      const details = article.detailprixfabricants || [];
      let baseSousTotal = 0;
      if (lots.length > 0) {
        if (details.length > 0) {
          baseSousTotal = lots.reduce((sum: number, lot: any) => {
            const detail = details.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
            return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
          }, 0);
        } else {
          baseSousTotal = lots.reduce((sum: number, lot: any) => sum + ((Number(lot.quantite) || 0) * (Number(lot.prixunitaire) || 0)), 0);
        }
      } else {
        if (details.length === 1) {
          baseSousTotal = (Number(details[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
        } else {
          baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
        }
      }

      article.sousTotal = terme === "Autre" && article.coeff
        ? baseSousTotal * article.coeff
        : baseSousTotal;

      updatedArticles[index] = article;
      setData({ ...Data, articles: updatedArticles });
    }
  };

  const handleSaveLot = (savedLot: LotData) => {
    if (!selectedArticleId) return;
    const currentLots = getLots(Data.articles.find((a: any) => String(a.id) === String(selectedArticleId)));

    if (editLotIdx !== null) {
      handleLotChange(selectedArticleId, editLotIdx, savedLot);
    } else {
      const updatedLots = [...currentLots, savedLot];
      handleProduitChange(selectedArticleId, "lots", updatedLots);
    }
    setShowLotFormModal(false);
  };

  const handleLotChange = (articleId: string | number, lotIndex: number, updatedFields: Partial<LotData> | string, value?: any) => {
    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(articleId));
    if (index !== -1) {
      const article = { ...updatedArticles[index] };
      let lots = getLots(article);
      lots = [...lots];
      if (typeof updatedFields === 'string') {
        lots[lotIndex] = { ...lots[lotIndex], [updatedFields]: value };
      } else {
        lots[lotIndex] = { ...lots[lotIndex], ...updatedFields };
      }
      article.lots = lots;

      // Update total quantities
      const totalQuantite = lots.reduce((sum: number, lot: any) => sum + (Number(lot.quantite) || 0), 0);
      article.quantiteProposee = totalQuantite;
      article.quantiteDisponible = totalQuantite;

      // Also ensure detailprixfabricants is updated/reconstructed
      const detailprixfabricants = [...(article.detailprixfabricants || [])];
      lots.forEach((lot: any) => {
        if (lot.fabricant_id) {
          const detailIdx = detailprixfabricants.findIndex(
            (d: any) => String(d.fabricant_id) === String(lot.fabricant_id)
          );
          if (detailIdx !== -1) {
            if (lot.prixunitaire !== undefined) {
              detailprixfabricants[detailIdx].prixunitaire = lot.prixunitaire;
            }
          } else if (lot.prixunitaire !== undefined) {
            detailprixfabricants.push({ fabricant_id: lot.fabricant_id, prixunitaire: lot.prixunitaire, devise_id: lot.devise_id });
          }
        }
      });
      article.detailprixfabricants = detailprixfabricants;

      // Recalculate sousTotal
      let baseSousTotal = 0;
      if (lots.length > 0) {
        baseSousTotal = lots.reduce((sum: number, lot: any) => {
          const detail = detailprixfabricants.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
          return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
        }, 0);
      } else {
        if (detailprixfabricants.length === 1) {
          baseSousTotal = (Number(detailprixfabricants[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
        } else {
          baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
        }
      }

      article.sousTotal = article.typeCondition === "Autre" && article.coeff
        ? baseSousTotal * article.coeff
        : baseSousTotal;

      updatedArticles[index] = article;
      setData({ ...Data, articles: updatedArticles });
    }
  };

  const handleDeleteLot = (articleId: string | number, lotIndex: number) => {
    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(articleId));
    if (index !== -1) {
      const article = { ...updatedArticles[index] };
      let lots = getLots(article);
      const deletedLot = lots[lotIndex];
      lots = lots.filter((_: any, idx: number) => idx !== lotIndex);
      article.lots = lots;

      // Update total quantities
      const totalQuantite = lots.reduce((sum: number, lot: any) => sum + (Number(lot.quantite) || 0), 0);
      article.quantiteProposee = totalQuantite;
      article.quantiteDisponible = totalQuantite;

      if (deletedLot && deletedLot.fabricant_id) {
        const stillHasFabricant = lots.some((lot: any) => String(lot.fabricant_id) === String(deletedLot.fabricant_id));
        if (!stillHasFabricant) {
          article.detailprixfabricants = (article.detailprixfabricants || []).filter(
            (d: any) => String(d.fabricant_id) !== String(deletedLot.fabricant_id)
          );
        }
      }

      // Recalculate sousTotal
      const details = article.detailprixfabricants || [];
      let baseSousTotal = 0;
      if (lots.length > 0) {
        baseSousTotal = lots.reduce((sum: number, lot: any) => {
          const detail = details.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
          return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
        }, 0);
      } else {
        if (details.length === 1) {
          baseSousTotal = (Number(details[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
        } else {
          baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
        }
      }

      article.sousTotal = article.typeCondition === "Autre" && article.coeff
        ? baseSousTotal * article.coeff
        : baseSousTotal;

      updatedArticles[index] = article;
      setData({ ...Data, articles: updatedArticles });
    }
  };

  const getFabricantName = (fabId: string | number) => {
    const fab = fournisseurs.find((f: any) => String(f.id) === String(fabId));
    return fab?.designation || `Fabricant #${fabId}`;
  };

  const handleAddFabricant = (articleId: string | number, fabricantId: number) => {
    if (!fabricantId) return;
    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(articleId));
    if (index === -1) return;

    const article = { ...updatedArticles[index] };
    const details = [...(article.detailprixfabricants || [])];
    const alreadyExists = details.some((d: any) => String(d.fabricant_id) === String(fabricantId));
    if (alreadyExists) return;

    details.push({ fabricant_id: fabricantId, prixunitaire: 0, devise_id: article.devise_id });
    article.detailprixfabricants = details;

    // Recalculate sousTotal
    let baseSousTotal = 0;
    const lots = getLots(article);
    if (lots.length > 0) {
      baseSousTotal = lots.reduce((sum: number, lot: any) => {
        const detail = details.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
        return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
      }, 0);
    } else {
      if (details.length === 1) {
        baseSousTotal = (Number(details[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
      } else {
        baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
      }
    }
    article.sousTotal = article.typeCondition === "Autre" && article.coeff
      ? baseSousTotal * article.coeff
      : baseSousTotal;

    updatedArticles[index] = article;
    setData({ ...Data, articles: updatedArticles });
    setSelectedFabricantToAdd((prev) => ({ ...prev, [articleId]: "" } as Record<string | number, number | "">));
  };

  const handleRemoveFabricant = (articleId: string | number, fabricantId: number) => {
    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(articleId));
    if (index === -1) return;

    const article = { ...updatedArticles[index] };
    const lots = getLots(article);
    const isLinkedToLots = lots.some((lot: any) => String(lot.fabricant_id) === String(fabricantId));
    if (isLinkedToLots) return;

    const details = [...(article.detailprixfabricants || [])].filter(
      (d: any) => String(d.fabricant_id) !== String(fabricantId)
    );
    article.detailprixfabricants = details;

    // Recalculate sousTotal
    let baseSousTotal = 0;
    if (lots.length > 0) {
      baseSousTotal = lots.reduce((sum: number, lot: any) => {
        const detail = details.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
        return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
      }, 0);
    } else {
      if (details.length === 1) {
        baseSousTotal = (Number(details[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
      } else {
        baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
      }
    }
    article.sousTotal = article.typeCondition === "Autre" && article.coeff
      ? baseSousTotal * article.coeff
      : baseSousTotal;

    updatedArticles[index] = article;
    setData({ ...Data, articles: updatedArticles });
  };

  const filteredArticles = (Data.articles || []).filter((article: any) => {
    const query = articleSearch.trim().toLowerCase();
    if (!query) return true;
    const designation = String(article?.nom ?? "").toLowerCase();
    const code = String(article?.code ?? "").toLowerCase();
    const reference = String(article?.reference ?? "").toLowerCase();
    const articleId = String(article?.id ?? "").toLowerCase();
    return [designation, code, reference, articleId].some((value) => value.includes(query));
  });

  const getTaux = (devise_id: number | null): number => {
    if (!devise_id) return 1;
    const selectedDevise = devises.find(d => d.id === devise_id);
    return selectedDevise?.taux || 1;
  };

  const convertFromMGA = (valueMGA: number, devise_id: number | null): number => {
    const taux = getTaux(devise_id);
    return valueMGA / taux;
  };

  const openDelaiModal = (article: any) => {
    setSelectedArticleForDelai(article);
    setShowDelaiModal(true);
  };

  const saveDelaiLivraison = (data: DelaiLivraisonData) => {
    if (!selectedArticleForDelai) return;

    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex((a: any) => String(a.id) === String(selectedArticleForDelai.id));
    
    if (index !== -1) {
      updatedArticles[index].delaiLivraisonData = data;
      setData({ ...Data, articles: updatedArticles });
    }

    setShowDelaiModal(false);
    setSelectedArticleForDelai(null);
  };

  const getDelaiData = (article: any): DelaiLivraisonData | undefined => {
    if (article?.delaiLivraisonData) {
      return article.delaiLivraisonData;
    }
    if (article?.delaiLivraison !== undefined && article?.delaiLivraison !== null) {
      if (typeof article.delaiLivraison === 'number') {
        return { production: 0, acheminement: 0, dedouanement: 0, total: article.delaiLivraison };
      }
      if (typeof article.delaiLivraison === 'string') {
        try {
          const parsed = JSON.parse(article.delaiLivraison);
          if (typeof parsed === 'number') {
            return { production: 0, acheminement: 0, dedouanement: 0, total: parsed };
          }
          return parsed;
        } catch {
          return undefined;
        }
      }
      return article.delaiLivraison;
    }
    return undefined;
  };

  const calculerTotal = () => {
    return Data.articles.reduce((total: number, article: any) => {
      const lots = getLots(article);
      const details = article.detailprixfabricants || [];
      let baseSousTotal = 0;
      if (lots.length > 0 && details.length > 0) {
        baseSousTotal = lots.reduce((sum: number, lot: any) => {
          const detail = details.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
          return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
        }, 0);
      } else if (details.length === 1) {
        baseSousTotal = (Number(details[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
      } else {
        baseSousTotal = (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
      }
      const sousTotalFinal = article.typeCondition === "Autre" ? baseSousTotal * (article.coeff || 1) : baseSousTotal;
      return total + sousTotalFinal;
    }, 0);
  };

  // Ouvrir le modal de spécification technique
  const openSpecModal = (article: any) => {
    setSelectedArticleForSpec(article);
    setShowSpecModal(true);
  };

  // Sauvegarder la spécification technique
  const saveSpecification = (data: SpecificationTechniqueFournisseurData) => {
    if (!selectedArticleForSpec) return;

    const updatedArticles = [...Data.articles];
    const index = updatedArticles.findIndex(a => a.id === selectedArticleForSpec.id);
    
    if (index !== -1) {
      updatedArticles[index].specificationTechnique = data;
      setData({ ...Data, articles: updatedArticles });
    }

    setShowSpecModal(false);
    setSelectedArticleForSpec(null);
  };

  // 🆕 Fonction pour récupérer les spécifications techniques Salama
  const fetchSalamaSpecifications = async (detaildaId: number) => {
    setLoadingSalamaSpec(true);
    setErrorSalamaSpec(null);
    setSalamaSpecData(null);
    
    try {
      const query = `{
        specificationtechniques(detailda_id:${detaildaId}) {
          id
          detailda_id
          description
          normes
          conditionnement_type
          conditionnement_quantite
          conditionnement_type_autre
          longueur
          largeur
          hauteur
          poids_net
          poids_brut
          volume
          conservation
          conservation_autre
          instructions
          document
          med_dci
          med_forme
          med_dosage
          med_presentation
          med_fabricant
          med_pays_origine
          med_amm_numero
          med_amm_pays
          med_certificats
          med_stabilite
          med_chaine_froid
          bes_marque
          bes_modele
          bes_reference
          reference
          bes_garantie
          bes_accessoires_inclus
          bes_normes_securite
          bes_materiau
          bes_alimentation
        }
      }`;
      
      const response = await fetch(
        `https://backsignup.h-tsoft.com/graphql?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      // L'API retourne {data: {specificationtechniques: [...]}} (format GraphQL standard)
      if (data?.data?.specificationtechniques && data.data.specificationtechniques.length > 0) {
        const spec = data.data.specificationtechniques[0];
        
        // Mapper les données de l'API vers le format attendu par le modal
        const mappedData: SpecificationTechniqueSalamaData = {
          description: spec.description || "",
          normes: spec.normes || "",
          typeConditionnement: spec.conditionnement_type || "",
          quantiteParConditionnement: spec.conditionnement_quantite || "",
          autreTypeConditionnement: spec.conditionnement_type_autre || "",
          longueur: spec.longueur || "",
          largeur: spec.largeur || "",
          hauteur: spec.hauteur || "",
          volume: spec.volume || "",
          poidsNet: spec.poids_net || "",
          poidsBrut: spec.poids_brut || "",
          conditionsConservation: spec.conservation || "",
          autresDetailsConservation: spec.conservation_autre || "",
          instructionsUtilisation: spec.instructions || "",
          fichierTechnique: null,
          documentUrl: spec.document ? `${BASE_URL}${spec.document}` : null,
          // Champs MED (Médicaments)
          dci: spec.med_dci || "",
          formePharmaceutique: spec.med_forme || "",
          dosage: spec.med_dosage || "",
          presentation: spec.med_presentation || "",
          fabricant: spec.med_fabricant || "",
          paysOrigine: spec.med_pays_origine || "",
          numeroAMM: spec.med_amm_numero || "",
          paysAMM: spec.med_amm_pays || "",
          certificats: spec.med_certificats || "",
          dureeStabilite: spec.med_stabilite || "",
          chaineFroid: spec.med_chaine_froid || "",
          // Champs BES (Biens d'équipement et services)
          marque: spec.bes_marque || "",
          modele: spec.bes_modele || "",
          reference: spec.reference || spec.bes_reference || "",
          garantie: spec.bes_garantie || "",
          accessoiresInclus: spec.bes_accessoires_inclus || "",
          normesSecurite: spec.bes_normes_securite || "",
          materiau: spec.bes_materiau || "",
          alimentation: spec.bes_alimentation || "",
        };
        
        setSalamaSpecData(mappedData);
      } else {
        setErrorSalamaSpec("Aucune spécification trouvée pour ce produit");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des spécifications Salama:", error);
      setErrorSalamaSpec("Erreur lors de la récupération des spécifications");
    } finally {
      setLoadingSalamaSpec(false);
    }
  };

  // 🆕 Ouvrir le modal de spécification Salama
  const openSalamaSpecModal = async (article: any) => {
    setSelectedArticleForSalamaSpec(article);
    setShowSalamaSpecModal(true);
    // Utiliser detailda_id (de aoarticles) pour récupérer la spécification Salama spécifique
    const specId = article.detailda_id;
    await fetchSalamaSpecifications(specId);
  };

  // 🆕 Fonctions pour la gestion des documents fournis
  const getDocumentsManquants = () => {
    // Identifier les documents requis qui n'ont pas été fournis sur le serveur
    const documentsRequisNonFournis = dashboardData.documentsFournis.filter(docRequis => {
      const estFourniServeur = documentsFournis.some(docFourni => docFourni.attachement_id === docRequis.id);
      return !estFourniServeur;
    });

    return documentsRequisNonFournis.map(doc => {
      // Vérifier si un fichier est uploadé localement pour ce document
      const filesUploades = uploadedDocs[doc.id] || [];
      
      return {
        id: doc.id,
        name: doc.documentspecification?.designation || doc.designation,
        uploaded: filesUploades.length > 0,
        uploadedFiles: filesUploades,
        attachement_id: doc.id
      };
    });
  };

  const getDocumentsExistants = () => {
    return documentsFournis.map(docFourni => {
      const docDetails = dashboardData.documentsFournis.find(d => d.id === docFourni.attachement_id);
      return {
        ...docFourni,
        designation: docDetails?.documentspecification.designation || `Document ${docFourni.id}`
      };
    });
  };



  const renderAccordionRow = (article: any) => {
    const articleId = Number(article.id);
    const lots = getLots(article);
    const colCount = !["AOR", "Consultation", "Cotation", "Achat Direct"].includes(Data.tender?.typemarche?.designation) && (Data.tender?.TSSCOD_0_0 === "MED" || Data.tender?.TSSCOD_0_0 === null) ? 10 : 9;

    const detailFabricantIds = (article.detailprixfabricants || [])
      .map((d: any) => d.fabricant_id)
      .filter((id: any) => id !== undefined && id !== null);
    const lotFabricantIds = lots
      .map((lot: any) => lot.fabricant_id)
      .filter((id: any) => id !== undefined && id !== null);
    const distinctFabricantIds = Array.from(
      new Set([...detailFabricantIds, ...lotFabricantIds].map((id) => String(id)))
    );
    const noFabricants = distinctFabricantIds.length === 0;

    const existingFabricantIdSet = new Set(distinctFabricantIds.map(String));
    const availableFabricants = fournisseurs.filter((f) => !existingFabricantIdSet.has(String(f.id)));
    const selectedAddFabricantId = selectedFabricantToAdd[articleId];
    const resolvedAddFabricantId = selectedAddFabricantId !== undefined && selectedAddFabricantId !== ""
      ? selectedAddFabricantId
      : availableFabricants[0]?.id;

    return (
      <tr key={`acc-${article.id}`} style={{ background: '#f8fafc', borderBottom: '2px solid #1FB05B' }}>
        <td colSpan={colCount} style={{ padding: 0 }}>
          <div style={{ padding: '8px 16px 8px 40px' }}>
            <div style={{
              background: '#f1f5f9',
              borderRadius: 8,
              border: '1px solid #e2e8f0',
              padding: '10px 12px',
              marginTop: 4,
              marginBottom: 4
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                gap: 12
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <FaIndustry color="#1FB05B" size={13} />
                  <span style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>Prix par fabricant</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {availableFabricants.length > 3 ? (
                    <SearchableSelect
                      options={availableFabricants.map((f) => ({
                        value: f.id,
                        label: f.designation
                      }))}
                      value={resolvedAddFabricantId ?? ""}
                      onChange={(value) => setSelectedFabricantToAdd((prev) => ({
                        ...prev,
                        [articleId]: value ? Number(value) : ""
                      }))}
                      placeholder={availableFabricants.length === 0 ? "Aucun fabricant dispo" : "Sélectionner un fabricant"}
                      disabled={availableFabricants.length === 0 || loadingFabricants}
                      style={{
                        borderRadius: '4px'
                      }}
                    />
                  ) : (
                    <select
                      value={resolvedAddFabricantId ?? ""}
                      onChange={(e) => setSelectedFabricantToAdd((prev) => ({
                        ...prev,
                        [articleId]: e.target.value ? Number(e.target.value) : ""
                      }))}
                      disabled={availableFabricants.length === 0 || loadingFabricants}
                      style={{
                        fontSize: 11,
                        padding: '3px 6px',
                        borderRadius: 4,
                        border: '1px solid #cbd5e1',
                        background: 'white',
                        color: '#1e293b',
                        fontWeight: 600,
                        cursor: availableFabricants.length === 0 ? 'not-allowed' : 'pointer',
                        outline: 'none',
                        minWidth: 160
                      }}
                    >
                      {availableFabricants.length === 0 ? (
                        <option value="">Aucun fabricant dispo</option>
                      ) : (
                        availableFabricants.map((f) => (
                          <option key={f.id} value={f.id}>{f.designation}</option>
                        ))
                      )}
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (resolvedAddFabricantId !== undefined) {
                        handleAddFabricant(articleId, Number(resolvedAddFabricantId));
                      }
                    }}
                    disabled={availableFabricants.length === 0 || loadingFabricants || resolvedAddFabricantId === undefined}
                    style={{
                      background: '#1FB05B',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '4px 10px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: availableFabricants.length === 0 ? 'not-allowed' : 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                  >
                    <FaPlus size={10} /> Ajouter
                  </button>
                </div>
              </div>

              {noFabricants ? (
                <div style={{
                  textAlign: 'center',
                  padding: '16px',
                  color: '#6b7280',
                  background: '#ffffff',
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: 8,
                  fontSize: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                  margin: '4px 0'
                }}>
                  <FaIndustry size={20} color="#94a3b8" />
                  <div style={{ fontWeight: 600, color: '#334155' }}>Aucun fabricant ajoute pour cet article.</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>Ajoutez un fabricant pour renseigner les prix.</div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSelectedArticleId(articleId);
                      setShowLotsManager(true);
                    }}
                    style={{
                      marginTop: 6,
                      background: '#e8f9f0',
                      color: '#1FB05B',
                      border: '1px solid #cfe9da',
                      borderRadius: 6,
                      padding: '4px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      outline: 'none'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#d2f3e0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#e8f9f0'}
                  >
                    Gerer les lots
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {distinctFabricantIds.map((fabId) => {
                    const detail = (article.detailprixfabricants || []).find((d: any) => String(d.fabricant_id) === String(fabId));
                    const currentPrixVal = detail?.prixunitaire;
                    const currentPrix = (currentPrixVal !== undefined && currentPrixVal !== null && currentPrixVal !== 0)
                      ? String(currentPrixVal)
                      : '';
                    
                    // Résoudre la devise et le label
                    let deviseForRow = detail?.devise_id ?? article.devise_id ?? devises[0]?.id;
                    let deviseLabel = "—";
                    
                    // Prioritizer l'array devises pour toujours avoir le label à jour après un changement
                    const deviseFound = devises.find(d => String(d.id) === String(deviseForRow));
                    deviseLabel = deviseFound?.designation || (detail?.devise?.designation) || (deviseForRow ? `#${deviseForRow}` : '—');

                    const lotsFabricant = lots.filter(
                      (lot: any) => String(lot.fabricant_id) === String(fabId)
                    );
                    const isLinkedToLots = lotsFabricant.length > 0;

                    return (
                      <div key={fabId} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        padding: '8px 12px',
                        background: 'white',
                        borderRadius: '6px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.02)',
                        transition: 'all 0.2s ease',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, maxWidth: '240px' }}>
                            <div style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#e8f9f0',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#1FB05B',
                              flexShrink: 0
                            }}>
                              <FaIndustry size={11} />
                            </div>
                            <span style={{ fontWeight: 600, color: '#1e293b', fontSize: '12px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 1, minWidth: 0 }}>
                              {getFabricantName(fabId)}
                            </span>
                          </div>

                          <div style={{ width: '120px', display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                            <select
                              value={deviseForRow || ''}
                              onChange={(e) => {
                                if (!e.target.value) return;
                                const value = Number(e.target.value);
                                const prix = currentPrixVal !== undefined && currentPrixVal !== null ? currentPrixVal : 0;
                                handlePrixFabricantChange(articleId, Number(fabId), prix, value);
                              }}
                              style={{
                                fontSize: 11,
                                padding: '3px 6px',
                                borderRadius: 4,
                                border: '1px solid #cbd5e1',
                                background: 'white',
                                color: '#1e293b',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: 'none',
                                minWidth: 90
                              }}
                            >
                              {(() => {
                                const deviseOptions = [...devises];
                                if (deviseForRow && !devises.find(d => d.id === deviseForRow)) {
                                  deviseOptions.push({ id: deviseForRow, designation: `#${deviseForRow}`, taux: 1 } as any);
                                }
                                return deviseOptions.map((d) => (
                                  <option key={d.id} value={d.id}>{d.designation}</option>
                                ));
                              })()}
                            </select>
                          </div>

                          <div style={{ width: '170px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                              <input
                                type="number"
                                min={0}
                                placeholder="0.00"
                                value={currentPrix}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  const prix = val === '' ? 0 : parseFloat(val);
                                  handlePrixFabricantChange(articleId, Number(fabId), prix, deviseForRow);
                                }}
                                style={{
                                  width: '120px',
                                  textAlign: 'right',
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  padding: '5px 8px',
                                  paddingRight: '40px',
                                  borderRadius: '6px',
                                  border: '1.5px solid',
                                  outline: 'none',
                                  color: '#1e293b',
                                  background: '#fff',
                                  transition: 'all 0.2s ease',
                                  borderColor: currentPrix !== '' ? '#1FB05B' : '#cbd5e1',
                                  boxShadow: currentPrix !== '' ? '0 0 0 2px rgba(31,176,91,0.04)' : 'none'
                                }}
                                onFocus={(e) => {
                                  e.currentTarget.style.borderColor = '#1FB05B';
                                  e.currentTarget.style.boxShadow = '0 0 0 2px rgba(31,176,91,0.1)';
                                }}
                                onBlur={(e) => {
                                  e.currentTarget.style.borderColor = currentPrix !== '' ? '#1FB05B' : '#cbd5e1';
                                  e.currentTarget.style.boxShadow = 'none';
                                }}
                              />
                              <span style={{
                                position: 'absolute',
                                right: '8px',
                                fontSize: '10px',
                                fontWeight: '700',
                                color: currentPrix !== '' ? '#1FB05B' : '#94a3b8',
                                textTransform: 'uppercase',
                                pointerEvents: 'none',
                                userSelect: 'none',
                              }}>
                                {deviseLabel}
                              </span>
                            </div>
                          </div>

                          <div style={{ width: '90px', display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveFabricant(articleId, Number(fabId))}
                              disabled={isLinkedToLots}
                              title={isLinkedToLots ? "Lié à des lots" : "Retirer"}
                              style={{
                                background: isLinkedToLots ? '#f8fafc' : '#fff5f5',
                                color: isLinkedToLots ? '#94a3b8' : '#e11d48',
                                border: `1px solid ${isLinkedToLots ? '#e2e8f0' : '#fecaca'}`,
                                borderRadius: 6,
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: isLinkedToLots ? 'not-allowed' : 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                outline: 'none'
                              }}
                            >
                              <FaTrash size={10} /> Retirer
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </td>
      </tr>
    );
  };

  return (
    <>
      {/* Modal pour gérer les lots (ajout/édition d'un lot) */}
      {showLotFormModal && selectedArticleId !== null && selectedInfo && (
        <LotModal
          show={showLotFormModal}
          onClose={() => setShowLotFormModal(false)}
          onSave={handleSaveLot}
          fabricant={fournisseurs}
          lot={editLotIdx !== null ? selectedInfo.lots[editLotIdx] : {
            lot: "",
            quantite: 0,
            fabricant_id: undefined,
            dateperemption: "",
            conditionnement_id: "",
            dureedevie: "",
            devise_id: selectedInfo.formData.devise_id
          }}
          productName={selectedInfo.productName}
          isEdit={editLotIdx !== null}
          loadingFabricants={loadingFabricants}
          errorFabricant={errorFabricants}
        />
      )}

      {/* Modal de gestion globale des lots */}
      {showLotsManager && selectedArticleId !== null && selectedInfo && (
        <LotsManagerModal
          show={showLotsManager}
          onClose={() => { setShowLotsManager(false); setSelectedArticleId(null); }}
          productName={selectedInfo.productName}
          quantiteDisponible={selectedInfo.quantiteDisponible}
          lots={selectedInfo.lots}
          fabricants={fournisseurs}
          onAddLot={() => {
            setEditLotIdx(null);
            setShowLotFormModal(true);
          }}
          onEditLot={(index) => {
            setEditLotIdx(index);
            setShowLotFormModal(true);
          }}
          onDeleteLot={(index) => {
            handleDeleteLot(selectedArticleId, index);
          }}
        />
      )}

      {showPricesModal && selectedArticleId !== null && selectedInfo && (
        <PricesModal
          show={showPricesModal}
          onClose={() => setShowPricesModal(false)}
          productName={selectedInfo.productName}
          prices={
            (selectedInfo.formData.detailprixfabricants || []).map((d: any) => {
              // Prioritizer l'array devises pour toujours avoir le label à jour
              let deviseLabel = "—";
              let deviseId = d.devise_id ?? selectedInfo.formData.devise_id;
              
              // Chercher d'abord dans l'array devises
              const found = devises.find(dev => String(dev.id) === String(deviseId));
              deviseLabel = found?.designation || (d.devise?.designation) || `#${deviseId}`;
              
              return {
                fabricant_id: d.fabricant_id,
                fabricantName: d.fabricant_id ? getFabricantName(d.fabricant_id) : "—",
                prixunitaire: d.prixunitaire,
                devise: deviseLabel
              };
            })
          }
        />
      )}

      {/* Modal de spécification technique */}
      {selectedArticleForSpec && (
        <SpecificationTechniqueFournisseurModal
          show={showSpecModal}
          onClose={() => {
            setShowSpecModal(false);
            setSelectedArticleForSpec(null);
          }}
          onSave={saveSpecification}
          elementType={Data.tender?.TSSCOD_0_0 === "MED" ? "MED" : "BES"}
          productName={selectedArticleForSpec.nom}
          initialData={
            selectedArticleForSpec.specificationTechnique && typeof selectedArticleForSpec.specificationTechnique === 'object'
              ? selectedArticleForSpec.specificationTechnique
              : undefined
          }
        />
      )}

      {/* 🆕 Modal de spécification technique Salama */}
      {selectedArticleForSalamaSpec && (
        <SpecificationTechniqueSalamaModal
          show={showSalamaSpecModal}
          onClose={() => {
            setShowSalamaSpecModal(false);
            setSelectedArticleForSalamaSpec(null);
          }}
          onSave={() => {}}
          productName={selectedArticleForSalamaSpec.nom}
          initialData={salamaSpecData || undefined}
          readOnly={true}
          elementType={Data.tender?.TSSCOD_0_0 === "MED" ? "MED" : "BES"}
          loading={loadingSalamaSpec}
          error={errorSalamaSpec}
        />
      )}

      {/* Modal de délai de livraison */}
      {selectedArticleForDelai && (
        <DelaiLivraisonModal
          show={showDelaiModal}
          onClose={() => {
            setShowDelaiModal(false);
            setSelectedArticleForDelai(null);
          }}
          onSave={saveDelaiLivraison}
          productName={selectedArticleForDelai.nom}
          initialData={getDelaiData(selectedArticleForDelai)}
        />
      )}
      
      {/* Affichage de la date de clôture si disponible */}
      {Data.datecloture && (
        <div className="alert mb-3" role="alert" style={{ 
          backgroundColor: new Date(Data.datecloture) < new Date() ? "#ffe0e0" : "#e0ffe0",
          color: new Date(Data.datecloture) < new Date() ? "#cc0000" : "#008800",
          border: `1px solid ${new Date(Data.datecloture) < new Date() ? "#cc0000" : "#008800"}`,
          borderRadius: "10px"
        }}>
          <strong>Date de clôture: </strong> 
          {new Date(Data.datecloture).toLocaleDateString('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
          {new Date(Data.datecloture) < new Date() && (
            <span> (Clôturé)</span>
          )}
        </div>
      )}

      {/* Documents à consulter */}
      <div
        className="bg-white p-2 rounded-3 mb-3 shadow-sm"
        style={{ border: "1.5px solid #1FB05B", borderRadius: "12px" }}
      >
        <h5
          className="mb-2 d-flex align-items-center"
          style={{
            color: "#1FB05B",
            paddingLeft: "8px",
            fontSize: "1.08rem",
            fontWeight: 600,
          }}
        >
          <img
            src={doc_info_icon}
            alt="info"
            style={{ width: "22px", marginRight: "8px" }}
          />
          Documents à consulter
        </h5>
        <div className="d-flex flex-wrap gap-2">
          {dashboardData.documentsAConsulter.map((doc, index) => (
            <div
              key={index}
              className="d-flex flex-column align-items-center p-2 pt-2 rounded-3"
              style={{
                minWidth: "50px",
                cursor: "pointer",
                transition: "0.3s",
                background: "#F7F7F7",
              }}
              onClick={() => window.open(`${BASE_URL}${doc.url}`, "_blank")}
            >
              <img
                src={doc_icon}
                alt="document"
                style={{ cursor: "pointer", height: "80px", padding: "0 2px" }}
              />
              <a
                rel="noopener noreferrer"
                className="text-dark text-decoration-none text-center"
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 500,
                  marginTop: "20px",
                }}
              >
                {doc.designation}
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* Documents fournis - Logique dynamique */}
      <div
        className="bg-white p-4 rounded-3 mb-3 shadow-sm"
        style={{ border: "1.5px solid #1FB05B", borderRadius: "12px" }}
      >
        <h5
          className="mb-2 d-flex align-items-center justify-content-between"
          style={{
            color: "#1FB05B",
            paddingLeft: "8px",
            fontSize: "1.08rem",
            fontWeight: 600,
          }}
        >
          <div className="d-flex align-items-center">
            <img
              src={doc_info_icon}
              alt="info"
              style={{ width: "22px", marginRight: "8px" }}
            />
            Documents fournis
          </div>
          <span className="badge bg-light text-dark" style={{ fontSize: "0.7rem" }}>
            {getDocumentsExistants().length} / {dashboardData.documentsFournis.length} fournis
          </span>
        </h5>

        {/* Documents déjà fournis */}
        {getDocumentsExistants().length > 0 && (
          <div className="mb-3">
            <h6 className="text-success mb-2" style={{ fontSize: "0.9rem" }}>
              <i className="fas fa-check-circle me-1"></i>
              Documents déjà fournis
            </h6>
            <div className="d-flex flex-wrap gap-2">
              {getDocumentsExistants().map((doc) => (
                <div
                  key={doc.id}
                  className="d-flex flex-column align-items-center p-2 rounded-3 position-relative"
                  style={{
                    minWidth: "50px",
                    background: "#d4edda",
                    border: "1px solid #c3e6cb",
                  }}
                >
                  {/* Bouton de suppression */}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-danger position-absolute"
                    style={{ 
                      top: "2px", 
                      right: "2px", 
                      padding: "2px 4px",
                      fontSize: "0.7rem",
                      borderRadius: "50%",
                      width: "20px",
                      height: "20px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    onClick={() => onDocumentReset && onDocumentReset(doc.attachement_id)}
                    title="Retirer ce document"
                  >
                    ×
                  </button>

                  <img
                    src={doc_icon}
                    alt="document"
                    onClick={() => window.open(BASE_URL + doc.file, "_blank")}
                    style={{ cursor: "pointer", height: "28px", padding: "0 2px" }}
                  />
                  <a
                    href={BASE_URL + doc.file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-dark text-decoration-none text-center"
                    style={{
                      fontSize: "0.58rem",
                      fontWeight: 500,
                      marginTop: "2px",
                      wordWrap: "break-word",
                      lineHeight: "1.2"
                    }}
                  >
                    {doc.designation}
                  </a>
                  <small className="text-success" style={{ fontSize: "0.55rem", marginTop: "2px" }}>
                    ✓ Fourni
                  </small>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Documents manquants - Interface d'upload */}
        {(() => {
          const documentsManquants = getDocumentsManquants();
          if (documentsManquants.length > 0) {
            return (
              <div >
                <h6 className="text-warning mb-2" style={{ fontSize: "0.9rem" }}>
                  <i className="fas fa-exclamation-triangle me-1"></i>
                  Documents à fournir ({documentsManquants.length})
                </h6>
                <div  style={{
                  
                }}>
                <UploadDocument
                  documents={documentsManquants}
                  onFileUpload={onDocumentUpload}
                  onFileReset={onDocumentReset}
                  acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                </div>
              </div>
            );
          }
          return null;
        })()}

        {/* Message si tous les documents sont fournis */}
        {getDocumentsExistants().length > 0 && getDocumentsManquants().length === 0 && (
          <div className="alert alert-success mb-0" style={{ padding: "8px 12px" }}>
            <div className="d-flex align-items-center">
              <i className="fas fa-check-circle text-success me-2"></i>
              <small>Tous les documents requis ont été fournis !</small>
            </div>
          </div>
        )}
      </div>

      {/* Spécifications Techniques */}
      <div
        className="bg-white p-2 rounded-3 mb-3 shadow-sm"
        style={{ border: "1.5px solid #1FB05B", borderRadius: "12px" }}
      >
        <h5
          className="mb-2 d-flex align-items-center justify-content-between"
          style={{
            color: "#1FB05B",
            paddingLeft: "8px",
            fontSize: "1.08rem",
            fontWeight: 600,
          }}
        >
          <div className="d-flex align-items-center">
            <img
              src={doc_info_icon}
              alt="info"
              style={{ width: "22px", marginRight: "8px" }}
            />
            Spécifications Techniques
          </div>
          <span className="badge bg-light text-dark" style={{ fontSize: "0.7rem" }}>
            {Data.articles?.filter((a: any) => a.specificationTechnique).length || 0} / {Data.articles?.length || 0} spécifications fournies
          </span>
        </h5>

        <div className="specs-container p-2">
          {/* Affichage compact en grille pour plusieurs articles */}
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3">
            {filteredArticles.map((article: any) => (
              <div key={article.id} className="col">
                <div className="spec-item h-100 p-3 rounded" 
                  style={{ 
                    border: article.specificationTechnique ? "1.5px solid #1FB05B" : "1.5px solid #e0e0e0",
                    backgroundColor: article.specificationTechnique ? "rgba(31, 176, 91, 0.05)" : "white",
                    transition: "all 0.3s ease",
                    cursor: "pointer"
                  }}
                  onClick={() => openSpecModal(article)}
                >
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h6 
                      className="mb-0 text-truncate" 
                      style={{ 
                        color: "#1f2937", 
                        fontWeight: 600, 
                        maxWidth: "70%",
                        fontSize: "0.938rem"
                      }}
                      title={article.nom}
                    >
                      {article.nom}
                    </h6>
                    
                    <div className="d-flex align-items-center gap-2">
                      <button
                        className="btn btn-sm d-flex align-items-center gap-1 px-2 py-1"
                        style={{ 
                          fontSize: '0.688rem',
                          backgroundColor: '#eff6ff', 
                          color: '#2563eb',
                          border: '1px solid #dbeafe',
                          borderRadius: '6px',
                          fontWeight: 600,
                          zIndex: 2
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          openSalamaSpecModal(article);
                        }}
                        title="Consulter les spécifications demandées par Salama"
                      >
                        <img src={doc_info_icon} alt="info" style={{ width: "12px" }} />
                        Spec. Salama
                      </button>

                      {article.specificationTechnique && (
                        <span 
                          className="badge" 
                          style={{ 
                            fontSize: '0.688rem',
                            backgroundColor: '#dcfce7',
                            color: '#16a34a',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontWeight: 600
                          }}
                          title="Spécification fournie"
                        >
                          ✓ Complété
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Aperçu compact des specs si elles existent */}
                  {article.specificationTechnique ? (
                    <div className="mt-2 p-2 rounded" style={{ backgroundColor: '#f9fafb', borderLeft: '3px solid #1FB05B' }}>
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <small style={{ color: '#6b7280', fontSize: '0.75rem', fontWeight: 600 }}>
                          <FaFileAlt className="me-1" style={{ color: '#1FB05B' }} />
                          Spécification enregistrée
                        </small>
                        <small style={{ color: '#1FB05B', fontSize: '0.688rem', fontWeight: 500 }}>
                          Cliquez pour modifier
                        </small>
                      </div>
                      {article.specificationTechnique.description && (
                        <p className="mb-1 text-truncate" style={{ fontSize: '0.75rem', color: '#374151' }}>
                          {article.specificationTechnique.description}
                        </p>
                      )}
                      {article.specificationTechnique.fichierTechnique && (
                        <small className="text-muted d-flex align-items-center" style={{ fontSize: '0.688rem' }}>
                          <FaFileAlt className="me-1" /> Fichier joint
                        </small>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 p-3 text-center rounded" style={{ backgroundColor: '#f9fafb', border: '1px dashed #e5e7eb' }}>
                      <FaPlus style={{ color: '#9ca3af', fontSize: '1.5rem', marginBottom: '8px' }} />
                      <p className="mb-0" style={{ fontSize: '0.813rem', color: '#6b7280' }}>
                        Cliquez pour ajouter des spécifications
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="d-flex align-items-center" style={{ paddingBottom: "10px", marginTop: "20px" }}>
        <h5 className="mb-0 d-flex align-items-center" style={{ color: "#1FB05B", paddingLeft: "15px", fontSize: "1.2rem" }}>
          <img src={doc_info_icon} alt="info" style={{ width: "20px", marginRight: "10px" }} />
          Détails de l'offre
        </h5>
        <span className="ms-2" style={{ color: "#CBCBCB" }}>({filteredArticles.length}/{(Data.articles || []).length}) Articles</span>
        <div className="ms-auto" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            background: "#ffffff",
            borderRadius: "8px",
            border: "1.5px solid #e2e8f0",
            padding: "0 12px",
            height: "36px",
            transition: "all 0.2s ease",
            boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.02)"
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#1FB05B";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(31, 176, 91, 0.08)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.boxShadow = "0 1px 2px 0 rgba(0, 0, 0, 0.02)";
          }}>
            <FaSearch size={14} color="#94a3b8" style={{ marginRight: 8, flexShrink: 0 }} />
            <input
              type="text"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
              placeholder="Rechercher un article..."
              style={{
                border: "none",
                background: "transparent",
                fontSize: 13,
                color: "#1e293b",
                outline: "none",
                flex: 1,
                fontWeight: 500
              }}
            />
          </div>
        </div>
      </div>

      {loadingDevises ? (
        <div className="alert alert-info mb-2" style={{ padding: "16px 20px", borderRadius: "10px" }}>
          <div className="d-flex align-items-center justify-content-center">
            <div className="spinner-border spinner-border-sm text-info me-2" role="status">
              <span className="visually-hidden">Chargement...</span>
            </div>
            <span>Chargement des devises et des prix en cours...</span>
          </div>
        </div>
      ) : (
        <div style={{ border: "1px solid #1FB05B", padding: "0px 10px", borderRadius: "5px" }}>
          <div className="form-container">
            <div className="table-container">
          <table className="professional-table">
            <thead>
              <tr>
                <th>Article</th>
                {!["AOR", "Consultation", "Cotation", "Achat Direct"].includes(Data.tender?.typemarche?.designation) && (Data.tender?.TSSCOD_0_0 === "MED" || Data.tender?.TSSCOD_0_0 === null) && (
                  <th>Target Price{Data.tender?.targetpricestatus === 1 && <FaExclamationCircle style={{ marginLeft: "5px", animation: "colorChange 1s infinite" }} />}</th>
                )}
                <th>Qté demandée</th>
                <th>Qté dispo</th>
                <th>Prix proposé</th>
                <th>Date livraison</th>
                <th>Délai livraison</th>
                <th>Incoterm</th>
                {(Data.tender?.TSSCOD_0_0 === "MED" || Data.tender?.TSSCOD_0_0 === null) ? <th>Détails produit</th> : <th>Commentaire</th>}
                <th>Sous-total</th>
              </tr>
            </thead>
            <style>{`@keyframes colorChange { 0% { color: white; } 50% { color: red; } 100% { color: white; } }`}</style>
            <tbody>
              {filteredArticles.map((article: any) => {
                const articleId = Number(article.id);
                const lots = getLots(article);
                const lotsCount = lots.length;
                const isOpen = !!openAccordions[articleId];
                const sousTotal = (() => {
                  const details = article.detailprixfabricants || [];
                  if (lots.length > 0 && details.length > 0) {
                    return lots.reduce((sum: number, lot: any) => {
                      const detail = details.find((d: any) => String(d.fabricant_id) === String(lot.fabricant_id));
                      return sum + ((Number(lot.quantite) || 0) * (Number(detail?.prixunitaire) || 0));
                    }, 0);
                  }
                  if (details.length === 1) {
                    return (Number(details[0].prixunitaire) || 0) * (Number(article.quantiteProposee) || 0);
                  }
                  return (Number(article.prixUnitairePropose) || 0) * (Number(article.quantiteProposee) || 0);
                })();

                return (
                  <React.Fragment key={article.id}>
                    <tr>
                      <td style={{ fontWeight: 500, color: '#2c3e50', cursor: 'pointer' }} onClick={() => toggleAccordion(articleId)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{
                            width: 22,
                            height: 22,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: isOpen ? '#1FB05B' : '#e8f9f0',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                          }}>
                            {isOpen
                              ? <FaChevronDown size={10} color="white" />
                              : <FaChevronRight size={10} color="#1FB05B" />}
                          </div>
                          {article.nom}
                        </div>
                      </td>
                      {!["AOR", "Consultation", "Cotation", "Achat Direct"].includes(Data.tender?.typemarche?.designation) && (Data.tender?.TSSCOD_0_0 === "MED" || Data.tender?.TSSCOD_0_0 === null) && (
                        <td>
                          <div className="target-price-cell">
                            {(() => {
                              // Filter devises to exclude empty designations
                              const validDevises = devises.filter((d: any) => d.designation && d.designation.trim());
                              // Use article.devise_id if valid, else use first valid devise
                              const deviseIdToUse = validDevises.some((d: any) => d.id === article.devise_id)
                                ? article.devise_id
                                : (validDevises.length > 0 ? validDevises[0].id : null);
                              
                              return (
                                <>
                                  <span>{convertFromMGA(article.prix ?? 0, deviseIdToUse).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</span>
                                  <select className="devise-inline" value={deviseIdToUse || ""} onChange={(e) => handleGlobalDeviseChange(e.target.value ? Number(e.target.value) : null)}>
                                    {validDevises.map((d: any) => <option key={d.id} value={d.id}>{d.designation}</option>)}
                                  </select>
                                  {article.targetpricestatus === 1 && <FaExclamationCircle style={{ color: '#ff6b35', animation: "colorChange 1s infinite" }} />}
                                </>
                              );
                            })()}
                          </div>
                        </td>
                      )}
                      <td><span className="chip">{(article.quantiteDemandee ?? 0).toLocaleString()}</span></td>
                      <td>
                        <input type="number" className="input-field" placeholder="0" min="0" max={article.quantiteDemandee}
                          value={article.quantiteProposee || ''}
                          onChange={(e) => handleProduitChange(articleId, "quantiteProposee", parseInt(e.target.value) || 0)} />
                      </td>
                      <td>
                        <div style={{ fontWeight: "bold" }}>
                          {(() => {
                            const details = article.detailprixfabricants || [];
                            if (details.length === 0) return <span>{"\u2014"}</span>;
                            if (details.length === 1) {
                              const d = details[0];
                              const deviseId = d.devise_id ?? article.devise_id ?? devises[0]?.id;
                              const deviseLabel = devises.find(dev => String(dev.id) === String(deviseId))?.designation || "";
                              return <span>{d.prixunitaire?.toLocaleString()} <small>{deviseLabel}</small></span>;
                            }

                            return (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setSelectedArticleId(articleId);
                                  setShowPricesModal(true);
                                }}
                                style={{
                                  border: "1px solid #cbd5e1",
                                  background: "#ffffff",
                                  color: "#1e293b",
                                  borderRadius: 6,
                                  padding: "2px 6px",
                                  fontSize: 10,
                                  fontWeight: 700,
                                  cursor: "pointer"
                                }}
                              >
                                Voir
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                      <td>
                        <input type="date" className="input-field" value={article.dateLivraison || ''} onChange={(e) => handleProduitChange(articleId, "dateLivraison", e.target.value)} />
                      </td>
                      <td>
                        {(() => {
                          const delaiData = getDelaiData(article);
                          return (
                            <button type="button" className={`btn-delai ${delaiData ? 'has-value' : ''}`} onClick={() => openDelaiModal(article)}>
                              {delaiData ? <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#1FB05B' }}>Total: {delaiData.total} jours</div> : <span>Définir délai</span>}
                            </button>
                          );
                        })()}
                      </td>
                      <td>
                        <div className="button-container">
                          <div className="button-row">
                            <button type="button" className={`button ${article.typeCondition === "DDP" ? "button-active" : ""}`}
                              onClick={() => handleProduitTermeChange(articleId, "DDP")}>DDP</button>
                            <button type="button" className={`button ${article.typeCondition === "Autre" ? "button-warning" : ""}`}
                              onClick={() => handleProduitTermeChange(articleId, "Autre")}>commentaire</button>
                          </div>
                          {article.typeCondition === "Autre" && (
                            <input type="text" className="input-field" style={{ width: "7vw" }} placeholder="Saisir commentaire"
                              value={article.commentaireTerme || ""} onChange={(e) => handleProduitChange(articleId, "commentaireTerme", e.target.value)} />
                          )}
                        </div>
                      </td>
                      {(Data.tender?.TSSCOD_0_0 === "MED" || Data.tender?.TSSCOD_0_0 === null) ? (
                        <td>
                          {lotsCount > 0 ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedArticleId(articleId);
                                setShowLotsManager(true);
                              }}
                              style={{
                                background: '#e8f9f0',
                                color: '#1FB05B',
                                border: 'none',
                                borderRadius: 20,
                                padding: '4px 12px',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                                transition: 'all 0.2s ease',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#d2f3e0';
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = '#e8f9f0';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              {lotsCount} spec{lotsCount > 1 ? 's' : ''} <FaEdit size={11} />
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setSelectedArticleId(articleId);
                                setShowLotsManager(true);
                              }}
                              style={{
                                background: 'transparent',
                                color: '#1FB05B',
                                border: '1.5px dashed #1FB05B',
                                borderRadius: 6,
                                padding: '3px 10px',
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                                transition: 'all 0.2s ease',
                                outline: 'none'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = '#e8f9f0';
                                e.currentTarget.style.transform = 'scale(1.02)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <FaPlus size={9} /> Configurer
                            </button>
                          )}
                        </td>
                      ) : (
                        <td>
                          <input type="text" className="input-field" style={{ width: "7vw" }} placeholder="Saisir commentaire"
                            value={article.commentaire || ""} onChange={(e) => handleProduitChange(articleId, "commentaire", e.target.value)} />
                        </td>
                      )}
                      <td className="sous-total" style={{
                        color: !["AOR", "Consultation", "Cotation", "Achat Direct"].includes(Data.tender?.typemarche?.designation) && article.devise_id === null &&
                          sousTotal > (article.prix || 0) * Math.min(article.quantiteProposee || 0, article.quantiteDemandee || 0)
                          ? "#ff6b35" : "#1FB05B",
                      }}>
                        {(() => {
                          const sousTotalFinal = article.typeCondition === "Autre" ? sousTotal * (article.coeff || 1) : sousTotal;
                          const deviseLabel = devises.find(d => String(d.id) === String(article.devise_id))?.designation || "";
                          return <div><span style={{ fontWeight: 600 }}>{sousTotalFinal.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <small style={{ fontSize: '0.75rem' }}>{deviseLabel}</small></span></div>;
                        })()}
                      </td>
                    </tr>
                    {isOpen && renderAccordionRow(article)}
                  </React.Fragment>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={1} style={{ textAlign: 'left', fontWeight: 600 }}>Total de l'offre</td>
                {!["AOR", "Consultation", "Cotation", "Achat Direct"].includes(Data.tender?.typemarche?.designation) && (Data.tender?.TSSCOD_0_0 === "MED" || Data.tender?.TSSCOD_0_0 === null) && <td></td>}
                <td></td><td></td><td></td><td></td><td></td><td></td><td></td>
                <td className="total-value" style={{ textAlign: 'center' }}>
                  {(() => {
                    const total = calculerTotal();
                    const firstArticle = Data.articles[0];
                    const globalDeviseId = firstArticle ? firstArticle.devise_id : null;
                    const deviseLabel = devises.find(d => String(d.id) === String(globalDeviseId))?.designation || "";
                    return <div><span style={{ fontWeight: 700, fontSize: '1rem' }}>{total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <small style={{ fontSize: '0.75rem', fontWeight: 500 }}>{deviseLabel}</small></span></div>;
                  })()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  )}

      {/* Pagination */}
      <PaginationComponent
        currentPage={1}
        totalPages={3}
        onPageChange={(page) =>
          console.log("Changement de page vers :", page)
        }
        onPerPageChange={(perPage) =>
          console.log(
            "Changement du nombre d'éléments par page vers :",
            perPage
          )
        }
        perPage={5}
      />


      {/* Bouton de soumission */}
      <div className="mt-4 d-flex flex-column align-items-center">
        {/* Alerte si le contrat est clôturé/résilié */}
        {isContratCloture && (
          <div 
            className="alert alert-danger mb-3 d-flex align-items-center" 
            role="alert"
            style={{ 
              borderRadius: "12px", 
              border: "2px solid #dc3545",
              backgroundColor: "#f8d7da",
              padding: "16px 20px"
            }}
          >
            <i className="fas fa-ban me-2" style={{ fontSize: "1.2rem" }}></i>
            <div>
              <strong>Contrat clôturé</strong> - Aucune modification n'est possible sur cette soumission.
            </div>
          </div>
        )}
        
        {/* Alerte si la date de clôture est dépassée (mais contrat non résilié) */}
        {!isContratCloture && Data.datecloture && new Date(Data.datecloture) < new Date() ? (
          <div className="alert alert-warning mb-3" role="alert">
            La date de clôture de cet appel d'offres est atteinte.
          </div>
        ) : null}
        
        <button
          type="button"
          className={`btn btn-lg px-5 py-3 ${(isContratCloture || (Data.datecloture && new Date(Data.datecloture) < new Date())) ? 'btn-secondary' : 'btn-success'}`}
          style={{
            fontSize: "1.1rem",
            fontWeight: isSubmitting ? 600 : 500,
            borderRadius: "12px",
            backgroundColor: isSubmitting ? "#e9ecef" : (isContratCloture || (Data.datecloture && new Date(Data.datecloture) < new Date())) ? "#6c757d" : "#1FB05B",
            border: isSubmitting ? "2px solid #999" : (isContratCloture || (Data.datecloture && new Date(Data.datecloture) < new Date())) ? "1px solid #6c757d" : "1px solid #1FB05B",
            boxShadow: isSubmitting ? "inset 0 2px 4px rgba(0,0,0,0.1)" : (isContratCloture || (Data.datecloture && new Date(Data.datecloture) < new Date())) ? "0 4px 8px rgba(108, 117, 125, 0.3)" : "0 4px 8px rgba(31, 176, 91, 0.3)",
            cursor: isSubmitting ? "not-allowed" : "pointer",
            opacity: isSubmitting ? 0.6 : 1,
            pointerEvents: isSubmitting ? "none" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            transition: "all 0.3s ease",
          }}
          onClick={async (e) => {
            if (isSubmitting) return;
            setIsSubmitting(true);
            try {
              await handleSubmit(e);
            } finally {
              setIsSubmitting(false);
            }
          }}
          disabled={isSubmitting || isContratCloture || (Data.datecloture && new Date(Data.datecloture) < new Date())}
        >
          {isSubmitting && (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
              style={{ 
                borderColor: "#999", 
                borderRightColor: "transparent",
                animation: "spin 0.8s linear infinite"
              }}
            ></span>
          )}
          <span style={{ color: isSubmitting ? "#666" : "inherit" }}>
            {isSubmitting ? 'Mise à jour en cours... (Veuillez patienter)' : isContratCloture ? 'Contrat clôturé' : 'Mettre à jour la soumission'}
          </span>
        </button>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </>
  );
};

export default VueGlobale;
