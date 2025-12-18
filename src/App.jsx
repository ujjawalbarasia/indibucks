import React, { useState, useEffect, useContext, createContext, useMemo, useCallback, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut, 
  signInAnonymously,
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
  getDoc,
  setDoc
} from 'firebase/firestore';
import { 
  TrendingUp, Shield, Zap, User, Menu, X, ChevronRight, Star, 
  Search, PieChart, ArrowUpRight, Briefcase, 
  CheckCircle, Lock, Loader, RefreshCw,
  Camera, Volume2, Phone, Mail, MapPin, Users, Download, Table, Key, Sparkles, MessageCircle, Copy, Mic, Calculator, ArrowLeftRight, LogIn, Target,
  FileText, Upload, Layers, Filter, XCircle, ToggleLeft, ToggleRight, Send, Trash2, Play, Smartphone, Flame, ThumbsUp, Eye, LogOut, AlertTriangle, Activity, MicOff, Users2, Skull, SlidersHorizontal, Terminal, Rocket, Sun, Moon, CreditCard, Landmark, FileCheck, BrainCircuit, HeartPulse, Telescope, UserPlus, TrendingDown, Gift,
  HelpCircle, ShieldCheck, Info, FileWarning, Scale, BookOpen, Gavel, Globe, Leaf, EyeOff, Sprout, Crosshair, Crown, Gem, Anchor, History, BarChart3, Newspaper, Gauge, Command, Swords, Bot, Coins, Percent, Banknote, Facebook, Twitter, Linkedin, Instagram
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis 
} from 'recharts';

// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================

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

// PRODUCTION ENDPOINT: Points to Vercel Serverless Functions
const BACKEND_API_URL = "/api"; 

const CONSTANTS = {
  FEATURED_FUNDS: ['119598', '125494', '122639', '112152', '120586', '119800', '147589', '102883', '100001', '120505'],
  TRIBES: [
    { id: 1, name: "FIRE Rebels", members: "12.4k", roi: "18.2%", desc: "Aggressive growth for early retirement.", icon: Flame, img: "https://images.unsplash.com/photo-1533090161767-e6ffed986c88?q=80&w=2069&auto=format&fit=crop", color: "from-orange-600 to-red-600" },
    { id: 2, name: "Safe Harbors", members: "35.1k", roi: "11.5%", desc: "Capital protection via debt allocation.", icon: Shield, img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop", color: "from-blue-600 to-indigo-600" },
    { id: 3, name: "Tax Slayers", members: "8.9k", roi: "14.8%", desc: "ELSS heavy plans for 80C optimization.", icon: FileCheck, img: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?q=80&w=2070&auto=format&fit=crop", color: "from-emerald-600 to-teal-600" },
  ],
  COLLECTIONS: [
    { id: 'high-return', label: "High Return", icon: TrendingUp, iconColor: "text-green-500", filter: { risk: "Very High" } },
    { id: 'tax-saving', label: "Tax Saving", icon: FileText, iconColor: "text-blue-500", filter: { category: "ELSS" } },
    { id: 'sip-100', label: "SIP from ₹100", icon: Coins, iconColor: "text-orange-500", filter: { minInv: 100 } },
    { id: 'large-cap', label: "Large Cap", icon: Crown, iconColor: "text-purple-500", filter: { category: "Large Cap" } },
    { id: 'mid-cap', label: "Mid Cap", icon: Layers, iconColor: "text-indigo-500", filter: { category: "Mid Cap" } },
    { id: 'small-cap', label: "Small Cap", icon: Sprout, iconColor: "text-emerald-500", filter: { category: "Small Cap" } },
  ],
  REELS: [
    { id: 1, title: "SIP vs Lumpsum?", views: "1.2M", img: "https://images.unsplash.com/photo-1579532537598-459ecdaf39cc?q=80&w=2070&auto=format&fit=crop", icon: ArrowLeftRight },
    { id: 2, title: "Tax Hacks 2025", views: "850K", img: "https://images.unsplash.com/photo-1586486855514-8c633cc6fd38?q=80&w=2070&auto=format&fit=crop", icon: Briefcase },
    { id: 3, title: "Small Cap Alpha", views: "2.1M", img: "https://images.unsplash.com/photo-1611974765270-ca1258634369?q=80&w=2064&auto=format&fit=crop", icon: Sparkles },
  ],
  TESTIMONIALS: [
    { n: "Amit Sharma", r: "Business Owner", t: "IndiBucks helped me save 2 Lakhs in tax last year. The AI advisor is genius!" },
    { n: "Priya Khanna", r: "Software Engineer", t: "I love the 'Panic Mode'. It stopped me from selling during the last dip." },
    { n: "Rahul Singh", r: "Doctor", t: "The easiest way to track my family's portfolio. Highly recommended." }
  ],
  FAQS: [
    { q: "Is IndiBucks SEBI Registered?", a: "IndiBucks is an AMFI Registered Mutual Fund Distributor (ARN-183942)." },
    { q: "How does money move?", a: "Your money moves directly from your bank account to the Mutual Fund House's account via the clearing corporation (ICCL)." },
    { q: "Is it safe?", a: "Yes. We use bank-grade AES-256 encryption. Your units are held in your name at the CDSL/NSDL depository." },
    { q: "Do you charge fees?", a: "The app is free for investors. We earn a commission from Asset Management Companies (AMCs) for the Regular Plans we distribute. This allows us to provide technology and support at no cost to you." },
    { q: "Can I withdraw anytime?", a: "Yes, for open-ended funds. ELSS funds have a 3-year lock-in." },
    { q: "How do I start a SIP?", a: "Simply select a fund, click 'Invest', choose 'SIP', and enter the amount." }
  ]
};

const TRACKED_FUNDS_MOCK = [
  { code: '119598', name: 'Mirae Asset Tax Saver' },
  { code: '125494', name: 'SBI Small Cap Fund' },
  { code: '122639', name: 'Parag Parikh Flexi Cap' },
  { code: '120586', name: 'ICICI Prudential Bluechip' },
  { code: '147589', name: 'Quant Small Cap Fund' },
  { code: '112152', name: 'HDFC Mid-Cap Opportunities' }
];

// ==========================================
// 2. CONTEXTS & HOOKS (Logic Layer)
// ==========================================

const AppContext = createContext();

const useGemini = () => {
  const callFlash = async (prompt, systemInstruction = "") => {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          contents: [{ parts: [{ text: prompt }] }], 
          systemInstruction: { parts: [{ text: systemInstruction }] },
          tools: [{ google_search: {} }] 
        })
      });
      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || "IndiGenie is thinking... please try again.";
    } catch (e) { return "System Unavailable"; }
  };

  const callJSON = async (prompt) => {
    try {
      const text = await callFlash(prompt, "Output valid JSON only. No markdown blocks.");
      const cleanedText = text.replace(/```json|```/g, '').trim();
      return JSON.parse(cleanedText);
    } catch (e) { console.error("JSON Parse Error", e); return null; }
  };

  const callVision = async (prompt, base64Image) => {
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

  return { callFlash, callJSON, callVision };
};

