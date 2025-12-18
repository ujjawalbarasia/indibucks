import React, { useState } from 'react';
import { Command } from 'lucide-react';

export const IndiCommand = ({ onExecute }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    return (
        <>
            <button onClick={() => setIsOpen(!isOpen)} className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110 shadow-indigo-500/40"><Command size={24} /></button>
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-80 glass-panel p-4 rounded-2xl animate-slide-up bg-white dark:bg-black/90 border dark:border-white/10 shadow-2xl">
                    <input autoFocus className="w-full bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 text-sm p-2" placeholder="Type command (e.g. 'funds')..." value={input} onChange={e => setInput(e.target.value)} onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            if (input.toLowerCase().includes('dashboard')) onExecute({ type: 'NAVIGATE', payload: { target: 'dashboard' } });
                            else if (input.toLowerCase().includes('funds')) onExecute({ type: 'NAVIGATE', payload: { target: 'funds' } });
                            else if (input.toLowerCase().includes('home')) onExecute({ type: 'NAVIGATE', payload: { target: 'home' } });
                            setInput(''); setIsOpen(false);
                        }
                    }} />
                </div>
            )}
        </>
    );
};
