import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col, Carousel } from "react-bootstrap";
import { FaTimes, FaFileAlt, FaRuler, FaBoxes, FaWeightHanging, FaThermometerHalf, FaClipboardList, FaChevronLeft, FaChevronRight } from "react-icons/fa";

export interface SpecificationTechniqueSalamaData {
  description: string;
  normes: string;
  typeConditionnement: string;
  quantiteParConditionnement: string;
  autreTypeConditionnement: string;
  longueur: string;
  largeur: string;
  hauteur: string;
  volume: string;
  poidsNet: string;
  poidsBrut: string;
  conditionsConservation: string;
  autresDetailsConservation: string;
  instructionsUtilisation: string;
  fichierTechnique?: File | null;
  documentUrl?: string | null; // URL du document depuis l'API
  // Champs MED (Médicaments)
  dci?: string;
  formePharmaceutique?: string;
  dosage?: string;
  presentation?: string;
  fabricant?: string;
  paysOrigine?: string;
  numeroAMM?: string;
  paysAMM?: string;
  certificats?: string;
  dureeStabilite?: string;
  chaineFroid?: string;
  // Champs BES (Biens d'équipement et services)
  marque?: string;
  modele?: string;
  reference?: string;
  garantie?: string;
  accessoiresInclus?: string;
  normesSecurite?: string;
  materiau?: string;
  alimentation?: string;
}

interface SpecificationTechniqueSalamaModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: SpecificationTechniqueSalamaData) => void;
  productName: string;
  initialData?: SpecificationTechniqueSalamaData;
  readOnly?: boolean;
  elementType?: 'MED' | 'BES' | null; // Type d'élément pour afficher les champs conditionnels
  loading?: boolean; // État de chargement des données
  error?: string | null; // Message d'erreur
}

