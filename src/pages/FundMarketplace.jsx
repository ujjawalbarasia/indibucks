import React, { useState, useEffect, useCallback } from 'react';
import { Search, Loader, TrendingUp, FileText, Coins, Crown, Layers, Sprout, ArrowUpRight, Play } from 'lucide-react';
import { CONSTANTS } from '../utils/constants';
import { BSEService } from '../services/bse';

const QuickCollections = ({ onSelect }) => (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide mb-8">
        {CONSTANTS.COLLECTIONS.map(c => {
            const Icon = c.icon;
            return (
                <button key={c.id} onClick={onSelect} className="flex items-center gap-3 px-6 py-4 bg-card text-card-foreground rounded-2xl min-w-[180px] hover:bg-muted transition-all group border border-border hover:border-primary shadow-sm">
                    <div className={`p-2 rounded-xl bg-primary/10 ${c.iconColor} group-hover:scale-110 transition`}><Icon size={20} /></div>
                    <div className="text-left"><p className="font-bold text-sm text-foreground">{c.label}</p><p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Collection</p></div>
                </button>
            )
        })}
    </div>
);

const MoneyReels = () => (
    <div className="mb-12">
        <h3 className="font-bold text-xl mb-6 dark:text-white flex items-center gap-2"><Play className="fill-indigo-500 text-indigo-500" size={20} /> Money Reels</h3>
        <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide">
            {CONSTANTS.REELS.map(r => (
                <div key={r.id} className="min-w-[280px] h-[400px] rounded-3xl relative overflow-hidden group cursor-pointer border dark:border-white/10">
                    <img src={r.img} alt={r.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90"></div>
                    <div className="absolute bottom-0 p-6 text-white w-full">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-4"><r.icon size={20} /></div>
                        <h4 className="font-bold text-lg leading-tight mb-2">{r.title}</h4>
                        <p className="text-xs font-bold opacity-70 flex items-center gap-2"><TrendingUp size={12} /> {r.views} views</p>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white border border-white/20">SHORTS</div>
                </div>
            ))}
        </div>
    </div>
);

export const FundMarketplace = ({ onInvestClick }) => {
    const [funds, setFunds] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchFunds = useCallback(async (q = '') => {
        setLoading(true);
        try {
            const codes = q.length > 2 ? [] : CONSTANTS.FEATURED_FUNDS;
            if (q.length > 2) {
                const res = await fetch(`https://api.mfapi.in/mf/search?q=${q}`);
                const data = await res.json();
                const top5 = data.slice(0, 5).map(f => f.schemeCode);
                const detailed = await BSEService.getFunds(top5);
                setFunds(detailed);
            } else {
                const detailed = await BSEService.getFunds(codes);
                setFunds(detailed);
            }
        } catch (e) { console.error(e); }
        setLoading(false);
    }, []);

    useEffect(() => { fetchFunds(); }, [fetchFunds]);

    return (
        <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
            <h1 className="text-4xl font-heading font-black mb-2 text-foreground">Mutual Funds Exchange</h1>
            <p className="text-muted-foreground mb-10 font-medium">Access 20,000+ real schemes directly from AMCs.</p>
            <div className="relative mb-12">
                <Search className="absolute left-5 top-5 text-gray-400" />
                <input value={search} onChange={e => { setSearch(e.target.value); fetchFunds(e.target.value); }} placeholder="Search real schemes (e.g. HDFC, Index, Bluechip)..." className="w-full pl-14 pr-6 py-5 rounded-2xl glass-panel bg-white/50 dark:bg-white/5 border-none outline-none dark:text-white shadow-xl focus:ring-2 focus:ring-indigo-500 transition" />
            </div>
            <QuickCollections onSelect={() => fetchFunds('')} />
            <MoneyReels />
            {loading ? <div className="py-20 flex justify-center"><Loader className="animate-spin text-indigo-600" size={40} /></div> : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {funds.map(f => (
                        <div key={f.code} className="bg-card text-card-foreground p-6 rounded-3xl border border-border hover:border-primary transition-all flex flex-col justify-between group shadow-sm">
                            <div><span className="text-[10px] font-black uppercase bg-primary/10 text-primary px-3 py-1 rounded-lg mb-4 inline-block">{f.category}</span><h3 className="text-xl font-heading font-bold text-foreground mb-2 leading-tight line-clamp-2">{f.name}</h3><p className="text-[10px] text-muted-foreground uppercase font-bold mb-6">{f.house}</p></div>
                            <div className="flex justify-between items-end border-t border-border pt-6"><div><p className="text-[10px] text-muted-foreground mb-1 font-bold uppercase">NAV (Live)</p><p className="text-2xl font-mono font-black text-foreground">₹{f.nav}</p></div><button onClick={() => onInvestClick(f)} className="bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition shadow-lg">Buy Scheme</button></div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
