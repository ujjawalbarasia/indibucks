import React, { useState } from 'react';
import { CONSTANTS } from '../../utils/constants';

export const LandingFAQ = () => {
    const [open, setOpen] = useState(null);
    return (
        <div className="max-w-3xl mx-auto mb-24 text-left">
            <h2 className="text-3xl font-black text-center mb-12 dark:text-white">Doubts? Cleared.</h2>
            <div className="space-y-4">
                {CONSTANTS.FAQS.map((f, i) => (
                    <div key={i} className="glass-panel rounded-2xl overflow-hidden cursor-pointer bg-white/50 dark:bg-white/5" onClick={() => setOpen(open === i ? null : i)}>
                        <div className="p-6 font-bold flex justify-between items-center dark:text-white">{f.q} <span>{open === i ? '−' : '+'}</span></div>
                        {open === i && <div className="px-6 pb-6 text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{f.a}</div>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Footer = () => (
    <footer className="border-t border-gray-200 dark:border-white/10 pt-16 pb-8 text-center opacity-60">
        <div className="grid md:grid-cols-4 gap-8 mb-12 text-left max-w-5xl mx-auto">
            <div><h4 className="font-black mb-4 dark:text-white">IndiBucks</h4><p className="text-xs">Democratizing wealth for 1.4 Billion Indians.</p></div>
            <div><h4 className="font-bold mb-4 dark:text-white">Legal</h4><ul className="text-xs space-y-2"><li>Privacy Policy</li><li>Terms of Service</li><li>AMFI Disclosures</li></ul></div>
            <div><h4 className="font-bold mb-4 dark:text-white">Company</h4><ul className="text-xs space-y-2"><li>About Us</li><li>Careers</li><li>Press</li></ul></div>
            <div><h4 className="font-bold mb-4 dark:text-white">Connect</h4><ul className="text-xs space-y-2"><li>Twitter</li><li>LinkedIn</li><li>Instagram</li></ul></div>
        </div>
        <p className="text-[10px] mb-2 max-w-2xl mx-auto">Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past performance is not indicative of future returns.</p>
        <div className="text-[10px] font-mono">© 2024 IndiBucks Fintech Pvt Ltd • ARN-183942</div>
    </footer>
);