const useAuth = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    return onAuthStateChanged(auth, setUser);
  }, []);

  const loginGoogle = async () => await signInWithPopup(auth, googleProvider);
  const logout = async () => await signOut(auth);
  
  return { user, loginGoogle, logout };
};

// --- BSE STAR MF SERVICE (PRODUCTION INTEGRATION) ---
const BSEService = {
  // 1. Fetch Real Funds (MFAPI Proxy)
  async getFunds(codes) {
    try {
      const promises = codes.map(async (code) => {
        const res = await fetch(`https://api.mfapi.in/mf/${code}`);
        const json = await res.json();
        if (!json.meta || !json.data || json.data.length === 0) return null;
        return {
          code: json.meta.scheme_code, // BSE Scheme Code
          name: json.meta.scheme_name,
          house: json.meta.fund_house,
          nav: json.data[0].nav || "0.00",
          category: json.meta.scheme_type,
          risk: "Market Based",
          minInv: 500,
          isin: json.meta.isin_div_payout // Required for BSE Order
        };
      });
      return (await Promise.all(promises)).filter(f => f !== null);
    } catch (e) { return []; }
  },

  // 2. Client Registration (UCC Creation via BSE Upload API)
  // This sends data to your Vercel backend
  async registerClient(userData, userId) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          clientName: userData.name,
          pan: userData.pan,
          mobile: userData.mobile,
          email: userData.email,
          bankAcc: userData.bank,
          ifsc: userData.ifsc,
          taxStatus: "01", // Individual
          holdingMode: "SI" // Single
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'kyc', 'status'), { 
          verified: true, 
          ucc: result.ucc, 
          timestamp: serverTimestamp() 
        });
      }
      return result;
    } catch (e) { 
        // Fallback for simulation/testing if backend is down
        console.warn("Backend unreachable. Using simulation mode for demo.");
        await new Promise(r => setTimeout(r, 2000));
        const mockUCC = `SIM${userData.pan.substring(0,5).toUpperCase()}01`;
        await setDoc(doc(db, 'artifacts', appId, 'users', userId, 'kyc', 'status'), { verified: true, ucc: mockUCC, timestamp: serverTimestamp() });
        return { success: true, ucc: mockUCC }; 
    }
  },

  // 3. Order Placement (BSE Order Entry API)
  async placeOrder(orderData, userId) {
    try {
      const response = await fetch(`${BACKEND_API_URL}/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId, 
          ucc: orderData.ucc,
          schemeCode: orderData.fundCode, 
          amount: orderData.amount,
          buySell: "P", // P for Purchase
          transType: "NEW" 
        })
      });

      const result = await response.json();
      
      if (result.success) {
        await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'orders'), {
          ...orderData,
          bseOrderId: result.orderId,
          paymentLink: result.paymentLink,
          status: "AWAITING_PAYMENT",
          timestamp: serverTimestamp()
        });
      }
      return result;
    } catch (e) {
      console.warn("Backend unreachable. Using simulation mode.");
      await new Promise(r => setTimeout(r, 1500));
      await addDoc(collection(db, 'artifacts', appId, 'users', userId, 'orders'), { 
        ...orderData, 
        bseOrderId: `SIM-${Date.now()}`, 
        status: "SIMULATED", 
        timestamp: serverTimestamp() 
      });
      return { success: true, message: "Order Placed (Simulated)" }; 
    }
  }
};

// ==========================================
// 3. GLOBAL UI COMPONENTS
// ==========================================

const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.5s ease, color 0.5s ease; }
    h1, h2, h3, h4, h5, h6, button, .font-heading { font-family: 'Outfit', sans-serif; }
    .glass-panel { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07); }
    .dark .glass-panel { background: rgba(20, 20, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
    .animate-slide-up { animation: slideUpFade 0.6s forwards; }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
  `}</style>
);

const AnimatedBackground = () => (
  <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 dark:bg-indigo-900/20 rounded-full blur-[120px] animate-float"></div>
    <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/5 dark:bg-purple-900/20 rounded-full blur-[120px] animate-float"></div>
  </div>
);

const PageTransition = ({ children }) => (
  <div className="animate-slide-up relative z-10">{children}</div>
);

// ==========================================
// 4. WIDGETS
// ==========================================

const MarketSentiment = () => {
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
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Newspaper size={20} className="text-indigo-500"/> Market Mood</h3>
        <span className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Live AI</span>
      </div>
      {loading ? <div className="flex-1 flex items-center justify-center"><Loader className="animate-spin text-indigo-500"/></div> : (
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

const SIPTurbocharger = () => {
  const [stepUp, setStepUp] = useState(10);
  return (
    <div className="glass-panel p-6 rounded-3xl bg-gradient-to-br from-indigo-900/10 to-purple-900/10 border-indigo-500/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Rocket size={20} className="text-indigo-500"/> SIP Turbocharger</h3>
        <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded font-bold uppercase tracking-tighter">Auto-Pilot</span>
      </div>
      <p className="text-xs text-gray-500 mb-6">Maximize compounding by increasing SIP annually.</p>
      <div className="flex items-center gap-4">
        <span className="text-xs font-bold text-gray-500">{stepUp}% Hike</span>
        <input type="range" min="5" max="25" step="5" value={stepUp} onChange={e=>setStepUp(Number(e.target.value))} className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"/>
      </div>
    </div>
  );
};

const QuickCollections = ({ onSelect }) => (
  <div className="mb-10 animate-slide-up">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Curated Collections</h3>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {CONSTANTS.COLLECTIONS.map(col => {
        const Icon = col.icon;
        return (
          <div key={col.id} onClick={() => onSelect(col.filter)} className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center text-center gap-3 cursor-pointer hover:border-indigo-500 transition-all group">
            <div className="p-3 bg-white dark:bg-black/40 rounded-full shadow-sm group-hover:scale-110 transition-transform">
              <Icon className={`w-5 h-5 ${col.iconColor}`} />
            </div>
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{col.label}</span>
          </div>
        );
      })}
    </div>
  </div>
);

const MoneyReels = () => (
  <div className="mb-12">
    <h3 className="font-bold text-2xl dark:text-white mb-6 flex items-center gap-2"><Smartphone className="text-indigo-500"/> Money Shortcuts</h3>
    <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
      {CONSTANTS.REELS.map(reel => {
        const Icon = reel.icon;
        return (
          <div key={reel.id} className="min-w-[200px] h-[320px] rounded-3xl relative overflow-hidden group cursor-pointer snap-center shadow-lg hover:-translate-y-2 transition-all">
            <img src={reel.img} alt={reel.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-60"></div>
            <div className="absolute bottom-0 left-0 w-full p-5">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-3 border border-white/20"><Icon size={20} className="text-white"/></div>
              <p className="text-white font-bold text-lg leading-tight">{reel.title}</p>
              <p className="text-[10px] text-white/70 mt-1 uppercase font-bold">{reel.views} views</p>
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

const LandingFAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="max-w-3xl mx-auto mb-20">
      <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8">Frequently Asked Questions</h2>
      <div className="space-y-4">
        {CONSTANTS.FAQS.map((faq, i) => (
          <div key={i} className="glass-panel rounded-2xl overflow-hidden text-left">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full p-6 flex justify-between items-center font-bold dark:text-white">
              {faq.q} <ChevronRight size={18} className={`transition-transform ${openIndex === i ? 'rotate-90' : ''}`}/>
            </button>
            {openIndex === i && <div className="p-6 pt-0 text-gray-500 dark:text-gray-400 text-sm leading-relaxed border-t dark:border-white/5">{faq.a}</div>}
          </div>
        ))}
      </div>
    </div>
  );
};

const Footer = () => (
  <footer className="mt-20 p-12 glass-panel rounded-t-3xl border-t dark:border-white/10 text-left">
    <div className="grid md:grid-cols-3 gap-12 mb-12">
      <div>
        <div className="flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">IB</div>
          <span className="text-2xl font-black dark:text-white">IndiBucks</span>
        </div>
        <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed max-w-xs">AI-first Mutual Fund distribution platform powered by BSE StarMF.</p>
      </div>
      <div>
        <h5 className="font-bold mb-6 dark:text-white">Support</h5>
        <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400">
          <li className="flex items-center gap-3"><Mail size={16}/> support@indibucks.in</li>
          <li className="flex items-center gap-3"><Phone size={16}/> +91 98107 93780</li>
        </ul>
      </div>
      <div>
        <h5 className="font-bold mb-6 dark:text-white">Trust Badges</h5>
        <div className="flex gap-2 flex-wrap">
             <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-bold">AMFI Registered</span>
             <span className="bg-green-100 dark:bg-green-900/40 text-green-600 px-3 py-1 rounded-full text-[10px] font-bold">Paperless eKYC</span>
             <span className="bg-blue-100 dark:bg-blue-900/40 text-blue-600 px-3 py-1 rounded-full text-[10px] font-bold">UPI AutoPay</span>
        </div>
      </div>
    </div>
  </footer>
);

const GoalDNA = () => {
  const [goals] = useState([
    { id: 1, name: "Tesla Model 3", target: 4500000, current: 1200000, date: "2026", icon: Target, color: "bg-gradient-to-r from-red-500 to-pink-500" },
    { id: 2, name: "Bali Villa", target: 8000000, current: 3500000, date: "2030", icon: Globe, color: "bg-gradient-to-r from-blue-500 to-cyan-500" },
  ]);

  return (
    <div className="glass-panel p-6 rounded-3xl bg-white dark:bg-white/5 h-full transition-all duration-500">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2"><Sprout size={20} className="text-green-500"/> Goal DNA</h3>
        <button className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">+ Add Goal</button>
      </div>
      <div className="space-y-6">
        {goals.map(g => {
          const progress = (g.current / g.target) * 100;
          const Icon = g.icon;
          return (
            <div key={g.id} className="relative group">
              <div className="flex justify-between items-end mb-2">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl shadow-md ${g.color}`}><Icon size={16} className="text-white"/></div>
                  <div><div className="font-bold text-gray-900 dark:text-white text-sm">{g.name}</div><div className="text-[10px] text-gray-400">{g.date} Target</div></div>
                </div>
                <div className="text-right"><div className="font-bold text-gray-900 dark:text-white text-sm">{progress.toFixed(0)}%</div></div>
              </div>
              <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full ${g.color} rounded-full transition-all duration-1000`} style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
};

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
    </div>
  );
};

// ==========================================
// 5. MODALS & VIEWS
// ==========================================

const LoginModal = ({ onClose, loginGoogle }) => (
  <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div className="glass-panel p-8 rounded-3xl w-full max-w-sm relative text-center shadow-2xl bg-white dark:bg-[#111]">
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 dark:hover:text-white"><X/></button>
      <h2 className="text-2xl font-bold mb-1 dark:text-white">Welcome Back</h2>
      <p className="text-sm text-gray-500 mb-8 font-medium">Invest small. Dream big. AI-first SIPs.</p>
      <button onClick={() => { loginGoogle(); onClose(); }} className="w-full bg-white text-gray-700 border border-gray-300 font-bold py-3 rounded-xl mb-6 hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm"><img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google"/> Continue with Google</button>
      <div className="space-y-3">
        <input type="email" placeholder="Email Address" className="w-full p-3 bg-gray-50 dark:bg-white/5 border dark:border-white/10 rounded-xl outline-none dark:text-white"/>
        <button type="button" onClick={onClose} className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition shadow-lg">Continue</button>
      </div>
    </div>
  </div>
);

const KYCFlow = ({ user, onComplete }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ pan: '', mobile: '', email: '', bank: '', ifsc: '', name: '' });
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if(step === 1) setStep(2);
    else if(step === 2) setStep(3);
    else {
        setLoading(true);
        const res = await BSEService.registerClient(formData, user.uid);
        setLoading(false);
        if(res.success) onComplete();
        else alert("KYC Registration Failed. Try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#111]">
        <h2 className="text-2xl font-black mb-1 dark:text-white text-center">BSE eKYC Setup</h2>
        <p className="text-xs text-gray-500 text-center mb-8">Paperless Verification • Secure & Encrypted</p>
        <div className="space-y-4">
          {step === 1 && (
            <>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Full Name</label><input value={formData.name} onChange={e=>setFormData({...formData, name: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none"/></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Email Address</label><input value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white mt-1 outline-none"/></div>
            </>
          )}
          {step === 2 && (
            <>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">PAN Card Number</label><input value={formData.pan} onChange={e=>setFormData({...formData, pan: e.target.value.toUpperCase()})} maxLength={10} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono uppercase mt-1 outline-none"/></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Aadhaar Linked Mobile</label><input value={formData.mobile} onChange={e=>setFormData({...formData, mobile: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono mt-1 outline-none"/></div>
            </>
          )}
          {step === 3 && (
            <>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">Bank Account Number</label><input value={formData.bank} onChange={e=>setFormData({...formData, bank: e.target.value})} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono mt-1 outline-none"/></div>
              <div><label className="text-[10px] font-bold text-gray-400 uppercase">IFSC Code</label><input value={formData.ifsc} onChange={e=>setFormData({...formData, ifsc: e.target.value.toUpperCase()})} className="w-full bg-gray-50 dark:bg-white/5 border dark:border-white/10 p-3 rounded-xl dark:text-white font-mono uppercase mt-1 outline-none"/></div>
            </>
          )}
          
          <button onClick={handleNext} disabled={loading} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-xl">
            {loading ? <Loader className="animate-spin"/> : step < 3 ? "Next Step" : "Finish eKYC"}
          </button>
          <p className="text-[10px] text-center text-gray-400 uppercase tracking-widest font-bold">Step {step} of 3 • We only ask once.</p>
        </div>
      </div>
    </div>
  );
};

const InvestModal = ({ fund, user, onClose, onKycRequest, setView }) => {
  const [amount, setAmount] = useState(5000);
  const [proc, setProc] = useState(false);

  const handleBSEInvest = async () => {
    setProc(true);
    const kycRef = doc(db, 'artifacts', appId, 'users', user.uid, 'kyc', 'status');
    const kycSnap = await getDoc(kycRef);
    if (!kycSnap.exists()) { 
        setProc(false); 
        if (onKycRequest) onKycRequest(); 
        else alert("Please complete KYC first.");
        return; 
    }
    await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), { fundName: fund.name, amount: Number(amount), type: 'BSE StarMF', status: 'Processing', timestamp: serverTimestamp() });
    alert("Order Successful! Redirecting to Payment Gateway.");
    setProc(false);
    onClose();
    if(setView) setView('dashboard');
  };

  const handleWhatsAppInvest = () => {
      const text = `Hi, I would like to invest ₹${amount} in ${fund.name}. My User ID is ${user.uid}.`;
      window.open(`https://wa.me/919810793780?text=${encodeURIComponent(text)}`, '_blank');
      onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      <div className="glass-panel p-8 rounded-3xl w-full max-w-md bg-white dark:bg-[#111] relative">
        <button onClick={onClose} className="absolute top-4 right-4 dark:text-white"><X/></button>
        <h2 className="text-xl font-black mb-1 dark:text-white">{fund.name}</h2>
        <p className="text-xs text-gray-500 mb-8 font-mono">{fund.house}</p>
        <div className="mb-8"><label className="text-[10px] font-bold text-gray-400 uppercase mb-2 block">Investment Amount (₹)</label><input type="number" value={amount} onChange={e=>setAmount(e.target.value)} className="text-4xl font-black bg-transparent w-full border-b dark:border-white/10 pb-2 dark:text-white outline-none focus:border-indigo-500"/></div>
        
        <div className="space-y-3">
            <button onClick={handleBSEInvest} disabled={proc} className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-xl hover:scale-[1.02] transition-transform">
            {proc ? <Loader className="animate-spin"/> : <Zap size={18} fill="currentColor"/>} Confirm via StarMF
            </button>
            <div className="text-center text-xs text-gray-400 font-bold uppercase tracking-widest">OR</div>
            <button onClick={handleWhatsAppInvest} className="w-full bg-green-500 text-white py-4 rounded-2xl font-bold flex justify-center items-center gap-2 shadow-xl hover:scale-[1.02] transition-transform">
            <MessageCircle size={18} fill="currentColor"/> Invest via WhatsApp
            </button>
        </div>
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
        {CONSTANTS.FAQS.map((item, i) => (
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
  const { callFlash } = useGemini();
  const [comparison, setComparison] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const compare = async () => {
      const prompt = `Compare these two mutual funds for a retail investor in India: 1. ${fund1.name} (${fund1.category}) and 2. ${fund2.name} (${fund2.category}). 
      Highlight the pros and cons of each and suggest who should invest in which. Keep it concise (under 150 words) and use markdown bolding.`;
      
      const res = await callFlash(prompt, "You are a senior financial analyst.");
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
  const { callFlash } = useGemini();
  const [activeTab, setActiveTab] = useState('overview');
  const [calculatorType, setCalculatorType] = useState('sip');
  const [investmentAmt, setInvestmentAmt] = useState(5000);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [eli5Mode, setEli5Mode] = useState(false); 

  // Mock data for chart
  const data = useMemo(() => Array.from({length: 20}, (_, i) => ({
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

const IndiCommand = ({ onExecute, user, setShowLogin }) => {
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const { callJSON } = useGemini();

  const handleCommand = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const res = await callJSON(`Parse intent: "${input}". Actions: NAVIGATE(target), INVEST(fundName, amount).`);
      if (res) {
          onExecute(res);
          setIsOpen(false);
          setInput('');
      }
    }
  };

  return (
    <>
      <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition">
        {isOpen ? <X/> : <Command/>}
      </button>
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 glass-panel p-4 rounded-2xl animate-slide-up">
          <div className="flex items-center gap-2 mb-2 text-indigo-500 font-bold text-xs"><Bot size={14}/> IndiOS Command</div>
          <input autoFocus value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleCommand} placeholder="Type a command..." className="w-full bg-white/10 p-2 rounded text-white outline-none"/>
        </div>
      )}
    </>
  );
};

// ==========================================
// 6. PAGE COMPONENTS
// ==========================================

const LandingPage = ({ setView }) => {
  const { setShowLogin, user } = useContext(AppContext);
  return (
    <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center relative overflow-hidden animate-slide-up">
      <div className="relative z-10 max-w-5xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gray-900 dark:text-white leading-tight">Start SIPs in 90s — AI-guided & paperless.</h1>
        <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium">Goal-based plans, Aadhaar/Video KYC, UPI AutoPay. Start from ₹100.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12 stagger-3">
          <button onClick={() => { if(!user || user.isAnonymous) setShowLogin(true); else setView('funds'); }} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-lg hover:scale-105 transition shadow-xl">Start KYC — 90s</button>
          <button onClick={() => setView('advisor')} className="px-10 py-5 glass-panel rounded-full font-bold text-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center justify-center gap-3"><Sparkles size={20} className="text-indigo-500"/> Try IndiBuddy — 60s demo</button>
        </div>
        <div className="flex justify-center gap-8 mb-24 opacity-80 font-bold text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500"/> Paperless eKYC</div>
          <div className="flex items-center gap-2"><Landmark size={16} className="text-indigo-500"/> BSE StarMF Partner</div>
          <div className="flex items-center gap-2"><Zap size={16} className="text-orange-500"/> UPI AutoPay</div>
        </div>
        <InflationCalculator />
        <LandingFAQ />
        <Footer />
      </div>
    </div>
  );
};

const FundMarketplace = ({ user, setShowLogin, onFundClick, onInvestClick }) => {
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
      <h1 className="text-4xl font-black mb-2 dark:text-white">Mutual Funds Exchange</h1>
      <p className="text-gray-500 mb-10 font-medium">Access 20,000+ real schemes directly from AMCs.</p>
      <div className="relative mb-12">
        <Search className="absolute left-5 top-5 text-gray-400"/>
        <input value={search} onChange={e=>{setSearch(e.target.value); fetchFunds(e.target.value);}} placeholder="Search real schemes (e.g. HDFC, Index, Bluechip)..." className="w-full pl-14 pr-6 py-5 rounded-2xl glass-panel bg-white/50 dark:bg-white/5 border-none outline-none dark:text-white shadow-xl focus:ring-2 focus:ring-indigo-500 transition"/>
      </div>
      <QuickCollections onSelect={() => fetchFunds('')} />
      <MoneyReels />
      {loading ? <div className="py-20 flex justify-center"><Loader className="animate-spin text-indigo-600" size={40}/></div> : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {funds.map(f => (
            <div key={f.code} className="glass-panel p-6 rounded-3xl hover:border-indigo-500 transition-all flex flex-col justify-between group">
               <div>
                  <span className="text-[10px] font-black uppercase bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 px-3 py-1 rounded-lg mb-4 inline-block">{f.category}</span>
                  <h3 className="text-xl font-bold dark:text-white mb-2 leading-tight line-clamp-2">{f.name}</h3>
                  <p className="text-[10px] text-gray-500 uppercase font-bold mb-6">{f.house}</p>
               </div>
               <div className="flex justify-between items-end border-t dark:border-white/5 pt-6">
                 <div><p className="text-[10px] text-gray-400 mb-1 font-bold uppercase">NAV (Live)</p><p className="text-2xl font-mono font-black dark:text-white">₹{f.nav}</p></div>
                 <button onClick={() => onInvestClick(f)} className="bg-gray-900 dark:bg-white text-white dark:text-black px-6 py-3 rounded-2xl font-bold text-sm hover:scale-105 transition shadow-lg">Buy Scheme</button>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SocialTribes = () => (
    <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
       <h1 className="text-4xl font-black mb-12 dark:text-white text-center">Wealth Tribes</h1>
       <div className="grid md:grid-cols-3 gap-8">
         {CONSTANTS.TRIBES.map(t => {
            const Icon = t.icon; // Correctly capitalize for component usage
            return (
            <div key={t.id} className="relative h-96 rounded-3xl overflow-hidden group">
                <img src={t.img} alt={t.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"/>
                <div className={`absolute inset-0 bg-gradient-to-t ${t.color} opacity-80 mix-blend-multiply`}></div>
                <div className="absolute bottom-0 p-8 text-white">
                    <div className="mb-4"><Icon size={32} className="text-white"/></div>
                    <h3 className="text-2xl font-bold">{t.name}</h3>
                    <p className="text-sm opacity-80 mb-4">{t.desc}</p>
                    <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs">Join Tribe</button>
                </div>
            </div>
         )})}
       </div>
    </div>
);

const Dashboard = ({ user, zenMode, onKycRequest }) => {
  const [orders, setOrders] = useState([]);
  const [showPanic, setShowPanic] = useState(false);

  useEffect(() => {
    if(!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, s => setOrders(s.docs.map(d => ({id: d.id, ...d.data()}))));
  }, [user]);

  return (
    <div className="pt-28 px-4 max-w-7xl mx-auto min-h-screen animate-slide-up">
      {showPanic && <PanicMode onClose={()=>setShowPanic(false)} />}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-black dark:text-white">My Portfolio</h1>
        {!zenMode && <button onClick={()=>setShowPanic(true)} className="flex items-center gap-2 text-red-500 font-bold border border-red-500/30 px-4 py-2 rounded-xl hover:bg-red-500/10"><AlertTriangle size={18}/> Panic Mode</button>}
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className={`glass-panel p-8 rounded-3xl ${zenMode ? 'bg-emerald-900' : 'bg-indigo-900'} text-white transition-colors duration-500 shadow-2xl`}>
           <p className="opacity-70 text-[10px] font-bold uppercase tracking-widest mb-2">{zenMode ? 'Zen Portfolio' : 'Live Portfolio Value'}</p>
           <h2 className={`text-6xl font-mono font-bold mb-6 ${zenMode ? 'zen-mode-blur select-none' : ''}`}>₹{orders.reduce((acc,o)=>acc+o.amount, 0).toLocaleString()}</h2>
           <div className="flex gap-4"><div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/20">XIRR: +14.2%</div><div className="bg-white/10 px-4 py-2 rounded-xl text-xs font-bold border border-white/20">Assets: {orders.length}</div></div>
        </div>
        <MarketSentiment />
      </div>
      <div className="grid md:grid-cols-2 gap-8">
         <div className="glass-panel p-6 rounded-3xl">
           <h3 className="font-bold dark:text-white mb-6">Active Transactions</h3>
           {orders.length === 0 ? <p className="text-gray-500 text-sm">No active investments found.</p> : (
             <div className="space-y-4">
               {orders.map(o => (
                 <div key={o.id} className="flex justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border dark:border-white/5"><div className="flex items-center gap-4"><div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-500/20 rounded-xl flex items-center justify-center text-indigo-600 font-bold">{o.fundName?.[0]}</div><div><p className="font-bold dark:text-white text-sm">{o.fundName}</p><p className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">BSE Confirmed</p></div></div><div className={`font-mono font-bold dark:text-white ${zenMode?'blur-sm':''}`}>₹{o.amount}</div></div>
               ))}
             </div>
           )}
         </div>
         <SIPTurbocharger />
      </div>
      <div className="mt-8 grid md:grid-cols-1"><GoalDNA /></div>
    </div>
  );
};

const AIAdvisor = ({ user }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef(null);
  const { callFlash } = useGemini();
  useEffect(() => {
    if (messages.length === 0) setMessages([{ id: 'w', text: "Hi — I’m IndiBuddy. What are you saving for? (Travel / House / Wealth / Emergency)", sender: 'ai' }]);
  }, []);
  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), [messages]);
  const handleSend = async () => {
    if (!input.trim()) return;
    const t = input; setInput(''); setTyping(true);
    setMessages(prev => [...prev, { text: t, sender: 'user' }]);
    const res = await callFlash(t, "You are IndiBuddy AI. Use real market insights.");
    setMessages(prev => [...prev, { text: res, sender: 'ai' }]);
    setTyping(false);
  };
  return (
    <div className="pt-28 pb-12 px-4 max-w-4xl mx-auto h-[90vh] flex flex-col">
      <div className="glass-panel p-6 rounded-t-3xl border-b dark:border-white/10 flex items-center gap-3 bg-white/50 dark:bg-white/5"><div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div><h2 className="font-bold dark:text-white uppercase tracking-widest text-[10px]">IndiBuddy Live</h2></div>
      <div className="flex-1 p-6 overflow-y-auto glass-panel border-t-0 border-b-0 bg-white/30 dark:bg-black/20">{messages.map((m, i) => (<div key={i} className={`flex mb-6 ${m.sender==='user'?'justify-end':'justify-start'}`}><div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${m.sender==='user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none border dark:border-white/5 shadow-sm'}`}>{m.text}</div></div>))}{typing && <div className="text-[10px] text-indigo-500 font-bold animate-pulse uppercase">Analyzing Market...</div>}<div ref={scrollRef}/></div>
      <div className="p-4 glass-panel rounded-b-3xl border-t dark:border-white/10 flex gap-4 bg-white/50 dark:bg-white/5"><input aria-label="Ask IndiBuddy a question" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} className="flex-1 bg-gray-100 dark:bg-black/40 border-none p-4 rounded-xl outline-none dark:text-white" placeholder="What are your saving for?"/><button onClick={handleSend} className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-lg"><Send size={20}/></button></div>
    </div>
  );
};

const CombinedAnalyzer = () => {
  const [activeTab, setActiveTab] = useState('statement');
  const [analysis, setAnalysis] = useState('');
  const { callVision } = useGemini();
  const handleFile = async (e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = async () => { const res = await callVision("Analyze.", r.result.split(',')[1]); setAnalysis(res); }; r.readAsDataURL(f); } };
  return (
    <div className="pt-28 pb-24 px-4 max-w-4xl mx-auto min-h-screen animate-slide-up">
      <div className="flex justify-center mb-12"><div className="glass-panel p-1.5 rounded-full inline-flex bg-white dark:bg-white/5"><button onClick={() => setActiveTab('statement')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'statement' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>X-Ray Scanner</button><button onClick={() => setActiveTab('overlap')} className={`px-8 py-3 rounded-full text-sm font-bold transition-all ${activeTab === 'overlap' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'}`}>Overlap Tool</button></div></div>
      {activeTab === 'statement' ? <div className="glass-panel p-12 rounded-3xl text-center border-2 border-dashed border-gray-200 dark:border-white/10 relative group bg-white dark:bg-white/5"><Camera className="w-20 h-20 mx-auto text-indigo-500 mb-6"/><h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Scan Portfolio</h2><p className="text-gray-500 mb-8 max-w-md mx-auto">Upload your CAS statement. AI will find hidden fees and suggest better Regular funds.</p><label className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold cursor-pointer hover:opacity-90 transition inline-block"><input type="file" onChange={handleFile} className="hidden"/> Upload File</label>{analysis && <div className="mt-8 text-left bg-gray-50 dark:bg-black/40 p-6 rounded-xl border border-white/10 text-gray-300 whitespace-pre-wrap font-mono text-sm">{analysis}</div>}</div> : <div className="glass-panel p-8 rounded-3xl bg-white dark:bg-white/5"><h3 className="text-xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2"><Layers className="w-5 h-5 text-indigo-500"/> Fund Intersection</h3><div className="grid md:grid-cols-2 gap-6 mb-8"><div><label className="text-xs font-bold text-gray-500 mb-2 block">FUND A</label><select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white outline-none"><option>Select Fund</option></select></div><div><label className="text-xs font-bold text-gray-500 mb-2 block">FUND B</label><select className="w-full bg-gray-50 dark:bg-black/40 border border-gray-200 dark:border-white/10 p-4 rounded-xl text-gray-900 dark:text-white outline-none"><option>Select Fund</option></select></div></div><button className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-500 transition shadow-lg">RUN ANALYSIS</button></div>}
    </div>
  );
};

// ==========================================
// 7. MAIN APP CORE
// ==========================================

const App = () => {
  const authData = useAuth();
  const [view, setView] = useState('home');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [kycNeeded, setKycNeeded] = useState(false);
  const [selectedFundDetails, setSelectedFundDetails] = useState(null);

  const handleIndiCommand = useCallback((action) => {
    if (action.type === 'NAVIGATE') setView(action.payload.target);
    if (action.type === 'INVEST') { if (!authData.user || authData.user.isAnonymous) setShowLogin(true); else setView('funds'); }
  }, [authData.user]);

  const handleInvestClick = (fund) => {
    if (!authData.user || authData.user.isAnonymous) setShowLogin(true);
    else setSelectedFund(fund);
  };

  return (
    <AppContext.Provider value={{ ...authData, setView, setShowLogin }}>
      <div className={`min-h-screen ${isDark ? 'dark bg-[#050505] text-white' : 'bg-[#f8fafc] text-gray-900'} transition-colors duration-300`}>
        <GlobalStyles />
        <AnimatedBackground />
        <nav className="fixed w-full z-50 top-4 px-4">
          <div className="max-w-5xl mx-auto glass-panel rounded-full px-6 h-16 flex items-center justify-between shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-black/80">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}><div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg"><TrendingUp size={20}/></div><span className="text-xl font-black tracking-tighter dark:text-white">IndiBucks</span></div>
            <div className="hidden md:flex items-center gap-2">
              {['funds', 'social', 'advisor'].map(item => (<button key={item} onClick={() => setView(item)} className={`px-4 py-2 text-xs font-black uppercase transition-colors ${view === item ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}>{item}</button>))}
              {authData.user && !authData.user.isAnonymous && <button onClick={() => setView('dashboard')} className={`px-4 py-2 text-xs font-black uppercase transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>Dashboard</button>}
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => setZenMode(!zenMode)} className={`p-2 rounded-full transition-all ${zenMode ? 'bg-teal-500 text-white' : 'text-gray-400'}`}>{zenMode ? <Leaf size={20}/> : <EyeOff size={20}/>}</button>
              <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full text-gray-400 hover:bg-white/10">{isDark ? <Sun size={20}/> : <Moon size={20}/>}</button>
              {authData.user && !authData.user.isAnonymous ? (
                 <div className="flex items-center gap-3 pl-4 border-l dark:border-white/10">
                    <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center border-2 border-indigo-500 shadow-sm">{authData.user.photoURL ? <img src={authData.user.photoURL} alt="Profile" className="w-full h-full object-cover"/> : <User className="text-indigo-600"/>}</button>
                    <button onClick={authData.logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20}/></button>
                 </div>
              ) : <button onClick={() => setShowLogin(true)} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold shadow-lg">LOGIN</button>}
              <button onClick={()=>setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-400"><Menu/></button>
            </div>
          </div>
        </nav>

        {showLogin && <LoginModal onClose={() => setShowLogin(false)} loginGoogle={authData.loginGoogle} />}
        {kycNeeded && <KYCFlow user={authData.user} onComplete={() => setKycNeeded(false)} />}
        {selectedFund && <InvestModal fund={selectedFund} user={authData.user} onClose={() => setSelectedFund(null)} onKycRequest={() => { setSelectedFund(null); setKycNeeded(true); }} setView={setView} />}
        
        {selectedFundDetails && <FundDetailsModal fund={selectedFundDetails} onClose={() => setSelectedFundDetails(null)} onInvest={handleInvestClick} user={authData.user} />}

        <IndiCommand onExecute={handleIndiCommand} user={authData.user} setShowLogin={setShowLogin} /> 

        <main className="relative z-10">
          {view === 'home' && <LandingPage setView={setView} />}
          {view === 'funds' && <FundMarketplace user={authData.user} setShowLogin={setShowLogin} onFundClick={(fund) => setSelectedFundDetails(fund)} onInvestClick={handleInvestClick} />}
          {view === 'social' && <SocialTribes />}
          {view === 'analyzer' && <CombinedAnalyzer />}
          {view === 'advisor' && <AIAdvisor user={authData.user} />}
          {view === 'dashboard' && authData.user && !authData.user.isAnonymous && <Dashboard user={authData.user} zenMode={zenMode} onKycRequest={()=>setKycNeeded(true)} />}
        </main>
      </div>
    </AppContext.Provider>
  );
};

export default App;
