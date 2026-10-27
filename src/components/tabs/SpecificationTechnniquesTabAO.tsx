import React, { useEffect, useState } from "react";
import { FaLongArrowAltRight, FaFileAlt} from "react-icons/fa";
import doc_info_icon from "../../assets/images/doc_icon.png";
import doc_info from  "../../assets/images/doc_info_icon.png"
import LotModal, { LotData } from "../ui/LotModal";
import SpecificationTechniqueSalamaModal  from "../ui/SpecificationTechniqueSalamaModal";
import SpecificationTechnniqueFournisseurModal, { SpecificationTechniqueFournisseurData } from "../ui/SpecificationTechniqueFournisseurModal";
import { AO, Article, Fabricant } from "../../types/AO.types";
import { BASE_URL } from "../../utils/variable";
 

interface ArticleData {
  id: number;
  quantiteDisponible: number;
  prixUnitaire?: number;
  commentaire: string;
  datelivraison: string;
  coeff: number | null;
  termeCommercial: "DDP" | "Autre" | "";
  fabricant_id?: number;
  lots?: LotData[];
  specification?: SpecificationTechniqueFournisseurData;
  [key: string]: any;
}

interface ArticlesTabProps {
  tender: AO;
  form: {
    produits: Record<number, ArticleData>;
    termeCommercial: "DDP" | "Autre" | "";
    commentaireTerme: string;
    transitaire: string;
    cabinetExpertise: string;
    fichier?: File | null;
    [key: string]: any;
  };
  fabricant: Array<Fabricant>;
  loadingFabricants: boolean;
  errorFabricant: string | null;
  handleProduitChange: (
    produitId: number,
    field: string,
    value: any
  ) => void;
}

