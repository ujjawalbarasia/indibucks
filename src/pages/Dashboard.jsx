import React, { useState, useEffect } from 'react';
import { AlertTriangle, PieChart as PieChartIcon } from 'lucide-react';
import { query, collection, orderBy, onSnapshot } from 'firebase/firestore';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { db, appId } from '../utils/firebase';
import { BSEService } from '../services/bse';
import { MarketSentiment, SIPTurbocharger, GoalDNA } from '../components/widgets/Widgets';
import { PanicMode } from '../components/modals/InvestmentModals';
import { VoiceAgent } from '../components/ai/VoiceAgent';

export const Dashboard = ({ user, zenMode }) => {
    const [orders, setOrders] = useState([]);
    const [portfolio, setPortfolio] = useState({ invested: 0, current: 0 });
    const [showPanic, setShowPanic] = useState(false);
    const [stressMode, setStressMode] = useState(false); // New AI Feature
    const [holdings, setHoldings] = useState([]);

    useEffect(() => {
        if (!user) return;
        const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('timestamp', 'desc'));
        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const userOrders = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            setOrders(userOrders);

            const uniqueSchemes = [...new Set(userOrders.map(o => o.schemeCode))];
            let totalInvested = 0;
            let totalCurrent = 0;
            const holdingMap = {};
            const fundDetails = await BSEService.getFunds(uniqueSchemes);

            userOrders.forEach(order => {
                totalInvested += Number(order.amount);
                const fund = fundDetails.find(f => f.code === order.schemeCode);

                let currentValueForOrder = Number(order.amount);

                if (fund) {
                    const currentNav = Number(fund.nav);
                    if (order.units) {
                        currentValueForOrder = Number(order.units) * currentNav;
                    } else if (order.purchaseNav) {
                        const units = Number(order.amount) / Number(order.purchaseNav);
                        currentValueForOrder = units * currentNav;
                    } else {
                        // Legacy Fallback (2% gain mock)
                        currentValueForOrder = Number(order.amount) * 1.02;
                    }
                }

                totalCurrent += currentValueForOrder;

                if (!holdingMap[order.schemeCode]) {
                    holdingMap[order.schemeCode] = {
                        name: order.fundName,
                        invested: 0,
                        current: 0,
                        nav: fund?.nav || 'N/A'
                    };
                }
                holdingMap[order.schemeCode].invested += Number(order.amount);
                holdingMap[order.schemeCode].current += currentValueForOrder;
            });

            setPortfolio({ invested: totalInvested, current: totalCurrent });
            setHoldings(Object.values(holdingMap));
        });
        return unsubscribe;
    }, [user]);

    const xirr = portfolio.invested > 0 ? ((portfolio.current - portfolio.invested) / portfolio.invested) * 100 : 0;
    const chartData = holdings.map(h => ({ name: h.name, value: h.current }));
    const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#10b981', '#f59e0b'];

    return (
        <div className="pt-28 px-4 max-w-7xl mx-auto min-h-screen animate-slide-up">
            {showPanic && <PanicMode onClose={() => setShowPanic(false)} />}
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-black dark:text-white">My Portfolio</h1>
                {!zenMode && <button onClick={() => setShowPanic(true)} className="flex items-center gap-2 text-red-500 font-bold border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/10"><AlertTriangle size={18} /> Panic Mode</button>}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                <div className={`col-span-1 lg:col-span-2 glass-panel p-8 rounded-3xl ${zenMode ? 'bg-emerald-900' : 'bg-indigo-900'} text-white transition-colors duration-500 shadow-2xl relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
                    <div className="relative z-10">
                        <p className="opacity-70 text-[10px] font-bold uppercase tracking-widest mb-2">{zenMode ? 'Zen Portfolio' : 'Total Portfolio Value'}</p>
                        <h2 className={`text-6xl font-mono font-bold mb-6 ${zenMode ? 'zen-mode-blur select-none' : ''}`}>₹{Math.round(portfolio.current).toLocaleString()}</h2>
                        <div className="flex gap-4">
                            <div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/20">Invested: ₹{portfolio.invested.toLocaleString()}</div>
                            <div className={`px-4 py-2 rounded-xl text-xs font-bold border border-white/20 ${xirr >= 0 ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>XIRR: {xirr >= 0 ? '+' : ''}{xirr.toFixed(2)}%</div>
                        </div>
                    </div>
                </div>

                <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-white/5 flex flex-col items-center justify-center">
                    <h3 className="font-bold dark:text-white text-sm mb-4 self-start flex items-center gap-2"><PieChartIcon size={16} /> Asset Allocation</h3>
                    {holdings.length > 0 ? (
                        <div className="h-[180px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                        {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : <div className="text-xs text-gray-500 text-center py-10">No Investments Yet</div>}
                </div>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 glass-panel p-6 rounded-3xl">
                    <h3 className="font-bold dark:text-white mb-6">Holdings</h3>
                    {holdings.length === 0 ? <p className="text-gray-500 text-sm">No active investments found.</p> : (
                        <div className="space-y-4">
                            {holdings.map((h, i) => (
                                <div key={i} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5 hover:border-indigo-500 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 font-bold">{h.name?.[0]}</div>
                                        <div>
                                            <p className="font-bold dark:text-white text-sm line-clamp-1">{h.name}</p>
                                            <p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">NAV: ₹{h.nav}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-mono font-bold dark:text-white ${zenMode ? 'blur-sm' : ''}`}>₹{Math.round(h.current).toLocaleString()}</div>
                                        <div className={`text-[10px] font-bold ${h.current >= h.invested ? 'text-green-500' : 'text-red-500'}`}>{((h.current - h.invested) / h.invested * 100).toFixed(1)}%</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <div><MarketSentiment /><div className="mt-6"><SIPTurbocharger /></div></div>
            </div>
            <div className="mt-8 grid md:grid-cols-1"><GoalDNA user={user} /></div>
            <VoiceAgent />
        </div>
    );
};
