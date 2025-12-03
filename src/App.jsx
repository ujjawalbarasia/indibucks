import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { 
  TrendingUp, Shield, Zap, User, Menu, X, ChevronRight, Star, 
  Search, PieChart, ArrowUpRight, Briefcase, 
  CheckCircle, Lock, Loader, RefreshCw,
  Camera, Volume2, Phone, Mail, MapPin, Users, Download, Table, Key, Sparkles, MessageCircle, Copy, Mic, Calculator, ArrowLeftRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, BarChart, Bar
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

// --- Utilities ---
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

// --- Audio Helper Functions (For AI Voice) ---
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);
  const writeString = (view, offset, string) => {
    for (let i = 0; i < string.length; i++) view.setUint8(offset + i, string.charCodeAt(i));
  };

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); 
  view.setUint16(20, 1, true); 
  view.setUint16(22, numChannels, true); 
  view.setUint32(24, sampleRate, true); 
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); 
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); 
  view.setUint16(34, bitsPerSample, true); 
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  return buffer;
}

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

// --- COMPONENTS ---

// 1. Lead Capture Form
const LeadForm = () => {
  const [formData, setFormData] = useState({ name: '', phone: '', goal: 'Wealth Creation' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), { ...formData, timestamp: serverTimestamp(), source: 'Homepage Widget' });
      setSubmitted(true);
    } catch (err) { alert("Error."); } finally { setLoading(false); }
  };

  if (submitted) return <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-100 shadow-sm"><CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4"/><h3 className="text-xl font-bold">Request Received!</h3><p className="text-gray-600">Our advisor will call you shortly.</p></div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Get a Free Portfolio Review</h3>
      <p className="text-gray-500 mb-6 text-sm">Speak to a human expert. No spam.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="text-sm font-medium">Name</label><input required className="w-full p-3 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div>
        <div><label className="text-sm font-medium">Phone</label><input required type="tel" className="w-full p-3 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
        <div><label className="text-sm font-medium">Goal</label><select className="w-full p-3 border rounded-lg bg-white" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}><option>Wealth Creation</option><option>Tax Saving</option><option>Retirement</option></select></div>
        <button disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold">{loading ? '...' : 'Request Call Back'}</button>
      </form>
    </div>
  );
};

// 2. SIP Calculator
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

// 3. AI Advisor (Full)
const AIAdvisor = ({ user }) => {
  const [messages, setMessages] = useState([{ role: 'assistant', text: "Namaste! I am IndiGenie. How can I help you today?" }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);
    const aiText = await callGeminiFlash(userText, "You are an MFD expert. Sell Regular plans. Keep it short.");
    setMessages(prev => [...prev, { role: 'assistant', text: aiText || "Error." }]);
    setIsTyping(false);
  };

  const handleSpeak = async (text) => {
    const audioBase64 = await callGeminiTTS(text);
    if (audioBase64) {
      const pcmBuffer = base64ToArrayBuffer(audioBase64);
      const wavHeader = createWavHeader(pcmBuffer.byteLength, 24000); 
      const wavBlob = new Blob([wavHeader, pcmBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(wavBlob);
      const audio = new Audio(audioUrl);
      audio.play().catch(e => console.log("Audio play failed:", e));
    }
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto h-[90vh] flex flex-col">
       <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden flex-1 flex flex-col">
          <div className="bg-indigo-600 p-4 text-white font-bold flex justify-between">
             <span>IndiGenie AI</span>
             <button onClick={() => setMessages([])}><RefreshCw className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 p-6 overflow-y-auto bg-slate-50" ref={scrollRef}>
             {messages.map((msg, idx) => (
                <div key={idx} className={`flex mb-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                   <div className={`p-4 rounded-2xl max-w-[85%] relative group ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-200'}`}>
                     {msg.text}
                     {msg.role === 'assistant' && (
                        <button onClick={() => handleSpeak(msg.text)} className="absolute -right-8 top-1 bg-gray-200 rounded-full p-1 opacity-0 group-hover:opacity-100"><Volume2 className="w-3 h-3 text-gray-600"/></button>
                     )}
                   </div>
                </div>
             ))}
             {isTyping && <div className="text-xs text-gray-500 p-4">Thinking...</div>}
          </div>
          <div className="p-4 border-t border-gray-100 flex gap-2">
             <input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} placeholder="Ask something..." className="flex-1 p-3 border rounded-xl" />
             <button onClick={handleSend} className="bg-indigo-600 text-white p-3 rounded-xl"><ArrowUpRight/></button>
          </div>
       </div>
    </div>
  );
};

// 4. Statement Analyzer (Full)
const StatementAnalyzer = () => {
  const [image, setImage] = useState(null);
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setImage(reader.result); setAnalysis(''); };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!image) return;
    setLoading(true);
    const base64Data = image.split(',')[1];
    const prompt = `Identify mutual funds in this image. Explain why switching to IndiBucks Regular Plans is better. Suggest replacements.`;
    const result = await callGeminiVision(prompt, base64Data);
    setAnalysis(result || "Could not analyze.");
    setLoading(false);
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-4xl mx-auto min-h-screen">
       <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          <div className="bg-purple-600 p-8 text-white text-center">
             <Camera className="w-12 h-12 mx-auto mb-4" />
             <h1 className="text-3xl font-bold">Snap & Switch</h1>
          </div>
          <div className="p-8">
             {!image ? (
                <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:bg-gray-50">
                   <p className="text-gray-500">Click to upload statement</p>
                   <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                </div>
             ) : (
                <div className="space-y-6">
                   <img src={image} className="w-full max-h-64 object-cover rounded-xl" />
                   {!analysis ? (
                      <button onClick={analyzeImage} disabled={loading} className="w-full bg-purple-600 text-white py-3 rounded-lg font-bold">{loading ? 'Analyzing...' : 'Analyze'}</button>
                   ) : (
                      <div className="bg-purple-50 p-6 rounded-xl whitespace-pre-wrap text-sm">{analysis}</div>
                   )}
                </div>
             )}
          </div>
       </div>
    </div>
  );
};

