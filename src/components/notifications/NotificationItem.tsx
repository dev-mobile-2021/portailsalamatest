import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiFileText, 
  FiPackage, 
  FiCheckCircle, 
  FiTruck, 
  FiAlertCircle 
} from 'react-icons/fi';
import { UserNotification, NotificationType, NOTIFICATION_TYPE_CONFIG } from '../../types/Notification.types';
import { formatRelativeTime } from '../../hooks/useUserNotifications';
import './notifications.css';

interface NotificationItemProps {
  notification: UserNotification;
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

// Mapping des icônes
const ICON_MAP: Record<NotificationType, React.ComponentType<{ size?: number }>> = {
  AO: FiFileText,
  BC: FiPackage,
  VALIDATION: FiCheckCircle,
  EXPEDITION: FiTruck,
  ALERTE: FiAlertCircle,
};

const NotificationItem = memo(({ notification, onMarkAsRead, onClose }: NotificationItemProps) => {
  const navigate = useNavigate();
  const config = NOTIFICATION_TYPE_CONFIG[notification.type];
  const Icon = ICON_MAP[notification.type];

  const handleClick = () => {
    onMarkAsRead(notification.id);
    if (notification.link) {
      onClose();
      navigate(notification.link);
    }
  };

  return (
    <div 
      className={`notification-item ${notification.isRead ? 'read' : 'unread'}`}
      onClick={handleClick}
      style={{ 
        borderLeftColor: notification.isRead ? '#e9ecef' : config.color 
      }}
    >
      <div 
        className="notification-icon"
        style={{ backgroundColor: `${config.color}15`, color: config.color }}
      >
        <Icon size={18} />
      </div>
      <div className="notification-content">
        <div className="notification-title">
          {notification.title}
          {notification.metadata?.reference && (
            <span className="notification-reference">
              {notification.metadata.reference}
            </span>
          )}
        </div>
        <div className="notification-message">{notification.message}</div>
        <div className="notification-time">
          {formatRelativeTime(notification.timestamp)}
        </div>
      </div>
    </div>
  );
});

NotificationItem.displayName = 'NotificationItem';

export default NotificationItem;
