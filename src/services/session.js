import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class SessionService {
    constructor() {
        this.sessionId = null;
        this.startTime = null;
        this.lastActivityTime = null;
        this.heartbeatInterval = null;
    }

    /**
     * Start a new session (called when student profile loads)
     * @param {string} sessionId - Session ID from backend response
     */
    startSession(sessionId) {
        if (this.sessionId) {
            console.warn('Session already active, ending previous session');
            this.endSession();
        }

        this.sessionId = sessionId;
        this.startTime = Date.now();
        this.lastActivityTime = Date.now();

        // Start heartbeat to track session duration
        this.startHeartbeat();

        // Track page visibility
        this.setupVisibilityTracking();

        // Track beforeunload
        this.setupUnloadTracking();

        console.log('✅ Session started:', sessionId);
    }

    /**
     * Start heartbeat to keep session alive
     */
    startHeartbeat() {
        // Send activity ping every 30 seconds
        this.heartbeatInterval = setInterval(() => {
            this.recordActivity();
        }, 30000); // 30 seconds
    }

    /**
     * Stop heartbeat
     */
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }

    /**
     * Record an action in the session
     * @param {string} action - Action type (view, call, share, download, print)
     * @param {string} details - Optional details about the action
     */
    async recordAction(action, details = null) {
        if (!this.sessionId) {
            console.warn('No active session');
            return;
        }

        try {
            await axios.post(`${API_URL}/student/session/${this.sessionId}/action`, {
                action,
                details
            });

            this.lastActivityTime = Date.now();
            console.log(`📊 Action recorded: ${action}`);
        } catch (error) {
            console.error('Error recording action:', error);
        }
    }

    /**
     * Record activity (internal method for heartbeat)
     */
    async recordActivity() {
        if (!this.sessionId) return;

        const timeSinceLastActivity = Date.now() - this.lastActivityTime;

        // If inactive for more than 5 minutes, end session
        if (timeSinceLastActivity > 5 * 60 * 1000) {
            console.log('Session inactive for 5 minutes, ending...');
            await this.endSession();
            return;
        }

        // Otherwise, extend session
        await this.recordAction('view', 'Page active');
    }

    /**
     * End the current session
     */
    async endSession() {
        if (!this.sessionId) {
            return;
        }

        this.stopHeartbeat();

        try {
            await axios.post(`${API_URL}/student/session/${this.sessionId}/end`);
            console.log('✅ Session ended:', this.sessionId);
        } catch (error) {
            console.error('Error ending session:', error);
        }

        this.sessionId = null;
        this.startTime = null;
        this.lastActivityTime = null;
    }

    /**
     * Setup page visibility tracking
     */
    setupVisibilityTracking() {
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('Page hidden');
                this.stopHeartbeat();
            } else {
                console.log('Page visible');
                this.startHeartbeat();
                this.recordAction('view', 'Page became visible');
            }
        });
    }

    /**
     * Setup unload tracking
     */
    setupUnloadTracking() {
        window.addEventListener('beforeunload', () => {
            // Use sendBeacon for reliable tracking on page unload
            if (this.sessionId) {
                navigator.sendBeacon(
                    `${API_URL}/student/session/${this.sessionId}/end`,
                    JSON.stringify({})
                );
            }
        });
    }

    /**
     * Track phone call action
     */
    async trackCall(phoneNumber) {
        await this.recordAction('call', `Called ${phoneNumber}`);
    }

    /**
     * Track share action
     */
    async trackShare() {
        await this.recordAction('share', 'Profile shared');
    }

    /**
     * Track download action
     */
    async trackDownload(itemName) {
        await this.recordAction('download', `Downloaded ${itemName}`);
    }

    /**
     * Track print action
     */
    async trackPrint() {
        await this.recordAction('print', 'Profile printed');
    }

    /**
     * Get session duration in seconds
     */
    getSessionDuration() {
        if (!this.startTime) return 0;
        return Math.floor((Date.now() - this.startTime) / 1000);
    }

    /**
     * Get current session ID
     */
    getSessionId() {
        return this.sessionId;
    }

    /**
     * Check if session is active
     */
    isActive() {
        return this.sessionId !== null;
    }
}

// Export singleton instance
const sessionService = new SessionService();
export default sessionService;
