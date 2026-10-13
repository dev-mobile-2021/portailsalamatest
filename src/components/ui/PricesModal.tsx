import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

interface PriceDetail {
  fabricant_id: number;
  fabricantName: string;
  prixunitaire: number;
  devise: string;
}

interface PricesModalProps {
  show: boolean;
  onClose: () => void;
  productName: string;
  prices: PriceDetail[];
}

const PricesModal: React.FC<PricesModalProps> = ({ show, onClose, productName, prices }) => {
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header style={{
        backgroundColor: '#f8fdf9',
        borderBottom: '2px solid #1FB05B',
        padding: '12px 16px'
      }}>
        <div style={{ flex: 1 }}>
          <Modal.Title style={{
            color: '#1FB05B',
            fontSize: '1.1rem',
            fontWeight: '600',
            marginBottom: '4px'
          }}>
            Détail des prix
          </Modal.Title>
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '0.8rem',
            fontWeight: '500'
          }}>
            {productName}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#6b7280',
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '6px',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.color = '#374151';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#6b7280';
          }}
        >
          <FaTimes size={20} />
        </button>
      </Modal.Header>

      <Modal.Body style={{ padding: '16px' }}>
        {prices.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #e5e7eb" }}>
                <th style={{
                  textAlign: "left",
                  padding: "10px 8px",
                  fontWeight: 700,
                  color: "#475569",
                  fontSize: "0.85rem"
                }}>
                  Fabricant
                </th>
                <th style={{
                  textAlign: "right",
                  padding: "10px 8px",
                  fontWeight: 700,
                  color: "#475569",
                  fontSize: "0.85rem"
                }}>
                  Prix
                </th>
              </tr>
            </thead>
            <tbody>
              {prices.map((price, idx) => (
                <tr key={idx} style={{ borderBottom: "1px solid #f3f4f6" }}>
                  <td style={{
                    padding: "10px 8px",
                    color: "#1f2937",
                    fontWeight: 600,
                    fontSize: "0.85rem"
                  }}>
                    {price.fabricantName}
                  </td>
                  <td style={{
                    padding: "10px 8px",
                    textAlign: "right",
                    color: "#1f2937",
                    fontSize: "0.85rem"
                  }}>
                    {price.prixunitaire.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} <small>{price.devise}</small>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ textAlign: "center", padding: "20px", color: "#9ca3af" }}>
            Aucun prix renseigné
          </div>
        )}
      </Modal.Body>

      <Modal.Footer style={{
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        backgroundColor: '#f8fdf9'
      }}>
        <Button
          variant="light"
          onClick={onClose}
          style={{
            border: '1px solid #d1d5db',
            color: '#374151',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default PricesModal;
