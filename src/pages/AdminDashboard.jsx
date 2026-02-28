import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI, schoolAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import SchoolFormModal from '../components/SchoolFormModal';
import PanelSwitcher from '../components/PanelSwitcher';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [students, setStudents] = useState([]);
    const [schools, setSchools] = useState([]);
    const [artists, setArtists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [artistSearch, setArtistSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeTab, setActiveTab] = useState('schools');
    const [showSchoolModal, setShowSchoolModal] = useState(false);
    const [editingSchool, setEditingSchool] = useState(null);
    useEffect(() => {
        fetchDashboardData();
    }, [statusFilter, searchTerm]);

    useEffect(() => {
        if (activeTab === 'artists') fetchArtists();
    }, [activeTab, artistSearch]);

    const fetchArtists = async () => {
        try {
            const res = await adminAPI.getArtists({ search: artistSearch });
            setArtists(Array.isArray(res.data?.data) ? res.data.data : []);
        } catch (e) {
            if (e.response?.status === 401) navigate('/admin/login');
            else setArtists([]);
        }
    };

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
                            <h1 className="dashboard-title">Admin Dashboard</h1>
                            <p className="dashboard-subtitle">NFC Student Management System</p>
                        </div>
                        <PanelSwitcher currentPanel="school" />
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            {stats && (
                <section className="stats-section">
                    <div className="container">
                        <div className="stats-grid">
                            <div className="stat-card stat-primary">
                                <div className="stat-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                </div>
                                <div className="stat-value">
                                    <span>{stats?.totalStudents ?? '0'}</span>
                                </div>
                                <div className="stat-label">Total Students</div>
                            </div>

                            <div className="stat-card stat-info">
                                <div className="stat-icon">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18"></path><path d="M3 7v14"></path><path d="M13 3v18"></path><path d="M17 7v14"></path><path d="M21 7v14"></path><path d="M13 7h8"></path><path d="M13 11h8"></path><path d="M13 15h8"></path><path d="M7 11H3"></path><path d="M7 15H3"></path><path d="M7 19H3"></path></svg>
                                </div>
                                <div className="stat-value">
                                    <span>{stats?.totalSchools ?? '0'}</span>
                                </div>
                                <div className="stat-label">Total Schools</div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* Tabs: Schools | Artists */}
            <section className="dashboard-tabs-section">
                <div className="container">
                    <div className="dashboard-tabs">
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'schools' ? 'active' : ''}`}
                            onClick={() => setActiveTab('schools')}
                        >
                            Schools
                        </button>
                        <button
                            type="button"
                            className={`tab-btn ${activeTab === 'artists' ? 'active' : ''}`}
                            onClick={() => setActiveTab('artists')}
                        >
                            Artists
                        </button>
                    </div>
                </div>
            </section>

            {/* Schools Management */}
            {activeTab === 'schools' && (
                <section className="students-section">
                    <div className="container">
                        <div className="section-header action-bar">
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
                            <div className="section-actions">
                                <button
                                    onClick={() => {
                                        setEditingSchool(null);
                                        setShowSchoolModal(true);
                                    }}
                                    className="btn btn-primary"
                                    title="Create a new school"
                                >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '8px' }}><path d="M3 21h18"></path><path d="M3 7v14"></path><path d="M13 3v18"></path><path d="M17 7v14"></path><path d="M21 7v14"></path><path d="M13 7h8"></path><path d="M13 11h8"></path><path d="M13 15h8"></path><path d="M7 11H3"></path><path d="M7 15H3"></path><path d="M7 19H3"></path></svg>
                                    Add School
                                </button>
                            </div>
                        </div>

                        <div className="schools-grid-dashboard">
                            {Array.isArray(schools) && schools.filter(s => s.name?.toLowerCase() !== 'default school').map((school) => (
                                <div
                                    key={school._id}
                                    className={`school-card-dashboard ${!school.isActive ? 'inactive' : ''}`}
                                    onClick={() => handleViewStudents(school)}
                                    style={{ cursor: 'pointer' }}
                                >
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
                                    <div className="card-footer">
                                        <span className="manage-link">Manage Students</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
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
            )}

            {/* Artists Management – update badges */}
            {activeTab === 'artists' && (
                <section className="students-section artists-section">
                    <div className="container">
                        <div className="section-header action-bar">
                            <div className="search-box">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search artists by name, ID, code, email..."
                                    value={artistSearch}
                                    onChange={(e) => setArtistSearch(e.target.value)}
                                    className="search-input"
                                />
                            </div>
                        </div>
                        <div className="schools-grid-dashboard artist-cards-grid">
                            {Array.isArray(artists) && artists.map((artist) => (
                                <div key={artist._id} className="school-card-dashboard artist-card-dashboard">
                                    <div className="school-card-body">
                                        <h3 className="school-name-text">{artist.name || 'Unnamed'}</h3>
                                        <div className="school-stats-row">
                                            <div className="mini-stat">
                                                <span className="mini-stat-value">{artist.artistId || artist.code || '—'}</span>
                                                <span className="mini-stat-label">ID</span>
                                            </div>
                                            <div className="mini-stat">
                                                <span className="mini-stat-value">{artist.scanCount ?? 0}</span>
                                                <span className="mini-stat-label">Scans</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(!artists || artists.length === 0) && activeTab === 'artists' && (
                                <div className="empty-state">
                                    <div className="empty-icon">🎨</div>
                                    <h3>No artists found</h3>
                                    <p>Artists will appear here when they are created.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}

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
