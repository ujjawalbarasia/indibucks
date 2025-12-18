import React from 'react';

export const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.5s ease, color 0.5s ease; }
    h1, h2, h3, h4, h5, h6, button, .font-heading { font-family: 'Outfit', sans-serif; }
    .glass-panel { background: rgba(255, 255, 255, 0.8); backdrop-filter: blur(24px); border: 1px solid rgba(255, 255, 255, 0.4); box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07); }
    .dark .glass-panel { background: rgba(20, 20, 20, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.3); }
    .animate-slide-up { animation: slideUpFade 0.6s forwards; }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .animate-float { animation: float 6s ease-in-out infinite; }
    @keyframes float { 0% { transform: translate(0px, 0px); } 50% { transform: translate(20px, 20px); } 100% { transform: translate(0px, 0px); } }
  `}</style>
);

export const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/5 dark:bg-indigo-900/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] bg-purple-600/5 dark:bg-purple-900/20 rounded-full blur-[120px] animate-float"></div>
    </div>
);
