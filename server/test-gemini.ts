import { GoogleGenAI } from "@google/genai";

async function testGemini() {
  console.log('🧪 Testing Gemini API with simple request...');
  
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "أعط توصية استثمارية بسيطة لشخص لديه 50000 درهم. رد بجملة واحدة فقط."
    });

    console.log('✅ Success:', response.text);
    return true;
  } catch (error) {
    console.error('❌ Error:', error);
    return false;
  }
}

testGemini();