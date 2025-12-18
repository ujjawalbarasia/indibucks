import React, { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { ShoppingBag, ArrowRight, TrendingUp, Pizza, Coffee, Smartphone } from 'lucide-react';

export const SpendAnalyzer = () => {
    const [item, setItem] = useState('');
    const [amount, setAmount] = useState('');
    const [suggestion, setSuggestion] = useState(null);
    const [loading, setLoading] = useState(false);
    const { callJSON } = useGemini();

    const analyzeSpend = async () => {
        if (!item || !amount) return;
        setLoading(true);

        const prompt = `
      User Purchase: "${item}" for ₹${amount}.
      Task: Suggest a specific "Investment Offset" to enable guilt-free spending.
      Search Logic:
      - If "Pizza/Coffee" -> Suggest "QSR/FMCG Consumer Fund".
      - If "iPhone/Gadget" -> Suggest "Technology Mutual Fund".
      - If "Travel" -> Suggest "Services/Hospitality Fund".
      
      Return JSON:
      {
        "match": "Consumer Trends Fund",
        "logic": "Since you love pizza, invest in the companies that make cheese and dough!",
        "offsetAmount": ${Math.round(amount * 0.2)}, 
        "icon": "Pizza" 
      }
      (offsetAmount should be 20% of spend)
    `;

        try {
            const res = await callJSON(prompt);
            setSuggestion(res);
        } catch (e) {
            setSuggestion({
                match: "Nifty 50 Index Fund",
                logic: "When in doubt, bet on the whole market relative to your spending.",
                offsetAmount: Math.round(amount * 0.2)
            });
        }
        setLoading(false);
    };

    return (
        <div className="pt-24 px-4 max-w-2xl mx-auto min-h-screen animate-slide-up">
            <div className="text-center mb-12">
                <span className="bg-pink-500/10 text-pink-400 border border-pink-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Behavioral AI</span>
                <h1 className="text-4xl font-black mb-2 dark:text-white">Guilt-Free Spender 🛍️</h1>
                <p className="text-gray-400">Bought something cool? Invest in it too.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
                <div className="relative z-10 space-y-6">
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">What did you buy?</label>
                        <div className="relative">
                            <ShoppingBag className="absolute left-4 top-4 text-gray-400" size={20} />
                            <input
                                value={item}
                                onChange={(e) => setItem(e.target.value)}
                                placeholder="e.g., Sneakers, iPhone 15, Starbucks..."
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 ring-pink-500 transition-all dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500 block mb-2">How much?</label>
                        <div className="relative">
                            <span className="absolute left-4 top-4 text-gray-400 font-bold">₹</span>
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="12000"
                                className="w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 ring-pink-500 transition-all dark:text-white font-mono"
                            />
                        </div>
                    </div>

                    <button
                        onClick={analyzeSpend}
                        disabled={loading || !item || !amount}
                        className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-pink-500/30 flex items-center justify-center gap-2 group"
                    >
                        {loading ? 'Analyzing Habits...' : <>Hack My Spend <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" /></>}
                    </button>
                </div>
            </div>

            {suggestion && (
                <div className="mt-8 animate-slide-up">
                    <div className="glass-panel p-8 rounded-3xl border-2 border-pink-500/20 bg-gradient-to-br from-white to-pink-50 dark:from-gray-900 dark:to-pink-900/10">
                        <div className="flex items-start gap-6">
                            <div className="p-4 bg-pink-500 rounded-2xl text-white shadow-xl shrink-0">
                                <TrendingUp size={32} />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black mb-2 dark:text-white">Invest ₹{suggestion.offsetAmount}</h3>
                                <div className="text-sm font-bold text-pink-500 bg-pink-500/10 px-3 py-1 rounded-full inline-block mb-4">
                                    Target: {suggestion.match}
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 italic mb-6">"{suggestion.logic}"</p>
                                <button className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg w-full md:w-auto">
                                    One-Click Invest ₹{suggestion.offsetAmount}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
