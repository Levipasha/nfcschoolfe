import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { schoolAPI, adminAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import StudentFormModal from '../components/StudentFormModal';
import BulkUploadModal from '../components/BulkUploadModal';
import SchoolFormModal from '../components/SchoolFormModal';
import './SchoolDetails.css';

const SchoolDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [school, setSchool] = useState(null);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showSchoolEditModal, setShowSchoolEditModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    useEffect(() => {
        if (id) {
            fetchSchoolData();
        }
    }, [id]);

    const fetchSchoolData = async () => {
        try {
            setLoading(true);
            const studentsRes = await schoolAPI.getSchoolStudents(id);

            if (studentsRes.data?.data) {
                setSchool(studentsRes.data.data.school);
                setStudents(Array.isArray(studentsRes.data.data.students) ? studentsRes.data.data.students : []);
            }
        } catch (error) {
            console.error('Error fetching school details:', error);
            if (error.response?.status === 404) {
                alert('School not found');
                navigate('/admin/dashboard');
            } else {
                alert('Failed to load school details');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudent = () => {
        setEditingStudent(null);
        setShowStudentModal(true);
    };

    const handleEditStudent = (student) => {
        setEditingStudent(student);
        setShowStudentModal(true);
    };

    const handleDeleteStudent = async (student) => {
        if (!window.confirm(`Are you sure you want to delete ${student.name}?`)) return;
        try {
            await adminAPI.deleteStudent(student.studentId);
            fetchSchoolData();
        } catch (error) {
            alert('Failed to delete student');
        }
    };

    const handleUpdateSchool = async (formData) => {
        try {
            await schoolAPI.updateSchool(school._id, formData);
            await fetchSchoolData();
            setShowSchoolEditModal(false);
        } catch (error) {
            alert('Failed to update school');
        }
    };

    const viewStudentProfile = (student) => {
        const url = `/student?id=${student.studentId}`;
        window.open(url, '_blank');
    };

    if (loading) return <LoadingSpinner message="Loading school details..." />;
    if (!school) return (
        <div className="error-state container">
            <h2>School not found</h2>
        </div>
    );

    return (
        <div className="school-details-page">
            <div className="page-header">
                <div className="header-container container">
                    <div className="school-header-content">
                        <div className="school-title-section">
                            <h1>{school.name}</h1>
                            <div className="school-info-grid">
                                <div className="info-item">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                    <span>{school.address || 'No address provided'}</span>
                                </div>
                                <div className="info-item phone-info-row">
                                    <div className="info-main">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.27-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                        <span>{school.phone || 'No phone provided'}</span>
                                    </div>
                                    <button
                                        className="edit-school-action-minimal"
                                        onClick={() => setShowSchoolEditModal(true)}
                                        title="Edit School Details"
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="actions-bar">
                <div className="container">
                    <div className="action-buttons">
                        <button onClick={handleAddStudent} className="btn-action-primary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            <span>Add Student</span>
                        </button>
                        <button onClick={() => setShowUploadModal(true)} className="btn-action-secondary">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <span>Bulk Upload</span>
                        </button>
                    </div>
                </div>
            </div>

            <div className="container main-content">
                <div className="students-grid-section">
                    <div className="section-title-row">
                        <h2>Students Directory</h2>
                        <span className="student-count-badge">
                            {Array.isArray(students) ? students.length : 0} Total
                        </span>
                    </div>

                    {(!students || students.length === 0) ? (
                        <div className="empty-students">
                            <div className="empty-icon">👥</div>
                            <p>No students added to this school yet.</p>
                        </div>
                    ) : (
                        <div className="students-grid-premium">
                            {Array.isArray(students) && students.map(student => (
                                <div key={student._id} className="student-card-premium">
                                    <div
                                        className="student-main-info"
                                        onClick={() => viewStudentProfile(student)}
                                        title="View Profile"
                                    >
                                        <h3 className="student-name-premium">{student.name}</h3>
                                        <div className="student-meta-compact">
                                            <span className="meta-item">
                                                <strong>Class</strong>
                                                <span className="highlight-value">{student.class}</span>
                                            </span>
                                            <span className="meta-separator">|</span>
                                            <span className="meta-item">
                                                <strong>Roll</strong>
                                                <span className="highlight-value">{student.rollNumber}</span>
                                            </span>
                                        </div>
                                    </div>
                                    <div className="student-card-actions">
                                        <button onClick={() => viewStudentProfile(student)} className="action-link" title="View Profile">
                                            View Profile →
                                        </button>
                                        <div className="btn-group-mini">
                                            <button onClick={() => handleEditStudent(student)} className="mini-icon-btn" title="Edit">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                            </button>
                                            <button onClick={() => handleDeleteStudent(student)} className="mini-icon-btn danger" title="Delete">
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showStudentModal && (
                <StudentFormModal
                    student={editingStudent}
                    onClose={(refresh) => {
                        setShowStudentModal(false);
                        if (refresh) fetchSchoolData();
                    }}
                    fixedSchool={{
                        id: school._id,
                        code: school.code,
                        name: school.name,
                        phone: school.phone,
                        address: school.address
                    }}
                />
            )}

            {showUploadModal && (
                <BulkUploadModal
                    onClose={() => setShowUploadModal(false)}
                    onSuccess={() => {
                        setShowUploadModal(false);
                        fetchSchoolData();
                    }}
                    fixedSchool={{ id: school._id, code: school.code }}
                />
            )}

            {showSchoolEditModal && (
                <SchoolFormModal
                    show={showSchoolEditModal}
                    onClose={() => setShowSchoolEditModal(false)}
                    onSubmit={handleUpdateSchool}
                    school={school}
                />
            )}
        </div>
    );
};

export default SchoolDetails;
