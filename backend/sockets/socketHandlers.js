const Message = require('../models/Message');
const Provider = require('../models/Provider');

module.exports = (io) => {
    // Map to store connected provider locations for discovery
    // { providerId: { userId, lat, lng, name, category, avatar } }
    const onlineProviders = new Map();

    // Basic simulation for moving cars in specific nearby area (Bangalore as base)
    // We still keep this for "demo" providers, but prioritize real ones
    const baseLat = 12.9716;
    const baseLng = 77.5946;

    const generateDummyProviders = () => {
        return Array.from({ length: 5 }).map((_, i) => ({
            id: `sim_${i}`,
            userId: { name: `Expert ${i + 1}`, avatar: null },
            lat: baseLat + (Math.random() - 0.5) * 0.04,
            lng: baseLng + (Math.random() - 0.5) * 0.04,
            category: ['Plumbing', 'Electrical', 'Cleaning'][i % 3],
            isSimulated: true
        }));
    };

    let simulatedProviders = generateDummyProviders();

    // Broadcast all online providers (real + sim) every 3 seconds
    setInterval(() => {
        // Move simulated ones slightly
        simulatedProviders = simulatedProviders.map(p => ({
            ...p,
            lat: p.lat + (Math.random() - 0.5) * 0.0005,
            lng: p.lng + (Math.random() - 0.5) * 0.0005
        }));

        const realProviders = Array.from(onlineProviders.values());
        const allProviders = [...realProviders, ...simulatedProviders];

        io.to('discovery_hub').emit('discovery_location_update', allProviders);
    }, 3000);

    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);

        socket.on('join_discovery', () => {
            socket.join('discovery_hub');
            const all = [...Array.from(onlineProviders.values()), ...simulatedProviders];
            socket.emit('discovery_location_update', all);
        });

        socket.on('leave_discovery', () => {
             socket.leave('discovery_hub');
        });

        // Provider announces they are online and sharing location
        socket.on('provider_go_online', (data) => {
            const { providerId, userId, name, category, avatar, lat, lng } = data;
            onlineProviders.set(providerId, { providerId, userId, name, category, avatar, lat, lng });
            console.log(`Provider ${name} is now online and discoverable`);
        });

        socket.on('provider_update_discovery_location', (data) => {
            const { providerId, lat, lng } = data;
            if (onlineProviders.has(providerId)) {
                const prev = onlineProviders.get(providerId);
                onlineProviders.set(providerId, { ...prev, lat, lng });
            }
        });

        socket.on('provider_go_offline', (providerId) => {
            onlineProviders.delete(providerId);
        });

        // Join a provider's personal room for new booking alerts
        socket.on('join_provider_room', (providerUserId) => {
            socket.join(`provider_${providerUserId}`);
        });

        // Join a specific booking room for real-time tracking
        socket.on('join_booking', (bookingId) => {
            socket.join(`booking_${bookingId}`);
        });

        // --- Chat Events ---
        socket.on('join_chat', (bookingId) => {
            socket.join(`chat_${bookingId}`);
            console.log(`User joined chat room: chat_${bookingId}`);
        });

        socket.on('send_message', async (data) => {
            const { bookingId, senderId, content } = data;
            try {
                const newMessage = await Message.create({
                    bookingId,
                    sender: senderId,
                    content
                });
                const populated = await newMessage.populate('sender', 'name avatar');
                
                // Broadcast to everyone in the chat room
                io.to(`chat_${bookingId}`).emit('receive_message', populated);
                
                // Also notify the other party if they aren't in the chat room (global notification)
                io.to(`booking_${bookingId}`).emit('new_message_alert', { bookingId, content });
            } catch (err) {
                console.error('Chat error:', err);
            }
        });

        // --- Tracking Events ---
        socket.on('location_update', (data) => {
            const { bookingId, lat, lng } = data;
            io.to(`booking_${bookingId}`).emit('provider_location', { lat, lng });
        });

        socket.on('status_change', (data) => {
            const { bookingId, status } = data;
            io.to(`booking_${bookingId}`).emit('booking_status_updated', { status });
        });

        socket.on('disconnect', () => {
            console.log('Client disconnected:', socket.id);
            // Optional: Remove provider from onlineProviders if they disconnect
            // But better to rely on explicit 'go_offline' for persistence
        });
    });
};
