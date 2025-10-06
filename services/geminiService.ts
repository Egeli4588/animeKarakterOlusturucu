/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/



import { GoogleGenAI, GenerateContentResponse, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const imageModel = 'gemini-2.5-flash-image';

export const convertToAnime = async (
    base64UserImage: string,
    mimeType: string,
): Promise<string | null> => {
  try {
    const imagePart = {
      inlineData: {
        data: base64UserImage,
        mimeType,
      },
    };

    const textPart = {
      text: 'Convert this photo of a person into a vibrant, high-quality anime character. The anime character should strongly resemble the person in the photo, capturing their key facial features, hair style, and expression. The final output should be only the image of the anime character with a simple, clean background. Do not add any text or borders.'
    };
    
    const imageGenResponse: GenerateContentResponse = await ai.models.generateContent({
        model: imageModel,
        contents: [{
            parts: [imagePart, textPart],
        }],
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });

    const responseParts = imageGenResponse.candidates?.[0]?.content?.parts;
    if (!responseParts) {
        throw new Error("Modelden geçersiz yanıt alındı.");
    }

    const imageResponsePart = responseParts.find(p => p.inlineData);
    if (!imageResponsePart?.inlineData?.data) {
        const text = responseParts.find(p => p.text)?.text;
        throw new Error(`Model bir resim döndürmedi. Yanıt: ${text ?? "<metin yok>"}`);
    }
    
    return `data:${imageResponsePart.inlineData.mimeType};base64,${imageResponsePart.inlineData.data}`;
  } catch (error) {
    console.error("Animeye dönüştürme sırasında hata:", error);
    throw new Error(`Resim işlenemedi. ${error instanceof Error ? error.message : ''}`);
  }
};