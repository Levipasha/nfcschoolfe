import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { artistAPI } from '../services/api';
import PanelSwitcher from '../components/PanelSwitcher';
import { fixImageUrl } from '../utils/imageHelper';
import './ArtistDashboard.css';

const ArtistDashboard = () => {
    const navigate = useNavigate();
    const [artists, setArtists] = useState([]);
    const [stats, setStats] = useState({ totalArtists: 0, totalScans: 0 });
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingArtist, setEditingArtist] = useState(null);
    const [photoFile, setPhotoFile] = useState(null);
    const [bgPhotoFile, setBgPhotoFile] = useState(null);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        bio: '',
        photo: '',
        phone: '',
        email: '',
        website: '',
        instagram: '',
        facebook: '',
        twitter: '',
        specialization: '',
        backgroundPhoto: '',
        gallery: [],
        profileTheme: 'mono'
    });
    const [galleryUploads, setGalleryUploads] = useState([]); // { file: File, name: string }[]
    const [newGalleryName, setNewGalleryName] = useState('');
    const [newGalleryFile, setNewGalleryFile] = useState(null);
    const [uploadingGallery, setUploadingGallery] = useState(false);

    useEffect(() => {
        fetchArtists();
        fetchStats();
    }, []);

    const fetchArtists = async () => {
        try {
            const response = await artistAPI.getArtists();
            if (response.data.success) {
                setArtists(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching artists:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await artistAPI.getStats();
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handlePhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setPhotoFile(e.target.files[0]);
        }
    };

    const handleBgPhotoChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setBgPhotoFile(e.target.files[0]);
        }
    };

    const handleNewGalleryFile = (e) => {
        if (e.target.files && e.target.files[0]) setNewGalleryFile(e.target.files[0]);
    };
    const addGalleryItem = () => {
        if (!newGalleryFile) return;
        setGalleryUploads((prev) => [...prev, { file: newGalleryFile, name: newGalleryName || 'Untitled' }]);
        setNewGalleryFile(null);
        setNewGalleryName('');
    };
    const removeGalleryUpload = (index) => {
        setGalleryUploads((prev) => prev.filter((_, i) => i !== index));
    };
    const removeGalleryExisting = (index) => {
        setFormData((prev) => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            let finalPhoto = formData.photo;
            let finalBg = formData.backgroundPhoto;

            if (photoFile) {
                setUploadingPhoto(true);
                const uploadRes = await artistAPI.uploadPhoto(photoFile);
                if (uploadRes.data.success) {
                    finalPhoto = uploadRes.data.url;
                }
                setUploadingPhoto(false);
            }

            if (bgPhotoFile) {
                setUploadingBg(true);
                const uploadRes = await artistAPI.uploadPhoto(bgPhotoFile);
                if (uploadRes.data.success) {
                    finalBg = uploadRes.data.url;
                }
                setUploadingBg(false);
            }

            let finalGallery = Array.isArray(formData.gallery) ? [...formData.gallery] : [];
            if (galleryUploads.length > 0) {
                setUploadingGallery(true);
                for (const item of galleryUploads) {
                    const uploadRes = await artistAPI.uploadPhoto(item.file);
                    if (uploadRes.data.success) {
                        finalGallery.push({ url: uploadRes.data.url, name: item.name || 'Untitled' });
                    }
                }
                setUploadingGallery(false);
            }
            // Normalize for API: ensure { url, name }
            finalGallery = finalGallery.map((item) =>
                typeof item === 'string' ? { url: item, name: 'Untitled' } : { url: item.url || item, name: item.name || 'Untitled' }
            );

            const submissionData = {
                ...formData,
                photo: finalPhoto,
                backgroundPhoto: finalBg,
                gallery: finalGallery
            };

            const response = editingArtist
                ? await artistAPI.updateArtist(editingArtist._id, submissionData)
                : await artistAPI.createArtist(submissionData);

            if (response.data.success) {
                alert(editingArtist ? 'Artist updated successfully!' : 'Artist added successfully!');
                setShowAddModal(false);
                setEditingArtist(null);
                resetForm();
                fetchArtists();
                fetchStats();
            } else {
                alert(response.data.message || 'Error saving artist');
            }
        } catch (error) {
            console.error('Error saving artist:', error);
            alert(error.response?.data?.message || 'Error saving artist');
        } finally {
            setUploadingPhoto(false);
            setUploadingBg(false);
            setUploadingGallery(false);
        }
    };

    const handleEdit = (artist) => {
        setEditingArtist(artist);
        const gallery = artist.gallery && Array.isArray(artist.gallery)
            ? artist.gallery.map((item) => typeof item === 'string' ? { url: item, name: 'Untitled' } : { url: item.url || item, name: item.name || 'Untitled' })
            : [];
        setFormData({
            name: artist.name,
            bio: artist.bio || '',
            photo: artist.photo || '',
            phone: artist.phone || '',
            email: artist.email || '',
            website: artist.website || '',
            instagram: artist.instagram || '',
            facebook: artist.facebook || '',
            twitter: artist.twitter || '',
            specialization: artist.specialization || '',
            backgroundPhoto: artist.backgroundPhoto || '',
            gallery,
            profileTheme: artist.profileTheme || 'mono'
        });
        setPhotoFile(null);
        setBgPhotoFile(null);
        setGalleryUploads([]);
        setNewGalleryName('');
        setNewGalleryFile(null);
        setShowAddModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this artist?')) return;

        try {
            const response = await artistAPI.deleteArtist(id);
            if (response.data.success) {
                alert('Artist deleted successfully!');
                fetchArtists();
                fetchStats();
            }
        } catch (error) {
            console.error('Error deleting artist:', error);
            alert('Error deleting artist');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            bio: '',
            photo: '',
            phone: '',
            email: '',
            website: '',
            instagram: '',
            facebook: '',
            twitter: '',
            specialization: '',
            backgroundPhoto: '',
            gallery: [],
            profileTheme: 'mono'
        });
        setPhotoFile(null);
        setBgPhotoFile(null);
        setGalleryUploads([]);
        setNewGalleryName('');
        setNewGalleryFile(null);
    };

    const handleQuickCreate = async () => {
        try {
            setLoading(true);
            const response = await artistAPI.quickCreateArtist();
            if (response.data.success) {
                const artist = response.data.data;
                const baseUrl = window.location.origin;
                const url = `${baseUrl}/artist?id=${artist.artistId}`;

                // Copy to clipboard
                await navigator.clipboard.writeText(url);
                setArtists(prev => [artist, ...prev]);

                alert(`Success! Artist profile container created.\n\nURL copied to clipboard:\n${url}\n\nYou can now write this to the NFC tag.`);
            }
        } catch (error) {
            console.error('Error in quick create:', error);
            alert('Failed to create quick artist profile');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const { auth } = await import('../firebase');
            await auth.signOut();
        } catch (error) {
            console.error("Error signing out:", error);
        }
        navigate('/artist/login');
    };

    if (loading && artists.length === 0) {
        return <div className="loading">Loading...</div>;
    }

    return (
        <div className="artist-dashboard">
            <header className="dashboard-header">
                <div className="container">
                    <div className="header-content">
                        <div className="header-left">
                            <h1 className="dashboard-title">Artist Panel</h1>
                            <p className="dashboard-subtitle">Creative Professionals Hub</p>
                        </div>
                        <PanelSwitcher currentPanel="artist" />
                    </div>
                </div>
            </header>

            <div className="dashboard-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👨‍🎨</div>
                        <div className="stat-info">
                            <h3>Total Artists</h3>
                            <p className="stat-number">{stats.totalArtists}</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📊</div>
                        <div className="stat-info">
                            <h3>Total Profile Scans</h3>
                            <p className="stat-number">{stats.totalScans}</p>
                        </div>
                    </div>
                </div>

                <div className="actions-bar">
                    <button
                        onClick={handleQuickCreate}
                        className="add-btn"
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : '+ Create Artist URL (Quick)'}
                    </button>
                    <button
                        onClick={() => {
                            resetForm();
                            setEditingArtist(null);
                            setShowAddModal(true);
                        }}
                        className="add-btn secondary-btn"
                    >
                        + Add Full Details
                    </button>
                </div>

                <div className="artists-grid">
                    {artists.map(artist => (
                        <div key={artist._id} className={`artist-card ${!artist.isSetup ? 'uninitialized' : ''}`}>
                            <div className="artist-photo">
                                <img src={fixImageUrl(artist.photo)} alt={artist.name} />
                                {!artist.isSetup && <div className="setup-badge">Pending Setup</div>}
                            </div>
                            <div className="artist-info">
                                <h3>{artist.name}</h3>
                                <p className="artist-code">Code: {artist.code}</p>
                                <p className="artist-specialization">{artist.specialization || (artist.isSetup ? 'Artist' : 'Waiting for artist to setup...')}</p>
                                {artist.isSetup && <p className="artist-bio">{artist.bio}</p>}
                                <div className="artist-url-copy">
                                    <button
                                        className="copy-url-btn"
                                        onClick={() => {
                                            const url = `${window.location.origin}/artist?id=${artist.artistId}`;
                                            navigator.clipboard.writeText(url);
                                            alert('NFC URL copied to clipboard!');
                                        }}
                                    >
                                        🔗 Copy NFC URL
                                    </button>
                                </div>
                                <div className="artist-stats">
                                    <span>📊 {artist.scanCount} scans</span>
                                </div>
                                <div className="artist-actions">
                                    <button onClick={() => handleEdit(artist)} className="edit-btn">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDelete(artist._id)} className="delete-btn">
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {showAddModal && (
                <div className="artist-modal-overlay" onClick={() => {
                    setShowAddModal(false);
                    setEditingArtist(null);
                    resetForm();
                }}>
                    <div className="artist-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingArtist ? 'Edit Artist' : 'Add New Artist'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Name *</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Specialization</label>
                                <input
                                    type="text"
                                    name="specialization"
                                    value={formData.specialization}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Painter, Sculptor, Digital Artist"
                                />
                            </div>

                            <div className="form-group">
                                <label>Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleInputChange}
                                    rows="4"
                                    placeholder="Tell us about the artist..."
                                />
                            </div>

                            <div className="form-group">
                                <label>Profile Theme</label>
                                <div className="theme-choices-row">
                                    {[
                                        { id: 'mono', label: 'Mono Dark' },
                                        { id: 'classic', label: 'Classic Light' },
                                        { id: 'neon', label: 'Neon Glow' },
                                        { id: 'art', label: 'Art Red/Black' }
                                    ].map((theme) => (
                                        <button
                                            key={theme.id}
                                            type="button"
                                            className={`theme-pill ${formData.profileTheme === theme.id ? 'selected' : ''}`}
                                            onClick={() => setFormData(prev => ({ ...prev, profileTheme: theme.id }))}
                                        >
                                            <span className="theme-pill-label">{theme.label}</span>
                                        </button>
                                    ))}
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

                            <div className="form-group">
                                <label>Background Image</label>
                                <div className="file-input-container">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBgPhotoChange}
                                        className="file-input-field"
                                    />
                                    {(bgPhotoFile || formData.backgroundPhoto) && (
                                        <div className="photo-preview-mini">
                                            <span>Current: {bgPhotoFile ? bgPhotoFile.name : 'Existing Background'}</span>
                                        </div>
                                    )}
                                    {uploadingBg && <div className="loading-small">Uploading...</div>}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Website</label>
                                <input
                                    type="url"
                                    name="website"
                                    value={formData.website}
                                    onChange={handleInputChange}
                                    placeholder="https://yourwebsite.com"
                                />
                            </div>

                            <div className="form-group">
                                <label>Instagram</label>
                                <input
                                    type="text"
                                    name="instagram"
                                    value={formData.instagram}
                                    onChange={handleInputChange}
                                    placeholder="@username or URL"
                                />
                            </div>

                            <div className="form-group">
                                <label>Facebook</label>
                                <input
                                    type="text"
                                    name="facebook"
                                    value={formData.facebook}
                                    onChange={handleInputChange}
                                    placeholder="Profile URL"
                                />
                            </div>

                            <div className="form-group">
                                <label>Twitter</label>
                                <input
                                    type="text"
                                    name="twitter"
                                    value={formData.twitter}
                                    onChange={handleInputChange}
                                    placeholder="@username or URL"
                                />
                            </div>

                            <div className="form-group gallery-admin-section">
                                <label>Events / Gallery</label>
                                <p className="field-hint">Images shown in the profile EVENTS slideshow. Add title (optional) and image.</p>
                                <div className="gallery-admin-list">
                                    {formData.gallery.map((item, idx) => (
                                        <div key={`g-${idx}`} className="gallery-admin-item">
                                            <img src={fixImageUrl(typeof item === 'string' ? item : item.url)} alt="" />
                                            <span className="gallery-admin-item-name">{typeof item === 'string' ? 'Untitled' : (item.name || 'Untitled')}</span>
                                            <button type="button" onClick={() => removeGalleryExisting(idx)} className="gallery-admin-remove" aria-label="Remove">×</button>
                                        </div>
                                    ))}
                                    {galleryUploads.map((item, idx) => (
                                        <div key={`n-${idx}`} className="gallery-admin-item pending">
                                            <div className="gallery-admin-pending">New</div>
                                            <span className="gallery-admin-item-name">{item.name || 'Untitled'}</span>
                                            <button type="button" onClick={() => removeGalleryUpload(idx)} className="gallery-admin-remove" aria-label="Remove">×</button>
                                        </div>
                                    ))}
                                </div>
                                <div className="gallery-admin-add">
                                    <input
                                        type="text"
                                        placeholder="Event / work title (optional)"
                                        value={newGalleryName}
                                        onChange={(e) => setNewGalleryName(e.target.value)}
                                        className="gallery-admin-name-input"
                                    />
                                    <div className="gallery-admin-file-row">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleNewGalleryFile}
                                            className="file-input-field"
                                            id="admin-gallery-file"
                                        />
                                        <label htmlFor="admin-gallery-file" className="gallery-admin-file-label">Choose image</label>
                                        <button type="button" onClick={addGalleryItem} disabled={!newGalleryFile} className="gallery-admin-add-btn">
                                            + Add to gallery
                                        </button>
                                    </div>
                                </div>
                                {uploadingGallery && <div className="loading-small">Uploading gallery...</div>}
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="submit-btn">
                                    {editingArtist ? 'Update Artist' : 'Add Artist'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddModal(false);
                                        setEditingArtist(null);
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

export default ArtistDashboard;
