import React, { useState, useEffect } from 'react';
import { Newspaper, Loader, Rocket, Skull, Activity, Target, Globe, Sprout } from 'lucide-react';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { db, appId } from '../../utils/firebase';
import { useGemini } from '../../hooks/useGemini';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

export const MarketSentiment = () => {
    const [sentiment, setSentiment] = useState(null);
    const [loading, setLoading] = useState(true);
    const { callJSON } = useGemini();
    useEffect(() => {
        const analyzeSentiment = async () => {
            const prompt = `Search latest Indian market news for the last 24h. Calculate a Market Mood Score 0-100. Return JSON: { "score": number, "summary": "1 sentence summary" }`;
            const res = await callJSON(prompt);
            if (res) setSentiment(res);
            setLoading(false);
        };
        analyzeSentiment();
    }, []);
    return (
        <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-white/5 h-full flex flex-col justify-between">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Newspaper size={20} className="text-indigo-500" /> Market Mood</h3>
                <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Live AI</span>
            </div>
            {loading ? <div className="flex-1 flex items-center justify-center"><Loader className="animate-spin text-indigo-500" /></div> : (
                <>
                    <div className="text-center">
                        <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{sentiment?.score || 50}</div>
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">Score</div>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300 text-center mt-4 leading-relaxed italic">"{sentiment?.summary}"</p>
                </>
            )}
        </div>
    );
};

export const SIPTurbocharger = () => {
    const [stepUp, setStepUp] = useState(10);
    return (
        <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-indigo-500/20">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Rocket size={20} className="text-indigo-500" /> SIP Turbocharger</h3>
                <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-tighter">Auto-Pilot</span>
            </div>
            <p className="text-xs text-gray-500 mb-6">Maximize compounding by increasing SIP annually.</p>
            <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500">{stepUp}% Hike</span>
                <input type="range" min="5" max="25" step="5" value={stepUp} onChange={e => setStepUp(Number(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
            </div>
        </div>
    );
};

export const GoalDNA = ({ user }) => {
    const [goals, setGoals] = useState([]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'goals'));
        return onSnapshot(q, s => {
            if (!s.empty) {
                setGoals(s.docs.map(d => ({ id: d.id, ...d.data() })));
            } else {
                setGoals([
                    { id: 1, name: "Tesla Model 3", target: 4500000, current: 1200000, date: "2026", icon: Target, color: "bg-gradient-to-r from-red-500 to-pink-500" },
                    { id: 2, name: "Bali Villa", target: 8000000, current: 3500000, date: "2030", icon: Globe, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
                ]);
            }
        });
    }, [user]);

    return (
        <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-white/5 h-full transition-all duration-500">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Sprout size={20} className="text-green-500" /> Goal DNA</h3>
                <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">+ Add Goal</button>
            </div>
            <div className="space-y-6">
                {goals.map(g => {
                    const progress = (g.current / g.target) * 100;
                    const Icon = g.icon || Target;
                    return (
                        <div key={g.id} className="relative group">
                            <div className="flex justify-between items-end mb-2">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-xl shadow-md ${g.color || 'bg-gray-500'}`}><Icon size={16} className="text-white" /></div>
                                    <div><div className="font-bold text-gray-900 dark:text-white text-sm">{g.name}</div><div className="text-[10px] text-gray-400">{g.date} Target</div></div>
                                </div>
                                <div className="text-right"><div className="font-bold text-gray-900 dark:text-white text-sm">{progress.toFixed(0)}%</div></div>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${g.color || 'bg-indigo-500'} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

export const InflationCalculator = () => {
    const [currentAmount, setCurrentAmount] = useState(100000);
    const [years, setYears] = useState(20);
    const inflationRate = 0.06;
    const realValue = currentAmount / Math.pow(1 + inflationRate, years);
    return (
        <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden group text-left transition-all duration-300 hover:scale-[1.01]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2"><Skull className="w-6 h-6 text-red-500 animate-pulse" /><h3 className="font-bold text-xl text-gray-900 dark:text-white">Inflation Reality Check</h3></div>
                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">See the real value of your savings if kept idle in a bank.</p>
                    <div className="space-y-6">
                        <div><div className="flex justify-between text-xs font-bold mb-2 text-gray-500 dark:text-gray-400"><span>TODAY'S CASH</span><span className="text-gray-900 dark:text-white">₹{currentAmount.toLocaleString()}</span></div><input type="range" min="10000" max="1000000" step="10000" value={currentAmount} onChange={e => setCurrentAmount(Number(e.target.value))} className="w-full accent-red-500 h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" /></div>
                        <div><div className="flex justify-between text-xs font-bold mb-2 text-gray-500 dark:text-gray-400"><span>AFTER {years} YEARS</span><span>6% INFLATION</span></div><input type="range" min="5" max="40" step="1" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full accent-red-500 h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer" /></div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-2xl text-center min-w-[200px] border border-red-500/20 bg-white/50 dark:bg-black/20">
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 font-bold">Effective Value</p>
                    <h4 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">₹{Math.round(realValue).toLocaleString()}</h4>
                    <div className="inline-block bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-3 py-1 rounded-full font-bold border border-red-200 dark:border-red-500/20">-{((1 - realValue / currentAmount) * 100).toFixed(0)}% LOSS</div>
                </div>
            </div>
        </div>
    );
};

export const RiskRadar = () => {
    const data = [
        { subject: 'Returns (3Y)', A: 120, fullMark: 150 },
        { subject: 'Consistency', A: 98, fullMark: 150 },
        { subject: 'Volatility', A: 86, fullMark: 150 },
        { subject: 'Alpha', A: 99, fullMark: 150 },
        { subject: 'Liquidity', A: 85, fullMark: 150 },
        { subject: 'Expense Ratio', A: 65, fullMark: 150 },
    ];

    return (
        <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-white/5 transition-all duration-500 hover:scale-[1.02]">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" /> Risk Radar 360
                </h3>
                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full font-bold">BETA</span>
            </div>
            <p className="text-xs text-gray-500 mb-4">Holistic health analysis vs Market Benchmark.</p>
            <div className="h-[250px] w-full flex items-center justify-center -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
                        <PolarGrid stroke="#e5e7eb" strokeOpacity={0.3} />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10, fontWeight: 'bold' }} />
                        <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                        <Radar name="Portfolio" dataKey="A" stroke="#6366f1" strokeWidth={2} fill="#6366f1" fillOpacity={0.3} />
                    </RadarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};
