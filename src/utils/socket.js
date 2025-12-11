import io from 'socket.io-client';



/**
 * Create a Socket.IO connection through the gateway
 * @param {string} gatewayUrl - Gateway URL (e.g., 'http://localhost:3000')
 * @param {string} token - JWT authentication token
 * @param {object} options - Additional Socket.IO options
 * @returns {object} Socket.IO client instance
 */
export const createSocketConnection = (gatewayUrl, token, options = {}) => {
    // console.log(token); 
    const defaultOptions = {
        path: '/socket.io',
        auth: {
            token: token,
        },
        extraHeaders: {
            Authorization: `Bearer ${token}`
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5,
        transports: ['websocket'],
        ...options,
    };

    const socket = io(gatewayUrl, defaultOptions);

    // Connection event handlers
    socket.on('connect', () => {
        console.log('✅ Connected to WebSocket service');
    });

    socket.on('disconnect', (reason) => {
        console.log('❌ Disconnected from WebSocket service:', reason);
    });

    socket.on('error', (error) => {
        console.error('⚠️ WebSocket error:', error);
    });

    socket.on('connect_error', (error) => {
        console.error('⚠️ Connection error:', error);
    });

    return socket;
};

/**
 * Join one or more rooms
 * @param {object} socket - Socket.IO client instance
 * @param {string|array} rooms - Room name(s) to join
 */
export const joinRooms = (socket, rooms) => {
    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    socket.emit('join', roomList);
};

/**
 * Leave one or more rooms
 * @param {object} socket - Socket.IO client instance
 * @param {string|array} rooms - Room name(s) to leave
 */
export const leaveRooms = (socket, rooms) => {
    const roomList = Array.isArray(rooms) ? rooms : [rooms];
    socket.emit('leave', roomList);
};

/**
 * Subscribe to user-specific events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 * @param {function} callback - Callback for events
 */
export const subscribeToUserEvents = (socket, userId, callback) => {
    const userRoom = `user:${userId}`;
    joinRooms(socket, userRoom);

    // Listen to all user events
    socket.on('user.registered', callback);
    socket.on('user.login', callback);
    socket.on('user.logout', callback);
    socket.on('user.updated', callback);
};

/**
 * Subscribe to notification events
 * @param {object} socket - Socket.IO client instance
 * @param {string} userId - User ID
 * @param {function} callback - Callback for notifications
 */
export const subscribeToNotifications = (socket, userId, callback) => {
    const userRoom = `user:${userId}`;
    joinRooms(socket, userRoom);

    socket.on('notification', callback);
    socket.on('notification.read', callback);
    socket.on('notification.deleted', callback);

    // Chat/Group events
    socket.on('group.created', (data) => {
        callback({
            id: Date.now(),
            title: 'New Group',
            message: `You were added to group "${data.name}"`,
            type: 'group',
            ...data
        });
    });

    socket.on('group.membersAdded', (data) => {
        callback({
            id: Date.now(),
            title: 'Group Update',
            message: `New members added to group`,
            type: 'group',
            ...data
        });
    });

    socket.on('group.membersRemoved', (data) => {
        callback({
            id: Date.now(),
            title: 'Group Update',
            message: `Members removed from group`,
            type: 'group',
            ...data
        });
    });

    // Assuming a generic message event exists or will be implemented
    socket.on('message.new', (data) => {
        callback({
            id: data.id || Date.now(),
            title: `New Message from ${data.senderName || 'User'}`,
            message: data.content || 'You have a new message',
            type: 'message',
            ...data
        });
    });
};

/**
 * Subscribe to room events
 * @param {object} socket - Socket.IO client instance
 * @param {string} roomName - Room name
 * @param {function} callback - Callback for room events
 */
export const subscribeToRoom = (socket, roomName, callback) => {
    joinRooms(socket, roomName);
    socket.on(roomName, callback);
};

/**
 * Emit custom event
 * @param {object} socket - Socket.IO client instance
 * @param {string} eventName - Event name
 * @param {object} data - Event data
 */
export const emitEvent = (socket, eventName, data) => {
    socket.emit(eventName, data);
};

/**
 * Disconnect socket
 * @param {object} socket - Socket.IO client instance
 */
export const disconnect = (socket) => {
    if (socket && socket.connected) {
        socket.disconnect();
    }
};
