import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, FileText, X, Bot, User, ChevronRight, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import Threads from "../components/Threads";
import SpotlightCard from "../components/SpotlightCard";

export default function HealChat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'bot',
      content: "Hey buddy! 👋 I'm your Travel Buddy. Tell me what you're looking for (e.g., 'Cancer treatment', 'Yoga in Rishikesh') and I'll find the best packages for you!",
      type: 'text'
    }
  ]);
  const { user } = useUser();
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load History
  useEffect(() => {
    if (user) {
        fetch(`http://localhost:5000/api/buddy/history?userId=${user.id}`)
            .then(res => res.json())
            .then(data => {
                if (data.status === 'success' && data.data.length > 0) {
                    setMessages(data.data.map(m => ({
                        ...m,
                        id: m._id || Date.now() + Math.random(), // fallback ID
                    }))); 
                }
            })
            .catch(err => console.error("History Fetch Error", err));
    }
  }, [user]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input,
      type: 'text'
    };

    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
        const response = await fetch('http://localhost:5000/api/buddy/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                message: userMsg.content,
                userId: user ? user.id : null 
            })
        });

        const data = await response.json();
        
        if (data.status === 'success' || data.status === 'no_data') {
            const botMsg = {
                id: Date.now() + 1,
                role: 'bot',
                content: data.data.reply,
                packages: data.data.packages || [], 
                type: data.data.packages?.length > 0 ? 'packages' : 'text'
            };
            setMessages(prev => [...prev, botMsg]);
        } else {
            throw new Error('Invalid response');
        }

    } catch (error) {
        console.error("Buddy Error:", error);
        const botMsg = {
            id: Date.now() + 1,
            role: 'bot',
            content: "My connection is a bit spotty, buddy. Try again in a sec!",
            type: 'text'
        };
        setMessages(prev => [...prev, botMsg]);
    } finally {
        setIsTyping(false);
    }
  };

  return (
    <div className="relative pt-24 pb-10 min-h-screen bg-zinc-950 flex justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
            <Threads amplitude={1} distance={0} color={[0.4, 0.2, 0.8]} />
        </div>

      <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col h-[85vh]">
        {/* CHAT INTERFACE */}
        <SpotlightCard className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 flex flex-col overflow-hidden rounded-2xl relative">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-white text-lg">Travel Buddy</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-zinc-400">Online • Your Trip Assistant</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {messages.map((msg) => (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={msg.id}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-zinc-800' : 'bg-transparent'}`}>
                        {msg.role === 'user' ? <User className="w-5 h-5 text-zinc-400" /> : null}
                    </div>

                    {/* Bubble */}
                    <div
                        className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${
                        msg.role === 'user'
                            ? 'bg-emerald-600 text-white rounded-tr-none font-medium'
                            : 'bg-zinc-800/80 text-zinc-100 border border-white/5 rounded-tl-none'
                        }`}
                    >
                        <p>{msg.content}</p>
                    </div>
                </div>

                {/* Packages (Horizontal Scroll) */}
                {msg.type === 'packages' && msg.packages.length > 0 && (
                    <div className="w-full mt-4 pl-12 overflow-x-auto pb-4 hide-scrollbar">
                        <div className="flex gap-4 w-max">
                            {msg.packages.map((pkg, i) => (
                                <div 
                                    key={i} 
                                    onClick={() => navigate('/package', { 
                                        state: { 
                                            hospital: {
                                                _id: pkg.id,
                                                name: pkg.title,
                                                address: { city: pkg.location, country: "India" },
                                                rating: pkg.rating || 4.5,
                                                specialty: pkg.subtitle,
                                                image: pkg.image,
                                                images: [{ url: pkg.image }],
                                                price: pkg.price
                                            }
                                        } 
                                    })}
                                    className="w-64 bg-zinc-900 border border-white/10 rounded-xl overflow-hidden hover:border-emerald-500/50 transition cursor-pointer group"
                                >
                                    <div className="h-32 bg-zinc-800 relative">
                                        <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                                        <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] font-bold text-white uppercase backdrop-blur-sm">
                                            {pkg.type}
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-bold text-white text-sm truncate">{pkg.title}</h4>
                                        <p className="text-xs text-zinc-400 mb-2 truncate">{pkg.location}</p>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-emerald-400 font-bold">{pkg.price}</span>
                                            <button className="bg-white/10 hover:bg-white/20 text-white px-2 py-1 rounded transition">View Plan</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
              </motion.div>
            ))}
            
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start pl-11">
                <div className="bg-zinc-800/50 px-4 py-3 rounded-2xl rounded-tl-none border border-white/5 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                  <span className="w-1.5 h-1.5 bg-zinc-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-white/5 flex gap-3 items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Buddy..."
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-full px-6 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all outline-none"
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 bg-emerald-600 text-white rounded-full hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </SpotlightCard>
      </div>
    </div>
  );
}