// 5. Fund Explorer with Voice & WhatsApp
const FundExplorer = ({ user, setView }) => {
  const [funds, setFunds] = useState([]);
  const [filteredFunds, setFilteredFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [investAmount, setInvestAmount] = useState('');
  const [ucc, setUcc] = useState('');
  const [orderResult, setOrderResult] = useState(null);

  const handleVoiceCommand = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert("Voice search not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    
    setIsListening(true);
    recognition.start();

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.toLowerCase();
      setIsListening(false);
      if (transcript.includes("tax")) {
        setFilteredFunds(funds.filter(f => f.category === 'ELSS'));
      } else if (transcript.includes("risk") && transcript.includes("high")) {
        setFilteredFunds(funds.filter(f => f.risk.includes('High')));
      } else if (transcript.includes("safe") || transcript.includes("liquid")) {
        setFilteredFunds(funds.filter(f => f.category === 'Liquid' || f.category === 'Large Cap'));
      } else {
        alert(`Heard: "${transcript}". Try saying "Show Tax Saving funds"`);
      }
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
  };

  useEffect(() => {
    const fetchFunds = async () => {
      const promises = TRACKED_FUNDS.map(async (config) => {
        try {
          const response = await fetch(`https://api.mfapi.in/mf/${config.code}`);
          const data = await response.json();
          if (!data.meta) return null;
          return {
            id: config.code, name: data.meta.scheme_name, house: data.meta.fund_house, nav: parseFloat(data.data[0].nav), returns3Y: calculateCAGR(parseFloat(data.data[0].nav), data.data, 3), ...config
          };
        } catch(e) { return null; }
      });
      const results = await Promise.all(promises);
      const validFunds = results.filter(f => f !== null);
      setFunds(validFunds);
      setFilteredFunds(validFunds);
    };
    fetchFunds();
  }, []);

  const handleWhatsAppInvest = () => {
    const text = `Hi, I want to invest in *${selectedFund.name}* (Regular Plan).\nAmount: ₹${investAmount}\nMy Client Code: ${ucc || 'Pending'}\nPlease execute this order.`;
    const url = `https://wa.me/919810793780?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    if (user) {
      addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), { fundId: selectedFund.id, fundName: selectedFund.name, amount: parseFloat(investAmount), status: 'WhatsApp Intent', timestamp: serverTimestamp(), type: 'Regular Plan' });
    }
    setSelectedFund(null);
  };

  const toggleCompare = (fund) => {
    if (compareList.find(f => f.id === fund.id)) {
      setCompareList(compareList.filter(f => f.id !== fund.id));
    } else {
      if (compareList.length >= 2) { alert("You can compare max 2 funds."); return; }
      setCompareList([...compareList, fund]);
    }
  };

  return (
     <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen bg-gray-50">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div><h2 className="text-3xl font-bold text-gray-900">Explore Top Funds</h2><p className="text-gray-500 text-sm mt-1">Curated Regular Plans for long-term wealth.</p></div>
          <button onClick={handleVoiceCommand} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition shadow-lg ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-indigo-600 border border-indigo-100 hover:bg-indigo-50'}`}><Mic className="w-5 h-5" />{isListening ? 'Listening...' : 'Voice Search (AI)'}</button>
        </div>

        {compareList.length > 0 && (
          <div className="bg-indigo-900 text-white p-4 rounded-xl mb-8 flex justify-between items-center shadow-xl">
            <div className="flex gap-4">{compareList.map(f => (<div key={f.id} className="flex items-center gap-2 bg-indigo-800 px-3 py-1 rounded-lg"><span className="text-sm font-medium">{f.name.substring(0, 15)}...</span><button onClick={() => toggleCompare(f)}><X className="w-4 h-4 text-indigo-300 hover:text-white"/></button></div>))}</div>
            {compareList.length === 2 && (<div className="flex items-center gap-4"><div className="text-right text-xs text-indigo-300"><p>Returns: {compareList[0].returns3Y}% vs {compareList[1].returns3Y}%</p><p>Risk: {compareList[0].risk} vs {compareList[1].risk}</p></div><button className="bg-white text-indigo-900 px-4 py-2 rounded-lg font-bold text-sm">Full Compare</button></div>)}
          </div>
        )}
        
        <div className="grid md:grid-cols-3 gap-6">
           {filteredFunds.map(fund => (
              <div key={fund.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-md hover:shadow-lg transition flex flex-col group">
                 <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md">{fund.category}</span>
                    <button onClick={() => toggleCompare(fund)} className={`p-1.5 rounded-full transition ${compareList.find(f => f.id === fund.id) ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400 hover:bg-gray-200'}`} title="Compare"><ArrowLeftRight className="w-4 h-4" /></button>
                 </div>
                 <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2 group-hover:text-indigo-600 transition">{fund.name}</h3>
                 <p className="text-xs text-gray-400 mb-4">{fund.house}</p>
                 <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded-lg mt-auto">
                    <div><p className="text-xs text-gray-500">3Y CAGR</p><p className={`text-lg font-bold ${fund.returns3Y > 15 ? 'text-green-600' : 'text-blue-600'}`}>{fund.returns3Y}%</p></div>
                    <div><p className="text-xs text-gray-500">Risk</p><p className="text-sm font-bold text-gray-700">{fund.risk}</p></div>
                 </div>
                 <button onClick={() => { setSelectedFund(fund); setOrderResult(null); setInvestAmount(fund.minInv); }} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2">Invest Now <ChevronRight className="w-4 h-4" /></button>
              </div>
           ))}
        </div>

        {selectedFund && (
           <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="bg-white p-6 rounded-2xl w-full max-w-md relative animate-fade-in-up">
                 <button onClick={() => setSelectedFund(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X/></button>
                 {!orderResult ? (
                    <>
                       <h3 className="text-xl font-bold mb-1">Invest in {selectedFund.name}</h3>
                       <p className="text-xs text-gray-500 mb-6 flex items-center gap-1"><Shield className="w-3 h-3 text-green-600"/> Regular Plan • Expert Support Included</p>
                       <div className="space-y-4 mb-6">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label><input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} className="w-full p-3 border rounded-lg text-xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none" min={selectedFund.minInv} /></div>
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Client Code (UCC)</label><input type="text" placeholder="For Existing Clients" value={ucc} onChange={e => setUcc(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
                       </div>
                       <div className="space-y-3">
                         <button onClick={handleWhatsAppInvest} className="w-full bg-green-500 text-white py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:bg-green-600 transition shadow-lg shadow-green-500/20"><MessageCircle className="w-5 h-5" /> Invest via WhatsApp</button>
                       </div>
                    </>
                 ) : ( null )}
              </div>
           </div>
        )}
     </div>
  );
};

// 6. Admin Dashboard (Hidden)
const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draftingId, setDraftingId] = useState(null);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  const ADMIN_PIN = "1234";

  const handleLogin = (e) => { e.preventDefault(); if (pin === ADMIN_PIN) { setIsAuthenticated(true); fetchLeads(); } else { alert("Invalid PIN"); } };
  const fetchLeads = () => { setLoading(true); const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), orderBy('timestamp', 'desc')); const unsubscribe = onSnapshot(q, (snapshot) => { setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))); setLoading(false); }); return unsubscribe; };
  const generateOutreach = async (lead) => {
    setDraftingId(lead.id);
    const prompt = `Create a short outreach script. Lead: ${lead.name}, Goal: ${lead.goal}. Output JSON: { "whatsapp": "msg", "email_subject": "sub", "email_body": "body" }`;
    const result = await callGeminiFlash(prompt, "Sales expert", true);
    try {
      if (!result) throw new Error("No result");
      const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim(); 
      setGeneratedDraft({ id: lead.id, ...JSON.parse(cleanJson) }); 
    } catch (e) { alert("AI Failed"); } finally { setDraftingId(null); }
  };
  const downloadCSV = () => { const headers = "Name,Phone,Goal,Date\n"; const csvContent = leads.map(l => `${l.name},${l.phone},${l.goal},${l.timestamp ? new Date(l.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}`).join("\n"); const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' }); const link = document.createElement("a"); const url = URL.createObjectURL(blob); link.setAttribute("href", url); link.setAttribute("download", "leads.csv"); document.body.appendChild(link); link.click(); document.body.removeChild(link); };

  if (!isAuthenticated) return <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-900 px-4"><div className="bg-white p-8 rounded-2xl max-w-sm w-full"><h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2><form onSubmit={handleLogin}><input type="password" placeholder="PIN" value={pin} onChange={e => setPin(e.target.value)} className="w-full p-3 border rounded-lg mb-4 text-center" autoFocus/><button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Login</button></form></div></div>;

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-12 px-4"><div className="max-w-7xl mx-auto"><div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold">Lead Dashboard</h1><button onClick={downloadCSV} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold">Export CSV</button></div>
    {generatedDraft && <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl max-w-lg w-full p-6 relative"><button onClick={() => setGeneratedDraft(null)} className="absolute top-4 right-4"><X/></button><h3 className="font-bold mb-4">AI Scripts</h3><div className="mb-4"><p className="text-xs font-bold text-green-600">WhatsApp</p><div className="bg-gray-50 p-3 rounded">{generatedDraft.whatsapp}</div></div><div><p className="text-xs font-bold text-blue-600">Email</p><div className="bg-gray-50 p-3 rounded"><span className="font-bold block">Sub: {generatedDraft.email_subject}</span>{generatedDraft.email_body}</div></div></div></div>}
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden"><table className="w-full text-left"><thead className="bg-gray-100"><tr><th className="p-4">Date</th><th className="p-4">Name</th><th className="p-4">Phone</th><th className="p-4">Goal</th><th className="p-4 text-right">AI</th></tr></thead><tbody>{leads.map(l => (<tr key={l.id} className="hover:bg-gray-50"><td className="p-4 text-sm">{l.timestamp ? new Date(l.timestamp.seconds * 1000).toLocaleDateString() : '-'}</td><td className="p-4 font-bold">{l.name}</td><td className="p-4 text-indigo-600">{l.phone}</td><td className="p-4"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-bold">{l.goal}</span></td><td className="p-4 text-right"><button onClick={() => generateOutreach(l)} className="text-purple-600 hover:bg-purple-50 p-2 rounded"><Sparkles className="w-4 h-4"/></button></td></tr>))}</tbody></table></div></div></div>
  );
};

