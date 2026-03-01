import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../services/api';
import './AdminLogin.css';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('email'); // 'email' | 'otp'
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError('Please enter your email');
            return;
        }
        try {
            setLoading(true);
            setError('');
            await adminAPI.sendOtp(email.trim());
            setStep('otp');
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Too many attempts. Please try again later.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Failed to send code. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e) => {
        e.preventDefault();
        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit code');
            return;
        }
        try {
            setLoading(true);
            setError('');
            const response = await adminAPI.verifyOtp(email.trim(), otp);
            if (response.data.success) {
                localStorage.setItem('adminToken', response.data.token);
                navigate('/admin/dashboard');
            }
        } catch (err) {
            if (err.response?.status === 429) {
                setError('Too many attempts. Please try again later.');
            } else if (err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError('Invalid or expired code. Request a new one.');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        setStep('email');
        setOtp('');
        setError('');
    };

    return (
        <div className="admin-login-wrapper">
            <div className="login-background"></div>

            <div className="login-container">
                <div className="login-card fade-in">
                    <div className="login-header">
                        <div className="login-icon">🔐</div>
                        <h1 className="login-title gradient-text">Admin Login</h1>
                        <p className="login-subtitle">NFC Student Profile System</p>
                    </div>

                    {step === 'email' ? (
                        <form onSubmit={handleEmailSubmit} className="login-form">
                            {error && (
                                <div className="alert alert-error">
                                    <span className="alert-icon">⚠️</span>
                                    {error}
                                </div>
                            )}
                            <div className="input-group">
                                <label htmlFor="email" className="input-label">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    className="input-field"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-full"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Sending code...
                                    </>
                                ) : (
                                    'Send verification code'
                                )}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleOtpSubmit} className="login-form">
                            {error && (
                                <div className="alert alert-error">
                                    <span className="alert-icon">⚠️</span>
                                    {error}
                                </div>
                            )}
                            <p className="otp-sent-hint">
                                We sent a 6-digit code to <strong>{email}</strong>
                            </p>
                            <div className="input-group">
                                <label htmlFor="otp" className="input-label">
                                    Verification code
                                </label>
                                <input
                                    type="text"
                                    id="otp"
                                    inputMode="numeric"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, ''));
                                        setError('');
                                    }}
                                    className="input-field"
                                    placeholder="Enter 6-digit code"
                                    autoComplete="one-time-code"
                                    disabled={loading}
                                />
                            </div>
                            <button
                                type="submit"
                                className="btn btn-primary btn-lg btn-full"
                                disabled={loading || otp.length !== 6}
                            >
                                {loading ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Verifying...
                                    </>
                                ) : (
                                    'Verify & Login'
                                )}
                            </button>
                            <button
                                type="button"
                                className="btn btn-link btn-full"
                                onClick={handleBack}
                                disabled={loading}
                            >
                                ← Use different email
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
