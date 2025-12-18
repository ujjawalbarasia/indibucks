import React, { useContext } from 'react';
import { Sparkles, ShieldCheck, Landmark, Zap } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { InflationCalculator } from '../components/widgets/Widgets';
import { LandingFAQ, Footer } from '../components/ui/Footer';

export const LandingPage = () => {
    const { setShowLogin, user, setView } = useContext(AppContext);
    return (
        <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center relative overflow-hidden animate-slide-up">
            <div className="relative z-10 max-w-5xl mx-auto">
                <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gray-900 dark:text-white leading-tight">Start SIPs in 90s — AI-guided & paperless.</h1>
                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium">Goal-based plans, Aadhaar/Video KYC, UPI AutoPay. Start from ₹100.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12 stagger-3">
                    <button onClick={() => { if (!user || user.isAnonymous) setShowLogin(true); else setView('funds'); }} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-lg hover:scale-105 transition shadow-xl">Start KYC — 90s</button>
                    <button onClick={() => setView('advisor')} className="px-10 py-5 glass-panel rounded-full font-bold text-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center justify-center gap-3"><Sparkles size={20} className="text-indigo-500" /> Try IndiBuddy — 60s demo</button>
                </div>
                <div className="flex justify-center gap-8 mb-24 opacity-80 font-bold text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> Paperless eKYC</div>
                    <div className="flex items-center gap-2"><Landmark size={16} className="text-indigo-500" /> BSE StarMF Partner</div>
                    <div className="flex items-center gap-2"><Zap size={16} className="text-orange-500" /> UPI AutoPay</div>
                </div>
                <InflationCalculator />
                <LandingFAQ />
                <Footer />
            </div>
        </div>
    );
};
