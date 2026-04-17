const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Provider = require('./models/Provider');

dotenv.config();

const categories = [
    'Plumbing', 'Electrical', 'Cleaning', 'AC Repair', 
    'Carpentry', 'Painting', 'Pest Control', 'Gardening'
];

const subcategories = {
    'Plumbing': ['Leak Repair', 'Bathroom Fitting', 'Water Heater Service'],
    'Electrical': ['Wiring', 'Switchboard Repair', 'Light Installation'],
    'Cleaning': ['Full House Clean', 'Kitchen Deep Clean', 'Sofa/Carpet Clean'],
    'AC Repair': ['General Service', 'Gas Filling', 'Installation'],
    'Carpentry': ['Furniture Assembly', 'Door Repair', 'Cabinet Work'],
    'Painting': ['Interior Wall', 'Exterior House', 'Waterproofing'],
    'Pest Control': ['Ants & Cockroaches', 'Termite Treatment', 'Bed Bug Control'],
    'Gardening': ['Lawn Mowing', 'Garden Design', 'Plant Care']
};

const names = [
    'Rajesh', 'Sanjay', 'Vijay', 'Manoj', 'Kiran', 'Deepak', 'Arun', 'Rohan', 'Sameer', 'Pankaj',
    'Sunil', 'Anil', 'Nitin', 'Rahul', 'Vivek', 'Gopal', 'Madhav', 'Keshav', 'Arjun', 'Sagar'
];

const surnames = [
    'Kumar', 'Sharma', 'Patil', 'Singh', 'Reddy', 'Gouda', 'Iyer', 'Menon', 'Joshi', 'Mishra'
];

const generateLocation = () => {
    // Generate coordinates around Bangalore (approx 12.9716, 77.5946)
    const lat = 12.91 + Math.random() * 0.12; 
    const lng = 77.52 + Math.random() * 0.15;
    return [lng, lat];
};

const seedBulk = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for Bulk Seed...');

        let totalCreated = 0;

        for (const cat of categories) {
            console.log(`Generating 5 more for: ${cat}...`);
            
            for (let i = 0; i < 5; i++) {
                const firstName = names[Math.floor(Math.random() * names.length)];
                const lastName = surnames[Math.floor(Math.random() * surnames.length)];
                const fullName = `${firstName} ${lastName}`;
                const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${cat.toLowerCase().replace(' ', '')}${Date.now()}${i}@example.com`;
                const phone = `91${Math.floor(10000000 + Math.random() * 90000000)}`;
                const location = generateLocation();

                const user = await User.create({
                    name: fullName,
                    email,
                    phone,
                    password: 'password123',
                    role: 'provider',
                    location: { type: 'Point', coordinates: location }
                });

                await Provider.create({
                    userId: user._id,
                    services: [
                        { category: cat, subcategory: subcategories[cat][0], basePrice: 299 + Math.floor(Math.random() * 500), priceUnit: 'job' },
                        { category: cat, subcategory: subcategories[cat][1], basePrice: 499 + Math.floor(Math.random() * 1000), priceUnit: 'job' }
                    ],
                    isApproved: true,
                    isOnline: true,
                    currentLocation: { type: 'Point', coordinates: location },
                    rating: 4.2 + Math.random() * 0.7,
                    totalJobs: Math.floor(Math.random() * 30),
                    bio: `Professional ${cat} services with focus on quality and customer satisfaction.`
                });
                totalCreated++;
            }
        }

        console.log(`Bulk Seed Success! Created ${totalCreated} new providers.`);
        process.exit();
    } catch (err) {
        console.error('Bulk Seed Error:', err);
        process.exit(1);
    }
};

seedBulk();
