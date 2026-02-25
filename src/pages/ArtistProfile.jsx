import React, { useState, useEffect, useRef } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { artistAPI } from '../services/api';
import { fixImageUrl } from '../utils/imageHelper';

const isVideoUrl = (url) => {
    if (!url || typeof url !== 'string') return false;
    return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url) || url.includes('/video/');
};
import './ArtistProfile.css';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, onAuthStateChanged, auth, getGoogleRedirectResult, googleRedirectLogin } from '../firebase';

const ArtistProfile = ({ artistData }) => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const artistIdParam = searchParams.get('id');

    const [artist, setArtist] = useState(artistData || null);
    const [loading, setLoading] = useState(artistData ? false : true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    // Auth state
    const [user, setUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [flipAnim, setFlipAnim] = useState('');
    const [isFlipAnimating, setIsFlipAnimating] = useState(false);
    const eventsSwiperRef = useRef(null);

    // Setup form state
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        bio: '',
        photo: '', // This will hold the URL after upload
        email: '',
        phone: '',
        website: '',
        instagram: '',
        facebook: '',
        twitter: '',
        whatsapp: '',
        linkedin: '',
        instagramName: '',
        instagramCategory: '',
        instagramPosts: '',
        instagramFollowers: '',
        instagramFollowing: '',
        instagramAccountBio: '',
        profileTheme: 'mono'
    });

    const [photoFile, setPhotoFile] = useState(null);
    const [bgFile, setBgFile] = useState(null);
    const [galleryFiles, setGalleryFiles] = useState([]);
    const [uploadingPhoto, setUploadingPhoto] = useState(false);
    const [uploadingBg, setUploadingBg] = useState(false);
    const [uploadingGallery, setUploadingGallery] = useState(false);

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
        // Handle redirect result
        const checkRedirect = async () => {
            try {
                const result = await getGoogleRedirectResult();
                if (result?.user) {
                    setUser(result.user);
                }
            } catch (err) {
                console.error("Redirect error:", err);
            }
        };
        checkRedirect();

        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setAuthLoading(false);
            if (currentUser && currentUser.email) {
                setFormData(prev => ({ ...prev, email: currentUser.email }));
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!artistData) {
            fetchArtistProfile();
        } else {
            // Propagate prop data to form state for immediate editing availability
            setFormData({
                name: artistData.name || '',
                specialization: artistData.specialization || '',
                bio: artistData.bio || '',
                photo: artistData.photo || '',
                backgroundPhoto: artistData.backgroundPhoto || '',
                gallery: artistData.gallery || [],
                email: artistData.email || user?.email || '',
                phone: artistData.phone || '',
                website: artistData.website || '',
                instagram: artistData.instagram || '',
                facebook: artistData.facebook || '',
                twitter: artistData.twitter || '',
                whatsapp: artistData.whatsapp || '',
                linkedin: artistData.linkedin || '',
                instagramName: artistData.instagramName || '',
                instagramCategory: artistData.instagramCategory || '',
                instagramPosts: artistData.instagramPosts || '',
                instagramFollowers: artistData.instagramFollowers || '',
                instagramFollowing: artistData.instagramFollowing || '',
                instagramAccountBio: artistData.instagramAccountBio || '',
                profileTheme: artistData.profileTheme || 'mono'
            });
        }
    }, [token, artistIdParam, artistData]);

    // Fallback autoplay: advance EVENTS swiper every 3s (Swiper Autoplay module can fail to start when profile first loads)
    useEffect(() => {
        if (!artist?.gallery || artist.gallery.length <= 1) return;
        const interval = setInterval(() => {
            const swiper = eventsSwiperRef.current;
            if (swiper && !swiper.destroyed && typeof swiper.slideNext === 'function') {
                swiper.slideNext();
            }
        }, 3000);
        return () => clearInterval(interval);
    }, [artist?.gallery]);

    const handleGoogleLogin = async () => {
        try {
            setAuthError('');
            // Try redirect login if popups are failing due to COOP
            await googleRedirectLogin();
        } catch (err) {
            setAuthError('Google login failed. Please try again.');
        }
    };

    const handleEmailAuth = async (e) => {
        e.preventDefault();
        try {
            setAuthError('');
            if (authMode === 'login') {
                await signInWithEmail(email, password);
            } else {
                await signUpWithEmail(email, password);
            }
        } catch (err) {
            setAuthError(err.message || 'Authentication failed');
        }
    };

    const fetchArtistProfile = async () => {
        try {
            setLoading(true);
            let response;

            if (artistIdParam) {
                // Handle student-style ?id=AT-01
                response = await artistAPI.getArtistById(artistIdParam);
            } else if (token) {
                // Handle token-style /artist/TOKEN
                response = await artistAPI.getArtistByToken(token);
            } else {
                setError('No artist ID or token provided');
                setLoading(false);
                return;
            }

            const data = response.data;

            if (data.success) {
                setArtist(data.data);

                // Always populate formData for potential editing
                setFormData({
                    name: data.data.name || '',
                    specialization: data.data.specialization || '',
                    bio: data.data.bio || '',
                    photo: data.data.photo || '',
                    backgroundPhoto: data.data.backgroundPhoto || '',
                    gallery: data.data.gallery || [],
                    email: data.data.email || user?.email || '',
                    phone: data.data.phone || '',
                    website: data.data.website || '',
                    instagram: data.data.instagram || '',
                    facebook: data.data.facebook || '',
                    twitter: data.data.twitter || '',
                    whatsapp: data.data.whatsapp || '',
                    linkedin: data.data.linkedin || '',
                    instagramName: data.data.instagramName || '',
                    instagramCategory: data.data.instagramCategory || '',
                    instagramPosts: data.data.instagramPosts || '',
                    instagramFollowers: data.data.instagramFollowers || '',
                    instagramFollowing: data.data.instagramFollowing || '',
                    instagramAccountBio: data.data.instagramAccountBio || '',
                    profileTheme: data.data.profileTheme || 'mono'
                });
            } else {
                setError('Artist not found');
            }
        } catch (error) {
            console.error('Error fetching artist:', error);
            setError('Error loading artist profile');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            // Visual preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, photo: reader.result }));
            };
            reader.readAsDataURL(file);
            setPhotoFile(file);
        }
    };

    const handleBgFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setBgFile(e.target.files[0]);
        }
    };

    const [galleryUploads, setGalleryUploads] = useState([]); // Array of { file: File, name: string }
    const [newItemName, setNewItemName] = useState('');
    const [newItemFile, setNewItemFile] = useState(null);

    const handleGalleryFilesChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setNewItemFile(e.target.files[0]);
        }
    };

    const addGalleryItem = () => {
        if (!newItemFile) return;
        setGalleryUploads(prev => [...prev, { file: newItemFile, name: newItemName }]);
        setNewItemFile(null);
        setNewItemName('');
    };

    const removePendingItem = (index) => {
        setGalleryUploads(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingItem = (index) => {
        setFormData(prev => ({
            ...prev,
            gallery: prev.gallery.filter((_, i) => i !== index)
        }));
    };

    const handleSetupSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            // 1. Upload Profile Photo if any
            let finalPhotoUrl = formData.photo;
            if (photoFile) {
                setUploadingPhoto(true);
                const uploadRes = await artistAPI.uploadPhoto(photoFile);
                if (uploadRes.data.success) {
                    finalPhotoUrl = uploadRes.data.url;
                }
                setUploadingPhoto(false);
            }

            // 2. Upload Background Photo if any
            let finalBgUrl = formData.backgroundPhoto;
            if (bgFile) {
                setUploadingBg(true);
                const uploadRes = await artistAPI.uploadPhoto(bgFile);
                if (uploadRes.data.success) {
                    finalBgUrl = uploadRes.data.url;
                }
                setUploadingBg(false);
            }

            // 3. Upload Gallery if any
            let finalGallery = [...formData.gallery];
            if (galleryUploads.length > 0) {
                setUploadingGallery(true);
                for (const item of galleryUploads) {
                    const uploadRes = await artistAPI.uploadPhoto(item.file);
                    if (uploadRes.data.success) {
                        finalGallery.push({
                            url: uploadRes.data.url,
                            name: item.name
                        });
                    }
                }
                setUploadingGallery(false);
                setGalleryUploads([]); // Clear uploads after success
            }

            // 2. Priority: URL token > state artist token
            const activeToken = token || artist?.accessToken;

            if (!activeToken) {
                alert('Security token is missing. Please scan your NFC tag again.');
                setSubmitting(false);
                return;
            }

            // 3. Submit profile with updated photo URL, theme and owner info
            const finalData = {
                ...formData,
                photo: finalPhotoUrl,
                backgroundPhoto: finalBgUrl,
                gallery: finalGallery,
                ownerEmail: user?.email,
                ownerUid: user?.uid
            };

            const response = await artistAPI.setupProfile(activeToken, finalData);

            if (response.data.success) {
                const updatedArtist = response.data.data;
                setArtist(updatedArtist);

                // Update formData with the new URLs to prevent overwrite on next save
                setFormData(prev => ({
                    ...prev,
                    photo: updatedArtist.photo,
                    backgroundPhoto: updatedArtist.backgroundPhoto,
                    gallery: updatedArtist.gallery
                }));

                setIsEditing(false);
                alert('Profile updated successfully!');
            }
        } catch (error) {
            console.error('Error setting up profile:', error);
            alert(error.response?.data?.message || 'Error setting up profile');
        } finally {
            setSubmitting(false);
            setUploadingPhoto(false);
            setUploadingBg(false);
            setUploadingGallery(false);
        }
    };

    const getSocialLink = (platform, value) => {
        if (!value) return null;

        if (value.startsWith('http://') || value.startsWith('https://')) {
            return value;
        }

        switch (platform) {
            case 'instagram':
                return `https://instagram.com/${value.replace('@', '')}`;
            case 'twitter':
                return `https://twitter.com/${value.replace('@', '')}`;
            case 'linkedin':
                return value.includes('linkedin.com') ? value : `https://linkedin.com/in/${value}`;
            case 'whatsapp':
                return `https://wa.me/${value.replace(/[^0-9]/g, '')}`;
            case 'website':
                return value.startsWith('http') ? value : `https://${value}`;
            default:
                return value.startsWith('http') ? value : `https://${value}`;
        }
    };

    const handleFlip = () => {
        if (isFlipAnimating) return;
        const goingToBack = !isFlipped;
        if (goingToBack) {
            setIsFlipped(true);
        }
        setFlipAnim(goingToBack ? 'flip-to-back' : 'flip-to-front');
        setIsFlipAnimating(true);
    };

    const handleFlipAnimEnd = (e) => {
        if (!isFlipAnimating) return;
        const animName = e?.animationName || '';
        setIsFlipAnimating(false);
        setFlipAnim('');
        if (animName === 'flipToFront') {
            setIsFlipped(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0f172a' }}>
                <dotlottie-wc src="https://lottie.host/5f54c8aa-f2d2-44b9-9101-4c41b8752402/tbiOHPgfhx.lottie" style={{ width: '300px', height: '300px' }} autoplay loop></dotlottie-wc>
                <p style={{ color: '#ffffff', marginTop: '20px', fontSize: '1.1rem' }}>Loading artist profile...</p>
            </div>
        );
    }

    if (error || !artist) {
        return (
            <div className="artist-profile-error">
                <div className="error-icon">🎨</div>
                <h2>{error || 'Artist not found'}</h2>
                <p>The artist profile you're looking for doesn't exist.</p>
            </div>
        );
    }

    // NEW SETUP/EDIT VIEW
    if (!artist.isSetup || isEditing) {
        // Step 1: Authentication
        if (!user) {
            return (
                <div className="artist-profile artist-profile-wrapper setup-page">
                    <div className="setup-container slide-up">
                        <div className="setup-header-text">
                            <h1>Secure Your Profile</h1>
                            <p>To activate your NFC tag, please log in or create an account. This links your digital portfolio to you.</p>
                        </div>

                        <div className="auth-card-centered">
                            <div className="auth-choice">
                                <button className="google-auth-btn" onClick={handleGoogleLogin}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                    </svg>
                                    Continue with Google
                                </button>

                                <div className="auth-divider">
                                    <span>or use email</span>
                                </div>

                                <form className="email-auth-form" onSubmit={handleEmailAuth}>
                                    {authError && <div className="auth-error-msg">{authError}</div>}
                                    <input
                                        type="email"
                                        placeholder="Email Address"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button type="submit" className="email-submit-btn">
                                        {authMode === 'login' ? 'Login to Setup' : 'Create Account & Setup'}
                                    </button>
                                </form>

                                <button
                                    className="auth-toggle-btn"
                                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                                >
                                    {authMode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Login"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        // Step 2: Setup Form (Shown only if logged in)
        return (
            <div className="artist-profile artist-profile-wrapper setup-page">
                <div className="setup-container slide-up">
                    <div className="setup-header-inner">
                        <div className="setup-header-text">
                            <h1>Unlock Your Portfolio</h1>
                            <p>Complete your professional profile to activate your premium digital presence.</p>
                        </div>
                    </div>

                    <div className="setup-form-only">
                        {/* Form Side */}
                        <div className="form-side">
                            <form className="premium-setup-form" onSubmit={handleSetupSubmit}>
                                <div className="form-inner-scroll">
                                    <div className="form-step">
                                        <div className="step-number">01</div>
                                        <div className="step-header-with-badge">
                                            <h4>Identity</h4>
                                            <div className="user-badge-inline">
                                                <span className="badge-dot"></span>
                                                <span className="badge-text">{user.email}</span>
                                                <button onClick={() => auth.signOut()} className="user-logout-inline">LOGOUT</button>
                                            </div>
                                        </div>
                                        <div className="setup-input-group">
                                            <label>Full Name</label>
                                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} required placeholder="How should we call you?" />
                                        </div>
                                        <div className="setup-input-group">
                                            <label>Specialization</label>
                                            <input type="text" name="specialization" value={formData.specialization} onChange={handleInputChange} placeholder="e.g. Visual Artist, UI Designer" />
                                        </div>
                                        <div className="setup-input-group">
                                            <label>Biography</label>
                                            <textarea name="bio" value={formData.bio} onChange={handleInputChange} rows="3" placeholder="A short story about your creative journey..." />
                                        </div>
                                        <div className="setup-input-group">
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
                                    </div>

                                    <div className="form-step">
                                        <div className="step-number">02</div>
                                        <h4>Visual Portfolio</h4>
                                        <div className="input-row">
                                            <div className="setup-input-group">
                                                <label>Profile Photo</label>
                                                <div className="file-input-wrapper">
                                                    <input type="file" accept="image/*" onChange={handleFileChange} className="file-input" />
                                                    {uploadingPhoto && <div className="upload-indicator">Uploading profile...</div>}
                                                </div>
                                            </div>
                                            <div className="setup-input-group">
                                                <label>Background Image</label>
                                                <div className="file-input-wrapper">
                                                    <input type="file" accept="image/*" onChange={handleBgFileChange} className="file-input" />
                                                    {uploadingBg && <div className="upload-indicator">Uploading background...</div>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="setup-input-group gallery-section-form">
                                            <label>Gallery (Add your works)</label>

                                            {/* Existing/Pending Gallery List */}
                                            <div className="pending-gallery-list">
                                                {/* Already Saved Items */}
                                                {formData.gallery.map((item, idx) => (
                                                    <div key={`exist-${idx}`} className="gallery-item-preview">
                                                        <img src={fixImageUrl(typeof item === 'string' ? item : item.url)} alt="Work" />
                                                        <span className="item-name-tag">{typeof item === 'string' ? 'Untitled' : item.name}</span>
                                                        <button type="button" onClick={() => removeExistingItem(idx)} className="remove-item-btn">&times;</button>
                                                    </div>
                                                ))}
                                                {/* New Items not yet uploaded */}
                                                {galleryUploads.map((item, idx) => (
                                                    <div key={`new-${idx}`} className="gallery-item-preview pending">
                                                        <div className="pending-thumb">FILE</div>
                                                        <span className="item-name-tag">{item.name || 'Untitled'}</span>
                                                        <button type="button" onClick={() => removePendingItem(idx)} className="remove-item-btn">&times;</button>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Add New Item Control */}
                                            <div className="add-gallery-control">
                                                <div className="add-row">
                                                    <input
                                                        type="text"
                                                        placeholder="Work Title (e.g. Ocean Blue)"
                                                        value={newItemName}
                                                        onChange={(e) => setNewItemName(e.target.value)}
                                                        className="work-name-input"
                                                    />
                                                    <div className="file-btn-wrapper">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={handleGalleryFilesChange}
                                                            className="gallery-file-input"
                                                            id="gallery-add"
                                                        />
                                                        <label htmlFor="gallery-add" className="file-label-btn">
                                                            {newItemFile ? 'Change Image' : 'Select Image'}
                                                        </label>
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    className="add-to-list-btn"
                                                    onClick={addGalleryItem}
                                                    disabled={!newItemFile}
                                                >
                                                    + Add to Gallery
                                                </button>
                                            </div>
                                            {uploadingGallery && <div className="upload-indicator">Uploading {galleryUploads.length} works...</div>}
                                        </div>
                                    </div>

                                    <div className="form-step">
                                        <div className="flex-between">
                                            <div className="flex-start">
                                                <div className="step-number">03</div>
                                                <h4>Contact Details</h4>
                                            </div>
                                            {isEditing && (
                                                <button type="button" className="cancel-edit-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                                            )}
                                        </div>
                                        <div className="input-row">
                                            <div className="setup-input-group">
                                                <label>Email Address</label>
                                                <input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="hello@yoursite.com" />
                                            </div>
                                            <div className="setup-input-group">
                                                <label>Mobile Number</label>
                                                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} placeholder="+91..." />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-step">
                                        <div className="step-number">04</div>
                                        <h4>Digital Platforms</h4>
                                        <div className="input-row">
                                            <div className="setup-input-group">
                                                <label>Instagram</label>
                                                <input type="text" name="instagram" value={formData.instagram} onChange={handleInputChange} placeholder="@handle" />
                                            </div>
                                            <div className="setup-input-group">
                                                <label>Twitter</label>
                                                <input type="text" name="twitter" value={formData.twitter} onChange={handleInputChange} placeholder="@handle" />
                                            </div>
                                        </div>
                                        <div className="input-row">
                                            <div className="setup-input-group">
                                                <label>LinkedIn</label>
                                                <input type="text" name="linkedin" value={formData.linkedin} onChange={handleInputChange} placeholder="profile-id" />
                                            </div>
                                            <div className="setup-input-group">
                                                <label>WhatsApp</label>
                                                <input type="text" name="whatsapp" value={formData.whatsapp} onChange={handleInputChange} placeholder="Mobile with country code" />
                                            </div>
                                        </div>
                                        <div className="input-row">
                                            <div className="setup-input-group">
                                                <label>Website</label>
                                                <input type="text" name="website" value={formData.website} onChange={handleInputChange} placeholder="www.yoursite.com" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="premium-submit-btn" disabled={submitting}>
                                    {submitting ? 'Creating Your Portfolio...' : 'Activate Portfolio'}
                                    <span className="btn-shine"></span>
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // REGULAR PROFILE VIEW – full card flip: front = full profile, back = artist badges
    const activeTheme = artist.profileTheme || 'mono';
    const slideGallery = (artist.gallery || []).slice(0, 3);

    return (
        <div className={`artist-profile-wrapper theme-${activeTheme}`}>
            <div className="profile-flip-container" onClick={handleFlip}>
                <div
                    className={`profile-flip-card ${isFlipped ? 'flipped' : ''} ${flipAnim} ${isFlipAnimating ? 'is-flip-animating' : ''}`}
                    onAnimationEnd={handleFlipAnimEnd}
                >
                    {/* Front: full profile card */}
                    <div className="profile-flip-front profile-flip-side">
                        <div className="artist-profile-card slide-up">
                            <div className="profile-header-gradient" style={{ backgroundImage: `url(${fixImageUrl(artist.backgroundPhoto)})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                {!artist.backgroundPhoto && <div className="gradient-overlay"></div>}
                                <div className="profile-photo-container" onClick={(e) => { e.stopPropagation(); setShowPhotoModal(true); }}>
                                    <img src={fixImageUrl(artist.photo)} alt={artist.name} className="profile-photo-circle" />
                                </div>
                            </div>
                            <div className="profile-info-content">
                                <div className="artist-name-art-center">
                                    <div className="name-edit-row">
                                        <h1 className="display-name">{artist.name}</h1>
                                    </div>
                                    <p className="specialization-badge">{artist.specialization || "Creative Professional"}</p>
                                </div>

                                <div className="unified-content-container">
                                    <div className="content-section">
                                        <h3 className="section-label">ABOUT</h3>
                                        <p className="bio-text">
                                            {artist.bio || "No bio provided yet. This artist is currently crafting their story."}
                                        </p>
                                    </div>
                                </div>

                                <div className="artist-events-block">
                                    <h3 className="section-label">EVENTS</h3>
                                    <div className="artist-swiper-wrap fade-in" onClick={(e) => e.stopPropagation()}>
                                        {slideGallery.length > 0 ? (
                                            <Swiper
                                                key={`events-swiper-${slideGallery.length}`}
                                                onSwiper={(swiper) => {
                                                    eventsSwiperRef.current = swiper;
                                                    const playActiveVideoOnly = () => {
                                                        const activeEl = swiper.slides?.[swiper.activeIndex];
                                                        swiper.slides?.forEach((el) => {
                                                            const video = el?.querySelector('.artist-slide-video');
                                                            if (video) {
                                                                if (el === activeEl) video.play().catch(() => {});
                                                                else video.pause();
                                                            }
                                                        });
                                                    };
                                                    setTimeout(playActiveVideoOnly, 300);
                                                }}
                                                onSlideChangeTransitionEnd={(swiper) => {
                                                    const activeEl = swiper.slides?.[swiper.activeIndex];
                                                    swiper.slides?.forEach((el) => {
                                                        const video = el?.querySelector('.artist-slide-video');
                                                        if (video) {
                                                            if (el === activeEl) video.play().catch(() => {});
                                                            else video.pause();
                                                        }
                                                    });
                                                }}
                                                effect="coverflow"
                                                grabCursor
                                                centeredSlides
                                                slidesPerView="auto"
                                                spaceBetween={24}
                                                coverflowEffect={{
                                                    rotate: 0,
                                                    stretch: 20,
                                                    depth: 80,
                                                    modifier: 2.2,
                                                    slideShadows: true
                                                }}
                                                loop={slideGallery.length > 1}
                                                pagination={{ clickable: true }}
                                                modules={[EffectCoverflow, Pagination]}
                                                className="artist-swiper"
                                            >
                                                {slideGallery.map((item, index) => {
                                                    const mediaUrl = typeof item === 'string' ? item : item.url;
                                                    const mediaName = typeof item === 'string' ? 'Untitled' : (item.name || 'Untitled');
                                                    const isVideo = isVideoUrl(mediaUrl);
                                                    const fixedUrl = fixImageUrl(mediaUrl);
                                                    return (
                                                        <SwiperSlide key={index}>
                                                            <div
                                                                className="artist-swiper-slide"
                                                                style={!isVideo ? {
                                                                    background: `linear-gradient(to top, #0f2027, #203a4300, #2c536400), url("${fixedUrl}") no-repeat 50% 50% / cover`
                                                                } : undefined}
                                                                onClick={(e) => { e.stopPropagation(); setSelectedImage(mediaUrl); setShowPhotoModal(true); }}
                                                            >
                                                                {isVideo ? (
                                                                    <>
                                                                        <video
                                                                            className="artist-slide-video"
                                                                            src={fixedUrl}
                                                                            muted
                                                                            loop
                                                                            playsInline
                                                                            autoPlay={false}
                                                                            style={{ pointerEvents: 'none' }}
                                                                        />
                                                                        <div className="artist-swiper-slide-overlay" aria-hidden="true" />
                                                                    </>
                                                                ) : null}
                                                                <div className="artist-swiper-slide-content">
                                                                    <h2>{mediaName}</h2>
                                                                    <button type="button" className="artist-swiper-explore" onClick={(e) => { e.stopPropagation(); setSelectedImage(mediaUrl); setShowPhotoModal(true); }}>
                                                                        View
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </SwiperSlide>
                                                    );
                                                })}
                                            </Swiper>
                                        ) : (
                                            <div className="mini-slideshow-placeholder">
                                                <div className="placeholder-icon">🖼️</div>
                                                <p className="placeholder-title">No events yet</p>
                                                <p className="placeholder-desc">Images added from the landing page or by admin will appear here.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="social-icon-row">
                                    {artist.instagram && (
                                        <a href={getSocialLink('instagram', artist.instagram)} target="_blank" rel="noopener noreferrer" className="social-icon-btn instagram" onClick={(e) => e.stopPropagation()} aria-label="Instagram">
                                            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                        </a>
                                    )}
                                    {artist.twitter && (
                                        <a href={getSocialLink('twitter', artist.twitter)} target="_blank" rel="noopener noreferrer" className="social-icon-btn twitter" onClick={(e) => e.stopPropagation()} aria-label="Twitter"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" /></svg></a>
                                    )}
                                    {artist.website && (
                                        <a href={getSocialLink('website', artist.website)} target="_blank" rel="noopener noreferrer" className="social-icon-btn website" onClick={(e) => e.stopPropagation()} aria-label="Website"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg></a>
                                    )}
                                    {artist.linkedin && (
                                        <a href={getSocialLink('linkedin', artist.linkedin)} target="_blank" rel="noopener noreferrer" className="social-icon-btn linkedin" onClick={(e) => e.stopPropagation()} aria-label="LinkedIn"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg></a>
                                    )}
                                    {artist.whatsapp && (
                                        <a href={getSocialLink('whatsapp', artist.whatsapp)} target="_blank" rel="noopener noreferrer" className="social-icon-btn whatsapp" onClick={(e) => e.stopPropagation()} aria-label="WhatsApp"><svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338-11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.371-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" /></svg></a>
                                    )}
                                </div>

                                <div className="content-section">
                                    <h3 className="section-label">GET IN TOUCH</h3>
                                    <div className="contact-list-minimal">
                                        {artist.email && (
                                            <a href={`mailto:${artist.email}`} className="contact-item-minimal" onClick={(e) => e.stopPropagation()}>
                                                <div className="contact-icon">📧</div>
                                                <div className="contact-text">{artist.email}</div>
                                            </a>
                                        )}
                                        {artist.phone && (
                                            <a href={`tel:${artist.phone}`} className="contact-item-minimal" onClick={(e) => e.stopPropagation()}>
                                                <div className="contact-icon">📱</div>
                                                <div className="contact-text">{artist.phone}</div>
                                            </a>
                                        )}
                                    </div>

                                    <button type="button" className="flip-tap-hint flip-tap-btn flip-tap-below" onClick={(e) => { e.stopPropagation(); handleFlip(); }}>Tap card to see badges</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Back: full-cover badges card (reference style – summary stats + awards grid) */}
                    <div className="profile-flip-back profile-flip-side">
                        <div className="profile-card-back-content">
                            <button type="button" className="profile-back-hint profile-back-flip-btn" onClick={(e) => { e.stopPropagation(); handleFlip(); }}>Tap card to see profile</button>

                            {/* Top: 4 summary milestone cards */}
                            <div className="profile-back-milestones">
                                <div className="profile-milestone-card milestone-views">
                                    <span className="milestone-label">Profile Views</span>
                                    <span className="milestone-value">{artist.scanCount || 0}</span>
                                </div>
                                <div className="profile-milestone-card milestone-works">
                                    <span className="milestone-label">Works</span>
                                    <span className="milestone-value">{artist.gallery?.length || 0}</span>
                                </div>
                                <div className="profile-milestone-card milestone-connections">
                                    <span className="milestone-label">Connections</span>
                                    <span className="milestone-value">{[artist.instagram, artist.twitter, artist.linkedin, artist.whatsapp, artist.website].filter(Boolean).length}</span>
                                </div>
                            </div>

                            <h2 className="profile-back-awards-title">Awards</h2>
                            <div className="profile-back-awards-grid">
                                {(() => {
                                    const over = artist.badgeOverrides || {};
                                    const views = artist.scanCount || 0;
                                    const works = artist.gallery?.length || 0;
                                    const connections = [artist.instagram, artist.twitter, artist.linkedin, artist.whatsapp, artist.website].filter(Boolean).length;
                                    const badges = [
                                        { id: 'rising', icon: '⭐', title: 'Rising Star', value: over.rising != null ? over.rising : views, target: 1, color: 'badge-pink' },
                                        { id: 'curator', icon: '🖼️', title: 'Curator', value: over.curator != null ? over.curator : Math.min(works, 5), target: 5, color: 'badge-amber' },
                                        { id: 'popular', icon: '🔥', title: 'Popular', value: over.popular != null ? over.popular : Math.min(views, 10), target: 10, color: 'badge-orange' },
                                        { id: 'portfolio', icon: '✨', title: 'Portfolio Pro', value: over.portfolio != null ? over.portfolio : Math.min(works, 10), target: 10, color: 'badge-teal' },
                                        { id: 'connector', icon: '🔗', title: 'Connector', value: over.connector != null ? over.connector : Math.min(connections, 5), target: 5, color: 'badge-purple' },
                                        { id: 'legend', icon: '👑', title: 'Legend', value: over.legend != null ? over.legend : Math.min(views, 50), target: 50, color: 'badge-blue' },
                                    ];
                                    return badges.map((b) => (
                                        <div key={b.id} className={`profile-award-badge ${b.color}`}>
                                            <div className="award-badge-circle">
                                                <span className="award-badge-icon">{b.icon}</span>
                                                <span className="award-badge-value">{b.value}</span>
                                            </div>
                                            <span className="award-badge-title">{b.title}</span>
                                            <span className="award-badge-progress">{b.value} of {b.target}</span>
                                        </div>
                                    ));
                                })()}
                            </div>
                            <div className="profile-back-lottie">
                                <DotLottieReact
                                    src="https://lottie.host/658d0b13-c757-4a4f-ae69-df850b443cf7/pFGUZjnHbm.lottie"
                                    loop
                                    autoplay
                                    style={{ width: '100%', height: '220px' }}
                                />
                            </div>
                            <div className="profile-footer profile-footer-artist profile-footer-back">
                                <div className="premium-brand-badge">
                                    <span className="badge-text badge-encrypted">End-to-end encrypted</span><br />
                                    <span className="badge-text">Powered by <a href="https://nanoprofiles.com" target="_blank" rel="noopener noreferrer" className="badge-link">NanoProfiles</a></span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Profile preview card (card-style UI, not zoom) */}
            {showPhotoModal && (
                <div className="photo-modal-overlay" onClick={() => {
                    setShowPhotoModal(false);
                    setSelectedImage(null);
                }}>
                    <div className="artist-preview-card" onClick={e => e.stopPropagation()}>
                        <div className="artist-preview-card-image-wrap">
                            {isVideoUrl(selectedImage) ? (
                                <video src={fixImageUrl(selectedImage)} className="artist-preview-card-img" autoPlay loop muted playsInline controls />
                            ) : (
                                <img src={fixImageUrl(selectedImage || artist.photo)} alt={artist.name} className="artist-preview-card-img" />
                            )}
                            <div className="artist-preview-card-overlay">
                                <h2 className="artist-preview-card-name">
                                    {artist.name}
                                    <span className="artist-preview-card-verified" aria-label="Verified">✓</span>
                                </h2>
                                <p className="artist-preview-card-bio">
                                    {artist.specialization || artist.bio?.slice(0, 60) || 'Creative Professional'}
                                    {artist.bio && artist.bio.length > 60 ? '...' : ''}
                                </p>
                                <div className="artist-preview-card-meta">
                                    <span className="artist-preview-card-stat">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                                        {artist.scanCount ?? 0} views
                                    </span>
                                    <button type="button" className="artist-preview-card-close" onClick={() => { setShowPhotoModal(false); setSelectedImage(null); }}>
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                        <button type="button" className="artist-preview-card-close-btn" onClick={() => { setShowPhotoModal(false); setSelectedImage(null); }} aria-label="Close">&times;</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ArtistProfile;
