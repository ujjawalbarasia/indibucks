import React, { useState, useEffect, useRef, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithCustomToken
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  onSnapshot, 
  serverTimestamp, 
  orderBy, 
  where, 
  deleteDoc, 
  doc, 
  writeBatch, 
  getDocs, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { 
  TrendingUp, Shield, Zap, User, Menu, X, ChevronRight, Star, 
  Search, PieChart, ArrowUpRight, Briefcase, 
  CheckCircle, Lock, Loader, RefreshCw,
  Camera, Volume2, Phone, Mail, MapPin, Users, Download, Table, Key, Sparkles, MessageCircle, Copy, Mic, Calculator, ArrowLeftRight, LogIn, Target,
  FileText, Upload, Layers, Filter, XCircle, ToggleLeft, ToggleRight, Send, Trash2, Play, Smartphone, Flame, ThumbsUp, Eye, LogOut, AlertTriangle, Activity, MicOff, Users2, Skull, SlidersHorizontal, Terminal, Rocket, Sun, Moon, CreditCard, Landmark, FileCheck, BrainCircuit, HeartPulse, Telescope, UserPlus, TrendingDown, Gift,
  HelpCircle, ShieldCheck, Info, FileWarning, Scale, BookOpen, Gavel, Globe, Leaf, EyeOff, Sprout, Crosshair, Crown, Gem, Anchor, History, BarChart3, Newspaper, Gauge, Command, Swords, Bot, Coins, Percent, Banknote
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ComposedChart
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
  '100001', '120505', '118361', '118989', '120826', '120467', '135781', '113177',
  '127042', '148925', '148710', '101627'
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
  { 
    id: 1, 
    name: "FIRE Rebels", 
    members: "12.4k", 
    roi: "18.2%", 
    desc: "Retire early. Aggressive high-growth strategies for the bold.",
    icon: <Flame className="w-6 h-6 text-white"/>,
    img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop", 
    color: "from-orange-600 to-red-600"
  },
  { 
    id: 2, 
    name: "Safe Harbors", 
    members: "35.1k", 
    roi: "11.5%", 
    desc: "Capital protection fortress. Debt & large-cap allocation.",
    icon: <Shield className="w-6 h-6 text-white"/>,
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", 
    color: "from-blue-600 to-indigo-600"
  },
  { 
    id: 3, 
    name: "Tax Slayers", 
    members: "8.9k", 
    roi: "14.8%", 
    desc: "Maximizing Section 80C aggressively with top-tier ELSS.",
    icon: <FileCheck className="w-6 h-6 text-white"/>,
    img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop", 
    color: "from-emerald-600 to-teal-600"
  },
];

const COLLECTIONS = [
  { id: 'high-return', label: "High Return", icon: <TrendingUp className="w-5 h-5 text-green-500"/>, filter: { risk: "Very High" } },
  { id: 'tax-saving', label: "Tax Saving", icon: <FileText className="w-5 h-5 text-blue-500"/>, filter: { category: "ELSS" } },
  { id: 'sip-500', label: "SIP with ₹500", icon: <Coins className="w-5 h-5 text-orange-500"/>, filter: { minInv: 500 } },
  { id: 'large-cap', label: "Large Cap", icon: <Crown className="w-5 h-5 text-purple-500"/>, filter: { category: "Large Cap" } },
  { id: 'mid-cap', label: "Mid Cap", icon: <Layers className="w-5 h-5 text-indigo-500"/>, filter: { category: "Mid Cap" } },
  { id: 'small-cap', label: "Small Cap", icon: <Sprout className="w-5 h-5 text-emerald-500"/>, filter: { category: "Small Cap" } },
];

const REELS = [
  { id: 1, title: "SIP vs Lumpsum?", views: "1.2M", img: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=2070&auto=format&fit=crop", icon: <ArrowLeftRight className="text-white"/> },
  { id: 2, title: "Tax Hacks 2025", views: "850K", img: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?q=80&w=2070&auto=format&fit=crop", icon: <Briefcase className="text-white"/> },
  { id: 3, title: "Small Cap Alpha", views: "2.1M", img: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2064&auto=format&fit=crop", icon: <Sparkles className="text-white"/> },
];

const TESTIMONIALS = [
  { n: "Amit Sharma", r: "Business Owner", t: "IndiBucks helped me save 2 Lakhs in tax last year. The AI advisor is genius!" },
  { n: "Priya Khanna", r: "Software Engineer", t: "I love the 'Panic Mode'. It stopped me from selling during the last dip." },
  { n: "Rahul Singh", r: "Doctor", t: "The easiest way to track my family's portfolio. Highly recommended." }
];

const FAQS = [
  { q: "Is IndiBucks SEBI Registered?", a: "IndiBucks is an AMFI Registered Mutual Fund Distributor (ARN-XXXXXX). We facilitate transactions via the secure BSE Star MF infrastructure." },
  { q: "How does money move?", a: "Your money moves directly from your bank account to the Mutual Fund House's account via the clearing corporation (ICCL). We never touch your funds." },
  { q: "Is it safe?", a: "Yes. We use bank-grade AES-256 encryption. Your units are held in your name at the CDSL/NSDL depository and can be verified directly with the AMC." },
  { q: "Do you charge fees?", a: "The app is free for investors. We earn a commission from Asset Management Companies (AMCs) for the Regular Plans we distribute. This allows us to provide technology and support at no cost to you." }
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
    return data.candidates?.[0]?.content?.parts?.[0]?.text || "System Unavailable";
  } catch (e) { return "I'm having trouble connecting to the financial grid. Please try again."; }
};

const callGeminiJSON = async (prompt, systemInstruction = "Output valid JSON only.") => {
  try {
    const text = await callGeminiFlash(prompt, systemInstruction);
    const jsonStr = text.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (e) { console.error("JSON Parse Error", e); return null; }
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

// --- BSE SERVICE ---
const BSEService = {
  async registerClient(userData) {
    await new Promise(r => setTimeout(r, 2000));
    return { success: true, ucc: userData.pan, bseRef: `CL-${Math.floor(Math.random() * 1000000)}` };
  },
  async placeOrder(orderData) {
    await new Promise(r => setTimeout(r, 2000));
    return { success: true, orderId: `ORD-${Math.floor(Math.random() * 1000000)}`, paymentLink: "https://www.bsestarmf.in" };
  }
};

// --- STYLES ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
    
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.5s ease, color 0.5s ease; }
    h1, h2, h3, h4, h5, h6, button, .font-heading { font-family: 'Outfit', sans-serif; }
    
    /* GLASSMORPHISM 2.0 */
    .glass-panel { 
      background: rgba(255, 255, 255, 0.8); 
      backdrop-filter: blur(24px); 
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.4); 
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07); 
    }
    .glass-panel-hover:hover { 
      transform: translateY(-4px); 
      box-shadow: 0 12px 40px 0 rgba(79, 70, 229, 0.15); 
      border-color: rgba(99, 102, 241, 0.4);
    }

    .dark .glass-panel { 
      background: rgba(20, 20, 20, 0.6); 
      border: 1px solid rgba(255, 255, 255, 0.08); 
      box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); 
    }
    .dark .glass-panel-hover:hover { 
      background: rgba(30, 30, 30, 0.8); 
      border-color: rgba(99, 102, 241, 0.3); 
      box-shadow: 0 0 30px rgba(79, 70, 229, 0.15); 
    }
    
    .zen-mode-blur { filter: blur(6px); opacity: 0.3; transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1); }
    .neon-text { text-shadow: 0 0 10px rgba(99, 102, 241, 0.5); }
    
    /* ANIMATIONS */
    @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-10px); } }
    .animate-float { animation: float 6s ease-in-out infinite; }
    
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .animate-slide-up { animation: slideUpFade 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    
    .stagger-1 { animation-delay: 0.1s; }
    .stagger-2 { animation-delay: 0.2s; }
    .stagger-3 { animation-delay: 0.3s; }
    .stagger-4 { animation-delay: 0.4s; }

    @keyframes pulse-glow { 0%, 100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.4); } 50% { box-shadow: 0 0 20px 0 rgba(99, 102, 241, 0.2); } }
    .animate-pulse-glow { animation: pulse-glow 3s infinite; }

    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `}</style>
);

// --- ANIMATED BACKGROUND ---
const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 dark:bg-indigo-900/20 rounded-full blur-[120px] animate-float" style={{animationDuration: '10s'}}></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/5 dark:bg-purple-900/20 rounded-full blur-[120px] animate-float" style={{animationDuration: '15s', animationDelay: '2s'}}></div>
    <div className="absolute top-[40%] left-[40%] w-[40%] h-[40%] bg-cyan-500/5 dark:bg-cyan-900/10 rounded-full blur-[100px] animate-pulse" style={{animationDuration: '8s'}}></div>
  </div>
);

// --- PAGE TRANSITION WRAPPER ---
const PageTransition = ({ children }) => (
  <div className="animate-slide-up relative z-10">{children}</div>
);

// =======================
// WIDGETS & SMALL COMPONENTS (Defined First)
// =======================

const QuickCollections = ({ onSelect }) => (
  <div className="mb-10 animate-slide-up">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Crown className="w-5 h-5 text-yellow-500"/> Curated Collections</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {COLLECTIONS.map(col => (
        <div 
          key={col.id} 
          onClick={() => onSelect(col.filter)}
          className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:bg-indigo-50 dark:hover:bg-white/10 transition-all group border-transparent hover:border-indigo-500/30"
        >
          <div className="p-3 bg-white dark:bg-black/40 rounded-full shadow-sm group-hover:scale-110 transition-transform">
            {col.icon}
          </div>
          <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{col.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const MoneyReels = () => (
  <div className="mb-12 animate-slide-up" style={{animationDelay: '0.2s'}}>
    <div className="flex justify-between items-end mb-6"><h3 className="font-bold text-2xl flex items-center gap-2 text-gray-900 dark:text-white"><Smartphone className="w-6 h-6 text-indigo-500 dark:text-cyan-400"/> <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-cyan-400 dark:to-blue-500">Money Shortcuts</span></h3></div>
    <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x perspective-1000">
      {REELS.map(reel => (
        <div key={reel.id} className="min-w-[200px] h-[320px] rounded-3xl relative overflow-hidden group cursor-pointer snap-center shadow-lg hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border border-white/10">
          <img src={reel.img} alt={reel.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
          
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-white border border-white/20"><Eye className="w-3 h-3"/> {reel.views}</div>
          <div className="absolute inset-0 flex items-center justify-center"><div className="w-14 h-14 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center group-hover:scale-110 transition border border-white/30"><Play className="w-6 h-6 text-white fill-white ml-1" /></div></div>
          <div className="absolute bottom-0 left-0 w-full p-5"><div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20">{reel.icon}</div><p className="text-white font-bold text-lg leading-tight">{reel.title}</p></div>
        </div>
      ))}
    </div>
  </div>
);

const InflationCalculator = () => {
  const [currentAmount, setCurrentAmount] = useState(100000);
  const [years, setYears] = useState(20);
  const inflationRate = 0.06;
  const realValue = currentAmount / Math.pow(1 + inflationRate, years);
  return (
    <div className="glass-panel p-8 rounded-3xl mb-16 relative overflow-hidden group text-left transition-all duration-300 hover:scale-[1.01]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="flex flex-col md:flex-row gap-8 items-center relative z-10">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2"><Skull className="w-6 h-6 text-red-500 animate-pulse"/><h3 className="font-bold text-xl text-gray-900 dark:text-white">Inflation Reality Check</h3></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-6">See the real value of your savings if kept idle in a bank.</p>
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

const WealthAccelerator = () => {
  const [extraSip, setExtraSip] = useState(500);
  const rate = 0.12; 
  const years = 20;
  const i = rate / 12;
  const n = years * 12;
  const extraWealth = extraSip * ((((Math.pow(1 + i, n)) - 1) / i) * (1 + i));

  return (
    <div className="glass-panel p-6 rounded-3xl mb-8 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 border border-indigo-100 dark:border-indigo-500/30">
      <div className="flex justify-between items-start mb-4">
        <div><h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-500"/> Wealth Accelerator</h3><p className="text-xs text-gray-500 dark:text-gray-400">Small increase today = Massive wealth tomorrow.</p></div>
      </div>
      <div className="space-y-4">
        <div><div className="flex justify-between text-sm font-bold text-gray-700 dark:text-gray-300 mb-2"><span>Increase SIP by:</span><span className="text-indigo-600 dark:text-indigo-400">₹{extraSip}</span></div><input type="range" min="500" max="10000" step="500" value={extraSip} onChange={e=>setExtraSip(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"/></div>
        <div className="bg-white dark:bg-black/30 p-4 rounded-xl text-center border border-gray-100 dark:border-white/10"><p className="text-xs text-gray-500 uppercase font-bold mb-1">Extra Wealth in 20 Years</p><h4 className="text-3xl font-black text-green-600 dark:text-green-400">+₹{(extraWealth/100000).toFixed(2)} Lakhs</h4></div>
        <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold text-sm hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition flex items-center justify-center gap-2"><Zap className="w-4 h-4 fill-current"/> Boost My SIP</button>
      </div>
    </div>
  );
};

const RiskRadar = () => {
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
          <Activity className="w-5 h-5 text-indigo-500"/> Risk Radar 360
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
      <div className="grid grid-cols-3 gap-2 mt-2 text-center">
        <div className="p-2 bg-gray-50 dark:bg-black/20 rounded-lg">
          <div className="text-[10px] text-gray-400 uppercase">Alpha</div>
          <div className="font-bold text-indigo-500 text-sm">+2.4%</div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-black/20 rounded-lg">
          <div className="text-[10px] text-gray-400 uppercase">Beta</div>
          <div className="font-bold text-gray-600 dark:text-gray-300 text-sm">0.85</div>
        </div>
        <div className="p-2 bg-gray-50 dark:bg-black/20 rounded-lg">
          <div className="text-[10px] text-gray-400 uppercase">Sharpe</div>
          <div className="font-bold text-green-500 text-sm">1.2</div>
        </div>
      </div>
    </div>
  );
};

const MarketSentiment = () => {
  const [sentiment, setSentiment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const analyzeSentiment = async () => {
      const headlines = [
        "RBI holds repo rate steady amid inflation concerns",
        "Sensex surges 500 points on strong global cues",
        "Tech stocks rally as quarterly earnings beat estimates",
        "Oil prices dip slightly, easing pressure on rupee"
      ];
      
      const prompt = `Analyze these financial headlines and provide a market sentiment score from 0 (Extreme Fear) to 100 (Extreme Greed). Also provide a 1-sentence summary. Headlines: ${JSON.stringify(headlines)}. Return JSON: { "score": number, "summary": string }`;
      
      const res = await callGeminiJSON(prompt);
      if (res) setSentiment(res);
      setLoading(false);
    };
    analyzeSentiment();
  }, []);

  return (
    <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-white/5 h-full flex flex-col justify-between">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-indigo-500"/> Market Mood
        </h3>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
          <span className="text-[10px] text-gray-500 uppercase font-bold">Live AI</span>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader className="w-8 h-8 text-indigo-500 animate-spin"/>
        </div>
      ) : (
        <>
          <div className="relative h-32 flex items-center justify-center">
            <Gauge className="w-32 h-32 text-gray-200 dark:text-gray-700 absolute opacity-20" />
            <div className="text-center relative z-10">
              <div className="text-4xl font-black text-indigo-600 dark:text-indigo-400">{sentiment?.score || 65}</div>
              <div className="text-xs font-bold text-gray-500 uppercase tracking-widest">Score</div>
            </div>
            <div className="absolute w-1 h-14 bg-indigo-500 origin-bottom bottom-1/2 left-1/2 -ml-0.5 rounded-full transition-transform duration-1000 ease-out" style={{ transform: `rotate(${(sentiment?.score || 65) * 1.8 - 90}deg)` }}></div>
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-300 text-center mt-2 leading-relaxed">
            "{sentiment?.summary || "Market sentiment appears moderately bullish based on recent positive global cues and steady rates."}"
          </p>
        </>
      )}
    </div>
  );
};

const GoalDNA = () => {
  const [goals, setGoals] = useState([
    { id: 1, name: "Tesla Model 3", target: 4500000, current: 1200000, date: "2026", icon: <Target className="w-4 h-4 text-white"/>, color: "bg-gradient-to-r from-red-500 to-pink-500" },
    { id: 2, name: "Bali Villa", target: 8000000, current: 3500000, date: "2030", icon: <Globe className="w-4 h-4 text-white"/>, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  ]);

  return (
    <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-white/5 h-full transition-all duration-500 hover:scale-[1.02]">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sprout className="w-5 h-5 text-green-500"/> Goal DNA
        </h3>
        <button className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">+ ADD GOAL</button>
      </div>
      <div className="space-y-6">
        {goals.map(g => {
          const progress = (g.current / g.target) * 100;
          return (
            <div key={g.id} className="relative group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shadow-md ${g.color}`}>{g.icon}</div>
                  <div>
                    <div className="font-bold text-gray-900 dark:text-white text-sm">{g.name}</div>
                    <div className="text-[10px] text-gray-400">{g.date} Target</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{progress.toFixed(0)}%</div>
                  <div className="text-[10px] text-gray-400">₹{(g.current/100000).toFixed(1)}L / {(g.target/100000).toFixed(1)}L</div>
                </div>
              </div>
              <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${g.color} rounded-full transition-all duration-1000 relative overflow-hidden`} style={{ width: `${progress}%` }}>
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-xl border border-green-100 dark:border-green-500/20 flex items-center gap-3">
        <Leaf className="w-8 h-8 text-green-600 dark:text-green-400"/>
        <div>
          <div className="font-bold text-green-800 dark:text-green-300 text-sm">Carbon Footprint</div>
          <div className="text-[10px] text-green-600 dark:text-green-400">Your portfolio is <span className="font-bold">85% Green</span>. Great job!</div>
        </div>
      </div>
    </div>
  );
};

const SIPTurbocharger = () => {
  const [stepUp, setStepUp] = useState(10);
  return (
    <div className="glass-panel p-6 rounded-3xl mb-8 bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-indigo-500/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Rocket className="w-5 h-5 text-indigo-500"/> SIP Turbocharger
        </h3>
        <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-300 px-2 py-1 rounded-full font-bold">AUTO-PILOT</span>
      </div>
      <p className="text-xs text-gray-500 mb-6">See the magic of increasing your SIP annually.</p>
      
      <div className="flex items-end gap-2 h-32 mb-4">
        <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-t-xl relative group">
          <div className="absolute bottom-0 w-full bg-indigo-300 dark:bg-indigo-800 rounded-t-xl transition-all duration-1000" style={{height: '40%'}}></div>
          <div className="absolute -top-6 left-0 w-full text-center text-[10px] text-gray-500">Normal</div>
        </div>
        <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-t-xl relative group">
          <div className="absolute bottom-0 w-full bg-indigo-500 dark:bg-indigo-600 rounded-t-xl transition-all duration-1000 shadow-[0_0_15px_rgba(99,102,241,0.5)]" style={{height: `${40 + stepUp * 1.5}%`}}></div>
          <div className="absolute -top-6 left-0 w-full text-center text-[10px] font-bold text-indigo-600 dark:text-indigo-400">Turbo</div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-gray-500">Step Up: {stepUp}%</span>
        <input type="range" min="5" max="25" step="5" value={stepUp} onChange={e=>setStepUp(Number(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
      </div>
      <p className="text-center text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-4">
        {stepUp}% annual hike = 2.5x Wealth in 20 Years!
      </p>
    </div>
  );
};

// =======================
// FEATURE COMPONENTS & MODALS (Defined Before Usage)
// =======================

const LoginModal = ({ onClose }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const handleGoogle = async () => { try { await signInWithPopup(auth, googleProvider); onClose(); } catch (e) { setError(e.message); } };
  const handleEmailAuth = async (e) => { e.preventDefault(); setError(''); try { if (isSignUp) { const res = await createUserWithEmailAndPassword(auth, email, password); await updateProfile(res.user, { displayName: name }); } else { await signInWithEmailAndPassword(auth, email, password); } onClose(); } catch (e) { setError(e.message); } };
  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-up">
      <div className="glass-panel p-8 rounded-3xl w-full max-w-sm relative text-center shadow-2xl bg-white dark:bg-[#111]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X/></button>
        <h2 className="text-2xl font-bold mb-1 text-gray-900 dark:text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
        <p className="text-sm text-gray-500 mb-6">Manage your wealth with AI precision.</p>
        {error && <div className="mb-4 p-2 bg-red-50 text-red-500 text-xs rounded-lg">{error}</div>}
        <button onClick={handleGoogle} className="w-full bg-white text-gray-700 border border-gray-300 font-bold py-3 rounded-xl mb-4 hover:bg-gray-50 transition flex items-center justify-center gap-2"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5"/> Continue with Google</button>
        <div className="relative mb-6"><div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200 dark:border-white/10"></div></div><div className="relative flex justify-center text-sm"><span className="px-2 bg-white dark:bg-[#111] text-gray-500">Or continue with email</span></div></div>
        <form onSubmit={handleEmailAuth} className="space-y-3">
          {isSignUp && <input type="text" placeholder="Full Name" value={name} onChange={e=>setName(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-gray-900 dark:text-white"/>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-gray-900 dark:text-white"/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl outline-none text-gray-900 dark:text-white"/>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition">{isSignUp ? 'Sign Up' : 'Log In'}</button>
        </form>
        <p className="mt-4 text-xs text-gray-500">{isSignUp ? "Already have an account?" : "Don't have an account?"} <button onClick={()=>setIsSignUp(!isSignUp)} className="text-indigo-600 font-bold ml-1 hover:underline">{isSignUp ? 'Log In' : 'Sign Up'}</button></p>
      </div>
    </div>
  );
};

const ComplianceModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState('regulatory');
  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-md flex items-center justify-center p-4 animate-slide-up">
      <div className="glass-panel rounded-3xl w-full max-w-2xl relative bg-white dark:bg-[#111] max-h-[80vh] flex flex-col overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50 dark:bg-white/5">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Scale className="w-6 h-6 text-indigo-500"/> Compliance & Legal</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-white/10 transition"><X className="w-5 h-5"/></button>
        </div>
        <div className="flex border-b border-gray-100 dark:border-white/10 bg-white dark:bg-black">
          {['regulatory', 'privacy', 'terms', 'grievance'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-4 text-sm font-bold capitalize transition-colors ${activeTab === tab ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400'}`}>{tab}</button>
          ))}
        </div>
        <div className="p-8 overflow-y-auto text-sm text-gray-600 dark:text-gray-300 space-y-6">
          {activeTab === 'regulatory' && (
            <>
              <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-2xl border border-blue-100 dark:border-blue-800">
                <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2 text-lg"><FileCheck className="w-5 h-5"/> AMFI Registration</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div><p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase font-bold">ARN Code</p><p className="font-mono font-bold">ARN-183942</p></div>
                  <div><p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase font-bold">Entity</p><p>IndiBucks Fintech LLP</p></div>
                  <div><p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase font-bold">Date</p><p>01/01/2025</p></div>
                  <div><p className="text-xs text-blue-600/70 dark:text-blue-400/70 uppercase font-bold">Validity</p><p>Perpetual</p></div>
                </div>
              </div>
              <div className="space-y-2"><h4 className="font-bold text-gray-900 dark:text-white">Commission Disclosure</h4><p>In accordance with SEBI Circular No. SEBI/IMD/CIR No. 4/168230/09, we hereby disclose that we act as a distributor for Mutual Funds and earn a commission (trail basis) from Asset Management Companies (AMCs). This allows us to offer you this platform for free.</p></div>
            </>
          )}
          {activeTab === 'grievance' && (
            <div className="space-y-6">
              <div className="p-4 border border-gray-200 dark:border-white/10 rounded-xl"><h4 className="font-bold text-gray-900 dark:text-white mb-2">Level 1: Customer Support</h4><p>Email: <a href="mailto:support@indibucks.in" className="text-indigo-600">support@indibucks.in</a></p><p>Phone: +91 98107 93780 (Mon-Fri, 9am-6pm)</p></div>
              <div className="p-4 border border-gray-200 dark:border-white/10 rounded-xl"><h4 className="font-bold text-gray-900 dark:text-white mb-2">Level 2: Compliance Officer</h4><p>Name: Mr. Rahul Kumar</p><p>Email: compliance@indibucks.in</p></div>
              <p className="text-xs text-gray-500">If unresolved after 30 days, lodge a complaint at <a href="https://scores.gov.in" className="text-indigo-600 underline">SEBI SCORES</a>.</p>
            </div>
          )}
          {activeTab === 'privacy' && <div className="space-y-4"><h3 className="font-bold text-gray-900 dark:text-white">Data Privacy Policy</h3><p>Your data is processed securely. We do not sell your personal information.</p><ul className="list-disc pl-5 space-y-1"><li>Data encrypted using AES-256.</li><li>KYC data shared only with KRA/Central Registry.</li><li>Transaction data routed to BSE Star MF.</li></ul></div>}
        </div>
      </div>
    </div>
  );
};

const FAQModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-up">
    <div className="glass-panel p-8 rounded-3xl w-full max-w-lg relative bg-white dark:bg-[#111] max-h-[80vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X/></button>
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2"><HelpCircle className="w-6 h-6 text-indigo-500"/> FAQs</h2>
      <div className="space-y-4">
        {FAQS.map((item, i) => (
          <div key={i} className="border-b border-gray-100 dark:border-white/10 pb-4">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-1 text-sm">{item.q}</h4>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AboutModal = ({ onClose }) => (
  <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-slide-up">
    <div className="glass-panel p-8 rounded-3xl w-full max-w-lg relative bg-white dark:bg-[#111] max-h-[80vh] overflow-y-auto">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X/></button>
      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-4 text-indigo-600 dark:text-indigo-400"><TrendingUp className="w-6 h-6"/></div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">About IndiBucks</h2>
      <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm leading-relaxed">IndiBucks is a technology-first investment platform dedicated to simplifying wealth creation. We act as a bridge between investors and India's top Asset Management Companies.</p>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl"><h4 className="font-bold text-indigo-600 dark:text-indigo-400">Compliance</h4><p className="text-xs text-gray-500 dark:text-gray-400">AMFI Registered Distributor.</p></div>
        <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-xl"><h4 className="font-bold text-indigo-600 dark:text-indigo-400">Security</h4><p className="text-xs text-gray-500 dark:text-gray-400">ISO 27001 Compliant.</p></div>
      </div>
    </div>
  </div>
);

const FundFaceOff = ({ fund1, fund2, onClose }) => {
  const [comparison, setComparison] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const compare = async () => {
      const prompt = `Compare these two mutual funds for a retail investor in India: 1. ${fund1.name} (${fund1.category}) and 2. ${fund2.name} (${fund2.category}). 
      Highlight the pros and cons of each and suggest who should invest in which. Keep it concise (under 150 words) and use markdown bolding.`;
      
      const res = await callGeminiFlash(prompt, "You are a senior financial analyst.");
      setComparison(res);
      setLoading(false);
    };
    compare();
  }, [fund1, fund2]);

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-slide-up">
      <div className="glass-panel p-8 rounded-3xl w-full max-w-2xl relative bg-white dark:bg-[#111] border border-indigo-500/20 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white"><X/></button>
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-white/10 rounded-full flex items-center justify-center text-indigo-600 dark:text-white font-bold mx-auto mb-2">{fund1.name[0]}</div>
            <p className="text-xs font-bold text-gray-500 max-w-[100px] truncate">{fund1.name}</p>
          </div>
          <Swords className="w-8 h-8 text-red-500 animate-pulse" />
          <div className="text-center">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-white/10 rounded-full flex items-center justify-center text-indigo-600 dark:text-white font-bold mx-auto mb-2">{fund2.name[0]}</div>
            <p className="text-xs font-bold text-gray-500 max-w-[100px] truncate">{fund2.name}</p>
          </div>
        </div>
        
        <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-6">AI Battle Analysis</h3>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <Loader className="w-10 h-10 text-indigo-500 animate-spin"/>
            <p className="text-xs text-gray-500 animate-pulse">Analyzing portfolios, risk ratios & past returns...</p>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-white/5 p-6 rounded-2xl text-sm leading-relaxed text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/10 max-h-[40vh] overflow-y-auto">
            {comparison}
          </div>
        )}
      </div>
    </div>
  );
};

