// import { create, findById, find } from "../models/Session.js";
import Session from "../models/Session.js";

import User from "../models/User.js";
import {
  generateOpeningQuestion,
  generateResponse,
  generateFeedback,
} from "../services/openaiService.js";

// @desc    Start new interview session
// @route   POST /api/session/start
// @access  Private
export async function startSession(req, res) {
  try {
    const { interviewType, topic, difficulty } = req.body;

    // Validation
    if (!interviewType || !topic || !difficulty) {
      return res
        .status(400)
        .json({ message: "Please provide all required fields" });
    }

    // Generate opening question
    const openingQuestion = await generateOpeningQuestion(
      interviewType,
      topic,
      difficulty
    );

    // Create session
    const session = await Session.create({
      userId: req.user._id,
      interviewType,
      topic,
      difficulty,
      messages: [
        {
          role: "ai",
          content: `Welcome! Let's begin your ${interviewType} interview for ${topic}. ${openingQuestion}`,
        },
      ],
    });

    // Add session to user
    await User.findByIdAndUpdate(req.user._id, {
      $push: { sessions: session._id },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Start session error:", error);
    res.status(500).json({ message: "Failed to start interview session" });
  }
}

// @desc    Respond to interview question
// @route   POST /api/session/respond
// @access  Private
export async function respondToInterview(req, res) {
  try {
    const { sessionId, userResponse } = req.body;

    if (!sessionId || !userResponse) {
      return res
        .status(400)
        .json({ message: "Session ID and response are required" });
    }

    // Find session
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Check if user owns the session
    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (session.status !== "ongoing") {
      return res.status(400).json({ message: "Session is not active" });
    }

    // Add user response to messages
    session.messages.push({
      role: "user",
      content: userResponse,
    });

    // Prepare conversation history for AI
    const conversationHistory = session.messages.map((msg) => ({
      role: msg.role === "ai" ? "assistant" : "user",
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await generateResponse(
      session.interviewType,
      session.topic,
      session.difficulty,
      conversationHistory
    );

    // Add AI response to messages
    session.messages.push({
      role: "ai",
      content: aiResponse,
    });

    await session.save();

    res.json({
      sessionId: session._id,
      aiResponse,
      messageCount: session.messages.length,
    });
  } catch (error) {
    console.error("Respond to interview error:", error);
    res.status(500).json({ message: "Failed to process response" });
  }
}

// @desc    End interview session
// @route   POST /api/session/end/:id
// @access  Private
export async function endSession(req, res) {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Prepare conversation for feedback
    const conversationHistory = session.messages.map((msg) => ({
      role: msg.role,
      content: msg.content,
    }));

    // Generate feedback
    const feedback = await generateFeedback(
      session.interviewType,
      session.topic,
      session.difficulty,
      conversationHistory
    );

    // Calculate duration
    const duration = Math.round((Date.now() - session.startedAt) / 60000);

    // Update session
    session.status = "completed";
    session.completedAt = new Date();
    session.duration = duration;
    session.feedback = feedback;

    await session.save();

    res.json({
      message: "Session completed successfully",
      sessionId: session._id,
      feedback: session.feedback,
    });
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({ message: "Failed to end session" });
  }
}

// @desc    Get session result/feedback
// @route   GET /api/session/result/:id
// @access  Private
export async function getSessionResult(req, res) {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json(session);
  } catch (error) {
    console.error("Get session result error:", error);
    res.status(500).json({ message: "Failed to fetch session result" });
  }
}

// @desc    Get user's session history
// @route   GET /api/session/history
// @access  Private
export async function getUserSessions(req, res) {
  try {
    const sessions = await Session.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("-messages"); // Exclude full conversation

    res.json(sessions);
  } catch (error) {
    console.error("Get user sessions error:", error);
    res.status(500).json({ message: "Failed to fetch session history" });
  }
}
