const express = require("express");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));

// Analyze project idea
app.post("/analyze", async (req, res) => {
    const idea = req.body.idea;

    if (!idea) {
        return res.status(400).json({
            error: "Project idea is required"
        });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({
            error: "Gemini API key is not configured"
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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            console.error("Gemini API Error:", data);

            return res.status(500).json({
                error: data.error?.message || "AI service error"
            });
        }

        const blueprint =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!blueprint) {
            return res.status(500).json({
                error: "No AI response received"
            });
        }

        res.json({
            message: "AI blueprint generated successfully!",
            idea: idea,
            blueprint: blueprint
        });

    } catch (error) {
        console.error("Server Error:", error);

        res.status(500).json({
            error: "Could not generate blueprint"
        });
    }
});

// Serve homepage
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`BuildWise AI running on port ${PORT}`);
});