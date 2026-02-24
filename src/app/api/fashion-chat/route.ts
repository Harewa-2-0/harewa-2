export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// app/api/fashion-chat/route.ts
import { FashionChat } from "@/lib/models/FashionChat";
import { Product } from "@/lib/models/Product";
import { ProductCategory } from "@/lib/models/ProductCategory";
import { Fabric } from "@/lib/models/Fabric";
import { AiSettings } from "@/lib/models/AiSettings";
import mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { NextRequest } from "next/server";
import { ok, badRequest, serverError } from "@/lib/response";
import { generateFashionRecommendations } from "@/lib/openai";
import { requireAuth } from "@/lib/middleware/requireAuth";
import { getClientIp } from "@/lib/utils";


// POST — Create chat
export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        let userId: string | null = null;
        let ip: string | null = null;

        try {
            const decoded = requireAuth(req);
            userId = decoded.sub;
        } catch {
            ip = getClientIp(req);
        }

        const { messages, image } = body;

        if (!messages || !Array.isArray(messages)) {
            return badRequest("Messages array is required");
        }

        // Fetch AI Settings
        const settings = await AiSettings.findOne({}).lean() as { botName?: string; usePublicData?: boolean } | null;

        // Call AI utility
        let aiMessage = await generateFashionRecommendations({
            messages,
            image,
            userId: userId || undefined,
            botName: settings?.botName,
            usePublicData: settings?.usePublicData
        });

        let handoffRequired = false;

        // Handle tool calls
        if (aiMessage?.tool_calls) {
            const toolResults = [];

            for (const toolCall of aiMessage.tool_calls) {
                // Assert it as any or specifically an object with `.function` to bypass OpenRouter TS type mismatches
                const call = toolCall as any;
                if (!call.function) continue;

                const { name } = call.function;
                const args = JSON.parse(call.function.arguments);

                if (name === "search_products") {
                    const { search, category, gender, minPrice, maxPrice, fabricType } = args;
                    // Build search query (simplified for now, mimicking product route logic)
                    const filter: any = {};

                    if (category) {
                        // Check if it's a valid ObjectId, otherwise treat as name
                        if (mongoose.Types.ObjectId.isValid(category)) {
                            filter.category = category;
                        } else {
                            // Try to find category by name
                            const cat = await ProductCategory.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
                            if (cat) {
                                filter.category = cat._id;
                            } else {
                                // Fallback: if name doesn't match exactly, try partial match
                                const partialCat = await ProductCategory.findOne({ name: { $regex: new RegExp(category, 'i') } });
                                if (partialCat) {
                                    filter.category = partialCat._id;
                                }
                                // If still not found, we just won't filter by category to be helpful
                            }
                        }
                    }

                    if (fabricType) {
                        if (mongoose.Types.ObjectId.isValid(fabricType)) {
                            filter.fabricType = fabricType;
                        } else {
                            const fab = await Fabric.findOne({ name: { $regex: new RegExp(`^${fabricType}$`, 'i') } });
                            if (fab) {
                                filter.fabricType = fab._id;
                            } else {
                                const partialFab = await Fabric.findOne({ name: { $regex: new RegExp(fabricType, 'i') } });
                                if (partialFab) {
                                    filter.fabricType = partialFab._id;
                                }
                            }
                        }
                    }

                    if (gender) filter.gender = gender;
                    if (minPrice || maxPrice) {
                        filter.price = {};
                        if (minPrice) filter.price.$gte = minPrice;
                        if (maxPrice) filter.price.$lte = maxPrice;
                    }
                    if (search) filter.name = { $regex: search, $options: "i" };

                    const products = await Product.find(filter).limit(5).lean();
                    const simplifiedProducts = products.map((p: any) => ({
                        id: p._id,
                        name: p.name,
                        price: p.price,
                        category: p.category,
                        description: p.description,
                        image_url: p.mainImage || (p.images && p.images.length > 0 ? p.images[0] : "")
                    }));
                    toolResults.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name,
                        content: JSON.stringify(simplifiedProducts),
                    });
                } else if (name === "escalate_to_human") {
                    handoffRequired = true;
                    toolResults.push({
                        tool_call_id: toolCall.id,
                        role: "tool",
                        name,
                        content: JSON.stringify({ status: "escalated", message: "A fashion consultant has been notified." }),
                    });
                }
            }

            // Get final response after tool results
            const secondResponse = await generateFashionRecommendations({
                messages: [...messages, aiMessage, ...toolResults],
                userId: userId || undefined,
                botName: settings?.botName,
                usePublicData: settings?.usePublicData
            });
            aiMessage = secondResponse;
        }

        let recommendations = aiMessage?.content || "";
        if (!recommendations.trim()) {
            if (aiMessage?.tool_calls) {
                // Occurs if the model tries to chain another tool call
                recommendations = "I am looking for some options for you...";
            } else {
                recommendations = "Here are some suggestions based on your request. Let me know if you need anything else!";
            }
        }

        const chat = new FashionChat({
            user: userId || null,
            ip: ip || null,
            messages: [
                ...messages,
                { role: "assistant", content: recommendations },
            ],
            handoffRequired,
            recommendations,
        });

        await chat.save();

        return ok({
            message: "Style recommendations generated",
            chat,
            handoffRequired,
            reply: {
                role: "assistant",
                content: recommendations,
                timestamp: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error("Chat Error:", err);
        return serverError("Failed to process chat: " + (err instanceof Error ? err.message : String(err)));
    }
}

// GET — Fetch chats
export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        let userId: string | null = null;
        let ip: string | null = null;

        try {
            const decoded = requireAuth(req);
            userId = decoded.sub;
        } catch {
            ip = getClientIp(req);
        }

        let chats;
        if (userId) {
            chats = await FashionChat.find({ user: userId }).sort({ createdAt: -1 });
        } else {
            chats = await FashionChat.find({ ip }).sort({ createdAt: -1 });
        }

        return ok({ chats });
    } catch (err) {
        return serverError("Failed to fetch chats: " + err);
    }
}
