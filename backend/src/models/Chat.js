import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
    userId: {
        type: String, // Clerk User ID
        required: true,
        index: true
    },
    messages: [{
        role: { type: String, enum: ['user', 'bot'], required: true },
        content: { type: String, required: true },
        type: { type: String, default: 'text' }, // text, packages
        packages: [Object], // Store package cards
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

export const Chat = mongoose.model("Chat", chatSchema);
