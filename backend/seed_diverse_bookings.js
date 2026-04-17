const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Booking = require('./models/Booking');

dotenv.config();

const providerUserId = '69dc907708f50d2a2f461212'; // provider@servicemate.com

const newCustomers = [
    { name: 'Anjali Sharma', email: 'anjali@example.com', phone: '98765432' + Math.floor(Math.random() * 90 + 10), password: 'customer123', role: 'customer' },
    { name: 'Rohan Mehra', email: 'rohan@example.com', phone: '98765433' + Math.floor(Math.random() * 90 + 10), password: 'customer123', role: 'customer' },
    { name: 'Sarah Joseph', email: 'sarah@example.com', phone: '98765434' + Math.floor(Math.random() * 90 + 10), password: 'customer123', role: 'customer' },
    { name: 'Priya Das', email: 'priya@example.com', phone: '98765435' + Math.floor(Math.random() * 90 + 10), password: 'customer123', role: 'customer' },
    { name: 'Vikram Singh', email: 'vikram@example.com', phone: '98765436' + Math.floor(Math.random() * 90 + 10), password: 'customer123', role: 'customer' }
];

const seedDiverse = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        for (const c of newCustomers) {
            let user = await User.findOne({ email: c.email });
            if (!user) {
                user = await User.create(c);
            }
            
            // Create a booking for this customer for our Demo Provider
            await Booking.create({
                customerId: user._id,
                providerId: providerUserId,
                serviceType: ['Kitchen Repair', 'Toilet Fixing', 'Pipe Installation', 'Water Filter Service', 'Deep Cleaning'][Math.floor(Math.random() * 5)],
                description: 'Urgent service required for my residence.',
                scheduledAt: new Date(Date.now() + Math.random() * 400000000),
                address: 'Bangalore, India',
                location: { type: 'Point', coordinates: [77.5946, 12.9716] },
                price: Math.floor(Math.random() * 1000) + 300,
                status: 'pending',
                timeline: [{ status: 'pending', timestamp: Date.now() }]
            });
            console.log(`Created booking for ${c.name}`);
        }

        console.log('Diverse bookings seeded successfully!');
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

seedDiverse();
