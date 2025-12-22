import io from 'socket.io-client';

class WebSocketService {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.userId = null;
        this.listeners = new Map();
    }

    /**
     * Connect to the WebSocket Server
     * @param {string} token - JWT Token
     * @param {string} userId - User's MongoDB ID
     */
    connect(token, userId) {
        if (this.socket && this.isConnected && this.userId === userId) {
            console.log('[WebSocket] 🟡 Already connected as', userId);
            return this.socket;
        }

        // If reconnecting with different user, disconnect first
        if (this.socket && this.userId !== userId) {
            console.log('[WebSocket] 🔄 Reconnecting with different user');
            this.disconnect();
        }

        this.userId = userId;

        const gatewayUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL_SW || 'http://localhost:9002';
        // Clean URL to prevent namespace errors if path is included
        const cleanUrl = gatewayUrl.replace(/\/$/, '').replace(/\/api$/, '');

        console.log(`[WebSocket] 🔌 Connecting to ${cleanUrl}...`);

        this.socket = io(cleanUrl, {
            path: '/socket.io',
            auth: {
                token: token,
                userId: userId,
            },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 10,
            extraHeaders: {
                "ngrok-skip-browser-warning": "true"
            }
        });

        this.socket.on('connect', () => {
            this.isConnected = true;
            console.log(`[WebSocket] 🟢 Connected! ID: ${this.socket.id}`);
            console.log(`[WebSocket] 🟢 Joining room(s): user:${userId}`);
        });

        this.socket.on('disconnect', (reason) => {
            this.isConnected = false;
            console.log(`[WebSocket] 🔴 Disconnected: ${reason}`);
        });

        this.socket.on('connect_error', (err) => {
            console.error('[WebSocket] ⚠️ Connection Error:', err.message);
        });

        // Listen for notification events
        this.socket.on('notification', (data) => {
            console.log('[WebSocket] 🔔 New Notification Received:', data);
            this._emit('notification', data);
        });
    }

    /**
   * Disconnect from the WebSocket Server
   */
    disconnect() {
        if (this.socket && this.isConnected) {
            console.log(`[WebSocket] 🔴 Disconnecting from room: user:${this.userId}`);
            this.socket.disconnect();
            this.isConnected = false;
        }
        this.socket = null;
        this.userId = null;
    }

    /**
     * Subscribe to internal event listeners
     * @param {string} event - 'notification' etc.
     * @param {function} callback 
     */
    subscribe(event, callback) {
        console.log(`[WebSocket] 🎧 Subscribing to internal event: ${event}`);
        if (!this.listeners.has(event)) {
            this.listeners.set(event, new Set());
        }
        this.listeners.get(event).add(callback);
    }

    /**
     * Unsubscribe from internal event listeners
     * @param {string} event 
     * @param {function} callback 
     */
    unsubscribe(event, callback) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).delete(callback);
        }
    }

    // Internal emitter
    _emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(cb => cb(data));
        }
    }
}

// Singleton instance
const webSocketService = new WebSocketService();
export default webSocketService;
