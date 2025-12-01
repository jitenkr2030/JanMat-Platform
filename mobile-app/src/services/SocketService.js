/**
 * Socket Service for JanMat Mobile App
 * Handles real-time communication with the backend
 */

import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
  }

  initialize() {
    this.baseURL = __DEV__ 
      ? 'http://localhost:5000'
      : 'https://your-production-api.com';

    this.connect();
  }

  connect() {
    if (this.socket && this.isConnected) {
      return;
    }

    console.log('🔌 Connecting to Socket.IO server...');

    this.socket = io(this.baseURL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      reconnectionDelayMax: this.reconnectDelay * 2,
      maxHttpBufferSize: 1e6,
      pingTimeout: 60000,
      pingInterval: 25000
    });

    this.setupEventListeners();
  }

  setupEventListeners() {
    // Connection events
    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connection-established', { connectedAt: new Date() });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.emit('connection-lost', { reason, disconnectedAt: new Date() });
    });

    this.socket.on('connect_error', (error) => {
      console.error('🚫 Socket connection error:', error.message);
      this.reconnectAttempts++;
      
      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        this.emit('max-reconnect-attempts-reached');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('🔄 Socket reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      this.emit('reconnected', { attemptNumber });
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('🚫 Socket reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('🚫 Socket reconnection failed');
      this.emit('reconnection-failed');
    });

    // Poll-related events
    this.socket.on('new-poll', (data) => {
      console.log('📊 New poll received:', data.title);
      this.emit('new-poll', data);
    });

    this.socket.on('poll-updated', (data) => {
      console.log('📊 Poll updated:', data.pollId);
      this.emit('poll-updated', data);
    });

    this.socket.on('poll-deleted', (data) => {
      console.log('📊 Poll deleted:', data.pollId);
      this.emit('poll-deleted', data);
    });

    this.socket.on('new-vote', (data) => {
      console.log('🗳️ New vote received for poll:', data.pollId);
      this.emit('new-vote', data);
    });

    this.socket.on('vote-updated', (data) => {
      console.log('🗳️ Vote updated for poll:', data.pollId);
      this.emit('vote-updated', data);
    });

    this.socket.on('vote-deleted', (data) => {
      console.log('🗳️ Vote deleted for poll:', data.pollId);
      this.emit('vote-deleted', data);
    });

    // Petition-related events
    this.socket.on('new-petition', (data) => {
      console.log('📝 New petition received:', data.title);
      this.emit('new-petition', data);
    });

    this.socket.on('petition-signed', (data) => {
      console.log('✍️ Petition signed:', data.petitionId);
      this.emit('petition-signed', data);
    });

    this.socket.on('petition-updated', (data) => {
      console.log('📝 Petition updated:', data.petitionId);
      this.emit('petition-updated', data);
    });

    this.socket.on('urgent-petition', (data) => {
      console.log('🚨 Urgent petition received:', data.title);
      this.emit('urgent-petition', data);
    });

    // System events
    this.socket.on('system-notification', (data) => {
      console.log('🔔 System notification:', data.message);
      this.emit('system-notification', data);
    });

    this.socket.on('maintenance-notice', (data) => {
      console.log('🔧 Maintenance notice:', data.message);
      this.emit('maintenance-notice', data);
    });

    // Error events
    this.socket.on('error', (error) => {
      console.error('🚫 Socket error:', error);
      this.emit('socket-error', error);
    });
  }

  // Socket method wrappers
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket && this.isConnected) {
      this.socket.emit(event, data);
    } else {
      console.warn('Socket not connected, cannot emit:', event);
    }
  }

  // Room management
  joinPollRoom(pollId) {
    this.emit('join-poll-room', pollId);
  }

  leavePollRoom(pollId) {
    this.emit('leave-poll-room', pollId);
  }

  joinUserRoom(userId) {
    this.emit('join-user-room', userId);
  }

  leaveUserRoom(userId) {
    this.emit('leave-user-room', userId);
  }

  joinLocationRoom(state, city) {
    this.emit('join-location-room', { state, city });
  }

  leaveLocationRoom(state, city) {
    this.emit('leave-location-room', { state, city });
  }

  // Poll-specific events
  subscribeToPoll(pollId) {
    this.joinPollRoom(pollId);
  }

  unsubscribeFromPoll(pollId) {
    this.leavePollRoom(pollId);
  }

  watchPollResults(pollId) {
    this.emit('watch-poll-results', pollId);
  }

  unwatchPollResults(pollId) {
    this.emit('unwatch-poll-results', pollId);
  }

  // Petition-specific events
  subscribeToPetition(petitionId) {
    this.emit('join-petition-room', petitionId);
  }

  unsubscribeFromPetition(petitionId) {
    this.emit('leave-petition-room', petitionId);
  }

  watchPetitionUpdates(petitionId) {
    this.emit('watch-petition-updates', petitionId);
  }

  unwatchPetitionUpdates(petitionId) {
    this.emit('unwatch-petition-updates', petitionId);
  }

  // Utility methods
  isSocketConnected() {
    return this.isConnected && this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket?.id;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  reconnect() {
    console.log('🔄 Manually reconnecting socket...');
    this.disconnect();
    setTimeout(() => {
      this.connect();
    }, 1000);
  }

  // Heartbeat/ping mechanism
  startHeartbeat(interval = 30000) {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.emit('ping', { timestamp: Date.now() });
      }
    }, interval);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Event listener management
  addConnectionListener(callback) {
    this.on('connect', callback);
  }

  removeConnectionListener(callback) {
    this.off('connect', callback);
  }

  addDisconnectionListener(callback) {
    this.on('disconnect', callback);
  }

  removeDisconnectionListener(callback) {
    this.off('disconnect', callback);
  }

  addReconnectionListener(callback) {
    this.on('reconnect', callback);
  }

  removeReconnectionListener(callback) {
    this.off('reconnect', callback);
  }

  // Cleanup method
  cleanup() {
    this.stopHeartbeat();
    this.disconnect();
  }
}

// Create singleton instance
const socketService = new SocketService();

// Export both the class and instance
export { SocketService };
export default socketService;