import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, schoolAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SchoolFormModal from '../components/SchoolFormModal';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [schools, setSchools] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, [statusFilter, searchTerm]);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);

            const [statsRes, studentsRes, schoolsRes] = await Promise.all([
                adminAPI.getStats(),
                adminAPI.getStudents({ status: statusFilter, search: searchTerm }),
                schoolAPI.getSchools({ search: searchTerm })
            ]);

            setStats(statsRes.data?.data || null);
            setStudents(Array.isArray(studentsRes.data?.data) ? studentsRes.data.data : []);
            setSchools(Array.isArray(schoolsRes.data?.data) ? schoolsRes.data.data : []);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);

            if (error.response?.status === 401) {
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/admin/login');
    };

    const handleCreateSchool = async (formData) => {
        try {
            if (editingSchool) {
                await schoolAPI.updateSchool(editingSchool._id, formData);
                alert('School updated successfully!');
            } else {
                await schoolAPI.createSchool(formData);
                alert('School created successfully!');
            }
            setShowSchoolModal(false);
            setEditingSchool(null);
            fetchDashboardData();
        } catch (error) {
            console.error('Error saving school:', error);
            alert(error.response?.data?.message || 'Error saving school');
        }
    };

    const handleEditSchool = (school) => {
        setEditingSchool(school);
        setShowSchoolModal(true);
    };

    const handleDeleteSchool = async (school) => {
        if (!window.confirm(`Are you sure you want to delete "${school.name}"? This will fail if the school has students.`)) {
            return;
        }

        try {
            await schoolAPI.deleteSchool(school._id);
            alert('School deleted successfully!');
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting school:', error);
            alert(error.response?.data?.message || 'Error deleting school');
        }
    };

    const handleToggleSchoolStatus = async (school) => {
        try {
            await schoolAPI.toggleSchoolStatus(school._id);
            fetchDashboardData();
        } catch (error) {
            console.error('Error toggling school status:', error);
            alert('Error updating school status');
        }
    };

    const handleViewStudents = (school) => {
        navigate(`/admin/schools/${school._id}`);
    };

    const handleDeleteStudent = async (student) => {
        if (!confirm(`Are you sure you want to delete ${student.name}?`)) {
            return;
        }

        try {
            await adminAPI.deleteStudent(student.studentId);
            fetchDashboardData();
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Failed to delete student');
        }
    };

    const handleToggleStatus = async (student) => {
        try {
            await adminAPI.toggleStudentStatus(student.studentId);
            fetchDashboardData();
        } catch (error) {
            console.error('Error toggling student status:', error);
            alert('Failed to toggle student status');
        }
    };

    const copyNFCUrl = (student) => {
        const url = `${window.location.origin}/student?id=${student.studentId}`;
        navigator.clipboard.writeText(url);
        alert('NFC URL copied to clipboard!');
    };

    const viewStudentProfile = (student) => {
        const url = `/student?id=${student.studentId}`;
        window.open(url, '_blank');
    };

    if (loading && !schools.length) {
        return <LoadingSpinner message="Loading dashboard..." />;
    }

    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="dashboard-title gradient-text">Admin Dashboard</h1>
                            <p className="dashboard-subtitle">NFC Student Management System</p>
                        </div>
                        <button onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            {stats && (
                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-card stat-primary">
                                <div className="stat-icon">👥</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats?.totalStudents || 0}</div>
                                    <div className="stat-label">Total Students</div>
                                </div>
                            </div>

                            <div className="stat-card stat-success">
                                <div className="stat-icon">✅</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats?.activeStudents || 0}</div>
                                    <div className="stat-label">Active Students</div>
                                </div>
                            </div>

                            <div className="stat-card stat-warning">
                                <div className="stat-icon">⏸️</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats?.inactiveStudents || 0}</div>
                                    <div className="stat-label">Inactive Students</div>
                                </div>
                            </div>

                            <div className="stat-card stat-info">
                                <div className="stat-icon">📊</div>
                                <div className="stat-content">
                                    <div className="stat-value">{stats?.totalScans || 0}</div>
                                    <div className="stat-label">Total Scans</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Schools Management */}
            <section className="students-section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Schools Management</h2>
                        <div className="section-actions">
                            <button
                                onClick={() => {
                                    setEditingSchool(null);
                                    setShowSchoolModal(true);
                                }}
                                className="btn btn-primary"
                                title="Create a new school"
                            >
                                🏫 Add School
                            </button>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="filters-bar">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search schools..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="search-input"
                            />
                        </div>
                    </div>

                    {/* Schools Grid */}
                    <div className="schools-grid-dashboard">
                        {Array.isArray(schools) && schools.filter(s => s.name?.toLowerCase() !== 'default school').map((school) => (
                            <div
                                key={school._id}
                                className={`school-card-dashboard ${!school.isActive ? 'inactive' : ''}`}
                                onClick={() => handleViewStudents(school)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="school-card-header">
                                    <div className="school-code-pill">{school.code}</div>
                                    <span className={`status-pill ${school.isActive ? 'active' : 'inactive'}`}>
                                        {school.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <div className="school-card-body">
                                    <h3 className="school-name-text">{school.name}</h3>
                                    <div className="school-stats-row">
                                        <div className="mini-stat">
                                            <span className="mini-stat-value">{school.studentCount || 0}</span>
                                            <span className="mini-stat-label">Students</span>
                                        </div>
                                        <div className="mini-stat">
                                            <span className="mini-stat-value">{school.code}</span>
                                            <span className="mini-stat-label">Code</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-click-hint">
                                    Click to manage students →
                                </div>
                            </div>
                        ))}

                        {(!schools || schools.length === 0) && (
                            <div className="empty-state">
                                <div className="empty-icon">🏫</div>
                                <h3>No schools found</h3>
                                <p>Create a school to get started</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <SchoolFormModal
                show={showSchoolModal}
                onClose={() => {
                    setShowSchoolModal(false);
                    setEditingSchool(null);
                }}
                onSubmit={handleCreateSchool}
                school={editingSchool}
            />
        </div>
    );
};

export default AdminDashboard;
