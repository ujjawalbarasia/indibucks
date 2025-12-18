import React from 'react';
import { CONSTANTS } from '../utils/constants';

export const SocialTribes = () => (
    <div className="pt-28 pb-24 px-4 max-w-7xl mx-auto min-h-screen">
        <h1 className="text-4xl font-black mb-12 dark:text-white text-center">Wealth Tribes</h1>
        <div className="grid md:grid-cols-3 gap-8">
            {CONSTANTS.TRIBES.map(t => {
                const Icon = t.icon;
                return (
                    <div key={t.id} className="relative h-96 rounded-3xl overflow-hidden group">
                        <img src={t.img} alt={t.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                        <div className={`absolute inset-0 bg-gradient-to-t ${t.color} opacity-80 mix-blend-multiply`}></div>
                        <div className="absolute bottom-0 p-8 text-white">
                            <div className="mb-4"><Icon size={32} className="text-white" /></div>
                            <h3 className="text-2xl font-bold">{t.name}</h3>
                            <p className="text-sm opacity-80 mb-4">{t.desc}</p>
                            <button className="bg-white text-black px-6 py-2 rounded-full font-bold text-xs">Join Tribe</button>
                        </div>
                    </div>
                )
            })}
        </div>
    </div>
);
