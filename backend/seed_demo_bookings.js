const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Provider = require('./models/Provider');

dotenv.config();

const seedBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for dynamic seeding...');

        // Dynamically find the demo IDs from the database
        const demoProvider = await User.findOne({ email: 'provider@servicemate.com' });
        const demoCustomer = await User.findOne({ email: 'customer@servicemate.com' });

        if (!demoProvider || !demoCustomer) {
            console.error('Demo accounts not found! Run node seed_demo_accounts.js first.');
            process.exit(1);
        }

        const providerId = demoProvider._id;
        const customerId = demoCustomer._id;

        const bookings = [
            {
                customerId,
                providerId,
                serviceType: 'Emergency Pipe Repair',
                description: 'Kitchen sink pipe is leaking heavily. Need urgent repair.',
                scheduledAt: new Date(),
                address: '123, Brigade Road, Bangalore',
                location: { type: 'Point', coordinates: [77.6046, 12.9816] },
                price: 850,
                status: 'pending',
                timeline: [{ status: 'pending', timestamp: Date.now() }]
            },
            {
                customerId,
                providerId,
                serviceType: 'Tap Installation',
                description: 'New bathroom tap installation.',
                scheduledAt: new Date(Date.now() + 86400000), // Tomorrow
                address: '45, Indiranagar 100ft Road, Bangalore',
                location: { type: 'Point', coordinates: [77.6409, 12.9784] },
                price: 450,
                status: 'confirmed',
                otp: '1234',
                timeline: [
                    { status: 'pending', timestamp: Date.now() - 3600000 },
                    { status: 'confirmed', timestamp: Date.now() }
                ]
            },
            {
                customerId,
                providerId,
                serviceType: 'Main Line Cleaning',
                description: 'Periodic maintenance of sewage lines.',
                scheduledAt: new Date(Date.now() - 172800000), // 2 days ago
                address: '88, Koramangala 4th Block, Bangalore',
                location: { type: 'Point', coordinates: [77.6245, 12.9339] },
                price: 1200,
                status: 'completed',
                paymentStatus: 'paid',
                timeline: [
                    { status: 'pending', timestamp: Date.now() - 180000000 },
                    { status: 'confirmed', timestamp: Date.now() - 179000000 },
                    { status: 'ongoing', timestamp: Date.now() - 175000000 },
                    { status: 'completed', timestamp: Date.now() - 172800000 }
                ]
            }
        ];

        // Clear existing demo bookings for this provider to avoid duplicates
        await Booking.deleteMany({ providerId });
        console.log('Old demo bookings cleared.');

        await Booking.insertMany(bookings);
        console.log('Fresh Demo Bookings seeded for provider@servicemate.com!');

        // Update provider total jobs and rating for the demo
        await Provider.findOneAndUpdate(
            { userId: providerId },
            { totalJobs: 15, rating: 4.8, isApproved: true, isOnline: true }
        );

        console.log('Seeding Success!');
        process.exit();
    } catch (err) {
        console.error('Error during seeding:', err);
        process.exit(1);
    }
};

seedBookings();
