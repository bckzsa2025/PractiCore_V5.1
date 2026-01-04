
import React, { useState } from 'react';
import { Phone, Mail, Clock, MapPin, Menu, Search, User, X, Info, Stethoscope, Contact, Brain } from 'lucide-react';

interface HeaderProps {
    onLoginClick: () => void;
    onHomeClick: () => void;
    onAiClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onLoginClick, onHomeClick, onAiClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const handleNavClick = (sectionId: string) => {
      setIsMobileMenuOpen(false); // Close mobile menu if open
      onHomeClick(); // Ensure we are on home view
      setTimeout(() => {
          const element = document.getElementById(sectionId);
          if (element) {
              element.scrollIntoView({ behavior: 'smooth' });
          }
      }, 100);
  };

  return (
    <>
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top Contact Bar */}
      <div className="bg-white border-b border-slate-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-12 flex justify-between items-center text-xs text-slate-500 font-medium">
          <div className="flex items-center gap-6">
            <a href="tel:+27215101441" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-3 h-3 text-primary" />
              <span>021 510 1441</span>
            </a>
            <div className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-3 h-3 text-primary" />
              <div className="flex gap-2">
                <a href="mailto:info@drsetzer.com">info@drsetzer.com</a>
              </div>
            </div>
            <div className="flex items-center gap-2">
               <Clock className="w-3 h-3 text-primary" />
               <span>Mon–Fri: 09:15–16:30 | Sat: 09:00–11:30</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-primary" />
                6 Epping St, Milnerton
            </span>
          </div>
        </div>
      </div>

      {/* Main Nav */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Logo */}
        <div onClick={onHomeClick} className="flex items-center gap-3 cursor-pointer group">
           <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center overflow-hidden">
             <img src="/logo.png" alt="Dr. Setzer Logo" className="w-full h-full object-contain" />
           </div>
           <div>
             <h1 className="font-display font-bold text-xl text-slate-800 tracking-tight leading-none">Dr. B Setzer</h1>
             <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Family Practice</p>
           </div>
        </div>

        {/* Navigation - Desktop */}
        <nav className="hidden lg:flex items-center gap-8">
           <button onClick={onHomeClick} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Home</button>
           <button onClick={() => handleNavClick('about')} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">About</button>
           <button onClick={() => handleNavClick('services')} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Services</button>
           {onAiClick && (
               <button onClick={onAiClick} className="text-sm font-bold text-cyan-600 hover:text-cyan-500 transition-colors flex items-center gap-1">
                   <Brain className="w-4 h-4" /> AI Medicine
               </button>
           )}
           <button onClick={() => handleNavClick('doctors')} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Doctors</button>
           <button onClick={() => handleNavClick('contact')} className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">Contact</button>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
           <button className="p-2 text-slate-400 hover:text-primary transition-colors hidden sm:block">
             <Search className="w-5 h-5" />
           </button>
           <button 
             onClick={onLoginClick}
             className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-700 hover:border-primary hover:text-primary transition-all"
           >
             <User className="w-4 h-4" />
             Patient Portal
           </button>
           
           {/* Mobile Menu Toggle */}
           <button 
             onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
             className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
             aria-label="Toggle Menu"
           >
             {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
           </button>
        </div>
      </div>
    </header>

    {/* Mobile Menu Overlay */}
    {isMobileMenuOpen && (
      <div className="fixed inset-0 z-30 bg-slate-900/20 backdrop-blur-sm lg:hidden" onClick={() => setIsMobileMenuOpen(false)}>
        <div 
            className="absolute top-[80px] left-0 w-full bg-white shadow-xl border-t border-slate-100 p-6 flex flex-col gap-4 animate-in slide-in-from-top-10 duration-200"
            onClick={e => e.stopPropagation()}
        >
            <button onClick={() => handleNavClick('about')} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-primary"><Info className="w-5 h-5" /></div>
                About Us
            </button>
            <button onClick={() => handleNavClick('services')} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600"><Stethoscope className="w-5 h-5" /></div>
                Services
            </button>
            {onAiClick && (
                <button onClick={() => { setIsMobileMenuOpen(false); onAiClick(); }} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 text-cyan-700 font-bold text-lg">
                    <div className="w-10 h-10 bg-cyan-50 rounded-lg flex items-center justify-center text-cyan-600"><Brain className="w-5 h-5" /></div>
                    AI in Medicine
                </button>
            )}
            <button onClick={() => handleNavClick('contact')} className="flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 text-slate-700 font-bold text-lg">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600"><Contact className="w-5 h-5" /></div>
                Contact
            </button>
            <button onClick={() => { setIsMobileMenuOpen(false); onLoginClick(); }} className="flex items-center gap-4 p-4 rounded-xl bg-slate-900 text-white font-bold text-lg mt-2">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center text-white"><User className="w-5 h-5" /></div>
                Patient Login
            </button>
        </div>
      </div>
    )}
    </>
  );
};

export default Header;
