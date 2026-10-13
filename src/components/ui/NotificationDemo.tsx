import React from 'react';
import NotificationPopup from './NotificationPopup';
import { useNotification } from '../../hooks/useNotification';

const NotificationDemo: React.FC = () => {
  const { notification, showSuccess, showError, hideNotification } = useNotification();

  const handleSuccessDemo = () => {
    showSuccess(
      "Opération réussie !",
      "Votre soumission a été envoyée avec succès. Vous recevrez une confirmation par email."
    );
  };

  const handleErrorDemo = () => {
    showError(
      "Erreur de validation",
      "Veuillez vérifier tous les champs obligatoires avant de soumettre le formulaire."
    );
  };

  return (
    <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ color: '#1FB05B', marginBottom: '30px' }}>
        Démonstration des Notifications
      </h2>
      
      <p style={{ marginBottom: '30px', color: '#666' }}>
        Testez les différents types de notifications avec les boutons ci-dessous :
      </p>
      
      <div style={{ display: 'flex', gap: '20px', marginBottom: '40px' }}>
        <button
          onClick={handleSuccessDemo}
          style={{
            backgroundColor: '#1FB05B',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#17a04b';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#1FB05B';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Notification de Succès
        </button>
        
        <button
          onClick={handleErrorDemo}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '12px 24px',
            fontSize: '16px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#c82333';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc3545';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Notification d'Erreur
        </button>
      </div>
      
      <div style={{
        backgroundColor: '#f8f9fa',
        padding: '20px',
        borderRadius: '8px',
        border: '1px solid #e9ecef'
      }}>
        <h4 style={{ marginBottom: '15px', color: '#495057' }}>
          Fonctionnalités :
        </h4>
        <ul style={{ color: '#6c757d', lineHeight: '1.6' }}>
          <li>✅ Auto-fermeture après 5 secondes (configurable)</li>
          <li>✅ Fermeture manuelle avec bouton X</li>
          <li>✅ Fermeture en cliquant sur l'overlay</li>
          <li>✅ Animations d'entrée et de sortie</li>
          <li>✅ Barre de progression pour visualiser l'auto-fermeture</li>
          <li>✅ Design responsive et moderne</li>
          <li>✅ Types : succès (vert) et erreur (rouge)</li>
        </ul>
      </div>

      <NotificationPopup
        isVisible={notification.isVisible}
        type={notification.type}
        title={notification.title}
        message={notification.message}
        onClose={hideNotification}
        autoCloseDelay={5000}
      />
    </div>
  );
};

export default NotificationDemo;
