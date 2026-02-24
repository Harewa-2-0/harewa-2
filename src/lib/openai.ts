// utils/openai.ts
import OpenAI from "openai";

// Use OpenRouter's endpoint and API key
const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

/**
 * Generates fashion recommendations and handles StyleForge AI logic.
 */
export async function generateFashionRecommendations(params: {
    messages: any[];
    image?: string; // base64 or URL
    userId?: string;
    botName?: string;
    usePublicData?: boolean;
}) {
    const { messages, image, userId, botName = "StyleForge AI", usePublicData = false } = params;

    const publicDataInstruction = usePublicData
        ? "- You may use your general knowledge to provide fashion advice, history, and styling tips beyond our specific inventory."
        : "- Strictly limit your advice and recommendations to our platform's inventory and tailoring capabilities. Do not suggest or define generic fashion items outside of our context.";

    const systemPrompt = `
You are ${botName} — an intelligent fashion assistant integrated into an online fashion marketplace.

Your purpose is to help users discover fashion items, recreate outfits from images, place custom orders, provide styling advice, and connect users with human representatives when necessary.

You operate as a friendly, knowledgeable, and culturally aware fashion expert and shopping assistant, specifically aware of African prints (aso-ebi, senator wear, agbada, etc.) and global trends.

BEHAVIORAL GUIDELINES:
- Be conversational and friendly
- Keep responses short but informative
- Avoid asking too many questions. Instead, make your best recommendation based on available information. Only ask a question if absolutely necessary to proceed.
- Avoid hallucinating unavailable products
- Prioritize platform inventory first
${publicDataInstruction}
- Encourage custom tailoring when product unavailable
- Support both male and female fashion styles
- When suggesting a product from search, always include its image as a clickable link using Markdown: [![Product Name](image_url)](/shop/[id])

IMAGE ANALYSIS (If image provided):
When analyzing outfit images, respond using this format:
Outfit Analysis:
- Style:
- Primary Colors: primary colors and palette
- Fabric Type: e.g. Cotton, Lace, Silk, Aso Oke
- Clothing Components: e.g. Kaftan, Trousers, Cap
- Suggested Occasion: e.g. Wedding, Corporate
- Similar Products: [List similar items from platform]
- Custom Tailoring Option: [Suggested approach for a custom order]

CUSTOM ORDERS:
If a user asks "Make something similar to this" or similar:
Return this format:
Custom Order Draft:
Outfit Description:
Fabric Suggestion:
Color Options:
Estimated Complexity:
Estimated Price Range:
Tailoring Notes:
Next Information Needed: [Ask for Size, Budget, Timeline, etc.]

HUMAN ESCALATION:
If user requests help with complaints, disputes, or complex tailoring, say:
"Let me connect you with a fashion consultant." 
(This will trigger a handoff flag).
`;

    const chatMessages: any[] = [
        { role: "system", content: systemPrompt },
        ...messages
    ];

    if (image) {
        // Multi-modal support
        chatMessages.push({
            role: "user",
            content: [
                { type: "text", text: "Please analyze this outfit image." },
                {
                    type: "image_url",
                    image_url: {
                        url: image.startsWith("data:") ? image : `data:image/jpeg;base64,${image}`,
                    },
                },
            ],
        });
    }

    const tools: any[] = [
        {
            type: "function",
            function: {
                name: "search_products",
                description: "Search for fashion products on the platform.",
                parameters: {
                    type: "object",
                    properties: {
                        search: { type: "string", description: "Search query" },
                        category: { type: "string", description: "Category ID or name" },
                        gender: { type: "string", enum: ["male", "female", "unisex"] },
                        minPrice: { type: "number" },
                        maxPrice: { type: "number" },
                        fabricType: { type: "string", description: "Fabric type name (e.g. Cotton, Lace, Silk)" },
                    },
                },
            },
        },
        {
            type: "function",
            function: {
                name: "escalate_to_human",
                description: "Escalate the conversation to a human fashion consultant.",
                parameters: {
                    type: "object",
                    properties: {
                        reason: { type: "string", description: "Reason for escalation" },
                    },
                },
            },
        }
    ];

    const aiResponse = await openai.chat.completions.create({
        model: "google/gemini-2.0-flash-001",
        messages: chatMessages,
        tools,
        tool_choice: "auto",
        temperature: 0.7,
        max_tokens: 500,
    });
    console.log(aiResponse.choices[0]?.message);
    return aiResponse.choices[0]?.message || null;
}
