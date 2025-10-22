const topics = {
  technical: [
    {
      id: "react",
      name: "React Developer",
      description: "Frontend development with React, hooks, state management",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "nodejs",
      name: "Node.js Developer",
      description: "Backend development with Node.js, Express, APIs",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "python",
      name: "Python Developer",
      description: "Python programming, Django, Flask, data structures",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "javascript",
      name: "JavaScript Developer",
      description: "Core JavaScript, ES6+, async programming",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "fullstack",
      name: "Full Stack Developer",
      description: "Frontend and backend development, databases, deployment",
      difficulty: ["intermediate", "advanced"],
    },
    {
      id: "devops",
      name: "DevOps Engineer",
      description: "CI/CD, Docker, Kubernetes, cloud platforms",
      difficulty: ["intermediate", "advanced"],
    },
    {
      id: "data-science",
      name: "Data Science",
      description: "Machine learning, statistics, data analysis",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
  ],
  hr: [
    {
      id: "behavioral",
      name: "Behavioral Interview",
      description: "Work experience, teamwork, conflict resolution",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "leadership",
      name: "Leadership & Management",
      description: "Team leadership, decision making, project management",
      difficulty: ["intermediate", "advanced"],
    },
    {
      id: "entry-level",
      name: "Entry Level Position",
      description: "Career goals, motivation, cultural fit",
      difficulty: ["beginner"],
    },
  ],
  viva: [
    {
      id: "computer-science",
      name: "Computer Science",
      description: "Algorithms, data structures, operating systems",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "dbms",
      name: "Database Management",
      description: "SQL, normalization, transactions, indexing",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "networks",
      name: "Computer Networks",
      description: "TCP/IP, protocols, network security",
      difficulty: ["beginner", "intermediate", "advanced"],
    },
    {
      id: "software-engineering",
      name: "Software Engineering",
      description: "SDLC, design patterns, testing, architecture",
      difficulty: ["intermediate", "advanced"],
    },
  ],
};

// @desc    Get all interview topics
// @route   GET /api/topics
// @access  Public
export async function getTopics(req, res) {
  try {
    res.json(topics);
  } catch (error) {
    console.error("Get topics error:", error);
    res.status(500).json({ message: "Failed to fetch topics" });
  }
}
