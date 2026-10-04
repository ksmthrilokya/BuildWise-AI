const express = require("express");

const app = express();
const PORT = 5000;

app.use(express.json());

app.get("/", (req, res) => {
  res.send("BuildWise AI Backend is Running!");
});

app.post("/analyze", async (req, res) => {
  const idea = req.body.idea;

  if (!idea) {
    return res.status(400).json({
      error: "Project idea is required"
    });
  }

  try {
    const prompt = `
You are BuildWise AI, an AI assistant for college students.

Analyze the following project idea and create a practical project blueprint.

Project Idea:
${idea}

Provide:
1. Project Title
2. Problem Statement
3. Project Objective
4. Key Features
5. Technologies Required
6. Development Steps
7. Suggested Modules
8. Expected Outcome

Keep the explanation clear and suitable for a college student.
`;

    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3.2:3b",
        prompt: prompt,
        stream: false
      })
    });

    const data = await response.json();

    res.json({
      message: "AI blueprint generated successfully!",
      idea: idea,
      blueprint: data.response
    });

  } catch (error) {
    console.error("Ollama Error:", error);

    res.status(500).json({
      error: "Could not connect to Ollama"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});