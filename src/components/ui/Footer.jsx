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
        <div className="text-[10px] space-y-2 max-w-2xl mx-auto mb-6 opacity-70">
            <p>Mutual Fund investments are subject to market risks, read all scheme related documents carefully. Past performance is not indicative of future returns.</p>
            <p>IndiBucks Fintech Pvt Ltd is an AMFI Registered Mutual Fund Distributor (ARN-183942). Date of initial registration: 12/05/2023. Current validity: 11/05/2026.</p>
            <p><strong>Grievance Officer:</strong> Mr. Rahul Verma | Email: grievance@indibucks.com | Phone: +91-22-67891234. Address: 402, Trade Centre, BKC, Mumbai - 400051.</p>
            <p>Investments in securities market are subject to market risks. Read all the related documents carefully before investing.</p>
        </div>
        <div className="text-[10px] font-mono">© 2024 IndiBucks Fintech Pvt Ltd • ARN-183942</div>
    </footer>
);