const FundDetailsModal = ({ fund, onClose, onInvest, user }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [calculatorType, setCalculatorType] = useState('sip');
  const [investmentAmt, setInvestmentAmt] = useState(5000);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [eli5Mode, setEli5Mode] = useState(false); 

  // Mock data for chart
  const data = Array.from({length: 20}, (_, i) => ({
    name: `Yr ${i}`,
    nav: (Number(fund.nav) || 100) * (1 + (i * 0.12)) + (Math.random() * 20)
  }));

  useEffect(() => {
    if (activeTab === 'analysis' && !aiAnalysis) {
      const fetchAnalysis = async () => {
        const prompt = `Act as a senior fund analyst. Analyze the fund "${fund.name}" (${fund.category}, ${fund.risk}). 
        1. "The Good": 2 bullet points on why to buy.
        2. "The Bad": 1 risk factor.
        3. "Verdict": One punchy sentence.
        Keep it concise and use markdown.`;
        const res = await callGeminiFlash(prompt);
        setAiAnalysis(res);
      };
      fetchAnalysis();
    }
  }, [activeTab, fund]);

  const projectedValue = calculatorType === 'sip' 
    ? investmentAmt * 12 * 5 * 1.35 
    : investmentAmt * 1.76; 

  return (
    <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-xl flex items-center justify-center p-4 animate-slide-up">
      <div className="glass-panel w-full max-w-4xl h-[90vh] rounded-3xl relative bg-white dark:bg-[#0a0a0a] flex flex-col overflow-hidden shadow-2xl border border-white/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-start bg-gray-50/50 dark:bg-white/5">
          <div className="flex gap-4">
            <div className="w-16 h-16 bg-indigo-100 dark:bg-white/10 rounded-2xl flex items-center justify-center text-indigo-600 dark:text-white font-bold text-2xl shadow-inner">
              {fund.name[0]}
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-900 dark:text-white leading-tight">{fund.name}</h2>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-1 bg-gray-200 dark:bg-white/10 rounded text-[10px] font-bold text-gray-600 dark:text-gray-300">{fund.category}</span>
                <span className={`px-2 py-1 rounded text-[10px] font-bold border ${fund.risk === 'Very High' ? 'text-red-500 border-red-500/30' : 'text-green-500 border-green-500/30'}`}>{fund.risk}</span>
                <button onClick={() => setEli5Mode(!eli5Mode)} className={`px-2 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition-all ${eli5Mode ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'text-gray-400 border-gray-500/30'}`}>
                  <Bot className="w-3 h-3"/> ELI5 Mode {eli5Mode ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-gray-100 dark:bg-white/10 rounded-full hover:bg-red-500 hover:text-white transition"><X/></button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
            <div className="flex gap-6 mb-8 border-b border-gray-100 dark:border-white/10 pb-1">
              {['overview', 'analysis', 'calculator'].map(tab => (
                <button 
                  key={tab} 
                  onClick={() => setActiveTab(tab)} 
                  className={`pb-3 text-sm font-bold capitalize transition-all ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8 animate-slide-up">
                <div className="h-64 w-full bg-gradient-to-b from-indigo-50/50 to-transparent dark:from-indigo-900/10 rounded-2xl p-4 border border-indigo-100 dark:border-white/5">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorNav" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <Tooltip 
                        contentStyle={{backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff'}}
                        itemStyle={{color: '#818cf8'}}
                      />
                      <Area type="monotone" dataKey="nav" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorNav)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <div className="text-xs text-gray-500 mb-1">NAV</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">₹{fund.nav}</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      Min SIP {eli5Mode && <Info className="w-3 h-3 text-yellow-500" title="Smallest amount you can invest monthly"/>}
                    </div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">₹500</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <div className="text-xs text-gray-500 mb-1">Fund Size</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">₹12,400Cr</div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                    <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      Exp. Ratio {eli5Mode && <Info className="w-3 h-3 text-yellow-500" title="Fee paid to the fund manager annually"/>}
                    </div>
                    <div className="text-xl font-bold text-green-500">0.76%</div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analysis' && (
              <div className="animate-slide-up">
                {!aiAnalysis ? (
                  <div className="flex flex-col items-center justify-center h-64">
                    <Loader className="w-10 h-10 text-indigo-500 animate-spin mb-4"/>
                    <p className="text-gray-500 text-sm">Gemini is analyzing market data...</p>
                  </div>
                ) : (
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-8 rounded-3xl border border-indigo-100 dark:border-white/10">
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles className="w-6 h-6 text-indigo-600"/>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">IndiGenie Analysis</h3>
                    </div>
                    <div className="prose dark:prose-invert text-sm leading-relaxed whitespace-pre-wrap font-medium text-gray-700 dark:text-gray-300">
                      {aiAnalysis}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'calculator' && (
              <div className="animate-slide-up space-y-8">
                <div className="flex p-1 bg-gray-100 dark:bg-white/10 rounded-xl w-max">
                  <button onClick={()=>setCalculatorType('sip')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${calculatorType==='sip'?'bg-white dark:bg-gray-800 shadow-sm text-indigo-600':'text-gray-500'}`}>SIP</button>
                  <button onClick={()=>setCalculatorType('lumpsum')} className={`px-6 py-2 rounded-lg text-sm font-bold transition ${calculatorType==='lumpsum'?'bg-white dark:bg-gray-800 shadow-sm text-indigo-600':'text-gray-500'}`}>Lumpsum</button>
                </div>
                
                <div>
                  <div className="flex justify-between mb-4">
                    <span className="font-bold text-gray-700 dark:text-gray-300">Investment Amount</span>
                    <span className="font-bold text-indigo-600 text-xl">₹{investmentAmt.toLocaleString()}</span>
                  </div>
                  <input type="range" min="500" max="100000" step="500" value={investmentAmt} onChange={e=>setInvestmentAmt(Number(e.target.value))} className="w-full accent-indigo-600 h-2 bg-gray-200 rounded-lg"/>
                </div>

                <div className="bg-gray-900 dark:bg-white text-white dark:text-black p-8 rounded-3xl text-center">
                  <p className="text-sm opacity-70 mb-2 uppercase tracking-widest font-bold">Projected Value (5Y)</p>
                  <h3 className="text-5xl font-black mb-2">₹{Math.round(projectedValue).toLocaleString()}</h3>
                  <p className="text-xs opacity-50">Based on historic category returns of ~12%</p>
                </div>
              </div>
            )}
          </div>

          <div className="w-80 border-l border-gray-100 dark:border-white/10 p-6 flex flex-col justify-between bg-gray-50/50 dark:bg-black/20">
             <div>
               <h4 className="font-bold text-gray-900 dark:text-white mb-4">Why this fund?</h4>
               <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                 <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> Rated 5-Star by Morningstar</li>
                 <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> Beat benchmark 8/10 years</li>
                 <li className="flex gap-2"><CheckCircle className="w-4 h-4 text-green-500 shrink-0"/> High liquidity</li>
               </ul>
             </div>
             <button 
               onClick={() => { onClose(); onInvest(fund); }}
               className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
             >
               <Zap className="w-5 h-5"/> Invest Now
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InvestModal = ({ fund, user, onClose, onKycRequest }) => {
  const [amount, setAmount] = useState(5000);
  const [bseProcessing, setBseProcessing] = useState(false);
  const handleBSEOrder = async () => { if (!user) { alert("Please login."); return; } setBseProcessing(true); const kycRef = doc(db, 'artifacts', appId, 'users', user.uid, 'kyc', 'status'); const kycSnap = await getDoc(kycRef); if (!kycSnap.exists()) { setBseProcessing(false); onKycRequest(); return; } const ucc = kycSnap.data().ucc; await new Promise(r => setTimeout(r, 2000)); await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), { fundName: fund.name, amount: Number(amount), type: 'BSE StarMF', status: 'Processing', orderId: `ORD-${Math.floor(Math.random()*100000)}`, timestamp: serverTimestamp() }); alert(`Order Placed! Order ID: BSE-${Math.floor(Math.random()*100000)}`); onClose(); setBseProcessing(false); };
  const handleWhatsApp = () => { const url = `https://wa.me/919810793780?text=${encodeURIComponent(`Hi, I want to invest ₹${amount} in ${fund.name} (Regular Plan) via IndiBucks.`)}`; window.open(url, '_blank'); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-slide-up">
      <div className="glass-panel p-6 rounded-3xl w-full max-w-md relative bg-white dark:bg-[#111]">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X/></button>
        <h2 className="text-xl font-bold mb-1 text-gray-900 dark:text-white">Invest in {fund.name}</h2>
        <p className="text-xs text-gray-500 mb-6">{fund.category} • {fund.risk} Risk</p>
        <div className="mb-6"><label className="text-xs font-bold text-gray-500 uppercase">Amount (₹)</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="w-full text-3xl font-bold bg-transparent border-b border-gray-200 dark:border-white/10 py-2 text-gray-900 dark:text-white outline-none focus:border-indigo-500"/></div>
        <div className="bg-yellow-50 dark:bg-yellow-900/10 p-3 rounded-xl mb-6 border border-yellow-200 dark:border-yellow-800 flex items-start gap-2">
          <FileWarning className="w-4 h-4 text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5"/>
          <p className="text-[10px] text-yellow-700 dark:text-yellow-400">Read Scheme Information Document (SID) & Key Information Memorandum (KIM) before investing. <a href="#" className="underline">View Documents</a></p>
        </div>
        <div className="grid grid-cols-2 gap-4"><button onClick={handleWhatsApp} className="p-4 rounded-2xl border border-green-200 bg-green-50 dark:bg-green-900/10 hover:bg-green-100 dark:hover:bg-green-900/20 transition text-left group"><MessageCircle className="w-6 h-6 text-green-600 mb-2"/><div className="font-bold text-green-700 dark:text-green-400">WhatsApp</div><div className="text-[10px] text-green-600/70">Human Assisted</div></button><button onClick={handleBSEOrder} className="p-4 rounded-2xl border border-indigo-200 bg-indigo-50 dark:bg-indigo-900/10 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 transition text-left group relative overflow-hidden">{bseProcessing ? <Loader className="w-6 h-6 text-indigo-600 animate-spin mb-2"/> : <Zap className="w-6 h-6 text-indigo-600 mb-2"/>}<div className="font-bold text-indigo-700 dark:text-indigo-400">BSE StarMF</div><div className="text-[10px] text-indigo-600/70">Direct Execution</div></button></div>
        <p className="text-center text-[10px] text-gray-400 mt-4">By proceeding, you agree to T&C.</p>
      </div>
    </div>
  );
};

const IndiCommand = ({ onExecute }) => {
  const [input, setInput] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleCommand = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      setProcessing(true);
      const prompt = `System: You are an intent parser for the 'IndiBucks' app. 
      User input: "${input}"
      Supported Actions:
      1. NAVIGATE: target (home, funds, social, dashboard, advisor)
      2. FILTER_FUNDS: category (Liquid, Small Cap, Mid Cap, Large Cap), risk (Low, Moderate, Very High)
      3. INVEST: fundName (extract likely name), amount (number)
      
      Return ONLY valid JSON (no markdown): { "type": "ACTION_TYPE", "payload": { ...params } }`;

      const res = await callGeminiJSON(prompt);
      if (res) {
        onExecute(res);
        setInput('');
        setIsOpen(false);
      }
      setProcessing(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
      >
        {isOpen ? <X className="w-6 h-6"/> : <Command className="w-6 h-6"/>}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 left-6 md:left-auto md:w-96 z-50 animate-slide-up">
          <div className="glass-panel p-4 rounded-2xl bg-white/90 dark:bg-black/90 border border-indigo-500/30 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-2">
              <Bot className="w-5 h-5 text-indigo-500" />
              <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest">IndiOS Command Line</span>
            </div>
            <div className="relative">
              <input 
                autoFocus
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleCommand}
                placeholder="Type 'Buy 5k of SBI Small Cap'..."
                className="w-full bg-gray-100 dark:bg-white/10 border-none rounded-xl p-3 pl-4 pr-10 text-sm font-medium text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              {processing && <Loader className="absolute right-3 top-3 w-4 h-4 text-indigo-500 animate-spin" />}
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide">
              {['Go to Dashboard', 'Show Risky Funds', 'Invest 2000 in HDFC'].map(cmd => (
                <button key={cmd} onClick={() => { setInput(cmd); }} className="whitespace-nowrap px-3 py-1 bg-gray-100 dark:bg-white/5 rounded-lg text-[10px] text-gray-500 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 hover:text-indigo-600 transition">
                  {cmd}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const PanicMode = ({ onClose }) => {
  const [stage, setStage] = useState(1);
  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-slide-up">
      <div className="max-w-xl w-full text-center relative">
        {stage === 1 && (
          <div className="space-y-8 animate-slide-up">
            <div className="w-24 h-24 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse-glow">
              <Anchor className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-4xl font-black text-white">Breathe.</h2>
            <p className="text-xl text-gray-300">Markets go down. They also go up. <br/>History favors the patient.</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <div className="text-sm text-gray-400">2008 Crash</div>
                <div className="text-xl font-bold text-red-400">-52%</div>
                <div className="text-xs text-green-400 mt-1">Recovered in 18mo</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <div className="text-sm text-gray-400">COVID 2020</div>
                <div className="text-xl font-bold text-red-400">-38%</div>
                <div className="text-xs text-green-400 mt-1">Recovered in 6mo</div>
              </div>
              <div className="p-4 rounded-2xl bg-white/10 border border-white/10">
                <div className="text-sm text-gray-400">Your Portfolio</div>
                <div className="text-xl font-bold text-white">Safe</div>
                <div className="text-xs text-blue-400 mt-1">Quality Assets</div>
              </div>
            </div>
            <div className="flex gap-4 justify-center pt-8">
              <button onClick={() => setStage(2)} className="px-8 py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition">I still want to sell</button>
              <button onClick={onClose} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 transition shadow-[0_0_20px_rgba(37,99,235,0.5)]">Stay Invested</button>
            </div>
          </div>
        )}
        {stage === 2 && (
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-3xl font-bold text-white">Before you sell...</h2>
            <div className="bg-white/5 p-6 rounded-2xl text-left border-l-4 border-yellow-500">
              <h4 className="font-bold text-white mb-2">The "10 Best Days" Rule</h4>
              <p className="text-gray-300 text-sm">Miss the 10 best days of the market, and your returns drop by 50%. Often, the best days happen right after the worst days.</p>
            </div>
            <p className="text-gray-400 text-sm">We recommend talking to IndiGenie before liquidating.</p>
            <button onClick={onClose} className="w-full py-4 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition">Okay, I'll Hold</button>
          </div>
        )}
      </div>
    </div>
  );
};

// 1. INVEST
const FundMarketplace = ({ user, setShowLogin, onFundClick, onInvestClick }) => {
  const [masterList, setMasterList] = useState([]);
  const [displayedFunds, setDisplayedFunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState('All');
  const [filterCat, setFilterCat] = useState('All');
  const [vibeMode, setVibeMode] = useState(false);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [compareList, setCompareList] = useState([]);
  const [showComparison, setShowComparison] = useState(false);

  useEffect(() => { const fetchMaster = async () => { try { const res = await fetch('https://api.mfapi.in/mf'); const all = await res.json(); const regularOnly = all.filter(f => !f.schemeName.includes("Direct") && !f.schemeName.includes("DIRECT")); setMasterList(regularOnly); await loadFundDetails(FEATURED_FUNDS); } catch(e) { console.error(e); setLoading(false); } }; fetchMaster(); }, []);

  const loadFundDetails = async (codes) => {
    setLoading(true);
    const promises = codes.map(async (code) => { try { const res = await fetch(`https://api.mfapi.in/mf/${code}`); const json = await res.json(); if(!json.meta) return null; const name = json.meta.scheme_name; if(name.includes("Direct")) return null; let category = name.includes('Liquid') ? "Liquid" : name.includes('Small') ? "Small Cap" : name.includes('Mid') ? "Mid Cap" : name.includes('Flexi') ? "Flexi Cap" : "Large Cap"; let risk = category === 'Small Cap' ? "Very High" : category === 'Liquid' ? "Low" : "Moderate"; return { code: json.meta.scheme_code, name: name.replace(" Fund", ""), house: json.meta.fund_house, nav: json.data[0].nav, category, risk, minInv: 500 }; } catch(e) { return null; } });
    const results = await Promise.all(promises);
    setDisplayedFunds(results.filter(f => f !== null));
    setLoading(false);
  };

  useEffect(() => { const delayDebounce = setTimeout(() => { if (searchTerm.length > 3) { const matches = masterList.filter(f => f.schemeName.toLowerCase().includes(searchTerm.toLowerCase())).slice(0, 10).map(f => f.schemeCode); if(matches.length > 0) loadFundDetails(matches); } }, 500); return () => clearTimeout(delayDebounce); }, [searchTerm, masterList]);

  // --- GEMINI POWERED SMART SEARCH ---
  const handleSmartSearch = async () => {
    if (!searchTerm.trim()) return;
    setIsAiSearching(true);
    const prompt = `User search query: "${searchTerm}". Based on this intent, suggest the best Mutual Fund Category and Risk level. Options for Category: "Liquid", "Small Cap", "Mid Cap", "Large Cap", "Flexi Cap". Options for Risk: "Low", "Moderate", "Very High". Return valid JSON: { "category": "string", "risk": "string" }`;
    const result = await callGeminiJSON(prompt);
    if (result) {
      if (result.category) setFilterCat(result.category);
      if (result.risk) setFilterRisk(result.risk);
    }
    setIsAiSearching(false);
  };

  const toggleCompare = (fund, e) => {
    e.stopPropagation();
    if (compareList.find(f => f.code === fund.code)) {
      setCompareList(compareList.filter(f => f.code !== fund.code));
    } else {
      if (compareList.length < 2) setCompareList([...compareList, fund]);
      else alert("You can only compare 2 funds at a time.");
    }
  };

  const handleCollectionSelect = (filter) => {
    setFilterCat(filter.category || 'All');
    setFilterRisk(filter.risk || 'All');
    const list = document.getElementById('fund-list');
    if(list) list.scrollIntoView({behavior: 'smooth'});
  }

  const filtered = displayedFunds.filter(f => (filterRisk === 'All' || f.risk === filterRisk) && (filterCat === 'All' || f.category === filterCat));

  return (
    <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen relative animate-slide-up">
      {showComparison && compareList.length === 2 && (
        <FundFaceOff fund1={compareList[0]} fund2={compareList[1]} onClose={() => setShowComparison(false)} />
      )}

      <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div><h1 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter text-gray-900 dark:text-white">Funds Exchange</h1><p className="text-gray-500 font-medium">Access 20,000+ Regular Plans.</p></div>
        <div className="glass-panel p-1 rounded-full flex items-center bg-white dark:bg-white/5"><button onClick={() => setVibeMode(false)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!vibeMode ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Classic View</button><button onClick={() => setVibeMode(true)} className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${vibeMode ? 'bg-pink-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Gen Z Mode</button></div>
      </div>
      
      <QuickCollections onSelect={handleCollectionSelect} />

      <MoneyReels />
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-500/30 p-4 rounded-2xl mb-8 flex items-start gap-3">
         <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5"/>
         <div><h4 className="font-bold text-blue-800 dark:text-blue-300 text-sm">Fair Disclosure</h4><p className="text-xs text-blue-600 dark:text-blue-400">We operate as a distributor offering Regular Plans. You get expert human advice & AI insights at no extra direct cost. We earn a small commission from AMCs.</p></div>
      </div>
      
      <div className="sticky top-24 z-30 glass-panel p-4 rounded-2xl mb-10 border-t border-gray-100 dark:border-white/10 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5"/>
              <input 
                value={searchTerm} 
                onChange={e=>setSearchTerm(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleSmartSearch()}
                placeholder="Type 'Safe funds for dad' or 'High growth'..." 
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition"
              />
            </div>
            <button 
              onClick={handleSmartSearch}
              disabled={isAiSearching}
              className="px-4 py-3 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-indigo-200 transition"
            >
              {isAiSearching ? <Loader className="w-4 h-4 animate-spin"/> : <Sparkles className="w-4 h-4"/>}
              Smart Filter
            </button>
          </div>
          <select value={filterCat} onChange={e=>setFilterCat(e.target.value)} className="px-4 py-3 bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl text-gray-700 dark:text-white outline-none cursor-pointer"><option value="All">All Assets</option><option value="Small Cap">Small Cap</option><option value="Mid Cap">Mid Cap</option><option value="Large Cap">Large Cap</option><option value="Liquid">Liquid</option></select>
        </div>
        
        {compareList.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/10 flex justify-between items-center animate-slide-up">
            <div className="flex gap-2">
              {compareList.map(f => (
                <div key={f.code} className="flex items-center gap-2 px-3 py-1 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-100 dark:border-indigo-500/30">
                  <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300">{f.name}</span>
                  <button onClick={(e) => toggleCompare(f, e)}><X className="w-3 h-3 text-indigo-500"/></button>
                </div>
              ))}
            </div>
            {compareList.length === 2 && (
              <button 
                onClick={() => setShowComparison(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 hover:bg-indigo-700 transition shadow-lg"
              >
                <Swords className="w-4 h-4"/> Fight!
              </button>
            )}
          </div>
        )}
      </div>

      <div id="fund-list">
        {loading ? <div className="py-20 flex justify-center"><Loader className="w-10 h-10 text-indigo-500 animate-spin"/></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(fund => {
          const isSelected = compareList.find(f => f.code === fund.code);
          return ( 
            <div 
              key={fund.code} 
              onClick={() => onFundClick(fund)}
              className={`glass-panel glass-panel-hover p-6 rounded-2xl transition-all group relative overflow-hidden bg-white dark:bg-white/5 cursor-pointer ${isSelected ? 'ring-2 ring-indigo-500' : ''}`}
            >
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div className="bg-indigo-50 dark:bg-white/5 border border-indigo-100 dark:border-white/10 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-300">{fund.category}</div>
                <div className={`text-xs font-bold px-2 py-1 rounded border ${fund.risk==='Very High'?'text-red-500 border-red-200 dark:border-red-500/30':'text-green-500 border-green-200 dark:border-green-500/30'}`}>{vibeMode ? (fund.risk==='Very High' ? '🌶️ Spicy' : '🧊 Chill') : fund.risk}</div>
              </div>
              <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2 leading-tight min-h-[3.5rem] group-hover:text-indigo-500 transition-colors">{fund.name}</h3>
              <p className="text-xs text-gray-500 mb-6 font-mono uppercase">{fund.house}</p>
              <div className="flex items-center gap-2 mb-4">
                <input 
                  type="checkbox" 
                  checked={!!isSelected}
                  onChange={(e) => toggleCompare(fund, e)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-500 cursor-pointer" onClick={(e) => toggleCompare(fund, e)}>Compare</span>
              </div>
              <div className="flex justify-between items-end border-t border-gray-100 dark:border-white/5 pt-4">
                <div><p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Current NAV</p><p className="font-mono text-xl font-bold text-gray-900 dark:text-white">₹{fund.nav}</p></div>
                <button 
                  onClick={(e)=>{ e.stopPropagation(); onInvestClick(fund); }} 
                  className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-black transition shadow-lg"
                >
                  Buy Now
                </button>
              </div>
            </div>
          )
        })}</div>}
      </div>
    </div>
  );
};

// 2. SOCIAL TRIBES
const SocialTribes = () => (
  <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen animate-slide-up">
    <div className="text-center mb-16">
      <h1 className="text-5xl font-black text-gray-900 dark:text-white mb-4">Investment Tribes</h1>
      <p className="text-gray-500 dark:text-gray-400 text-xl">Join elite investment communities.</p>
    </div>
    <div className="grid md:grid-cols-3 gap-8">
      {TRIBES.map((tribe, index) => (
        <div key={tribe.id} className="relative h-[400px] rounded-3xl overflow-hidden group cursor-pointer shadow-2xl transition-all duration-500 hover:-translate-y-2 animate-slide-up" style={{animationDelay: `${index * 0.1}s`}}>
           <img src={tribe.img} alt={tribe.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
           <div className={`absolute inset-0 bg-gradient-to-t ${tribe.color} opacity-80 mix-blend-multiply`}></div>
           <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
           
           <div className="absolute top-6 right-6">
             <span className="bg-white/20 backdrop-blur-md text-white border border-white/20 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
               <TrendingUp className="w-3 h-3"/> ROI: {tribe.roi}
             </span>
           </div>

           <div className="absolute bottom-0 left-0 w-full p-8">
             <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-xl border border-white/20 flex items-center justify-center mb-6 shadow-lg">
               {tribe.icon}
             </div>
             <h3 className="text-3xl font-black text-white mb-2">{tribe.name}</h3>
             <p className="text-gray-300 text-sm mb-6 leading-relaxed border-l-2 border-white/30 pl-3">{tribe.desc}</p>
             <div className="flex items-center justify-between">
               <div className="flex -space-x-2">
                  {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-black bg-gray-800"></div>)}
                  <div className="w-8 h-8 rounded-full border-2 border-black bg-indigo-600 flex items-center justify-center text-[10px] font-bold text-white">+{tribe.members}</div>
               </div>
               <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-sm hover:bg-gray-200 transition">Join Tribe</button>
             </div>
           </div>
        </div>
      ))}
    </div>
  </div>
);

// 3. AI PORTFOLIO DOCTOR
const PortfolioDoctor = ({ orders }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const runCheckup = async () => {
    if (orders.length === 0) { alert("Add some investments first!"); return; } setLoading(true);
    const holdings = orders.map(o => `${o.fundName} (₹${o.amount})`).join(", ");
    const prompt = `I have these mutual fund investments: ${holdings}. Act as a 'Portfolio Doctor'. 1. Give me a 'Health Score' out of 10. 2. List 2 risks. 3. Suggest 1 improvement. Keep it short.`;
    const res = await callGeminiFlash(prompt, "You are a financial expert."); setAnalysis(res); setLoading(false);
  };
  return (
    <div className="glass-panel p-6 rounded-3xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20">
      <div className="flex justify-between items-center mb-4"><h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><BrainCircuit className="w-5 h-5 text-indigo-500"/> Portfolio Doctor</h3><button onClick={runCheckup} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 disabled:opacity-50">{loading ? 'Scanning...' : 'Run Checkup'}</button></div>
      {analysis && <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white/50 dark:bg-black/20 p-4 rounded-xl animate-slide-up">{analysis}</div>}
    </div>
  );
};

// 4. FUTURE YOU SIMULATOR
const FutureYouSimulator = () => {
  const [age, setAge] = useState(25); const [sip, setSip] = useState(5000); const [story, setStory] = useState(""); const [loading, setLoading] = useState(false);
  const simulate = async () => { setLoading(true); const prompt = `I am ${age} years old and investing ₹${sip}/month. Describe my life at age 50 based on compounding. Make it inspiring and visual. Use 2 sentences.`; const res = await callGeminiFlash(prompt, "Creative writer."); setStory(res); setLoading(false); };
  return (
    <div className="glass-panel p-6 rounded-3xl mt-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border border-purple-100 dark:border-purple-500/20">
      <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><Telescope className="w-5 h-5 text-purple-500"/> Future You Simulator</h3>
      <div className="flex gap-4 mb-4"><input type="number" value={age} onChange={e=>setAge(e.target.value)} placeholder="Age" className="w-20 p-2 rounded-lg bg-white dark:bg-black/20 text-gray-900 dark:text-white outline-none text-sm"/><input type="number" value={sip} onChange={e=>setSip(e.target.value)} placeholder="SIP" className="flex-1 p-2 rounded-lg bg-white dark:bg-black/20 text-gray-900 dark:text-white outline-none text-sm"/><button onClick={simulate} className="bg-purple-600 text-white px-4 rounded-lg text-xs font-bold">{loading ? '...' : 'Visualize'}</button></div>
      {story && <p className="text-sm text-purple-900 dark:text-purple-200 italic animate-slide-up">"{story}"</p>}
    </div>
  );
};

// 5. COMBINED ANALYZER
const CombinedAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('statement');
  const [analysis, setAnalysis] = useState('');
  const handleFile = async (e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = async () => { const res = await callGeminiVision("Analyze.", r.result.split(',')[1]); setAnalysis(res); }; r.readAsDataURL(f); } };
  return (
    <div className="pt-28 pb-24 px-4 max-w-4xl mx-auto min-h-screen animate-slide-up">
      <div className="flex justify-center mb-12"><div className="glass-panel p-1.5 rounded-full inline-flex bg-white dark:bg-white/5"><button onClick={() => setActiveTab('statement')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'statement' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>X-Ray Scanner</button><button onClick={() => setActiveTab('overlap')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'overlap' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Overlap Tool</button></div></div>
      {activeTab === 'statement' ? <div className="glass-panel p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-white/10 relative group bg-white dark:bg-white/5"><Camera className="w-20 h-20 mx-auto text-indigo-500 mb-6"/><h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Scan Portfolio</h2><p className="text-gray-500 mb-8 max-w-md mx-auto">Upload your CAS statement. AI will find hidden fees and suggest better Regular funds.</p><label className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition inline-block"><input type="file" onChange={handleFile} className="hidden"/> Upload File</label>{analysis && <div className="mt-8 text-left bg-gray-50 dark:bg-black/40 p-6 rounded-xl border border-white/10 text-gray-300 whitespace-pre-wrap font-mono text-sm">{analysis}</div>}</div> : <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-white/5"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-500"/> Fund Intersection</h3><div className="grid md:grid-cols-2 gap-6 mb-8"><div><label className="text-xs font-bold text-gray-500 mb-2 block">FUND A</label><select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white outline-none">{TRACKED_FUNDS_MOCK.map(f=><option key={f.code}>{f.name}</option>)}</select></div><div><label className="text-xs font-bold text-gray-500 mb-2 block">FUND B</label><select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white outline-none">{TRACKED_FUNDS_MOCK.map(f=><option key={f.code}>{f.name}</option>)}</select></div></div><button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg">RUN ANALYSIS</button></div>}
    </div>
  );
};

// 6. DASHBOARD (Enhanced)
const Dashboard = ({ user, onKycRequest, onLogout, zenMode }) => {
  const [orders, setOrders] = useState([]);
  const [docs, setDocs] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [panic, setPanic] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);

  useEffect(() => { 
    if (!user) return; 
    const q1 = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('timestamp', 'desc')); 
    const u1 = onSnapshot(q1, (s) => setOrders(s.docs.map(doc => ({ id: doc.id, ...doc.data() })))); 
    const q2 = query(collection(db, 'artifacts', appId, 'users', user.uid, 'vault'), orderBy('date', 'desc')); 
    const u2 = onSnapshot(q2, (s) => setDocs(s.docs.map(doc => ({ id: doc.id, ...doc.data() })))); 
    
    const kycRef = doc(db, 'artifacts', appId, 'users', user.uid, 'kyc', 'status');
    getDoc(kycRef).then(snap => setKycStatus(snap.exists() ? snap.data() : null));

    return () => { u1(); u2(); }; 
  }, [user]);

  const handleUpload = async () => { const name = prompt("Doc Name:"); if(name) { setUploading(true); await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'vault'), { name, type: "PDF", date: serverTimestamp() }); setUploading(false); } };

  return (
    <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen relative animate-slide-up">
      {panic && <PanicMode onClose={()=>setPanic(false)} />}
      
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">Command Center</h1>
          <p className="text-gray-500">Welcome, {user.displayName?.split(' ')[0] || "Investor"}.</p>
        </div>
        <div className="flex gap-2">
          {!zenMode && <button onClick={()=>setPanic(true)} className="bg-red-500/10 border border-red-500/50 text-red-500 px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition flex items-center gap-2 animate-pulse"><AlertTriangle className="w-4 h-4"/> PANIC BUTTON</button>}
          <button onClick={onLogout} className="bg-gray-200 dark:bg-white/10 px-6 py-3 rounded-xl text-sm font-bold hover:bg-red-500 hover:text-white transition flex items-center gap-2"><LogOut className="w-4 h-4"/> Sign Out</button>
        </div>
      </div>

      {!kycStatus?.verified && (
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-500/30 p-4 rounded-2xl mb-8 flex justify-between items-center animate-pulse-glow">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400"/>
            <div>
              <h4 className="font-bold text-gray-900 dark:text-white">Account Setup Pending</h4>
              <p className="text-xs text-gray-600 dark:text-gray-400">Complete your BSE StarMF KYC to start investing.</p>
            </div>
          </div>
          <button onClick={onKycRequest} className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-orange-700">Complete KYC</button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           <div className={`relative rounded-3xl p-8 overflow-hidden group shadow-2xl transition-all duration-700 transform hover:scale-[1.01] ${zenMode ? 'bg-gradient-to-r from-teal-800 to-emerald-800' : 'bg-gradient-to-r from-indigo-900 to-purple-900'}`}>
             <div className="absolute inset-0 border border-white/20 rounded-3xl"></div>
             <div className="relative z-10">
               <p className="text-indigo-200 text-xs font-bold uppercase mb-2 tracking-widest">{zenMode ? 'Zen Portfolio' : 'Net Liquidity'}</p>
               <h2 className={`text-6xl font-mono font-bold text-white mb-8 text-shadow transition-all duration-700 ${zenMode ? 'zen-mode-blur select-none' : ''}`}>₹{orders.reduce((acc,o)=>acc+(o.amount*1.12),0).toLocaleString()}</h2>
               <div className="flex gap-8 text-white">
                 <div><span className="text-[10px] uppercase opacity-70 block mb-1">Invested</span><div className="font-bold text-xl">₹{orders.reduce((acc,o)=>acc+o.amount,0).toLocaleString()}</div></div>
                 <div><span className="text-[10px] uppercase opacity-70 block mb-1">XIRR</span><div className={`font-bold text-xl ${zenMode ? 'text-white' : 'text-emerald-400'}`}>+14.2%</div></div>
               </div>
               {zenMode && <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white/80 font-bold text-xl pointer-events-none text-center animate-slide-up"><Leaf className="w-12 h-12 mx-auto mb-2 text-white"/>LONG TERM FOCUS</div>}
             </div>
           </div>
           
           {/* USP Feature: Risk Radar & SIP Turbo & Market Sentiment */}
           <div className="grid md:grid-cols-2 gap-8">
             <RiskRadar />
             <MarketSentiment />
           </div>
           
           <GoalDNA />
           <SIPTurbocharger />

           <PortfolioDoctor orders={orders} />
           
           <div className="glass-panel rounded-3xl overflow-hidden bg-white dark:bg-white/5">
             <div className="p-6 border-b border-gray-100 dark:border-white/5 flex justify-between items-center"><h3 className="font-bold text-gray-900 dark:text-white">Active Positions</h3><div className="text-xs text-gray-500">{orders.length} ASSETS</div></div>
             {orders.length > 0 ? <div className="divide-y divide-gray-100 dark:divide-white/5">{orders.map(o => <div key={o.id} className="p-5 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-white/5 transition"><div className="flex gap-4 items-center"><div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">{o.fundName?.[0]}</div><div><div className="font-bold text-gray-900 dark:text-white">{o.fundName}</div><div className="text-xs text-gray-500 mt-1">SIP • MONTHLY</div></div></div><div className={`font-mono font-bold text-gray-900 dark:text-white ${zenMode ? 'zen-mode-blur' : ''}`}>₹{o.amount.toLocaleString()}</div></div>)}</div> : <div className="p-16 text-center text-gray-500 text-sm">No active signals found.</div>}
           </div>
        </div>
        <div className="space-y-8">
          <FutureYouSimulator />
          <div className="glass-panel rounded-3xl p-6 border-l-4 border-l-cyan-500 flex flex-col bg-white dark:bg-white/5"><div className="flex justify-between items-center mb-6"><h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Lock className="w-5 h-5 text-cyan-500"/> The Vault</h3><button onClick={handleUpload} disabled={uploading} className="text-cyan-500 hover:text-cyan-700"><Upload className="w-4 h-4"/></button></div><div className="flex-1 space-y-2 overflow-y-auto">{docs.length===0?<div className="flex-1 flex items-center justify-center text-gray-400 text-xs">VAULT EMPTY</div>:docs.map(d=><div key={d.id} className="p-3 border border-gray-200 dark:border-white/10 rounded-xl flex justify-between hover:bg-gray-50 dark:hover:bg-white/5"><span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">{d.name}</span><button onClick={()=>deleteDoc(doc(db,'artifacts',appId,'users',user.uid,'vault',d.id))} className="text-red-500"><XCircle className="w-4 h-4"/></button></div>)}</div></div>
        </div>
      </div>
    </div>
  );
};

// 7. INDIGENIE (AI Advisor)
const AIAdvisor = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);
  
  // Initialize auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
  }, []);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'welcome', text: "Namaste! I'm IndiGenie. Let's plan your financial freedom. Ask me anything about funds, SIPs, or taxes!", sender: 'ai' }]);
    }
    if (user) { 
      const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), orderBy('timestamp', 'asc')); 
      const unsub = onSnapshot(q, s => { 
        const msgs = s.docs.map(d => d.data());
        if (msgs.length > 0) setMessages(msgs);
      }); 
      return unsub; 
    } 
  }, [user]);

  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  
  const handleSend = async () => { 
    if(!input.trim()) return; const t = input; setInput(''); setIsTyping(true);
    const newMsgs = [...messages, { text: t, sender: 'user' }];
    setMessages(newMsgs);
    if(user) addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), { text: t, sender: 'user', timestamp: serverTimestamp() });
    const prompt = `You are IndiGenie, a smart financial advisor. Rules: 1. Suggest 'Regular Plans' available on BSE Star MF. 2. Use plain text and emojis only (NO markdown). 3. Keep it punchy.`;
    const res = await callGeminiFlash(t, prompt); 
    if(user) addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'chats'), { text: res, sender: 'ai', timestamp: serverTimestamp() });
    else setMessages([...newMsgs, { text: res, sender: 'ai' }]);
    setIsTyping(false); 
  };
  
  return (
    <div className="pt-28 pb-12 px-4 max-w-4xl mx-auto h-[90vh] flex flex-col animate-slide-up">
      <div className="glass-panel p-6 rounded-t-3xl border-b border-gray-200 dark:border-white/10 flex justify-between items-center bg-white dark:bg-white/5"><div className="flex items-center gap-4"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><h2 className="font-heading font-bold text-gray-900 dark:text-white text-lg">INDIGENIE CHAT</h2></div></div>
      <div className="flex-1 p-6 overflow-y-auto glass-panel border-t-0 border-b-0 backdrop-blur-md bg-white/50 dark:bg-black/20">{messages.map((m, i) => <div key={i} className={`flex mb-6 ${m.sender==='user'?'justify-end':'justify-start'}`}><div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${m.sender==='user' ? 'bg-indigo-600 text-white rounded-br-none shadow-lg' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none border border-gray-100 dark:border-white/10 shadow-sm'}`}>{typeof m.text === 'string' ? m.text : '...'}</div></div>)}{isTyping && <div className="text-xs font-mono text-indigo-500 animate-pulse">PROCESSING...</div>}<div ref={scrollRef}/></div>
      <div className="p-4 glass-panel rounded-b-3xl border-t border-gray-200 dark:border-white/10 relative bg-white dark:bg-white/5"><input value={input} onChange={e=>setInput(e.target.value)} className="w-full bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-white/20 p-4 pr-16 rounded-xl text-gray-900 dark:text-white outline-none focus:border-indigo-500 transition" placeholder="Ask IndiGenie..." onKeyPress={e=>e.key==='Enter'&&handleSend()}/><button onClick={handleSend} className="absolute right-6 top-6 text-indigo-500 hover:text-indigo-700 transition"><Send className="w-6 h-6"/></button></div>
    </div>
  );
};

// --- HOME ---
const LandingPage = ({ setView }) => (
  <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center relative overflow-hidden">
    <div className="relative z-10 max-w-5xl mx-auto">
      <div className="inline-flex items-center px-4 py-2 rounded-full bg-white border border-gray-200 dark:border-white/10 dark:bg-white/5 backdrop-blur-md mb-8 animate-float shadow-sm"><span className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></span><span className="text-xs font-bold font-mono tracking-widest text-gray-500 dark:text-gray-300">SYSTEM ONLINE</span></div>
      <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gray-900 dark:text-white leading-[0.95] animate-slide-up stagger-1">WEALTH <br/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-white dark:via-gray-200 dark:to-gray-500">EVOLVED.</span></h1>
      <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium animate-slide-up stagger-2">The definitive platform for the next generation of investors. <span className="text-indigo-600 dark:text-indigo-400">AI-Driven. Zero Friction.</span></p>
      <div className="flex flex-col sm:flex-row justify-center gap-6 mb-24 animate-slide-up stagger-3"><button onClick={() => setView('funds')} className="px-10 py-5 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full font-bold text-lg hover:scale-105 transition shadow-xl">Enter Exchange</button><button onClick={() => setView('advisor')} className="px-10 py-5 glass-panel rounded-full font-bold text-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center justify-center gap-3"><Sparkles className="w-5 h-5 text-indigo-500"/> IndiGenie</button></div>
      <div className="animate-slide-up stagger-4"><InflationCalculator /></div>
      <div className="py-6 border-y border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-black/20 mb-24 animate-slide-up stagger-4"><div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-8 md:gap-16 text-center"><div className="flex items-center gap-2 opacity-70 grayscale hover:grayscale-0 transition"><ShieldCheck className="w-5 h-5 text-green-600"/><span className="text-xs font-bold text-gray-600 dark:text-gray-300">AES-256 Encryption</span></div><div className="flex items-center gap-2 opacity-70 grayscale hover:grayscale-0 transition"><Landmark className="w-5 h-5 text-blue-600"/><span className="text-xs font-bold text-gray-600 dark:text-gray-300">BSE StarMF Partner</span></div><div className="flex items-center gap-2 opacity-70 grayscale hover:grayscale-0 transition"><FileCheck className="w-5 h-5 text-orange-600"/><span className="text-xs font-bold text-gray-600 dark:text-gray-300">SEBI Compliant</span></div></div></div>
      <div className="mb-24 animate-slide-up stagger-4"><h2 className="text-3xl font-black text-gray-900 dark:text-white mb-12">TRUSTED BY 1500+ FAMILIES</h2><div className="grid md:grid-cols-3 gap-6">{TESTIMONIALS.map((t,i)=><div key={i} className="glass-panel p-8 rounded-3xl text-left bg-white dark:bg-white/5"><p className="text-gray-600 dark:text-gray-300 italic mb-4">"{t.t}"</p><p className="font-bold text-gray-900 dark:text-white">{t.n}</p><p className="text-xs text-indigo-500 uppercase">{t.r}</p></div>)}</div></div>
      <footer className="glass-panel p-12 rounded-3xl text-left grid md:grid-cols-4 gap-8 bg-white dark:bg-white/5 border-t border-gray-200 dark:border-white/10 animate-slide-up stagger-4">
        <div className="col-span-2">
           <h4 className="text-2xl font-black text-gray-900 dark:text-white mb-4">IndiBucks</h4>
           <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Empowering India since 2005. AMFI Registered Mutual Fund Distributor.</p>
           <p className="text-gray-400 text-xs mb-1"><strong>ARN:</strong> ARN-183942</p>
           <p className="text-gray-400 text-xs"><strong>Validity:</strong> Perpetual</p>
        </div>
        <div>
           <h5 className="font-bold text-gray-900 dark:text-white mb-4">Contact & Support</h5>
           <ul className="space-y-2 text-gray-500 dark:text-gray-400 text-sm">
              <li>+91 98107 93780</li>
              <li>support@indibucks.in</li>
              <li>123, Fintech Tower, Delhi</li>
           </ul>
        </div>
        <div>
           <h5 className="font-bold text-gray-900 dark:text-white mb-4">Grievance</h5>
           <p className="text-xs text-gray-500">
             <strong>Officer:</strong> Mr. Rahul Kumar<br/>
             grievance@indibucks.in<br/>
             <span className="opacity-70">If unresolved, approach SEBI SCORES.</span>
           </p>
        </div>
        <div className="col-span-full border-t border-gray-200 dark:border-white/10 pt-6 text-center text-xs text-gray-400">
          <p>Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past performance is not indicative of future returns.</p>
        </div>
      </footer>
    </div>
  </div>
);

// --- NAVIGATION ---
const Navbar = ({ user, setView, isMenuOpen, setIsMenuOpen, onLoginClick, isAdminMode, isDark, toggleTheme, onLogout, onOpenAbout, onOpenFAQ, onOpenCompliance, zenMode, setZenMode }) => {
  if (isAdminMode) return null;
  return (
    <nav className="fixed w-full z-50 top-4 px-4 animate-slide-up">
      <div className="max-w-5xl mx-auto glass-panel rounded-full px-6 h-16 flex items-center justify-between shadow-xl backdrop-blur-xl bg-white/90 dark:bg-black/80">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg"><TrendingUp className="w-5 h-5"/></div><span className="text-xl font-bold tracking-tighter text-gray-900 dark:text-white">IndiBucks</span></div>
        <div className="hidden md:flex items-center gap-1">{['funds', 'social', 'analyzer'].map(item => <button key={item} onClick={() => setView(item)} className="px-4 py-2 text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition capitalize">{item}</button>)}</div>
        <div className="flex items-center gap-3">
          {/* Zen Mode Toggle - USP Feature */}
          <button 
            onClick={() => setZenMode(!zenMode)} 
            className={`p-2 rounded-full transition-all duration-300 ${zenMode ? 'bg-teal-500 text-white' : 'text-gray-500 hover:text-teal-600'}`} 
            title={zenMode ? "Disable Zen Mode" : "Enable Zen Mode"}
          >
            {zenMode ? <Leaf className="w-5 h-5"/> : <EyeOff className="w-5 h-5"/>}
          </button>

          <button onClick={onOpenCompliance} className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hidden sm:block" title="Compliance"><Scale className="w-5 h-5"/></button>
          <button onClick={onOpenFAQ} className="p-2 rounded-full text-gray-500 hover:text-indigo-600 hidden sm:block"><HelpCircle className="w-5 h-5"/></button>
          <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10 transition">{isDark ? <Sun className="w-5 h-5"/> : <Moon className="w-5 h-5"/>}</button>
          <button onClick={() => setView('advisor')} className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center text-white hover:scale-110 transition shadow-lg"><Sparkles className="w-5 h-5"/></button>
          {user ? 
            <div className="flex items-center gap-2">
              <button onClick={() => setView('dashboard')} className="px-5 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold hover:opacity-90 transition">DASHBOARD</button>
              <button onClick={onLogout} className="p-2 text-gray-500 hover:text-red-500"><LogOut className="w-5 h-5"/></button>
            </div> : 
            <button onClick={onLoginClick} className="px-5 py-2 border border-gray-200 dark:border-white/20 text-gray-900 dark:text-white rounded-full text-xs font-bold hover:bg-gray-100 dark:hover:bg-white/10 transition">LOGIN</button>
          }
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-900 dark:text-white p-2"><Menu className="w-6 h-6"/></button>
        </div>
      </div>
      {isMenuOpen && <div className="absolute top-24 left-4 right-4 glass-panel rounded-3xl p-4 flex flex-col gap-2 animate-in slide-in-from-top-5 bg-white dark:bg-black/90 shadow-2xl">{['home', 'funds', 'social', 'analyzer', 'advisor'].map(item => <button key={item} onClick={() => { setView(item); setIsMenuOpen(false); }} className="p-4 text-left font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl capitalize">{item}</button>)}<button onClick={onOpenAbout} className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">About Us</button><button onClick={onOpenFAQ} className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">FAQs</button><button onClick={onOpenCompliance} className="p-4 text-left font-bold text-gray-700 dark:text-gray-300">Legal</button></div>}
    </nav>
  );
};

// --- APP ROOT ---
const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [kycNeeded, setKycNeeded] = useState(false); 
  const [selectedFund, setSelectedFund] = useState(null); // Used for invest modal
  const [showAbout, setShowAbout] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);
  const [showCompliance, setShowCompliance] = useState(false);
  const [zenMode, setZenMode] = useState(false); 
  const [selectedFundDetails, setSelectedFundDetails] = useState(null); // For Deep Dive Modal

  useEffect(() => { const handleHashChange = () => { if (window.location.hash === '#admin') setView('admin'); }; handleHashChange(); window.addEventListener('hashchange', handleHashChange); const unsubscribe = onAuthStateChanged(auth, setUser); return () => { window.removeEventListener('hashchange', handleHashChange); unsubscribe(); }; }, []);
  
  const handleLogout = async () => {
    await signOut(auth);
    setView('home');
  };

  // --- INDI-COMMAND EXECUTOR ---
  const handleIndiCommand = (action) => {
    if (action.type === 'NAVIGATE') {
      if (action.payload?.target) setView(action.payload.target);
    } else if (action.type === 'INVEST') {
      if (!user) setShowLogin(true);
      else {
        // Mock finding fund
        const fund = { name: action.payload?.fundName || "Bluechip Fund", category: "Equity", risk: "High", nav: 124.5 };
        // Open Details Modal instead of direct buy
        setSelectedFundDetails(fund);
      }
    } else if (action.type === 'FILTER_FUNDS') {
      setView('funds');
      // Ideally pass filters, simplified for now
    }
  };

  // Function to handle opening the invest modal directly
  const handleInvestClick = (fund) => {
    if (!user) {
      setShowLogin(true);
    } else {
      setSelectedFund(fund); // Opens InvestModal
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#050505] text-white' : 'bg-[#f8fafc] text-gray-900'} transition-colors duration-300`}>
      <GlobalStyles />
      <AnimatedBackground />
      <Navbar 
        user={user} setView={setView} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} 
        onLoginClick={() => setShowLogin(true)} isAdminMode={view === 'admin'} 
        isDark={isDark} toggleTheme={() => setIsDark(!isDark)} 
        onLogout={handleLogout}
        onOpenAbout={() => setShowAbout(true)}
        onOpenFAQ={() => setShowFAQ(true)}
        onOpenCompliance={() => setShowCompliance(true)}
        zenMode={zenMode} setZenMode={setZenMode}
      />
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {kycNeeded && <KYCFlow user={user} onComplete={() => setKycNeeded(false)} />}
      
      {/* Deep Dive Modal */}
      {selectedFundDetails && (
        <FundDetailsModal 
          fund={selectedFundDetails} 
          onClose={() => setSelectedFundDetails(null)} 
          onInvest={handleInvestClick}
          user={user}
        />
      )}

      {/* Direct Invest Modal */}
      {selectedFund && <InvestModal fund={selectedFund} user={user} onClose={() => setSelectedFund(null)} onKycRequest={() => { setSelectedFund(null); setKycNeeded(true); }} />}
      
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showFAQ && <FAQModal onClose={() => setShowFAQ(false)} />}
      {showCompliance && <ComplianceModal onClose={() => setShowCompliance(false)} />}

      <IndiCommand onExecute={handleIndiCommand} />

      <main>
        {view === 'home' && <PageTransition><LandingPage setView={setView} /></PageTransition>}
        {view === 'funds' && (
          <PageTransition>
            <FundMarketplace 
              user={user} 
              setShowLogin={setShowLogin} 
              onFundClick={(fund) => setSelectedFundDetails(fund)} // Only set details
              onInvestClick={handleInvestClick} // Pass down invest handler
            />
          </PageTransition>
        )}
        {view === 'social' && <PageTransition><SocialTribes /></PageTransition>}
        {view === 'analyzer' && <PageTransition><CombinedAnalyzer /></PageTransition>}
        {view === 'advisor' && <PageTransition><AIAdvisor user={user} /></PageTransition>}
        {view === 'dashboard' && <PageTransition><Dashboard user={user} onKycRequest={() => setKycNeeded(true)} onLogout={handleLogout} zenMode={zenMode} /></PageTransition>}
        {view === 'admin' && <div className="pt-32 text-center">Admin Panel Hidden</div>}
      </main>
    </div>
  );
};

export default App;
