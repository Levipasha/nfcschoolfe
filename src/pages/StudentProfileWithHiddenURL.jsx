import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import sessionService from '../services/session';
import { fixImageUrl } from '../utils/imageHelper';
import './StudentProfile.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function StudentProfile() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const studentId = searchParams.get('id');

        if (!studentId) {
            setError('No student ID provided');
            setLoading(false);
            return;
        }

        // IMMEDIATELY hide the URL with student ID
        // Replace /student?id=NS1-01 with /profile
        window.history.replaceState({}, '', '/profile');

        // Fetch student data
        const fetchStudent = async () => {
            try {
                const response = await axios.get(`${API_URL}/student/${studentId}`);

                setStudent(response.data.data);
                setLoading(false);

                // Start session tracking
                if (response.data.sessionId) {
                    sessionService.startSession(response.data.sessionId);
                }
            } catch (err) {
                console.error('Error fetching student:', err);
                setError(err.response?.data?.message || 'Failed to load student profile');
                setLoading(false);
            }
        };

        fetchStudent();

        // Cleanup session on unmount
        return () => {
            sessionService.endSession();
        };
    }, [searchParams]);

    // Handle phone calls with tracking
    const handleCall = (phoneNumber) => {
        if (!phoneNumber) return;
        sessionService.trackCall(phoneNumber);
        window.location.href = `tel:${phoneNumber}`;
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>Error</h2>
                <p>{error}</p>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="error-container">
                <h2>Student Not Found</h2>
                <p>The student profile could not be found.</p>
            </div>
        );
    }

    return (
        <div className="student-profile-container">
            <div className="profile-card">
                {/* Profile Header with Photo */}
                <div className="profile-header">
                    <div className="photo-container">
                        <img
                            src={fixImageUrl(student.photo)}
                            alt={student.name}
                            className="profile-photo"
                        />
                    </div>
                    <h1 className="student-name">{student.name}</h1>
                    <p className="student-class">{student.class}</p>
                </div>

                {/* Student Details */}
                <div className="profile-details">
                    <div className="detail-item">
                        <span className="detail-label">Roll Number</span>
                        <span className="detail-value">{student.rollNumber}</span>
                    </div>

                    {student.bloodGroup && (
                        <div className="detail-item">
                            <span className="detail-label">Blood Group</span>
                            <span className="detail-value">{student.bloodGroup}</span>
                        </div>
                    )}

                    {student.address && (
                        <div className="detail-item">
                            <span className="detail-label">Address</span>
                            <span className="detail-value">{student.address}</span>
                        </div>
                    )}
                </div>

                {/* Parent Contact Information */}
                {(student.fatherName || student.motherName) && (
                    <div className="parent-section">
                        <h2 className="section-title">Parent Information</h2>

                        {student.fatherName && (
                            <div className="parent-card">
                                <div className="parent-info">
                                    <span className="parent-label">Father's Name</span>
                                    <span className="parent-name">{student.fatherName}</span>
                                </div>
                                {student.fatherPhone && (
                                    <button
                                        className="call-button"
                                        onClick={() => handleCall(student.fatherPhone)}
                                    >
                                        📞 Call
                                    </button>
                                )}
                            </div>
                        )}

                        {student.motherName && (
                            <div className="parent-card">
                                <div className="parent-info">
                                    <span className="parent-label">Mother's Name</span>
                                    <span className="parent-name">{student.motherName}</span>
                                </div>
                                {student.motherPhone && (
                                    <button
                                        className="call-button"
                                        onClick={() => handleCall(student.motherPhone)}
                                    >
                                        📞 Call
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* School Information */}
                {student.school && (
                    <div className="school-section">
                        <h2 className="section-title">School Information</h2>
                        <div className="school-details">
                            <p className="school-name">{student.school.name}</p>
                            {student.school.address && (
                                <p className="school-address">{student.school.address}</p>
                            )}
                            {student.school.phone && (
                                <button
                                    className="call-button school-call"
                                    onClick={() => handleCall(student.school.phone)}
                                >
                                    📞 Call School
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="profile-footer">
                    <p className="scan-count">Profile viewed {student.scanCount} times</p>
                </div>
            </div>
        </div>
    );
}

export default StudentProfile;
