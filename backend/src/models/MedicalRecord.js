import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema({
    userId: {
        type: String, // Clerk User ID
        required: true,
        unique: true
    },
    symptoms: [String],
    history: [String],
    vitals: {
        type: Map,
        of: String
    },
    files: [{
        fileName: String,
        url: String, // If uploaded to cloud
        uploadDate: { type: Date, default: Date.now }
    }],
    generatedReport: {
        type: String // Markdown or Text content of the summary
    },
    isProcessed: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);
