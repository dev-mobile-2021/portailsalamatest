import React from "react";
import { Card } from "react-bootstrap";
import { FaComment } from "react-icons/fa";

/**
 * CommentInput - Composant réutilisable pour saisir des commentaires
 * 
 * @param value - Valeur du commentaire
 * @param onChange - Callback quand le commentaire change
 * @param label - Label affiché (défaut: "Commentaire (optionnel)")
 * @param placeholder - Placeholder du textarea
 * @param rows - Nombre de lignes (défaut: 3)
 * @param disabled - Désactiver le champ
 * @param maxLength - Longueur maximale
 * @param showCard - Afficher dans une Card (défaut: true)
 * @param className - Classes CSS additionnelles
 */

interface CommentInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  maxLength?: number;
  showCard?: boolean;
  className?: string;
  required?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
  value,
  onChange,
  label = "Commentaire ",
  placeholder = "Ajouter un commentaire...",
  rows = 3,
  disabled = false,
  maxLength,
  showCard = true,
  className = "",
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (maxLength && newValue.length > maxLength) return;
    onChange(newValue);
  };

  const content = (
    <>
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <FaComment style={{ color: "#1FB05B", fontSize: "1rem" }} />
          <span style={{ fontWeight: 600, color: "#374151", fontSize: "0.95rem" }}>
            {label}
            {required && <span style={{ color: "#dc3545", marginLeft: "4px" }}>*</span>}
          </span>
        </div>
        {maxLength && (
          <span style={{ 
            fontSize: "0.8rem", 
            color: value.length >= maxLength ? "#dc3545" : "#6b7280" 
          }}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        className="form-control"
        rows={rows}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        required={required}
        style={{
          borderRadius: "8px",
          border: "1px solid #e5e7eb",
          resize: "vertical",
          fontSize: "0.95rem",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease"
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "#1FB05B";
          e.target.style.boxShadow = "0 0 0 3px rgba(31,176,91,0.1)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "#e5e7eb";
          e.target.style.boxShadow = "none";
        }}
      />
    </>
  );

  if (!showCard) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Card className={`mb-4 ${className}`} style={{ borderRadius: "12px", border: "1px solid #e5e7eb" }}>
      <Card.Body>
        {content}
      </Card.Body>
    </Card>
  );
};

export default CommentInput;
