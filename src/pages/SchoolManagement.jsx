import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { schoolAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SchoolFormModal from '../components/SchoolFormModal';
import './SchoolManagement.css';

const SchoolManagement = () => {
    const navigate = useNavigate();
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchSchools();
    }, [searchTerm]);

    const fetchSchools = async () => {
        try {
            setLoading(true);
            const response = await schoolAPI.getSchools({ search: searchTerm });
            setSchools(response.data.data);
        } catch (error) {
            console.error('Error fetching schools:', error);
            alert('Error loading schools');
        } finally {
            setLoading(false);
        }
    };

    const handleAddSchool = () => {
        setEditingSchool(null);
        setShowModal(true);
    };

    const handleEditSchool = (school) => {
        setEditingSchool(school);
        setShowModal(true);
    };

    const handleSubmitSchool = async (formData) => {
        try {
            if (editingSchool) {
                await schoolAPI.updateSchool(editingSchool._id, formData);
                alert('School updated successfully!');
            } else {
                await schoolAPI.createSchool(formData);
                alert('School created successfully!');
            }
            setShowModal(false);
            setEditingSchool(null);
            fetchSchools();
        } catch (error) {
            console.error('Error saving school:', error);
            alert(error.response?.data?.message || 'Error saving school');
        }
    };

    const handleDeleteSchool = async (school) => {
        if (!window.confirm(`Are you sure you want to delete "${school.name}"? This will fail if the school has students.`)) {
            return;
        }

        try {
            await schoolAPI.deleteSchool(school._id);
            alert('School deleted successfully!');
            fetchSchools();
        } catch (error) {
            console.error('Error deleting school:', error);
            alert(error.response?.data?.message || 'Error deleting school');
        }
    };

    const handleToggleStatus = async (school) => {
        try {
            await schoolAPI.toggleSchoolStatus(school._id);
            fetchSchools();
        } catch (error) {
            console.error('Error toggling school status:', error);
            alert('Error updating school status');
        }
    };

    const handleViewStudents = (school) => {
        navigate(`/admin/schools/${school._id}`);
    };

    if (loading && schools.length === 0) {
        return <LoadingSpinner message="Loading schools..." />;
    }

    return (
        <div className="school-management">
            <div className="page-header">
                <div className="header-content">
                    <button onClick={() => navigate('/admin/dashboard')} className="back-button">
                        ← Back to Dashboard
                    </button>
                    <h1>🏫 School Management</h1>
                    <p className="page-subtitle">Manage schools and generate auto-coded student IDs</p>
                </div>
            </div>

            <div className="container">
                <div className="section-header">
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Search schools..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {schools.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">🏫</div>
                        <h3>No Schools Found</h3>
                        <p>Total schools registered: {schools.length}</p>
                    </div>
                ) : (
                    <div className="schools-grid">
                        {schools.filter(s => s.name?.toLowerCase() !== 'default school').map((school) => (
                            <div key={school._id} className={`school-card ${!school.isActive ? 'inactive' : ''}`}>
                                <div className="school-header">
                                    <div className="school-code-badge">{school.code}</div>
                                    <div className="school-status">
                                        {school.isActive ? (
                                            <span className="status-badge active">Active</span>
                                        ) : (
                                            <span className="status-badge inactive">Inactive</span>
                                        )}
                                    </div>
                                </div>

                                <div className="school-body" onClick={() => handleEditSchool(school)} style={{ cursor: 'pointer' }}>
                                    <h3 className="school-name">{school.name}</h3>

                                    <div className="school-stats">
                                        <div className="stat">
                                            <div className="stat-value">{school.studentCount || 0}</div>
                                            <div className="stat-label">Students</div>
                                        </div>
                                        <div className="stat">
                                            <div className="stat-value">{school.code}</div>
                                            <div className="stat-label">School Code</div>
                                        </div>
                                    </div>

                                    <div className="id-format-info">
                                        <strong>Student IDs:</strong> {school.code}-01, {school.code}-02, ...
                                    </div>
                                </div>

                                <div className="school-footer">
                                    <button
                                        onClick={() => handleViewStudents(school)}
                                        className="btn-icon"
                                        title="View Students"
                                    >
                                        👥
                                    </button>
                                    <button
                                        onClick={() => handleEditSchool(school)}
                                        className="btn-icon"
                                        title="Edit"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleToggleStatus(school)}
                                        className="btn-icon"
                                        title={school.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {school.isActive ? '🔒' : '⚡'}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteSchool(school)}
                                        className="btn-icon btn-icon-danger"
                                        title="Delete"
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <SchoolFormModal
                show={showModal}
                onClose={() => {
                    setShowModal(false);
                    setEditingSchool(null);
                }}
                onSubmit={handleSubmitSchool}
                school={editingSchool}
            />
        </div >
    );
};

export default SchoolManagement;
