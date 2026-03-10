import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generalProfileAPI } from '../services/api';
import PanelSwitcher from '../components/PanelSwitcher';
import { fixImageUrl } from '../utils/imageHelper';
import { GENERAL_THEMES, AVAILABLE_FONTS } from '../constants/generalThemes';
import './GeneralProfileDashboard.css';

const SOCIAL_PLATFORMS = [
    { key: 'instagram', label: 'Instagram', placeholder: '@username or URL' },
    { key: 'twitter', label: 'Twitter / X', placeholder: '@username or URL' },
    { key: 'youtube', label: 'YouTube', placeholder: 'Channel URL' },
    { key: 'spotify', label: 'Spotify', placeholder: 'Profile URL' },
    { key: 'tiktok', label: 'TikTok', placeholder: '@username or URL' },
    { key: 'linkedin', label: 'LinkedIn', placeholder: 'Profile URL' },
    { key: 'pinterest', label: 'Pinterest', placeholder: 'Profile URL' }
];

const emptyForm = {
    username: '',
    name: '',
    title: '',
    bio: '',
    photo: '',
    theme: 'mint',
    font: 'outfit',
    bioFont: 'outfit',
    links: [],
    social: {}
};

const GeneralProfileDashboard = () => {
    const navigate = useNavigate();
    const [profiles, setProfiles] = useState([]);
    const [stats, setStats] = useState({ totalProfiles: 0 });
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [formData, setFormData] = useState({ ...emptyForm });
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [newLinkPlatform, setNewLinkPlatform] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchProfiles();
        fetchStats();
    }, []);

    const fetchProfiles = async (search = '') => {
        try {
            const response = await generalProfileAPI.getProfiles({ search });
            if (response.data.success) {
                setProfiles(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await generalProfileAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialChange = (key, value) => {
        setFormData({ ...formData, social: { ...formData.social, [key]: value } });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const addLink = () => {
        if (!newLinkUrl.trim()) return;
        const newLink = {
            title: newLinkTitle || 'Untitled',
            url: newLinkUrl,
            platform: newLinkPlatform || 'website',
            order: formData.links.length
        };
        setFormData({ ...formData, links: [...formData.links, newLink] });
        setNewLinkTitle('');
        setNewLinkUrl('');
        setNewLinkPlatform('');
    };

    const removeLink = (index) => {
        setFormData({
            ...formData,
            links: formData.links.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let finalPhoto = formData.photo;

            if (photoFile) {
                setUploadingPhoto(true);
                const uploadRes = await generalProfileAPI.uploadPhoto(photoFile);
                if (uploadRes.data.success) {
                    finalPhoto = uploadRes.data.url;
                }
                setUploadingPhoto(false);
            }

            const submissionData = { ...formData, photo: finalPhoto };

            const response = editingProfile
                ? await generalProfileAPI.updateProfile(editingProfile._id, submissionData)
                : await generalProfileAPI.createProfile(submissionData);

            if (response.data.success) {
                alert(editingProfile ? 'Profile updated successfully!' : 'Profile created successfully!');
                setShowAddModal(false);
                setEditingProfile(null);
                resetForm();
                fetchProfiles();
                fetchStats();
            } else {
                alert(response.data.message || 'Error saving profile');
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert(error.response?.data?.message || 'Error saving profile');
        } finally {
            setUploadingPhoto(false);
        }
    };

    const handleEdit = (profile) => {
        setEditingProfile(profile);
        setFormData({
            username: profile.username || '',
            name: profile.name || '',
            title: profile.title || '',
            bio: profile.bio || '',
            photo: profile.photo || '',
            theme: profile.theme || 'mint',
            font: profile.font || 'outfit',
            bioFont: profile.bioFont || 'outfit',
            links: Array.isArray(profile.links) ? profile.links : [],
            social: profile.social || {}
        });
        setPhotoFile(null);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this profile?')) return;

        try {
            const response = await generalProfileAPI.deleteProfile(id);
            if (response.data.success) {
                alert('Profile deleted successfully!');
                fetchProfiles();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting profile:', error);
            alert('Error deleting profile');
        }
    };

    const resetForm = () => {
        setFormData({ ...emptyForm });
        setPhotoFile(null);
        setNewLinkTitle('');
        setNewLinkUrl('');
        setNewLinkPlatform('');
    };

    const handleSearch = (e) => {
        const q = e.target.value;
        setSearchQuery(q);
        fetchProfiles(q);
    };

    const getThemePreview = (themeId) => {
        const t = GENERAL_THEMES.find(th => th.id === themeId);
        return t ? { background: t.bg, color: t.text } : {};
    };

    if (loading && profiles.length === 0) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="general-dashboard">
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="dashboard-title">General Profiles</h1>
                            <p className="dashboard-subtitle">Link-in-Bio Management Hub</p>
                        </div>
                        <PanelSwitcher currentPanel="general" />
                    </div>
                </div>
            </header>

            <div className="dashboard-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👤</div>
                        <div className="stat-info">
                            <h3>Total Profiles</h3>
                            <p className="stat-number">{stats.totalProfiles}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">🎨</div>
                        <div className="stat-info">
                            <h3>Themes Available</h3>
                            <p className="stat-number">{GENERAL_THEMES.length}</p>
                        </div>
                    </div>
                </div>

                <div className="actions-bar">
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingProfile(null);
                            setShowAddModal(true);
                        }}
                        className="add-btn"
                    >
                        + Create New Profile
                    </button>
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Search profiles..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                </div>

                <div className="profiles-grid">
                    {profiles.map(profile => (
                        <div key={profile._id} className="profile-card">
                            <div className="profile-card-header" style={getThemePreview(profile.theme)}>
                                <div className="profile-photo">
                                    {profile.photo ? (
                                        <img src={fixImageUrl(profile.photo)} alt={profile.name} />
                                    ) : (
                                        <div className="photo-placeholder">
                                            {(profile.name || profile.username || '?')[0].toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="profile-info">
                                <h3>{profile.name || 'Unnamed'}</h3>
                                <p className="profile-username">@{profile.username}</p>
                                {profile.title && <p className="profile-title">{profile.title}</p>}
                                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                                <div className="profile-meta">
                                    <span className="meta-badge">{profile.theme || 'mint'}</span>
                                    <span className="meta-badge">{(profile.links || []).length} links</span>
                                </div>
                                <div className="profile-url-copy">
                                    <button
                                        className="copy-url-btn"
                                        onClick={() => {
                                            const landingUrl = import.meta.env.VITE_LANDING_URL || 'https://www.skywebdev.xyz';
                                            const url = `${landingUrl}/link/${profile.username}`;
                                            navigator.clipboard.writeText(url);
                                            alert('Profile URL copied to clipboard!');
                                        }}
                                    >
                                        🔗 Copy Profile URL
                                    </button>
                                </div>
                                <div className="profile-actions">
                                    <button onClick={() => handleEdit(profile)} className="edit-btn">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDelete(profile._id)} className="delete-btn">
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {profiles.length === 0 && !loading && (
                        <div className="empty-state">
                            <p>No general profiles found. Create one to get started!</p>
                        </div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="gp-modal-overlay" onClick={() => {
                    setShowAddModal(false);
                    setEditingProfile(null);
                    resetForm();
                }}>
                    <div className="gp-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingProfile ? 'Edit Profile' : 'Create New Profile'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Username *</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="e.g. john_doe"
                                    disabled={!!editingProfile}
                                />
                                {!editingProfile && (
                                    <span className="field-hint">Only lowercase letters, numbers, underscores, hyphens</span>
                                )}
                            </div>

                            <div className="form-group">
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="Full name"
                                />
                            </div>

                            <div className="form-group">
                                <label>Title / Tagline</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    placeholder="e.g. Company Owner, Digital Creator"
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Short bio or description..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Profile Theme</label>
                                <div className="theme-choices-row">
                                    {GENERAL_THEMES.map((theme) => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            className={`theme-pill ${formData.theme === theme.id ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, theme: theme.id }))}
                                            style={{ background: theme.bg, color: theme.text, border: formData.theme === theme.id ? '2px solid #000' : '2px solid transparent' }}
                                        >
                                            <span className="theme-pill-label">{theme.label}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Name Font</label>
                                    <select
                                        name="font"
                                        value={formData.font}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        {AVAILABLE_FONTS.map(f => (
                                            <option key={f.id} value={f.id}>{f.label} — {f.desc}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Bio Font</label>
                                    <select
                                        name="bioFont"
                                        value={formData.bioFont}
                                        onChange={handleInputChange}
                                        className="form-select"
                                    >
                                        {AVAILABLE_FONTS.map(f => (
                                            <option key={f.id} value={f.id}>{f.label} — {f.desc}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Profile Photo</label>
                                <div className="file-input-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="file-input-field"
                                    />
                                    {(photoFile || formData.photo) && (
                                        <div className="photo-preview-mini">
                                            <span>Current: {photoFile ? photoFile.name : 'Existing Photo'}</span>
                                        </div>
                                    )}
                                    {uploadingPhoto && <div className="loading-small">Uploading...</div>}
                                </div>
                            </div>

                            <div className="form-group links-section">
                                <label>Links</label>
                                <p className="field-hint">Add custom links (website, portfolio, etc.)</p>
                                <div className="links-list">
                                    {formData.links.map((link, idx) => (
                                        <div key={idx} className="link-item">
                                            <div className="link-item-info">
                                                <strong>{link.title || 'Untitled'}</strong>
                                                <span className="link-item-url">{link.url}</span>
                                                {link.platform && <span className="link-item-platform">{link.platform}</span>}
                                            </div>
                                            <button type="button" onClick={() => removeLink(idx)} className="link-remove-btn">×</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="link-add-form">
                                    <input
                                        type="text"
                                        placeholder="Link title"
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                    />
                                    <input
                                        type="url"
                                        placeholder="https://..."
                                        value={newLinkUrl}
                                        onChange={(e) => setNewLinkUrl(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Platform (optional)"
                                        value={newLinkPlatform}
                                        onChange={(e) => setNewLinkPlatform(e.target.value)}
                                    />
                                    <button type="button" onClick={addLink} disabled={!newLinkUrl.trim()} className="link-add-btn">
                                        + Add Link
                                    </button>
                                </div>
                            </div>

                            <div className="form-group social-section">
                                <label>Social Media</label>
                                <div className="social-grid">
                                    {SOCIAL_PLATFORMS.map(sp => (
                                        <div key={sp.key} className="social-input-row">
                                            <span className="social-label">{sp.label}</span>
                                            <input
                                                type="text"
                                                value={formData.social[sp.key] || ''}
                                                onChange={(e) => handleSocialChange(sp.key, e.target.value)}
                                                placeholder={sp.placeholder}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="submit-btn">
                                    {editingProfile ? 'Update Profile' : 'Create Profile'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingProfile(null);
                                        resetForm();
                                    }}
                                    className="cancel-btn"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneralProfileDashboard;
