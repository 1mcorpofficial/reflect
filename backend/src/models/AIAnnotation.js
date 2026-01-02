const mongoose = require('mongoose');

const aiAnnotationSchema = new mongoose.Schema({
  // Reference to the response
  responseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Response',
    required: true
  },
  // Reference to the specific question
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  // Original text that was analyzed
  originalText: {
    type: String,
    required: true
  },
  // AI-generated annotations
  annotations: {
    // Main topic identified
    topic: {
      type: String
    },
    // Detected emotion
    emotion: {
      type: String,
      enum: ['positive', 'neutral', 'negative', 'mixed']
    },
    // Emotion intensity (0-10)
    intensity: {
      type: Number,
      min: 0,
      max: 10
    },
    // Type of suggestion/request in the text
    suggestionType: {
      type: String,
      enum: ['help_needed', 'clarification', 'encouragement', 'complaint', 'question', 'feedback', 'none']
    },
    // Brief summary of the text
    summary: {
      type: String
    },
    // Suggested action for the teacher
    actionHint: {
      type: String
    },
    // Keywords extracted from the text
    keywords: [{
      type: String
    }],
    // Confidence score (0-1)
    confidence: {
      type: Number,
      min: 0,
      max: 1
    }
  },
  // Which AI model was used
  aiModel: {
    type: String,
    default: 'unknown'
  },
  // Version of the annotation (for reprocessing)
  version: {
    type: Number,
    default: 1
  },
  // Processing status
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // Error message if failed
  errorMessage: {
    type: String
  },
  // Timestamps
  processedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes
aiAnnotationSchema.index({ responseId: 1, questionId: 1 }, { unique: true });
aiAnnotationSchema.index({ status: 1, createdAt: 1 }); // For processing queue
aiAnnotationSchema.index({ 'annotations.topic': 1 }); // For topic analysis
aiAnnotationSchema.index({ 'annotations.emotion': 1 }); // For emotion analysis

module.exports = mongoose.model('AIAnnotation', aiAnnotationSchema);

