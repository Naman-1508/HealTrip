const mongoose = require('mongoose');

const chatHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  messages: [{
    role: {
      type: String,
      enum: ['user', 'assistant'],
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

module.exports = mongoose.model('ChatHistory', chatHistorySchema);
