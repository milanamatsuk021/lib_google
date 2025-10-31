
import { GoogleGenAI, Type } from "@google/genai";
import { Book, BookCategory, RecommendedBook } from '../types';

export const getRecommendationsFromGemini = async (booksForAnalysis: Book[]): Promise<RecommendedBook[]> => {
    const bookList = booksForAnalysis.map((b) => `${b.title} (${b.author})`).join(', ');
    const prompt = `На основе этих книг, которые я прочитал: ${bookList}. Порекомендуй 10 новых книг, которые могут мне понравиться. Для каждой книги укажи название, автора и краткое объяснение (одно предложение), почему она мне подходит. Твой ответ должен быть в формате JSON-массива объектов, где каждый объект имеет ключи "title", "author" и "reason".`;

    const ai = new GoogleGenAI({apiKey: process.env.API_KEY});
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
                        title: { type: Type.STRING },
                        author: { type: Type.STRING },
                        reason: { type: Type.STRING },
                    },
                    required: ["title", "author", "reason"],
                },
            },
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText);
};
