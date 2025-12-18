import React, { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { Newspaper, BookOpen, ChevronRight, X } from 'lucide-react';

const SAMPLE_NEWS = [
    { id: 1, title: "RBI hikes Repo Rate by 50 bps to tame inflation", category: "Macro" },
    { id: 2, title: "Nifty forms a Bullish Engulfing pattern on daily charts", category: "Technical" },
    { id: 3, title: "Sebi proposes tighter norms for F&O margin trading", category: "Regulatory" }
];

export const NewsFeed = () => {
    const [news, setNews] = useState(SAMPLE_NEWS);
    const [explanation, setExplanation] = useState(null);
    const [loadingId, setLoadingId] = useState(null);
    const { callJSON } = useGemini();

    const explainNews = async (item) => {
        if (explanation?.id === item.id) return;
        setLoadingId(item.id);

        // COST OPT: Short prompt, single output
        const prompt = `
      Explain this finance news headline to a 10-year-old. 
      Headline: "${item.title}"
      
      Focus on: "How does it affect my money?"
      Return JSON: { "simple": "...", "impact": "..." }
    `;

        try {
            const res = await callJSON(prompt);
            setExplanation({ id: item.id, ...res });
        } catch (e) {
            setExplanation({
                id: item.id,
                simple: "This is complex financial news.",
                impact: "It might make loans expensive or stocks volatile."
            });
        }
        setLoadingId(null);
    };

    return (
        <div className="glass-panel p-6 rounded-3xl h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold dark:text-white flex items-center gap-2">
                    <Newspaper size={20} className="text-pink-500" /> Market Pulse
                </h3>
                <span className="text-[10px] font-bold bg-pink-500/10 text-pink-500 px-2 py-1 rounded border border-pink-500/20">LIVE</span>
            </div>

            <div className="space-y-4">
                {news.map(item => (
                    <div key={item.id} className="relative group">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-pink-500/30 transition-all">
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">{item.category}</span>
                                <button
                                    onClick={() => explainNews(item)}
                                    className="text-[10px] font-bold text-indigo-500 hover:text-indigo-400 flex items-center gap-1 bg-indigo-500/10 px-2 py-1 rounded-full transition-colors"
                                >
                                    {loadingId === item.id ? 'Translating...' : 'Explain AI'} <BookOpen size={10} />
                                </button>
                            </div>
                            <h4 className="font-bold text-sm text-gray-800 dark:text-gray-200 leading-snug">{item.title}</h4>

                            {/* AI Explanation POPUP Overlay */}
                            {explanation?.id === item.id && (
                                <div className="mt-4 p-4 bg-indigo-600 rounded-xl text-white relative animate-slide-up shadow-xl mx-[-8px] mb-[-8px]">
                                    <button onClick={() => setExplanation(null)} className="absolute top-2 right-2 opacity-50 hover:opacity-100"><X size={12} /></button>
                                    <p className="text-xs font-bold opacity-70 uppercase mb-1">In Plain English:</p>
                                    <p className="text-sm font-medium mb-3 leading-relaxed">"{explanation.simple}"</p>
                                    <div className="bg-black/20 p-2 rounded-lg flex items-center gap-2">
                                        <span className="text-lg">💰</span>
                                        <p className="text-xs">{explanation.impact}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
