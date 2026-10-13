/**
 * Types pour le système de notifications utilisateur
 */

export type NotificationType = 'AO' | 'BC' | 'VALIDATION' | 'EXPEDITION' | 'ALERTE';

export interface UserNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  link?: string; // URL vers la ressource concernée
  metadata?: {
    reference?: string; // Ex: "AO-2024-087"
    [key: string]: any;
  };
}

export interface NotificationGroup {
  label: string; // Ex: "Aujourd'hui", "Hier"
  notifications: UserNotification[];
}

// Configuration des types de notifications
export const NOTIFICATION_TYPE_CONFIG: Record<NotificationType, {
  icon: string;
  color: string;
  label: string;
}> = {
  AO: {
    icon: 'FiFileText',
    color: '#0d6efd',  // Bleu
    label: 'Appel d\'offres'
  },
  BC: {
    icon: 'FiPackage',
    color: '#198754',  // Vert
    label: 'Bon de commande'
  },
  VALIDATION: {
    icon: 'FiCheckCircle',
    color: '#20c997',  // Teal
    label: 'Validation'
  },
  EXPEDITION: {
    icon: 'FiTruck',
    color: '#6f42c1',  // Violet
    label: 'Expédition'
  },
  ALERTE: {
    icon: 'FiAlertCircle',
    color: '#dc3545',  // Rouge
    label: 'Alerte'
  }
};
