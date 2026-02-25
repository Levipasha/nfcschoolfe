import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { studentAPI } from '../services/api';
import { fixImageUrl } from '../utils/imageHelper';
import './StudentProfile.css';

const StudentProfile = ({ studentData }) => {
    const [searchParams] = useSearchParams();
    const studentId = searchParams.get('id');

    const [student, setStudent] = useState(studentData || null);
    const [loading, setLoading] = useState(studentData ? false : true);
    const [error, setError] = useState(null);
    const [imageModalOpen, setImageModalOpen] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnim, setFlipAnim] = useState('');
    const [isFlipAnimating, setIsFlipAnimating] = useState(false);
    const [isNight, setIsNight] = useState(false);

    const handleFlip = () => {
        if (isFlipAnimating) return;

        const goingToBack = !isFlipped;
        setIsFlipped(goingToBack);
        setFlipAnim(goingToBack ? 'flip-to-back' : 'flip-to-front');
        setIsFlipAnimating(true);
    };

    const handleFlipAnimEnd = () => {
        if (!isFlipAnimating) return;
        setIsFlipAnimating(false);
        setFlipAnim('');
    };

    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@lottiefiles/dotlottie-wc@0.8.11/dist/dotlottie-wc.js';
        script.type = 'module';
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    useEffect(() => {
        const updateNightMode = () => {
            const hour = new Date().getHours();
            setIsNight(hour >= 18 || hour < 6);
        };

        updateNightMode();
        const intervalId = setInterval(updateNightMode, 60 * 1000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const fetchStudent = async () => {
            if (studentData) return;
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
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
                <dotlottie-wc src="https://lottie.host/5f54c8aa-f2d2-44b9-9101-4c41b8752402/tbiOHPgfhx.lottie" style={{ width: '300px', height: '300px' }} autoplay loop></dotlottie-wc>
                <p style={{ color: '#ffffff', marginTop: '20px', fontSize: '1.1rem' }}>Loading student profile...</p>
            </div>
        );
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

    const fatherName =
        student.fatherName ||
        student.father_name ||
        student.father ||
        student.fatherFullName ||
        student.parents?.father?.name ||
        student.parents?.fatherName ||
        student.guardian?.fatherName ||
        student.guardian?.father?.name ||
        student.family?.fatherName ||
        '';

    const instituteName =
        student.instituteName ||
        student.institute ||
        student.institution ||
        student.schoolName ||
        student.school?.name ||
        student.collegeName ||
        student.college?.name ||
        '';

    const toTitleCase = (str) => {
        return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(' ');
    };

    const motherName =
        student.motherName ||
        student.mother_name ||
        student.mother ||
        student.motherFullName ||
        student.parents?.mother?.name ||
        student.parents?.motherName ||
        student.guardian?.motherName ||
        student.guardian?.mother?.name ||
        student.family?.motherName ||
        '';

    const fatherPhone =
        student.fatherPhone ||
        student.father_phone ||
        student.fatherNumber ||
        student.fatherMobile ||
        student.father_contact ||
        student.parents?.father?.phone ||
        student.parents?.father?.mobile ||
        student.parents?.fatherPhone ||
        student.guardian?.fatherPhone ||
        student.guardian?.father?.phone ||
        student.family?.fatherPhone ||
        '';

    const motherPhone =
        student.motherPhone ||
        student.mother_phone ||
        student.motherNumber ||
        student.motherMobile ||
        student.mother_contact ||
        student.parents?.mother?.phone ||
        student.parents?.mother?.mobile ||
        student.parents?.motherPhone ||
        student.guardian?.motherPhone ||
        student.guardian?.mother?.phone ||
        student.family?.motherPhone ||
        '';

    return (
        <div className="student-profile-wrapper">
            {/* Animated Background */}
            {isNight ? (
                <section className="night-bg" aria-hidden="true">
                    <div className="falling-stars">
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                        <span className="star"></span>
                    </div>
                </section>
            ) : (
                <div className="profile-background">
                    <div className="gradient-orb orb-1"></div>
                    <div className="gradient-orb orb-2"></div>
                    <div className="gradient-orb orb-3"></div>
                </div>
            )}

            <div className="container-sm">
                <div className="flip-card-container" onClick={handleFlip}>
                    <div
                        className={`flip-card ${isFlipped ? 'flipped' : ''} ${flipAnim} ${isFlipAnimating ? 'is-flip-animating' : ''}`}
                        onAnimationEnd={handleFlipAnimEnd}
                    >
                        {/* Front Side - Student Info */}
                        <div className="flip-card-front flip-card-side">
                            <div className="profile-card slide-up">
                                {/* Header with Photo (no bg animation) */}
                                <div className="profile-header">
                                    <div className="photo-wrapper">
                                        <div className="photo-ring-animation"></div>
                                        <div
                                            className="photo-container clickable-photo"
                                            onClick={(e) => { e.stopPropagation(); setImageModalOpen(true); }}
                                            role="button"
                                            tabIndex={0}
                                            onKeyPress={(e) => {
                                                if (e.key === 'Enter' || e.key === ' ') {
                                                    setImageModalOpen(true);
                                                }
                                            }}
                                        >
                                            <img
                                                src={fixImageUrl(student.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=667eea&color=fff&size=200`}
                                                alt={student.name}
                                                className="student-photo"
                                                onError={(e) => {
                                                    if (!e.target.dataset.tried) {
                                                        e.target.dataset.tried = 'true';
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=667eea&color=fff&size=200`;
                                                    }
                                                }}
                                            />
                                            <div className="photo-overlay">
                                                <span className="zoom-icon">🔍</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Student Name, Institute & Roll – clean UI */}
                                <div className="profile-body">
                                    <h1 className="student-name">{student.name}</h1>
                                    {(student.nickname || student.nickName || student.alias) && (
                                        <div className="student-nickname">
                                            {student.nickname || student.nickName || student.alias}
                                        </div>
                                    )}
                                    {instituteName && <div className="student-institute">{toTitleCase(instituteName)}</div>}
                                    <div className="roll-number-card">
                                        <span className="roll-number-icon">📋</span>
                                        <span className="roll-number-label">Roll</span>
                                        <span className="roll-number-value">{student.rollNumber ?? '—'}</span>
                                    </div>
                                    <div className="flip-tap-wrap">
                                        <button type="button" className="flip-tap-hint flip-tap-btn" onClick={(e) => { e.stopPropagation(); handleFlip(); }}>Tap card to see details</button>
                                    </div>

                                    <h3 className="student-section-label">CONTACT</h3>
                                    <div className="front-quick-info">
                                        {student.emergencyContact && (
                                            <div className="quick-row">
                                                <span className="quick-label">Emergency</span>
                                                <a className="quick-value" href={`tel:${student.emergencyContact}`}>
                                                    {student.emergencyContact}
                                                </a>
                                            </div>
                                        )}
                                        {fatherName && (
                                            <div className="quick-row">
                                                <span className="quick-label">Father</span>
                                                <span className="quick-value">{fatherName}</span>
                                            </div>
                                        )}
                                        {fatherPhone && (
                                            <div className="quick-row">
                                                <span className="quick-label">Father Phone</span>
                                                <a className="quick-value" href={`tel:${fatherPhone}`}>
                                                    {fatherPhone}
                                                </a>
                                            </div>
                                        )}
                                        {motherName && (
                                            <div className="quick-row">
                                                <span className="quick-label">Mother</span>
                                                <span className="quick-value">{motherName}</span>
                                            </div>
                                        )}
                                        {motherPhone && (
                                            <div className="quick-row">
                                                <span className="quick-label">Mother Phone</span>
                                                <a className="quick-value" href={`tel:${motherPhone}`}>
                                                    {motherPhone}
                                                </a>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="student-section-label">INFO</h3>
                                    <div className="front-pills">
                                        <div className="front-pill">
                                            <div className="front-pill-value">{student.class ?? '—'}</div>
                                            <div className="front-pill-label">Class</div>
                                        </div>
                                        <div className="front-pill">
                                            <div className="front-pill-value">{student.age ?? '—'}</div>
                                            <div className="front-pill-label">Age</div>
                                        </div>
                                        <div className="front-pill">
                                            <div className="front-pill-value">{student.bloodGroup ?? '—'}</div>
                                            <div className="front-pill-label">Blood Group</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="profile-footer">
                                    <div className="premium-brand-badge">
                                        <span className="badge-text">Powered by <a href="https://nanoprofiles.com" target="_blank" rel="noopener noreferrer" className="badge-link">NanoProfiles</a></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* Back Side - Institute & Details */}
                        <div className="flip-card-back flip-card-side">
                            <div className="back-content">
                                <div className="back-header">
                                    <div className="back-title">Institute Details</div>
                                </div>

                                <div className="back-section">
                                    <div className="back-section-title">Student Address</div>
                                    <div className="back-card">
                                        {(student.address || student.pincode || student.city || student.state) ? (
                                            <>
                                                {student.address && (
                                                    <div className="back-card-row">
                                                        <span className="back-card-key">Address</span>
                                                        <span className="back-card-val">{student.address}</span>
                                                    </div>
                                                )}
                                                {student.pincode && (
                                                    <div className="back-card-row">
                                                        <span className="back-card-key">Pincode</span>
                                                        <span className="back-card-val">{student.pincode}</span>
                                                    </div>
                                                )}
                                                {student.city && (
                                                    <div className="back-card-row">
                                                        <span className="back-card-key">City</span>
                                                        <span className="back-card-val">{student.city}</span>
                                                    </div>
                                                )}
                                                {student.state && (
                                                    <div className="back-card-row">
                                                        <span className="back-card-key">State</span>
                                                        <span className="back-card-val">{student.state}</span>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="back-card-row">
                                                <span className="back-card-val" style={{ opacity: 0.7 }}>No address added</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {student.school && (
                                    <div className="back-section">
                                        <div className="back-section-title">Institution</div>
                                        <div className="back-card">
                                            <div className="back-card-title">{student.school.name}</div>
                                            <div className="back-card-row">
                                                <span className="back-card-key">REG</span>
                                                <span className="back-card-val">{student.school.code}</span>
                                            </div>
                                            <div className="back-card-row">
                                                <span className="back-card-key">Phone</span>
                                                <a className="back-card-val" href={`tel:${student.school.phone}`}>
                                                    {student.school.phone}
                                                </a>
                                            </div>
                                            <div className="back-card-row">
                                                <span className="back-card-key">Address</span>
                                                <span className="back-card-val">{student.school.address}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="student-back-lottie">
                                    <DotLottieReact
                                        src="https://lottie.host/6e4df017-4409-49fa-91e6-8eb728e17cdd/sx3ouclNqH.lottie"
                                        loop
                                        autoplay
                                        style={{ width: '100%', height: '220px' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Enlargement Modal - Instagram Style */}
            {imageModalOpen && (
                <div
                    className="image-modal"
                    onClick={() => setImageModalOpen(false)}
                >
                    <div className="modal-backdrop"></div>
                    <button
                        className="modal-close"
                        onClick={() => setImageModalOpen(false)}
                        aria-label="Close"
                    >
                        ✕
                    </button>
                    <img
                        src={fixImageUrl(student.photo) || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=667eea&color=fff&size=800`}
                        alt={student.name}
                        className="modal-image"
                    />
                </div>
            )}
        </div>
    );
};

export default StudentProfile;
