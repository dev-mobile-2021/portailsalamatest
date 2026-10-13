import React, { useState, useEffect } from "react";
import { Form } from "react-bootstrap";
import { 
  FaTruck, 
  FaPlus,
  FaCheck,
  FaTimes,
  FaUser
} from "react-icons/fa";
import { AO } from "../../types/AO.types";
import { graphQLClient } from "../../api/client";
import ChauffeurModal, { ChauffeurData } from "../ui/ChauffeurModal";
import VehiculeModal, { VehiculeData } from "../ui/VehiculeModal";
import "../../assets/scss/table.scss";
import { useAuthContext } from "../../hooks/useUserhook";
import { useCrudGraph } from "../../hooks/useCrudGraph";
import { getFlotteFournisseurQuery } from "../../api/graphql/queries";

// Interface pour un nouveau véhicule avec chauffeur
export interface NouveauVehicule {
  typevehicule_id: string;
  matricule: string;
  marque: string;
  tonnage_id: string;
  description: string;
  volume: number;
  nouveau_chauffeur?: {
    nom: string;
    email: string;
    telephone: string;
    adresse: string;
    code: string;
  };
  chauffeur_id?: number; // Si on assigne un chauffeur existant
}

// Interface pour les données exportées - sélection de flotte (simplifiée)
export interface FlotteSelection {
  vehicules_existants: number[]; // IDs des véhicules existants sélectionnés
  nouveaux_vehicules: NouveauVehicule[]; // Nouveaux véhicules ajoutés via modal
}

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

