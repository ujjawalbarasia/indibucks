import React, { useState, useEffect, useRef } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, signOut } from 'firebase/auth';
import { getFirestore, collection, addDoc, query, onSnapshot, serverTimestamp, orderBy } from 'firebase/firestore';
import { 
  TrendingUp, Shield, Zap, User, Menu, X, ChevronRight, Star, 
  Search, PieChart, ArrowUpRight, Briefcase, 
  CheckCircle, Lock, Loader, RefreshCw,
  Camera, Volume2, Phone, Mail, MapPin, Users, Download, Table, Key, Sparkles, MessageCircle, Copy
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
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

// --- Configs ---
const TRACKED_FUNDS = [
  { code: '119598', category: 'ELSS', risk: 'High', benchmark: 'Nifty 500', minInv: 500, tags: ['Tax Saving', 'Long Term'] },
  { code: '125494', category: 'Small Cap', risk: 'Very High', benchmark: 'Nifty Smallcap 250', minInv: 1000, tags: ['High Growth', 'Aggressive'] },
  { code: '122639', category: 'Flexi Cap', risk: 'High', benchmark: 'Nifty 500', minInv: 1000, tags: ['Global Exposure', 'Stable'] },
  { code: '112152', category: 'Mid Cap', risk: 'High', benchmark: 'Nifty Midcap 150', minInv: 500, tags: ['Growth', 'Proven'] },
  { code: '120586', category: 'Large Cap', risk: 'Moderate', benchmark: 'Nifty 100', minInv: 100, tags: ['Bluechip', 'Safe Equity'] },
  { code: '119800', category: 'Liquid', risk: 'Low', benchmark: 'CRISIL Liquid', minInv: 5000, tags: ['Emergency Fund', 'Safe'] },
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

// --- Audio Helper Functions (PCM to WAV) ---
function base64ToArrayBuffer(base64) {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function createWavHeader(dataLength, sampleRate = 24000, numChannels = 1, bitsPerSample = 16) {
  const buffer = new ArrayBuffer(44);
  const view = new DataView(buffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataLength, true);
  writeString(view, 8, 'WAVE');

  // fmt sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true); // NumChannels
  view.setUint32(24, sampleRate, true); // SampleRate
  view.setUint32(28, sampleRate * numChannels * (bitsPerSample / 8), true); // ByteRate
  view.setUint16(32, numChannels * (bitsPerSample / 8), true); // BlockAlign
  view.setUint16(34, bitsPerSample, true); // BitsPerSample

  // data sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataLength, true);

  return buffer;
}

// --- API Helpers (Gemini, BSE, etc) ---
const callGeminiFlash = async (prompt, systemInstruction = "") => {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: systemInstruction }] } })
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

