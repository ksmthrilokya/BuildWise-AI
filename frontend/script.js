const ideaInput = document.getElementById("idea");
const analyzeBtn = document.getElementById("analyzeBtn");
const output = document.getElementById("output");
const characterCount = document.getElementById("characterCount");

ideaInput.addEventListener("input", () => {
    characterCount.textContent = `${ideaInput.value.length} characters`;
});

analyzeBtn.addEventListener("click", async () => {
    const idea = ideaInput.value.trim();

    if (!idea) {
        output.innerHTML = "<p>Please enter a project idea first.</p>";
        return;
    }

    output.innerHTML = `
        <div class="loading">
            <div class="loader"></div>
            <h3>🤖 BuildWise AI is thinking...</h3>
            <p>Creating your project blueprint</p>
        </div>
    `;

    output.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

    try {
        const response = await fetch("http://localhost:5000/analyze", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ idea })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Something went wrong");
        }

        output.innerHTML = `
            <div class="blueprint-header">
                <div class="blueprint-icon">🚀</div>
                <div>
                    <h2>AI Project Blueprint</h2>
                    <p>Your personalized project roadmap is ready.</p>
                </div>
            </div>

            <div class="idea-box">
                <span>YOUR PROJECT IDEA</span>
                <p>${idea}</p>
            </div>

            <div class="blueprint-content">
                ${formatBlueprint(data.blueprint)}
            </div>

            <button id="newProjectBtn" class="new-project-btn">
                ← Analyze Another Project
            </button>
        `;

        output.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

        document
            .getElementById("newProjectBtn")
            .addEventListener("click", () => {
                ideaInput.value = "";
                characterCount.textContent = "0 characters";

                window.scrollTo({
                    top: 0,
                    behavior: "smooth"
                });

                setTimeout(() => {
                    ideaInput.focus();
                }, 500);
            });

    } catch (error) {
        console.error(error);

        output.innerHTML = `
            <div class="error-box">
                <h3>❌ Something went wrong</h3>
                <p>Could not generate the blueprint.</p>
                <small>Make sure Ollama and the backend server are running.</small>
            </div>
        `;
    }
});


function formatBlueprint(text) {
    let html = text;

    // Convert headings
    html = html.replace(
        /\*\*(.*?)\*\*/g,
        '<div class="blueprint-section"><h3>$1</h3>'
    );

    // Close sections before the next heading
    html = html.replace(
        /(<div class="blueprint-section"><h3>.*?<\/h3>)(?=<div class="blueprint-section">)/gs,
        "$1</div>"
    );

    // Convert numbered lists
    html = html.replace(
        /(?:^|\n)(\d+)\.\s+(.*)/g,
        '<li>$2</li>'
    );

    // Convert bullet lists
    html = html.replace(
        /(?:^|\n)[*-]\s+(.*)/g,
        '<li>$1</li>'
    );

    // Line breaks
    html = html.replace(/\n/g, "<br>");

    // Close final section
    html += "</div>";

    return html;
}