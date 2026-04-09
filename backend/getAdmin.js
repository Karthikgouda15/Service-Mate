const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config({ path: __dirname + '/.env' });

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' }
}, { timestamps: true });

async function getOrMakeAdmin() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', userSchema);
        
        let admin = await User.findOne({ role: 'admin' });
        
        if (admin) {
            console.log('--- ADMIN FOUND ---');
            console.log('Email:', admin.email);
            console.log('Note: Password is encrypted in DB. If you do not remember it, we will reset it to "admin123".');
            
            // To ensure the user can actually log in right now:
            const newPasswordHash = await bcrypt.hash('admin123', 12);
            admin.password = newPasswordHash;
            await admin.save();
            console.log('Password forcibly reset to: admin123');
        } else {
            console.log('--- NO ADMIN FOUND. CREATING ONE... ---');
            const passwordHash = await bcrypt.hash('admin123', 12);
            admin = await User.create({
                name: 'System Admin',
                email: 'admin@servicemate.com',
                phone: '9999999999',
                password: passwordHash,
                role: 'admin'
            });
            console.log('Email:', admin.email);
            console.log('Password: admin123');
        }
    } catch(err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

getOrMakeAdmin();
