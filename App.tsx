
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import Home from './routes/Home';
import Dashboard from './routes/Patient/Dashboard';
import Login from './routes/Auth/Login';
import AdminDashboard from './routes/Admin/AdminDashboard';
import DeveloperConsole from './routes/Developer/DeveloperConsole';
import Legal from './routes/Legal';
import AiInfo from './routes/AiInfo';
import ChatWidget from './components/ui/ChatWidget';
import ConsentSplash from './components/ui/ConsentSplash';
import { User } from './types';
import { Download, X } from 'lucide-react';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'login' | 'portal' | 'admin' | 'developer' | 'legal' | 'ai-info'>('home');
  const [user, setUser] = useState<User | null>(null);
  const [hasConsented, setHasConsented] = useState(false);
  
  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // Check initial consent status & PWA install event
  useEffect(() => {
    const consent = localStorage.getItem('medicore_consent_v1.0'); // Updated to check versioned key
    if (consent) setHasConsented(true);

    const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setDeferredPrompt(e);
        setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult: any) => {
          if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
          }
          setDeferredPrompt(null);
          setShowInstallBanner(false);
      });
  };

  const handleLoginSuccess = (userData: User) => {
      setUser(userData);
      if (userData.role === 'developer') {
          setView('developer');
      } else if (userData.role === 'admin' || userData.role === 'staff') {
          setView('admin');
      } else {
          setView('portal');
      }
  };

  const handleLogout = () => {
      setUser(null);
      setView('home');
  };

  return (
    <>
      <ConsentSplash onAccept={() => setHasConsented(true)} />

      {/* PWA Install Banner */}
      {hasConsented && showInstallBanner && (
          <div className="bg-primary text-white p-3 flex justify-between items-center text-sm shadow-md relative z-50 animate-in slide-in-from-top print:hidden">
              <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-lg">
                      <Download className="w-4 h-4" />
                  </div>
                  <div>
                      <p className="font-bold">Install MediCore App</p>
                      <p className="text-xs opacity-90">Work offline and access faster.</p>
                  </div>
              </div>
              <div className="flex gap-3">
                  <button 
                    onClick={handleInstallClick}
                    className="bg-white text-primary font-bold px-4 py-1.5 rounded-full hover:bg-slate-100 transition-colors text-xs"
                  >
                      Install
                  </button>
                  <button onClick={() => setShowInstallBanner(false)} className="text-white/70 hover:text-white">
                      <X className="w-5 h-5" />
                  </button>
              </div>
          </div>
      )}

      {/* Main Views */}
      {view === 'home' && (
          <Home 
            onLoginClick={() => setView('login')} 
            onLegalClick={() => setView('legal')} 
            onAiClick={() => setView('ai-info')}
          />
      )}

      {view === 'legal' && (
          <Legal onLoginClick={() => setView('login')} onHomeClick={() => setView('home')} />
      )}

      {view === 'ai-info' && (
          <AiInfo 
            onLoginClick={() => setView('login')} 
            onHomeClick={() => setView('home')} 
            onLegalClick={() => setView('legal')}
          />
      )}

      {view === 'login' && (
          <Login onLoginSuccess={handleLoginSuccess} />
      )}

      {view === 'portal' && user && (
          <Dashboard user={user} onLogout={handleLogout} />
      )}

      {view === 'admin' && user && (
          <AdminDashboard user={user} onLogout={handleLogout} />
      )}

      {view === 'developer' && user && (
          <DeveloperConsole user={user} onLogout={handleLogout} />
      )}

      {/* Global Persistent Chat Widget */}
      {hasConsented && (
          <ChatWidget 
            user={user} 
            currentView={view} 
          />
      )}
    </>
  );
};

export default App;
