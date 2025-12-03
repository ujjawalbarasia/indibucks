import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut, signInAnonymously } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy, where } from 'firebase/firestore';
import { 
  TrendingUp, Shield, Zap, User, Menu, X, ChevronRight, Star, 
  Search, PieChart, ArrowUpRight, Briefcase, 
  CheckCircle, Lock, Loader, RefreshCw,
  Camera, Volume2, Phone, Mail, MapPin, Users, Download, Table, Key, Sparkles, MessageCircle, Copy, Mic, Calculator, ArrowLeftRight, LogIn, Target
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

const apiKey = ""; 

// --- Configs & Data ---
const TRACKED_FUNDS = [
  { code: '119598', name: 'Mirae Asset Tax Saver (ELSS)', category: 'ELSS', risk: 'High', benchmark: 'Nifty 500', minInv: 500, tags: ['Tax Saving', 'Long Term'] },
  { code: '125494', name: 'SBI Small Cap Fund', category: 'Small Cap', risk: 'Very High', benchmark: 'Nifty Smallcap 250', minInv: 1000, tags: ['High Growth', 'Aggressive'] },
  { code: '122639', name: 'Parag Parikh Flexi Cap', category: 'Flexi Cap', risk: 'High', benchmark: 'Nifty 500', minInv: 1000, tags: ['Global Exposure', 'Stable'] },
  { code: '112152', name: 'HDFC Mid-Cap Opportunities', category: 'Mid Cap', risk: 'High', benchmark: 'Nifty Midcap 150', minInv: 500, tags: ['Growth', 'Proven'] },
  { code: '120586', name: 'ICICI Prudential Bluechip', category: 'Large Cap', risk: 'Moderate', benchmark: 'Nifty 100', minInv: 100, tags: ['Bluechip', 'Safe Equity'] },
  { code: '119800', name: 'Nippon India Liquid Fund', category: 'Liquid', risk: 'Low', benchmark: 'CRISIL Liquid', minInv: 5000, tags: ['Emergency Fund', 'Safe'] },
];

const calculateCAGR = (currentNav, historicalData, years) => {
  if (!historicalData || historicalData.length === 0) return 0;
  const targetDate = new Date();
  targetDate.setFullYear(targetDate.getFullYear() - years);
  const pastPoint = historicalData.find(d => new Date(d.date.split('-').reverse().join('-')) <= targetDate);
  if (!pastPoint) return 0;
  const pastNav = parseFloat(pastPoint.nav);
  const cagr = (Math.pow(currentNav / pastNav, 1 / years) - 1) * 100;
  return cagr.toFixed(2);
};

// --- API Helpers ---
const callGeminiFlash = async (prompt, systemInstruction = "", useJson = false) => {
  try {
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };
    if (useJson) payload.generationConfig = { responseMimeType: "application/json" };

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text;
  } catch (e) { return null; }
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

const callGeminiTTS = async (text) => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-tts:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: text }] }], generationConfig: { responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } } } })
    });
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data; 
  } catch (e) { return null; }
};

const executeOrderBSE = async (orderDetails) => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  return { success: true, bseOrderId: `ORD-${Math.floor(Math.random() * 1000000)}`, paymentLink: "https://www.bsestarmf.in/payment-gateway-mock", message: "Order placed successfully on BSE Star MF Platform." };
};

// --- AUTH COMPONENT ---
const LoginModal = ({ onClose }) => {
  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      onClose();
    } catch (error) {
      console.error("Login failed", error);
      if (error.code === 'auth/unauthorized-domain') {
        alert("Error: This domain is not authorized. Go to Firebase Console > Authentication > Settings > Authorized Domains.");
      } else if (error.code === 'auth/configuration-not-found') {
        alert("Error: Google Sign-In is not enabled in Firebase Console.");
      } else {
        alert(`Login Error: ${error.message}`);
      }
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAnonymously(auth);
      onClose();
    } catch (error) {
      alert("Guest login failed. Check Firebase Config.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-8 text-center relative animate-fade-in-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <User className="w-8 h-8 text-indigo-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-500 mb-8">Access your portfolio and goals securely.</p>
        
        <div className="space-y-3">
          <button 
            onClick={handleGoogleLogin}
            className="w-full bg-white border border-gray-300 text-gray-700 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-50 transition shadow-sm"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-5 h-5" alt="Google" />
            Continue with Google
          </button>

          <button 
            onClick={handleGuestLogin}
            className="w-full bg-gray-100 text-gray-600 py-3 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-gray-200 transition"
          >
            <User className="w-5 h-5" />
            Continue as Guest
          </button>
        </div>
        
        <p className="text-xs text-gray-400 mt-6">By continuing, you agree to our Terms & Privacy Policy.</p>
      </div>
    </div>
  );
};

