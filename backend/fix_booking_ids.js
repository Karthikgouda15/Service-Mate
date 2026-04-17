const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Booking = require('./models/Booking');
const Provider = require('./models/Provider');

dotenv.config();

const fixBookings = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB to repair IDs...');

        const bookings = await Booking.find({});
        let fixCount = 0;

        for (const booking of bookings) {
            // Check if the providerId in the booking is actually a Provider Profile ID
            // instead of a User Account ID
            const providerProfile = await Provider.findById(booking.providerId);
            
            if (providerProfile) {
                console.log(`Found mismatched booking ${booking._id}. Converting Provider Profile ID to User Account ID...`);
                booking.providerId = providerProfile.userId;
                await booking.save();
                fixCount++;
            }
        }

        console.log(`Repair complete. Fixed ${fixCount} bookings.`);
        process.exit();
    } catch (err) {
        console.error('Repair error:', err);
        process.exit(1);
    }
};

fixBookings();
