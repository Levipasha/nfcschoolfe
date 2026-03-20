import React from 'react';
import { fixImageUrl } from '../../utils/imageHelper';

export default function ArtistArtGalleryPopup({
  show,
  artist,
  artGallerySelected,
  onCloseGallery,
  onSelectArtItem,
  onCloseLightbox
}) {
  if (!show || !artist?.artLinks) return null;

  const artItems = Array.isArray(artist.artLinks)
    ? artist.artLinks
    : Object.values(artist.artLinks);

  return (
    <div className="art-popup-overlay" onClick={onCloseGallery}>
      <div className="art-popup-modal" onClick={(e) => e.stopPropagation()}>
        <div className="art-popup-header">
          <h2>Art Collection</h2>
          <span className="art-popup-count">{artItems.length} pieces</span>
          <button className="art-popup-close" onClick={onCloseGallery} type="button">
            ✕
          </button>
        </div>

        <div className="art-popup-scroll">
          <div className="art-popup-grid">
            {artItems.map((item) => {
              const img = item.images && item.images[0] ? fixImageUrl(item.images[0]) : null;

              return (
                <div
                  key={item.id}
                  className="art-popup-card"
                  onClick={() => onSelectArtItem(item)}
                >
                  {img ? (
                    <img src={img} alt={item.title} className="art-popup-card-img" loading="lazy" />
                  ) : (
                    <div className="art-popup-card-empty">🎨</div>
                  )}

                  <div className="art-popup-card-info">
                    <h4>{item.title || 'Untitled'}</h4>
                    {item.description && <p>{item.description}</p>}
                    <span className="art-popup-card-tag">{item.theme || 'art'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {artGallerySelected && (
        <div
          className="art-lightbox-overlay"
          onClick={(e) => {
            e.stopPropagation();
            onCloseLightbox();
          }}
        >
          <div className="art-lightbox-modal" onClick={(e) => e.stopPropagation()}>
            <button className="art-lightbox-close-btn" onClick={onCloseLightbox} type="button">
              ✕
            </button>

            <div className="art-lightbox-images">
              {(artGallerySelected.images || []).map((imgUrl, i) => (
                <img
                  key={i}
                  src={fixImageUrl(imgUrl)}
                  alt={`${artGallerySelected.title} ${i + 1}`}
                  className="art-lightbox-image"
                />
              ))}
            </div>

            <div className="art-lightbox-details">
              <h3>{artGallerySelected.title}</h3>
              {artGallerySelected.description && <p>{artGallerySelected.description}</p>}
              <span className="art-lightbox-tag">{artGallerySelected.theme || 'art'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

