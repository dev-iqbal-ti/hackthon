// backend/src/services/openaiService.js
import OpenAI from "openai";
console.log(process.env.API_KEY);
const openai = new OpenAI({
  apiKey: process.env.API_KEY,
});

// System prompts for different interview types
const getSystemPrompt = (interviewType, topic, difficulty) => {
  const prompts = {
    technical: `You are an expert technical interviewer conducting a ${difficulty} level interview for ${topic}. 
    Ask relevant technical questions, dive deeper based on responses, and maintain a professional yet friendly tone.
    Ask one question at a time and build upon the candidate's answers.`,

    hr: `You are an experienced HR interviewer conducting a ${difficulty} level behavioral interview.
    Ask questions about work experience, teamwork, conflict resolution, and career goals.
    Be empathetic and professional. Ask one question at a time.`,

    viva: `You are an academic examiner conducting a ${difficulty} level viva on ${topic}.
    Ask conceptual and theoretical questions, probe understanding, and test depth of knowledge.
    Maintain an academic yet supportive tone. Ask one question at a time.`,
  };

  return prompts[interviewType] || prompts.technical;
};

// Generate interview questions and responses
export async function generateResponse(
  interviewType,
  topic,
  difficulty,
  conversationHistory
) {
  try {
    const systemPrompt = getSystemPrompt(interviewType, topic, difficulty);

    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory,
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: messages,
      max_tokens: 300,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI API error:", error);
    throw new Error("Failed to generate AI response");
  }
}

// Generate feedback and analysis
export async function generateFeedback(
  interviewType,
  topic,
  difficulty,
  conversationHistory
) {
  try {
    const feedbackPrompt = `Based on the following ${interviewType} interview conversation for ${topic} at ${difficulty} level, 
    provide a comprehensive evaluation in JSON format with the following structure:
    {
      "overallScore": (1-10),
      "strengths": [list of strengths],
      "weaknesses": [list of weaknesses],
      "areasOfImprovement": [specific areas to improve],
      "suggestedTopics": [topics to study further],
      "detailedAnalysis": "detailed paragraph analysis",
      "skillLevelAssessment": {
        "clarity": (1-10),
        "confidence": (1-10),
        "technicalAccuracy": (1-10),
        "communication": (1-10)
      }
    }
    
    Conversation:
    ${JSON.stringify(conversationHistory)}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: feedbackPrompt }],
      max_tokens: 1000,
      temperature: 0.5,
    });

    const feedbackText = completion.choices[0].message.content;

    // Extract JSON from response
    const jsonMatch = feedbackText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error("Failed to parse feedback JSON");
  } catch (error) {
    console.error("Feedback generation error:", error);
    throw new Error("Failed to generate feedback");
  }
}

// Generate opening question for interview
export async function generateOpeningQuestion(
  interviewType,
  topic,
  difficulty
) {
  try {
    const systemPrompt = getSystemPrompt(interviewType, topic, difficulty);
    const userPrompt = `Start the interview with an appropriate opening question.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Opening question error:", error);
    throw new Error("Failed to generate opening question");
  }
}
