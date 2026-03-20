import React from 'react';
import { fixImageUrl } from '../../utils/imageHelper';

const isVideoUrl = (url) => {
  if (!url || typeof url !== 'string') return false;
  return /\.(mp4|webm|ogg|mov|m4v)(\?|$)/i.test(url) || /\/video\/upload\//i.test(url) || url.includes('/video/');
};

export default function ArtistFullscreenMediaPreviewModal({
  show,
  onClose,
  selectedImage,
  artist,
  activeArt
}) {
  if (!show) return null;

  const video = isVideoUrl(selectedImage);
  const titleForAlt = activeArt?.title || artist?.name || 'Artist';
  const imgSrc = fixImageUrl(selectedImage || artist?.photo);

  return (
    <div
      className="photo-modal-overlay"
      onClick={onClose}
    >
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
            <img
              src={imgSrc}
              alt={titleForAlt}
              className="artist-preview-card-img"
            />
          )}
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

