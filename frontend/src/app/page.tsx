"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, MessageSquare } from "lucide-react";
import axios from "axios";

type Message = {
  id: string;
  role: "user" | "bot";
  text: string;
};

export default function ChatSummarizer() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "bot",
      text: "Welcome to SumItUp AI. I specialize in Extractive Summarization using advanced NLP to analyze your text and identify the most critical sentences. Paste a long document below to get started.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { id: Date.now().toString(), role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const { data } = await axios.post("http://localhost:8000/summarize", {
        text: userMessage.text,
        sentences_count: 4, 
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: `**Summary (${data.summary_length} sentences):**\n` + data.summary,
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "bot",
        text: "Error: Could not reach the backend. Ensure FastAPI is running on port 8000.",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#000000] text-zinc-100 overflow-hidden font-sans selection:bg-zinc-800">
      
      {/* 21st.dev style subtle grids and gradient glows */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.03] blur-[120px] rounded-[100%] pointer-events-none" />

      {/* Header NavBar */}
      <header className="flex-none h-[72px] relative z-20 border-b border-white/[0.05] bg-black/40 backdrop-blur-md px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.1] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-zinc-300" />
          </div>
          <h1 className="text-[17px] font-medium tracking-tight text-white/90">
            SumItUp AI
          </h1>
        </div>
        <div className="flex items-center text-xs font-medium text-zinc-500 bg-white/[0.03] px-3 py-1.5 rounded-full border border-white/[0.05]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
          Connected to NLP Core
        </div>
      </header>

      {/* Main Chat Scroll Area */}
      <main className="flex-1 overflow-y-auto z-10 w-full no-scrollbar relative">
        <div className="max-w-3xl mx-auto w-full px-4 py-8 pb-[180px] flex flex-col gap-8">
          
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
                className={`flex gap-4 group ${
                  message.role === "user" ? "flex-row-reverse" : "flex-row"
                }`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 shrink-0 flex items-center justify-center rounded-full mt-1 ${
                    message.role === "bot"
                      ? "bg-zinc-900 border border-zinc-800 text-zinc-400"
                      : "bg-white text-black"
                  }`}
                >
                  {message.role === "bot" ? <Bot className="w-[18px] h-[18px]" /> : <User className="w-[18px] h-[18px]" />}
                </div>

                {/* Message Content */}
                <div
                  className={`flex flex-col gap-2 max-w-[85%] ${
                    message.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-2 px-1 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] font-medium text-zinc-500 uppercase tracking-wider">
                      {message.role === "user" ? "You" : "SumItUp AI"}
                    </span>
                  </div>
                  
                  <div
                    className={`text-[15px] leading-[1.6] py-[14px] px-[18px] rounded-[24px] ${
                      message.role === "user"
                        ? "bg-zinc-100 text-black rounded-tr-sm"
                        : "bg-zinc-900/80 border border-white/[0.06] text-zinc-200 rounded-tl-sm backdrop-blur-md"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.text}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Typing Indicator */}
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 flex-row"
            >
              <div className="w-9 h-9 shrink-0 flex items-center justify-center rounded-full mt-1 bg-zinc-900 border border-zinc-800 text-zinc-400">
                <Bot className="w-[18px] h-[18px]" />
              </div>
              <div className="bg-zinc-900/80 border border-white/[0.06] rounded-[24px] rounded-tl-sm px-5 py-[18px] flex items-center gap-3 backdrop-blur-md shadow-lg">
                <div className="flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 bg-zinc-500 rounded-full"
                      animate={{ y: [0, -4, 0] }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          <div ref={endOfMessagesRef} className="h-4" />
        </div>
      </main>

      {/* Modern Floating Input Area */}
      <div className="absolute bottom-0 inset-x-0 w-full z-30 pointer-events-none pb-8 pt-24 bg-gradient-to-t from-black via-black/80 to-transparent flex justify-center px-4">
        <div className="w-full max-w-3xl pointer-events-auto relative mt-auto">
          {/* Subtle Glow Behind Input */}
          <div className="absolute inset-x-8 -inset-y-4 bg-white/[0.02] blur-xl rounded-full" />
          
          <div className="relative bg-[#121212] border border-white/[0.08] shadow-[0_0_40px_-15px_rgba(255,255,255,0.05)] rounded-[28px] flex items-end p-[6px] gap-2 transition-all hover:bg-[#141414]">
            
            <div className="pl-4 pb-[14px] shrink-0 text-zinc-500">
               <MessageSquare className="w-5 h-5" />
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Paste your long text to extract summary..."
              className="w-full max-h-[250px] min-h-[48px] bg-transparent resize-none outline-none text-zinc-200 placeholder-zinc-500 py-3.5 px-2 text-[15px] leading-relaxed scrollbar-thin scrollbar-thumb-zinc-800"
              rows={input.split("\n").length > 1 ? Math.min(8, input.split("\n").length) : 1}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className={`p-3 rounded-[22px] shrink-0 flex items-center justify-center h-[46px] w-[46px] transition-all duration-300 ${
                !input.trim() || loading
                  ? "bg-white/[0.05] text-zinc-600 cursor-not-allowed"
                  : "bg-white text-black hover:scale-[0.98] shadow-md"
              }`}
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin text-zinc-400" />
              ) : (
                <Send className="w-[18px] h-[18px] ml-0.5" />
              )}
            </button>
          </div>
          
          <p className="text-center text-[11px] text-zinc-600 mt-4 font-medium tracking-wide w-full">
            EXTRACTIVE SUMMARIZATION POWERED BY NLTK
          </p>
        </div>
      </div>
    </div>
  );
}
