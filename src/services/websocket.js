import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.connected = false;
        this.listeners = new Map();
    }

    /**
     * Connect to WebSocket server
     * @param {string} token - Optional JWT token for admin authentication
     */
    connect(token = null) {
        if (this.socket?.connected) {
            console.log('🔌 Already connected to WebSocket');
            return this.socket;
        }

        const options = {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        };

        // Add authentication if token provided
        if (token) {
            options.auth = { token };
        }

        this.socket = io(SOCKET_URL, options);

        // Connection events
        this.socket.on('connect', () => {
            this.connected = true;
            console.log('✅ WebSocket connected:', this.socket.id);
        });

        this.socket.on('disconnect', (reason) => {
            this.connected = false;
            console.log('🔌 WebSocket disconnected:', reason);
        });

        this.socket.on('connect_error', (error) => {
            console.error('❌ WebSocket connection error:', error.message);
        });

        this.socket.on('admin:connected', (data) => {
            console.log('👤 Admin connected:', data.username);
        });

        return this.socket;
    }

    /**
     * Disconnect from WebSocket server
     */
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
            this.listeners.clear();
            console.log('🔌 WebSocket disconnected');
        }
    }

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    on(event, callback) {
        if (!this.socket) {
            console.warn('WebSocket not connected. Call connect() first.');
            return;
        }

        this.socket.on(event, callback);

        // Store listener for cleanup
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {function} callback - Callback function
     */
    off(event, callback) {
        if (!this.socket) return;

        this.socket.off(event, callback);

        // Remove from listeners map
        const callbacks = this.listeners.get(event);
        if (callbacks) {
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    }

    /**
     * Emit an event to server
     * @param {string} event - Event name
     * @param {*} data - Data to send
     */
    emit(event, data) {
        if (!this.socket) {
            console.warn('WebSocket not connected. Call connect() first.');
            return;
        }

        this.socket.emit(event, data);
    }

    /**
     * Check if connected
     * @returns {boolean}
     */
    isConnected() {
        return this.connected && this.socket?.connected;
    }

    // ==========================================
    // CONVENIENCE METHODS FOR COMMON EVENTS
    // ==========================================

    /**
     * Listen for student scan events
     * @param {function} callback - Callback(studentData)
     */
    onStudentScanned(callback) {
        this.on('student:scanned', callback);
    }

    /**
     * Listen for student added events
     * @param {function} callback - Callback(student)
     */
    onStudentAdded(callback) {
        this.on('student:added', callback);
    }

    /**
     * Listen for student updated events
     * @param {function} callback - Callback(student)
     */
    onStudentUpdated(callback) {
        this.on('student:updated', callback);
    }

    /**
     * Listen for student deleted events
     * @param {function} callback - Callback({studentId})
     */
    onStudentDeleted(callback) {
        this.on('student:deleted', callback);
    }

    /**
     * Listen for student status changed events
     * @param {function} callback - Callback({studentId, isActive})
     */
    onStudentStatusChanged(callback) {
        this.on('student:status-changed', callback);
    }

    /**
     * Listen for school added events
     * @param {function} callback - Callback(school)
     */
    onSchoolAdded(callback) {
        this.on('school:added', callback);
    }

    /**
     * Listen for school updated events
     * @param {function} callback - Callback(school)
     */
    onSchoolUpdated(callback) {
        this.on('school:updated', callback);
    }

    /**
     * Notify server of student scan
     * @param {object} studentData - Student data
     */
    notifyStudentScan(studentData) {
        this.emit('student:scan', studentData);
    }

    /**
     * Notify server of student addition (admin only)
     * @param {object} student - Student object
     */
    notifyStudentAdded(student) {
        this.emit('admin:student-added', student);
    }

    /**
     * Notify server of student update (admin only)
     * @param {object} student - Student object
     */
    notifyStudentUpdated(student) {
        this.emit('admin:student-updated', student);
    }

    /**
     * Notify server of student deletion (admin only)
     * @param {string} studentId - Student ID
     */
    notifyStudentDeleted(studentId) {
        this.emit('admin:student-deleted', studentId);
    }

    /**
     * Notify server of student status toggle (admin only)
     * @param {object} data - {studentId, isActive}
     */
    notifyStudentStatusToggled(data) {
        this.emit('admin:student-status-toggled', data);
    }

    /**
     * Notify server of school addition (admin only)
     * @param {object} school - School object
     */
    notifySchoolAdded(school) {
        this.emit('admin:school-added', school);
    }

    /**
     * Notify server of school update (admin only)
     * @param {object} school - School object
     */
    notifySchoolUpdated(school) {
        this.emit('admin:school-updated', school);
    }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;
