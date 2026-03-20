import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { fixImageUrl } from '../../utils/imageHelper';
import ArtistFullscreenMediaPreviewModal from './ArtistFullscreenMediaPreviewModal';

/**
 * Active "Art" deep-link view.
 * Extracted from ArtistProfile.jsx to keep parent file smaller.
 */
const ArtistProfileActiveArtView = ({
    artist,
    activeArt,
    activeArtImages,
    showPhotoModal,
    setShowPhotoModal,
    selectedImage,
    setSelectedImage,
    artLangOpen,
    artLangSearch,
    setArtLangSearch,
    artLangLoading,
    setArtLangLoading,
    artLangError,
    setArtLangError,
    setArtLangOpen,
    artSelectedLang,
    setArtSelectedLang,
    artDescriptionTranslated,
    setArtDescriptionTranslated
}) => {
    return (
        <div className="artist-profile-wrapper theme-classic">
            <div
                className="artist-profile-card slide-up"
                style={{
                    paddingTop: 0,
                    background: '#ffffff',
                    color: '#000000',
                    overflow: 'hidden',
                    '--font-heading': 'system-ui, -apple-system, sans-serif',
                    '--font-body': 'system-ui, -apple-system, sans-serif'
                }}
            >
                <div className="profile-info-content" style={{ paddingTop: 0 }}>
                    {/* Slideshow of all artwork images (gifs/images) at the very top */}
                    {activeArtImages.length > 0 && (
                        <div className="artist-events-block" style={{ marginTop: 0 }}>
                            <div
                                className="artist-swiper-wrap fade-in"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Swiper
                                    key={`art-swiper-${activeArtImages.length}`}
                                    grabCursor
                                    slidesPerView={1}
                                    spaceBetween={0}
                                    loop={activeArtImages.length > 1}
                                    autoplay={{ delay: 2500, disableOnInteraction: false }}
                                    pagination={{ clickable: true }}
                                    modules={[EffectCoverflow, Pagination, Autoplay]}
                                    className="artist-swiper"
                                >
                                    {activeArtImages.map((imgUrl, index) => {
                                        const fixedUrl = fixImageUrl(imgUrl);
                                        return (
                                            <SwiperSlide key={index}>
                                                <div
                                                    className="artist-swiper-slide"
                                                    style={{
                                                        backgroundImage: `url("${fixedUrl}")`,
                                                        backgroundRepeat: 'no-repeat',
                                                        backgroundSize: 'cover',
                                                        backgroundPosition: 'center'
                                                    }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedImage(imgUrl);
                                                        setShowPhotoModal(true);
                                                    }}
                                                />
                                            </SwiperSlide>
                                        );
                                    })}
                                </Swiper>
                            </div>
                        </div>
                    )}

                    {/* Center-screen language picker modal */}
                    {artLangOpen && (
                        <div
                            onClick={() => {
                                if (!artLangLoading) {
                                    setArtLangOpen(false);
                                    setArtLangError('');
                                }
                            }}
                            style={{
                                position: 'fixed',
                                inset: 0,
                                background: 'rgba(15,23,42,0.72)',
                                backdropFilter: 'blur(14px)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                zIndex: 60
                            }}
                        >
                            <div
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    width: '92%',
                                    maxWidth: '380px',
                                    background: 'linear-gradient(145deg, rgba(15,23,42,0.98), rgba(15,23,42,0.92))',
                                    borderRadius: '22px',
                                    border: '1px solid rgba(148,163,184,0.5)',
                                    boxShadow: '0 40px 90px rgba(15,23,42,0.95)',
                                    padding: '18px 20px'
                                }}
                            >
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        marginBottom: '10px'
                                    }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                                        <div
                                            style={{
                                                fontSize: '0.78rem',
                                                letterSpacing: '0.14em',
                                                textTransform: 'uppercase',
                                                color: '#6b7280'
                                            }}
                                        >
                                            Translate description
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ fontSize: '1.15rem' }}>🌐</div>
                                            <div style={{ fontSize: '0.9rem', color: '#e5e7eb' }}>
                                                Choose a language
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setArtLangOpen(false);
                                            setArtLangError('');
                                        }}
                                        style={{
                                            border: 'none',
                                            background: 'transparent',
                                            color: '#9ca3af',
                                            fontSize: '1.1rem',
                                            cursor: 'pointer',
                                            padding: 0,
                                            lineHeight: 1
                                        }}
                                        aria-label="Close language picker"
                                    >
                                        ×
                                    </button>
                                </div>

                                <input
                                    type="text"
                                    placeholder="Search language…"
                                    value={artLangSearch}
                                    onChange={(e) => setArtLangSearch(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '8px 11px',
                                        borderRadius: '999px',
                                        border: '1px solid rgba(51,65,85,0.9)',
                                        background: 'rgba(15,23,42,0.95)',
                                        color: '#e5e7eb',
                                        fontSize: '0.78rem',
                                        boxShadow: 'inset 0 0 0 1px rgba(15,23,42,0.6)',
                                        textTransform: 'none',
                                        letterSpacing: 0,
                                        marginBottom: '8px',
                                        outline: 'none'
                                    }}
                                />

                                {artLangError && (
                                    <div style={{ color: '#f97373', fontSize: '0.72rem', marginBottom: '6px' }}>
                                        {artLangError}
                                    </div>
                                )}

                                <div
                                    className="artist-lang-scroll"
                                    style={{
                                        maxHeight: '220px',
                                        overflowY: 'auto',
                                        paddingRight: '2px',
                                        display: 'grid',
                                        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                                        gap: '6px'
                                    }}
                                >
                                    {[
                                        // Global popular languages
                                        { code: 'en', label: 'English' },
                                        { code: 'es', label: 'Spanish' },
                                        { code: 'fr', label: 'French' },
                                        { code: 'de', label: 'German' },
                                        { code: 'it', label: 'Italian' },
                                        { code: 'pt', label: 'Portuguese' },
                                        { code: 'ru', label: 'Russian' },
                                        { code: 'zh-CN', label: 'Chinese (Simplified)' },
                                        { code: 'ja', label: 'Japanese' },
                                        { code: 'ko', label: 'Korean' },
                                        { code: 'tr', label: 'Turkish' },
                                        { code: 'id', label: 'Indonesian' },
                                        { code: 'th', label: 'Thai' },
                                        { code: 'vi', label: 'Vietnamese' },

                                        // Major Indian languages
                                        { code: 'hi', label: 'Hindi' },
                                        { code: 'te', label: 'Telugu' },
                                        { code: 'ta', label: 'Tamil' },
                                        { code: 'kn', label: 'Kannada' },
                                        { code: 'ml', label: 'Malayalam' },
                                        { code: 'mr', label: 'Marathi' },
                                        { code: 'bn', label: 'Bengali' },
                                        { code: 'gu', label: 'Gujarati' },
                                        { code: 'pa', label: 'Punjabi' },
                                        { code: 'ur', label: 'Urdu' },
                                        { code: 'or', label: 'Odia' },
                                        { code: 'as', label: 'Assamese' }
                                    ]
                                        .filter((lang) => {
                                            const q = artLangSearch.toLowerCase().trim();
                                            if (!q) return true;
                                            return lang.label.toLowerCase().includes(q) || lang.code.toLowerCase().includes(q);
                                        })
                                        .map((lang) => (
                                            <button
                                                key={lang.code}
                                                type="button"
                                                disabled={artLangLoading && artSelectedLang === lang.code}
                                                onClick={async () => {
                                                    if (lang.code === 'en') {
                                                        setArtSelectedLang('en');
                                                        setArtDescriptionTranslated(null);
                                                        setArtLangOpen(false);
                                                        setArtLangSearch('');
                                                        setArtLangError('');
                                                        return;
                                                    }
                                                    try {
                                                        setArtLangLoading(true);
                                                        setArtLangError('');
                                                        setArtLangSearch('');

                                                        const res = await fetch(
                                                            `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
                                                                lang.code
                                                            )}&dt=t&q=${encodeURIComponent(activeArt.description)}`
                                                        );
                                                        const data = await res.json();
                                                        const translated = Array.isArray(data[0])
                                                            ? data[0].map((part) => part[0]).join(' ')
                                                            : activeArt.description;

                                                        setArtSelectedLang(lang.code);
                                                        setArtDescriptionTranslated(translated);
                                                        setArtLangOpen(false);
                                                    } catch (e) {
                                                        setArtLangError('Could not translate. Try again.');
                                                    } finally {
                                                        setArtLangLoading(false);
                                                    }
                                                }}
                                                style={{
                                                    width: '100%',
                                                    textAlign: 'left',
                                                    padding: '7px 9px',
                                                    borderRadius: '999px',
                                                    border: 'none',
                                                    background:
                                                        artSelectedLang === lang.code ? 'rgba(37,99,235,0.98)' : 'rgba(15,23,42,0.7)',
                                                    color: '#e5e7eb',
                                                    fontSize: '0.78rem',
                                                    letterSpacing: '0.02em',
                                                    cursor: 'pointer',
                                                    transition: 'background 0.15s ease, transform 0.1s ease'
                                                }}
                                            >
                                                {lang.label}
                                            </button>
                                        ))}

                                    {/* Free-form code option so any language is possible */}
                                    {artLangSearch.trim() && (
                                        <button
                                            type="button"
                                            disabled={artLangLoading}
                                            onClick={async () => {
                                                const code = artLangSearch.trim();
                                                if (!code) return;
                                                if (code.toLowerCase() === 'en' || code.toLowerCase() === 'english') {
                                                    setArtSelectedLang('en');
                                                    setArtDescriptionTranslated(null);
                                                    setArtLangOpen(false);
                                                    setArtLangSearch('');
                                                    setArtLangError('');
                                                    return;
                                                }
                                                try {
                                                    setArtLangLoading(true);
                                                    setArtLangError('');
                                                    const res = await fetch(
                                                        `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(
                                                            code
                                                        )}&dt=t&q=${encodeURIComponent(activeArt.description)}`
                                                    );
                                                    const data = await res.json();
                                                    const translated = Array.isArray(data[0])
                                                        ? data[0].map((part) => part[0]).join(' ')
                                                        : activeArt.description;
                                                    setArtSelectedLang(code);
                                                    setArtDescriptionTranslated(translated);
                                                    setArtLangOpen(false);
                                                    setArtLangSearch('');
                                                } catch (e) {
                                                    setArtLangError('Language not supported or code invalid.');
                                                } finally {
                                                    setArtLangLoading(false);
                                                }
                                            }}
                                            style={{
                                                gridColumn: '1 / -1',
                                                marginTop: '4px',
                                                width: '100%',
                                                textAlign: 'center',
                                                padding: '7px 9px',
                                                borderRadius: '10px',
                                                border: '1px dashed rgba(148,163,184,0.7)',
                                                background: 'transparent',
                                                color: '#e5e7eb',
                                                fontSize: '0.76rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Use "{artLangSearch.trim()}" language code
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Title + artist line below the slides */}
                    <div className="artist-name-art-center" style={{ marginTop: '1.5rem' }}>
                        <p className="specialization-badge">
                            Art by {artist.name}
                            {artist.specialization ? ` · ${artist.specialization}` : ''}
                        </p>
                        <div className="name-edit-row">
                            <h1 className="display-name">{activeArt.title || 'Untitled artwork'}</h1>
                        </div>
                    </div>

                    {/* About this artwork under title with translate control */}
                    {activeArt.description && (
                        <div className="content-section" style={{ marginTop: '1.25rem' }}>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    gap: '0.75rem'
                                }}
                            >
                                <h3 className="section-label" style={{ margin: 0 }}>
                                    ABOUT THIS ART
                                </h3>
                                <div>
                                    <button
                                        type="button"
                                        onClick={() => setArtLangOpen((o) => !o)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.35rem',
                                            padding: '6px 14px',
                                            borderRadius: '999px',
                                            border: '1px solid rgba(148, 163, 184, 0.55)',
                                            background: 'linear-gradient(135deg, rgba(15,23,42,0.9), rgba(15,23,42,0.6))',
                                            boxShadow: '0 10px 25px rgba(15,23,42,0.55)',
                                            color: '#e5e7eb',
                                            fontSize: '0.75rem',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <span style={{ fontSize: '1rem' }}>🌐</span>
                                        <span style={{ letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                                            Translate
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <p className="bio-text" style={{ marginTop: '0.6rem' }}>
                                {artDescriptionTranslated || activeArt.description}
                            </p>
                        </div>
                    )}

                    <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                        <button
                            type="button"
                            onClick={() => (window.location.href = window.location.pathname)}
                            style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                padding: '14px 28px',
                                background: '#111827',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '999px',
                                fontSize: '0.95rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                transition: 'transform 0.2s ease, background 0.2s ease',
                                fontFamily: 'system-ui, -apple-system, sans-serif'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.background = '#000000';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = '#111827';
                            }}
                        >
                            👤 Visit Artist Profile
                        </button>
                    </div>
                </div>

                {/* Fullscreen media preview when an art slide is tapped */}
                <ArtistFullscreenMediaPreviewModal
                    show={showPhotoModal}
                    onClose={() => {
                        setShowPhotoModal(false);
                        setSelectedImage(null);
                    }}
                    selectedImage={selectedImage}
                    artist={artist}
                    activeArt={activeArt}
                />
            </div>
        </div>
    );
};

export default ArtistProfileActiveArtView;

