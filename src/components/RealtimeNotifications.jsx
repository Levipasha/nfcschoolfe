import { useState, useEffect } from 'react';
import './RealtimeNotifications.css';

const RealtimeNotifications = ({ notifications, onClose }) => {
    const [visible, setVisible] = useState([]);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[notifications.length - 1];
            setVisible(prev => [...prev, { ...latest, id: Date.now() }]);

            // Auto-remove after 5 seconds
            const timer = setTimeout(() => {
                setVisible(prev => prev.filter(n => n.id !== latest.id));
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [notifications]);

    const removeNotification = (id) => {
        setVisible(prev => prev.filter(n => n.id !== id));
    };

    if (visible.length === 0) return null;

    return (
        <div className="notification-container">
            {visible.map((notification) => (
                <div
                    key={notification.id}
                    className={`notification notification-${notification.type}`}
                >
                    <div className="notification-icon">
                        {notification.type === 'scan' && '📱'}
                        {notification.type === 'added' && '✅'}
                        {notification.type === 'updated' && '📝'}
                        {notification.type === 'deleted' && '🗑️'}
                        {notification.type === 'status' && '🔄'}
                    </div>
                    <div className="notification-content">
                        <div className="notification-title">{notification.title}</div>
                        <div className="notification-message">{notification.message}</div>
                    </div>
                    <button
                        className="notification-close"
                        onClick={() => removeNotification(notification.id)}
                    >
                        ✕
                    </button>
                </div>
            ))}
        </div>
    );
};

export default RealtimeNotifications;
