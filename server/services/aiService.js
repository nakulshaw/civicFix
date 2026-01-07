const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY");

exports.analyzeIssue = async (title, description) => {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });

        const prompt = `
      Analyze the following civic issue report and provide a JSON response.
      Title: ${title}
      Description: ${description}

      Output format:
      {
        "category": "One of [Roads, Electricity, Sanitation, Water, Traffic, Other]",
        "priority_score": "Integer 1-10 based on severity and urgency",
        "summary": "A concise 1-sentence summary",
        "department": "Relevant government department (e.g., Public Works, Electricity Board)"
      }
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(jsonStr);
    } catch (error) {
        console.error("AI Analysis Failed:", error);
        // Fallback if AI fails or no key
        return {
            category: "Other",
            priority_score: 1,
            summary: title,
            department: "General"
        };
    }
};
