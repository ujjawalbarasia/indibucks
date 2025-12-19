import React, { useContext } from 'react';
import { Sparkles, ShieldCheck, Landmark, Zap } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { InflationCalculator } from '../components/widgets/Widgets';
import { LandingFAQ, Footer } from '../components/ui/Footer';
import { Analytics, EVENTS } from '../services/analytics';
import { useExperiment } from '../hooks/useExperiment';

export const LandingPage = () => {
    const { setShowLogin, user, setView } = useContext(AppContext);
    const ctaVariant = useExperiment('KYC_CTA_TEXT', ['A', 'B']);

    return (
        <div className="pt-32 pb-20 px-4 max-w-7xl mx-auto text-center relative overflow-hidden animate-slide-up">
            <div className="relative z-10 max-w-5xl mx-auto">
                <h1 className="text-6xl md:text-8xl font-black mb-8 tracking-tighter text-gray-900 dark:text-white leading-tight">AI-First Mutual Fund Investing</h1>
                <p className="text-xl md:text-2xl text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto font-medium">Answer 3 questions. Get a personalised plan. Start SIP in under 90 seconds.</p>
                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-12 stagger-3">
                    <button onClick={() => {
                        Analytics.track(EVENTS.KYC_STARTED);
                        if (!user || user.isAnonymous) setShowLogin(true); else setView('funds');
                    }} className="px-10 py-5 bg-indigo-600 text-white rounded-full font-bold text-lg hover:scale-105 transition shadow-xl">
                        {ctaVariant === 'B' ? "Invest in 2 Minutes" : "Start KYC — 90s & Paperless"}
                    </button>
                    <button onClick={() => {
                        Analytics.track(EVENTS.INDIBUDDY_OPENED);
                        setView('advisor');
                    }} className="px-10 py-5 glass-panel rounded-full font-bold text-lg text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition flex items-center justify-center gap-3"><Sparkles size={20} className="text-indigo-500" /> Get Your AI Plan — 60s</button>
                </div>
                <div className="flex justify-center gap-8 mb-24 opacity-80 font-bold text-xs text-gray-500 dark:text-gray-400 flex-wrap">
                    <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-green-500" /> Secure Paperless KYC – Aadhaar/Video</div>
                    <div className="flex items-center gap-2"><Landmark size={16} className="text-indigo-500" /> Powered By BSE StAR-MF API</div>
                    <div className="flex items-center gap-2"><Zap size={16} className="text-orange-500" /> AMFI Registered Distributor (ARN-183942)</div>
                </div>
                <InflationCalculator />
                <LandingFAQ />
                <Footer />
            </div>
        </div>
    );
};
