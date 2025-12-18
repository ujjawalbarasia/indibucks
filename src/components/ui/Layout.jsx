import React from 'react';

export const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.5s ease, color 0.5s ease; }
    /* Hybrid Panel System */
    .glass-panel { 
        /* Light Mode: Solid Card Stock (Trust, Stability - for Older Investors) */
        background: #ffffff; 
        border: 1px solid #e2e8f0; 
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); 
        color: #0f172a;
    }
    .dark .glass-panel { 
        /* Dark Mode: Cyber Glass (Future, Tech - for Gen Z) */
        background: rgba(10, 10, 15, 0.75); 
        backdrop-filter: blur(24px);
        border: 1px solid rgba(255, 255, 255, 0.1); 
        box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.1); /* Subtle Indigo Glow */
        color: #f1f5f9;
    }
    
    /* Input Fields Fix */
    input, select, textarea {
        background-color: rgba(255, 255, 255, 0.8) !important;
        color: #0f172a !important;
        border: 1px solid #cbd5e1 !important;
    }
    .dark input, .dark select, .dark textarea {
        background-color: rgba(0, 0, 0, 0.4) !important;
        color: #ffffff !important;
        border: 1px solid rgba(255,255,255,0.2) !important;
    }
    .dark input::placeholder { color: rgba(255,255,255,0.4) !important; }
    
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
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f8f9fa] dark:bg-[#000000] transition-colors duration-1000">

        {/* LIGHT MODE: "The Executive Suite" (Clean, Trustworthy, Minimal) */}
        {/* Subtle, slow-moving gradient mesh, no blobs. Just professional atmosphere. */}
        <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-1000">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-indigo-50 via-white to-white"></div>
            <div className="absolute bottom-0 right-0 w-full h-[50%] bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent"></div>
        </div>

        {/* DARK MODE: "The Gamer's Den" (Vibrant, Neon, Dynamic) */}
        {/* Active blobs, noise, and grid for Gen Z appeal. */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-1000">
            {/* Blob 1: Top Left */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] animate-float 
                bg-indigo-600/30 mix-blend-screen"></div>

            {/* Blob 2: Top Right */}
            <div className="absolute top-[10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[120px] animate-float animation-delay-2000 
                bg-purple-600/20 mix-blend-screen"></div>

            {/* Blob 3: Bottom Left */}
            <div className="absolute bottom-[-20%] left-[10%] w-[50%] h-[50%] rounded-full blur-[100px] animate-float animation-delay-4000 
                bg-blue-600/20 mix-blend-screen"></div>

            {/* Blob 4: Center Pulse */}
            <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] rounded-full blur-[100px] animate-pulse-glow 
                bg-indigo-500/10"></div>

            {/* Noise & Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30 brightness-150 mix-blend-overlay"></div>
            <div className="absolute inset-0 opacity-40"
                style={{ backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px)', backgroundSize: '50px 50px' }}>
            </div>
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