const SpecificationTechnniquesTab: React.FC<ArticlesTabProps> = ({
  tender,
  form,
  fabricant,
  handleProduitChange,
}) => {

  // État pour le modal des lots
  const [showLotModal, setShowLotModal] = useState(false);
  const [currentProduitId, setCurrentProduitId] = useState<number | null>(null);
  
  // État pour le modal de spécification technique
  const [showSpecModal, setShowSpecModal] = useState(false);
  
  // État pour le modal de lecture seule des spécifications Salama
  const [showSalamaSpecModal, setShowSalamaSpecModal] = useState(false);
  const [salamaSpecElementType, setSalamaSpecElementType] = useState<'MED' | 'BES' | null>(null);
  
  // État pour les spécifications Salama récupérées via l'API
  const [salamaSpecData, setSalamaSpecData] = useState<any>(null);
  const [loadingSalamaSpec, setLoadingSalamaSpec] = useState(false);
  const [errorSalamaSpec, setErrorSalamaSpec] = useState<string | null>(null);
  const [currentSalamaProductId, setCurrentSalamaProductId] = useState<number | null>(null);
  
  // État pour le suivi des téléchargements
  const [lastUploadedId, setLastUploadedId] = useState<number | null>(null);

  // Fonction pour récupérer les spécifications techniques depuis l'API
  const fetchSalamaSpecifications = async (detailda_id: number) => {
    setLoadingSalamaSpec(true);
    setErrorSalamaSpec(null);
    setSalamaSpecData(null);
    
    try {
      const query = `{
        specificationtechniques(detailda_id: ${detailda_id}) {
          id
          detailda_id
          type_specification
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
          image
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
          titre
          unite
          valeur_min
          valeur_max
          created_at
          updated_at
        }
      }`;
      
      const response = await fetch(
        `https://backsignup.h-tsoft.com/graphql?query=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      
      if (data?.data?.specificationtechniques && data.data.specificationtechniques.length > 0) {
        const spec = data.data.specificationtechniques[0];
        // console.log("spec dans fetchSalamaSpecifications:", spec);
        // Mapper les données de l'API vers le format attendu par le modal
        const mappedData = {
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
          // Document URL depuis l'API
          documentUrl: spec.document ? `${BASE_URL}${spec.document}` : null,
        };
        
        setSalamaSpecData(mappedData);
        
        // Déterminer le type d'élément basé sur les données
        if (tender.TSSCOD_0_0 === 'MED' ) {
          setSalamaSpecElementType('MED');
        } else if (tender.TSSCOD_0_0 === 'BES' ) {
          setSalamaSpecElementType('BES');
        }
      } else {
        setErrorSalamaSpec("Aucune spécification trouvée pour ce produit");
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des spécifications:", error);
      setErrorSalamaSpec("Erreur lors de la récupération des spécifications");
    } finally {
      setLoadingSalamaSpec(false);
    }
  };

  // Fonction pour ouvrir le modal avec les spécifications Salama
  const openSalamaSpecModal = async (produitId: number) => {
    setCurrentSalamaProductId(produitId);
    setShowSalamaSpecModal(true);
    await fetchSalamaSpecifications(produitId);
  };
 
  
  // État pour le lot en cours d'édition
  const [currentLot, setCurrentLot] = useState<LotData>({
    quantite: 0,
    dateperemption: "",
    dureedevie: "",
  });
  
  
  // État pour savoir si on est en mode édition d'un lot existant
  const [editLotIndex, setEditLotIndex] = useState<number | null>(null);

   
  const saveLot = (lotData: LotData) => {
    if (!currentProduitId) return;
    
    // Génération d'un ID unique pour le lot si nouveau lot
    const lotToSave = editLotIndex !== null 
      ? {...lotData} 
      : {...lotData, id: `lot-${Date.now()}`};
    
    // Récupérer ou initialiser le produit actuel
    const currentProduit = form.produits[currentProduitId] || {
      id: currentProduitId,
      quantiteDisponible: 0,
      prixUnitaire: 0,
      commentaire: "",
      datelivraison: "",
      coeff: null,
      termeCommercial: "" as "DDP" | "Autre" | "",
      lots: []
    };
    
    // Mettre à jour la liste des lots
    let lots = currentProduit.lots || [];
    
    // Convertir lots en tableau s'il est en format JSON string
    if (typeof lots === 'string') {
      lots = JSON.parse(lots);
    }
    
    let updatedLots: LotData[] = [...lots];
    
    if (editLotIndex !== null) {
      // Modification d'un lot existant
      updatedLots[editLotIndex] = lotToSave;
    } else {
      // Ajout d'un nouveau lot
      updatedLots.push(lotToSave);
    }
    
    // Mettre à jour la quantité disponible totale (somme des quantités des lots)
    const totalQuantite = updatedLots.reduce((total, lot) => total + lot.quantite, 0);
    
    // Appeler la fonction de modification du produit parent
    handleProduitChange(currentProduitId, "lots", JSON.stringify(updatedLots));
    handleProduitChange(currentProduitId, "quantiteDisponible", totalQuantite);
    
    // Fermer le modal et réinitialiser les états
    setShowLotModal(false);
    setCurrentProduitId(null);
    setEditLotIndex(null);
    setCurrentLot({
      quantite: 0,
      dateperemption: "",
      dureedevie: "",
    });
  };
  


  useEffect(() => {
    // console.log("tender dans ArticlesTab:", tender);
    if (tender.typemarche?.designation === "AOR" && fabricant.length > 0) {
      const firstArticleId = tender.aoarticles[0]?.article?.id;
      if (firstArticleId) {
        handleProduitChange(
          Number(firstArticleId),
          "fabricant_id",
          fabricant[0].id
        );
      }
    }
  }, [tender, fabricant]);

  // Trouver le nom du produit actuel
  const getCurrentProductName = () => {
    if (!currentProduitId) return "";
    const product = tender.aoarticles.find(
      (p: any) => Number(p.article.id) === currentProduitId
    );
    return product?.article.designation || "";
  };

  // Ouvre le modal de spécification technique
  const openSpecModal = (produitId: number) => {
    setCurrentProduitId(produitId);
    setShowSpecModal(true);
  };

  // Sauvegarde de la spécification technique
  const saveSpecification = (data: SpecificationTechniqueFournisseurData) => {
    if (!currentProduitId) return;
    // Ne pas utiliser JSON.stringify car le File ne peut pas être sérialisé
    handleProduitChange(currentProduitId, "specification", data as any);
    setShowSpecModal(false);
    setCurrentProduitId(null);
    setLastUploadedId(currentProduitId);
    setTimeout(() => setLastUploadedId(null), 3000);
  };

  return (
    <div>
      {/* Styles pour les animations et les éléments visuels */}
      <style>
        {`
        @keyframes colorChange {
          0% { color: white; }
          50% { color: red; }
          100% { color: white; }
        }
        
        @keyframes highlightGreen {
          0% { background-color: rgba(31, 176, 91, 0.1); }
          50% { background-color: rgba(31, 176, 91, 0.3); }
          100% { background-color: rgba(31, 176, 91, 0.1); }
        }
        
        .upload-highlight {
          animation: highlightGreen 2s ease-in-out;
          border: 2px solid #1FB05B !important;
          box-shadow: 0 0 8px rgba(31, 176, 91, 0.4);
          transition: all 0.3s ease;
        }
        
        .action-button {
          background-color: #1FB05B;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 8px 20px;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .action-button:hover {
          background-color: #188a48;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(31, 176, 91, 0.2);
        }
        
        .spec-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
        }
        
        .spec-table-header {
          background: linear-gradient(135deg, #1FB05B 0%, #17a34a 100%);
          color: white;
        }
        
        .spec-table-header th {
          padding: 14px 16px;
          text-align: center;
          font-weight: 600;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #16a34a;
        }
        
        .spec-table-header th:first-child {
          border-top-left-radius: 8px;
          padding-left: 24px;
        }
        
        .spec-table-header th:last-child {
          border-top-right-radius: 8px;
          padding-right: 24px;
        }
        
        .spec-table-body tr {
          background-color: #ffffff;
          transition: all 0.2s ease;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .spec-table-body tr:hover {
          background-color: #f9fafb;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .spec-table-body tr:last-child {
          border-bottom: none;
        }
        
        .spec-table-body td {
          padding: 16px;
          font-size: 0.875rem;
          color: #374151;
          vertical-align: middle;
        }
        
        .spec-table-body td:first-child {
          padding-left: 24px;
          font-weight: 600;
          color: #1f2937;
        }
        
        .spec-table-body td:last-child {
          padding-right: 24px;
        }
        
        .spec-doc-item {
          display: inline-flex;
          align-items: center;
          margin-right: 12px;
          margin-bottom: 8px;
          padding: 6px 12px;
          background-color: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-radius: 6px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        
        .spec-doc-item:hover {
          background-color: #dcfce7;
          border-color: #86efac;
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(34, 197, 94, 0.2);
        }
        
        .spec-doc-item img {
          width: 60px;
          height: auto;
        }
        
        .spec-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #f0fdf4;
          color: #16a34a;
          border: 1px solid #86efac;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          font-size: 0.75rem;
          font-weight: 600;
          margin-left: 8px;
        }
        
        .spec-indicator {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background-color: #f0fdf4;
          padding: 4px 8px;
          border-radius: 6px;
          margin-right: 6px;
        }
        
        /* Responsive Design */
        @media (max-width: 1200px) {
          .spec-table-header th,
          .spec-table-body td {
            padding: 12px;
            font-size: 0.813rem;
          }
          
          .spec-table-header th:first-child,
          .spec-table-body td:first-child {
            padding-left: 16px;
          }
          
          .spec-table-header th:last-child,
          .spec-table-body td:last-child {
            padding-right: 16px;
          }
        }
        
        @media (max-width: 768px) {
          .spec-table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
          }
          
          .spec-table-header,
          .spec-table-body {
            display: block;
          }
          
          .spec-table-header th {
            white-space: nowrap;
          }
          
          .spec-table-body tr {
            display: table;
            width: 100%;
            margin-bottom: 12px;
            border-radius: 8px;
            overflow: hidden;
          }
          
          .action-button {
            padding: 6px 14px;
            font-size: 0.813rem;
          }
          
          .spec-doc-item img {
            width: 50px;
          }
        }
        
        @media (max-width: 576px) {
          .spec-table-header {
            display: none;
          }
          
          .spec-table-body tr {
            display: block;
            padding: 16px;
            margin-bottom: 16px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
          }
          
          .spec-table-body td {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f3f4f6;
          }
          
          .spec-table-body td:last-child {
            border-bottom: none;
          }
          
          .spec-table-body td:before {
            content: attr(data-label);
            font-weight: 600;
            color: #1FB05B;
            margin-right: 12px;
            min-width: 120px;
          }
        }
        `}
      </style>
    
      <LotModal 
        show={showLotModal}
        onClose={() => setShowLotModal(false)}
        onSave={saveLot}
        fabricant={fabricant}
        lot={currentLot}
        productName={getCurrentProductName()}
        isEdit={editLotIndex !== null}
      />
      
      {/* Modal de spécification technique */}
      {currentProduitId && (
        <SpecificationTechnniqueFournisseurModal
          show={showSpecModal}
          onClose={() => {
            setShowSpecModal(false);
            setCurrentProduitId(null);
          }}
          onSave={saveSpecification}
          elementType={tender.TSSCOD_0_0 === 'MED' || tender.TSSCOD_0_0 === 'BES' ? tender.TSSCOD_0_0 : null}
          productName={getCurrentProductName()}
          initialData={
            form.produits[currentProduitId]?.specification
              ? typeof form.produits[currentProduitId].specification === 'string'
                ? JSON.parse(form.produits[currentProduitId].specification as string)
                : form.produits[currentProduitId].specification
              : undefined
          }
        />
      )}
      
      {/* Modal de lecture seule pour les spécifications Salama */}
      <SpecificationTechniqueSalamaModal
        show={showSalamaSpecModal}
        onClose={() => {
          setShowSalamaSpecModal(false);
          setCurrentSalamaProductId(null);
          setSalamaSpecData(null);
          setErrorSalamaSpec(null);
        }}
        onSave={() => {}} // Fonction vide car en lecture seule
        productName={currentSalamaProductId ? getCurrentProductName() : "Spécifications Salama"}
        elementType={tender.TSSCOD_0_0 === 'MED' || tender.TSSCOD_0_0 === 'BES' ? tender.TSSCOD_0_0 : salamaSpecElementType}
        initialData={salamaSpecData}
        readOnly={true}
        loading={loadingSalamaSpec}
        error={errorSalamaSpec}
      />
      <div
        className="d-flex align-items-center justify-content-between"
        style={{ paddingBottom: "15px" }}
      >
        <div className="d-flex align-items-center">
          <h5
            className="mb-0 d-flex align-items-center"
            style={{
              color: "#1FB05B",
              paddingLeft: "15px",
              fontSize: "1.2rem",
            }}
          >
            <img
              src={doc_info}
              alt="info"
              style={{ width: "20px", marginRight: "10px" }}
            />
            Spécifications Techniques
            <FaLongArrowAltRight style={{ marginLeft: "5px" }} />
          </h5>
          <span className="ms-2" style={{ color: "#CBCBCB" }}>
            ({tender.aoarticles.length}) Articles
          </span>
        </div>
        
        <div className="d-flex align-items-center gap-2">
          <div
            className="badge"
            style={{
              backgroundColor: "#f0fdf4",
              color: "#1FB05B",
              padding: "6px 12px",
              borderRadius: "6px",
              fontSize: "0.813rem",
              fontWeight: "500",
              border: "1px solid #1FB05B",
            }}
          >
            {tender.aoarticles.filter((p: any) => form.produits[Number(p.article.id)]?.specification).length} / {tender.aoarticles.length} spécifications
          </div>
        </div>
      </div>
      
      

      <div
        style={{
          border: "1.5px solid #1FB05B",
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "#ffffff",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
        }}
      >
        {/* SECTION TABLEAU */}
        <div style={{ overflowX: "auto" }}>
          <table className="spec-table">
            <thead className="spec-table-header">
              <tr>
                <th style={{ width: "33%", textAlign: "center" }}>Article</th>
                <th style={{ width: "33%", textAlign: "center" }}>Spécifications Salama</th>
                <th style={{ width: "33%", textAlign: "center" }}>Actions</th>
              </tr>
            </thead>
            <tbody className="spec-table-body">
              {tender.aoarticles.map((produit: Article) => (
                <tr key={produit.id}>
                  {/* Article Name */}
                  <td data-label="Article">
                    <div style={{ display: "flex", alignItems: "center", gap: "8px",justifyContent: "center" }}>
                      <strong>{produit.article.designation}</strong>
                      {form.produits[Number(produit.article.id)]?.specification && (
                        <span className="spec-badge" title="Spécification ajoutée">
                          ✓
                        </span>
                      )}
                    </div>
                  </td>
                  
                  {/* Spécifications Salama */}
                  <td data-label="Spécifications">
                    <div style={{ 
                      display: "flex", 
                      alignItems: "center", 
                      justifyContent: "center",
                      gap: "8px"
                    }}>
                      <button
                        type="button"
                        className="spec-doc-item"
                        onClick={() => openSalamaSpecModal(Number(produit.detailda_id))}
                        style={{ 
                          border: "1px solid #bbf7d0",
                          background: "#f0fdf4",
                          position: "relative",
                          padding: "8px",
                          cursor: "pointer"
                        }}
                        title="Visualiser les spécifications Salama"
                      >
                        <img
                          src={doc_info_icon}
                          alt="Spécifications Salama"
                          style={{ width: '58px', height: '58px' }}
                        />
                      </button>
                      
                      {/* Boutons de test pour MED et BES */}
                      {/* <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <button
                          type="button"
                          onClick={() => {
                            setSalamaSpecElementType('MED');
                            setShowSalamaSpecModal(true);
                          }}
                          style={{
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            backgroundColor: "#e0f2fe",
                            color: "#0ea5e9",
                            border: "1px solid #0ea5e9",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                          title="Tester les champs Médicaments"
                        >
                          🏥 MED
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSalamaSpecElementType('BES');
                            setShowSalamaSpecModal(true);
                          }}
                          style={{
                            padding: "4px 8px",
                            fontSize: "0.75rem",
                            backgroundColor: "#fef3c7",
                            color: "#f59e0b",
                            border: "1px solid #f59e0b",
                            borderRadius: "4px",
                            cursor: "pointer"
                          }}
                          title="Tester les champs Équipement"
                        >
                          🔧 BES
                        </button>
                      </div> */}
                    </div>
                  </td>
                  
                  
                  {/* Actions Button */}
                  <td data-label="Actions" style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                      <button
                        type="button"
                        className="action-button position-relative"
                        onClick={() => openSpecModal(Number(produit.article.id))}
                      >
                        {form.produits[Number(produit.article.id)]?.specification ? "Modifier" : "Ajouter"}
                      </button>
                      
                      {/* Indicateurs visuels */}
                      {form.produits[Number(produit.article.id)]?.specification && (
                        <span className="spec-indicator" title="Spécification technique complétée">
                          <FaFileAlt size={14} style={{ color: "#16a34a" }} />
                        </span>
                      )}
                      
                      {/* Animation pour le dernier ajout */}
                      {lastUploadedId === Number(produit.article.id) && (
                        <div 
                          className="upload-highlight" 
                          style={{ 
                            width: '12px', 
                            height: '12px', 
                            borderRadius: '50%',
                            backgroundColor: '#1FB05B'
                          }}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SpecificationTechnniquesTab;