// --- ADMIN DASHBOARD (Hidden) ---
const AdminDashboard = () => {
  const [leads, setLeads] = useState([]);
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draftingId, setDraftingId] = useState(null);
  const [generatedDraft, setGeneratedDraft] = useState(null);
  
  const ADMIN_PIN = "1234";

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      setIsAuthenticated(true);
      fetchLeads();
    } else {
      alert("Invalid PIN");
    }
  };

  const fetchLeads = () => {
    setLoading(true);
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'leads'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });
    return unsubscribe;
  };

  const generateOutreach = async (lead) => {
    setDraftingId(lead.id);
    const prompt = `
      Create a short, professional outreach script for a Mutual Fund Distributor.
      Lead Name: ${lead.name}
      Goal: ${lead.goal}
      Source: ${lead.source || 'Website'}
      
      Output JSON format:
      {
        "whatsapp": "Short informal message with emojis",
        "email_subject": "Catchy subject line",
        "email_body": "Professional email body"
      }
    `;
    
    const result = await callGeminiFlash(prompt, "You are a sales expert.");
    try {
      const cleanJson = result.replace(/```json/g, '').replace(/```/g, '').trim();
      setGeneratedDraft({ id: lead.id, ...JSON.parse(cleanJson) });
    } catch (e) {
      alert("AI generation failed. Try again.");
    } finally {
      setDraftingId(null);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const downloadCSV = () => {
    const headers = "Name,Phone,Goal,Source,Date\n";
    const csvContent = leads.map(l => 
      `${l.name},${l.phone},${l.goal},${l.source || 'Web'},${l.timestamp ? new Date(l.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}`
    ).join("\n");
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "indibucks_leads.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen pt-32 flex items-center justify-center bg-gray-900 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-sm w-full">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Lock className="text-white w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-center mb-2">Restricted Area</h2>
          <p className="text-center text-gray-500 mb-6">IndiBucks Admin Access Only</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input type="password" placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full p-3 border rounded-lg text-center text-xl tracking-widest" autoFocus />
            <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700">Login</button>
          </form>
          <div className="mt-4 text-center">
            <a href="/" className="text-sm text-gray-400 hover:text-gray-600">← Back to Website</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-12 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div><h1 className="text-3xl font-bold text-gray-900">Lead Dashboard</h1></div>
          <button onClick={downloadCSV} className="flex items-center gap-2 bg-green-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-green-700 transition"><Download className="w-4 h-4" /> Export CSV</button>
        </div>
        
        {/* Generated Draft Modal/Card */}
        {generatedDraft && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
              <button onClick={() => setGeneratedDraft(null)} className="absolute top-4 right-4"><X /></button>
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-amber-500" /> AI Outreach Scripts</h3>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase text-green-600 bg-green-50 px-2 py-1 rounded">WhatsApp</span>
                  <button onClick={() => copyToClipboard(generatedDraft.whatsapp)} className="text-xs text-gray-500 flex items-center gap-1 hover:text-indigo-600"><Copy className="w-3 h-3" /> Copy</button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">{generatedDraft.whatsapp}</div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded">Email</span>
                  <button onClick={() => copyToClipboard(`Subject: ${generatedDraft.email_subject}\n\n${generatedDraft.email_body}`)} className="text-xs text-gray-500 flex items-center gap-1 hover:text-indigo-600"><Copy className="w-3 h-3" /> Copy</button>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700">
                  <span className="font-bold block mb-1">Subject: {generatedDraft.email_subject}</span>
                  {generatedDraft.email_body}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Date</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Name</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Phone</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Goal</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="p-4 text-sm text-gray-500">{lead.timestamp ? new Date(lead.timestamp.seconds * 1000).toLocaleDateString() : 'N/A'}</td>
                  <td className="p-4 font-bold text-gray-900">{lead.name}</td>
                  <td className="p-4 text-indigo-600 font-medium font-mono">{lead.phone}</td>
                  <td className="p-4 text-sm"><span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-xs font-bold">{lead.goal}</span></td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => generateOutreach(lead)}
                      disabled={draftingId === lead.id}
                      className="bg-purple-100 text-purple-700 p-2 rounded-lg hover:bg-purple-200 transition"
                      title="Generate AI Outreach"
                    >
                      {draftingId === lead.id ? <Loader className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {leads.length === 0 && !loading && <div className="p-12 text-center text-gray-400">No leads found yet.</div>}
        </div>
      </div>
    </div>
  );
};

// --- Standard App Components ---

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

  if (submitted) return <div className="bg-green-50 p-8 rounded-2xl text-center border border-green-100"><CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-4"/><h3 className="text-xl font-bold">Received!</h3></div>;

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
      <h3 className="text-2xl font-bold text-gray-900 mb-2">Get a Free Portfolio Review</h3>
      <p className="text-gray-500 mb-6 text-sm">Speak to a human expert. No spam, just advice.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div><label className="text-sm font-medium">Name</label><input required className="w-full p-3 border rounded-lg" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}/></div>
        <div><label className="text-sm font-medium">Phone</label><input required type="tel" className="w-full p-3 border rounded-lg" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}/></div>
        <div><label className="text-sm font-medium">Goal</label><select className="w-full p-3 border rounded-lg bg-white" value={formData.goal} onChange={e => setFormData({...formData, goal: e.target.value})}><option>Wealth Creation</option><option>Tax Saving</option><option>Retirement</option></select></div>
        <button disabled={loading} className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold">{loading ? '...' : 'Request Call Back'}</button>
      </form>
    </div>
  );
};

