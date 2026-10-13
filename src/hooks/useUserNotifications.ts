import { useState, useCallback, useMemo } from 'react';
import { UserNotification, NotificationGroup } from '../types/Notification.types';

// Données mockées pour le développement
const MOCK_NOTIFICATIONS: UserNotification[] = [
  {
    id: '1',
    type: 'AO',
    title: 'Nouvelle offre disponible',
    message: 'Appel d\'offres AO-2024-087 publié',
    timestamp: new Date(Date.now() - 15 * 60 * 1000), // Il y a 15 min
    isRead: false,
    link: '/suiviMarche',
    metadata: { reference: 'AO-2024-087' }
  },
  {
    id: '2',
    type: 'BC',
    title: 'Bon de commande validé',
    message: 'Votre BC-2024-001 a été approuvé par Salama',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // Il y a 2 heures
    isRead: false,
    link: '/suiviMarche',
    metadata: { reference: 'BC-2024-001' }
  },
  {
    id: '3',
    type: 'VALIDATION',
    title: 'Fabricant approuvé',
    message: 'Votre demande de validation fabricant a été acceptée',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // Il y a 5 heures
    isRead: false,
    link: '/fabricants',
  },
  {
    id: '4',
    type: 'ALERTE',
    title: 'Date limite demain',
    message: 'La soumission AO-2024-085 expire demain à 17h00',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // Hier
    isRead: true,
    link: '/suiviMarche',
    metadata: { reference: 'AO-2024-085' }
  },
  {
    id: '5',
    type: 'EXPEDITION',
    title: 'Livraison en cours',
    message: 'Expédition EXP-2024-012 partie de l\'entrepôt',
    timestamp: new Date(Date.now() - 26 * 60 * 60 * 1000), // Hier
    isRead: true,
    link: '/portailTransporteur',
    metadata: { reference: 'EXP-2024-012' }
  }
];

// Fonction utilitaire pour formater le temps relatif
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'À l\'instant';
  if (diffMinutes < 60) return `Il y a ${diffMinutes} min`;
  if (diffHours < 24) return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
  if (diffDays === 1) return 'Hier';
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString('fr-FR');
};

// Fonction pour grouper les notifications par date
const groupNotificationsByDate = (notifications: UserNotification[]): NotificationGroup[] => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayNotifs: UserNotification[] = [];
  const yesterdayNotifs: UserNotification[] = [];
  const olderNotifs: UserNotification[] = [];

  notifications.forEach(notif => {
    const notifDate = new Date(notif.timestamp);
    notifDate.setHours(0, 0, 0, 0);

    if (notifDate.getTime() === today.getTime()) {
      todayNotifs.push(notif);
    } else if (notifDate.getTime() === yesterday.getTime()) {
      yesterdayNotifs.push(notif);
    } else {
      olderNotifs.push(notif);
    }
  });

  const groups: NotificationGroup[] = [];

  if (todayNotifs.length > 0) {
    groups.push({ label: 'Aujourd\'hui', notifications: todayNotifs });
  }
  if (yesterdayNotifs.length > 0) {
    groups.push({ label: 'Hier', notifications: yesterdayNotifs });
  }
  if (olderNotifs.length > 0) {
    groups.push({ label: 'Plus ancien', notifications: olderNotifs });
  }

  return groups;
};

export const useUserNotifications = () => {
  const [notifications, setNotifications] = useState<UserNotification[]>(MOCK_NOTIFICATIONS);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(notifications);
  }, [notifications]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(n => ({ ...n, isRead: true }))
    );
  }, []);

  const addNotification = useCallback((notification: Omit<UserNotification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: UserNotification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  return {
    notifications,
    groupedNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    addNotification,
  };
};
