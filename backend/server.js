const express = require("express");
require("dotenv").config();
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend")));


// ==========================================
// FALLBACK BLUEPRINT
// ==========================================

function createFallbackBlueprint(idea) {
    return `
Project Title:
${idea}

Problem Statement:
Students often have project ideas but may not know how to convert those ideas into a practical and structured project.

Project Objective:
Develop a practical solution for the given project idea with a clear implementation plan.

Key Features:
• User-friendly interface
• Core project functionality
• Data processing
• User management
• Reports and results
• Responsive design

Technologies Required:
• HTML
• CSS
• JavaScript
• Node.js
• Express.js
• Database if required
• AI/API integration if required

Development Steps:
1. Define project requirements.
2. Design the UI.
3. Set up the backend.
4. Develop the main modules.
5. Connect APIs or AI services.
6. Integrate frontend and backend.
7. Test the application.
8. Deploy the project.

Suggested Modules:
• User Interface Module
• Authentication Module
• Core Functionality Module
• Data Processing Module
• Database Module
• Testing Module
• Deployment Module

UI/UX Design:
• Landing Page – Introduce the project and its main purpose.
• Login/Register – Provide a simple and clean authentication interface if required.
• Dashboard – Show important project information and quick actions.
• Main Feature Screen – Keep the primary functionality easy to access.
• Navigation – Use a simple navbar/sidebar with clearly named sections.
• Forms – Use clean input fields with validation and helpful labels.
• Results Screen – Display important results in a readable and organized layout.
• Responsive Design – Make the interface work smoothly on mobile, tablet and desktop.
• Visual Style – Use consistent typography, spacing, icons and a professional color palette.

Suggested UI Pages:
1. Home / Landing Page
2. Login / Register
3. Dashboard
4. Main Project Feature
5. Results / Reports
6. Profile / Settings

Expected Outcome:
A functional, responsive and practical college project with a clear user experience and modular architecture.

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

Analyze the following project idea and create a practical, detailed project blueprint.

Project Idea:
${idea}

Provide the following sections:

1. Project Title
2. Problem Statement
3. Project Objective
4. Key Features
5. Technologies Required
6. Development Steps
7. Suggested Modules
8. UI/UX Design
9. Suggested UI Pages
10. Expected Outcome

For the UI/UX Design section, suggest:
- Landing page design
- Navigation structure
- Dashboard design
- Main feature screen
- Forms and input design
- Results screen
- Responsive mobile design
- Visual style and user experience

For Suggested UI Pages, list the important pages required for this specific project.

Make the recommendations specific to the given project idea.
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
        // QUOTA EXCEEDED → FALLBACK
        // ==========================================

        if (response.status === 429) {

            console.log(
                "Gemini quota exceeded. Using fallback blueprint."
            );

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