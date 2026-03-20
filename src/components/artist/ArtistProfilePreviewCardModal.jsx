import React from 'react';
import { fixImageUrl } from '../../utils/imageHelper';

const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url) || url.includes('/video/');
};

export default function ArtistProfilePreviewCardModal({
  show,
  onClose,
  selectedImage,
  artist
}) {
  if (!show || !artist) return null;

  const title = artist.name || 'Artist';
  const specializationOrBio = artist.specialization || artist.bio?.slice(0, 60) || 'Creative Professional';
  const needsEllipsis = artist.bio && artist.bio.length > 60;

  const video = isVideoUrl(selectedImage);
  const imgSrc = fixImageUrl(selectedImage || artist.photo);

  return (
    <div className="photo-modal-overlay" onClick={onClose}>
      <div className="artist-preview-card" onClick={(e) => e.stopPropagation()}>
        <div className="artist-preview-card-image-wrap">
          {video ? (
            <video
              src={fixImageUrl(selectedImage)}
              className="artist-preview-card-img"
              autoPlay
              loop
              muted
              playsInline
              controls
            />
          ) : (
            <img src={imgSrc} alt={title} className="artist-preview-card-img" />
          )}

          <div className="artist-preview-card-overlay">
            <h2 className="artist-preview-card-name">
              {title}
              <span className="artist-preview-card-verified" aria-label="Verified">✓</span>
            </h2>

            <p className="artist-preview-card-bio">
              {specializationOrBio}
              {needsEllipsis ? '...' : ''}
            </p>

            <div className="artist-preview-card-meta">
              <span className="artist-preview-card-stat">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                {artist.scanCount ?? 0} views
              </span>

              <button type="button" className="artist-preview-card-close" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          className="artist-preview-card-close-btn"
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
      </div>
    </div>
  );
}

