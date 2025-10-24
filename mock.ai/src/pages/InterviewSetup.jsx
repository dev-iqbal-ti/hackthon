// frontend/src/pages/InterviewSetup.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const InterviewSetup = () => {
  const navigate = useNavigate();
  const [topics, setTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({
    interviewType: "technical",
    topic: "",
    difficulty: "intermediate",
  });

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const response = await api.get("/topics");
      setTopics(response.data);

      // Set default topic
      if (response.data.technical?.length > 0) {
        setFormData((prev) => ({
          ...prev,
          topic: response.data.technical[0].id,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch topics:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      interviewType: type,
      topic: topics[type]?.[0]?.id || "",
    });
  };

  const handleStartInterview = async () => {
    if (!formData.topic) {
      alert("Please select a topic");
      return;
    }

    setCreating(true);
    try {
      const response = await api.post("/session/start", formData);
      navigate(`/interview/${response.data._id}`);
    } catch (error) {
      console.error("Failed to start interview:", error);
      alert("Failed to start interview. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const selectedTopicData = topics[formData.interviewType]?.find(
    (t) => t.id === formData.topic
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Configure Your Interview
        </h1>
        <p className="text-gray-600">
          Choose your interview type, topic, and difficulty level
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Interview Type Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Interview Type
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["technical", "hr", "viva"].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeChange(type)}
                className={`p-4 rounded-lg border-2 transition ${
                  formData.interviewType === type
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <div className="text-center">
                  <div className="text-2xl mb-2">
                    {type === "technical" ? "💻" : type === "hr" ? "👔" : "📚"}
                  </div>
                  <div className="font-semibold capitalize">{type}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Topic Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Select Topic
          </label>
          <div className="grid md:grid-cols-2 gap-4">
            {topics[formData.interviewType]?.map((topic) => (
              <button
                key={topic.id}
                onClick={() => setFormData({ ...formData, topic: topic.id })}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  formData.topic === topic.id
                    ? "border-indigo-600 bg-indigo-50"
                    : "border-gray-200 hover:border-indigo-300"
                }`}
              >
                <h3 className="font-semibold text-gray-900 mb-1">
                  {topic.name}
                </h3>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="mb-8">
          <label className="block text-sm font-semibold text-gray-700 mb-4">
            Difficulty Level
          </label>
          <div className="grid grid-cols-3 gap-4">
            {["beginner", "intermediate", "advanced"].map((level) => {
              const isAvailable =
                selectedTopicData?.difficulty?.includes(level);
              return (
                <button
                  key={level}
                  onClick={() =>
                    isAvailable &&
                    setFormData({ ...formData, difficulty: level })
                  }
                  disabled={!isAvailable}
                  className={`p-4 rounded-lg border-2 transition ${
                    formData.difficulty === level
                      ? "border-indigo-600 bg-indigo-50"
                      : isAvailable
                      ? "border-gray-200 hover:border-indigo-300"
                      : "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">
                      {level === "beginner"
                        ? "⭐"
                        : level === "intermediate"
                        ? "⭐⭐"
                        : "⭐⭐⭐"}
                    </div>
                    <div className="font-semibold capitalize">{level}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Summary Card */}
        {formData.topic && (
          <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6 mb-8">
            <h3 className="font-semibold text-indigo-900 mb-3">
              Interview Summary
            </h3>
            <div className="space-y-2 text-sm text-indigo-800">
              <p>
                <span className="font-medium">Type:</span>{" "}
                {formData.interviewType.charAt(0).toUpperCase() +
                  formData.interviewType.slice(1)}{" "}
                Interview
              </p>
              <p>
                <span className="font-medium">Topic:</span>{" "}
                {selectedTopicData?.name}
              </p>
              <p>
                <span className="font-medium">Difficulty:</span>{" "}
                {formData.difficulty.charAt(0).toUpperCase() +
                  formData.difficulty.slice(1)}
              </p>
            </div>
          </div>
        )}

        {/* Start Button */}
        <button
          onClick={handleStartInterview}
          disabled={creating || !formData.topic}
          className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-indigo-400 disabled:cursor-not-allowed"
        >
          {creating ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Starting Interview...
            </span>
          ) : (
            "Start Interview"
          )}
        </button>

        <p className="text-center text-sm text-gray-500 mt-4">
          You can pause or end the interview at any time
        </p>
      </div>
    </div>
  );
};

export default InterviewSetup;
