const mongoose = require('mongoose');
const axios = require('axios');
const fs = require('fs');
require('dotenv').config({ path: './backend/.env' });

async function diagnose() {
    let report = "--- DIAGNOSTIC REPORT ---\n";

    // 1. Check MongoDB
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        report += "MongoDB: Connected\n";
        const Complaint = mongoose.model('Complaint', new mongoose.Schema({}, { strict: false }));
        const count = await Complaint.countDocuments();
        report += `Complaints in DB: ${count}\n`;
        await mongoose.disconnect();
    } catch (e) {
        report += `MongoDB Error: ${e.message}\n`;
    }

    // 2. Check ML Service
    try {
        const mlHealth = await axios.get('http://localhost:5001/health');
        report += `ML Service: Healthy (${mlHealth.data.status})\n`;
    } catch (e) {
        report += `ML Service Error: ${e.message}\n`;
    }

    fs.writeFileSync('diagnostic_report.txt', report);
    console.log(report);
}

diagnose();
