import io, { Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

class SocketService {
  private socket: Socket | null = null;

  connect(): Socket {
    if (!this.socket || !this.socket.connected) {
      this.socket = io(SOCKET_URL, {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('✅ Admin Connected to WebSocket');
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Admin Disconnected from WebSocket');
      });

      this.socket.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    }

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket {
    if (!this.socket) {
      return this.connect();
    }
    return this.socket;
  }

  // Event listeners for admin
  onGameStateChanged(callback: (state: any) => void) {
    this.getSocket().on('gameStateChanged', callback);
  }

  onAdminGameState(callback: (data: any) => void) {
    this.getSocket().on('adminGameState', callback);
  }

  onGameReset(callback: () => void) {
    this.getSocket().on('gameReset', callback);
  }

  onResultsReady(callback: (results: any) => void) {
    this.getSocket().on('resultsReady', callback);
  }

  onError(callback: (error: any) => void) {
    this.getSocket().on('error', callback);
  }

  // Event emitters for admin
  adminConnected() {
    this.getSocket().emit('adminConnected');
  }

  startGame() {
    this.getSocket().emit('startGame');
  }

  resetGame() {
    this.getSocket().emit('resetGame');
  }

  getResults() {
    this.getSocket().emit('getResults');
  }

  // Clean up specific listeners
  removeListener(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export default new SocketService();
