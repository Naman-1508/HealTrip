import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * AI Controller
 * Handles interactions with Hugging Face Inference API
 */

const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2";

export const chatWithAI = async (req, res) => {
    try {
        const { message, context, history } = req.body;

        if (!message) {
            return errorResponse(res, 400, "Message is required");
        }

        const token = process.env.HF_API_TOKEN;

        // If no token provided, return a simulated smart response (fallback)
        // This ensures the app works even without configuration
        if (!token) {
            console.log("No HF_API_TOKEN found. Using heuristic fallback.");
            return successResponse(res, 200, {
                reply: generateFallbackResponse(message, context),
                source: "simulated"
            }, "Simulated response (Add HF_API_TOKEN to .env for real AI)");
        }

        // Construct prompt for Mistral
        // We instruct it to be a helpful medical assistant
        const systemPrompt = `You are HealAI, a compassionate and professional medical assistant. 
        Your goal is to help patients organize their medical information.
        - Be concise and reassuring.
        - If they mention symptoms, acknowledge them.
        - Do not give definitive medical diagnoses (you are an AI).
        - Ask clarifying questions to gather history (age, chronic conditions, medications).
        
        Context (Symptoms found so far): ${JSON.stringify(context || {})}
        `;

        const fullPrompt = `<s>[INST] ${systemPrompt} \n\n User: ${message} [/INST]`;

        const response = await fetch(HF_API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                inputs: fullPrompt,
                parameters: {
                    max_new_tokens: 250,
                    temperature: 0.7,
                    return_full_text: false
                }
            })
        });

        if (!response.ok) {
            throw new Error(`HF API Error: ${response.statusText}`);
        }

        const result = await response.json();

        // HF returns array [{ generated_text: "..." }]
        let aiReply = result[0]?.generated_text || "I'm having trouble thinking right now. Could you repeat that?";

        return successResponse(res, 200, {
            reply: aiReply.trim(),
            source: "mistral-7b"
        }, "AI Response generated");

    } catch (error) {
        console.error("AI Chat Error:", error);
        // Fallback on error too
        return successResponse(res, 200, {
            reply: generateFallbackResponse(req.body.message, req.body.context),
            source: "fallback-error"
        }, "Fallback response due to AI error");
    }
};

// Simple heuristic fallback (moved from frontend to backend)
const generateFallbackResponse = (text, context) => {
    const lower = text.toLowerCase();
    let responseParts = [];

    // 0. Extract Personality/Tone
    const casualMatch = lower.match(/\b(buddy|bro|dude|mate|friend|pal|doc)\b/);
    const userTerm = casualMatch ? casualMatch[0] : null;

    // 1. Check for Greetings (with variety)
    if (/\b(hi|hello|hey|greetings|morning|afternoon)\b/.test(lower)) {
        const greetings = [
            `Hello${userTerm ? " " + userTerm : ""}! I'm HealAI.`,
            `Hey${userTerm ? " " + userTerm : ""}! I'm here to help.`,
            `Hi there! Ready to assist you.`
        ];
        // Pick random greeting
        responseParts.push(greetings[Math.floor(Math.random() * greetings.length)]);
    }

    // 2. Check for Symptoms
    const symptomMatch = lower.match(/(fever|pain|headache|cough|cold|flu|symptom|hurt|ache|dizzy|nausea|vomit|rash|swelling|infection)\b/g);
    if (symptomMatch) {
        // Unique symptoms only 
        const uniqueSymptoms = [...new Set(symptomMatch)];
        responseParts.push(`I see you're mentioning ${uniqueSymptoms.join(" and ")}. I've noted that down.`);
    }

    // 3. Check for Medical History terms
    const historyMatch = lower.match(/(diabetes|sugar|bp|pressure|thyroid|asthma|surgery|operation|medication|tablet|drug)\b/g);
    if (historyMatch) {
        const uniqueHistory = [...new Set(historyMatch)];
        responseParts.push(`Got it, added ${uniqueHistory.join(", ")} to your medical history.`);
    }

    // 4. Fallback construction
    if (responseParts.length > 0) {
        // If we found symptoms/history but no greeting, and no previous parts, add a generic opener
        if (responseParts.length === 0) {
            // This case is unlikely due to check > 0 but safe keeping
        } else if (!responseParts[0].includes("Hello") && !responseParts[0].includes("Hi") && !responseParts[0].includes("Hey")) {
            // If we jumped straight to symptoms, maybe add a polite prefix?
            // "I see you're mentioning fever..." is fine on its own.
        }

        // Add a follow-up question if just greeting
        if (responseParts.length === 1 && responseParts[0].includes("HealAI")) {
            responseParts.push("How are you feeling right now?");
        } else if (symptomMatch) {
            responseParts.push("Any other symptoms?");
        }

        return responseParts.join(" ");
    }

    // 5. Generic fallback if absolutely nothing matched
    const genericResponses = [
        "I'm listening. Could you please describe your symptoms?",
        "I'm here. specific symptoms allow me to help you better.",
        "Could you provide more details about how you're feeling?"
    ];
    return genericResponses[Math.floor(Math.random() * genericResponses.length)];
};
```
