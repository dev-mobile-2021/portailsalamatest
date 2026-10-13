import { memo } from 'react';
import { FiCheck } from 'react-icons/fi';
import { NotificationGroup } from '../../types/Notification.types';
import NotificationItem from './NotificationItem';
import './notifications.css';

interface NotificationDropdownProps {
  groups: NotificationGroup[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
}

const NotificationDropdown = memo(({ 
  groups, 
  unreadCount,
  onMarkAsRead, 
  onMarkAllAsRead,
  onClose 
}: NotificationDropdownProps) => {
  const hasNotifications = groups.some(g => g.notifications.length > 0);

  return (
    <div className="notification-dropdown">
      {/* Header */}
      <div className="notification-header">
        <h6 className="notification-header-title">Notifications</h6>
        {unreadCount > 0 && (
          <button 
            className="notification-mark-all-btn"
            onClick={(e) => {
              e.stopPropagation();
              onMarkAllAsRead();
            }}
          >
            <FiCheck size={14} />
            <span>Tout marquer comme lu</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="notification-body">
        {hasNotifications ? (
          groups.map((group) => (
            group.notifications.length > 0 && (
              <div key={group.label} className="notification-group">
                <div className="notification-group-label">{group.label}</div>
                {group.notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                    onClose={onClose}
                  />
                ))}
              </div>
            )
          ))
        ) : (
          <div className="notification-empty">
            <p>Aucune notification</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="notification-footer">
        <a href="/notifications" className="notification-view-all">
          Voir toutes les notifications →
        </a>
      </div>
    </div>
  );
});

NotificationDropdown.displayName = 'NotificationDropdown';

export default NotificationDropdown;
