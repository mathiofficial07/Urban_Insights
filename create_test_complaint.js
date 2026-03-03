const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config({ path: './backend/.env' });

async function createTestComplaint() {
    try {
        console.log('Connecting to DB...');
        await mongoose.connect(process.env.MONGODB_URI);

        // Get a user to assign the complaint to
        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const user = await User.findOne({ userType: 'admin' });

        if (!user) {
            console.log('No admin user found. Creating dummy user...');
            // ... probably better to just find any user
        }

        const targetUser = user || await User.findOne();
        if (!targetUser) throw new Error('No users in DB');

        console.log(`Using user: ${targetUser.email}`);

        const Complaint = mongoose.model('Complaint', new mongoose.Schema({
            user: mongoose.Schema.Types.ObjectId,
            title: String,
            description: String,
            category: String,
            location: Object,
            mlPredictions: Object,
            isActive: Boolean,
            status: String
        }, { strict: false, timestamps: true }));

        const complaintData = {
            user: targetUser._id,
            title: "Test Complaint: Broken Street Light",
            description: "The street light near the park is flickering and needs repair.",
            category: "Electricity",
            location: {
                address: "Park Avenue",
                coordinates: { latitude: 11.0, longitude: 77.0 }
            },
            isActive: true,
            status: 'pending'
        };

        console.log('Triggering ML Prediction (Simulating complaints.js logic)...');
        let mlPredictions = {};
        try {
            const mlResponse = await axios.post('http://localhost:5001/predict', {
                text: complaintData.description,
                category: complaintData.category,
                location: complaintData.location.coordinates
            }, { timeout: 3000 });

            if (mlResponse.data) {
                mlPredictions = {
                    category: {
                        predicted: mlResponse.data.category?.predicted || "Electricity",
                        confidence: mlResponse.data.category?.confidence || 0.9,
                        processedAt: new Date()
                    }
                };
            }
        } catch (e) {
            console.log('ML Service unavailable, using fallback:', e.message);
            mlPredictions = {
                category: {
                    predicted: complaintData.category,
                    confidence: 0,
                    processedAt: new Date(),
                    isFallback: true
                }
            };
        }

        const complaint = new Complaint({
            ...complaintData,
            mlPredictions
        });

        await complaint.save();
        console.log('Test complaint created with ID:', complaint._id);
        console.log('ML Predictions saved:', JSON.stringify(complaint.mlPredictions, null, 2));

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

createTestComplaint();
