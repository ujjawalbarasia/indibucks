import React, { useState, useEffect, useMemo } from 'react';
import { Loader, X, Zap, Target, Bot, Info, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { BSEService } from '../../services/bse';
import { useGemini } from '../../hooks/useGemini';
import { useAppContext } from '../../context/AppContext';
import { doc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../utils/firebase';

export const InvestModal = ({ fund, onClose, user, onSuccess }) => {
    const [amount, setAmount] = useState(5000);
    const [loading, setLoading] = useState(false);
    const { view, setView } = useAppContext(); // For redirect if needed, though we use onSuccess here.

    const handleInvest = async () => {
        setLoading(true);

        // 1. Fetch Real UCC
        let ucc = "DEMO-USER-001"; // Fallback
        try {
            const kycSnap = await getDoc(doc(db, 'artifacts', appId, 'users', user.uid, 'kyc', 'status'));
            if (kycSnap.exists() && kycSnap.data().ucc) {
                ucc = kycSnap.data().ucc;
            }
        } catch (e) { console.warn("Failed to fetch UCC", e); }

        const orderData = {
            fundCode: fund.code, // BSE Scheme Code
            fundName: fund.name,
            amount: Number(amount),
            ucc: ucc,
            purchaseNav: Number(fund.nav) || 0, // Store NAV for returns calc
            units: (Number(amount) / (Number(fund.nav) || 1)).toFixed(4) // Store estimated units
        };

        const res = await BSEService.placeOrder(orderData, user.uid);

        setLoading(false);
        if (res.success) {
            onSuccess(res);
            onClose();
            // alert("Order Placed! Check Dashboard."); 
        } else {
            alert("Order Failed: " + res.message);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-slide-up">
            <div className="glass-panel p-8 rounded-3xl w-full max-w-sm bg-white dark:bg-[#111] relative">
                <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X size={20} /></button>
                <div className="mb-6">
                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-600 px-2 py-1 rounded uppercase">Lumpsum</span>
                    <h2 className="text-xl font-bold mt-2 dark:text-white leading-tight">{fund.name}</h2>
                </div>
                <div className="mb-8">
                    <label className="text-xs font-bold text-gray-500 uppercase">Investment Amount</label>
                    <div className="flex items-center gap-2 mt-2 border-b-2 border-indigo-500 pb-2">
                        <span className="text-2xl font-bold dark:text-white">₹</span>
                        <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-transparent text-4xl font-black outline-none dark:text-white" />
                    </div>
                </div>
                <button onClick={handleInvest} disabled={loading} className="w-full bg-black dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold flex justify-center items-center gap-2">
                    {loading ? <Loader className="animate-spin" /> : <><Zap size={18} /> Pay & Invest</>}
                </button>
            </div>
        </div>
    );
};

export const FundDetailsModal = ({ fund, onClose, onInvest }) => {
    const { callFlash } = useGemini();
    const [activeTab, setActiveTab] = useState('overview');
    const [calculatorType, setCalculatorType] = useState('sip');
    const [investmentAmt, setInvestmentAmt] = useState(5000);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [eli5Mode, setEli5Mode] = useState(false);

    const data = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
        name: `Yr ${i}`,
        nav: (Number(fund.nav) || 100) * (1 + (i * 0.12)) + (Math.random() * 20)
    })), [fund]);

    useEffect(() => {
        if (activeTab === 'analysis' && !aiAnalysis) {
            const fetchAnalysis = async () => {
                const prompt = `Act as a senior fund analyst. Analyze the fund "${fund.name}" (${fund.category}, ${fund.risk}). 
        1. "The Good": 2 bullet points on why to buy.
        2. "The Bad": 1 risk factor.
        3. "Verdict": One punchy sentence.
        Keep it concise and use markdown.`;
                const res = await callFlash(prompt);
                setAiAnalysis(res);
            };
            fetchAnalysis();
        }
    }, [activeTab, fund]);

    const projectedValue = calculatorType === 'sip' ? investmentAmt * 12 * 5 * 1.35 : investmentAmt * 1.76;

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-slide-up">
            <div className="glass-panel w-full max-w-4xl h-[90vh] rounded-3xl relative bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden shadow-2xl border border-white/20">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-start bg-gray-50/50 dark:bg-white/5">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-indigo-100 dark:bg-white/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-white font-bold text-2xl shadow-inner">{fund.name[0]}</div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{fund.name}</h2>
                            <div className="flex gap-2 mt-2">
                                <span className="px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300">{fund.category}</span>
                                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${fund.risk === 'Very High' ? 'text-red-500 border-red-500/30' : 'text-green-500 border-green-500/30'}`}>{fund.risk}</span>
                                <button onClick={() => setEli5Mode(!eli5Mode)} className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition-all ${eli5Mode ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'text-gray-400 border-gray-500/30'}`}><Bot className="w-3 h-3" /> ELI5 Mode {eli5Mode ? 'ON' : 'OFF'}</button>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-red-500 hover:text-white transition"><X /></button>
                </div>

                <div className="flex flex-1 overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        <div className="flex gap-6 mb-8 border-b border-gray-100 dark:border-white/10 pb-1">
                            {['overview', 'analysis', 'calculator'].map(tab => (
                                <button key={tab} onClick={() => setActiveTab(tab)} className={`pb-3 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>{tab}</button>
                            ))}
                        </div>

                        {activeTab === 'overview' && (
                            <div className="space-y-8 animate-slide-up">
                                <div className="h-64 w-full bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-white/5">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={data}>
                                            <defs><linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
                                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} itemStyle={{ color: '#818cf8' }} />
                                            <Area type="monotone" dataKey="nav" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNav)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl"><div className="text-xs text-gray-500 mb-1">NAV</div><div className="text-xl font-bold text-gray-900 dark:text-white">₹{fund.nav}</div></div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1">Min SIP {eli5Mode && <Info className="w-3 h-3 text-yellow-500" title="Smallest amount you can invest monthly" />}</div><div className="text-xl font-bold text-gray-900 dark:text-white">₹500</div></div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl"><div className="text-xs text-gray-500 mb-1">Fund Size</div><div className="text-xl font-bold text-gray-900 dark:text-white">₹12,400Cr</div></div>
                                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl"><div className="text-xs text-gray-500 mb-1 flex items-center gap-1">Exp. Ratio {eli5Mode && <Info className="w-3 h-3 text-yellow-500" title="Fee paid to the fund manager annually" />}</div><div className="text-xl font-bold text-green-500">0.76%</div></div>
                                </div>
                            </div>
                        )}
                        {activeTab === 'analysis' && (
                            <div className="animate-slide-up">
                                {!aiAnalysis ? <div className="flex flex-col items-center justify-center h-64"><Loader className="w-10 h-10 text-indigo-500 animate-spin mb-4" /><p className="text-gray-500 text-sm">Gemini is analyzing market data...</p></div> :
                                    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-white/10">
                                        <div className="flex items-center gap-3 mb-6"><Sparkles className="w-6 h-6 text-indigo-600" /><h3 className="text-xl font-bold text-gray-900 dark:text-white">IndiGenie Analysis</h3></div>
                                        <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap font-medium text-gray-700 dark:text-gray-300">{aiAnalysis}</div>
                                    </div>}
                            </div>
                        )}
                        {activeTab === 'calculator' && (
                            <div className="animate-slide-up space-y-8">
                                <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-xl w-max"><button onClick={() => setCalculatorType('sip')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${calculatorType === 'sip' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500'}`}>SIP</button><button onClick={() => setCalculatorType('lumpsum')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${calculatorType === 'lumpsum' ? 'bg-white dark:bg-gray-800 shadow-sm text-indigo-600' : 'text-gray-500'}`}>Lumpsum</button></div>
                                <div><div className="flex justify-between mb-4"><span className="font-bold text-gray-700 dark:text-gray-300">Investment Amount</span><span className="font-bold text-indigo-600 text-xl">₹{investmentAmt.toLocaleString()}</span></div><input type="range" min="500" max="100000" step="500" value={investmentAmt} onChange={e => setInvestmentAmt(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg" /></div>
                                <div className="bg-gray-900 dark:bg-white text-white dark:text-black p-8 rounded-3xl text-center"><p className="text-sm opacity-70 mb-2 uppercase tracking-widest font-bold">Projected Value (5Y)</p><h3 className="text-5xl font-black mb-2">₹{Math.round(projectedValue).toLocaleString()}</h3><p className="text-xs opacity-50">Based on historic category returns of ~12%</p></div>
                            </div>
                        )}
                    </div>
                    <div className="w-80 border-l border-gray-100 dark:border-white/10 p-6 flex flex-col justify-between bg-gray-50/50 dark:bg-black/20">
                        <div><h4 className="font-bold text-gray-900 dark:text-white mb-4">Why this fund?</h4><ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400"><li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Rated 5-Star by Morningstar</li><li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> Beat benchmark 8/10 years</li><li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0" /> High liquidity</li></ul></div>
                        <button onClick={() => { onClose(); onInvest(fund); }} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"><Zap className="w-5 h-5" /> Invest Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const PanicMode = ({ onClose }) => (
    <div className="fixed inset-0 z-[200] bg-red-600/90 backdrop-blur-xl flex items-center justify-center p-4 animate-slide-up">
        <div className="max-w-2xl text-center text-white">
            <AlertTriangle className="w-24 h-24 mx-auto mb-8 animate-bounce" />
            <h2 className="text-5xl font-black mb-6">DON'T SELL!</h2>
            <p className="text-2xl mb-8 font-medium">Markets are down <span className="font-black bg-white text-red-600 px-2 rounded">-2.1%</span> today. This is normal.</p>
            <div className="bg-black/20 p-8 rounded-3xl backdrop-blur-md mb-8 text-left">
                <h3 className="font-bold text-xl mb-4">History Lesson:</h3>
                <ul className="space-y-3 opacity-90">
                    <li>• 2020 Crash: Recovered in 8 months (+90% rally)</li>
                    <li>• 2008 Crash: 5-year returns were +140%</li>
                    <li>• Selling now locks in a loss. Holding guarantees recovery.</li>
                </ul>
            </div>
            <button onClick={onClose} className="bg-white text-red-600 px-10 py-4 rounded-full font-black text-xl hover:scale-105 transition shadow-2xl">I WILL HOLD STRONG 💎🙌</button>
            <button onClick={onClose} className="block mx-auto mt-4 text-xs opacity-60 hover:opacity-100">Close</button>
        </div>
    </div>
);