// --- 1. SIP CALCULATOR (Fixed: Added Definition) ---
const SIPCalculator = () => {
  const [monthlyInv, setMonthlyInv] = useState(5000);
  const [years, setYears] = useState(10);
  const [rate, setRate] = useState(12);

  const invested = monthlyInv * 12 * years;
  const futureValue = monthlyInv * ((((Math.pow(1 + (rate/100)/12, years*12)) - 1) / ((rate/100)/12)) * (1 + (rate/100)/12));
  const gains = futureValue - invested;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
        <Calculator className="w-5 h-5 text-indigo-600" /> SIP Calculator
      </h3>
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div><div className="flex justify-between mb-2"><label className="text-sm font-medium text-gray-600">Monthly Investment</label><span className="font-bold text-indigo-600">₹ {monthlyInv.toLocaleString()}</span></div><input type="range" min="500" max="100000" step="500" value={monthlyInv} onChange={e => setMonthlyInv(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
          <div><div className="flex justify-between mb-2"><label className="text-sm font-medium text-gray-600">Time Period (Years)</label><span className="font-bold text-indigo-600">{years} Years</span></div><input type="range" min="1" max="30" step="1" value={years} onChange={e => setYears(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
          <div><div className="flex justify-between mb-2"><label className="text-sm font-medium text-gray-600">Expected Return (p.a)</label><span className="font-bold text-indigo-600">{rate}%</span></div><input type="range" min="5" max="30" step="0.5" value={rate} onChange={e => setRate(Number(e.target.value))} className="w-full accent-indigo-600" /></div>
        </div>
        <div className="bg-gray-50 rounded-xl p-6 flex flex-col justify-center text-center">
          <p className="text-gray-500 text-sm mb-1">Projected Value</p>
          <h2 className="text-3xl font-extrabold text-green-600 mb-4">₹ {Math.round(futureValue).toLocaleString()}</h2>
          <div className="flex justify-between text-sm border-t border-gray-200 pt-4">
            <div className="text-left"><p className="text-gray-500">Invested</p><p className="font-bold text-gray-900">₹ {Math.round(invested).toLocaleString()}</p></div>
            <div className="text-right"><p className="text-gray-500">Wealth Gained</p><p className="font-bold text-green-600">+₹ {Math.round(gains).toLocaleString()}</p></div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- 2. DASHBOARD ---
const Dashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ invested: 0, current: 0 });
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      
      let invested = 0;
      let current = 0;
      const goalMap = {};

      ordersData.forEach(o => {
        if (o.status !== 'Failed') {
          invested += o.amount;
          current += o.amount * 1.12; 
          const goal = o.goal || 'General Wealth';
          if (!goalMap[goal]) goalMap[goal] = 0;
          goalMap[goal] += o.amount;
        }
      });
      
      setStats({ invested, current });
      setGoals(Object.entries(goalMap).map(([name, value]) => ({ name, value })));
    });
    return () => unsubscribe();
  }, [user]);

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899'];

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-end mb-8">
        <div><h1 className="text-3xl font-bold text-gray-900">Hello, {user.displayName?.split(' ')[0]} 👋</h1><p className="text-gray-500">Your financial freedom tracker</p></div>
        <div className="text-right hidden md:block"><p className="text-sm text-gray-500">XIRR (Returns)</p><p className="text-2xl font-bold text-green-600">+14.2%</p></div>
      </div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-6 rounded-2xl shadow-xl shadow-indigo-500/20 relative overflow-hidden col-span-2">
          <div className="relative z-10 flex justify-between items-end h-full">
            <div><p className="text-indigo-100 text-sm mb-1 font-medium">Total Portfolio Value</p><h2 className="text-5xl font-bold tracking-tight">₹ {Math.round(stats.current).toLocaleString()}</h2><div className="mt-4 flex gap-4 text-sm"><div><span className="opacity-70 block text-xs">Invested</span><span className="font-bold">₹ {Math.round(stats.invested).toLocaleString()}</span></div><div><span className="opacity-70 block text-xs">Total Gain</span><span className="font-bold text-green-300">+₹ {Math.round(stats.current - stats.invested).toLocaleString()}</span></div></div></div>
            <div className="bg-white/20 p-3 rounded-xl backdrop-blur-md"><TrendingUp className="w-8 h-8 text-white" /></div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2"><Target className="w-5 h-5 text-red-500" /> Goal Progress</h3>
          <div className="flex-1 flex items-center justify-center">
            {goals.length > 0 ? (
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={goals} layout="vertical">
                  <XAxis type="number" hide /><YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12}} /><Tooltip cursor={{fill: 'transparent'}} /><Bar dataKey="value" radius={[0, 4, 4, 0]}>{goals.map((entry, index) => (<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />))}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (<div className="text-center text-gray-400 text-sm"><Target className="w-8 h-8 mx-auto mb-2 opacity-50" /><p>No goals set yet.</p></div>)}
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-gray-900">Your Holdings</h3><button className="text-indigo-600 text-sm font-bold hover:underline">Download Statement</button></div>
        {orders.length > 0 ? (<div className="divide-y divide-gray-100">{orders.map(order => (<div key={order.id} className="p-5 flex flex-col md:flex-row justify-between items-center hover:bg-gray-50 transition"><div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0"><div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold">{order.fundName[0]}</div><div><h4 className="font-bold text-gray-900">{order.fundName}</h4><div className="flex items-center gap-3 text-xs text-gray-500 mt-1"><span className="bg-gray-100 px-2 py-0.5 rounded">Regular</span><span>•</span><span>{new Date(order.timestamp?.seconds * 1000).toLocaleDateString()}</span></div></div></div><div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end"><div className="text-right"><p className="text-xs text-gray-400">Invested</p><p className="font-bold text-gray-900">₹{order.amount.toLocaleString()}</p></div><div className="text-right"><p className="text-xs text-gray-400">Current</p><p className="font-bold text-green-600">₹{Math.round(order.amount * 1.12).toLocaleString()}</p></div><div className="text-right"><span className={`text-xs px-2 py-1 rounded-full font-bold ${order.status === 'Placed' || order.status === 'WhatsApp Intent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{order.status === 'WhatsApp Intent' ? 'Processing' : order.status}</span></div></div></div>))}</div>) : (<div className="p-12 text-center"><Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" /><p className="text-gray-500">You haven't invested yet.</p><p className="text-sm text-gray-400 mt-1">Start your SIP today via WhatsApp!</p></div>)}
      </div>
    </div>
  );
};

// --- 3. FUND EXPLORER ---
const FundExplorer = ({ user, setView, setShowLogin }) => {
  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('General Wealth');
  
  useEffect(() => {
    setFunds(TRACKED_FUNDS.map(f => ({ ...f, nav: 100 + Math.random()*50, returns3Y: (12 + Math.random()*10).toFixed(2) })));
  }, []);

  const handleWhatsAppInvest = async () => {
    if (!user) { setShowLogin(true); return; }
    const message = `*Investment Request*\n\nHi IndiBucks,\nI want to invest in: *${selectedFund.name}*\nAmount: *₹${investAmount}*\nGoal: ${selectedGoal}\n\nPlease send payment link.`;
    const url = `https://wa.me/919810793780?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
    try {
      await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), { fundId: selectedFund.code, fundName: selectedFund.name, amount: parseFloat(investAmount), goal: selectedGoal, status: 'WhatsApp Intent', timestamp: serverTimestamp(), type: 'Regular Plan' });
      alert("Request logged! Please complete payment on WhatsApp.");
      setSelectedFund(null);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen bg-gray-50">
      <div className="mb-8"><h2 className="text-3xl font-bold text-gray-900">Invest in Top Funds</h2><p className="text-gray-500">Zero paperwork. Concierge execution.</p></div>
      <div className="grid md:grid-cols-3 gap-6">
        {funds.map(fund => (
          <div key={fund.code} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition">
            <div className="flex justify-between mb-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold uppercase">{fund.category}</span><span className="text-xs font-bold text-green-600">★ {fund.risk} Risk</span></div>
            <h3 className="font-bold text-lg mb-1 line-clamp-2">{fund.name}</h3>
            <div className="flex justify-between mt-4 mb-6 text-sm"><div><p className="text-gray-400">3Y Returns</p><p className="font-bold text-green-600">{fund.returns3Y}%</p></div><div className="text-right"><p className="text-gray-400">Min Inv</p><p className="font-bold">₹{fund.minInv}</p></div></div>
            <button onClick={() => { setSelectedFund(fund); setInvestAmount(fund.minInv); }} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition">Invest Now</button>
          </div>
        ))}
      </div>
      {selectedFund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white p-6 rounded-2xl w-full max-w-md relative animate-fade-in-up">
            <button onClick={() => setSelectedFund(null)} className="absolute top-4 right-4"><X /></button>
            <h3 className="text-xl font-bold mb-4">Invest in {selectedFund.name}</h3>
            <div className="space-y-4 mb-6">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label><input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} className="w-full p-3 border rounded-lg font-bold text-xl" /></div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tag this Goal</label><select value={selectedGoal} onChange={e => setSelectedGoal(e.target.value)} className="w-full p-3 border rounded-lg bg-white"><option>General Wealth</option><option>Retirement</option><option>New Home</option><option>Car / Bike</option><option>Education</option></select></div>
            </div>
            <button onClick={handleWhatsAppInvest} className="w-full bg-green-500 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-lg shadow-green-500/20"><MessageCircle className="w-6 h-6" /> Invest via WhatsApp</button>
            <p className="text-center text-xs text-gray-400 mt-4">Safe & Secure. Human verified execution.</p>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 4. ADMIN DASHBOARD ---
const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const ADMIN_PIN = "1234";

  const handleLogin = (e) => { e.preventDefault(); if (pin === ADMIN_PIN) setIsAuthenticated(true); else alert("Invalid PIN"); };
  useEffect(() => { if (isAuthenticated) { const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), orderBy('timestamp', 'desc')); return onSnapshot(q, s => setLeads(s.docs.map(d => ({id: d.id, ...d.data()})))); } }, [isAuthenticated]);
  const generateOutreach = async (lead) => { const prompt = `Create outreach. Name: ${lead.name}, Goal: ${lead.goal}. JSON: { "whatsapp": "msg", "email_subject": "sub", "email_body": "body" }`; const res = await callGeminiFlash(prompt, "Sales", true); if(res) setGeneratedDraft(JSON.parse(res.replace(/```json|```/g, ''))); };

  if (!isAuthenticated) return <div className="min-h-screen pt-32 flex justify-center bg-gray-900"><form onSubmit={handleLogin} className="bg-white p-8 rounded-xl max-w-sm"><h2 className="text-2xl font-bold mb-4">Admin</h2><input type="password" value={pin} onChange={e => setPin(e.target.value)} className="w-full border p-2 mb-4" placeholder="PIN"/><button className="bg-indigo-600 text-white w-full py-2 rounded">Login</button></form></div>;

  return (
    <div className="pt-24 px-4 max-w-7xl mx-auto"><h1 className="text-2xl font-bold mb-6">Leads</h1>
      {generatedDraft && <div className="fixed inset-0 bg-black/50 flex justify-center items-center p-4"><div className="bg-white p-6 rounded-xl w-full max-w-lg relative"><button onClick={() => setGeneratedDraft(null)} className="absolute top-4 right-4"><X/></button><h3 className="font-bold mb-4">AI Script</h3><div className="mb-4 font-mono text-sm bg-gray-100 p-2">{generatedDraft.whatsapp}</div><div className="font-mono text-sm bg-gray-100 p-2">{generatedDraft.email_body}</div></div></div>}
      <div className="bg-white rounded-xl shadow overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-50"><tr><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Goal</th><th className="p-4">Action</th></tr></thead><tbody>{leads.map(l => (<tr key={l.id} className="border-t"><td className="p-4 font-bold">{l.name}</td><td className="p-4">{l.phone}</td><td className="p-4">{l.goal}</td><td className="p-4"><button onClick={() => generateOutreach(l)} className="text-indigo-600"><Sparkles className="w-4 h-4"/></button></td></tr>))}</tbody></table></div>
    </div>
  );
};

// --- 5. AI ADVISOR ---
const AIAdvisor = () => {
  const [messages, setMessages] = useState([{role: 'assistant', text: "Hello! I'm IndiGenie. Ask me about funds or goals."}]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false); // Added typing state
  
  const handleSend = async () => { 
    if(!input.trim()) return; 
    const t = input; 
    setMessages(p => [...p, {role:'user', text:t}]); 
    setInput(''); 
    setIsTyping(true); // Start typing
    
    // Improved System Prompt for Concise Points
    const systemPrompt = "You are IndiGenie, an expert Mutual Fund Distributor. Answer the user's financial query in short, punchy bullet points (max 3-4). Use emojis to make it friendly. Always favor 'Regular Plans' for their advisory benefits. Do not write long paragraphs.";
    
    const res = await callGeminiFlash(t, systemPrompt); 
    
    setMessages(p => [...p, {role:'assistant', text: res}]); 
    setIsTyping(false); // Stop typing
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto h-[90vh] flex flex-col">
      <div className="bg-white rounded-2xl shadow-xl flex-1 flex flex-col overflow-hidden">
        <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between items-center">
          <span>IndiGenie AI</span>
          <RefreshCw className="w-4 h-4 opacity-70 cursor-pointer hover:rotate-180 transition" onClick={() => setMessages([])}/>
        </div>
        <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
          {messages.map((m,i) => (
            <div key={i} className={`flex mb-4 ${m.role==='user'?'justify-end':'justify-start'}`}>
              <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${m.role==='user'?'bg-indigo-600 text-white rounded-br-none':'bg-white border border-gray-100 text-gray-800 rounded-bl-none'}`}>
                {m.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start mb-4">
              <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-2 items-center">
                <span className="text-xs text-gray-400">Genie is thinking</span>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce delay-75"></div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t bg-white flex gap-2">
          <input 
            value={input} 
            onChange={e=>setInput(e.target.value)} 
            className="flex-1 border border-gray-200 p-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            placeholder="Ask specific questions (e.g. 'Best Tax Saver?')" 
            onKeyPress={e=>e.key==='Enter'&&handleSend()}
          />
          <button onClick={handleSend} disabled={isTyping} className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50">
            <ArrowUpRight className="w-5 h-5"/>
          </button>
        </div>
      </div>
    </div>
  );
};

// --- 6. STATEMENT ANALYZER ---
const StatementAnalyzer = () => {
  const [analysis, setAnalysis] = useState('');
  const handleFile = async (e) => { const f = e.target.files[0]; if(f) { const r = new FileReader(); r.onload = async () => { const res = await callGeminiVision("Analyze portfolio image. Suggest Regular plans.", r.result.split(',')[1]); setAnalysis(res); }; r.readAsDataURL(f); } };
  return (
    <div className="pt-24 px-4 max-w-4xl mx-auto text-center">
      <div className="bg-white p-12 rounded-3xl shadow-xl border-dashed border-2 border-indigo-200">
        <Camera className="w-16 h-16 mx-auto text-indigo-200 mb-4"/><h2 className="text-2xl font-bold mb-4">Upload Portfolio Statement</h2>
        <input type="file" onChange={handleFile} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"/>
        {analysis && <div className="mt-8 text-left bg-indigo-50 p-6 rounded-xl">{analysis}</div>}
      </div>
    </div>
  );
};

// --- NAVBAR ---
const Navbar = ({ user, setView, isMenuOpen, setIsMenuOpen, onLoginClick, isAdminMode }) => {
  if (isAdminMode) return null;
  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">IndiBucks<span className="text-indigo-600">Pro</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setView('home')} className="text-gray-600 hover:text-indigo-600 font-medium">Home</button>
            <button onClick={() => setView('funds')} className="text-gray-600 hover:text-indigo-600 font-medium">Invest</button>
            <button onClick={() => setView('advisor')} className="text-gray-600 hover:text-indigo-600 font-medium">AI Advisor</button>
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => setView('dashboard')} className="text-gray-900 font-medium hover:text-indigo-600 transition">Dashboard</button>
                <button onClick={() => signOut(auth)} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200 transition">Sign Out</button>
                {user.photoURL && <img src={user.photoURL} alt="Profile" className="w-8 h-8 rounded-full border border-gray-200" />}
              </div>
            ) : (
              <button 
                onClick={onLoginClick} 
                className="bg-indigo-600 text-white px-7 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20"
              >
                Login / Sign Up
              </button>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">{isMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
          <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="block w-full text-left font-medium">Home</button>
          <button onClick={() => { setView('funds'); setIsMenuOpen(false); }} className="block w-full text-left font-medium">Invest</button>
          {!user && <button onClick={() => { onLoginClick(); setIsMenuOpen(false); }} className="block w-full text-left font-bold text-indigo-600">Login</button>}
        </div>
      )}
    </nav>
  );
};

