import React from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface ConfirmationPopupProps {
  isVisible: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationPopup: React.FC<ConfirmationPopupProps> = ({
  isVisible,
  title,
  message,
  onConfirm,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          width: '400px',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
          textAlign: 'center',
        }}
      >
        <h4 style={{ color: '#1FB05B', marginBottom: '16px' }}>{title}</h4>
        <p style={{ color: '#666', marginBottom: '24px' }}>{message}</p>

        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <button
            onClick={onCancel}
            style={{
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            <FaTimesCircle style={{ marginRight: '8px' }} /> Annuler
          </button>

          <button
            onClick={onConfirm}
            style={{
              backgroundColor: '#1FB05B',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontSize: '16px',
            }}
          >
            <FaCheckCircle style={{ marginRight: '8px' }} /> Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationPopup;
