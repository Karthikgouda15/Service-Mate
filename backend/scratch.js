const mongoose = require('mongoose');
const Booking = require('./models/Booking');

mongoose.connect('mongodb://localhost:27017/servicemate').then(async () => {
    try {
        const ioClient = require('socket.io-client');
        console.log("Connected to DB.");

        const latestBooking = await Booking.findOne().sort({createdAt: -1});
        console.log("Latest Booking:", latestBooking);
        
    } catch(e) {
        console.error(e);
    }
    process.exit(0);
});