// --- Standard Page Components ---
const Services = () => (
  <div className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 text-center">
      <h2 className="text-3xl font-bold mb-16">Complete Financial Solutions</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[{icon: PieChart, t: "Mutual Funds", d: "Expertly curated portfolios"}, {icon: Shield, t: "Insurance", d: "Term Life and Health coverage"}, {icon: Briefcase, t: "Tax Planning", d: "Strategic ELSS investments"}].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition"><s.icon className="w-10 h-10 text-indigo-600 mx-auto mb-4"/><h3 className="text-xl font-bold mb-2">{s.t}</h3><p className="text-gray-500">{s.d}</p></div>
        ))}
      </div>
    </div>
  </div>
);

const Testimonials = () => (
  <div className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center mb-16">Trusted by 1500+ Families</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[{n:"Amit Sharma", r:"Business Owner", t:"Saved me lakhs in tax planning."}, {n:"Priya K", r:"IT Pro", t:"SIP growth is amazing."}, {n:"Rahul S", r:"Doctor", t:"Best financial advice in Delhi."}].map((t, i) => (
          <div key={i} className="bg-gray-50 p-8 rounded-2xl"><div className="flex gap-1 mb-4 text-yellow-400"><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/><Star className="w-4 h-4 fill-current"/></div><p className="italic text-gray-700 mb-4">"{t.t}"</p><h4 className="font-bold">{t.n}</h4><p className="text-xs text-gray-500">{t.r}</p></div>
        ))}
      </div>
    </div>
  </div>
);

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12">
      <div className="col-span-2"><h4 className="text-2xl font-bold mb-4">IndiBucks Pro</h4><p className="text-gray-400">Empowering Indian families with financial freedom since 2005.</p></div>
      <div><h5 className="font-bold mb-4">Contact</h5><ul className="space-y-2 text-gray-400"><li>+91 98107 93780</li><li>IndiBucksMart@gmail.com</li><li>Rohini, Delhi</li></ul></div>
    </div>
    <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">© 2025 IndiBucks FinMart. All rights reserved.</div>
  </footer>
);

