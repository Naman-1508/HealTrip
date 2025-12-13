import axios from 'axios';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { Chat } from '../models/Chat.js';
dotenv.config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY
});

// GET HISTORY
export const getHistory = async (req, res) => {
    try {
        const { userId } = req.query;
        if (!userId) return res.status(400).json({ status: "error", message: "User ID required" });

        const chat = await Chat.findOne({ userId });
        res.json({
            status: "success",
            data: chat ? chat.messages : []
        });
    } catch (error) {
        console.error("Get History Error:", error);
        res.status(500).json({ status: "error", message: "Failed to fetch history" });
    }
};

export const chat = async (req, res) => {
    try {
        const { message, userId } = req.body;

        // STEP 1: Use Groq to Understand User Intent & Extract Data
        const completion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a helper API. User sends a message. You must exact JSON:
                {
                    "intent": "medical" | "wellness" | "general" | "greeting",
                    "city": "detected city or null",
                    "topic": "medical condition or yoga style or null",
                    "is_greeting": boolean
                }
                Examples:
                "Hi there" -> {"intent":"greeting", "is_greeting":true}
                "I have cataract need surgery in Delhi" -> {"intent":"medical", "city":"Delhi", "topic":"cataract"}
                "Yoga retreat in Rishikesh" -> {"intent":"wellness", "city":"Rishikesh", "topic":"yoga"}
                "Suggest me travel itineraries for my eye disease cataract" -> {"intent":"medical", "city":null, "topic":"cataract"}
                `
                },
                {
                    role: "user",
                    content: message
                }
            ],
            model: "llama-3.3-70b-versatile",
            response_format: { type: "json_object" }
        });

        const aiAnalysis = JSON.parse(completion.choices[0].message.content);
        console.log("Groq Analysis:", aiAnalysis);

        let packages = [];
        let params = {
            city: aiAnalysis.city || '',
            topic: aiAnalysis.topic || ''
        };

        // STEP 2: Fetch Real Data based on AI Analysis (Multi-City Support)
        const fetchDiversePackages = async (baseUrl, preferredCity, defaultCities) => {
            let results = [];

            // If user specified a city, prioritize it
            if (preferredCity) {
                try {
                    const res = await axios.get(`${baseUrl}?city=${preferredCity}`);
                    if (res.data && Array.isArray(res.data)) results = res.data;
                } catch (e) {
                    console.error(`Error fetching for ${preferredCity}:`, e.message);
                }
            }

            // If no results yet (or no city specified), fetch from default hubs
            if (results.length === 0) {
                const promises = defaultCities.map(c => axios.get(`${baseUrl}?city=${c}`).catch(e => null));
                const responses = await Promise.all(promises);

                // Collect valid results
                responses.forEach(r => {
                    if (r && r.data && Array.isArray(r.data)) {
                        // Take top 1-2 from each city to ensure diversity
                        results.push(...r.data.slice(0, 2));
                    }
                });
            }

            // Shuffle and limit to 4 to show variety
            return results.sort(() => 0.5 - Math.random()).slice(0, 4);
        };

        if (aiAnalysis.intent === 'wellness') {
            const hubs = ['Rishikesh', 'Kerala', 'Goa'];
            const rawData = await fetchDiversePackages('http://localhost:8005/api/sessions/yoga', params.city, hubs);

            packages = rawData.map((item, i) => ({
                id: `yoga_${i}`,
                type: 'wellness',
                title: item.Center_Name,
                subtitle: item.Yoga_Style || params.topic || "Wellness Session",
                location: item.City,
                price: `₹${item.Price || 'On Request'}`,
                image: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&q=80&w=500"
            }));
        }
        else if (aiAnalysis.intent === 'medical') {
            const hubs = ['Delhi', 'Mumbai', 'Bangalore', 'Chennai'];
            const rawData = await fetchDiversePackages('http://localhost:8001/hospitals-by-city', params.city, hubs);

            packages = rawData.map((h, i) => ({
                id: `hosp_${i}`,
                type: 'medical',
                title: h.name,
                subtitle: params.topic ? `${params.topic} Treatment` : "Multi-Specialty Care",
                location: h.city,
                rating: h.rating,
                price: "Contact for Quote",
                image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=500"
            }));
        }

        // STEP 3: Generate Friendly Response using Groq
        let finalReply = "";

        const context = {
            user_message: message,
            data_found: packages.length > 0,
            package_count: packages.length,
            intent: aiAnalysis.intent,
            topic: params.topic,
            city: params.city || 'Multiple Cities'
        };

        const replyCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are 'Travel Buddy', a helpful medical tourism assistant.
                Tone: Friendly, casual, warm.
                Task: Write a short, 1-2 sentence reply.
                Context: ${JSON.stringify(context)}
                
                Rules:
                - If packages found: "I found some great [topic] options in [city] (and other top hubs)!"
                - If no packages: "Buddy, I couldn't find matches right now."
                `
                }
            ],
            model: "llama-3.3-70b-versatile",
        });

        finalReply = replyCompletion.choices[0].message.content;

        // --- SAVE HISTORY ---
        if (userId) {
            let chatSession = await Chat.findOne({ userId });
            if (!chatSession) {
                chatSession = new Chat({ userId, messages: [] });
            }

            // Add User Message
            chatSession.messages.push({
                role: 'user',
                content: message,
                type: 'text'
            });

            // Add Bot Message
            chatSession.messages.push({
                role: 'bot',
                content: finalReply,
                type: packages.length > 0 ? 'packages' : 'text',
                packages: packages
            });

            await chatSession.save();
        }

        res.json({
            status: packages.length > 0 ? "success" : (aiAnalysis.intent === 'greeting' ? "success" : "no_data"),
            data: {
                reply: finalReply,
                packages: packages
            }
        });

    } catch (error) {
        console.error("Buddy Controller Error:", error);
        res.status(500).json({
            status: "error",
            data: { reply: "Buddy, my brain is foggy. Can you try again?" }
        });
    }
};
