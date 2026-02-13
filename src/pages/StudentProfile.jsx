import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { studentAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import './StudentProfile.css';

const StudentProfile = () => {
    const [searchParams] = useSearchParams();
    const studentId = searchParams.get('id');

    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStudent = async () => {
            if (!studentId) {
                setError('No student ID provided');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                const response = await studentAPI.getStudent(studentId);

                if (response.data.success) {
                    setStudent(response.data.data);
                } else {
                    setError('Student not found');
                }
            } catch (err) {
                console.error('Error fetching student:', err);

                if (err.response?.status === 404) {
                    setError('Student not found');
                } else if (err.response?.status === 429) {
                    setError('Too many requests. Please try again later.');
                } else if (err.response?.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError('Failed to load student profile. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchStudent();
    }, [studentId]);

    if (loading) {
        return <LoadingSpinner message="Loading student profile..." />;
    }

    if (error) {
        return (
            <div className="error-container">
                <div className="animated-background"></div>
                <div className="error-content">
                    <div className="error-icon-animated">⚠️</div>
                    <h1 className="error-title">Student Not Found</h1>
                    <p className="error-message">{error}</p>
                    <div className="error-details">
                        <p>Please check the NFC tag and try again.</p>
                        <div className="student-id-badge">
                            Student ID: <span>{studentId || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="error-container">
                <div className="error-content">
                    <div className="error-icon-animated">🔍</div>
                    <h1 className="error-title">No Student Data</h1>
                    <p className="error-message">Unable to retrieve student information.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="student-profile-wrapper">
            {/* Animated Background */}
            <div className="profile-background">
                <div className="gradient-orb orb-1"></div>
                <div className="gradient-orb orb-2"></div>
                <div className="gradient-orb orb-3"></div>
            </div>

            <div className="container-sm">
                <div className="profile-card slide-up">
                    {/* Header with Photo */}
                    <div className="profile-header">
                        <div className="header-pattern"></div>
                        <div className="photo-wrapper">
                            <div className="photo-ring-animation"></div>
                            <div className="photo-container">
                                <img
                                    src={student.photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=667eea&color=fff&size=200`}
                                    alt={student.name}
                                    className="student-photo"
                                    onError={(e) => {
                                        if (!e.target.dataset.tried) {
                                            e.target.dataset.tried = 'true';
                                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=667eea&color=fff&size=200`;
                                        }
                                    }}
                                />
                            </div>
                            <div className="verified-badge">
                                <span className="checkmark">✓</span>
                            </div>
                        </div>
                        <div className="student-id-display">
                            ID: {student.studentId}
                        </div>
                    </div>

                    {/* Student Name & Basic Info */}
                    <div className="profile-body">
                        <h1 className="student-name">{student.name}</h1>
                        <div className="student-subtitle">
                            <span className="subtitle-item">
                                <span className="icon">🎓</span>
                                Class {student.class}
                            </span>
                            <span className="subtitle-divider">•</span>
                            <span className="subtitle-item">
                                <span className="icon">📋</span>
                                Roll {student.rollNumber}
                            </span>
                        </div>

                        {/* Information Cards */}
                        <div className="info-section">
                            <h2 className="section-title">
                                <span className="title-icon">👨‍👩‍👦</span>
                                Parent Information
                            </h2>

                            <div className="info-cards">
                                <div className="info-card">
                                    <div className="card-icon">👤</div>
                                    <div className="card-content">
                                        <div className="card-label">Parent Name</div>
                                        <div className="card-value">{student.parentName}</div>
                                    </div>
                                </div>

                                <div className="info-card clickable">
                                    <div className="card-icon">📱</div>
                                    <div className="card-content">
                                        <div className="card-label">Parent Phone</div>
                                        <a href={`tel:${student.parentPhone}`} className="card-value phone-link">
                                            {student.parentPhone}
                                            <span className="call-icon">📞</span>
                                        </a>
                                    </div>
                                </div>

                                <div className="info-card clickable emergency">
                                    <div className="card-icon">🚨</div>
                                    <div className="card-content">
                                        <div className="card-label">Emergency Contact</div>
                                        <a href={`tel:${student.emergencyContact}`} className="card-value phone-link">
                                            {student.emergencyContact}
                                            <span className="call-icon">📞</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Stats Section */}
                        <div className="stats-section">
                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-content">
                                    <div className="stat-value">{student.scanCount}</div>
                                    <div className="stat-label">Total Scans</div>
                                </div>
                            </div>

                            {student.lastScanned && (
                                <div className="stat-card">
                                    <div className="stat-icon">🕐</div>
                                    <div className="stat-content">
                                        <div className="stat-value-small">
                                            {new Date(student.lastScanned).toLocaleDateString()}
                                        </div>
                                        <div className="stat-label">Last Scanned</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="profile-footer">
                        <div className="footer-badge">
                            <span className="badge-dot"></span>
                            Powered by NFC Student System
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudentProfile;