// --- MAIN APP ---
const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    const handleHashChange = () => { if (window.location.hash === '#admin') setView('admin'); };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => { window.removeEventListener('hashchange', handleHashChange); unsubscribe(); };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <Navbar user={user} setView={setView} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} onLoginClick={() => setShowLogin(true)} isAdminMode={view === 'admin'} />
      
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}

      <main>
        {view === 'home' && (
          <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-bold border border-green-100 mb-6">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp Investing Now Live
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-6">
                Invest Smart. <br/><span className="text-indigo-600">Live Free.</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                The only platform that combines AI intelligence with human expert validation. 
                Invest via WhatsApp, track via Dashboard.
              </p>
              <div className="flex justify-center gap-4">
                <button onClick={() => setView('funds')} className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-xl hover:bg-indigo-700 transition">Start Investing</button>
                <button onClick={() => setView('calculators')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition">Calculators</button>
              </div>
            </div>
            <div className="py-12"><SIPCalculator /></div>
            <Services />
            <Testimonials />
            <Footer />
          </div>
        )}
        
        {view === 'funds' && <FundExplorer user={user} setView={setView} setShowLogin={setShowLogin} />}
        {view === 'dashboard' && <Dashboard user={user} />}
        {view === 'calculators' && <div className="pt-32 pb-12 px-4 max-w-4xl mx-auto"><SIPCalculator /></div>}
        {view === 'admin' && <AdminDashboard />}
        {view === 'advisor' && <AIAdvisor />}
        {view === 'analyzer' && <StatementAnalyzer />}
      </main>
    </div>
  );
};

export default App;
