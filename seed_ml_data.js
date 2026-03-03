const mongoose = require('mongoose');
const { faker } = require('@faker-js/faker');
require('dotenv').config({ path: './backend/.env' });

const CATEGORIES = [
    'Infrastructure', 'Sanitation', 'Water Supply', 'Electricity',
    'Roads', 'Public Safety', 'Noise Pollution', 'Other'
];

async function seedData() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Complaint = mongoose.model('Complaint', new mongoose.Schema({
            mlPredictions: Object
        }, { strict: false }));

        const adminUser = await User.findOne({ userType: 'admin' });
        if (!adminUser) throw new Error('Admin user not found. Please register an admin first.');

        console.log('Generating 150 complaints...');
        const complaints = [];
        const now = new Date();

        for (let i = 0; i < 150; i++) {
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            const createdAt = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);

            complaints.push({
                user: adminUser._id,
                title: faker.lorem.sentence(5),
                description: faker.lorem.paragraph(),
                category,
                priority: faker.helpers.arrayElement(['low', 'medium', 'high', 'critical']),
                status: faker.helpers.arrayElement(['pending', 'in-progress', 'resolved', 'closed']),
                location: {
                    address: faker.location.streetAddress(),
                    coordinates: {
                        latitude: 11.0 + (Math.random() * 0.1),
                        longitude: 76.9 + (Math.random() * 0.1)
                    }
                },
                isActive: true,
                createdAt,
                updatedAt: createdAt,
                mlPredictions: {
                    category: {
                        predicted: category,
                        confidence: 0.7 + Math.random() * 0.25,
                        processedAt: createdAt
                    }
                }
            });
        }

        await Complaint.insertMany(complaints);
        console.log('Successfully seeded 150 complaints!');

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error.message);
        process.exit(1);
    }
}

seedData();
