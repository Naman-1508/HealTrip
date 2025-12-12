import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Flight from '../models/Flight.js';

import connectDB from '../config/db.js';

dotenv.config();

const seedData = async () => {
    try {
        await connectDB();

        console.log('🌱 Clearing existing data...');
        await Flight.deleteMany({});
        await Flight.deleteMany({});

        console.log('✈️  Seeding Flights...');
        const flights = [
            {
                airline: "IndiGo",
                flightNumber: "6E-532",
                origin: "Delhi",
                destination: "Bangalore",
                departureTime: new Date("2024-12-15T08:00:00"),
                arrivalTime: new Date("2024-12-15T10:45:00"),
                price: 5400,
                duration: "2h 45m"
            },
            {
                airline: "Air India",
                flightNumber: "AI-803",
                origin: "Delhi",
                destination: "Bangalore",
                departureTime: new Date("2024-12-15T14:30:00"),
                arrivalTime: new Date("2024-12-15T17:15:00"),
                price: 6100,
                duration: "2h 45m"
            },
            {
                airline: "Vistara",
                flightNumber: "UK-811",
                origin: "Mumbai",
                destination: "Bangalore",
                departureTime: new Date("2024-12-16T09:00:00"),
                arrivalTime: new Date("2024-12-16T10:30:00"),
                price: 4800,
                duration: "1h 30m"
            },
            {
                airline: "SpiceJet",
                flightNumber: "SG-456",
                origin: "Kolkata",
                destination: "Bangalore",
                departureTime: new Date("2024-12-17T11:00:00"),
                arrivalTime: new Date("2024-12-17T13:30:00"),
                price: 5200,
                duration: "2h 30m"
            }
        ];
        await Flight.insertMany(flights);



        console.log('✅ Data Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding Failed:', error);
        process.exit(1);
    }
};

seedData();
