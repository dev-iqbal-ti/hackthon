import { Schema, model } from "mongoose";

const messageSchema = new Schema({
  role: {
    type: String,
    enum: ["ai", "user"],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const sessionSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    interviewType: {
      type: String,
      enum: ["technical", "hr", "viva"],
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    status: {
      type: String,
      enum: ["ongoing", "completed", "paused"],
      default: "ongoing",
    },
    messages: [messageSchema],
    feedback: {
      overallScore: {
        type: Number,
        min: 1,
        max: 10,
      },
      strengths: [String],
      weaknesses: [String],
      areasOfImprovement: [String],
      suggestedTopics: [String],
      detailedAnalysis: String,
      skillLevelAssessment: {
        clarity: Number,
        confidence: Number,
        technicalAccuracy: Number,
        communication: Number,
      },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    duration: Number, // in minutes
  },
  {
    timestamps: true,
  }
);

export default model("Session", sessionSchema);