// 7. Live Dashboard
const Dashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({ invested: 0, current: 0 });
  const [aiInsight, setAiInsight] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      let invested = 0, current = 0;
      ordersData.forEach(o => { if (o.status !== 'Failed') { invested += o.amount; current += o.amount * 1.08; } });
      setStats({ invested, current });
    });
    return () => unsubscribe();
  }, [user]);

  const generatePortfolioInsight = async () => {
    const summary = orders.map(o => `${o.fundName}: ₹${o.amount}`).join(', ');
    const result = await callGeminiFlash(`Analyze portfolio: [${summary}]. Brief advice.`);
    setAiInsight(result);
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <h1 className="text-3xl font-bold mb-8">My Portfolio</h1>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg"><p className="text-indigo-200 text-sm">Current Value</p><h2 className="text-4xl font-bold">₹ {Math.round(stats.current).toLocaleString()}</h2></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100"><p className="text-gray-500 text-sm">Invested</p><h2 className="text-3xl font-bold">₹ {stats.invested.toLocaleString()}</h2></div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">{!aiInsight ? <button onClick={generatePortfolioInsight} className="text-indigo-600 font-bold flex items-center gap-2 justify-center"><Sparkles className="w-5 h-5"/> AI Insight</button> : <div className="text-sm h-24 overflow-y-auto">{aiInsight}</div>}</div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"><h3 className="font-bold mb-4">Transactions</h3>{orders.map(o => (<div key={o.id} className="flex justify-between border-b border-gray-50 pb-4 mb-4"><div><h4 className="font-bold text-sm">{o.fundName}</h4><p className="text-xs text-gray-400">{new Date(o.timestamp?.seconds * 1000).toLocaleDateString()}</p></div><div className="text-right"><p className="font-bold">₹{o.amount}</p><span className="text-xs text-green-600">{o.status}</span></div></div>))}</div>
    </div>
  );
};

