// utils/openai.ts
import OpenAI from "openai";

// Use OpenRouter's endpoint and API key
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

/**
 * Generates fashion recommendations based on user inputs.
 * @param params Object containing user fashion preferences and context.
 * @returns AI-generated style recommendations as a string.
 */
export async function generateFashionRecommendations(params: {
    bodyType: string;
    occasion: string;
    preferences?: string[];
    colorPreferences?: string[];
    season?: string;
    requirements?: string;
}) {
    const { bodyType, occasion, preferences, colorPreferences, season, requirements } = params;

    const prompt = `
    You are a professional fashion stylist. Based on:
    - Body Type: ${bodyType}
    - Occasion: ${occasion}
    - Preferences: ${preferences?.join(", ") || "none"}
    - Color Preferences: ${colorPreferences?.join(", ") || "none"}
    - Season: ${season || "not specified"}
    - Special Requirements: ${requirements || "none"}
    
    Recommend:
    1. Suggested apparel categories (tops, bottoms, dresses, shoes).
    2. Color palette.
    3. Accessory ideas.
    4. Style tips.
    Format clearly, and suggest products with clickable links in Markdown if possible.
  `;

    const aiResponse = await openai.chat.completions.create({
        model: "openai/gpt-4o-mini", // you can swap with any OpenRouter-supported model
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
    });

    return aiResponse.choices[0]?.message?.content || "";
}
