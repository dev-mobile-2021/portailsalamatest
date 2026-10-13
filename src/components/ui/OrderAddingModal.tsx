import React, { useEffect } from "react";
import { Modal, Spinner } from "react-bootstrap";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
  FaList,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface OrderAddingModalProps {
  show: boolean;
  onClose: () => void;
  status: "loading" | "success" | "error" | "idle";
  errorMessage?: string;
  successMessage?: string;
  redirectPath?: string;
}

const OrderAddingModal: React.FC<OrderAddingModalProps> = ({
  show,
  onClose,
  status,
  errorMessage,
  successMessage,
  redirectPath = "/orders_client",
}) => {
  const navigate = useNavigate();
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  const handleRedirect = () => {
    onClose();
    navigate(redirectPath);
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && show) {
      timer = setTimeout(() => {
        handleRedirect();
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess, show, redirectPath, onClose, navigate]);

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      backdrop={isLoading ? "static" : true}
      keyboard={!isLoading}
    >
      <Modal.Header
        style={{
          backgroundColor: isLoading
            ? "#f8fdf9" // Light green while loading
            : isError
              ? "#fef2f2" // Light red on error
              : isSuccess
                ? "#f0fdf4" // Light green on success
                : "#ffffff", // Default white
          borderBottom: `2px solid ${
            isLoading
              ? "#1FB05B"
              : isError
                ? "#ef4444"
                : isSuccess
                  ? "#10b981"
                  : "#e5e7eb"
          }`,
          padding: "20px 24px",
        }}
        closeButton={!isLoading}
      >
        <div style={{ flex: 1 }}>
          <Modal.Title
            style={{
              color: isLoading
                ? "#1FB05B"
                : isError
                  ? "#ef4444"
                  : isSuccess
                    ? "#10b981"
                    : "#374151",
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            {isLoading
              ? "Ajout de la commande..."
              : isError
                ? "Erreur lors de l'ajout"
                : isSuccess
                  ? "Commande ajoutée"
                  : "Détails de la commande"}
          </Modal.Title>
        </div>
      </Modal.Header>

      <Modal.Body style={{ padding: "32px 24px" }}>
        {isLoading ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "20px",
              padding: "24px",
            }}
          >
            <div
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Spinner
                animation="border"
                style={{
                  width: "60px",
                  height: "60px",
                  color: "#1FB05B",
                  borderWidth: "4px",
                }}
              />
              <FaSpinner
                size={24}
                style={{
                  position: "absolute",
                  color: "#1FB05B",
                }}
              />
            </div>
            <div style={{ textAlign: "center" }}>
              <p
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "#374151",
                  marginBottom: "8px",
                }}
              >
                Ajout de la commande en cours...
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                }}
              >
                Veuillez patienter pendant que nous enregistrons votre commande.
              </p>
            </div>
          </div>
        ) : isError ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#fee2e2",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaExclamationTriangle size={40} color="#ef4444" />
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "1.125rem",
                  fontWeight: "700",
                  color: "#ef4444",
                  marginBottom: "12px",
                }}
              >
                Échec de l'ajout
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  lineHeight: "1.5",
                  marginBottom: "16px",
                }}
              >
                {errorMessage ||
                  "Une erreur est survenue lors de l'ajout de la commande."}
              </p>
            </div>
          </div>
        ) : isSuccess ? (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                backgroundColor: "#d1fae5",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaCheckCircle size={40} color="#10b981" />
            </div>
            <div
              style={{
                textAlign: "center",
                padding: "0 16px",
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: "1.125rem",
                  fontWeight: "700",
                  color: "#10b981",
                  marginBottom: "12px",
                }}
              >
                Succès !
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "#6b7280",
                  lineHeight: "1.5",
                  marginBottom: "16px",
                }}
              >
                {successMessage || "Votre commande a été ajoutée avec succès."}
              </p>
              <p
                style={{
                  margin: "8px 0 0 0",
                  fontSize: "0.8rem",
                  color: "#9ca3af",
                  fontStyle: "italic",
                }}
              >
                Redirection automatique dans quelques instants...
              </p>
            </div>
          </div>
        ) : null}
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
        {!isLoading && (
          <>
            {isSuccess ? (
              <button
                onClick={handleRedirect}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "none",
                  backgroundColor: "#1FB05B",
                  color: "white",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#16a34a";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#1FB05B";
                }}
              >
                <FaList /> Voir mes commandes
              </button>
            ) : (
              <button
                onClick={onClose}
                style={{
                  padding: "10px 24px",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  color: "#374151",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  outline: "none",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                  e.currentTarget.style.borderColor = "#9ca3af";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "white";
                  e.currentTarget.style.borderColor = "#d1d5db";
                }}
              >
                Fermer
              </button>
            )}
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default OrderAddingModal;
