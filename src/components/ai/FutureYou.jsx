import React, { useState } from 'react';
import { useGemini } from '../../hooks/useGemini';
import { Sparkles, Clock, MapPin, DollarSign, ArrowRight } from 'lucide-react';

export const FutureYou = ({ user }) => {
    const [sip, setSip] = useState(10000);
    const [age, setAge] = useState(25);
    const [story, setStory] = useState(null);
    const [loading, setLoading] = useState(false);
    const { callJSON } = useGemini();

    const generateFuture = async () => {
        setLoading(true);
        // COST OPT: Single prompt for rich text generation
        const prompt = `
      Project a "Day in the Life" of this user in the year 2045.
      Current Age: ${age}. Monthly Investment: ₹${sip}.
      
      Scenario: Realistic but optimistic wealth compounding (12% CAGR).
      
      Return JSON:
      {
        "netWorth": "₹8.5 Crores",
        "location": "Villa in Coorg, India",
        "title": "The Philanthropist Gardener",
        "story": "You wake up at 7 AM... (Write a vivid 3-sentence paragraph about their morning, freedom, and lifestyle. Do not mention specific funds, focuses on feelings of freedom)."
      }
    `;

        try {
            const res = await callJSON(prompt);
            setStory(res);
        } catch (e) {
            setStory({
                netWorth: "₹5 Crores+",
                location: "Penthouse in Mumbai",
                title: "The Relaxed Veteran",
                story: "You wake up without an alarm clock. Your passive income exceeds your expenses, allowing you to focus on painting and travel."
            });
        }
        setLoading(false);
    };

    return (
        <div className="pt-24 px-4 max-w-4xl mx-auto min-h-screen animate-slide-up">
            <div className="text-center mb-12">
                <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 inline-block">Time Travel</span>
                <h1 className="text-4xl font-black mb-2 dark:text-white">Future You: 2045 🔮</h1>
                <p className="text-gray-400">See the life your easy investments are building.</p>
            </div>

            {!story ? (
                <div className="glass-panel p-8 rounded-3xl max-w-lg mx-auto">
                    <div className="space-y-6">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Current Age</label>
                            <input type="range" min="18" max="60" value={age} onChange={e => setAge(e.target.value)} className="w-full accent-purple-500" />
                            <div className="text-right font-mono font-bold dark:text-white">{age} Years</div>
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-500 block mb-2">Monthly SIP (₹)</label>
                            <input type="range" min="1000" max="100000" step="1000" value={sip} onChange={e => setSip(e.target.value)} className="w-full accent-purple-500" />
                            <div className="text-right font-mono font-bold dark:text-white">₹{Number(sip).toLocaleString()}</div>
                        </div>
                        <button onClick={generateFuture} disabled={loading} className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/30 flex items-center justify-center gap-2">
                            {loading ? <Sparkles className="animate-spin" /> : <Clock />}
                            {loading ? 'Traveling to 2045...' : 'Generate My Future'}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="animate-slide-up relative group">
                    {/* "Holographic" Card */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-600 rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-1000"></div>
                    <div className="relative glass-panel p-8 md:p-12 rounded-3xl border border-white/20 bg-black/60 backdrop-blur-3xl text-white">
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-xs font-bold uppercase border border-purple-500/30">Year 2045</span>
                                    <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase border border-blue-500/30">Age {Number(age) + 20}</span>
                                </div>
                                <h2 className="text-4xl font-black mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">{story.title}</h2>
                                <div className="flex items-center gap-2 text-gray-400 mb-6 text-sm font-medium">
                                    <MapPin size={16} /> {story.location}
                                </div>
                                <p className="text-lg leading-relaxed text-gray-200 italic mb-8 border-l-4 border-purple-500 pl-4">
                                    "{story.story}"
                                </p>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Net Worth</p>
                                        <p className="text-2xl font-mono font-black text-green-400">{story.netWorth}</p>
                                    </div>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                                        <p className="text-xs text-gray-500 uppercase font-bold mb-1">Status</p>
                                        <p className="text-xl font-bold text-blue-300">Financial Freedom</p>
                                    </div>
                                </div>
                            </div>
                            {/* Visual Placeholder for "Image" */}
                            <div className="w-full md:w-64 h-64 bg-gradient-to-br from-purple-900 to-indigo-900 rounded-2xl flex items-center justify-center relative overflow-hidden border border-white/10 shadow-2xl">
                                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                                <Sparkles className="w-24 h-24 text-white/20" />
                                <div className="absolute bottom-4 left-4 right-4 text-center">
                                    <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">Memory Simulation</p>
                                </div>
                            </div>
                        </div>
                        <button onClick={() => setStory(null)} className="mt-8 text-sm text-gray-400 hover:text-white flex items-center gap-2 transition-colors">
                            <ArrowRight className="rotate-180" size={16} /> Back to 2024
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
