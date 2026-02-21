import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithGoogle } from '../firebase';
import './ArtistLogin.css';

const ArtistLogin = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Simple authentication - fallback
        if (username === 'artist' && password === 'artist123') {
            navigate('/artist/dashboard');
        } else {
            setError('Invalid credentials. Use username: artist, password: artist123');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const user = await signInWithGoogle();
            console.log("Logged in user:", user);
            // In a real app, you'd verify this on the backend
            // For now, we'll just redirect to dashboard
            navigate('/artist/dashboard');
        } catch (error) {
            setError('Google Sign-In failed. Please try again.');
        }
    };

    return (
        <div className="artist-login-container">
            <div className="artist-login-card">
                <div className="artist-login-header">
                    <div className="artist-icon">🎨</div>
                    <h1>Artist Panel</h1>
                    <p>Login to manage your artist profiles</p>
                </div>

                <div className="social-login-section">
                    <button type="button" onClick={handleGoogleLogin} className="google-login-btn">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Continue with Google
                    </button>
                    <div className="divider">
                        <span>or continue with email</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="artist-login-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="artist-login-btn">
                        Login
                    </button>

                    <div className="artist-login-footer">
                        <p>Default credentials:</p>
                        <p><strong>Username:</strong> artist</p>
                        <p><strong>Password:</strong> artist123</p>
                        <div className="switch-panel">
                            <button
                                type="button"
                                onClick={() => navigate('/admin/login')}
                                className="switch-btn"
                            >
                                Switch to School Admin
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArtistLogin;
