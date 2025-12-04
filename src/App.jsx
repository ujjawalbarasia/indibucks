import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, where, deleteDoc, doc, writeBatch, getDocs } from 'firebase/firestore';
import { 
  TrendingUp, Shield, Zap, User, Menu, X, ChevronRight, Star, 
  Search, PieChart, ArrowUpRight, Briefcase, 
  CheckCircle, Lock, Loader, RefreshCw,
  Camera, Volume2, Phone, Mail, MapPin, Users, Download, Table, Key, Sparkles, MessageCircle, Copy, Mic, Calculator, ArrowLeftRight, LogIn, Target,
  FileText, Upload, Layers, Filter, XCircle, ToggleLeft, ToggleRight, Send, Trash2, Play, Smartphone, Flame, ThumbsUp, Eye, LogOut, AlertTriangle, Activity, MicOff, Users2, Skull, SlidersHorizontal, Terminal, Rocket, Sun, Moon
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell
} from 'recharts';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDALtiUuYzJDh3F5hQ5mmqGmxspzH3K2sM",
  authDomain: "indibucks-cd137.firebaseapp.com",
  projectId: "indibucks-cd137",
  storageBucket: "indibucks-cd137.firebasestorage.app",
  messagingSenderId: "1051808853082",
  appId: "1:1051808853082:web:543ba0b40d7fb778e07c63",
  measurementId: "G-7VE27ZDW86"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = "indibucks-cd137";
const googleProvider = new GoogleAuthProvider();
const apiKey = ""; // Gemini API Key

// --- CONSTANTS ---
const FEATURED_FUNDS = [
  '119598', '125494', '122639', '112152', '120586', '119800', '147589', '102883', 
  '100001', '120505', '118361', '118989', '120826', '120467', '135781', '113177'
];

const TRACKED_FUNDS_MOCK = [
  { code: '119598', name: 'Mirae Asset Tax Saver' },
  { code: '125494', name: 'SBI Small Cap Fund' },
  { code: '122639', name: 'Parag Parikh Flexi Cap' },
  { code: '120586', name: 'ICICI Prudential Bluechip' },
  { code: '147589', name: 'Quant Small Cap Fund' },
  { code: '112152', name: 'HDFC Mid-Cap Opportunities' }
];

const TRIBES = [
  { id: 1, name: "FIRE Rebels 🔥", members: 1240, roi: "18.2%", desc: "Retire by 40. Aggressive growth." },
  { id: 2, name: "Safe Harbors 🛡️", members: 3500, roi: "11.5%", desc: "Capital protection fortress." },
  { id: 3, name: "Tax Slayers ⚔️", members: 890, roi: "14.8%", desc: "Maximizing 80C aggressively." },
];

const REELS = [
  { id: 1, title: "SIP vs Lumpsum?", views: "1.2M", color: "from-purple-500 to-indigo-500", icon: <ArrowLeftRight className="text-white"/> },
  { id: 2, title: "Tax Hacks 2025", views: "850K", color: "from-green-500 to-emerald-500", icon: <Briefcase className="text-white"/> },
  { id: 3, title: "Small Cap Alpha", views: "2.1M", color: "from-orange-500 to-red-500", icon: <Sparkles className="text-white"/> },
];

const TESTIMONIALS = [
  { n: "Amit Sharma", r: "Business Owner", t: "IndiBucks helped me save 2 Lakhs in tax last year. The AI advisor is genius!" },
  { n: "Priya Khanna", r: "Software Engineer", t: "I love the 'Panic Mode'. It stopped me from selling during the last dip." },
  { n: "Rahul Singh", r: "Doctor", t: "The easiest way to track my family's portfolio. Highly recommended." }
];

// --- API HELPERS ---
const callGeminiFlash = async (prompt, systemInstruction = "") => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (e) { return "I'm having trouble connecting to the financial grid. Please try again."; }
};

