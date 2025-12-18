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
    
    /* New Pulse Glow for Center Orb */
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }
    .animate-pulse-glow { animation: pulse-glow 4s infinite; }
    
    /* Reveal effect for grid */
    .reveal-grid { transition: opacity 1s ease; }
  `}</style>
);

export const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#050510] transition-colors duration-1000">
        {/* Dual Palette System: Pastel for Light, Neon for Dark */}

        {/* Blob 1: Top Left */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-float 
            bg-indigo-300/40 dark:bg-indigo-600/20 mix-blend-multiply dark:mix-blend-normal transition-all duration-1000"></div>

        {/* Blob 2: Top Right */}
        <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-float animation-delay-2000 
            bg-purple-300/40 dark:bg-purple-600/10 mix-blend-multiply dark:mix-blend-normal transition-all duration-1000"></div>

        {/* Blob 3: Bottom Left */}
        <div className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-float animation-delay-4000 
            bg-cyan-300/40 dark:bg-blue-600/10 mix-blend-multiply dark:mix-blend-normal transition-all duration-1000"></div>

        {/* Blob 4: Center Pulse (New) */}
        <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full blur-[100px] animate-pulse-glow 
            bg-pink-300/30 dark:bg-indigo-500/5 transition-all duration-1000"></div>

        {/* Noise Texture Overlay for Premium Feel */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 dark:opacity-20 brightness-100 dark:brightness-150 mix-blend-overlay"></div>

        {/* Cyber Grid (Dark Mode Only) */}
        <div className="absolute inset-0 opacity-0 dark:opacity-20 transition-opacity duration-1000"
            style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)', backgroundSize: '60px 60px' }}>
        </div>
    </div>
);

export const Layout = ({ children }) => {
    return (
        <div className="relative min-h-screen text-gray-900 dark:text-white font-sans selection:bg-indigo-500/30">
            <GlobalStyles />
            <AnimatedBackground />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
