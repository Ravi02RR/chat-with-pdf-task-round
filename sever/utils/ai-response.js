const Groq = require("groq-sdk");

console.log(process.env.GROQ_API_KEY);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(fields, context) {
    try {
        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are an AI assistant helping to extract and format data for auto form filling. The following context is parsed data from a document: "${context}". Based on this information, extract relevant details for the fields: "${fields}". Ensure the response is a valid JSON object where keys match the field names and values are populated with the extracted data.`,
                },
                {
                    role: "user",
                    content: `Extract data for the following fields: ${fields}`,
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
