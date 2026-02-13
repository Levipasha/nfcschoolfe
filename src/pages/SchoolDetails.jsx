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
            <button onClick={() => navigate('/admin/dashboard')} className="btn btn-primary">
                Back to Dashboard
            </button>
        </div>
    );

    return (
        <div className="school-details-page">
            <div className="page-header">
                <div className="header-container container">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-link">
                        ← Back to Dashboard
                    </button>
                    <div
                        className="school-title-section"
                        onClick={() => setShowSchoolEditModal(true)}
                        style={{ cursor: 'pointer' }}
                        title="Click to edit school details"
                    >
                        <h1>
                            {school.name} <span className="code-tag">{school.code}</span>
                            <span className="edit-hint">✏️</span>
                        </h1>
                        <p className="school-info">
                            📍 {school.address || 'No address'} | 📞 {school.phone || 'No phone'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="actions-bar">
                <div className="container">
                    <div className="action-buttons">
                        <button onClick={handleAddStudent} className="btn btn-primary">
                            ➕ Add Student
                        </button>
                        <button onClick={() => setShowUploadModal(true)} className="btn btn-secondary">
                            📤 Bulk Upload
                        </button>
                    </div>
                    <div className="school-stats-mini">
                        <strong>Total Students:</strong> {Array.isArray(students) ? students.length : 0}
                    </div>
                </div>
            </div>

            <div className="container main-content">
                <div className="students-list-section">
                    <h2>Students List</h2>
                    {(!students || students.length === 0) ? (
                        <div className="empty-students">
                            <p>No students added to this school yet.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="students-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Name</th>
                                        <th>Class</th>
                                        <th>Roll No</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(students) && students.map(student => (
                                        <tr key={student._id}>
                                            <td
                                                onClick={() => viewStudentProfile(student)}
                                                style={{ cursor: 'pointer' }}
                                                className="clickable-cell"
                                                title="View Student Profile"
                                            >
                                                <code>{student.studentId}</code>
                                            </td>
                                            <td
                                                onClick={() => viewStudentProfile(student)}
                                                style={{ cursor: 'pointer', fontWeight: '500' }}
                                                className="clickable-cell"
                                                title="View Student Profile"
                                            >
                                                {student.name}
                                            </td>
                                            <td>{student.class}</td>
                                            <td>{student.rollNumber}</td>
                                            <td className="table-actions">
                                                <button onClick={() => viewStudentProfile(student)} className="icon-btn" title="View Profile">👁️</button>
                                                <button onClick={() => handleEditStudent(student)} className="icon-btn" title="Edit">✏️</button>
                                                <button onClick={() => handleDeleteStudent(student)} className="icon-btn danger" title="Delete">🗑️</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
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
                    fixedSchool={{ id: school._id, code: school.code }}
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
