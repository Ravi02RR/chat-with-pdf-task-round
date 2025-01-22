const Groq = require("groq-sdk");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function getGroqChatCompletion(fields, context) {
    try {
      
        const requestedFields = Object.entries(fields)
            .filter(([_, value]) => value === true)
            .map(([key]) => key)
            .join(', ');

        const prompt = `
        You are an AI assistant helping to extract specific data fields from a document.
        
        Context from the document: "${context}"
        
        Return ONLY a simple JSON object containing these fields: ${requestedFields}
        
        Rules:
        1. Return ONLY the exact fields requested, nothing else
        2. Return as a plain JSON object, no markdown, no explanations
        3. Use exactly the same field names as requested
        4. If a field isn't found, leave it empty/null
        
        Example format:
        {
          "Name": "John Doe",
          "Phone": "+1234567890"
        }`;

        const response = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: prompt
                },
                {
                    role: "user",
                    content: `Extract only these fields: ${requestedFields}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, 
        });

        const content = response.choices[0]?.message?.content || "";
        
      
        try {
            
            const jsonMatch = content.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }
            return JSON.parse(content);
        } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            return {};
        }
    } catch (error) {
        console.error("Error fetching Groq completion:", error);
        return {};
    }
}

async function generateAiResponse(fields, context) {
    const response = await getGroqChatCompletion(fields, context);
    return response;
}

module.exports = { generateAiResponse };