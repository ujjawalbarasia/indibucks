import React, { useState, useCallback } from 'react';
import { Leaf, EyeOff, Sun, Moon, LogOut, User, Menu, TrendingUp, Eye } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import { GlobalStyles, AnimatedBackground } from './components/ui/Layout';
import { IndiCommand } from './components/ui/IndiCommand';
import { LandingPage } from './pages/LandingPage';
import { FundMarketplace } from './pages/FundMarketplace';
import { Dashboard } from './pages/Dashboard';
import { SocialTribes } from './pages/SocialTribes';
import { AIAdvisor } from './pages/AIAdvisor';
import { PortfolioAnalyzer } from './pages/PortfolioAnalyzer';
import { Boardroom } from './components/ai/Boardroom';
import { FutureYou } from './components/ai/FutureYou';
import { SpendAnalyzer } from './components/ai/SpendAnalyzer';
import { LoginModal, KYCFlow } from './components/modals/AuthModals';
import { InvestModal, FundDetailsModal } from './components/modals/InvestmentModals';
import { Analytics, EVENTS } from './services/analytics';

const AppContent = () => {
  const { user, logout, view, setView, showLogin, setShowLogin, loginGoogle } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [showingKyc, setShowingKyc] = useState(false);

  // Force Dark Mode always
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Analytics Effect
  React.useEffect(() => {
    Analytics.page(view);
  }, [view]);

  // Command Handler
  const handleIndiCommand = useCallback((action) => {
    if (action.type === 'NAVIGATE') setView(action.payload.target);
  }, [setView]);

  // View Routing
  const renderView = () => {
    switch (view) {
      case 'dashboard': return <Dashboard user={user} zenMode={zenMode} />;
      case 'funds': return <FundMarketplace onInvestClick={(f) => { if (!user) setShowLogin(true); else setSelectedFund(f); }} />;
      case 'social': return <SocialTribes />;
      case 'advisor': return <AIAdvisor />;
      case 'analyzer': return <PortfolioAnalyzer />;
      case 'boardroom': return <Boardroom />;
      case 'future': return <FutureYou user={user} />;
      case 'spend': return <SpendAnalyzer />;
      default: return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-indigo-500/30">
      {/* Dynamic Background Nebula */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-900/20 rounded-full blur-[120px] animate-pulse-slow"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse-slow delay-1000"></div>
        <div className="absolute top-[20%] right-[20%] w-[30vw] h-[30vw] bg-blue-900/10 rounded-full blur-[100px] animate-float"></div>
      </div>

      <GlobalStyles />

      {/* Navbar - Floating Glass Pill */}
      <nav className="fixed w-full z-50 top-6 px-4">
        <div className="max-w-4xl mx-auto glass-panel rounded-full px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
            {/* Logo - Simple Geometric */}
            <div className="w-8 h-8 bg-white text-black rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.4)]">
              <TrendingUp size={20} strokeWidth={3} />
            </div>
            <span className="text-lg font-bold tracking-tight text-white">IndiBucks Pro</span>
          </div>

          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
            {['funds', 'advisor', 'dashboard'].map(item => (
              <button key={item} onClick={() => setView(item)} className={`px-5 py-2 text-xs font-bold uppercase tracking-wider rounded-full transition-all duration-300 ${view === item ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                {item}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-3">
                <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full overflow-hidden border border-white/20 hover:border-white transition p-0.5"><img src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} alt="Profile" className="w-full h-full object-cover rounded-full" /></button>
              </div>
            ) : <button onClick={() => setShowLogin(true)} className="px-6 py-2 bg-white text-black rounded-full text-xs font-black tracking-wider hover:scale-105 transition shadow-[0_0_15px_rgba(255,255,255,0.3)]">LOGIN</button>}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-white"><Menu /></button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-24 right-4 w-64 glass-panel p-2 rounded-2xl flex flex-col gap-1 z-50 animate-slide-up">
            {['funds', 'advisor', 'dashboard'].map(item => (
              <button key={item} onClick={() => { setView(item); setIsMenuOpen(false); }} className={`px-6 py-4 text-sm font-bold uppercase text-left rounded-xl ${view === item ? 'bg-white text-black' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
                {item}
              </button>
            ))}
          </div>
        )}
      </nav>

      {/* Main Content Wrapper */}
      <main className="relative z-10 pt-32 min-h-screen">
        {renderView()}
      </main>

      {/* Modals */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onGoogleLogin={() => { loginGoogle().then(() => setShowLogin(false)); }} />}
      {showingKyc && <KYCFlow user={user} onComplete={() => setShowingKyc(false)} />}
      {selectedFund && <InvestModal fund={selectedFund} user={user} onClose={() => setSelectedFund(null)} onSuccess={() => { setView('dashboard'); setSelectedFund(null); }} />}

      <IndiCommand onExecute={handleIndiCommand} />
    </div>
  );
};

const App = () => (
  <AppProvider>
    <AppContent />
  </AppProvider>
);

export default App;
