import React, { useState, useMemo, useEffect } from "react";
import { Form } from "react-bootstrap";
import doc_info_icon from "../../assets/images/doc_info_icon.png";
import doc_icon from "../../assets/images/doc_icon.png";
import { FaTruck, FaCheck, FaFileAlt, FaChevronDown, FaPlus, FaTimes, FaUser } from "react-icons/fa";
import { BASE_URL } from "../../utils/variable";
import UploadDocument from "../UploadDocument";
import { graphQLClient } from "../../api/client";
import VehiculeModal, { VehiculeData } from "../ui/VehiculeModal";
import ChauffeurModal, { ChauffeurData } from "../ui/ChauffeurModal";
import "../../assets/scss/table.scss";
import { useAuthContext } from "../../hooks/useUserhook";
import { useCrudGraph } from "../../hooks/useCrudGraph";
import { getFlotteFournisseurQuery } from "../../api/graphql/queries";
import { OffreTonnageData } from "./OffresTransportTabAO";
import { FlotteSelection, NouveauVehicule } from "./FlotteTransportTabAO";

// Interface pour les offres de transport groupées
interface OffreTransportGroup {
  sectionId: string;
  axeDesignation: string;
  province: string;
  capacityRanges: {
    id: string;
    axeTonnageId: string;
    tonnageMin: number;
    tonnageMax: number;
    volumeMin: number;
    volumeMax: number;
    prixPropose: number;
  }[];
}

// VehicleAssignment n'est plus utilisé - les véhicules sont maintenant sélectionnés globalement

interface Tonnage {
  id: string;
  tonnage: number;
  designation: string;
  unite?: { code: string };
}

interface TypeVehicule {
  id: string;
  designation: string;
}

// Interface pour les véhicules retournés par l'API
interface VehiculeAPI {
  id: string;
  matricule: string;
  marque: string;
  description: string | null;
  volume: number;
  etat: number;
  tonnage_id: string;
  tonnage: { id: string; designation: string; tonnage: number } | null;
  typevehicule_id: string;
  typevehicule: { id: string; designation: string } | null;
  chauffeur_id: number | null;
  chauffeur: { id: string; nom: string; telephone: string; email: string; adresse: string } | null;
}

// Interface pour les données de parking retournées par l'API
interface ParkingData {
  id: string;
  vehicules: VehiculeAPI[]; // Tableau de véhicules par parking
}

interface FournisseurFlotte {
  id: string;
  nom: string;
  code: string | null;
  parkings: ParkingData[];
}

interface VueGlobaleTransportProps {
  Data: any;
  setData: React.Dispatch<React.SetStateAction<any>>;
  dashboardData: {
    documentsAConsulter: Array<{ id: string; designation: string; url: string; isannexe: number }>;
    documentsFournis: Array<{ 
      id: string; 
      designation: string; 
      documentspecification: { id: string; designation: string }; 
      url: string; 
      isannexe: number 
    }>;
  };
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  isSubmitting?: boolean;
  documentsFournis?: Array<{ id: string; file: string; attachement_id: string; ao_id: string }>;
  uploadedDocs?: Record<string, File[]>;
  onDocumentUpload?: (documentId: string, files: File | File[]) => void;
  onDocumentReset?: (documentId: string) => void;
  // Callbacks pour synchronisation avec le parent
  offresTransport?: Record<string, OffreTonnageData>;
  onOffresChange?: (offres: Record<string, OffreTonnageData>) => void;
  flotteSelection?: FlotteSelection;
  onFlotteChange?: (flotte: FlotteSelection) => void;
}