const SpecificationTechniqueSalamaModal: React.FC<SpecificationTechniqueSalamaModalProps> = ({
  show,
  onClose,
  onSave,
  productName,
  initialData,
  readOnly = false,
  elementType = null,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<SpecificationTechniqueSalamaData>({
    description: "",
    normes: "",
    typeConditionnement: "",
    quantiteParConditionnement: "",
    autreTypeConditionnement: "",
    longueur: "",
    largeur: "",
    hauteur: "",
    volume: "",
    poidsNet: "",
    poidsBrut: "",
    conditionsConservation: "",
    autresDetailsConservation: "",
    instructionsUtilisation: "",
    fichierTechnique: null,
    // Champs MED
    dci: "",
    formePharmaceutique: "",
    dosage: "",
    presentation: "",
    fabricant: "",
    paysOrigine: "",
    numeroAMM: "",
    paysAMM: "",
    certificats: "",
    dureeStabilite: "",
    chaineFroid: "",
    // Champs BES
    marque: "",
    modele: "",
    reference: "",
    garantie: "",
    accessoiresInclus: "",
    normesSecurite: "",
    materiau: "",
    alimentation: "",
  });

  const [fileName, setFileName] = useState<string>("");
  const [activeSlide, setActiveSlide] = useState<number>(0);
  
  // État pour le document blob (affichage embedé)
  const [documentBlobUrl, setDocumentBlobUrl] = useState<string | null>(null);
  const [loadingDocument, setLoadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Charger le document comme blob pour l'afficher dans un iframe
  useEffect(() => {
    if (initialData?.documentUrl && show) {
      setLoadingDocument(true);
      setDocumentError(null);
      
      fetch(initialData.documentUrl)
        .then(response => {
          if (!response.ok) throw new Error('Erreur de téléchargement');
          return response.blob();
        })
        .then(blob => {
          const url = URL.createObjectURL(blob);
          setDocumentBlobUrl(url);
          setLoadingDocument(false);
        })
        .catch(err => {
          console.error('Erreur chargement document:', err);
          setDocumentError('Impossible de charger le document');
          setLoadingDocument(false);
        });
    }
    
    // Cleanup: révoquer l'URL blob lors du démontage
    return () => {
      if (documentBlobUrl) {
        URL.revokeObjectURL(documentBlobUrl);
      }
    };
  }, [initialData?.documentUrl, show]);

  const handleChange = (field: keyof SpecificationTechniqueSalamaData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Vérifier la taille (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier ne doit pas dépasser 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        fichierTechnique: file,
      }));
      setFileName(file.name);
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header
        style={{
          backgroundColor: "#f8fdf9",
          borderBottom: "2px solid #1FB05B",
          padding: "20px 24px",
        }}
      >
        <div style={{ flex: 1 }}>
          <Modal.Title
            style={{
              color: "#1FB05B",
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            {readOnly ? "Spécifications Salama" : "Ajouter une Spécification Technique"}
          </Modal.Title>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            {productName}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            color: "#6b7280",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#f3f4f6";
            e.currentTarget.style.color = "#374151";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.color = "#6b7280";
          }}
        >
          <FaTimes size={20} />
        </button>
      </Modal.Header>

      <Modal.Body style={{ padding: "24px", maxHeight: "70vh", overflowY: "auto" }}>
        {loading ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e5e7eb",
              borderTopColor: "#1FB05B",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              marginBottom: "16px"
            }} />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
            <p style={{ color: "#6b7280", fontSize: "0.938rem", margin: 0 }}>
              Chargement des spécifications techniques...
            </p>
          </div>
        ) : error ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#fef2f2",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px"
            }}>
              <FaClipboardList size={24} style={{ color: "#dc2626" }} />
            </div>
            <p style={{ color: "#dc2626", fontSize: "0.938rem", fontWeight: "500", margin: 0, marginBottom: "8px" }}>
              Erreur
            </p>
            <p style={{ color: "#6b7280", fontSize: "0.875rem", margin: 0 }}>
              {error}
            </p>
          </div>
        ) : !initialData && readOnly ? (
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "60px 20px",
            textAlign: "center"
          }}>
            <div style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#f3f4f6",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px"
            }}>
              <FaFileAlt size={24} style={{ color: "#9ca3af" }} />
            </div>
            <p style={{ color: "#6b7280", fontSize: "0.938rem", margin: 0 }}>
              Aucune spécification technique disponible pour ce produit.
            </p>
          </div>
        ) : readOnly ? (
          <>
            <style>
              {`
                .carousel-indicators {
                  position: static !important;
                  margin: 0 !important;
                  display: flex !important;
                  justify-content: center !important;
                }
                .carousel-indicators [data-bs-target] {
                  background-color: #1FB05B !important;
                  width: 10px !important;
                  height: 10px !important;
                  border-radius: 50% !important;
                  margin: 0 5px !important;
                  opacity: 0.4 !important;
                  transition: all 0.3s ease !important;
                }
                .carousel-indicators .active {
                  opacity: 1 !important;
                  width: 24px !important;
                  border-radius: 5px !important;
                }
                .carousel-control-prev, 
                .carousel-control-next {
                  width: 35px !important;
                  height: 35px !important;
                  background-color: rgba(107, 114, 128, 0.1) !important;
                  border: 1px solid rgba(107, 114, 128, 0.2) !important;
                  border-radius: 50% !important;
                  top: 50% !important;
                  transform: translateY(-50%) !important;
                  opacity: 0.6 !important;
                  transition: all 0.3s ease !important;
                }
                .carousel-control-prev {
                  left: -15px !important;
                }
                .carousel-control-next {
                  right: -15px !important;
                }
                .carousel-control-prev:hover, 
                .carousel-control-next:hover {
                  background-color: rgba(31, 176, 91, 0.15) !important;
                  border-color: rgba(31, 176, 91, 0.3) !important;
                  opacity: 1 !important;
                }
                .carousel-control-prev-icon, 
                .carousel-control-next-icon {
                  width: 16px !important;
                  height: 16px !important;
                  filter: brightness(0.5) !important;
                }
                .carousel-control-prev:hover .carousel-control-prev-icon,
                .carousel-control-next:hover .carousel-control-next-icon {
                  filter: brightness(0.3) sepia(1) saturate(5) hue-rotate(100deg) !important;
                }
              `}
            </style>
            <div>
              <Carousel interval={null} indicators={false} controls={true} activeIndex={activeSlide} onSelect={(selectedIndex) => setActiveSlide(selectedIndex)}>
            <Carousel.Item>
              <Form>
                {/* Description technique */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                    <FaClipboardList className="me-2" style={{ color: "#1FB05B" }} />
                    Description technique
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Non spécifié"
                    value={formData.description}
                    onChange={(e) => handleChange("description", e.target.value)}
                    disabled={readOnly}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      backgroundColor: readOnly ? "#f9fafb" : "white",
                    }}
                  />
                </Form.Group>

                {/* Normes */}
                <Form.Group className="mb-3">
                  <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                    <FaFileAlt className="me-2" style={{ color: "#1FB05B" }} />
                    Normes
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Non spécifié"
                    value={formData.normes}
                    onChange={(e) => handleChange("normes", e.target.value)}
                    disabled={readOnly}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      backgroundColor: readOnly ? "#f9fafb" : "white",
                    }}
                  />
                </Form.Group>

                {/* Section Conditionnement */}
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                    <FaBoxes className="me-2" />
                    Conditionnement
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                          Type de conditionnement
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Non spécifié"
                          value={formData.typeConditionnement}
                          onChange={(e) => handleChange("typeConditionnement", e.target.value)}
                          disabled={readOnly}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.875rem",
                            backgroundColor: readOnly ? "#f9fafb" : "white",
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                          Quantité par conditionnement
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Non spécifié"
                          value={formData.quantiteParConditionnement}
                          onChange={(e) => handleChange("quantiteParConditionnement", e.target.value)}
                          disabled={readOnly}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.875rem",
                            backgroundColor: readOnly ? "#f9fafb" : "white",
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-0">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Autre type de conditionnement
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Non spécifié"
                      value={formData.autreTypeConditionnement}
                      onChange={(e) => handleChange("autreTypeConditionnement", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </div>

                {/* Section Dimensions */}
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                    <FaRuler className="me-2" />
                    Dimensions
                  </h6>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                          Longueur (cm)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Non spécifié"
                          value={formData.longueur}
                          onChange={(e) => handleChange("longueur", e.target.value)}
                          disabled={readOnly}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.875rem",
                            backgroundColor: readOnly ? "#f9fafb" : "white",
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                          Largeur (cm)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={formData.largeur}
                          onChange={(e) => handleChange("largeur", e.target.value)}
                          disabled={readOnly}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.875rem",
                            backgroundColor: readOnly ? "#f9fafb" : "white",
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                          Hauteur (cm)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={formData.hauteur}
                          onChange={(e) => handleChange("hauteur", e.target.value)}
                          disabled={readOnly}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.875rem",
                            backgroundColor: readOnly ? "#f9fafb" : "white",
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Form.Group className="mb-0">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Volume (m³)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={formData.volume}
                      onChange={(e) => handleChange("volume", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </div>

                {/* Section Poids */}
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                    <FaWeightHanging className="me-2" />
                    Poids
                  </h6>
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                          Poids net (kg)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={formData.poidsNet}
                          onChange={(e) => handleChange("poidsNet", e.target.value)}
                          disabled={readOnly}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.875rem",
                            backgroundColor: readOnly ? "#f9fafb" : "white",
                          }}
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group className="mb-0">
                        <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                          Poids brut (kg)
                        </Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={formData.poidsBrut}
                          onChange={(e) => handleChange("poidsBrut", e.target.value)}
                          disabled={readOnly}
                          style={{
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            fontSize: "0.875rem",
                            backgroundColor: readOnly ? "#f9fafb" : "white",
                          }}
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Section Conservation */}
                <div
                  style={{
                    backgroundColor: "#f9fafb",
                    padding: "16px",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                    <FaThermometerHalf className="me-2" />
                    Conservation
                  </h6>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Conditions de conservation
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Non spécifié"
                      value={formData.conditionsConservation}
                      onChange={(e) => handleChange("conditionsConservation", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-0">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Autres détails de conservation
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      placeholder="Non spécifié"
                      value={formData.autresDetailsConservation}
                      onChange={(e) => handleChange("autresDetailsConservation", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </div>

                {/* Instructions d'utilisation */}
                <Form.Group className="mb-0">
                  <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                    <FaClipboardList className="me-2" style={{ color: "#1FB05B" }} />
                    Instructions d'utilisation
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Non spécifié"
                    value={formData.instructionsUtilisation}
                    onChange={(e) => handleChange("instructionsUtilisation", e.target.value)}
                    disabled={readOnly}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      backgroundColor: readOnly ? "#f9fafb" : "white",
                    }}
                  />
                </Form.Group>

                {/* Section conditionnelle MED */}
                {elementType === 'MED' && (
                  <div
                    style={{
                      backgroundColor: "#e0f2fe",
                      padding: "16px",
                      borderRadius: "8px",
                      marginTop: "16px",
                      border: "1px solid #0ea5e9",
                    }}
                  >
                    <h6 style={{ color: "#0ea5e9", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                      Informations Médicaments
                    </h6>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            DCI <span style={{ color: "#dc2626" }}>*</span>
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.dci}
                            onChange={(e) => handleChange("dci", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Forme pharmaceutique
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.formePharmaceutique}
                            onChange={(e) => handleChange("formePharmaceutique", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Dosage
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.dosage}
                            onChange={(e) => handleChange("dosage", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Présentation
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.presentation}
                            onChange={(e) => handleChange("presentation", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Fabricant
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.fabricant}
                            onChange={(e) => handleChange("fabricant", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Pays d'origine
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.paysOrigine}
                            onChange={(e) => handleChange("paysOrigine", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Numéro AMM
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.numeroAMM}
                            onChange={(e) => handleChange("numeroAMM", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Pays AMM
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.paysAMM}
                            onChange={(e) => handleChange("paysAMM", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Certificats (GMP, CPP…)
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.certificats}
                            onChange={(e) => handleChange("certificats", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                            Durée de stabilité
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.dureeStabilite}
                            onChange={(e) => handleChange("dureeStabilite", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group className="mb-0">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Chaîne du froid
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.chaineFroid}
                        onChange={(e) => handleChange("chaineFroid", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </div>
                )}

                {/* Section conditionnelle BES */}
                {elementType === 'BES' && (
                  <div
                    style={{
                      backgroundColor: "#fef3c7",
                      padding: "16px",
                      borderRadius: "8px",
                      marginTop: "16px",
                      border: "1px solid #f59e0b",
                    }}
                  >
                    <h6 style={{ color: "#f59e0b", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                      Informations Équipement
                    </h6>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Marque
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.marque}
                            onChange={(e) => handleChange("marque", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Modèle
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.modele}
                            onChange={(e) => handleChange("modele", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Référence
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.reference}
                            onChange={(e) => handleChange("reference", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Garantie
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.garantie}
                            onChange={(e) => handleChange("garantie", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Accessoires inclus
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.accessoiresInclus}
                            onChange={(e) => handleChange("accessoiresInclus", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Normes de sécurité
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.normesSecurite}
                            onChange={(e) => handleChange("normesSecurite", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Row>
                      <Col md={6}>
                        <Form.Group className="mb-3">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Matériau
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.materiau}
                            onChange={(e) => handleChange("materiau", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group className="mb-0">
                          <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                            Alimentation
                          </Form.Label>
                          <Form.Control
                            type="text"
                            placeholder="Non spécifié"
                            value={formData.alimentation}
                            onChange={(e) => handleChange("alimentation", e.target.value)}
                            disabled={readOnly}
                            style={{
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              fontSize: "0.875rem",
                              backgroundColor: readOnly ? "#f9fafb" : "white",
                            }}
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                  </div>
                )}
              </Form>
            </Carousel.Item>
            <Carousel.Item>
              <div style={{ height: '600px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <h5 style={{ color: "#1FB05B", marginBottom: "16px" }}>Document Technique Salama</h5>
                
                {/* État de chargement */}
                {loadingDocument && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                  }}>
                    <div style={{
                      width: "48px",
                      height: "48px",
                      border: "4px solid #e5e7eb",
                      borderTopColor: "#1FB05B",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                      marginBottom: "16px"
                    }} />
                    <p style={{ color: "#6b7280", fontSize: "0.938rem", margin: 0 }}>
                      Chargement du document...
                    </p>
                  </div>
                )}

                {/* Erreur de chargement - afficher bouton téléchargement */}
                {!loadingDocument && documentError && formData.documentUrl && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '40px 20px',
                    textAlign: 'center',
                    backgroundColor: '#f0fdf4',
                    borderRadius: '12px',
                    border: '2px solid #1FB05B',
                    width: '80%',
                    maxWidth: '400px'
                  }}>
                    <FaFileAlt size={64} style={{ color: '#1FB05B', marginBottom: '20px' }} />
                    <p style={{ color: '#374151', fontSize: '1rem', fontWeight: '600', margin: 0, marginBottom: '8px' }}>
                      Document technique disponible
                    </p>
                    <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0, marginBottom: '20px' }}>
                      Cliquez sur le bouton ci-dessous pour consulter le document
                    </p>
                    <a 
                      href={formData.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#1FB05B',
                        color: 'white',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: '600',
                        fontSize: '0.938rem',
                        boxShadow: '0 2px 4px rgba(31, 176, 91, 0.3)'
                      }}
                    >
                      <FaFileAlt size={16} />
                      Ouvrir le document
                    </a>
                  </div>
                )}

                {/* Document chargé avec succès - afficher dans iframe */}
                {!loadingDocument && !documentError && documentBlobUrl && (
                  <iframe 
                    src={documentBlobUrl}
                    width="100%" 
                    height="520px" 
                    style={{ border: '1px solid #e5e7eb', borderRadius: '8px' }} 
                    title="Spécifications Techniques Salama"
                  ></iframe>
                )}

                {/* Aucun document disponible */}
                {!loadingDocument && !documentBlobUrl && !formData.documentUrl && (
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '60px 20px',
                    textAlign: 'center',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px dashed #e5e7eb',
                    width: '80%',
                    maxWidth: '400px'
                  }}>
                    <FaFileAlt size={48} style={{ color: '#9ca3af', marginBottom: '16px' }} />
                    <p style={{ color: '#6b7280', fontSize: '0.938rem', margin: 0 }}>
                      Aucun document technique disponible
                    </p>
                  </div>
                )}
              </div>
            </Carousel.Item>
          </Carousel>
            </div>
          </>
        ) : (
          <Form>
            {/* Description technique */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                <FaClipboardList className="me-2" style={{ color: "#1FB05B" }} />
                Description technique
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Non spécifié"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                disabled={readOnly}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  backgroundColor: readOnly ? "#f9fafb" : "white",
                }}
              />
            </Form.Group>

            {/* Normes */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                <FaFileAlt className="me-2" style={{ color: "#1FB05B" }} />
                Normes
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Non spécifié"
                value={formData.normes}
                onChange={(e) => handleChange("normes", e.target.value)}
                disabled={readOnly}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  backgroundColor: readOnly ? "#f9fafb" : "white",
                }}
              />
            </Form.Group>

            {/* Section Conditionnement */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                <FaBoxes className="me-2" />
                Conditionnement
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Type de conditionnement
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Non spécifié"
                      value={formData.typeConditionnement}
                      onChange={(e) => handleChange("typeConditionnement", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Quantité par conditionnement
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Non spécifié"
                      value={formData.quantiteParConditionnement}
                      onChange={(e) => handleChange("quantiteParConditionnement", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                  Autre type de conditionnement
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Non spécifié"
                  value={formData.autreTypeConditionnement}
                  onChange={(e) => handleChange("autreTypeConditionnement", e.target.value)}
                  disabled={readOnly}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                    backgroundColor: readOnly ? "#f9fafb" : "white",
                  }}
                />
              </Form.Group>
            </div>

            {/* Section Dimensions */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                <FaRuler className="me-2" />
                Dimensions
              </h6>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Longueur (cm)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="Non spécifié"
                      value={formData.longueur}
                      onChange={(e) => handleChange("longueur", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Largeur (cm)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={formData.largeur}
                      onChange={(e) => handleChange("largeur", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Hauteur (cm)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={formData.hauteur}
                      onChange={(e) => handleChange("hauteur", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                  Volume (m³)
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="0"
                  value={formData.volume}
                  onChange={(e) => handleChange("volume", e.target.value)}
                  disabled={readOnly}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                    backgroundColor: readOnly ? "#f9fafb" : "white",
                  }}
                />
              </Form.Group>
            </div>

            {/* Section Poids */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                <FaWeightHanging className="me-2" />
                Poids
              </h6>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Poids net (kg)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={formData.poidsNet}
                      onChange={(e) => handleChange("poidsNet", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-0">
                    <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                      Poids brut (kg)
                    </Form.Label>
                    <Form.Control
                      type="number"
                      placeholder="0"
                      value={formData.poidsBrut}
                      onChange={(e) => handleChange("poidsBrut", e.target.value)}
                      disabled={readOnly}
                      style={{
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        backgroundColor: readOnly ? "#f9fafb" : "white",
                      }}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </div>

            {/* Section Conservation */}
            <div
              style={{
                backgroundColor: "#f9fafb",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
              }}
            >
              <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                <FaThermometerHalf className="me-2" />
                Conservation
              </h6>
              <Form.Group className="mb-3">
                <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                  Conditions de conservation
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Non spécifié"
                  value={formData.conditionsConservation}
                  onChange={(e) => handleChange("conditionsConservation", e.target.value)}
                  disabled={readOnly}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                    backgroundColor: readOnly ? "#f9fafb" : "white",
                  }}
                />
              </Form.Group>
              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: "500", color: "#6b7280", fontSize: "0.813rem" }}>
                  Autres détails de conservation
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder="Non spécifié"
                  value={formData.autresDetailsConservation}
                  onChange={(e) => handleChange("autresDetailsConservation", e.target.value)}
                  disabled={readOnly}
                  style={{
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                    fontSize: "0.875rem",
                    backgroundColor: readOnly ? "#f9fafb" : "white",
                  }}
                />
              </Form.Group>
            </div>

            {/* Instructions d'utilisation */}
            <Form.Group className="mb-3">
              <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                <FaClipboardList className="me-2" style={{ color: "#1FB05B" }} />
                Instructions d'utilisation
              </Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Non spécifié"
                value={formData.instructionsUtilisation}
                onChange={(e) => handleChange("instructionsUtilisation", e.target.value)}
                disabled={readOnly}
                style={{
                  borderRadius: "8px",
                  border: "1px solid #e5e7eb",
                  fontSize: "0.875rem",
                  backgroundColor: readOnly ? "#f9fafb" : "white",
                }}
              />
            </Form.Group>

            {/* Section conditionnelle MED */}
            {elementType === 'MED' && (
              <div
                style={{
                  backgroundColor: "#e0f2fe",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #0ea5e9",
                }}
              >
                <h6 style={{ color: "#0ea5e9", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                  🏥 Informations Médicaments
                </h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        DCI <span style={{ color: "#dc2626" }}>*</span>
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.dci}
                        onChange={(e) => handleChange("dci", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Forme pharmaceutique
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.formePharmaceutique}
                        onChange={(e) => handleChange("formePharmaceutique", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Dosage
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.dosage}
                        onChange={(e) => handleChange("dosage", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Présentation
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.presentation}
                        onChange={(e) => handleChange("presentation", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Fabricant
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.fabricant}
                        onChange={(e) => handleChange("fabricant", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Pays d'origine
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.paysOrigine}
                        onChange={(e) => handleChange("paysOrigine", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Numéro AMM
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.numeroAMM}
                        onChange={(e) => handleChange("numeroAMM", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Pays AMM
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.paysAMM}
                        onChange={(e) => handleChange("paysAMM", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Certificats (GMP, CPP…)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.certificats}
                        onChange={(e) => handleChange("certificats", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                        Durée de stabilité
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.dureeStabilite}
                        onChange={(e) => handleChange("dureeStabilite", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Form.Group className="mb-0">
                  <Form.Label style={{ fontWeight: "500", color: "#0ea5e9", fontSize: "0.813rem" }}>
                    Chaîne du froid
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Non spécifié"
                    value={formData.chaineFroid}
                    onChange={(e) => handleChange("chaineFroid", e.target.value)}
                    disabled={readOnly}
                    style={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      fontSize: "0.875rem",
                      backgroundColor: readOnly ? "#f9fafb" : "white",
                    }}
                  />
                </Form.Group>
              </div>
            )}

            {/* Section conditionnelle BES */}
            {elementType === 'BES' && (
              <div
                style={{
                  backgroundColor: "#fef3c7",
                  padding: "16px",
                  borderRadius: "8px",
                  marginBottom: "16px",
                  border: "1px solid #f59e0b",
                }}
              >
                <h6 style={{ color: "#f59e0b", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
                  🔧 Informations Équipement
                </h6>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Marque
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.marque}
                        onChange={(e) => handleChange("marque", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Modèle
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.modele}
                        onChange={(e) => handleChange("modele", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Référence
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.reference}
                        onChange={(e) => handleChange("reference", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Garantie
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.garantie}
                        onChange={(e) => handleChange("garantie", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Accessoires inclus
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.accessoiresInclus}
                        onChange={(e) => handleChange("accessoiresInclus", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Normes de sécurité
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.normesSecurite}
                        onChange={(e) => handleChange("normesSecurite", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Matériau
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.materiau}
                        onChange={(e) => handleChange("materiau", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-0">
                      <Form.Label style={{ fontWeight: "500", color: "#f59e0b", fontSize: "0.813rem" }}>
                        Alimentation
                      </Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Non spécifié"
                        value={formData.alimentation}
                        onChange={(e) => handleChange("alimentation", e.target.value)}
                        disabled={readOnly}
                        style={{
                          borderRadius: "8px",
                          border: "1px solid #e5e7eb",
                          fontSize: "0.875rem",
                          backgroundColor: readOnly ? "#f9fafb" : "white",
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            )}

            {/* Upload fichier technique / Lien document */}
            {readOnly ? (
              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                  <FaFileAlt className="me-2" style={{ color: "#1FB05B" }} />
                  Document technique Salama
                </Form.Label>
                <div
                  style={{
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    padding: "16px",
                    backgroundColor: "#f9fafb",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <FaFileAlt size={24} style={{ color: "#1FB05B" }} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: "500", color: "#374151", fontSize: "0.875rem" }}>
                      Spécifications Techniques Salama - Document Officiel
                    </p>
                    <small style={{ color: "#6b7280" }}>
                      Format PDF • Dernière mise à jour: {new Date().toLocaleDateString('fr-FR')}
                    </small>
                  </div>
                  <Button
                    onClick={() => window.open('https://www.pdf995.com/samples/pdf.pdf', '_blank')}
                    style={{
                      backgroundColor: "#1FB05B",
                      border: "none",
                      borderRadius: "6px",
                      padding: "8px 16px",
                      fontSize: "0.813rem",
                      fontWeight: "500",
                      color: "white",
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#188a48";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#1FB05B";
                    }}
                  >
                    Visualiser
                  </Button>
                </div>
              </Form.Group>
            ) : (
              <Form.Group className="mb-0">
                <Form.Label style={{ fontWeight: "600", color: "#374151", fontSize: "0.875rem" }}>
                  <FaFileAlt className="me-2" style={{ color: "#1FB05B" }} />
                  Image ou Fichier technique
                </Form.Label>
                <div
                  style={{
                    border: "2px dashed #e5e7eb",
                    borderRadius: "8px",
                    padding: "20px",
                    textAlign: "center",
                    backgroundColor: "#f9fafb",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1FB05B";
                    e.currentTarget.style.backgroundColor = "#f0fdf4";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e5e7eb";
                    e.currentTarget.style.backgroundColor = "#f9fafb";
                  }}
                >
                  <input
                    type="file"
                    id="fichierTechnique"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="fichierTechnique"
                    style={{
                      cursor: "pointer",
                      color: "#6b7280",
                      fontSize: "0.875rem",
                    }}
                  >
                    {fileName ? (
                      <div>
                        <FaFileAlt size={24} style={{ color: "#1FB05B", marginBottom: "8px" }} />
                        <p style={{ margin: 0, color: "#1FB05B", fontWeight: "500" }}>{fileName}</p>
                        <small style={{ color: "#9ca3af" }}>Cliquez pour changer</small>
                      </div>
                    ) : (
                      <div>
                        <FaFileAlt size={24} style={{ color: "#9ca3af", marginBottom: "8px" }} />
                        <p style={{ margin: 0 }}>Cliquez pour choisir un fichier</p>
                        <small style={{ color: "#9ca3af" }}>
                          Formats acceptés : jpg, png, pdf (max 5MB)
                        </small>
                      </div>
                    )}
                  </label>
                </div>
              </Form.Group>
            )}
          </Form>
        )}
      </Modal.Body>

      <Modal.Footer
        style={{
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          padding: "16px 24px",
          display: "flex",
          justifyContent: readOnly ? "space-between" : "flex-end",
          alignItems: "center",
        }}
      >
        <Button
          variant="outline-secondary"
          onClick={onClose}
          style={{
            borderRadius: "8px",
            padding: "10px 24px",
            fontWeight: "500",
            fontSize: "0.875rem",
          }}
        >
          {readOnly ? "Fermer" : "Annuler"}
        </Button>
        {readOnly ? (
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <button
              onClick={() => setActiveSlide(Math.max(0, activeSlide - 1))}
              disabled={activeSlide === 0}
              style={{
                background: "none",
                border: "none",
                color: activeSlide === 0 ? "#d1d5db" : "#1FB05B",
                cursor: activeSlide === 0 ? "not-allowed" : "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s ease",
                opacity: activeSlide === 0 ? 0.5 : 1,
              }}
            >
              <FaChevronLeft size={18} />
            </button>
            <span style={{ fontSize: "0.875rem", color: "#6b7280", fontWeight: "500" }}>
              {activeSlide + 1} / 2
            </span>
            <button
              onClick={() => setActiveSlide(Math.min(1, activeSlide + 1))}
              disabled={activeSlide === 1}
              style={{
                background: "none",
                border: "none",
                color: activeSlide === 1 ? "#d1d5db" : "#1FB05B",
                cursor: activeSlide === 1 ? "not-allowed" : "pointer",
                padding: "4px",
                display: "flex",
                alignItems: "center",
                transition: "all 0.2s ease",
                opacity: activeSlide === 1 ? 0.5 : 1,
              }}
            >
              <FaChevronRight size={18} />
            </button>
          </div>
        ) : (
          <Button
            onClick={handleSubmit}
            style={{
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: "500",
              fontSize: "0.875rem",
              backgroundColor: "#1FB05B",
              border: "none",
            }}
          >
            Enregistrer
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default SpecificationTechniqueSalamaModal;
