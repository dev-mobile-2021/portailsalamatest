import React from "react";
import { Modal, Button } from "react-bootstrap";
import { FaExclamationTriangle, FaTimes, FaExclamationCircle, FaInfoCircle } from "react-icons/fa";

interface ConfirmationModalProps {
  show: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "warning" | "danger" | "info";
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  show,
  onClose,
  onConfirm,
  title = "Confirmation",
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  variant = "warning"
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  // Configuration des couleurs et icônes selon le variant
  const config = {
    warning: {
      headerBg: '#fffbeb',
      borderColor: '#f59e0b',
      iconBg: '#fef3c7',
      iconColor: '#f59e0b',
      icon: FaExclamationTriangle,
      confirmBtnBg: '#f59e0b',
      confirmBtnHover: '#d97706'
    },
    danger: {
      headerBg: '#fef2f2',
      borderColor: '#ef4444',
      iconBg: '#fee2e2',
      iconColor: '#ef4444',
      icon: FaExclamationCircle,
      confirmBtnBg: '#ef4444',
      confirmBtnHover: '#dc2626'
    },
    info: {
      headerBg: '#f0fdf4',
      borderColor: '#1FB05B',
      iconBg: '#d1fae5',
      iconColor: '#1FB05B',
      icon: FaInfoCircle,
      confirmBtnBg: '#1FB05B',
      confirmBtnHover: '#059669'
    }
  };

  const currentConfig = config[variant];
  const IconComponent = currentConfig.icon;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header style={{ 
        backgroundColor: currentConfig.headerBg, 
        borderBottom: `2px solid ${currentConfig.borderColor}`,
        padding: '20px 24px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          flex: 1 
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: currentConfig.iconBg,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <IconComponent size={20} style={{ color: currentConfig.iconColor }} />
          </div>
          <Modal.Title style={{ 
            color: '#374151', 
            fontSize: '1.125rem',
            fontWeight: '600',
            margin: 0
          }}>
            {title}
          </Modal.Title>
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
          <FaTimes size={18} />
        </button>
      </Modal.Header>

      <Modal.Body style={{ padding: '24px' }}>
        <p style={{ 
          margin: 0, 
          fontSize: '1rem', 
          color: '#4b5563',
          lineHeight: '1.6',
          textAlign: 'center'
        }}>
          {message}
        </p>
      </Modal.Body>

      <Modal.Footer style={{ 
        backgroundColor: '#f9fafb', 
        borderTop: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'center',
        gap: '12px'
      }}>
        <Button
          variant="outline-secondary"
          onClick={onClose}
          style={{
            borderRadius: '8px',
            padding: '10px 24px',
            fontWeight: '500',
            fontSize: '0.875rem',
            border: '1px solid #d1d5db',
            color: '#374151',
            backgroundColor: 'white',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
            e.currentTarget.style.borderColor = '#9ca3af';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = '#d1d5db';
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={handleConfirm}
          style={{
            borderRadius: '8px',
            padding: '10px 24px',
            fontWeight: '500',
            fontSize: '0.875rem',
            border: 'none',
            backgroundColor: currentConfig.confirmBtnBg,
            color: 'white',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = currentConfig.confirmBtnHover;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = currentConfig.confirmBtnBg;
          }}
        >
          {confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
