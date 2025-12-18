import React, { useState, useRef, useEffect } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { Send, User, TrendingUp, AlertTriangle, Zap, MessageSquare } from 'lucide-react';

const PERSONAS = {
    WARREN: { name: "The Oracle", role: "Value Investor", color: "bg-blue-500", icon: TrendingUp, style: "Calm, wisdom, dividends, long-term." },
    BURRY: { name: "The Bear", role: "Risk Analyst", color: "bg-red-500", icon: AlertTriangle, style: "Paranoid, data-driven, recession-focused." },
    CATHIE: { name: "The Futurist", role: "Tech Bull", color: "bg-purple-500", icon: Zap, style: "Excited, disruption, innovation, 10x growth." }
};

export const Boardroom = () => {
    const [query, setQuery] = useState('');
    const [chat, setChat] = useState([]);
    const [loading, setLoading] = useState(false);
    const { callJSON } = useGemini();
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chat]);

    const handleDebate = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setChat(prev => [...prev, { speaker: 'USER', text: query }]);

        // COST OPTIMIZATION: One single API call for the entire 3-way debate
        const prompt = `
      You are a scriptwriter for a financial debate. 
      Topic: "${query}"
      
      Characters:
      1. WARREN (Value Investor): Conservative, likes moats, dividends, patience.
      2. BURRY (The Bear): Skeptical, looks for bubbles, debt, crash risks.
      3. CATHIE (Futurist): Optimistic, loves AI, disruption, exponential tech.

      Rules:
      - Create a short, intense 4-turn debate between them.
      - Characters should talk to EACH OTHER, not just the user.
      - Keep it entertaining but educational.
      - Final output must be a JSON Array of objects: [{"speaker": "WARREN", "text": "..."}, {"speaker": "CATHIE", "text": "..."}]
      - Add a final object {"speaker": "CONSENSUS", "text": "..."} summarizing the winner/advice.
    `;

        try {
            const response = await callJSON(prompt);
            // Simulate "typing" effect by adding messages one by one
            if (Array.isArray(response)) {
                for (const msg of response) {
                    await new Promise(r => setTimeout(r, 1200)); // Fake realistic reading delay
                    setChat(prev => [...prev, msg]);
                }
            }
        } catch (e) {
            setChat(prev => [...prev, { speaker: 'SYSTEM', text: "The Boardroom is currently closed. (API Error)" }]);
        }

        setLoading(false);
        setQuery('');
    };

    return (
        <div className="pt-24 px-4 max-w-4xl mx-auto min-h-screen animate-slide-up flex flex-col">
            <div className="text-center mb-8">
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">AI Decision Core</span>
                <h1 className="text-4xl font-black mb-2 dark:text-white">The Boardroom 👔</h1>
                <p className="text-gray-400">Your Personal Investment Committee. 3 AI Minds, 1 Decision.</p>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 glass-panel rounded-3xl overflow-hidden flex flex-col relative h-[60vh]">
                {/* Header Avatars */}
                <div className="flex justify-evenly p-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 backdrop-blur-md z-10">
                    {Object.values(PERSONAS).map((p, i) => (
                        <div key={i} className="flex flex-col items-center opacity-80 hover:opacity-100 transition-opacity">
                            <div className={`w-12 h-12 rounded-full ${p.color} flex items-center justify-center text-white shadow-lg mb-2`}>
                                <p.icon size={20} />
                            </div>
                            <span className="text-[10px] font-bold uppercase tracking-widest dark:text-white">{p.name}</span>
                            <span className="text-[9px] text-gray-500">{p.role}</span>
                        </div>
                    ))}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
                    {chat.length === 0 && (
                        <div className="text-center text-gray-400 mt-20 opacity-50">
                            <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                            <p>Ask: "Should I buy Adani stocks?"</p>
                            <p>Ask: "Is Bitcoin a good hedge?"</p>
                        </div>
                    )}

                    {chat.map((msg, idx) => {
                        const persona = PERSONAS[msg.speaker];
                        const isUser = msg.speaker === 'USER';
                        const isConsensus = msg.speaker === 'CONSENSUS';

                        if (isUser) return (
                            <div key={idx} className="flex justify-end animate-slide-up">
                                <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl rounded-tr-none max-w-[80%] shadow-lg">
                                    {msg.text}
                                </div>
                            </div>
                        );

                        if (isConsensus) return (
                            <div key={idx} className="mx-auto bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-6 rounded-2xl shadow-xl max-w-lg mb-8 animate-pulse-glow text-center">
                                <h4 className="font-bold uppercase tracking-widest border-b border-white/20 pb-2 mb-2 text-xs">Final Verdict</h4>
                                <p className="font-medium text-lg">"{msg.text}"</p>
                            </div>
                        )

                        return (
                            <div key={idx} className={`flex gap-4 animate-slide-up ${idx % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                <div className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center text-white shadow-md ${persona?.color || 'bg-gray-500'}`}>
                                    {persona ? <persona.icon size={16} /> : <Zap size={16} />}
                                </div>
                                <div className={`p-4 rounded-2xl max-w-[75%] border shadow-sm ${idx % 2 === 0 ? 'bg-white dark:bg-white/5 rounded-tl-none border-gray-100 dark:border-white/5' : 'bg-indigo-50 dark:bg-indigo-900/20 rounded-tr-none border-indigo-100 dark:border-indigo-500/20'}`}>
                                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-1">{persona?.name || msg.speaker}</p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{msg.text}</p>
                                </div>
                            </div>
                        );
                    })}
                    {loading && <div className="text-center text-xs text-gray-400 animate-pulse">The Board is debating...</div>}
                </div>

                {/* Input */}
                <div className="p-4 bg-white dark:bg-black/20 border-t border-gray-100 dark:border-white/5">
                    <div className="flex gap-2 relative">
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleDebate()}
                            placeholder="Ask the Boardroom a strict question..."
                            className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 ring-indigo-500 transition-all dark:text-white"
                        />
                        <button onClick={handleDebate} className="bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl transition-all shadow-lg active:scale-95">
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
