import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateChatResponse = async (message) => {

  console.log("GEMINI KEY:", process.env.GEMINI_API_KEY);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest"
  });

  const prompt = `
You are an AI Veterinary Assistant helping farmers.

Guidelines:
- Answer in simple language.
- Focus on animal health and diseases.
- If farmer asks about cows, goats, buffalo, poultry etc give practical advice.
- Suggest when to consult a veterinarian.

Farmer Question:
${message}

Provide a short helpful response.
`;

  const result = await model.generateContent(prompt);

  const text = result.response.text();

  const cleanedText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  console.log("AI Chat Response :", cleanedText); // Debug log

  return cleanedText;
};