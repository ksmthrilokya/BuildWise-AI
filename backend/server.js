const express = require("express");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));


// ==========================================
// FALLBACK BLUEPRINT
// Used only when Gemini quota is unavailable
// ==========================================

function createFallbackBlueprint(idea) {
    return `
Project Title:
${idea}

Problem Statement:
Students often have project ideas but may not know how to convert those ideas into a practical and structured project. This project aims to provide a clear development direction.

Project Objective:
The main objective is to develop a practical solution for the given project idea and provide students with a clear understanding of its implementation.

Key Features:
• User-friendly interface
• Project idea processing
• Structured project planning
• Technology suggestions
• Step-by-step development guidance
• Modular project design

Technologies Required:
• HTML
• CSS
• JavaScript
• Node.js
• Express.js
• AI integration
• Database if required

Development Steps:
1. Define the project requirements.
2. Design the user interface.
3. Set up the backend.
4. Implement the main project modules.
5. Integrate required APIs or AI services.
6. Test all major features.
7. Fix errors and improve performance.
8. Deploy the final project.

Suggested Modules:
• User Interface Module
• Input Processing Module
• Core Project Module
• AI / Logic Module
• Database Module
• Testing Module
• Deployment Module

Expected Outcome:
A functional and practical college project based on the provided idea, with a clear structure that can be further developed and deployed.

Note:
This blueprint is currently generated using BuildWise AI's fallback mode because the AI service has temporarily reached its usage limit.
`;
}


// ==========================================
// ANALYZE PROJECT IDEA
// ==========================================

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

Keep the explanation clear, practical and suitable for a college student.
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


        // ==========================================
        // GEMINI QUOTA EXCEEDED
        // ==========================================

        if (response.status === 429) {

            console.log("Gemini quota exceeded. Using fallback blueprint.");

            return res.json({
                message: "Fallback blueprint generated",
                idea: idea,
                blueprint: createFallbackBlueprint(idea)
            });
        }


        // ==========================================
        // OTHER GEMINI ERRORS
        // ==========================================

        if (!response.ok) {

            console.error("Gemini API Error:", data);

            return res.status(500).json({
                error: data.error?.message || "AI service error"
            });
        }


        // ==========================================
        // GET AI RESPONSE
        // ==========================================

        const blueprint =
            data.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!blueprint) {

            return res.status(500).json({
                error: "No AI response received"
            });
        }


        // ==========================================
        // SUCCESS
        // ==========================================

        res.json({

            message: "AI blueprint generated successfully!",

            idea: idea,

            blueprint: blueprint

        });

    }

    catch (error) {

        console.error("Server Error:", error);

        res.status(500).json({
            error: "Could not generate blueprint"
        });
    }
});


// ==========================================
// HOMEPAGE
// ==========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(__dirname, "../frontend/index.html")
    );

});


// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `BuildWise AI running on port ${PORT}`
    );

});