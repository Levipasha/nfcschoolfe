import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './PanelSwitcher.css';

const PanelSwitcher = ({ currentPanel }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();

    const panels = [
        {
            id: 'school',
            name: 'School Admin',
            subtitle: 'Student Management',
            icon: '🎓',
            path: '/admin/dashboard',
            active: currentPanel === 'school'
        },
        {
            id: 'artist',
            name: 'Artist Panel',
            subtitle: 'Creative Management',
            icon: '🎨',
            path: '/artist/dashboard',
            active: currentPanel === 'artist'
        },
        {
            id: 'general',
            name: 'General Profiles',
            subtitle: 'Link-in-Bio Management',
            icon: '👤',
            path: '/general/dashboard',
            active: currentPanel === 'general'
        },
        {
            id: 'restaurant',
            name: 'Restaurant Profiles',
            subtitle: 'Menu & Restaurant Profiles',
            icon: '🍽️',
            path: '/restaurant/dashboard',
            active: currentPanel === 'restaurant'
        }
    ];

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSwitch = (path) => {
        setIsOpen(false);
        navigate(path);
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        if (currentPanel === 'artist') {
            navigate('/artist/login');
        } else {
            navigate('/admin/login');
        }
    };

    const activePanel = panels.find(p => p.active);

    return (
        <div className="panel-switcher-wrapper" ref={dropdownRef}>
            <button
                className={`panel-switcher-trigger ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                <div className="trigger-icon">{activePanel?.icon}</div>
                <div className="trigger-info">
                    <span className="trigger-name">{activePanel?.name}</span>
                    <span className="trigger-arrow">▼</span>
                </div>
            </button>

            {isOpen && (
                <div className="panel-switcher-dropdown">
                    <div className="dropdown-header">
                        <p>Switch Workspace</p>
                    </div>
                    <div className="dropdown-items">
                        {panels.map(panel => (
                            <button
                                key={panel.id}
                                className={`dropdown-item ${panel.active ? 'current' : ''}`}
                                onClick={() => !panel.active && handleSwitch(panel.path)}
                            >
                                <div className="item-icon">{panel.icon}</div>
                                <div className="item-content">
                                    <span className="item-name">{panel.name}</span>
                                    <span className="item-subtitle">{panel.subtitle}</span>
                                </div>
                                {panel.active && <span className="active-dot">●</span>}
                            </button>
                        ))}
                    </div>
                    <div className="dropdown-footer">
                        <button className="logout-action" onClick={handleLogout}>
                            <span className="logout-icon">🚪</span>
                            Logout Session
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PanelSwitcher;
