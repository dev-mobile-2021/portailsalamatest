import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FaTimes, FaCar, FaArrowRight } from "react-icons/fa";
import { ChauffeurData } from "./ChauffeurModal";

export interface VehiculeData {
  id?: string;
  typevehicule_id: string;
  matricule: string;
  marque: string;
  tonnage_id: string;
  description: string;
  volume: number;
  chauffeur?: ChauffeurData | null;
}

interface Tonnage {
  id: string;
  tonnage: number;
  designation: string;
  unite?: {
    code: string;
  };
}

interface TypeVehicule {
  id: string;
  designation: string;
}

interface VehiculeModalProps {
  show: boolean;
  onClose: () => void;
  onNext: (vehiculeData: VehiculeData) => void; // Passe au modal chauffeur
  onSave?: (vehiculeData: VehiculeData) => void; // Enregistre le véhicule sans chauffeur
  initialData?: VehiculeData;
  tonnages: Tonnage[];
  typesVehicule: TypeVehicule[];
  loadingOptions: boolean;
}

const VehiculeModal: React.FC<VehiculeModalProps> = ({
  show,
  onClose,
  onNext,
  onSave,
  initialData,
  tonnages,
  typesVehicule,
  loadingOptions,
}) => {
  const [formData, setFormData] = useState<VehiculeData>({
    typevehicule_id: "",
    matricule: "",
    marque: "",
    tonnage_id: "",
    description: "",
    volume: 0,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof VehiculeData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        typevehicule_id: "",
        matricule: "",
        marque: "",
        tonnage_id: "",
        description: "",
        volume: 0,
      });
    }
    setErrors({});
  }, [initialData, show]);

  const handleChange = (field: keyof VehiculeData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof VehiculeData, string>> = {};
    
    if (!formData.matricule.trim()) {
      newErrors.matricule = "Le matricule est obligatoire";
    }
    if (!formData.marque.trim()) {
      newErrors.marque = "La marque est obligatoire";
    }
    if (!formData.typevehicule_id) {
      newErrors.typevehicule_id = "Le type de véhicule est obligatoire";
    }
    if (!formData.tonnage_id) {
      newErrors.tonnage_id = "Le tonnage est obligatoire";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      onNext({
        ...formData,
        id: formData.id || `vehicule-${Date.now()}`,
      });
    }
  };

  const handleSave = () => {
    if (validate() && onSave) {
      onSave({
        ...formData,
        id: formData.id || `vehicule-${Date.now()}`,
        chauffeur: null, // Pas de chauffeur
      });
    }
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
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <span 
              style={{ 
                backgroundColor: "#1FB05B", 
                color: "white", 
                borderRadius: "50%", 
                width: "24px", 
                height: "24px", 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "600"
              }}
            >
              1
            </span>
            <Modal.Title
              style={{
                color: "#1FB05B",
                fontSize: "1.25rem",
                fontWeight: "600",
              }}
            >
              <FaCar className="me-2" />
              {initialData ? "Modifier le véhicule" : "Étape 1: Nouveau Véhicule"}
            </Modal.Title>
          </div>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem", paddingLeft: "34px" }}>
            Renseignez les informations du véhicule, puis passez au chauffeur
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
          }}
        >
          <FaTimes size={20} />
        </button>
      </Modal.Header>

      <Modal.Body style={{ padding: "24px" }}>
        <Form>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Matricule <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.matricule}
                  onChange={(e) => handleChange("matricule", e.target.value)}
                  placeholder="Numéro d'immatriculation"
                  isInvalid={!!errors.matricule}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.matricule}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Marque <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={formData.marque}
                  onChange={(e) => handleChange("marque", e.target.value)}
                  placeholder="Marque du véhicule"
                  isInvalid={!!errors.marque}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.marque}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Type de véhicule <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.typevehicule_id}
                  onChange={(e) => handleChange("typevehicule_id", e.target.value)}
                  disabled={loadingOptions}
                  isInvalid={!!errors.typevehicule_id}
                >
                  <option value="">
                    {loadingOptions ? "Chargement..." : "Sélectionnez un type"}
                  </option>
                  {typesVehicule.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.designation}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.typevehicule_id}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Tonnage <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  value={formData.tonnage_id}
                  onChange={(e) => handleChange("tonnage_id", e.target.value)}
                  disabled={loadingOptions}
                  isInvalid={!!errors.tonnage_id}
                >
                  <option value="">
                    {loadingOptions ? "Chargement..." : "Sélectionnez un tonnage"}
                  </option>
                  {tonnages.map((tonnage) => (
                    <option key={tonnage.id} value={tonnage.id}>
                      {tonnage.designation || `${tonnage.tonnage} ${tonnage.unite?.code || "T"}`}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.tonnage_id}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Volume (m³)</Form.Label>
                <Form.Control
                  type="number"
                  value={formData.volume || ""}
                  onChange={(e) => handleChange("volume", parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  step="0.1"
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Description du véhicule (optionnel)"
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>

      <Modal.Footer
        style={{
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "flex-end",
          gap: "12px",
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
          Annuler
        </Button>

        {onSave && (
          <Button
            variant="outline-success"
            onClick={handleSave}
            style={{
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: "500",
              fontSize: "0.875rem",
              borderColor: "#1FB05B",
              color: "#1FB05B",
            }}
          >
            Enregistrer sans chauffeur
          </Button>
        )}
        
        <Button
          onClick={handleNext}
          style={{
            borderRadius: "8px",
            padding: "10px 24px",
            fontWeight: "500",
            fontSize: "0.875rem",
            backgroundColor: "#1FB05B",
            border: "none",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          Suivant: Chauffeur <FaArrowRight />
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VehiculeModal;
