import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Bot, MessageCircle } from "lucide-react";
import { useUser } from "@clerk/clerk-react";

export default function ChatWidget() {
  const { isSignedIn } = useUser();
  const location = useLocation();

  // Hide on Chat page itself, Login, Signup, or if not signed in
  if (!isSignedIn || location.pathname === '/chat' || location.pathname === '/login' || location.pathname === '/signup') {
    return null;
  }

  return (
    <Link to="/chat">
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 z-[100] bg-gradient-to-r from-emerald-500 to-teal-600 p-4 rounded-full shadow-lg shadow-emerald-500/30 cursor-pointer border border-white/20 flex items-center justify-center group"
      >
        <Bot className="w-8 h-8 text-white group-hover:hidden transition-all" />
        <MessageCircle className="w-8 h-8 text-white hidden group-hover:block transition-all" />
        
        {/* Tooltip / Label */}
        <div className="absolute right-full mr-4 bg-zinc-900 text-white text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition whitespace-nowrap pointer-events-none">
          Ask Buddy
        </div>
      </motion.div>
    </Link>
  );
}
