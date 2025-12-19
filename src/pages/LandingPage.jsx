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
        <div className="relative pt-20 px-4 max-w-7xl mx-auto flex flex-col items-center justify-center text-center animate-slide-up">

            {/* Massive Hero */}
            <div className="relative z-10 max-w-6xl mx-auto mt-16 mb-24">
                <div className="inline-block px-4 py-2 border border-white/20 rounded-full text-xs font-bold uppercase tracking-widest text-indigo-300 mb-8 glass-panel">
                    ✨ The Future of Investing is Here
                </div>
                <h1 className="text-7xl md:text-9xl font-black mb-8 tracking-tighter leading-[0.9] text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-400">
                    AI-First<br />Financial<br />Intelligence.
                </h1>
                <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-3xl mx-auto font-medium leading-relaxed">
                    IndiBucks Pro replaces your financial advisor with an agent that never sleeps.
                    Start your SIP in {ctaVariant === 'B' ? '2 minutes' : '90 seconds'}.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-6 mb-20">
                    <button onClick={() => {
                        Analytics.track(EVENTS.KYC_STARTED);
                        if (!user || user.isAnonymous) setShowLogin(true); else setView('funds');
                    }} className="btn-primary text-xl px-12 py-6">
                        {ctaVariant === 'B' ? "Invest Now ->" : "Start Experience"}
                    </button>
                    <button onClick={() => {
                        Analytics.track(EVENTS.INDIBUDDY_OPENED);
                        setView('advisor');
                    }} className="btn-secondary text-xl px-12 py-6 flex items-center justify-center gap-3">
                        <Sparkles size={20} className="text-purple-400" /> Talk to IndiBuddy
                    </button>
                </div>

                {/* Trust - Minimalist */}
                <div className="flex justify-center gap-8 mb-32 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    <div className="flex items-center gap-2 font-mono text-xs"><ShieldCheck size={14} /> SECURITY_LEVEL_MAX</div>
                    <div className="flex items-center gap-2 font-mono text-xs"><Landmark size={14} /> BSE_STARMF_CONNECTED</div>
                    <div className="flex items-center gap-2 font-mono text-xs"><Zap size={14} /> ARN_183942_VERIFIED</div>
                </div>
            </div>

            {/* Feature Cards - Datox Style (Dark Glass, Rounded, Clean) */}
            <div className="grid md:grid-cols-3 gap-6 w-full max-w-6xl mb-32">
                <div className="glass-panel p-10 rounded-[2.5rem] text-left hover:bg-white/10 transition duration-500 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Sparkles className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Generative<br />Advisory</h3>
                    <p className="text-gray-400 leading-relaxed">IndiBuddy doesn't just display charts. It explains them. Get real-time answers about tax, goals, and market movements.</p>
                </div>
                <div className="glass-panel p-10 rounded-[2.5rem] text-left hover:bg-white/10 transition duration-500 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <Zap className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Hyper-Fast<br />Execution</h3>
                    <p className="text-gray-400 leading-relaxed">Direct pipe to BSE StAR MF. Orders executed in milliseconds. Mandates approved instantly via UPI.</p>
                </div>
                <div className="glass-panel p-10 rounded-[2.5rem] text-left hover:bg-white/10 transition duration-500 group">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                        <ShieldCheck className="text-white w-8 h-8" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4">Bank-Grade<br />Security</h3>
                    <p className="text-gray-400 leading-relaxed">Your money never touches our accounts. It moves directly from your bank to the Clearing Corporation.</p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto mb-32 w-full">
                <InflationCalculator />
            </div>

            <LandingFAQ />
            <Footer />
        </div>
    );
};
