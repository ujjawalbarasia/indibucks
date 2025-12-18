import React, { useState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { useGemini } from '../hooks/useGemini';

export const AIAdvisor = () => {
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
            <div className="flex-1 p-6 overflow-y-auto glass-panel border-t-0 border-b-0 bg-white/30 dark:bg-black/20">{messages.map((m, i) => (<div key={i} className={`flex mb-6 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}><div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${m.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white dark:bg-white/10 text-gray-800 dark:text-gray-200 rounded-bl-none border dark:border-white/5 shadow-sm'}`}>{m.text}</div></div>))}{typing && <div className="text-[10px] text-indigo-500 font-bold animate-pulse uppercase">Analyzing Market...</div>}<div ref={scrollRef} /></div>
            <div className="p-4 glass-panel rounded-b-3xl border-t dark:border-white/10 flex gap-4 bg-white/50 dark:bg-white/5"><input aria-label="Ask IndiBuddy a question" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} className="flex-1 bg-gray-100 dark:bg-black/40 border-none p-4 rounded-xl outline-none dark:text-white" placeholder="What are your saving for?" /><button onClick={handleSend} className="w-14 h-14 bg-indigo-600 text-white rounded-xl flex items-center justify-center hover:bg-indigo-700 transition shadow-lg"><Send size={20} /></button></div>
        </div>
    );
};