interface FlotteTransportTabProps {
  tender: AO;
  flotteSelection: FlotteSelection;
  onFlotteChange: (selection: FlotteSelection) => void;
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

const FlotteTransportTab: React.FC<FlotteTransportTabProps> = ({
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

  // États
  const [vehiculesExistants, setVehiculesExistants] = useState<Array<{
    id: string;
    matricule: string;
    marque: string;
    description: string;
    tonnage: { designation: string; tonnage: number } | null;
    typevehicule: { designation: string } | null;
    chauffeur: { id: string; nom: string; telephone: string } | null;
  }>>([]);
  
  // IDs des véhicules existants EXCLUS (checkboxes) - ceux qui ne peuvent pas participer
  const [excludedVehiculeIds, setExcludedVehiculeIds] = useState<Set<number>>(new Set());
  
  // Nouveaux véhicules ajoutés via modal (avec leur chauffeur)
  const [nouveauxVehicules, setNouveauxVehicules] = useState<NouveauVehicule[]>([]);
  
  // Options API pour le modal
  const [tonnages, setTonnages] = useState<Tonnage[]>([]);
  const [typesVehicule, setTypesVehicule] = useState<TypeVehicule[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);
  
  // Modals - Flux en 2 étapes
  const [showVehiculeModal, setShowVehiculeModal] = useState(false);
  const [showChauffeurModal, setShowChauffeurModal] = useState(false);
  
  // Données temporaires du véhicule entre les deux modals
  const [tempVehiculeData, setTempVehiculeData] = useState<VehiculeData | null>(null);

  // Recherche de véhicules
  const [searchQuery, setSearchQuery] = useState("");

  // Extraire les véhicules depuis les parkings du fournisseur
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

      setVehiculesExistants(vehiculesFromApi);
    }
  }, [fournisseursData]);

  // Charger les options (tonnages, types véhicule) pour le modal
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

  // Ajouter un nouveau véhicule via modal
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

  // Supprimer un nouveau véhicule de la liste
  const removeNouveauVehicule = (index: number) => {
    setNouveauxVehicules((prev) => prev.filter((_, i) => i !== index));
  };

  // Mettre à jour la sélection pour la soumission (tous les véhicules SAUF ceux exclus)
  useEffect(() => {
    // Calculer les véhicules à inclure = tous sauf les exclus
    const vehiculesInclus = vehiculesExistants
      .map((v) => parseInt(v.id))
      .filter((id) => !excludedVehiculeIds.has(id));
    
    onFlotteChange({
      vehicules_existants: vehiculesInclus,
      nouveaux_vehicules: nouveauxVehicules,
    });
  }, [excludedVehiculeIds, nouveauxVehicules, vehiculesExistants]);

  // Nombre de véhicules qui seront soumis (non exclus + nouveaux)
  const totalInclus = vehiculesExistants.length - excludedVehiculeIds.size + nouveauxVehicules.length;
  const totalExclus = excludedVehiculeIds.size;

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

  return (
    <div className="form-container">
      {/* Header compact */}
      <div className="d-flex align-items-center justify-content-between" style={{ paddingBottom: "12px", borderBottom: "1px solid #e9ecef", marginBottom: "16px" }}>
        <div className="d-flex align-items-center">
          <h6 className="mb-0 d-flex align-items-center" style={{ color: "#1FB05B", fontSize: "1rem", fontWeight: 600 }}>
            <FaTruck style={{ marginRight: "8px" }} />
            Flotte de Transport
          </h6>
          <span className="ms-3 badge bg-light text-secondary" style={{ fontSize: "0.75rem" }}>
            {vehiculesExistants.length} disponible(s)
          </span>
        </div>
        <div className="d-flex align-items-center" style={{ gap: "8px" }}>
          <button
            type="button"
            onClick={() => setShowVehiculeModal(true)}
            className="btn btn-sm"
            style={{
              backgroundColor: "#f57c00",
              color: "#fff",
              border: "none",
              fontSize: "0.8rem",
              padding: "5px 12px",
            }}
          >
            <FaPlus size={10} className="me-1" />
            Nouveau
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
          <span 
            className={`badge ${totalExclus > 0 ? "bg-danger" : "bg-success"}`} 
            style={{ fontSize: "0.75rem", padding: "5px 10px" }}
          >
            {totalExclus > 0 ? `${totalExclus} exclu(s)` : `${totalInclus} inclus`}
          </span>
        </div>
      </div>

    {/* Barre de recherche */}
    {vehiculesExistants.length > 3 && (
      <div style={{ marginBottom: "12px" }}>
        <input
          type="text"
          placeholder="Rechercher par matricule, marque, type ou chauffeur..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 12px",
            border: "1px solid #dee2e6",
            borderRadius: "6px",
            fontSize: "0.85rem",
          }}
        />
      </div>
    )}

      {/* Liste des véhicules - Design compact */}
      <div style={{ maxHeight: "400px", overflowY: "auto", border: "1px solid #dee2e6", borderRadius: "8px" }}>
        {loadingFlotte ? (
          <div className="text-center py-4">
            <div className="spinner-border spinner-border-sm text-success" role="status" />
            <small className="ms-2 text-muted">Chargement...</small>
          </div>
        ) : vehiculesExistants.length === 0 ? (
          <div className="text-center py-4">
            <FaTruck size={24} style={{ color: "#adb5bd" }} />
            <p className="mb-0 mt-2 text-muted" style={{ fontSize: "0.85rem" }}>Aucun véhicule</p>
          </div>
        ) : filteredVehicules.length === 0 ? (
          <div className="text-center py-4">
            <p className="mb-0 text-muted" style={{ fontSize: "0.85rem" }}>Aucun résultat pour "{searchQuery}"</p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <th style={{ padding: "10px 12px", width: "40px" }} title="Cocher pour exclure"></th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Véhicule</th>
                <th style={{ padding: "10px 12px", textAlign: "left", fontSize: "0.75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Type</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Tonnage</th>
                <th style={{ padding: "10px 12px", textAlign: "center", fontSize: "0.75rem", fontWeight: 600, color: "#6c757d", textTransform: "uppercase" }}>Chauffeur</th>
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
                      transition: "background-color 0.15s",
                      opacity: isExcluded ? 0.7 : 1,
                    }}
                    onMouseEnter={(e) => !isExcluded && (e.currentTarget.style.backgroundColor = "#f5f5f5")}
                    onMouseLeave={(e) => !isExcluded && (e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#fff" : "#fafafa")}
                  >
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      <Form.Check
                        type="checkbox"
                        checked={isExcluded}
                        onChange={() => {}}
                        style={{ margin: 0 }}
                        title="Cocher pour exclure ce véhicule de la soumission"
                      />
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ 
                          fontWeight: 600, 
                          fontSize: "0.85rem", 
                          color: isExcluded ? "#dc3545" : "#374151",
                          textDecoration: isExcluded ? "line-through" : "none"
                        }}>
                          {vehicule.matricule}
                        </span>
                        <span style={{ color: "#9ca3af", fontSize: "0.8rem" }}>
                          {vehicule.marque}
                        </span>
                        {isExcluded && (
                          <span style={{
                            backgroundColor: "#ffcdd2",
                            color: "#c62828",
                            padding: "1px 6px",
                            borderRadius: "3px",
                            fontSize: "0.65rem",
                            fontWeight: 600
                          }}>
                            EXCLU
                          </span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: "8px 12px" }}>
                      {vehicule.typevehicule ? (
                        <span style={{
                          backgroundColor: "#fff3e0",
                          color: "#e65100",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "0.7rem",
                        }}>
                          {vehicule.typevehicule.designation}
                        </span>
                      ) : (
                        <span style={{ color: "#adb5bd", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      {vehicule.tonnage ? (
                        <span style={{
                          backgroundColor: "#e3f2fd",
                          color: "#1976d2",
                          padding: "2px 8px",
                          borderRadius: "3px",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}>
                          {vehicule.tonnage.tonnage}T
                        </span>
                      ) : (
                        <span style={{ color: "#adb5bd", fontSize: "0.8rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "8px 12px", textAlign: "center" }}>
                      {vehicule.chauffeur ? (
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "4px" }}>
                          <FaUser size={10} style={{ color: isExcluded ? "#9e9e9e" : "#1FB05B" }} />
                          <span style={{ fontSize: "0.8rem", color: isExcluded ? "#9e9e9e" : "#374151" }}>
                            {vehicule.chauffeur.nom}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: "#dc3545", fontSize: "0.75rem" }}>
                          Non assigné
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Nouveaux véhicules - Design compact */}
      {nouveauxVehicules.length > 0 && (
        <div style={{ marginTop: "16px", border: "1px solid #f57c00", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ 
            backgroundColor: "#fff8e1", 
            padding: "8px 12px", 
            borderBottom: "1px solid #f57c00",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span style={{ color: "#f57c00", fontWeight: 600, fontSize: "0.85rem" }}>
              <FaPlus size={10} className="me-2" />
              Nouveaux véhicules ({nouveauxVehicules.length})
            </span>
          </div>
          <div style={{ backgroundColor: "#fffdf7" }}>
            {nouveauxVehicules.map((vehicule, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "8px 12px",
                  borderBottom: index < nouveauxVehicules.length - 1 ? "1px solid #ffe0b2" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.85rem", color: "#f57c00" }}>
                    {vehicule.matricule}
                  </span>
                  <span style={{ color: "#6c757d", fontSize: "0.8rem" }}>
                    {vehicule.marque}
                  </span>
                  {vehicule.nouveau_chauffeur && (
                    <span style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      gap: "4px",
                      fontSize: "0.75rem",
                      color: "#f57c00"
                    }}>
                      <FaUser size={9} />
                      {vehicule.nouveau_chauffeur.nom}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeNouveauVehicule(index)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#dc3545",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  <FaTimes size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer compact - Résumé de la sélection */}
      <div style={{ 
        marginTop: "12px",
        padding: "10px 12px", 
        borderRadius: "6px",
        backgroundColor: totalExclus > 0 ? "#fff3e0" : "#e8f5e9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "6px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <FaCheck size={12} style={{ color: "#1FB05B" }} />
          <span style={{ color: "#1FB05B", fontSize: "0.85rem" }}>
            <strong>{totalInclus}</strong> véhicule(s) inclus dans la soumission
          </span>
        </div>
        {totalExclus > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <FaTimes size={12} style={{ color: "#dc3545" }} />
            <span style={{ color: "#dc3545", fontSize: "0.85rem" }}>
              <strong>{totalExclus}</strong> exclu(s)
            </span>
          </div>
        )}
      </div>

      {/* Message d'aide */}
      <div style={{ 
        marginTop: "8px", 
        padding: "6px 10px", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "4px",
        fontSize: "0.75rem",
        color: "#6c757d"
      }}>
        <em>Cochez les véhicules qui ne peuvent pas participer à cette soumission pour les exclure.</em>
      </div>
      

      {/* Modal Étape 1: Véhicule */}
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

      {/* Modal Étape 2: Chauffeur */}
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
    </div>
  );
};

export default FlotteTransportTab;
