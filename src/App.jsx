import React, { useState, useCallback } from 'react';
import { Leaf, EyeOff, Sun, Moon, LogOut, User, Menu, TrendingUp, ScanEye } from 'lucide-react';
import { AppProvider, useAppContext } from './context/AppContext';
import { GlobalStyles, AnimatedBackground } from './components/ui/Layout';
import { IndiCommand } from './components/ui/IndiCommand';
import { LandingPage } from './pages/LandingPage';
import { FundMarketplace } from './pages/FundMarketplace';
import { Dashboard } from './pages/Dashboard';
import { SocialTribes } from './pages/SocialTribes';
import { AIAdvisor } from './pages/AIAdvisor';
import { PortfolioAnalyzer } from './pages/PortfolioAnalyzer';
import { LoginModal, KYCFlow } from './components/modals/AuthModals';
import { InvestModal, FundDetailsModal } from './components/modals/InvestmentModals';

const AppContent = () => {
  const { user, logout, view, setView, showLogin, setShowLogin, loginGoogle } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [selectedFund, setSelectedFund] = useState(null);
  const [showingKyc, setShowingKyc] = useState(false);

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
      case 'advisor': return <AIAdvisor />;
      case 'analyzer': return <PortfolioAnalyzer />;
      default: return <LandingPage />;
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'dark bg-[#050505] text-white' : 'bg-[#f8fafc] text-gray-900'} transition-colors duration-300`}>
      <GlobalStyles />
      <AnimatedBackground />

      {/* Navbar */}
      <nav className="fixed w-full z-50 top-4 px-4">
        <div className="max-w-5xl mx-auto glass-panel rounded-full px-6 h-16 flex items-center justify-between shadow-2xl backdrop-blur-xl bg-white/90 dark:bg-black/80">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg"><TrendingUp size={20} /></div>
            <span className="text-xl font-black tracking-tighter dark:text-white">IndiBucks</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            {['funds', 'social', 'advisor', 'analyzer'].map(item => (
              <button key={item} onClick={() => setView(item)} className={`px-4 py-2 text-xs font-black uppercase transition-colors ${view === item ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-400'}`}>{item === 'analyzer' ? 'Medic' : item}</button>
            ))}
            {user && !user.isAnonymous && <button onClick={() => setView('dashboard')} className={`px-4 py-2 text-xs font-black uppercase transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}>Dashboard</button>}
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setZenMode(!zenMode)} className={`p-2 rounded-full transition-all ${zenMode ? 'bg-teal-500 text-white' : 'text-gray-400'}`}>{zenMode ? <Leaf size={20} /> : <EyeOff size={20} />}</button>
            <button onClick={() => setIsDark(!isDark)} className="p-2 rounded-full text-gray-400 hover:bg-white/10">{isDark ? <Sun size={20} /> : <Moon size={20} />}</button>
            {user && !user.isAnonymous ? (
              <div className="flex items-center gap-3 pl-4 border-l dark:border-white/10">
                <button onClick={() => setView('dashboard')} className="w-10 h-10 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center border-2 border-indigo-500 shadow-sm">{user.photoURL ? <img src={user.photoURL} alt="Profile" className="w-full h-full object-cover" /> : <User className="text-indigo-600" />}</button>
                <button onClick={logout} className="text-gray-400 hover:text-red-500 transition-colors"><LogOut size={20} /></button>
              </div>
            ) : <button onClick={() => setShowLogin(true)} className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-xs font-bold shadow-lg">LOGIN</button>}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="md:hidden text-gray-400"><Menu /></button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        {renderView()}
      </main>

      {/* Modals & Overlays */}
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
