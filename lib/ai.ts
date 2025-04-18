import { GoogleGenerativeAI } from "@google/generative-ai";

// Init Gemini with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!); // Ensure this is set in your .env

export async function generateAISummary(content: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `Summarize this blog post in 3-5 lines:\n\n${content}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text;
  } catch (error) {
    console.error("Error generating AI summary:", error);
    return "Summary not available.";
  }
}

export async function generateTTS(content: string) {
  try {
    // Placeholder: Gemini doesn't provide built-in TTS as of now.
    // You can use Google Cloud Text-to-Speech API for actual TTS generation.
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return "/placeholder-audio.mp3";
  } catch (error) {
    console.error("Error generating TTS:", error);
    return "";
  }
}
