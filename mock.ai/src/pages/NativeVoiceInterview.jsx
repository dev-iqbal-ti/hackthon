// frontend/src/pages/NativeVoiceInterview.jsx
// This version uses ONLY browser APIs - no backend voice services needed
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "../hooks/useSpeechSynthesis";

const NativeVoiceInterview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(true);

  const messagesEndRef = useRef(null);
  const lastAIMessageRef = useRef("");

  // Speech Recognition Hook (Audio to Text)
  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: isRecognitionSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  // Speech Synthesis Hook (Text to Audio)
  const {
    isSpeaking,
    voices,
    selectedVoice,
    isSupported: isSynthesisSupported,
    speak,
    cancel: cancelSpeech,
    setSelectedVoice,
  } = useSpeechSynthesis();

  useEffect(() => {
    if (!isRecognitionSupported) {
      alert(
        "Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari."
      );
    }
    if (!isSynthesisSupported) {
      alert("Speech synthesis is not supported in your browser.");
    }
    fetchSession();
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-speak AI responses
  useEffect(() => {
    if (autoSpeak && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // Only speak new AI messages
      if (
        lastMessage.role === "ai" &&
        lastMessage.content !== lastAIMessageRef.current
      ) {
        lastAIMessageRef.current = lastMessage.content;
        speak(lastMessage.content, {
          onEnd: () => {
            // Optionally auto-start listening after AI finishes speaking
            if (autoSpeak && !isListening) {
              setTimeout(() => startListening(), 500);
            }
          },
        });
      }
    }
  }, [messages, autoSpeak]);

  const fetchSession = async () => {
    try {
      const response = await api.get(`/session/result/${id}`);
      setSession(response.data.session);
      setMessages(response.data.session.messages || []);

      // Speak the first AI message
      if (response.data.session.messages.length > 0) {
        const firstMessage = response.data.session.messages[0];
        if (firstMessage.role === "ai") {
          lastAIMessageRef.current = firstMessage.content;
          if (autoSpeak) {
            speak(firstMessage.content);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch session:", error);
      alert("Failed to load interview session");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendTranscript = async () => {
    if (!transcript.trim() || sending) return;

    const messageToSend = transcript.trim();

    // Stop listening
    if (isListening) {
      stopListening();
    }

    setSending(true);

    // Add user message
    const userMessage = {
      role: "user",
      content: messageToSend,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Clear transcript
    resetTranscript();

    try {
      // Send to backend
      const response = await api.post("/session/respond", {
        sessionId: id,
        userResponse: messageToSend,
      });

      // Add AI response
      const aiMessage = {
        role: "ai",
        content: response.data.aiResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message. Please try again.");
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
    }
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      // Stop any ongoing speech before starting to listen
      cancelSpeech();
      startListening();
    }
  };

  const handleEndInterview = async () => {
    if (!confirm("Are you sure you want to end this interview?")) return;

    // Stop all audio activities
    if (isListening) stopListening();
    cancelSpeech();

    setEnding(true);
    try {
      await api.post(`/session/end/${id}`);
      navigate(`/feedback/${id}`);
    } catch (error) {
      console.error("Failed to end interview:", error);
      alert("Failed to end interview. Please try again.");
      setEnding(false);
    }
  };

  const handleReplayMessage = (content) => {
    cancelSpeech();
    speak(content);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (session?.status === "completed") {
    navigate(`/feedback/${id}`);
    return null;
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 flex items-center">
              <svg
                className="w-6 h-6 mr-2 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              {session?.topic}
            </h1>
            <p className="text-sm text-gray-600 capitalize">
              {session?.interviewType} • {session?.difficulty} • Native Voice
              Mode
            </p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Voice Selection */}
            <select
              value={voices.indexOf(selectedVoice)}
              onChange={(e) => setSelectedVoice(voices[e.target.value])}
              className="text-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={voices.length === 0}
            >
              {voices.map((voice, index) => (
                <option key={index} value={index}>
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>

            {/* Auto-speak Toggle */}
            <label className="flex items-center text-sm text-gray-700 cursor-pointer">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="mr-2 h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              Auto-speak
            </label>

            <button
              onClick={handleEndInterview}
              disabled={ending}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-red-700 transition disabled:bg-red-400"
            >
              {ending ? "Ending..." : "End Interview"}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-3xl rounded-lg px-6 py-4 ${
                  message.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-900"
                }`}
              >
                <div className="flex items-start space-x-3">
                  {message.role === "ai" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-indigo-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>

                    {/* Replay button for AI messages */}
                    {message.role === "ai" && (
                      <button
                        onClick={() => handleReplayMessage(message.content)}
                        className="mt-2 flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Replay</span>
                      </button>
                    )}

                    {message.timestamp && (
                      <p
                        className={`text-xs mt-2 ${
                          message.role === "user"
                            ? "text-indigo-200"
                            : "text-gray-500"
                        }`}
                      >
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        You
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Processing Indicator */}
          {sending && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-lg px-6 py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"
                      style={{ animationDelay: "0.4s" }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-700">
                    AI is thinking...
                  </span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Voice Input Area */}
      <div className="bg-white border-t border-gray-200 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col items-center space-y-4">
            {/* Status Indicators */}
            <div className="flex items-center space-x-6">
              {isListening && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-600">
                    Listening...
                  </span>
                </div>
              )}

              {isSpeaking && (
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-600 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-green-600">
                    AI Speaking...
                  </span>
                </div>
              )}
            </div>

            {/* Transcript Display */}
            {(transcript || interimTranscript) && (
              <div className="w-full max-w-2xl bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">{transcript}</span>
                  <span className="text-gray-500 italic">
                    {interimTranscript}
                  </span>
                </p>
              </div>
            )}

            {/* Controls */}
            <div className="flex items-center space-x-4">
              {/* Listen Button */}
              <button
                onClick={handleToggleListening}
                disabled={sending || isSpeaking}
                className={`p-6 rounded-full shadow-lg transition ${
                  isListening
                    ? "bg-red-600 hover:bg-red-700 animate-pulse"
                    : "bg-indigo-600 hover:bg-indigo-700"
                } text-white disabled:bg-gray-400`}
              >
                {isListening ? (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                )}
              </button>

              {/* Send Button */}
              {transcript && (
                <button
                  onClick={handleSendTranscript}
                  disabled={sending || !transcript.trim()}
                  className="bg-green-600 text-white px-8 py-4 rounded-full hover:bg-green-700 transition disabled:bg-green-400 shadow-lg flex items-center space-x-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                  <span className="font-medium">Send</span>
                </button>
              )}

              {/* Stop Speaking Button */}
              {isSpeaking && (
                <button
                  onClick={cancelSpeech}
                  className="bg-yellow-600 text-white px-6 py-4 rounded-full hover:bg-yellow-700 transition shadow-lg flex items-center space-x-2"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                    />
                  </svg>
                  <span className="font-medium">Stop</span>
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 text-center max-w-md">
              {!isListening &&
                !isSpeaking &&
                "Click microphone to start speaking your answer"}
              {isListening &&
                "Speak your answer clearly. Click stop when done."}
              {isSpeaking && "AI is speaking. Click stop to interrupt."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NativeVoiceInterview;
