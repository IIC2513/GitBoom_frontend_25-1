import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const socket = io(API_BASE, {
  withCredentials: true,
  transports: ['websocket'], // Opcional pero recomendable
});

export default socket;
