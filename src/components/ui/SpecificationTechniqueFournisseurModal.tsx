import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaTimes, FaFileAlt, FaRuler, FaBoxes, FaWeightHanging, FaThermometerHalf, FaCheckCircle, FaExclamationTriangle, FaUpload, FaCommentAlt, FaPills, FaCogs } from "react-icons/fa";

export interface SpecificationTechniqueFournisseurData {
  // Champs de conformité communs
  confirmationSpecifications: boolean;
  confirmationNormes: boolean;
  conformiteConditionnement: 'oui' | 'non' | '';
  conformiteConditionnementEcart: string;
  conformiteQuantite: 'oui' | 'non' | '';
  conformiteQuantiteEcart: string;
  conformiteDimensions: 'oui' | 'non' | '';
  conformiteDimensionsEcart: string;
  conformitePoidsNet: 'oui' | 'non' | '';
  conformitePoidsNetEcart: string;
  conformiteConservation: 'oui' | 'non' | '';
  conformiteConservationEcart: string;
  // Champs MED (groupés)
  conformiteMedProduit: 'oui' | 'non' | '';
  conformiteMedProduitEcart: string;
  conformiteMedAutorisations: 'oui' | 'non' | '';
  conformiteMedAutorisationsEcart: string;
  conformiteMedStabilite: 'oui' | 'non' | '';
  conformiteMedStabiliteEcart: string;
  // Champs BES (groupés)
  conformiteBesIdentification: 'oui' | 'non' | '';
  conformiteBesIdentificationEcart: string;
  conformiteBesGarantie: 'oui' | 'non' | '';
  conformiteBesGarantieEcart: string;
  conformiteBesTechnique: 'oui' | 'non' | '';
  conformiteBesTechniqueEcart: string;
  // Pièce justificative
  pieceJustificative?: File | null; // Nouveau fichier uploadé
  pieceJustificativeUrl?: string | null; // URL du fichier existant depuis l'API
  commentaireFournisseur: string;
}

interface SpecificationTechniqueFournisseurModalProps {
  show: boolean;
  onClose: () => void;
  onSave: (data: SpecificationTechniqueFournisseurData) => void;
  productName: string;
  initialData?: SpecificationTechniqueFournisseurData;
  elementType?: 'MED' | 'BES' | null;
}

