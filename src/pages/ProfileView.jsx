import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import StudentProfile from './StudentProfile';
import ArtistProfile from './ArtistProfile';
import './ProfileView.css';

const ProfileView = () => {
    const { token } = useParams();
    const [profileType, setProfileType] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    useEffect(() => {
        const checkProfileType = async () => {
            try {
                // We'll use the same endpoint as the profiles
                const response = await fetch(`${API_URL}/api/p/${token}`);
                const data = await response.json();

                if (data.success) {
                    setProfileType(data.data.type);
                    setProfileData(data.data);
                } else {
                    setError(data.message || 'Profile not found');
                }
            } catch (err) {
                console.error('Error checking profile type:', err);
                setError('Error loading profile');
            } finally {
                setLoading(false);
            }
        };

        checkProfileType();
    }, [token, API_URL]);

    if (loading) {
        return (
            <div className="profile-loading-screen">
                <div className="loading-logo">🎨 | 🎓</div>
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
                <p>Loading Secure Profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-error-screen">
                <div className="error-icon">🚫</div>
                <h1>Unable to load profile</h1>
                <p>{error}</p>
                <button onClick={() => window.location.reload()} className="retry-btn">
                    Try Again
                </button>
            </div>
        );
    }

    if (profileType === 'artist') {
        return <ArtistProfile artistData={profileData} />;
    }

    return <StudentProfile studentData={profileData} />;
};

export default ProfileView;
