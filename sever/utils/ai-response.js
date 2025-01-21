const Groq = require("groq-sdk");

console.log(process.env.GROQ_API_KEY);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(question, context) {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `The following context is parsed data from a PDF document: "${context}". Use this information to answer the user's question.`,
                },
                {
                    role: "user",
                    content: question,
                },
            ],
            model: "llama-3.3-70b-versatile",
        });
        return response.choices[0]?.message?.content || "";
    } catch (error) {
        console.error("Error fetching Groq completion:", error);
        return "An error occurred while generating the response.";
    }
}


async function generateAiResponse(question, context) {
    const response = await getGroqChatCompletion(question, context);
    return response;
}



module.exports = { generateAiResponse };