// 8. Standard Page Components (Restored)
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

const Hero = ({ setView }) => (
  <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
    <div className="grid md:grid-cols-12 gap-12 items-center">
      <div className="md:col-span-7 space-y-8 animate-fade-in-up">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100"><span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span> WhatsApp Investing Live 🚀</div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">Invest with <br/><span className="text-indigo-600">Expertise.</span></h1>
        <p className="text-xl text-gray-600 max-w-xl">Don't rely on algorithms alone. Get a dedicated Relationship Manager and AI-powered insights.</p>
        <div className="flex gap-4">
          <button onClick={() => setView('funds')} className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold">Explore Funds</button>
          <button onClick={() => setView('advisor')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold">AI Advisor</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-8 border-t border-gray-100">
          <div><h4 className="text-3xl font-bold text-gray-900">₹250Cr+</h4><p className="text-gray-500 text-sm">Assets Managed</p></div>
          <div><h4 className="text-3xl font-bold text-gray-900">20+</h4><p className="text-gray-500 text-sm">Years Experience</p></div>
          <div><h4 className="text-3xl font-bold text-gray-900">Zero</h4><p className="text-gray-500 text-sm">Hidden Fees</p></div>
        </div>
      </div>
      <div className="md:col-span-5 relative"><LeadForm /></div>
    </div>
  </div>
);

const Navbar = ({ user, setView, isMenuOpen, setIsMenuOpen, isAdminMode }) => {
  if (isAdminMode) return null;
  return (
    <nav className="fixed w-full z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center cursor-pointer group" onClick={() => setView('home')}>
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition">
              <TrendingUp className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">IndiBucks<span className="text-indigo-600">.ai</span></span>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <button onClick={() => setView('home')} className="text-gray-600 hover:text-indigo-600 font-medium">Home</button>
            <button onClick={() => setView('funds')} className="text-gray-600 hover:text-indigo-600 font-medium">Invest</button>
            <button onClick={() => setView('analyzer')} className="text-gray-600 hover:text-indigo-600 font-medium">Analyzer</button>
            <button onClick={() => setView('advisor')} className="text-gray-600 hover:text-indigo-600 font-medium">AI Advisor</button>
            {user ? (
              <div className="flex items-center gap-4">
                <button onClick={() => setView('dashboard')} className="text-gray-900 font-medium">Dashboard</button>
                <button onClick={() => signOut(auth)} className="bg-gray-100 text-gray-700 px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-gray-200">Sign Out</button>
              </div>
            ) : (
              <button onClick={() => signInAnonymously(auth)} className="bg-indigo-600 text-white px-7 py-2.5 rounded-full text-sm font-semibold hover:bg-indigo-700 shadow-lg shadow-indigo-600/20">Get Started</button>
            )}
          </div>
          <div className="md:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-600 p-2">{isMenuOpen ? <X /> : <Menu />}</button>
          </div>
        </div>
      </div>
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 p-4 space-y-4 shadow-xl">
          <button onClick={() => { setView('home'); setIsMenuOpen(false); }} className="block w-full text-left py-2 font-medium">Home</button>
          <button onClick={() => { setView('funds'); setIsMenuOpen(false); }} className="block w-full text-left py-2 font-medium">Funds</button>
        </div>
      )}
    </nav>
  );
};

const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('admin');
      } else if (view === 'admin' && window.location.hash !== '#admin') {
        setView('home');
      }
    };
    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => { window.removeEventListener('hashchange', handleHashChange); unsubscribe(); };
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-indigo-100">
      <Navbar user={user} setView={setView} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isAdminMode={view === 'admin'} />
      <main>
        {view === 'home' && <><Hero setView={setView} /><div className="py-12 bg-gray-50"><div className="max-w-4xl mx-auto px-4"><SIPCalculator /></div></div><Services /><Testimonials /><Footer /></>}
        {view === 'funds' && <FundExplorer user={user} setView={setView} />}
        {view === 'analyzer' && <StatementAnalyzer />}
        {view === 'advisor' && <AIAdvisor user={user} />}
        {view === 'dashboard' && <Dashboard user={user} />}
        {view === 'admin' && <AdminDashboard />}
      </main>
    </div>
  );
};

export default App;