const VueGlobaleTransport: React.FC<VueGlobaleTransportProps> = ({
  Data, setData, dashboardData, handleSubmit, isSubmitting = false, documentsFournis = [], uploadedDocs = {}, onDocumentUpload, onDocumentReset,
  offresTransport = {},
  onOffresChange,
  flotteSelection: flotteSelectionFromParent,
  onFlotteChange,
}) => {
  // Récupérer le fournisseur connecté
  const { user } = useAuthContext();
  const fournisseurId = user?.fournisseur_id;

  // Récupérer la flotte du fournisseur via GraphQL
  const { data: fournisseursData, isLoading: loadingFlotte } = useCrudGraph<FournisseurFlotte>("fournisseurs").useFetchAll(
    getFlotteFournisseurQuery(fournisseurId || 0),
    {},
    { enabled: !!fournisseurId }
  );
  // ============== CONTRÔLE DES MOCKS ==============
  const useMockData = false; // Mettre à true pour utiliser les données mock, false pour les données réelles
  
  // ============== MOCK DATA COMPLET POUR AFFICHAGE ==============
  
  // Mock documents à consulter (disponibles dans dashboardData)
  const MOCK_DOCUMENTS_A_CONSULTER = useMockData && dashboardData.documentsAConsulter.length === 0
    ? [
        { id: "doc-1", designation: "Cahier des charges", url: "/documents/cahier_charges.pdf", isannexe: 0 },
        { id: "doc-2", designation: "Règlement transport", url: "/documents/reglement.pdf", isannexe: 0 },
        { id: "doc-3", designation: "Annexe technique", url: "/documents/annexe_technique.pdf", isannexe: 0 },
      ]
    : dashboardData.documentsAConsulter;

  // Mock documents à fournir (dans documentsFournis de dashboardData)
  const MOCK_DOCUMENTS_FOURNIS_REQUIS = useMockData && dashboardData.documentsFournis.length === 0
    ? [
        { id: "att-1", designation: "Attestation fiscale", documentspecification: { id: "sp-1", designation: "Attestation fiscale" }, url: "", isannexe: 1 },
        { id: "att-2", designation: "Licence de transport", documentspecification: { id: "sp-2", designation: "Licence de transport" }, url: "", isannexe: 1 },
        { id: "att-3", designation: "Assurance véhicules", documentspecification: { id: "sp-3", designation: "Assurance véhicules" }, url: "", isannexe: 1 },
      ]
    : dashboardData.documentsFournis;

  // Mock documents déjà fournis sur le serveur
  const MOCK_DOCUMENTS_FOURNIS_SERVEUR = useMockData && documentsFournis.length === 0
    ? [
        { id: "df-1", file: "/uploads/attestation_fiscale_2024.pdf", attachement_id: "att-1", ao_id: "ao-123" },
      ]
    : documentsFournis;

  // Mock date de clôture (dans 15 jours)
  const MOCK_DATE_CLOTURE = useMockData && !Data.datecloture
    ? new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
    : Data.datecloture || new Date().toISOString();

  // Utiliser les mocks si les données sont vides
  const effectiveDashboardData = {
    documentsAConsulter: (MOCK_DOCUMENTS_A_CONSULTER || []).filter(Boolean),
    documentsFournis: (MOCK_DOCUMENTS_FOURNIS_REQUIS || []).filter(Boolean),
  };
  const effectiveDocumentsFournis = MOCK_DOCUMENTS_FOURNIS_SERVEUR;
  const effectiveDateCloture = MOCK_DATE_CLOTURE;

  // ============== FIN MOCK DATA ==============

  // États pour les sections dépliables - toutes ouvertes par défaut pour une meilleure UX
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(["docsConsulter", "documents", "flotte", "offres", "axe-DIANA", "axe-EST"]));

  // États flotte - utiliser les véhicules depuis l'API ou les mocks
  const [vehiculesExistants, setVehiculesExistants] = useState<Array<{
    id: string;
    matricule: string;
    marque: string;
    description: string;
    tonnage: { designation: string; tonnage: number } | null;
    typevehicule: { designation: string } | null;
    chauffeur: { id: string; nom: string; telephone: string } | null;
  }>>([]);
  
  // Nouveaux véhicules ajoutés via modal
  const [nouveauxVehicules, setNouveauxVehicules] = useState<NouveauVehicule[]>(
    flotteSelectionFromParent?.nouveaux_vehicules || []
  );
  
  // IDs des véhicules existants EXCLUS (checkboxes) - ceux qui ne peuvent pas participer
  const [excludedVehiculeIds, setExcludedVehiculeIds] = useState<Set<number>>(new Set());
  
  const [tonnages, setTonnages] = useState<Tonnage[]>([]);
  const [typesVehicule, setTypesVehicule] = useState<TypeVehicule[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [showVehiculeModal, setShowVehiculeModal] = useState(false);
  const [showChauffeurModal, setShowChauffeurModal] = useState(false);
  const [tempVehiculeData, setTempVehiculeData] = useState<VehiculeData | null>(null);

  // Recherche de véhicules
  const [searchQuery, setSearchQuery] = useState("");

  // Extraire les véhicules depuis les parkings du fournisseur (API)
  useEffect(() => {
    if (fournisseursData && fournisseursData.length > 0) {
      const fournisseur = fournisseursData[0];
      const parkings = fournisseur.parkings || [];
      
      // Extraire tous les véhicules de tous les parkings (structure: parkings[].vehicules[])
      const vehiculesFromApi = parkings.flatMap((parking) => {
        const vehicules = parking.vehicules || [];
        return vehicules.map((v) => ({
          id: v.id,
          matricule: v.matricule || "",
          marque: v.marque || "",
          description: v.description || "",
          tonnage: v.tonnage,
          typevehicule: v.typevehicule,
          chauffeur: v.chauffeur,
        }));
      });

      console.log("🚚 [VueGlobaleTransport] Véhicules chargés depuis API:", vehiculesFromApi);
      setVehiculesExistants(vehiculesFromApi);
    }
  }, [fournisseursData]);

  // Propager les changements de flotte vers le parent (structure simplifiée - tous sauf exclus)
  useEffect(() => {
    if (onFlotteChange) {
      // Calculer les véhicules à inclure = tous sauf les exclus
      const vehiculesInclus = vehiculesExistants
        .map((v) => parseInt(v.id))
        .filter((id) => !excludedVehiculeIds.has(id));
      
      onFlotteChange({
        vehicules_existants: vehiculesInclus,
        nouveaux_vehicules: nouveauxVehicules,
      });
    }
  }, [excludedVehiculeIds, nouveauxVehicules, vehiculesExistants]);

  // Charger les options API
  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const tonnagesResponse = await graphQLClient.post("", { query: `{ tonnages { id, tonnage, designation, unite { code } } }` });
        if (tonnagesResponse?.data?.data?.tonnages) setTonnages(tonnagesResponse.data.data.tonnages);
        const typesResponse = await graphQLClient.post("", { query: `{ typevehicules { id, designation } }` });
        if (typesResponse?.data?.data?.typevehicules) setTypesVehicule(typesResponse.data.data.typevehicules);
      } catch (err) {
        console.error("Erreur:", err);
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  // Toggle section
  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(section)) newSet.delete(section);
      else newSet.add(section);
      return newSet;
    });
  };

  // Mock data pour les offres de transport
  const mockOffreGroups: OffreTransportGroup[] = useMockData && !Data.offreGroups
    ? [
        { sectionId: "axe-DIANA", axeDesignation: "DIANA", province: "Province 1", capacityRanges: [
          { id: "1", axeTonnageId: "at-1", tonnageMin: 8, tonnageMax: 10, volumeMin: 12, volumeMax: 15, prixPropose: 150000 },
          { id: "2", axeTonnageId: "at-2", tonnageMin: 23, tonnageMax: 25, volumeMin: 35, volumeMax: 38, prixPropose: 280000 },
          { id: "3", axeTonnageId: "at-3", tonnageMin: 68, tonnageMax: 70, volumeMin: 100, volumeMax: 105, prixPropose: 0 },
        ]},
        { sectionId: "axe-EST", axeDesignation: "EST", province: "Province 2", capacityRanges: [
          { id: "4", axeTonnageId: "at-4", tonnageMin: 8, tonnageMax: 10, volumeMin: 12, volumeMax: 15, prixPropose: 320000 },
          { id: "5", axeTonnageId: "at-5", tonnageMin: 23, tonnageMax: 25, volumeMin: 35, volumeMax: 38, prixPropose: 450000 },
        ]}
      ]
    : Data.offreGroups || [];



  const getAxeAndTonnageIdsFromAxeTonnageId = (axeTonnageId: string): { axeId?: number; tonnageId?: number } => {
    const match = /^axe_(\d+)_tonnage_(\d+)$/.exec(String(axeTonnageId));
    if (!match?.[1] || !match?.[2]) return {};
    return {
      axeId: Number.parseInt(match[1], 10),
      tonnageId: Number.parseInt(match[2], 10),
    };
  };

  // Toggle exclusion d'un véhicule existant (cocher = exclure de la soumission)
  const toggleVehiculeExclusion = (vehiculeId: number) => {
    setExcludedVehiculeIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(vehiculeId)) {
        newSet.delete(vehiculeId);
      } else {
        newSet.add(vehiculeId);
      }
      return newSet;
    });
  };

  // Exclure/Inclure tous les véhicules
  const toggleExcludeAll = () => {
    if (excludedVehiculeIds.size === vehiculesExistants.length) {
      // Tous sont exclus, donc on les réinclut tous
      setExcludedVehiculeIds(new Set());
    } else {
      // Exclure tous les véhicules
      setExcludedVehiculeIds(new Set(vehiculesExistants.map((v) => parseInt(v.id))));
    }
  };

  // Supprimer un nouveau véhicule
  const removeNouveauVehicule = (index: number) => {
    setNouveauxVehicules((prev) => prev.filter((_, i) => i !== index));
  };

  // Ajouter un nouveau véhicule via modal avec chauffeur
  const handleAddNouveauVehicule = (data: VehiculeData, chauffeurData?: ChauffeurData) => {
    const nouveauVehicule: NouveauVehicule = {
      typevehicule_id: data.typevehicule_id,
      matricule: data.matricule,
      marque: data.marque,
      tonnage_id: data.tonnage_id,
      description: data.description,
      volume: data.volume,
    };

    if (chauffeurData) {
      nouveauVehicule.nouveau_chauffeur = {
        nom: chauffeurData.nom,
        email: chauffeurData.email || "",
        telephone: chauffeurData.telephone,
        adresse: chauffeurData.adresse || "",
        code: chauffeurData.code || "",
      };
    }
    
    setNouveauxVehicules((prev) => [...prev, nouveauVehicule]);
  };

  // Fonctions documents - utilisant les données effectives (mocks si vides)
  const getDocumentsManquants = () => {
    const documentsRequisNonFournis = effectiveDashboardData.documentsFournis.filter((docRequis: any) => {
      const requiredId = String(docRequis?.id ?? "");
      if (!requiredId) return false;

      return !effectiveDocumentsFournis.some((docFourni: any) => {
        const fourniId = String(docFourni?.attachement_id ?? docFourni?.offretransportdocspecifi_id ?? "");
        return fourniId === requiredId;
      });
    });

    return documentsRequisNonFournis.map((doc: any, idx: number) => {
      const id = String(doc?.id ?? idx);
      const name =
        doc?.documentspecification?.designation ??
        doc?.designation ??
        `Document ${idx + 1}`;

      return {
        id,
        name,
        uploaded: (uploadedDocs[id] || []).length > 0,
        uploadedFiles: uploadedDocs[id] || [],
        attachement_id: id,
      };
    });
  };
  const getDocumentsExistants = () =>
    effectiveDocumentsFournis.map((docFourni: any) => {
      const fourniId = String(docFourni?.attachement_id ?? docFourni?.offretransportdocspecifi_id ?? "");
      const docRequis = effectiveDashboardData.documentsFournis.find(
        (d: any) => String(d?.id ?? "") === fourniId
      );
      const designation =
        docRequis?.documentspecification?.designation ??
        docRequis?.designation ??
        docFourni?.designation ??
        `Document ${docFourni?.id ?? ""}`;

      return {
        ...docFourni,
        designation,
      };
    });

  // Compteurs
  const totalCapacityRanges = useMemo(() => mockOffreGroups.reduce((acc, g) => acc + g.capacityRanges.length, 0), [mockOffreGroups]);
  const validOffersCount = useMemo(() => mockOffreGroups.reduce((acc, g) => acc + g.capacityRanges.filter(r => r.prixPropose > 0).length, 0), [mockOffreGroups]);
  const getSelectedCountForSection = (sectionId: string): number => mockOffreGroups.find(g => g.sectionId === sectionId)?.capacityRanges.filter(r => r.prixPropose > 0).length || 0;
  // Nombre de véhicules qui seront soumis (non exclus + nouveaux)
  const totalInclus = vehiculesExistants.length - excludedVehiculeIds.size + nouveauxVehicules.length;
  const totalExclus = excludedVehiculeIds.size;
  const docsExistantsCount = getDocumentsExistants().length;
  const docsRequisCount = effectiveDashboardData.documentsFournis.length;

  // Filtrer les véhicules selon la recherche
  const filteredVehicules = vehiculesExistants.filter((v) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      v.matricule.toLowerCase().includes(query) ||
      v.marque.toLowerCase().includes(query) ||
      v.typevehicule?.designation.toLowerCase().includes(query) ||
      v.chauffeur?.nom.toLowerCase().includes(query)
    );
  });

  const handlePrixChange = (groupId: string, rangeId: string, value: number) => {
    const targetGroup = mockOffreGroups.find((g) => g.sectionId === groupId);
    const targetRange = targetGroup?.capacityRanges?.find((r) => r.id === rangeId);

    const updatedGroups = mockOffreGroups.map((group) =>
      group.sectionId === groupId
        ? {
            ...group,
            capacityRanges: group.capacityRanges.map((range) =>
              range.id === rangeId ? { ...range, prixPropose: value } : range
            ),
          }
        : group
    );
    setData({ ...Data, offreGroups: updatedGroups });

    // Synchroniser vers le parent (source de vérité pour le submit)
    if (onOffresChange && targetRange?.axeTonnageId) {
      const { axeId, tonnageId } = getAxeAndTonnageIdsFromAxeTonnageId(targetRange.axeTonnageId);
      if (axeId && tonnageId) {
        onOffresChange({
          ...offresTransport,
          [targetRange.axeTonnageId]: {
            axeTonnageId: targetRange.axeTonnageId,
            axe_id: axeId,
            tonnage_id: tonnageId,
            prixPropose: value,
          },
        });
      }
    }
  };

  return (
    <>
      {/* Date de clôture - toujours affichée avec mock si nécessaire */}
      <div className="alert mb-3" role="alert" style={{ backgroundColor: new Date(effectiveDateCloture) < new Date() ? "#ffe0e0" : "#e0ffe0", color: new Date(effectiveDateCloture) < new Date() ? "#cc0000" : "#008800", border: `1px solid ${new Date(effectiveDateCloture) < new Date() ? "#cc0000" : "#008800"}`, borderRadius: "10px" }}>
        <strong>Date de clôture: </strong> {new Date(effectiveDateCloture).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
        {new Date(effectiveDateCloture) < new Date() && <span> (Clôturé)</span>}
      </div>

      {/* Documents à consulter - section dépliable */}
      <div className="bg-white rounded-3 mb-3 shadow-sm" style={{ border: "1.5px solid #1FB05B", borderRadius: "12px", overflow: "hidden" }}>
        <button 
          type="button"
          className="d-flex align-items-center justify-content-between p-3 w-100 border-0" 
          style={{ backgroundColor: "#f0f9f3", cursor: "pointer", transition: "background-color 0.2s ease" }} 
          onClick={() => toggleSection("docsConsulter")}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f5ea")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f9f3")}
        >
          <div className="d-flex align-items-center">
            <img src={doc_info_icon} alt="info" style={{ width: "20px", marginRight: "8px" }} />
            <h5 className="mb-0" style={{ color: "#1FB05B", fontSize: "1.08rem", fontWeight: 600 }}>Documents à consulter</h5>
          </div>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span className="badge" style={{ backgroundColor: "#1FB05B", color: "white" }}>{effectiveDashboardData.documentsAConsulter.length} document(s)</span>
            <span style={{ transition: "transform 0.3s ease", transform: expandedSections.has("docsConsulter") ? "rotate(0deg)" : "rotate(-90deg)", display: "inline-flex" }}><FaChevronDown color="#1FB05B" /></span>
          </div>
        </button>
        <div style={{ maxHeight: expandedSections.has("docsConsulter") ? "400px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
          <div className="p-3 d-flex flex-wrap gap-3">
            {effectiveDashboardData.documentsAConsulter.filter(Boolean).map((doc: any, idx: number) => (
              <button
                type="button" 
                key={doc?.id ?? idx} 
                className="d-flex flex-column align-items-center p-2 rounded-3 border-0" 
                style={{ minWidth: "80px", maxWidth: "100px", cursor: "pointer", background: "#F7F7F7", transition: "transform 0.2s ease, box-shadow 0.2s ease" }} 
                onClick={() => window.open(`${BASE_URL}${doc?.url ?? ""}`, "_blank")}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
              >
                <img src={doc_icon} alt="document" style={{ height: "50px", marginBottom: "8px" }} />
                <span className="text-dark text-center" style={{ fontSize: "0.7rem", fontWeight: 500, lineHeight: "1.2" }}>{doc?.designation ?? doc?.documentspecification?.designation ?? `Document ${idx + 1}`}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Documents fournis - section dépliable avec animation */}
      <div className="bg-white rounded-3 mb-3 shadow-sm" style={{ border: "1.5px solid #1FB05B", borderRadius: "12px", overflow: "hidden" }}>
        <button 
          type="button"
          className="d-flex align-items-center justify-content-between p-3 w-100 border-0" 
          style={{ backgroundColor: "#f0f9f3", cursor: "pointer", transition: "background-color 0.2s ease" }} 
          onClick={() => toggleSection("documents")}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f5ea")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f9f3")}
        >
          <div className="d-flex align-items-center"><FaFileAlt style={{ color: "#1FB05B", marginRight: "8px" }} /><h5 className="mb-0" style={{ color: "#1FB05B", fontSize: "1.08rem", fontWeight: 600 }}>Documents fournis</h5></div>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span className="badge" style={{ backgroundColor: docsExistantsCount === docsRequisCount && docsRequisCount > 0 ? "#1FB05B" : "#ffc107", color: "white", transition: "background-color 0.3s ease" }}>{docsExistantsCount} / {docsRequisCount} fournis</span>
            <span style={{ transition: "transform 0.3s ease", transform: expandedSections.has("documents") ? "rotate(0deg)" : "rotate(-90deg)", display: "inline-flex" }}><FaChevronDown color="#1FB05B" /></span>
          </div>
        </button>
        <div style={{ maxHeight: expandedSections.has("documents") ? "500px" : "0", overflow: "hidden", transition: "max-height 0.4s ease", opacity: expandedSections.has("documents") ? 1 : 0 }}>
          <div className="p-3">
            {getDocumentsExistants().length > 0 && (
              <div className="mb-3"><h6 className="text-success mb-2" style={{ fontSize: "0.9rem" }}><FaCheck className="me-1" /> Documents déjà fournis</h6>
                <div className="d-flex flex-wrap gap-2">
                  {getDocumentsExistants().map((doc) => (
                    <div key={doc.id} className="d-flex flex-column align-items-center p-2 rounded-3 position-relative" style={{ minWidth: "50px", background: "#d4edda", border: "1px solid #c3e6cb" }}>
                      <button type="button" className="btn btn-sm btn-outline-danger position-absolute" style={{ top: "2px", right: "2px", padding: "2px 4px", fontSize: "0.7rem", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => onDocumentReset?.(doc.attachement_id)}>×</button>
                      <button type="button" onClick={() => window.open(BASE_URL + doc.file, "_blank")} style={{ cursor: "pointer", border: "none", background: "transparent", padding: 0 }}>
                        <img src={doc_icon} alt="document" style={{ height: "28px" }} />
                      </button>
                      <a href={BASE_URL + doc.file} target="_blank" rel="noopener noreferrer" className="text-dark text-decoration-none text-center" style={{ fontSize: "0.58rem", fontWeight: 500, marginTop: "2px" }}>{doc.designation}</a>
                      <small className="text-success" style={{ fontSize: "0.55rem", marginTop: "2px" }}>✓ Fourni</small>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {getDocumentsManquants().length > 0 && (<div><h6 className="text-warning mb-2" style={{ fontSize: "0.9rem" }}>Documents à fournir ({getDocumentsManquants().length})</h6><UploadDocument documents={getDocumentsManquants()} onFileUpload={onDocumentUpload} onFileReset={onDocumentReset} acceptedFileTypes=".pdf,.doc,.docx,.jpg,.jpeg,.png" /></div>)}
            {getDocumentsExistants().length > 0 && getDocumentsManquants().length === 0 && (<div className="alert alert-success mb-0" style={{ padding: "8px 12px" }}><FaCheck className="text-success me-2" /><small>Tous les documents requis ont été fournis !</small></div>)}
          </div>
        </div>
      </div>

      {/* Section Flotte de Transport - Sélection simplifiée avec checkboxes */}
      <div className="bg-white rounded-3 mb-3 shadow-sm" style={{ border: "1.5px solid #1FB05B", borderRadius: "12px", overflow: "hidden" }}>
        <button 
          type="button"
          className="d-flex align-items-center justify-content-between p-3 w-100 border-0" 
          style={{ backgroundColor: "#f0f9f3", cursor: "pointer", transition: "background-color 0.2s ease" }} 
          onClick={() => toggleSection("flotte")}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f5ea")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f9f3")}
        >
          <div className="d-flex align-items-center">
            <FaTruck style={{ color: "#1FB05B", marginRight: "10px", fontSize: "1.2rem" }} />
            <h5 className="mb-0" style={{ color: "#1FB05B", fontSize: "1.08rem", fontWeight: 600 }}>Flotte de Transport</h5>
            <span className="ms-2" style={{ color: "#CBCBCB", fontSize: "0.85rem" }}>({vehiculesExistants.length} disponibles)</span>
          </div>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span 
              className={`badge ${totalExclus > 0 ? "bg-danger" : "bg-success"}`} 
              style={{ color: "white" }}
            >
              {totalExclus > 0 ? `${totalExclus} exclu(s)` : `${totalInclus} inclus`}
            </span>
            <span style={{ transition: "transform 0.3s ease", transform: expandedSections.has("flotte") ? "rotate(0deg)" : "rotate(-90deg)", display: "inline-flex" }}><FaChevronDown color="#1FB05B" /></span>
          </div>
        </button>
        <div style={{ maxHeight: expandedSections.has("flotte") ? "800px" : "0", overflow: "hidden", transition: "max-height 0.5s ease" }}>
          <div className="p-3">
            {/* Header compact */}
            <div className="d-flex align-items-center justify-content-between mb-2" style={{ paddingBottom: "8px", borderBottom: "1px solid #e9ecef" }}>
              <small style={{ color: "#6c757d" }}>Cochez les véhicules qui ne peuvent pas participer pour les exclure</small>
              <div className="d-flex align-items-center" style={{ gap: "8px" }}>
                <button
                  type="button"
                  onClick={() => setShowVehiculeModal(true)}
                  className="btn btn-sm"
                  style={{ backgroundColor: "#f57c00", color: "#fff", border: "none", fontSize: "0.8rem", padding: "5px 12px" }}
                >
                  <FaPlus size={10} className="me-1" />Nouveau
                </button>
                {vehiculesExistants.length > 0 && (
                  <button
                    type="button"
                    onClick={toggleExcludeAll}
                    className="btn btn-sm btn-outline-danger"
                    style={{ fontSize: "0.8rem", padding: "5px 12px" }}
                  >
                    {excludedVehiculeIds.size === vehiculesExistants.length ? "Tout inclure" : "Tout exclure"}
                  </button>
                )}
              </div>
            </div>

            {/* Barre de recherche */}
            {vehiculesExistants.length > 3 && (
              <div style={{ marginBottom: "10px" }}>
                <input
                  type="text"
                  placeholder="Rechercher par matricule, marque, type ou chauffeur..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "6px 10px",
                    border: "1px solid #dee2e6",
                    borderRadius: "6px",
                    fontSize: "0.8rem",
                  }}
                />
              </div>
            )}

            {/* Tableau véhicules existants */}
            <div style={{ maxHeight: "300px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "8px" }}>
              {loadingFlotte ? (
                <div className="text-center py-3">
                  <div className="spinner-border spinner-border-sm text-success" role="status" />
                  <small className="ms-2 text-muted">Chargement...</small>
                </div>
              ) : vehiculesExistants.length === 0 ? (
                <div className="text-center py-3">
                  <FaTruck size={24} style={{ color: "#adb5bd" }} />
                  <p className="mb-0 mt-2 text-muted" style={{ fontSize: "0.85rem" }}>Aucun véhicule</p>
                </div>
              ) : filteredVehicules.length === 0 ? (
                <div className="text-center py-3">
                  <p className="mb-0 text-muted" style={{ fontSize: "0.8rem" }}>Aucun résultat pour "{searchQuery}"</p>
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                      <th style={{ padding: "8px 10px", width: "35px" }} title="Cocher pour exclure"></th>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Véhicule</th>
                      <th style={{ padding: "8px 10px", textAlign: "left", fontSize: "0.7rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Type</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "0.7rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Tonnage</th>
                      <th style={{ padding: "8px 10px", textAlign: "center", fontSize: "0.7rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Chauffeur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredVehicules.map((vehicule, idx) => {
                      const isExcluded = excludedVehiculeIds.has(parseInt(vehicule.id));
                      return (
                        <tr
                          key={vehicule.id}
                          onClick={() => toggleVehiculeExclusion(parseInt(vehicule.id))}
                          style={{
                            cursor: "pointer",
                            backgroundColor: isExcluded ? "#ffebee" : idx % 2 === 0 ? "#fff" : "#fafafa",
                            borderBottom: "1px solid #eee",
                            opacity: isExcluded ? 0.7 : 1,
                          }}
                          onMouseEnter={(e) => !isExcluded && (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                          onMouseLeave={(e) => !isExcluded && (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#fafafa")}
                        >
                          <td style={{ padding: "6px 10px", textAlign: "center" }}>
                            <Form.Check 
                              type="checkbox" 
                              checked={isExcluded} 
                              onChange={() => {}} 
                              style={{ margin: 0 }} 
                              title="Cocher pour exclure ce véhicule de la soumission"
                            />
                          </td>
                          <td style={{ padding: "6px 10px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ 
                                fontWeight: 600, 
                                fontSize: "0.8rem", 
                                color: isExcluded ? "#dc3545" : "#374151",
                                textDecoration: isExcluded ? "line-through" : "none"
                              }}>{vehicule.matricule}</span>
                              <span style={{ color: "#9ca3af", fontSize: "0.75rem" }}>{vehicule.marque}</span>
                              {isExcluded && (
                                <span style={{
                                  backgroundColor: "#ffcdd2",
                                  color: "#c62828",
                                  padding: "1px 5px",
                                  borderRadius: "3px",
                                  fontSize: "0.6rem",
                                  fontWeight: 600
                                }}>EXCLU</span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: "6px 10px" }}>
                            {vehicule.typevehicule ? (
                              <span style={{ backgroundColor: "#fff3e0", color: "#e65100", padding: "2px 6px", borderRadius: "3px", fontSize: "0.65rem" }}>
                                {vehicule.typevehicule.designation}
                              </span>
                            ) : <span style={{ color: "#adb5bd" }}>—</span>}
                          </td>
                          <td style={{ padding: "6px 10px", textAlign: "center" }}>
                            {vehicule.tonnage ? (
                              <span style={{ backgroundColor: "#e3f2fd", color: "#1976d2", padding: "2px 6px", borderRadius: "3px", fontSize: "0.7rem", fontWeight: 600 }}>
                                {vehicule.tonnage.tonnage}T
                              </span>
                            ) : <span style={{ color: "#adb5bd" }}>—</span>}
                          </td>
                          <td style={{ padding: "6px 10px",textAlign: "center" }}>
                            {vehicule.chauffeur ? (
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                                <FaUser size={10} style={{ color: isExcluded ? "#9e9e9e" : "#1FB05B" }} />
                                <span style={{ fontSize: "0.75rem", color: isExcluded ? "#9e9e9e" : "#374151" }}>{vehicule.chauffeur.nom}</span>
                              </div>
                            ) : <span style={{ color: "#dc3545", fontSize: "0.7rem" }}>Non assigné</span>}
                          </td>
                          
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Nouveaux véhicules ajoutés */}
            {nouveauxVehicules.length > 0 && (
              <div style={{ marginTop: "12px", border: "1px solid #f57c00", borderRadius: "6px", overflow: "hidden" }}>
                <div style={{ backgroundColor: "#fff8e1", padding: "6px 10px", borderBottom: "1px solid #f57c00" }}>
                  <span style={{ color: "#f57c00", fontWeight: 600, fontSize: "0.8rem" }}>
                    <FaPlus size={10} className="me-1" />Nouveaux véhicules ({nouveauxVehicules.length})
                  </span>
                </div>
                <div style={{ backgroundColor: "#fffdf7" }}>
                  {nouveauxVehicules.map((vehicule, index) => (
                    <div key={index} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderBottom: index < nouveauxVehicules.length - 1 ? "1px solid #ffe0b2" : "none" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontWeight: 600, fontSize: "0.8rem", color: "#f57c00" }}>{vehicule.matricule}</span>
                        <span style={{ color: "#6c757d", fontSize: "0.75rem" }}>{vehicule.marque}</span>
                        {vehicule.nouveau_chauffeur && <span style={{ fontSize: "0.7rem", color: "#f57c00" }}>{vehicule.nouveau_chauffeur.nom}</span>}
                      </div>
                      <button type="button" onClick={() => removeNouveauVehicule(index)} style={{ background: "none", border: "none", color: "#dc3545", cursor: "pointer", padding: "2px" }}>
                        <FaTimes size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer - Résumé de la sélection */}
            <div style={{ 
              marginTop: "10px",
              padding: "8px 10px", 
              borderRadius: "6px",
              backgroundColor: totalExclus > 0 ? "#fff3e0" : "#e8f5e9",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "6px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <FaCheck size={12} style={{ color: "#1FB05B" }} />
                <span style={{ color: "#1FB05B", fontSize: "0.8rem" }}>
                  <strong>{totalInclus}</strong> véhicule(s) inclus dans la soumission
                </span>
              </div>
              {totalExclus > 0 && (
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <FaTimes size={12} style={{ color: "#dc3545" }} />
                  <span style={{ color: "#dc3545", fontSize: "0.8rem" }}>
                    <strong>{totalExclus}</strong> exclu(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Section Offres de Transport - dépliable */}
      <div className="bg-white rounded-3 mb-3 shadow-sm" style={{ border: "1.5px solid #1FB05B", borderRadius: "12px", overflow: "hidden" }}>
        <button 
          type="button"
          className="d-flex align-items-center justify-content-between p-3 w-100 border-0" 
          style={{ backgroundColor: "#f0f9f3", cursor: "pointer", transition: "background-color 0.2s ease" }} 
          onClick={() => toggleSection("offres")}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f5ea")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f9f3")}
        >
          <div className="d-flex align-items-center">
            <img src={doc_info_icon} alt="info" style={{ width: "20px", marginRight: "10px" }} />
            <h5 className="mb-0" style={{ color: "#1FB05B", fontSize: "1.08rem", fontWeight: 600 }}>Offres de Transport</h5>
            <span className="ms-2" style={{ color: "#CBCBCB", fontSize: "0.85rem" }}>({totalCapacityRanges} plages)</span>
          </div>
          <div className="d-flex align-items-center" style={{ gap: "10px" }}>
            <span className="badge" style={{ backgroundColor: validOffersCount > 0 ? "#1FB05B" : "#6c757d", color: "white" }}>{validOffersCount} / {totalCapacityRanges} valides</span>
            <span style={{ transition: "transform 0.3s ease", transform: expandedSections.has("offres") ? "rotate(0deg)" : "rotate(-90deg)", display: "inline-flex" }}><FaChevronDown color="#1FB05B" /></span>
          </div>
        </button>
        <div style={{ maxHeight: expandedSections.has("offres") ? "2000px" : "0", overflow: "hidden", transition: "max-height 0.5s ease" }}>
          <div className="p-3">
            <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
              {mockOffreGroups.map((section) => {
                const isExpanded = expandedSections.has(section.sectionId);
                const selectedCount = getSelectedCountForSection(section.sectionId);
                return (
                  <div key={section.sectionId} style={{ border: "1px solid #1FB05B", borderRadius: "8px", overflow: "hidden", backgroundColor: "#fff" }}>
                    <button type="button" onClick={() => toggleSection(section.sectionId)} className="w-100 border-0" style={{ backgroundColor: "#f0f9f3", borderBottom: isExpanded ? "1px solid #1FB05B" : "none", padding: "12px 20px", cursor: "pointer" }} onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#e3f5ea")} onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#f0f9f3")}>
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center" style={{ gap: "12px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", transition: "transform 0.3s ease", transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", color: "#1FB05B" }}><FaChevronDown size={14} /></span>
                          <FaTruck style={{ color: "#1FB05B" }} />
                          <span style={{ fontWeight: 600, color: "#2c3e50", fontSize: "14px" }}>AXE : {section.axeDesignation} — Province : {section.province}</span>
                        </div>
                        <span className={`button ${selectedCount > 0 ? "button-active" : ""}`} style={{ fontSize: "11px", padding: "5px 12px", borderRadius: "12px" }}>{selectedCount} / {section.capacityRanges.length} renseignés</span>
                      </div>
                    </button>
                    <div style={{ maxHeight: isExpanded ? "1000px" : "0", overflow: "hidden", transition: "max-height 0.4s ease" }}>
                      <div className="table-container" style={{ margin: 0 }}>
                        <table className="professional-table" style={{ minWidth: "auto", width: "100%" }}>
                          <thead><tr><th style={{ textAlign: "center" }}>Tonnage min (T)</th><th>Tonnage max (T)</th><th>Volume min (m³)</th><th>Volume max (m³)</th><th>Prix proposé</th></tr></thead>
                          <tbody>
                            {section.capacityRanges.map((range) => (
                              <tr key={range.id} style={{ borderLeft: range.prixPropose > 0 ? "3px solid #1FB05B" : "3px solid transparent" }}>
                                <td style={{ textAlign: "center" }}><span className="chip">{range.tonnageMin}</span></td>
                                <td><span className="chip">{range.tonnageMax}</span></td>
                                <td><span className="chip">{range.volumeMin}</span></td>
                                <td><span className="chip">{range.volumeMax}</span></td>
                                <td><input type="number" className="input-field" placeholder="0" min="0" value={range.prixPropose || ""} onChange={(e) => handlePrixChange(section.sectionId, range.id, Number.parseFloat(e.target.value) || 0)} style={{ textAlign: "right", borderColor: range.prixPropose > 0 ? "#1FB05B" : undefined, backgroundColor: range.prixPropose > 0 ? "#f8fdfb" : undefined }} /></td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot><tr><td colSpan={4}>Résumé de la section</td><td className="sous-total">{selectedCount} / {section.capacityRanges.length} renseignés</td></tr></tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ marginTop: "20px", padding: "15px 20px", background: "linear-gradient(180deg, #f8fdf9 0%, #f0f9f3 100%)", borderRadius: "8px", border: "1px solid #1FB05B", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontWeight: 600, color: "#2c3e50", textTransform: "uppercase" }}>Résumé des offres</span>
              <span style={{ fontWeight: 600, color: validOffersCount > 0 ? "#1FB05B" : "#6c757d", fontSize: "14px" }}>{validOffersCount} offre{validOffersCount > 1 ? "s" : ""} valide{validOffersCount > 1 ? "s" : ""} sur {totalCapacityRanges}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton de soumission */}
      <div className="d-flex justify-content-end mt-4">
        <button 
          type="button" 
          className="btn" 
          disabled={isSubmitting}
          style={{ 
            backgroundColor: isSubmitting ? "#a5d6a7" : "#1FB05B", 
            color: "white", 
            padding: "12px 40px", 
            borderRadius: "8px", 
            fontWeight: 600,
            cursor: isSubmitting ? "not-allowed" : "pointer",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }} 
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              Envoi en cours...
            </>
          ) : (
            "Enregistrer les modifications"
          )}
        </button>
      </div>

      {/* Modal Véhicule - Étape 1 */}
      <VehiculeModal 
        show={showVehiculeModal} 
        onClose={() => {
          setShowVehiculeModal(false);
          setTempVehiculeData(null);
        }} 
        onNext={(vehiculeData: VehiculeData) => {
          // Sauvegarder les données du véhicule et passer au modal chauffeur
          setTempVehiculeData(vehiculeData);
          setShowVehiculeModal(false);
          setShowChauffeurModal(true);
        }}
        onSave={(vehiculeData: VehiculeData) => {
          // Enregistrer le véhicule sans chauffeur
          handleAddNouveauVehicule(vehiculeData);
          setShowVehiculeModal(false);
        }}
        tonnages={tonnages} 
        typesVehicule={typesVehicule} 
        loadingOptions={loadingOptions} 
      />

      {/* Modal Chauffeur - Étape 2 */}
      <ChauffeurModal
        show={showChauffeurModal}
        onClose={() => {
          setShowChauffeurModal(false);
          setTempVehiculeData(null);
        }}
        onBack={() => {
          // Retourner au modal véhicule
          setShowChauffeurModal(false);
          setShowVehiculeModal(true);
        }}
        onSave={(chauffeurData: ChauffeurData) => {
          // Créer le véhicule avec le chauffeur
          if (tempVehiculeData) {
            handleAddNouveauVehicule(tempVehiculeData, chauffeurData);
          }
          setShowChauffeurModal(false);
          setTempVehiculeData(null);
        }}
        isStep2={true}
        vehiculeInfo={tempVehiculeData ? { 
          matricule: tempVehiculeData.matricule, 
          marque: tempVehiculeData.marque 
        } : undefined}
      />
    </>
  );
};

export default VueGlobaleTransport;
