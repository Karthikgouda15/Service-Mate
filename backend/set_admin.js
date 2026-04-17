const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const email = process.argv[2];

if (!email) {
    console.log('Please provide an email address: node set_admin.js user@example.com');
    process.exit(1);
}

const setAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB...');

        const user = await User.findOneAndUpdate(
            { email },
            { role: 'admin' },
            { new: true }
        );

        if (!user) {
            const allUsers = await User.find({}, 'email role');
            console.log(`User with email ${email} not found.`);
            console.log('\nAvailable users:');
            allUsers.forEach(u => console.log(`- ${u.email} (${u.role})`));
            process.exit(1);
        }

        console.log(`Success! ${user.name} (${user.email}) is now an Admin.`);
        process.exit();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
};

setAdmin();
