import { GoogleGenerativeAI } from "@google/generative-ai";

export const generateAIRemedy = async (animalName, diseaseName) => {

  console.log("GEMINI KEY For AI Remedy Service :", process.env.GEMINI_API_KEY);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

  const model = genAI.getGenerativeModel({
    model: "gemini-flash-latest",
  });

  // force Gemini to return structured JSON using generationConfig
  //   const model = genAI.getGenerativeModel({
  //   model: "gemini-flash-latest",
  //   generationConfig: {
  //     response_mime_type: "application/json",
  //   },
  // });

  const prompt = `
You are a veterinary AI assistant helping farmers.
  
Provide remedies for the ${animalName} with the disease: ${diseaseName}

Return response in JSON format:

{
  "firstAid": ["step1","step2","step3","step4"],
  "precautions": ["precaution1","precaution2","precaution3","precaution4"],
  "vetConsultation": "short veterinary advice"
}

Keep the instructions simple for farmers.
`;

  const result = await model.generateContent(prompt);

  const text = result.response.text();

  // Remove ```json and ``` if present
  const cleanedText = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  console.log("AI Remedy Response:", cleanedText); // Debug log

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("Error parsing AI response:", error);
    return {
      firstAid: [],
      precautions: [],
      vetConsultation: cleanedText,
    };
  }
};
