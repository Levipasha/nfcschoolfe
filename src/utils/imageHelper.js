const CLOUDINARY_CLOUD = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '';
const CLOUDINARY_BASE = CLOUDINARY_CLOUD
    ? `https://res.cloudinary.com/${CLOUDINARY_CLOUD}`
    : '';

/**
 * Helper to ensure image URLs are valid and using live placeholder services.
 * Especially fixes dead domains like via.placeholder.com
 */
export const fixImageUrl = (url) => {
    if (!url) return 'https://placehold.co/400x400/6366F1/FFFFFF?text=No+Image';

    // Replace dead via.placeholder.com with placehold.co
    if (url.includes('via.placeholder.com')) {
        return url.replace('via.placeholder.com', 'placehold.co');
    }

    // Cloudinary: already full URL
    if (url.startsWith('https://res.cloudinary.com/')) {
        return url;
    }
    // Cloudinary: path or public_id (e.g. "image/upload/v123/..." or "folder/public_id")
    if (CLOUDINARY_BASE && !url.startsWith('/') && !url.startsWith('http')) {
        const path = url.startsWith('image/') ? url : `image/upload/${url}`;
        return `${CLOUDINARY_BASE}/${path}`;
    }

    // Handle local uploads
    if (url.startsWith('/uploads/')) {
        if (import.meta.env.VITE_API_URL) {
            return `${import.meta.env.VITE_API_URL}${url}`;
        }

        const backendPort = 5000;
        const hostname = window.location.hostname;

        // If we're on localhost but the current port isn't 5000 (e.g. 5173),
        // we must point to the backend port 5000
        if ((hostname === 'localhost' || hostname === '127.0.0.1') && window.location.port !== backendPort.toString()) {
            return `${window.location.protocol}//${hostname}:${backendPort}${url}`;
        }

        // For local network testing (IP address hostname), always point to backend port 5000
        // unless we are already on that port
        if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname) && window.location.port !== backendPort.toString()) {
            return `${window.location.protocol}//${hostname}:${backendPort}${url}`;
        }

        return url;
    }

    return url;
};
