import { io } from 'socket.io-client';
import Cookies from 'js-cookie';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

class SocketService {
    socket = null;

    connect() {
        const token = Cookies.get('token');
        if (!token) return;

        if (this.socket?.connected) return;

        this.socket = io(SOCKET_URL, {
            auth: { token },
            transports: ['websocket'],
        });

        this.socket.on('connect', () => {
            console.log('Connected to WebSocket');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from WebSocket');
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    on(event, callback) {
        if (!this.socket) this.connect();
        this.socket?.on(event, callback);
    }

    off(event, callback) {
        this.socket?.off(event, callback);
    }
}

const socketService = new SocketService();
export default socketService;
