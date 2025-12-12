import { useState, useRef, useEffect } from "react";
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
      content: "Hello! I'm HealAI. I can help organize your medical records. Feel free to upload reports or describe your symptoms.",
      type: 'text'
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [medicalRecord, setMedicalRecord] = useState({
    symptoms: [],
    history: [],
    vitals: {},
    files: []
  });
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Enhanced extraction analysis
  const analyzeInput = (text) => {
    const keywords = {
      symptoms: ['fever', 'headache', 'pain', 'cough', 'nausea', 'dizzy', 'fatigue', 'rash', 'swelling', 'vomiting', 'chills'],
      history: ['diabetes', 'asthma', 'hypertension', 'surgery', 'allergy', 'thyroid', 'cancer'],
      vitals: ['bp', 'blood pressure', 'sugar', 'weight', 'height', 'temp', 'pulse']
    };

    const lowerText = text.toLowerCase();
    const foundData = { symptoms: [], history: [], vitals: [] };

    keywords.symptoms.forEach(s => {
      if (lowerText.includes(s)) foundData.symptoms.push(s);
    });
    keywords.history.forEach(h => {
      if (lowerText.includes(h)) foundData.history.push(h);
    });
    
    return foundData;
  };

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

    // Smart Response Logic via Backend
    try {
        const lowerInput = userMsg.content.toLowerCase();
        const extracted = analyzeInput(userMsg.content);
        
        // Immediate local analysis for side panel (fast feedback)
        if (extracted.symptoms.length > 0 || extracted.history.length > 0) {
             setMedicalRecord(prev => {
              const newRecord = { ...prev };
              extracted.symptoms.forEach(s => { if (!newRecord.symptoms.includes(s)) newRecord.symptoms.push(s); });
              extracted.history.forEach(h => { if (!newRecord.history.includes(h)) newRecord.history.push(h); });
              return newRecord;
            });
        }

        // Call Backend AI
        const response = await fetch('http://localhost:5000/api/ai/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: input,
                context: medicalRecord // Send gathered symptoms for context
            })
        });

        const data = await response.json();
        
        if (!response.ok) throw new Error(data.message || 'Failed to get AI response');

        const botMsg = {
            id: Date.now() + 1,
            role: 'bot',
            content: data.data.reply, // From backend response structure
            type: 'text'
        };
        
        setMessages(prev => [...prev, botMsg]);
    } catch (error) {
        console.error("Chat Error:", error);
        toast.error("HealAI is having trouble connecting. Using offline mode.");
        
        // Fallback offline response
        const botMsg = {
            id: Date.now() + 1,
            role: 'bot',
            content: "I'm having trouble connecting to the server, but I've updated your local record summary.",
            type: 'text'
        };
        setMessages(prev => [...prev, botMsg]);
    } finally {
        setIsTyping(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileMsg = {
      id: Date.now(),
      role: 'user',
      content: `Uploaded: ${file.name}`,
      type: 'file',
      fileName: file.name
    };

    setMessages(prev => [...prev, fileMsg]);
    setIsTyping(true);

    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        role: 'bot',
        content: "I've received your report. I'll analyze it and extract the key medical details for your summary.",
        type: 'text'
      };
      
      setMessages(prev => [...prev, botMsg]);
      setMedicalRecord(prev => ({
        ...prev,
        files: [...prev.files, file.name]
      }));
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="relative pt-24 pb-10 min-h-screen bg-zinc-950 flex justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 z-0">
            <Threads amplitude={1} distance={0} color={[0.4, 0.2, 0.8]} />
        </div>

      <div className="relative z-10 w-full max-w-6xl px-4 flex gap-6 h-[85vh]">
        {/* LEFT: CHAT INTERFACE */}
        <SpotlightCard className="flex-1 bg-black/40 backdrop-blur-md border border-white/10 flex flex-col overflow-hidden rounded-2xl">
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center gap-3 bg-white/5">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-white text-lg">HealAI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-xs text-zinc-400">Online • Medical Assistant</p>
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
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
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
                            ? 'bg-white text-black rounded-tr-none font-medium'
                            : 'bg-zinc-800/80 text-zinc-100 border border-white/5 rounded-tl-none'
                        }`}
                    >
                        {msg.type === 'file' ? (
                        <div className="flex items-center gap-3 bg-zinc-700/50 p-3 rounded-lg border border-white/5">
                            <FileText className="w-5 h-5 text-blue-400" />
                            <span className="font-medium underline decoration-blue-400/30 underline-offset-4">{msg.fileName}</span>
                        </div>
                        ) : (
                        <p>{msg.content}</p>
                        )}
                    </div>
                </div>
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
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
              title="Upload medical report"
            >
              <Paperclip className="w-5 h-5" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept=".pdf,image/*"
            />
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Desribe symptoms..."
              className="flex-1 bg-zinc-900/50 border border-white/10 rounded-full px-6 py-3 text-white placeholder-zinc-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all outline-none"
            />
            
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </SpotlightCard>

        {/* RIGHT: LIVE RECORD SUMMARY */}
        <div className="w-80 hidden lg:flex flex-col gap-6">
          <SpotlightCard className="bg-black/40 backdrop-blur-md border border-white/10 p-6 flex-1 rounded-2xl">
            <h3 className="font-heading font-bold text-white mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Live Context
            </h3>

            <div className="space-y-8">
              {/* Symptoms Tag Cloud */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Detected Symptoms</h4>
                <div className="flex flex-wrap gap-2">
                  {medicalRecord.symptoms.length > 0 ? (
                    medicalRecord.symptoms.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-red-500/10 text-red-400 text-xs font-medium rounded-full border border-red-500/20 capitalize">
                        {s}
                      </span>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-600 italic">No symptoms detected</p>
                  )}
                </div>
              </div>

              {/* History */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Medical History</h4>
                <ul className="space-y-2">
                  {medicalRecord.history.length > 0 ? (
                    medicalRecord.history.map((h, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-center gap-3 bg-zinc-900/50 p-2 rounded-lg border border-white/5 capitalize">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                        {h}
                      </li>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-600 italic">No history recorded</p>
                  )}
                </ul>
              </div>

              {/* Attached Files */}
              <div>
                <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">Attachments</h4>
                <div className="space-y-2">
                  {medicalRecord.files.length > 0 ? (
                    medicalRecord.files.map((f, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-xl border border-white/5 hover:border-white/10 transition-colors group cursor-pointer">
                        <div className="p-2 bg-zinc-800 rounded-lg group-hover:bg-zinc-700 transition-colors">
                            <FileText className="w-4 h-4 text-zinc-400 group-hover:text-white" />
                        </div>
                        <span className="text-xs text-zinc-300 truncate w-32">{f}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-zinc-600 italic">No files uploaded</p>
                  )}
                </div>
              </div>
            </div>
          </SpotlightCard>

          {/* Action Card */}
          <div className="relative group overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-90 transition-opacity group-hover:opacity-100"></div>
            <div className="relative p-6 text-white text-center">
                <h4 className="font-heading font-bold text-lg mb-2">Process Record</h4>
                <p className="text-white/70 text-sm mb-4">Ready to generate your structured medical report?</p>
                <button className="w-full bg-white text-black py-3 rounded-xl font-bold font-heading hover:scale-105 active:scale-95 transition-transform shadow-xl">
                    Generate Report
                </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
