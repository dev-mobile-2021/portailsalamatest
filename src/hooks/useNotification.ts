import { useState, useCallback } from 'react';

interface NotificationState {
  isVisible: boolean;
  type: 'success' | 'error';
  title: string;
  message: string;
}

// Fonction utilitaire pour extraire les messages d'erreur de validation
const extractErrorMessages = (error: any): string => {
  try {
    // Cas 1: Erreur avec response.data contenant des détails de validation
    if (error?.response?.data?.data) {
      const validationErrors = error.response.data.data;
      const messages = Object.entries(validationErrors)
        .map(([, errors]: [string, any]) => {
          if (Array.isArray(errors)) {
            return errors.join(', ');
          }
          return errors;
        })
        .filter(Boolean);
      
      if (messages.length > 0) {
        return messages.join('\n');
      }
    }

    // Cas 2: Erreur avec response.data.message
    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    // Cas 3: Message d'erreur standard
    if (error?.message) {
      return error.message;
    }

    // Cas par défaut
    return 'Une erreur inconnue s\'est produite';
  } catch (e) {
    return error?.message || 'Une erreur inconnue s\'est produite';
  }
};

export const useNotification = () => {
  const [notification, setNotification] = useState<NotificationState>({
    isVisible: false,
    type: 'success',
    title: '',
    message: '',
  });

  const showSuccess = useCallback((title: string, message: string) => {
    setNotification({
      isVisible: true,
      type: 'success',
      title,
      message,
    });
  }, []);

  const showError = useCallback((title: string, messageOrError: string | any) => {
    // Si c'est un objet d'erreur, extraire le message approprié
    const message = typeof messageOrError === 'string' 
      ? messageOrError 
      : extractErrorMessages(messageOrError);

    setNotification({
      isVisible: true,
      type: 'error',
      title,
      message,
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(prev => ({
      ...prev,
      isVisible: false,
    }));
  }, []);

  return {
    notification,
    showSuccess,
    showError,
    hideNotification,
  };
};