const callGeminiVision = async (prompt, base64Image) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }, { inlineData: { mimeType: "image/png", data: base64Image } }] }] })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (e) { return null; }
};

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
    
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.3s ease, color 0.3s ease; }
    h1, h2, h3, h4, h5, h6, button, .font-heading { font-family: 'Outfit', sans-serif; }
    
    /* Light Mode (Default) */
    .glass-panel { 
      background: rgba(255, 255, 255, 0.85); 
      backdrop-filter: blur(12px); 
      border: 1px solid rgba(0, 0, 0, 0.05); 
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05); 
    }
    .glass-panel-hover:hover { 
      transform: translateY(-2px); 
      box-shadow: 0 10px 25px rgba(79, 70, 229, 0.1); 
      border-color: rgba(79, 70, 229, 0.2);
    }

    /* Dark Mode Overrides */
    .dark body { background-color: #050505; color: #ffffff; }
    .dark .glass-panel { 
      background: rgba(255, 255, 255, 0.03); 
      border: 1px solid rgba(255, 255, 255, 0.08); 
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2); 
    }
    .dark .glass-panel-hover:hover { 
      background: rgba(255, 255, 255, 0.07); 
      border-color: rgba(255, 255, 255, 0.2); 
      box-shadow: 0 0 20px rgba(79, 70, 229, 0.15); 
    }
    
    .neon-text { text-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
    
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `}</style>
);

// --- REUSABLE COMPONENTS ---
const InflationCalculator = () => {
  const [currentAmount, setCurrentAmount] = useState(100000);
  const [years, setYears] = useState(20);
  const inflationRate = 0.06;
  const realValue = currentAmount / Math.pow(1 + inflationRate, years);
  return (
    <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden group text-left transition-all duration-300">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2"><Skull className="w-6 h-6 text-red-500 animate-pulse"/><h3 className="font-bold text-xl text-gray-900 dark:text-white">Inflation Reality Check</h3></div>
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-6">See the real value of your savings if kept idle in a bank.</p>
          <div className="space-y-6">
            <div><div className="flex justify-between text-xs font-bold mb-2 text-gray-500 dark:text-gray-400"><span>TODAY'S CASH</span><span className="text-gray-900 dark:text-white">₹{currentAmount.toLocaleString()}</span></div><input type="range" min="10000" max="1000000" step="10000" value={currentAmount} onChange={e=>setCurrentAmount(Number(e.target.value))} className="w-full accent-red-500 h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"/></div>
            <div><div className="flex justify-between text-xs font-bold mb-2 text-gray-500 dark:text-gray-400"><span>AFTER {years} YEARS</span><span>6% INFLATION</span></div><input type="range" min="5" max="40" step="1" value={years} onChange={e=>setYears(Number(e.target.value))} className="w-full accent-red-500 h-2 bg-gray-200 dark:bg-gray-800 rounded-lg appearance-none cursor-pointer"/></div>
          </div>
        </div>
        <div className="glass-panel p-6 rounded-2xl text-center min-w-[200px] border border-red-500/20 bg-white/50 dark:bg-black/20">
           <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2 font-bold">Effective Value</p>
           <h4 className="text-4xl font-heading font-bold text-gray-900 dark:text-white mb-2">₹{Math.round(realValue).toLocaleString()}</h4>
           <div className="inline-block bg-red-100 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs px-3 py-1 rounded-full font-bold border border-red-200 dark:border-red-500/20">-{((1 - realValue/currentAmount)*100).toFixed(0)}% LOSS</div>
        </div>
      </div>
    </div>
  );
};

const MoneyReels = () => (
  <div className="mb-12">
    <div className="flex justify-between items-end mb-6"><h3 className="font-bold text-2xl flex items-center gap-2 text-gray-900 dark:text-white"><Smartphone className="w-6 h-6 text-indigo-500 dark:text-cyan-400"/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-cyan-400 dark:to-blue-500">Money Shortcuts</span></h3></div>
    <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x perspective-1000">
      {REELS.map(reel => (
        <div key={reel.id} className="min-w-[200px] h-[320px] rounded-3xl relative overflow-hidden group cursor-pointer snap-center shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
          <div className={`absolute inset-0 bg-gradient-to-br ${reel.color} opacity-90 transition-opacity`}></div>
          <div className="absolute top-4 right-4 bg-black/20 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-white border border-white/20"><Eye className="w-3 h-3"/> {reel.views}</div>
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition border border-white/30"><Play className="w-6 h-6 text-white fill-white ml-1" /></div></div>
          <div className="absolute bottom-0 left-0 w-full p-5 bg-gradient-to-t from-black/60 to-transparent"><div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">{reel.icon}</div><p className="text-white font-bold text-lg leading-tight">{reel.title}</p></div>
        </div>
      ))}
    </div>
  </div>
);

// --- PAGES ---

// 1. INVEST (Marketplace)
const FundMarketplace = ({ user, setShowLogin }) => {
  const [masterList, setMasterList] = useState([]);
  const [displayedFunds, setDisplayedFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterCat, setFilterCat] = useState('All');
  const [vibeMode, setVibeMode] = useState(false); // Toggle: Pro (Classic) vs Vibe (Gen Z)

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const res = await fetch('https://api.mfapi.in/mf');
        const all = await res.json();
        setMasterList(all);
        await loadFundDetails(FEATURED_FUNDS);
      } catch(e) { console.error(e); setLoading(false); }
    };
    fetchMaster();
  }, []);

  const loadFundDetails = async (codes) => {
    setLoading(true);
    const promises = codes.map(async (code) => {
      try {
        const res = await fetch(`https://api.mfapi.in/mf/${code}`);
        const json = await res.json();
        if(!json.meta) return null;
        const name = json.meta.scheme_name;
        let category = name.includes('Liquid') ? "Liquid" : name.includes('Small') ? "Small Cap" : name.includes('Mid') ? "Mid Cap" : name.includes('Flexi') ? "Flexi Cap" : "Large Cap";
        let risk = category === 'Small Cap' ? "Very High" : category === 'Liquid' ? "Low" : "Moderate";
        return { code: json.meta.scheme_code, name: name.replace(" Fund", ""), house: json.meta.fund_house, nav: json.data[0].nav, category, risk, minInv: 500 };
      } catch(e) { return null; }
    });
    const results = await Promise.all(promises);
    setDisplayedFunds(results.filter(f => f !== null));
    setLoading(false);
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchTerm.length > 3) {
        const matches = masterList.filter(f => f.schemeName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map(f => f.schemeCode);
        if(matches.length > 0) loadFundDetails(matches);
      }
    }, 500);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, masterList]);

  const filtered = displayedFunds.filter(f => (filterRisk === 'All' || f.risk === filterRisk) && (filterCat === 'All' || f.category === filterCat));

  return (
    <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div><h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-gray-900 dark:text-white">Funds Exchange</h1><p className="text-gray-500 font-medium">Access 45,000+ Schemes via BSE Star MF.</p></div>
        <div className="glass-panel p-1 rounded-full flex items-center bg-white dark:bg-white/5"><button onClick={() => setVibeMode(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!vibeMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Classic View</button><button onClick={() => setVibeMode(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${vibeMode ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Gen Z Mode</button></div>
      </div>
      <MoneyReels />
      <div className="sticky top-24 z-30 glass-panel p-4 rounded-2xl mb-10 border-t border-gray-100 dark:border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4"><div className="relative flex-1"><Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5"/><input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search (e.g. HDFC, Quant)..." className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition"/></div><select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-white outline-none cursor-pointer"><option value="All">All Assets</option><option value="Small Cap">Small Cap</option><option value="Mid Cap">Mid Cap</option><option value="Large Cap">Large Cap</option><option value="Liquid">Liquid</option></select></div>
      </div>
      {loading ? <div className="py-20 flex justify-center"><Loader className="w-10 h-10 text-indigo-500 animate-spin"/></div> : 
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(fund => ( 
            <div key={fund.code} className="glass-panel glass-panel-hover p-6 rounded-2xl transition-all group relative overflow-hidden bg-white dark:bg-white/5">
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">{fund.category}</div>
                <div className={`text-xs font-bold px-2 py-1 rounded border ${fund.risk==='Very High'?'text-red-500 border-red-200 dark:border-red-500/30':'text-green-500 border-green-200 dark:border-green-500/30'}`}>{vibeMode ? (fund.risk==='Very High' ? '🌶️ Spicy' : '🧊 Chill') : fund.risk}</div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 leading-tight min-h-[3.5rem] group-hover:text-indigo-500 transition-colors">{fund.name}</h3><p className="text-xs text-gray-500 mb-6 font-mono uppercase">{fund.house}</p>
              <div className="flex justify-between items-end border-t border-gray-100 dark:border-white/5 pt-4"><div><p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current NAV</p><p className="font-mono text-xl font-bold text-gray-900 dark:text-white">₹{fund.nav}</p></div><button onClick={()=>window.open(`https://wa.me/919810793780?text=Invest in ${fund.name}`)} className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition shadow-lg">Buy Now</button></div>
            </div>
          ))}
        </div>
      }
    </div>
  );
};

// 2. SOCIAL TRIBES
const SocialTribes = () => (
  <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
    <div className="text-center mb-16"><h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">Investment Tribes</h1><p className="text-gray-500 text-xl">Join like-minded investors.</p></div>
    <div className="grid md:grid-cols-3 gap-8">{TRIBES.map(tribe => ( <div key={tribe.id} className="glass-panel glass-panel-hover p-8 rounded-3xl relative overflow-hidden group bg-white dark:bg-white/5"><div className="relative z-10"><div className="flex justify-between items-start mb-6"><div className="w-14 h-14 bg-indigo-50 dark:bg-white/5 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-white/10 group-hover:scale-110 transition"><Users2 className="w-7 h-7 text-indigo-500 dark:text-indigo-400"/></div><span className="bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-400 text-xs font-bold px-3 py-1 rounded-full">ROI: {tribe.roi}</span></div><h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{tribe.name}</h3><p className="text-gray-500 mb-8 leading-relaxed text-sm">{tribe.desc}</p><div className="flex items-center justify-between border-t border-gray-100 dark:border-white/10 pt-6"><div className="flex items-center gap-2"><div className="flex -space-x-3">{[1,2,3].map(i=><div key={i} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-[#050505]"></div>)}</div><span className="text-xs font-bold text-gray-500 ml-2">+{tribe.members}</span></div><button className="text-indigo-600 dark:text-indigo-400 text-sm font-bold hover:underline transition flex items-center gap-1">JOIN <ChevronRight className="w-4 h-4"/></button></div></div></div>))}</div>
  </div>
);

// 3. ANALYZER
const CombinedAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('statement');
  const [analysis, setAnalysis] = useState('');
  const handleFile = async (e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = async () => { const res = await callGeminiVision("Analyze.", r.result.split(',')[1]); setAnalysis(res); }; r.readAsDataURL(f); } };

  return (
    <div className="pt-28 pb-24 px-4 max-w-4xl mx-auto min-h-screen">
      <div className="flex justify-center mb-12"><div className="glass-panel p-1.5 rounded-full inline-flex bg-white dark:bg-white/5"><button onClick={() => setActiveTab('statement')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'statement' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>X-Ray Scanner</button><button onClick={() => setActiveTab('overlap')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'overlap' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Overlap Tool</button></div></div>
      {activeTab === 'statement' ? <div className="glass-panel p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-white/10 relative group bg-white dark:bg-white/5"><Camera className="w-20 h-20 mx-auto text-indigo-500 mb-6"/><h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Scan Portfolio</h2><p className="text-gray-500 mb-8 max-w-md mx-auto">Upload your CAS statement. AI will find hidden fees.</p><label className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition inline-block"><input type="file" onChange={handleFile} className="hidden"/> Upload File</label>{analysis && <div className="mt-8 text-left bg-gray-50 dark:bg-black/40 p-6 rounded-xl border text-sm">{analysis}</div>}</div> : <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-white/5"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-500"/> Fund Intersection</h3><div className="grid md:grid-cols-2 gap-6 mb-8"><div><label className="text-xs font-bold text-gray-500 mb-2 block">FUND A</label><select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white outline-none">{TRACKED_FUNDS_MOCK.map(f=><option key={f.code}>{f.name}</option>)}</select></div><div><label className="text-xs font-bold text-gray-500 mb-2 block">FUND B</label><select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white outline-none">{TRACKED_FUNDS_MOCK.map(f=><option key={f.code}>{f.name}</option>)}</select></div></div><button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg">RUN ANALYSIS</button></div>}
    </div>
  );
};

// 4. INDIGENIE (AI Advisor)
const AIAdvisor = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  
  useEffect(() => {
    if (messages.length === 0) setMessages([{ id: 'welcome', text: "Namaste! I'm IndiGenie. Let's plan your financial freedom. Ask me anything about funds, SIPs, or taxes!", sender: 'ai' }]);
    if (user) { const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), orderBy('timestamp', 'asc')); const unsub = onSnapshot(q, s => { const msgs = s.docs.map(d => d.data()); if (msgs.length > 0) setMessages(msgs); }); return unsub; } 
  }, [user]);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  
  const handleSend = async () => { 
    if(!input.trim()) return; const t = input; setInput(''); setIsTyping(true);
    const newMsgs = [...messages, { text: t, sender: 'user' }]; setMessages(newMsgs);
    if(user) addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), { text: t, sender: 'user', timestamp: serverTimestamp() });
    const prompt = `You are IndiGenie, a smart financial advisor. Rules: 1. Suggest 'Regular Plans'. 2. Use plain text and emojis only (NO markdown). 3. Keep it punchy.`;
    const res = await callGeminiFlash(t, prompt); 
    if(user) addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), { text: res, sender: 'ai', timestamp: serverTimestamp() }); else setMessages([...newMsgs, { text: res, sender: 'ai' }]);
    setIsTyping(false); 
  };
  
  return (
    <div className="pt-28 pb-12 px-4 max-w-4xl mx-auto h-[90vh] flex flex-col">
      <div className="glass-panel p-6 rounded-t-3xl border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-white/5"><div className="flex items-center gap-4"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div><h2 className="font-heading font-bold text-gray-900 dark:text-white text-lg">INDIGENIE CHAT</h2></div></div>
      <div className="flex-1 p-6 overflow-y-auto glass-panel border-t-0 border-b-0 backdrop-blur-md bg-white/50 dark:bg-black/20">{messages.map((m, i) => <div key={i} className={`flex mb-6 ${m.sender==='user'?'justify-end':'justify-start'}`}><div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${m.sender==='user' ? 'bg-indigo-600 text-white rounded-br-none shadow-lg' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-white/10 shadow-sm'}`}>{m.text}</div></div>)}{isTyping && <div className="text-xs font-mono text-indigo-500 animate-pulse">PROCESSING...</div>}<div ref={scrollRef}/></div>
      <div className="p-4 glass-panel rounded-b-3xl border-t border-gray-200 dark:border-white/10 relative bg-white dark:bg-white/5"><input value={input} onChange={e=>setInput(e.target.value)} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/20 p-4 pr-16 rounded-xl text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition" placeholder="Ask IndiGenie..." onKeyPress={e=>e.key==='Enter'&&handleSend()}/><button onClick={handleSend} className="absolute right-6 top-6 text-indigo-500 hover:text-indigo-700 transition"><Send className="w-6 h-6"/></button></div>
    </div>
  );
};

// 5. DASHBOARD
const Dashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  useEffect(() => { if (!user) return; const q1 = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('timestamp', 'desc')); const u1 = onSnapshot(q1, (s) => setOrders(s.docs.map(doc => ({ id: doc.id, ...doc.data() })))); const q2 = query(collection(db, 'artifacts', appId, 'users', user.uid, 'vault'), orderBy('date', 'desc')); const u2 = onSnapshot(q2, (s) => setDocs(s.docs.map(doc => ({ id: doc.id, ...doc.data() })))); return () => { u1(); u2(); }; }, [user]);
  const handleUpload = async () => { const name = prompt("Doc Name:"); if(name) { setUploading(true); await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'vault'), { name, type: "PDF", date: serverTimestamp() }); setUploading(false); } };
  return (
    <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen relative">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4"><div><h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Command Center</h1><p className="text-gray-500">Welcome, {user.displayName?.split(' ')[0]}.</p></div></div>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className="relative rounded-3xl p-8 overflow-hidden group shadow-2xl"><div className="absolute inset-0 bg-gradient-to-r from-indigo-900 to-purple-900 border border-indigo-500/30 rounded-3xl"></div><div className="relative z-10"><p className="text-indigo-200 text-xs font-bold uppercase mb-2 tracking-widest">Net Liquidity</p><h2 className="text-6xl font-mono font-bold text-white mb-8">₹{orders.reduce((acc,o)=>acc+(o.amount*1.12),0).toLocaleString()}</h2><div className="flex gap-8 text-white"><div><span className="text-[10px] uppercase opacity-70 block mb-1">Invested</span><div className="font-bold text-xl">₹{orders.reduce((acc,o)=>acc+o.amount,0).toLocaleString()}</div></div><div><span className="text-[10px] uppercase opacity-70 block mb-1">XIRR</span><div className="font-bold text-xl text-emerald-400">+14.2%</div></div></div></div></div>
           <div className="glass-panel rounded-3xl overflow-hidden bg-white dark:bg-white/5"><div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center"><h3 className="font-bold text-gray-900 dark:text-white">Active Positions</h3><div className="text-xs text-gray-500">{orders.length} ASSETS</div></div>{orders.length > 0 ? <div className="divide-y divide-gray-100 dark:divide-white/5">{orders.map(o => <div key={o.id} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition"><div className="flex gap-4 items-center"><div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">{o.fundName?.[0]}</div><div><div className="font-bold text-gray-900 dark:text-white">{o.fundName}</div><div className="text-xs text-gray-500 mt-1">SIP • MONTHLY</div></div></div><div className="font-mono font-bold text-gray-900 dark:text-white">₹{o.amount.toLocaleString()}</div></div>)}</div> : <div className="p-16 text-center text-gray-500 text-sm">No active signals found.</div>}</div>
        </div>
        <div className="glass-panel rounded-3xl p-6 h-full border-l-4 border-l-cyan-500 flex flex-col bg-white dark:bg-white/5"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Lock className="w-5 h-5 text-cyan-500"/> Vault</h3><button onClick={handleUpload} disabled={uploading} className="text-cyan-500 hover:text-cyan-700"><Upload className="w-4 h-4"/></button></div><div className="flex-1 space-y-2 overflow-y-auto">{docs.length===0?<div className="flex-1 flex items-center justify-center text-gray-400 text-xs">VAULT EMPTY</div>:docs.map(d=><div key={d.id} className="p-3 border border-gray-200 dark:border-white/10 rounded-xl flex justify-between hover:bg-gray-50 dark:hover:bg-white/5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{d.name}</span><button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'users',user.uid,'vault',d.id))} className="text-red-500"><XCircle className="w-4 h-4"/></button></div>)}</div></div>
      </div>
    </div>
  );
};

// 6. HOME
const LandingPage = ({ setView }) => (
  <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center relative overflow-hidden">
    <div className="relative z-10 max-w-5xl mx-auto">
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 dark:border-white/10 dark:bg-white/5 backdrop-blur-md mb-8 animate-float shadow-sm"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span><span className="text-xs font-bold font-mono tracking-widest text-gray-500 dark:text-gray-300">SYSTEM ONLINE</span></div>
      <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gray-900 dark:text-white leading-[0.95]">WEALTH <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-white dark:via-gray-200 dark:to-gray-500">EVOLVED.</span></h1>
      <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium">The definitive platform for the next generation. <span className="text-indigo-600 dark:text-indigo-400">AI-Driven. Zero Friction.</span></p>
      <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24"><button onClick={() => setView('funds')} className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 transition shadow-xl">Enter Exchange</button><button onClick={() => setView('advisor')} className="px-10 py-5 glass-panel rounded-full font-bold text-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center justify-center gap-3"><Sparkles className="w-5 h-5 text-indigo-500"/> IndiGenie</button></div>
      <InflationCalculator />
      <div className="grid md:grid-cols-3 gap-6 text-left mb-24">{[{t:"Mutual Funds",d:"Expert portfolios"},{t:"Insurance",d:"Term & Health"},{t:"Tax Planning",d:"ELSS Strategies"}].map((s,i)=><div key={i} className="glass-panel p-8 rounded-3xl hover:border-indigo-500/50 transition duration-300 bg-white dark:bg-white/5"><h3 className="font-bold text-xl mb-2 text-gray-900 dark:text-white">{s.t}</h3><p className="text-gray-500 dark:text-gray-400 text-sm">{s.d}</p></div>)}</div>
      <div className="mb-24"><h2 className="text-3xl font-black text-gray-900 dark:text-white mb-12">TRUSTED BY 1500+ FAMILIES</h2><div className="grid md:grid-cols-3 gap-6">{TESTIMONIALS.map((t,i)=><div key={i} className="glass-panel p-8 rounded-3xl text-left bg-white dark:bg-white/5"><p className="text-gray-600 dark:text-gray-300 italic mb-4">"{t.t}"</p><p className="font-bold text-gray-900 dark:text-white">{t.n}</p><p className="text-xs text-indigo-500 uppercase">{t.r}</p></div>)}</div></div>
      <footer className="glass-panel p-12 rounded-3xl text-left grid md:grid-cols-4 gap-8 bg-white dark:bg-white/5"><div className="col-span-2"><h4 className="text-2xl font-black text-gray-900 dark:text-white mb-4">IndiBucks</h4><p className="text-gray-500">Empowering India since 2005.</p></div><div><h5 className="font-bold text-gray-900 dark:text-white mb-4">Contact</h5><ul className="space-y-2 text-gray-500 text-sm"><li>+91 98107 93780</li><li>IndiBucksMart@gmail.com</li><li>Rohini, Delhi</li></ul></div></footer>
    </div>
  </div>
);

// --- NAVIGATION ---
const Navbar = ({ user, setView, isMenuOpen, setIsMenuOpen, onLoginClick, isAdminMode, isDark, toggleTheme }) => {
  if (isAdminMode) return null;
  return (
    <nav className="fixed w-full z-50 top-4 px-4">
      <div className="max-w-4xl mx-auto glass-panel rounded-full px-6 h-16 flex items-center justify-between shadow-xl backdrop-blur-xl bg-white/90 dark:bg-black/80">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg"><TrendingUp className="w-5 h-5"/></div><span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">IndiBucks</span></div>
        <div className="hidden md:flex items-center gap-1">{['funds', 'social', 'analyzer'].map(item => <button key={item} onClick={() => setView(item)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition capitalize">{item}</button>)}</div>
        <div className="flex items-center gap-3">
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition">{isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}</button>
          <button onClick={() => setView('advisor')} className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white hover:scale-110 transition shadow-lg"><Sparkles className="w-5 h-5"/></button>
          {user ? <button onClick={() => setView('dashboard')} className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 transition">DASHBOARD</button> : <button onClick={onLoginClick} className="px-5 py-2 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white rounded-full text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition">LOGIN</button>}
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-900 dark:text-white p-2"><Menu className="w-6 h-6"/></button>
        </div>
      </div>
      {isMenuOpen && <div className="absolute top-24 left-4 right-4 glass-panel rounded-3xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 bg-white dark:bg-black/90 shadow-2xl">{['home', 'funds', 'social', 'analyzer', 'advisor'].map(item => <button key={item} onClick={() => { setView(item); setIsMenuOpen(false); }} className="p-4 text-left font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl capitalize">{item}</button>)}</div>}
    </nav>
  );
};

// --- APP ROOT ---
const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isDark, setIsDark] = useState(false); // Default Light Mode for Seniors

  useEffect(() => { const handleHashChange = () => { if (window.location.hash === '#admin') setView('admin'); }; handleHashChange(); window.addEventListener('hashchange', handleHashChange); const unsubscribe = onAuthStateChanged(auth, setUser); return () => { window.removeEventListener('hashchange', handleHashChange); unsubscribe(); }; }, []);
  const LoginModalComp = () => <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"><div className="bg-white dark:bg-[#111] p-8 rounded-3xl w-full max-w-sm relative text-center shadow-2xl"><button onClick={() => setShowLogin(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X/></button><h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Welcome Back</h2><button onClick={async () => { await signInWithPopup(auth, googleProvider); setShowLogin(false); }} className="w-full bg-white text-gray-700 border border-gray-300 font-bold py-3 rounded-xl mb-3 hover:bg-gray-50 transition flex items-center justify-center gap-2"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5"/> Continue with Google</button><button onClick={async () => { await signInAnonymously(auth); setShowLogin(false); }} className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Continue as Guest</button></div></div>;

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#050505] text-white' : 'bg-[#f8fafc] text-gray-900'} transition-colors duration-300`}>
      <GlobalStyles />
      <Navbar user={user} setView={setView} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} onLoginClick={() => setShowLogin(true)} isAdminMode={view === 'admin'} isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
      {showLogin && <LoginModalComp />}
      <main>
        {view === 'home' && <LandingPage setView={setView} />}
        {view === 'funds' && <FundMarketplace user={user} setShowLogin={setShowLogin} />}
        {view === 'social' && <SocialTribes />}
        {view === 'analyzer' && <CombinedAnalyzer />}
        {view === 'advisor' && <AIAdvisor user={user} />}
        {view === 'dashboard' && <Dashboard user={user} />}
        {view === 'admin' && <div className="pt-32 text-center">Admin Panel Hidden</div>}
      </main>
    </div>
  );
};

export default App;
