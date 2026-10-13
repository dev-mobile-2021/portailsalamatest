import { memo, useState, useRef, useEffect } from 'react';
import { FaBell } from 'react-icons/fa';
import { useUserNotifications } from '../../hooks/useUserNotifications';
import NotificationDropdown from './NotificationDropdown';
import './notifications.css';

const NotificationBell = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  
  const { 
    groupedNotifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead 
  } = useUserNotifications();

  // Fermer le dropdown quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="notification-bell-container" ref={bellRef}>
      <button 
        className="notification-bell-btn"
        onClick={toggleDropdown}
        aria-label="Notifications"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '42px',
          height: '42px',
          padding: 0,
          border: '1px solid rgba(255, 255, 255, 0.4)',
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.4) 0%, rgba(255, 255, 255, 0.2) 100%)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderRadius: '50%',
          cursor: 'pointer',
          position: 'relative',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.08)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(25, 135, 84, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.6)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)';
        }}
      >
        <FaBell 
          size={18} 
          color="#198754" 
          style={{ 
            display: 'block',
            filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))',
          }} 
        />
        {unreadCount > 0 && (
          <span 
            className="notification-badge"
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              minWidth: '18px',
              height: '18px',
              padding: '0 5px',
              fontSize: '10px',
              fontWeight: 700,
              color: 'white',
              background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5253 100%)',
              borderRadius: '9px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(238, 82, 83, 0.4)',
              border: '2px solid white',
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationDropdown
          groups={groupedNotifications}
          unreadCount={unreadCount}
          onMarkAsRead={markAsRead}
          onMarkAllAsRead={markAllAsRead}
          onClose={handleClose}
        />
      )}
    </div>
  );
});

NotificationBell.displayName = 'NotificationBell';

export default NotificationBell;
