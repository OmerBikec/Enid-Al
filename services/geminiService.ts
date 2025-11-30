
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a detailed homework assignment structure based on a topic.
 */
export const generateAssignmentIdea = async (topic: string, level: string = "Lise"): Promise<{ title: string; description: string }> => {
  try {
    const prompt = `
      Sen deneyimli bir öğretmensin. Aşağıdaki konu ve seviye için öğrencilere verilecek detaylı bir ödev hazırla.
      
      Konu: ${topic}
      Seviye: ${level}
      
      Çıktıyı JSON formatında ver.
      Alanlar:
      - title: Ödev başlığı (kısa ve öz)
      - description: Ödevin detaylı açıklaması, beklentiler ve adımlar. (Markdown formatında olabilir)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
          },
          required: ["title", "description"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI yanıt vermedi.");

    return JSON.parse(text);
  } catch (error) {
    console.error("Assignment Generation Error:", error);
    throw error;
  }
};

/**
 * Analyzes a student submission and suggests a grade and feedback.
 */
export const generateFeedbackSuggestion = async (assignmentTitle: string, submissionContent: string): Promise<{ grade: number; feedback: string }> => {
  try {
    const prompt = `
      Sen bir öğretmensin. Aşağıdaki öğrenci ödevini incele ve yapıcı bir geri bildirim ile 100 üzerinden bir not öner.
      
      Ödev Konusu: ${assignmentTitle}
      Öğrenci Cevabı: "${submissionContent}"
      
      Çıktıyı JSON formatında ver.
      Alanlar:
      - grade: 0-100 arası tam sayı önerilen not.
      - feedback: Öğrenciye hitaben yazılmış, gelişim odaklı, nazik ve eğitici geri bildirim (Türkçe).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            grade: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
          },
          required: ["grade", "feedback"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI yanıt vermedi.");

    return JSON.parse(text);
  } catch (error) {
    console.error("Feedback Generation Error:", error);
    return { grade: 70, feedback: "Otomatik değerlendirme yapılamadı. Lütfen manuel kontrol ediniz." };
  }
};

/**
 * Generates quiz questions for an exam.
 */
export const generateQuizQuestions = async (topic: string, count: number = 5): Promise<Array<{ text: string, options: string[], correctAnswer: string }>> => {
  try {
    const prompt = `
      Konu: ${topic}
      
      Bu konu hakkında öğrencileri test etmek için ${count} adet çoktan seçmeli soru hazırla.
      Her sorunun 4 şıkkı olsun.
      
      Çıktıyı JSON formatında ver. Array of objects:
      - text: Soru metni
      - options: 4 seçenekli string array
      - correctAnswer: Doğru seçeneğin kendisi (string olarak)
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING }
            },
            required: ["text", "options", "correctAnswer"]
          }
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("AI yanıt vermedi.");
    return JSON.parse(text);
  } catch (error) {
    console.error("Quiz Generation Error:", error);
    return [];
  }
};

/**
 * Chat with Gemini for Student Assistant
 */
export const chatWithStudentAssistant = async (message: string, history: Array<{role: 'user' | 'model', parts: {text: string}[]}>) => {
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: "Sen 'Enid AI Asistanı' adında, öğrencilere derslerinde, ödevlerinde ve planlamalarında yardımcı olan neşeli, motive edici ve bilgili bir yapay zeka asistanısın. Türkçe konuş. Kısa ve öz cevaplar ver."
      },
      history: history
    });

    const response = await chat.sendMessage({ message });
    return response.text;
  } catch (error) {
    console.error("Chat Error:", error);
    return "Üzgünüm, şu an bağlantımda bir sorun var.";
  }
};