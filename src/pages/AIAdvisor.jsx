import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, User, Zap, MessageSquare, TrendingUp, ShieldCheck } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';

const SUGGESTIONS = [
    { text: "Start a ₹5k SIP", icon: TrendingUp },
    { text: "How to save tax?", icon: ShieldCheck },
    { text: "Plan a Bali Trip", icon: Zap },
    { text: "Market Outlook?", icon: Sparkles }
];

export const AIAdvisor = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);
    const scrollRef = useRef(null);
    const { callFlash } = useGemini();

    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'welcome',
                text: "Hey! 👋 I'm IndiBuddy. I don't do boring lectures. \nTell me what you're dreaming of buying, and I'll help you fund it.",
                sender: 'ai'
            }]);
        }
    }, []);

    useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);

    const handleSend = async (textOverride = null) => {
        const text = textOverride || input;
        if (!text.trim()) return;

        setInput('');
        setMessages(prev => [...prev, { text, sender: 'user' }]);
        setTyping(true);

        const systemPrompt = `
            You are IndiBuddy, a witty, Gen-Z friendly financial friend.
            - 🚫 NO long paragraphs. Max 2-3 short sentences per bubble.
            - 🚫 NO financial jargon without explaining it simply.
            - ✅ Use Emojis used frequently (🚀, 💰, 📉).
            - ✅ Be encouraging but realistic.
            - ✅ If user asks about specific stocks/funds, give a balanced view but remind them you are an AI.
            - Tone: Like a smart friend, not a bank manager.
        `;

        const res = await callFlash(text, systemPrompt);
        setTyping(false);
        setMessages(prev => [...prev, { text: res, sender: 'ai' }]);
    };

    return (
        <div className="pt-28 pb-4 px-4 max-w-4xl mx-auto h-[92vh] flex flex-col animate-slide-up">
            {/* Header */}
            <div className="glass-panel p-4 rounded-t-3xl border-b dark:border-white/10 flex justify-between items-center bg-white/60 dark:bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white shadow-lg">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-black animate-pulse"></div>
                    </div>
                    <div>
                        <h2 className="font-black text-lg dark:text-white leading-none">IndiBuddy</h2>
                        <span className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Always Online</span>
                    </div>
                </div>
                <button onClick={() => setMessages([])} className="text-xs font-bold text-gray-400 hover:text-red-400 transition-colors">Clear Chat</button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-6 overflow-y-auto glass-panel border-t-0 border-b-0 bg-white/30 dark:bg-black/20 space-y-6 scrollbar-hide">
                {messages.map((m, i) => (
                    <div key={i} className={`flex gap-4 ${m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.sender === 'user' ? 'bg-gray-200 dark:bg-white/10' : 'bg-indigo-100 dark:bg-indigo-900/40'}`}>
                            {m.sender === 'user' ? <User size={14} className="text-gray-600 dark:text-gray-300" /> : <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />}
                        </div>

                        {/* Bubble */}
                        <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm whitespace-pre-line ${m.sender === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-tl-none border dark:border-white/5'
                            }`}>
                            {m.text}
                        </div>
                    </div>
                ))}

                {typing && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                            <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div className="bg-white dark:bg-white/10 p-4 rounded-2xl rounded-tl-none border dark:border-white/5 flex gap-1 items-center h-10">
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></div>
                        </div>
                    </div>
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 glass-panel rounded-b-3xl border-t dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl">
                {/* Quick Chips */}
                {messages.length < 3 && !typing && (
                    <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide mb-2">
                        {SUGGESTIONS.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSend(s.text)}
                                className="flex items-center gap-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 hover:border-indigo-200 transition-all whitespace-nowrap"
                            >
                                <s.icon size={12} className="text-indigo-500" /> {s.text}
                            </button>
                        ))}
                    </div>
                )}

                <div className="flex gap-4">
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        className="flex-1 bg-white dark:bg-black/50 border border-gray-200 dark:border-white/10 p-4 rounded-xl outline-none focus:ring-2 ring-indigo-500 transition-all dark:text-white shadow-inner placeholder:text-gray-400"
                        placeholder="Ask anything..."
                    />
                    <button
                        onClick={() => handleSend()}
                        className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/30 active:scale-95"
                    >
                        {typing ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={20} />}
                    </button>
                </div>
            </div>
        </div>
    );
};
