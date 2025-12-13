import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant', 'bot'],
      required: true
    },
    content: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      hospitals: [{
        name: String,
        city: String,
        rating: Number,
        specialty: String,
        matchScore: Number
      }],
      packages: [{
        hospital: String,
        hotel: String,
        flight: String,
        hotelCost: Number,
        flightCost: Number,
        hospitalCost: Number,
        totalCost: Number
      }],
      pdfAnalysis: {
        fileName: String,
        extractedDisease: String,
        uploadedAt: Date
      }
    }
  }]
}, {
  timestamps: true
});

// Index for faster queries
chatHistorySchema.index({ userId: 1, 'messages.timestamp': -1 });

export default mongoose.model('ChatHistory', chatHistorySchema);
