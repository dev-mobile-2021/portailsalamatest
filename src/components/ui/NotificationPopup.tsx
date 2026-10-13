import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaExclamationTriangle, FaTimes } from 'react-icons/fa';

interface NotificationPopupProps {
  isVisible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
  onClose: () => void;
  autoCloseDelay?: number; // en millisecondes, par défaut 5000ms
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({
  isVisible,
  type,
  title,
  message,
  onClose,
  autoCloseDelay = 5000
}) => {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true);
      
      // Auto-fermeture après le délai spécifié
      const timer = setTimeout(() => {
        handleClose();
      }, autoCloseDelay);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoCloseDelay]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      onClose();
    }, 300); // Délai pour l'animation de sortie
  };

  if (!isVisible) return null;

  const getStyles = () => {
    const baseStyles = {
      overlay: {
        position: 'fixed' as const,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999,       
        opacity: isAnimating ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      },
      popup: {
        backgroundColor: 'white',
        borderRadius: '16px',
        padding: '24px',
        minWidth: '400px',
        maxWidth: '500px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
        transform: isAnimating ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-20px)',
        transition: 'all 0.3s ease-in-out',
        position: 'relative' as const,
      }
    };

    if (type === 'success') {
      return {
        ...baseStyles,
        popup: {
          ...baseStyles.popup,
          border: '3px solid #1FB05B',
        },
        icon: {
          color: '#1FB05B',
          fontSize: '48px',
          marginBottom: '16px',
        },
        title: {
          color: '#1FB05B',
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '12px',
        }
      };
    } else {
      return {
        ...baseStyles,
        popup: {
          ...baseStyles.popup,
          border: '3px solid #dc3545',
        },
        icon: {
          color: '#dc3545',
          fontSize: '48px',
          marginBottom: '16px',
        },
        title: {
          color: '#dc3545',
          fontSize: '20px',
          fontWeight: 'bold',
          marginBottom: '12px',
        }
      };
    }
  };

  const styles = getStyles();

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.popup} onClick={(e) => e.stopPropagation()}>
        {/* Bouton de fermeture */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            color: '#999',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f0f0f0';
            e.currentTarget.style.color = '#333';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#999';
          }}
        >
          <FaTimes />
        </button>

        {/* Contenu de la notification */}
        <div style={{ textAlign: 'center' }}>
          {/* Icône */}
          <div style={styles.icon}>
            {type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
          </div>

          {/* Titre */}
          <h3 style={styles.title}>{title}</h3>

          {/* Message */}
          <p style={{
            color: '#666',
            fontSize: '16px',
            lineHeight: '1.5',
            margin: '0 0 24px 0',
          }}>
            {message}
          </p>

          {/* Bouton d'action */}
          <button
            onClick={handleClose}
            style={{
              backgroundColor: type === 'success' ? '#1FB05B' : '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '16px',
              fontWeight: '500',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              minWidth: '120px',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Fermer
          </button>
        </div>

   

        <style>
          {`
            @keyframes shrink {
              from {
                transform: scaleX(1);
              }
              to {
                transform: scaleX(0);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default NotificationPopup;