const Footer = () => (
  <footer className="bg-gray-900 text-white pt-16 pb-8">
    <div className="max-w-7xl mx-auto px-4 grid md:grid-cols-4 gap-12 mb-12">
      <div className="col-span-2">
        <div className="flex items-center mb-6">
          <TrendingUp className="text-indigo-400 w-8 h-8 mr-2" />
          <span className="text-2xl font-bold">IndiBucks<span className="text-indigo-400">.ai</span></span>
        </div>
        <p className="text-gray-400 leading-relaxed max-w-sm">Empowering Indian families with financial freedom since 2005.</p>
      </div>
      <div>
        <h5 className="font-bold text-lg mb-6 text-indigo-400">Contact</h5>
        <ul className="space-y-3 text-gray-400">
          <li className="flex gap-2"><Phone className="w-5 h-5"/> +91 98107 93780</li>
          <li className="flex gap-2"><Mail className="w-5 h-5"/> IndiBucksMart@gmail.com</li>
        </ul>
      </div>
    </div>
    <div className="border-t border-gray-800 pt-8 text-center text-gray-500 text-sm">
      <p>© 2025 IndiBucks FinMart. All rights reserved.</p>
    </div>
  </footer>
);

// --- Content Components ---
const Hero = ({ setView }) => (
  <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto">
    <div className="grid md:grid-cols-12 gap-12 items-center">
      <div className="md:col-span-7 space-y-8 animate-fade-in-up">
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-50 text-indigo-700 text-sm font-bold border border-indigo-100">
          <span className="flex h-2 w-2 rounded-full bg-indigo-600 mr-2 animate-pulse"></span> Trusted by 1500+ Families
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight">Invest with <br/><span className="text-indigo-600">Expertise.</span></h1>
        <p className="text-xl text-gray-600 max-w-xl">Don't rely on algorithms alone. Get a dedicated Relationship Manager and AI-powered insights.</p>
        <div className="flex gap-4">
          <button onClick={() => setView('funds')} className="px-8 py-4 bg-gray-900 text-white rounded-xl font-bold">Explore Funds</button>
          <button onClick={() => setView('advisor')} className="px-8 py-4 bg-white text-gray-700 border border-gray-200 rounded-xl font-bold">AI Advisor</button>
        </div>
        {/* RESTORED STATS GRID */}
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

// RESTORED FULL SERVICES GRID
const Services = () => (
  <div className="py-20 bg-gray-50">
    <div className="max-w-7xl mx-auto px-4">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Complete Financial Solutions</h2>
        <p className="text-gray-600 text-lg">We don't just sell funds. We build your financial future.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { icon: PieChart, title: "Mutual Funds", desc: "Expertly curated portfolios combining Equity, Debt, and Hybrid funds tailored to your risk profile." },
          { icon: Shield, title: "Insurance", desc: "Term Life and Health Insurance to protect your family's future against uncertainties." },
          { icon: Briefcase, title: "Tax Planning", desc: "Strategic ELSS investments and tax harvesting to minimize liability and maximize in-hand returns." }
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl transition group">
            <div className="w-14 h-14 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition duration-300">
              <s.icon className="w-7 h-7 text-indigo-600 group-hover:text-white transition duration-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{s.title}</h3>
            <p className="text-gray-500 leading-relaxed">{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// RESTORED FULL TESTIMONIALS
const Testimonials = () => (
  <div className="py-20 bg-white">
    <div className="max-w-7xl mx-auto px-4">
      <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Trusted by 1500+ Families</h2>
      <div className="grid md:grid-cols-3 gap-8">
        {[
          { name: "Amit Sharma", role: "Business Owner", text: "IndiBucks helped me structure my investments to maximize returns while minimizing risk. Their tax planning advice saved me lakhs last year." },
          { name: "Priya Khanna", role: "IT Professional", text: "The SIP recommendations have been perfect for my financial goals. I've seen consistent growth in my portfolio over the past 3 years." },
          { name: "Dr. Rahul Singh", role: "Surgeon", text: "Their comprehensive approach to financial planning covered everything from insurance to retirement. Highly recommend their personalized service." }
        ].map((t, i) => (
          <div key={i} className="bg-gray-50 p-8 rounded-2xl relative">
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 text-yellow-400 fill-current" />)}
            </div>
            <p className="text-gray-700 italic mb-6">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-200 rounded-full flex items-center justify-center font-bold text-indigo-700">
                {t.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-gray-900">{t.name}</h4>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const FundExplorer = ({ user, setView }) => {
  const [funds, setFunds] = useState([]);
  const [selectedFund, setSelectedFund] = useState(null);
  const [investAmount, setInvestAmount] = useState('');
  const [ucc, setUcc] = useState('');
  const [euin, setEuin] = useState('E123456');
  const [processing, setProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);

  useEffect(() => {
    const fetchFunds = async () => {
      const promises = TRACKED_FUNDS.map(async (config) => {
        try {
          const response = await fetch(`https://api.mfapi.in/mf/${config.code}`);
          const data = await response.json();
          if (!data.meta || data.meta.scheme_name.toLowerCase().includes('direct')) return null;
          return { id: config.code, name: data.meta.scheme_name, house: data.meta.fund_house, nav: parseFloat(data.data[0].nav), returns3Y: calculateCAGR(parseFloat(data.data[0].nav), data.data, 3), ...config };
        } catch(e) { return null; }
      });
      const results = await Promise.all(promises);
      setFunds(results.filter(f => f !== null));
    };
    fetchFunds();
  }, []);

  const handleInvest = async () => {
     if (!user) { alert("Please login to place an order."); return; }
     if (!ucc) { alert("Please enter your Client Code (UCC)."); return; }
     
     setProcessing(true);
     try {
       const executionResult = await executeOrderBSE({ fundId: selectedFund.id, amount: parseFloat(investAmount), ucc: ucc, euin: euin });
       
       await addDoc(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), {
          fundId: selectedFund.id, 
          fundName: selectedFund.name, 
          amount: parseFloat(investAmount),
          nav: selectedFund.nav, 
          status: executionResult.success ? 'Placed' : 'Failed', 
          bseOrderId: executionResult.bseOrderId,
          timestamp: serverTimestamp(), 
          type: 'Regular Plan'
       });
       setOrderResult(executionResult);
     } catch (error) {
       console.error("Order Failed:", error);
       alert("Order execution failed. Please check network.");
     } finally {
       setProcessing(false);
     }
  };

  return (
     <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen bg-gray-50">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Top Regular Funds</h2>
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-yellow-50 p-2 rounded-lg border border-yellow-100 w-fit">
            <Shield className="w-4 h-4 text-amber-500" />
            <span>Only <strong>Regular Plans</strong> shown. Direct plans are excluded for your safety & advisory benefits.</span>
          </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6">
           {funds.map(fund => (
              <div key={fund.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-md flex flex-col">
                 <div className="mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md mb-2 inline-block">{fund.category}</span>
                    <h3 className="font-bold text-lg mb-1 leading-tight line-clamp-2">{fund.name}</h3>
                    <p className="text-xs text-gray-400">{fund.house}</p>
                 </div>
                 <div className="grid grid-cols-2 gap-4 mb-4 bg-gray-50 p-3 rounded-lg mt-auto">
                    <div><p className="text-xs text-gray-500">3Y CAGR</p><p className={`text-lg font-bold ${fund.returns3Y > 15 ? 'text-green-600' : 'text-blue-600'}`}>{fund.returns3Y}%</p></div>
                    <div><p className="text-xs text-gray-500">NAV</p><p className="text-lg font-bold text-gray-900">₹{fund.nav}</p></div>
                 </div>
                 <button onClick={() => { setSelectedFund(fund); setOrderResult(null); setInvestAmount(fund.minInv); }} className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-gray-800 transition shadow-lg shadow-gray-900/10">Invest Now</button>
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
                       <p className="text-xs text-gray-500 mb-6 flex items-center gap-1"><Shield className="w-3 h-3"/> Regular Plan • MFD Commission Applied</p>
                       <div className="space-y-4 mb-6">
                         <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">Amount (₹)</label><input type="number" value={investAmount} onChange={e => setInvestAmount(e.target.value)} className="w-full p-3 border rounded-lg text-xl font-bold" min={selectedFund.minInv} /></div>
                         <div className="grid grid-cols-2 gap-4">
                           <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">UCC</label><input placeholder="AB1234" value={ucc} onChange={e => setUcc(e.target.value)} className="w-full p-3 border rounded-lg" /></div>
                           <div><label className="block text-xs font-bold text-gray-500 uppercase mb-1">EUIN</label><input value={euin} onChange={e => setEuin(e.target.value)} className="w-full p-3 border rounded-lg bg-gray-50" /></div>
                         </div>
                       </div>
                       <button onClick={handleInvest} disabled={processing} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2">
                         {processing ? <Loader className="w-5 h-5 animate-spin"/> : `Pay ₹${investAmount}`}
                       </button>
                    </>
                 ) : (
                    <div className="text-center py-6">
                       <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4"/>
                       <h3 className="text-2xl font-bold mb-2">Order Executed!</h3>
                       <p className="text-gray-600 mb-2">BSE Order ID: <span className="font-mono bg-gray-100 px-2 rounded">{orderResult.bseOrderId}</span></p>
                       <button onClick={() => setSelectedFund(null)} className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold mt-4">Close</button>
                    </div>
                 )}
              </div>
           </div>
        )}
     </div>
  );
};

const Dashboard = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [aiInsight, setAiInsight] = useState(null);
  const [insightLoading, setInsightLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'users', user.uid, 'orders'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(ordersData);
      setTotalValue(ordersData.reduce((acc, curr) => acc + (curr.amount || 0), 0));
    });
    return () => unsubscribe();
  }, [user]);

  const generatePortfolioInsight = async () => {
    setInsightLoading(true);
    const portfolioSummary = orders.map(o => `${o.fundName}: ₹${o.amount}`).join(', ');
    const prompt = `
      Analyze this portfolio: [${portfolioSummary}].
      Give 2 specific sentences of advice on diversification and risk.
      Keep it encouraging but realistic.
    `;
    const result = await callGeminiFlash(prompt, "You are a senior portfolio manager.");
    setAiInsight(result);
    setInsightLoading(false);
  };

  return (
    <div className="pt-24 pb-12 px-4 max-w-7xl mx-auto min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
          <Briefcase className="w-4 h-4" /> Regular Plans
        </div>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-indigo-600 to-blue-700 text-white p-6 rounded-2xl shadow-xl shadow-indigo-600/20">
          <p className="text-indigo-100 text-sm mb-1">Current Valuation</p>
          <h2 className="text-4xl font-bold">₹ {(totalValue * 1.05).toLocaleString()}</h2>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
           <p className="text-gray-500 text-sm mb-1">Total Invested</p>
           <h2 className="text-3xl font-bold text-gray-900">₹ {totalValue.toLocaleString()}</h2>
        </div>
        
        {/* New AI Feature in Dashboard */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center">
          {!aiInsight ? (
            <button 
              onClick={generatePortfolioInsight} 
              disabled={orders.length === 0 || insightLoading}
              className="w-full h-full flex flex-col items-center justify-center text-center gap-2 text-indigo-600 font-bold hover:bg-indigo-50 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {insightLoading ? <Loader className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              {insightLoading ? 'Analyzing...' : 'Get AI Portfolio Insight'}
            </button>
          ) : (
            <div className="text-sm text-gray-700 overflow-y-auto max-h-24">
              <div className="font-bold text-indigo-600 mb-1 flex items-center gap-1"><Sparkles className="w-3 h-3"/> AI Insight:</div>
              {aiInsight}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {orders.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {orders.map(order => (
              <div key={order.id} className="p-5 flex justify-between items-center hover:bg-gray-50">
                <div><h4 className="font-bold text-gray-900">{order.fundName}</h4><p className="text-xs text-gray-400">Order: {order.bseOrderId || 'Pending'}</p></div>
                <div className="text-right"><p className="font-bold text-gray-900">₹{order.amount}</p><span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">{order.status}</span></div>
              </div>
            ))}
          </div>
        ) : <div className="p-12 text-center text-gray-500">No active investments found.</div>}
      </div>
    </div>
  );
};

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
      // Convert PCM base64 to Wav Blob for playback
      const pcmBuffer = base64ToArrayBuffer(audioBase64);
      const wavHeader = createWavHeader(pcmBuffer.byteLength, 24000); 
      const wavBlob = new Blob([wavHeader, pcmBuffer], { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(wavBlob);
      
      const audio = new Audio(audioUrl);
      audio.play();
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

const App = () => {
  const [view, setView] = useState('home');
  const [user, setUser] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // --- HIDDEN ROUTE LOGIC ---
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setView('admin');
      } else if (view === 'admin' && window.location.hash !== '#admin') {
        setView('home'); // Go back home if hash removed
      }
    };

    // Check on initial load
    handleHashChange();

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => setUser(currentUser));
    return () => unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 selection:bg-indigo-100">
      <Navbar user={user} setView={setView} isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} isAdminMode={view === 'admin'} />
      <main>
        {view === 'home' && <><Hero setView={setView} /><Services /><Testimonials /><Footer /></>}
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
