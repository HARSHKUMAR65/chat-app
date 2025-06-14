
import { io } from 'socket.io-client';

const SOCKET_URL = 'https://assignment-backend-uy3h.onrender.com/';
const socket = io(SOCKET_URL, {
  transports: ['websocket'],
  withCredentials: true,
  autoConnect: false,
});

export default socket;
