// frontend/src/pages/Feedback.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../services/api";
import { format } from "date-fns";

const Feedback = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedback();
  }, [id]);

  const fetchFeedback = async () => {
    try {
      const response = await api.get(`/session/result/${id}`);

      if (response.data.status !== "completed") {
        alert("This interview is not completed yet");
        navigate(`/interview/${id}`);
        return;
      }

      setSession(response.data);
    } catch (error) {
      console.error("Failed to fetch feedback:", error);
      alert("Failed to load feedback");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const feedback = session?.feedback;
  const skillAssessment = feedback?.skillLevelAssessment;

  const getScoreColor = (score) => {
    if (score >= 8) return "text-green-600";
    if (score >= 6) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score) => {
    if (score >= 8) return "bg-green-100";
    if (score >= 6) return "bg-yellow-100";
    return "bg-red-100";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Interview Completed! 🎉
          </h1>
          <p className="text-gray-600">
            Here's your detailed performance analysis
          </p>
        </div>

        {/* Session Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Topic</p>
              <p className="font-semibold text-gray-900">{session?.topic}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Type</p>
              <p className="font-semibold text-gray-900 capitalize">
                {session?.interviewType}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Difficulty</p>
              <p className="font-semibold text-gray-900 capitalize">
                {session?.difficulty}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Duration</p>
              <p className="font-semibold text-gray-900">
                {session?.duration} minutes
              </p>
            </div>
          </div>
        </div>

        {/* Overall Score */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg p-8 mb-6 text-white text-center">
          <p className="text-lg mb-2 opacity-90">Overall Score</p>
          <div className="text-6xl font-bold mb-2">
            {feedback?.overallScore}/10
          </div>
          <p className="text-indigo-100">
            {feedback?.overallScore >= 8
              ? "Excellent Performance!"
              : feedback?.overallScore >= 6
              ? "Good Job!"
              : "Keep Practicing!"}
          </p>
        </div>

        {/* Skill Assessment */}
        {skillAssessment && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Skill Level Assessment
            </h2>
            <div className="space-y-4">
              {[
                { key: "clarity", label: "Clarity of Expression" },
                { key: "confidence", label: "Confidence Level" },
                { key: "technicalAccuracy", label: "Technical Accuracy" },
                { key: "communication", label: "Communication Skills" },
              ].map(({ key, label }) => {
                const score = skillAssessment[key];
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        {label}
                      </span>
                      <span
                        className={`text-sm font-semibold ${getScoreColor(
                          score
                        )}`}
                      >
                        {score}/10
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all ${
                          score >= 8
                            ? "bg-green-500"
                            : score >= 6
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${score * 10}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Strengths */}
        {feedback?.strengths?.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">Strengths</h2>
            </div>
            <ul className="space-y-2">
              {feedback.strengths.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  <span className="text-gray-700">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Weaknesses */}
        {feedback?.weaknesses?.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Areas to Improve
              </h2>
            </div>
            <ul className="space-y-2">
              {feedback.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-red-500 mr-2">•</span>
                  <span className="text-gray-700">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Detailed Analysis */}
        {feedback?.detailedAnalysis && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Detailed Analysis
            </h2>
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {feedback.detailedAnalysis}
            </p>
          </div>
        )}

        {/* Improvement Suggestions */}
        {feedback?.areasOfImprovement?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Recommendations
              </h2>
            </div>
            <ul className="space-y-2">
              {feedback.areasOfImprovement.map((area, index) => (
                <li key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2">→</span>
                  <span className="text-gray-700">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Suggested Topics */}
        {feedback?.suggestedTopics?.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Topics to Study
            </h2>
            <div className="flex flex-wrap gap-2">
              {feedback.suggestedTopics.map((topic, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/interview/setup"
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition text-center"
          >
            Start Another Interview
          </Link>
          <Link
            to="/dashboard"
            className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition text-center"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
