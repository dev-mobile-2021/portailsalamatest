import React from "react";
import { Modal, Spinner } from "react-bootstrap";
import {
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaSpinner,
} from "react-icons/fa";

interface PriceFetchingModalProps {
  show: boolean;
  onClose: () => void;
  isLoading: boolean;
  priceValue: number | null;
  articleName: string;
}

const PriceFetchingModal: React.FC<PriceFetchingModalProps> = ({
  show,
  onClose,
  isLoading,
  priceValue,
  articleName,
}) => {
  const isPriceZero = priceValue === 0 || priceValue === null;
  const showWarning = !isLoading && isPriceZero;

  return (
    <Modal show={show} onHide={onClose} size="lg" centered>
      <Modal.Header
        style={{
          backgroundColor: isLoading
            ? "#f8fdf9"
            : showWarning
              ? "#fffbeb"
              : "#f0fdf4",
          borderBottom: `2px solid ${isLoading ? "#1FB05B" : showWarning ? "#f59e0b" : "#10b981"}`,
          padding: "20px 24px",
        }}
      >
        <div style={{ flex: 1 }}>
          <Modal.Title
            style={{
              color: isLoading
                ? "#1FB05B"
                : showWarning
                  ? "#f59e0b"
                  : "#10b981",
              fontSize: "1.25rem",
              fontWeight: "600",
              marginBottom: "4px",
            }}
          >
            {isLoading
              ? "Récupération du prix..."
              : showWarning
                ? "Prix non disponible"
                : "Prix récupéré"}
          </Modal.Title>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "0.875rem",
              fontWeight: "500",
            }}
          >
            {articleName}
          </p>
        </div>
        <button
          onClick={onClose}
          disabled={isLoading}
          style={{
            background: "none",
            border: "none",
            color: isLoading ? "#d1d5db" : "#6b7280",
            cursor: isLoading ? "not-allowed" : "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "6px",
            transition: "all 0.2s ease",
            opacity: isLoading ? 0.5 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.color = "#374151";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#6b7280";
            }
          }}
        >
          <FaTimes size={20} />
        </button>
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
                Récupération du prix en cours...
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.875rem",
                  color: "#9ca3af",
                }}
              >
                Veuillez patienter pendant que nous récupérons le tarif
              </p>
            </div>
          </div>
        ) : showWarning ? (
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
                backgroundColor: "#fef3c7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FaExclamationTriangle size={40} color="#f59e0b" />
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
                  color: "#f59e0b",
                  marginBottom: "12px",
                }}
              >
                Prix non assigné
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
                Le prix pour cet article n'a pas pu être récupéré. Le prix sera
                automatiquement défini à{" "}
                <strong style={{ color: "#374151" }}>0</strong>.
              </p>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#fef3c7",
                  borderRadius: "8px",
                  border: "1px solid #fde68a",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#92400e",
                      fontWeight: "500",
                    }}
                  >
                    Prix attribué
                  </span>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#f59e0b",
                    }}
                  >
                    0 Ar
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
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
                Prix récupéré avec succès
              </p>
              <div
                style={{
                  padding: "16px",
                  backgroundColor: "#f0fdf4",
                  borderRadius: "8px",
                  border: "1px solid #bbf7d0",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.875rem",
                      color: "#065f46",
                      fontWeight: "500",
                    }}
                  >
                    Prix unitaire
                  </span>
                  <span
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: "700",
                      color: "#10b981",
                    }}
                  >
                    {priceValue?.toLocaleString()} Ar
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer
        style={{
          backgroundColor: "#f9fafb",
          borderTop: "1px solid #e5e7eb",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "flex-end",
        }}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          style={{
            padding: "10px 24px",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            backgroundColor: isLoading ? "#f3f4f6" : "white",
            color: isLoading ? "#9ca3af" : "#374151",
            fontSize: "0.875rem",
            fontWeight: "500",
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
            outline: "none",
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "#f3f4f6";
              e.currentTarget.style.borderColor = "#9ca3af";
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#d1d5db";
            }
          }}
        >
          {isLoading ? "Chargement..." : "Fermer"}
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default PriceFetchingModal;
