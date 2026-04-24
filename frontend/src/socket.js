import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'https://service-mate-8q0p.onrender.com';

const socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
});

export default socket;
