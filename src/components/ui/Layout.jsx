import React from 'react';

export const GlobalStyles = () => (
    <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
    body { font-family: 'Inter', sans-serif; overflow-x: hidden; transition: background-color 0.5s ease, color 0.5s ease; }
    /* Semantic System handled by index.css and tailwind.config.js */
    .animate-slide-up { animation: slideUpFade 0.6s forwards; }
    @keyframes slideUpFade { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    
    /* New Pulse Glow for Center Orb */
    @keyframes pulse-glow {
      0%, 100% { opacity: 0.5; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.1); }
    }
    .animate-pulse-glow { animation: pulse-glow 4s infinite; }
    
    /* Reveal effect for grid */
  `}</style>
);

// Animated Background: Restored "Nebula" Theme logic
export const AnimatedBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-[#f0f4f8] dark:bg-[#050505] transition-colors duration-1000">
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');
            body { font-family: 'Inter', sans-serif; }
            h1, h2, h3, h4, h5, h6 { font-family: 'Outfit', sans-serif; }
            
            /* Global Contrast Enforcement */
            .glass-panel { transition: all 0.3s ease; }
            
            /* Light Mode: Solid, High Contrast */
            html:not(.dark) .glass-panel {
                background: rgba(255, 255, 255, 0.95);
                border: 1px solid #e2e8f0;
                color: #0f172a; /* Slate 900 - Pitch Black text */
                box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            html:not(.dark) h1, html:not(.dark) h2, html:not(.dark) h3 {
                color: #0f172a !important; /* Force black headings */
            }
            html:not(.dark) p, html:not(.dark) span {
                color: #334155; /* Slate 700 - Dark Gray text */
            }

            /* Dark Mode: Translucent, Neon */
            html.dark .glass-panel {
                background: rgba(20, 20, 25, 0.6);
                backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                color: #f8fafc;
                box-shadow: 0 0 40px -10px rgba(99, 102, 241, 0.1);
            }
        `}</style>

        {/* LIGHT MODE BACKGROUND */}
        <div className="absolute inset-0 opacity-100 dark:opacity-0 transition-opacity duration-1000">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-white to-white"></div>
        </div>

        {/* DARK MODE BACKGROUND (The "Vibe") */}
        <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-1000">
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
        <div className="relative min-h-screen font-sans">
            <GlobalStyles />
            <AnimatedBackground />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