const SpecificationTechniqueFournisseurModal: React.FC<SpecificationTechniqueFournisseurModalProps> = ({
  show,
  onClose,
  onSave,
  productName,
  initialData,
  elementType = null,
}) => {
  const [formData, setFormData] = useState<SpecificationTechniqueFournisseurData>({
    // Conformité communs
    confirmationSpecifications: false,
    confirmationNormes: false,
    conformiteConditionnement: '',
    conformiteConditionnementEcart: '',
    conformiteQuantite: '',
    conformiteQuantiteEcart: '',
    conformiteDimensions: '',
    conformiteDimensionsEcart: '',
    conformitePoidsNet: '',
    conformitePoidsNetEcart: '',
    conformiteConservation: '',
    conformiteConservationEcart: '',
    // MED
    conformiteMedProduit: '',
    conformiteMedProduitEcart: '',
    conformiteMedAutorisations: '',
    conformiteMedAutorisationsEcart: '',
    conformiteMedStabilite: '',
    conformiteMedStabiliteEcart: '',
    // BES
    conformiteBesIdentification: '',
    conformiteBesIdentificationEcart: '',
    conformiteBesGarantie: '',
    conformiteBesGarantieEcart: '',
    conformiteBesTechnique: '',
    conformiteBesTechniqueEcart: '',
    pieceJustificative: null,
    commentaireFournisseur: '',
  });

  const [fileName, setFileName] = useState<string>("");

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Le fichier ne doit pas dépasser 5MB");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        pieceJustificative: file,
      }));
      setFileName(file.name);
    }
  };

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  // Composant réutilisable pour les lignes de conformité
  const ConformityRow = ({ 
    icon, 
    label, 
    description,
    fieldName, 
    value, 
    ecartValue, 
    ecartPlaceholder,
    isLast = false 
  }: { 
    icon: React.ReactNode; 
    label: string; 
    description?: string;
    fieldName: string; 
    value: 'oui' | 'non' | ''; 
    ecartValue: string; 
    ecartPlaceholder: string;
    isLast?: boolean;
  }) => (
    <tr style={{ borderBottom: isLast ? "none" : "1px solid #e5e7eb" }}>
      <td style={{ padding: "12px 10px", fontSize: "0.875rem", color: "#374151" }}>
        {icon}
        <span>{label}</span>
        {description && (
          <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "2px", marginLeft: "24px" }}>
            {description}
          </div>
        )}
      </td>
      <td style={{ padding: "12px 10px", textAlign: "center" }}>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Form.Check
            type="radio"
            name={fieldName}
            id={`${fieldName}Oui`}
            label="Oui"
            checked={value === 'oui'}
            onChange={() => setFormData(prev => ({ 
              ...prev, 
              [fieldName]: 'oui', 
              [`${fieldName}Ecart`]: '' 
            }))}
            style={{ fontSize: "0.813rem" }}
          />
          <Form.Check
            type="radio"
            name={fieldName}
            id={`${fieldName}Non`}
            label="Non"
            checked={value === 'non'}
            onChange={() => setFormData(prev => ({ ...prev, [fieldName]: 'non' }))}
            style={{ fontSize: "0.813rem" }}
          />
        </div>
      </td>
      <td style={{ padding: "12px 10px" }}>
        <Form.Control
          type="text"
          placeholder={ecartPlaceholder}
          value={ecartValue}
          onChange={(e) => setFormData(prev => ({ ...prev, [`${fieldName}Ecart`]: e.target.value }))}
          disabled={value !== 'non'}
          style={{
            borderRadius: "6px",
            border: "1px solid #e5e7eb",
            fontSize: "0.813rem",
            backgroundColor: value !== 'non' ? "#f3f4f6" : "white",
          }}
        />
      </td>
    </tr>
  );

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
            Conformité aux Spécifications Techniques
          </Modal.Title>
          <p style={{ margin: 0, color: "#6b7280", fontSize: "0.875rem", fontWeight: "500" }}>
            {productName}
            {elementType && (
              <span style={{ 
                marginLeft: "8px", 
                padding: "2px 8px", 
                borderRadius: "4px",
                fontSize: "0.75rem",
                backgroundColor: elementType === 'MED' ? "#dbeafe" : "#fef3c7",
                color: elementType === 'MED' ? "#1d4ed8" : "#b45309"
              }}>
                {elementType === 'MED' ? 'Médicament' : 'Équipement'}
              </span>
            )}
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
        <Form>
          {/* Section Confirmations obligatoires */}
          <div
            style={{
              backgroundColor: "#fef3c7",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
              border: "1px solid #f59e0b",
            }}
          >
            <h6 style={{ color: "#b45309", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
              <FaExclamationTriangle className="me-2" />
              Confirmations obligatoires
            </h6>
            <Form.Group className="mb-2">
              <Form.Check
                type="checkbox"
                id="confirmationSpecifications"
                checked={formData.confirmationSpecifications}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmationSpecifications: e.target.checked }))}
                label={
                  <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                    Je confirme que mon produit respecte l'ensemble des spécifications techniques Salama.
                  </span>
                }
                style={{ accentColor: "#1FB05B" }}
              />
            </Form.Group>
            <Form.Group className="mb-0">
              <Form.Check
                type="checkbox"
                id="confirmationNormes"
                checked={formData.confirmationNormes}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmationNormes: e.target.checked }))}
                label={
                  <span style={{ fontSize: "0.875rem", color: "#374151" }}>
                    Je confirme la conformité aux normes exigées pour cet article.
                  </span>
                }
                style={{ accentColor: "#1FB05B" }}
              />
            </Form.Group>
          </div>

          {/* Section Conformité détaillée commune */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
            }}
          >
            <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "16px" }}>
              <FaCheckCircle className="me-2" />
              Conformité générale
            </h6>
            <p style={{ fontSize: "0.813rem", color: "#6b7280", marginBottom: "16px" }}>
              Si vous cochez "Non", veuillez préciser la valeur de votre produit.
            </p>
            
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ backgroundColor: "#e5e7eb" }}>
                  <th style={{ padding: "10px", textAlign: "left", fontSize: "0.813rem", fontWeight: "600", color: "#374151", borderRadius: "4px 0 0 4px" }}>Élément</th>
                  <th style={{ padding: "10px", textAlign: "center", fontSize: "0.813rem", fontWeight: "600", color: "#374151", width: "120px" }}>Conforme ?</th>
                  <th style={{ padding: "10px", textAlign: "left", fontSize: "0.813rem", fontWeight: "600", color: "#374151", borderRadius: "0 4px 4px 0" }}>Valeur fournisseur (si écart)</th>
                </tr>
              </thead>
              <tbody>
                <ConformityRow
                  icon={<FaBoxes className="me-2" style={{ color: "#1FB05B" }} />}
                  label="Conditionnement"
                  fieldName="conformiteConditionnement"
                  value={formData.conformiteConditionnement}
                  ecartValue={formData.conformiteConditionnementEcart}
                  ecartPlaceholder="Précisez votre conditionnement..."
                />
                <ConformityRow
                  icon={<FaBoxes className="me-2" style={{ color: "#1FB05B" }} />}
                  label="Quantité par conditionnement"
                  fieldName="conformiteQuantite"
                  value={formData.conformiteQuantite}
                  ecartValue={formData.conformiteQuantiteEcart}
                  ecartPlaceholder="Précisez votre quantité..."
                />
                <ConformityRow
                  icon={<FaRuler className="me-2" style={{ color: "#1FB05B" }} />}
                  label="Dimensions"
                  fieldName="conformiteDimensions"
                  value={formData.conformiteDimensions}
                  ecartValue={formData.conformiteDimensionsEcart}
                  ecartPlaceholder="Précisez vos dimensions (L x l x H)..."
                />
                <ConformityRow
                  icon={<FaWeightHanging className="me-2" style={{ color: "#1FB05B" }} />}
                  label="Poids net"
                  fieldName="conformitePoidsNet"
                  value={formData.conformitePoidsNet}
                  ecartValue={formData.conformitePoidsNetEcart}
                  ecartPlaceholder="Précisez votre poids net..."
                />
                <ConformityRow
                  icon={<FaThermometerHalf className="me-2" style={{ color: "#1FB05B" }} />}
                  label="Conditions de conservation"
                  fieldName="conformiteConservation"
                  value={formData.conformiteConservation}
                  ecartValue={formData.conformiteConservationEcart}
                  ecartPlaceholder="Précisez vos conditions..."
                  isLast
                />
              </tbody>
            </table>
          </div>

          {/* Section MED conditionnelle */}
          {elementType === 'MED' && (
            <div
              style={{
                backgroundColor: "#eff6ff",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #bfdbfe",
              }}
            >
              <h6 style={{ color: "#1d4ed8", fontSize: "0.938rem", fontWeight: "600", marginBottom: "16px" }}>
                <FaPills className="me-2" />
                Conformité Médicaments
              </h6>
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#dbeafe" }}>
                    <th style={{ padding: "10px", textAlign: "left", fontSize: "0.813rem", fontWeight: "600", color: "#1d4ed8", borderRadius: "4px 0 0 4px" }}>Élément</th>
                    <th style={{ padding: "10px", textAlign: "center", fontSize: "0.813rem", fontWeight: "600", color: "#1d4ed8", width: "120px" }}>Conforme ?</th>
                    <th style={{ padding: "10px", textAlign: "left", fontSize: "0.813rem", fontWeight: "600", color: "#1d4ed8", borderRadius: "0 4px 4px 0" }}>Valeur fournisseur (si écart)</th>
                  </tr>
                </thead>
                <tbody>
                  <ConformityRow
                    icon={<FaPills className="me-2" style={{ color: "#1d4ed8" }} />}
                    label="Informations produit"
                    description="DCI, forme pharmaceutique, dosage, présentation"
                    fieldName="conformiteMedProduit"
                    value={formData.conformiteMedProduit}
                    ecartValue={formData.conformiteMedProduitEcart}
                    ecartPlaceholder="Précisez les écarts..."
                  />
                  <ConformityRow
                    icon={<FaFileAlt className="me-2" style={{ color: "#1d4ed8" }} />}
                    label="Autorisations & Certificats"
                    description="AMM, pays AMM, fabricant, origine, certificats GMP/CPP"
                    fieldName="conformiteMedAutorisations"
                    value={formData.conformiteMedAutorisations}
                    ecartValue={formData.conformiteMedAutorisationsEcart}
                    ecartPlaceholder="Précisez les écarts..."
                  />
                  <ConformityRow
                    icon={<FaThermometerHalf className="me-2" style={{ color: "#1d4ed8" }} />}
                    label="Stabilité & Conservation"
                    description="Durée de stabilité, chaîne du froid"
                    fieldName="conformiteMedStabilite"
                    value={formData.conformiteMedStabilite}
                    ecartValue={formData.conformiteMedStabiliteEcart}
                    ecartPlaceholder="Précisez les écarts..."
                    isLast
                  />
                </tbody>
              </table>
            </div>
          )}

          {/* Section BES conditionnelle */}
          {elementType === 'BES' && (
            <div
              style={{
                backgroundColor: "#fffbeb",
                padding: "16px",
                borderRadius: "8px",
                marginBottom: "16px",
                border: "1px solid #fde68a",
              }}
            >
              <h6 style={{ color: "#b45309", fontSize: "0.938rem", fontWeight: "600", marginBottom: "16px" }}>
                <FaCogs className="me-2" />
                Conformité Équipement
              </h6>
              
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#fef3c7" }}>
                    <th style={{ padding: "10px", textAlign: "left", fontSize: "0.813rem", fontWeight: "600", color: "#b45309", borderRadius: "4px 0 0 4px" }}>Élément</th>
                    <th style={{ padding: "10px", textAlign: "center", fontSize: "0.813rem", fontWeight: "600", color: "#b45309", width: "120px" }}>Conforme ?</th>
                    <th style={{ padding: "10px", textAlign: "left", fontSize: "0.813rem", fontWeight: "600", color: "#b45309", borderRadius: "0 4px 4px 0" }}>Valeur fournisseur (si écart)</th>
                  </tr>
                </thead>
                <tbody>
                  <ConformityRow
                    icon={<FaBoxes className="me-2" style={{ color: "#b45309" }} />}
                    label="Identification produit"
                    description="Marque, modèle, référence"
                    fieldName="conformiteBesIdentification"
                    value={formData.conformiteBesIdentification}
                    ecartValue={formData.conformiteBesIdentificationEcart}
                    ecartPlaceholder="Précisez les écarts..."
                  />
                  <ConformityRow
                    icon={<FaCheckCircle className="me-2" style={{ color: "#b45309" }} />}
                    label="Garantie & Accessoires"
                    description="Durée de garantie, accessoires inclus"
                    fieldName="conformiteBesGarantie"
                    value={formData.conformiteBesGarantie}
                    ecartValue={formData.conformiteBesGarantieEcart}
                    ecartPlaceholder="Précisez les écarts..."
                  />
                  <ConformityRow
                    icon={<FaCogs className="me-2" style={{ color: "#b45309" }} />}
                    label="Caractéristiques techniques"
                    description="Normes sécurité, matériau, alimentation"
                    fieldName="conformiteBesTechnique"
                    value={formData.conformiteBesTechnique}
                    ecartValue={formData.conformiteBesTechniqueEcart}
                    ecartPlaceholder="Précisez les écarts..."
                    isLast
                  />
                </tbody>
              </table>
            </div>
          )}

          {/* Section Pièce justificative */}
          <div
            style={{
              backgroundColor: "#f0fdf4",
              padding: "16px",
              borderRadius: "8px",
              marginBottom: "16px",
              border: "1px solid #bbf7d0",
            }}
          >
            <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
              <FaUpload className="me-2" />
              Pièce justificative
            </h6>
            <p style={{ fontSize: "0.813rem", color: "#6b7280", marginBottom: "12px" }}>
              Joignez un document justificatif (certificat ISO/CE, fiche technique, photo du conditionnement...)
            </p>
            <div
              style={{
                border: "2px dashed #bbf7d0",
                borderRadius: "8px",
                padding: "20px",
                textAlign: "center",
                backgroundColor: "white",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "#1FB05B";
                e.currentTarget.style.backgroundColor = "#f0fdf4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "#bbf7d0";
                e.currentTarget.style.backgroundColor = "white";
              }}
            >
              <input
                type="file"
                id="pieceJustificative"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <label
                htmlFor="pieceJustificative"
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
                ) : formData.pieceJustificativeUrl ? (
                  <div>
                    <FaFileAlt size={24} style={{ color: "#1FB05B", marginBottom: "8px" }} />
                    <p style={{ margin: 0, color: "#1FB05B", fontWeight: "500" }}>Document existant</p>
                    <a 
                      href={formData.pieceJustificativeUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      style={{ 
                        color: "#1d4ed8", 
                        textDecoration: "underline",
                        fontSize: "0.813rem",
                        display: "block",
                        marginTop: "4px"
                      }}
                    >
                      Voir le fichier actuel
                    </a>
                    <small style={{ color: "#9ca3af", display: "block", marginTop: "4px" }}>
                      Cliquez pour remplacer
                    </small>
                  </div>
                ) : (
                  <div>
                    <FaUpload size={24} style={{ color: "#1FB05B", marginBottom: "8px" }} />
                    <p style={{ margin: 0, color: "#374151", fontWeight: "500" }}>Cliquez pour choisir un fichier</p>
                    <small style={{ color: "#9ca3af" }}>
                      Formats acceptés : jpg, png, pdf (max 5MB)
                    </small>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Section Commentaire */}
          <div
            style={{
              backgroundColor: "#f9fafb",
              padding: "16px",
              borderRadius: "8px",
            }}
          >
            <h6 style={{ color: "#1FB05B", fontSize: "0.938rem", fontWeight: "600", marginBottom: "12px" }}>
              <FaCommentAlt className="me-2" />
              Commentaire (optionnel)
            </h6>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Ajoutez un commentaire ou des précisions supplémentaires..."
              value={formData.commentaireFournisseur}
              onChange={(e) => setFormData(prev => ({ ...prev, commentaireFournisseur: e.target.value }))}
              style={{
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
                fontSize: "0.875rem",
              }}
            />
          </div>
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
      </Modal.Footer>
    </Modal>
  );
};

export default SpecificationTechniqueFournisseurModal;
