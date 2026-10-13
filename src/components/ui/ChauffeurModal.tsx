import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaTimes, FaArrowLeft, FaCheck } from "react-icons/fa";

export interface ChauffeurData {
  id?: string;
  nom: string;
  telephone: string;
  email: string;
  adresse: string;
  code?: string;
}

interface ChauffeurModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: ChauffeurData) => void;
  onBack?: () => void; // Bouton retour optionnel pour le flux enchaîné
  initialData?: ChauffeurData;
  isStep2?: boolean; // Indique si c'est l'étape 2 du flux véhicule + chauffeur
  vehiculeInfo?: { matricule: string; marque: string }; // Info du véhicule pour contexte
}

const ChauffeurModal: React.FC<ChauffeurModalProps> = ({
  show,
  onClose,
  onSave,
  onBack,
  initialData,
  isStep2 = false,
  vehiculeInfo,
}) => {
  const [formData, setFormData] = useState<ChauffeurData>({
    nom: "",
    telephone: "",
    email: "",
    adresse: "",
    code: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ChauffeurData, string>>>({});

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({
        nom: "",
        telephone: "",
        email: "",
        adresse: "",
        code: "",
      });
    }
    setErrors({});
  }, [initialData, show]);

  const handleChange = (field: keyof ChauffeurData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ChauffeurData, string>> = {};
    
    if (!formData.nom.trim()) {
      newErrors.nom = "Le nom est obligatoire";
    }
    if (!formData.telephone.trim()) {
      newErrors.telephone = "Le téléphone est obligatoire";
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Format email invalide";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave({
        ...formData,
        id: formData.id || `chauffeur-${Date.now()}`,
      });
    }
  };

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header
        style={{
          backgroundColor: isStep2 ? "#fff8e1" : "#f8fdf9",
          borderBottom: `2px solid ${isStep2 ? "#ffc107" : "#1FB05B"}`,
          padding: "20px 24px",
        }}
      >
        <div style={{ flex: 1 }}>
          {isStep2 ? (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                <span 
                  style={{ 
                    backgroundColor: "#f57c00", 
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
                  2
                </span>
                <Modal.Title
                  style={{
                    color: "#f57c00",
                    fontSize: "1.25rem",
                    fontWeight: "600",
                  }}
                >
                  <FaUser className="me-2" />
                  Étape 2: Chauffeur
                </Modal.Title>
              </div>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem", paddingLeft: "34px" }}>
                {vehiculeInfo 
                  ? `Véhicule: ${vehiculeInfo.matricule} - ${vehiculeInfo.marque}` 
                  : "Renseignez les informations du chauffeur pour ce véhicule"
                }
              </p>
            </>
          ) : (
            <>
              <Modal.Title
                style={{
                  color: "#1FB05B",
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "4px",
                }}
              >
                <FaUser className="me-2" />
                {initialData ? "Modifier le chauffeur" : "Nouveau Chauffeur"}
              </Modal.Title>
              <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem" }}>
                Renseignez les informations du chauffeur
              </p>
            </>
          )}
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
                  Nom <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaUser />
                  </span>
                  <Form.Control
                    type="text"
                    value={formData.nom}
                    onChange={(e) => handleChange("nom", e.target.value)}
                    placeholder="Nom complet du chauffeur"
                    isInvalid={!!errors.nom}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.nom}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>
                  Téléphone <span className="text-danger">*</span>
                </Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaPhone />
                  </span>
                  <Form.Control
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) => handleChange("telephone", e.target.value)}
                    placeholder="+261 34 00 000 00"
                    isInvalid={!!errors.telephone}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.telephone}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaEnvelope />
                  </span>
                  <Form.Control
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    placeholder="email@exemple.com"
                    isInvalid={!!errors.email}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.email}
                  </Form.Control.Feedback>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Adresse</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <FaMapMarkerAlt />
                  </span>
                  <Form.Control
                    type="text"
                    value={formData.adresse}
                    onChange={(e) => handleChange("adresse", e.target.value)}
                    placeholder="Adresse complète"
                  />
                </div>
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
          justifyContent: isStep2 && onBack ? "space-between" : "flex-end",
          gap: "12px",
        }}
      >
        {isStep2 && onBack && (
          <Button
            variant="outline-secondary"
            onClick={onBack}
            style={{
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: "500",
              fontSize: "0.875rem",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaArrowLeft /> Retour au véhicule
          </Button>
        )}
        <div style={{ display: "flex", gap: "12px" }}>
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
          <Button
            onClick={handleSubmit}
            style={{
              borderRadius: "8px",
              padding: "10px 24px",
              fontWeight: "500",
              fontSize: "0.875rem",
              backgroundColor: isStep2 ? "#f57c00" : "#1FB05B",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <FaCheck /> {isStep2 ? "Créer Véhicule + Chauffeur" : (initialData ? "Enregistrer" : "Créer")}
          </Button>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default ChauffeurModal;
