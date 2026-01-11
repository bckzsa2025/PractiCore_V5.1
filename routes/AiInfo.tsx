
import React from 'react';
import Header from '../components/ui/Header';
import Footer from '../components/ui/Footer';
import { Bot, Shield, Zap, Lock, Cpu, CheckCircle } from 'lucide-react';
import { SaILabsBadge } from '../components/ui/SaILabsBadge';

interface AiInfoProps {
    onLoginClick: () => void;
    onHomeClick: () => void;
    onLegalClick: () => void;
}

const AiInfo: React.FC<AiInfoProps> = ({ onLoginClick, onHomeClick, onLegalClick }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      <Header onLoginClick={onLoginClick} onHomeClick={onHomeClick} />
      
      {/* Hero */}
      <section className="bg-slate-900 text-white py-20 relative overflow-hidden">
         <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')]"></div>
         <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-6 border border-cyan-500/20">
               <Bot className="w-4 h-4" /> Powered by Nurse Betty
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold mb-6">
               Medicine Re-Imagined <br/> with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Intelligence</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
               MediCore integrates advanced AI to assist with administration, 
               patient education, and triage—giving our doctors more time to focus on 
               what matters: <strong>You.</strong>
            </p>
         </div>
      </section>

      {/* Core Principles */}
      <section className="py-20">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-200 transition-all">
                  <div className="w-12 h-12 bg-cyan-50 rounded-xl flex items-center justify-center text-cyan-600 mb-6">
                     <Shield className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Safety First</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                     Nurse Betty is a "Decision Support Tool". It does not diagnose or prescribe. 
                     Every clinical decision is reviewed and finalized by a human doctor personally.
                  </p>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-200 transition-all">
                  <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-6">
                     <Lock className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Data Privacy</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                     Your health data is encrypted. The AI processes anonymized information 
                     strictly for the purpose of your consultation and is POPIA compliant.
                  </p>
               </div>
               <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-cyan-200 transition-all">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                     <Zap className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">Instant Access</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                     No more waiting on hold. Nurse Betty can handle bookings, 
                     FAQs, and triage 24/7, ensuring you get help when you need it.
                  </p>
               </div>
            </div>
         </div>
      </section>

      {/* Feature Showcase */}
      <section className="py-20 bg-white border-t border-slate-100">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col lg:flex-row items-center gap-16">
               <div className="flex-1 space-y-8">
                  <h2 className="text-3xl font-display font-bold text-slate-900">What can Nurse Betty do?</h2>
                  <div className="space-y-4">
                     {[
                        "Schedule and manage appointments in real-time.",
                        "Answer questions about services and pricing.",
                        "Provide verified medical information.",
                        "Transcribe voice notes for your patient record.",
                        "Translate medical instructions into your language."
                     ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                           <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                           <span className="text-slate-700 font-medium">{item}</span>
                        </div>
                     ))}
                  </div>
                  <div className="pt-4">
                     <SaILabsBadge size="lg" />
                  </div>
               </div>
               <div className="flex-1">
                  <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-slate-900 bg-slate-900 aspect-video flex items-center justify-center">
                     <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-purple-500/20"></div>
                     <div className="text-center relative z-10">
                        <Cpu className="w-16 h-16 text-cyan-400 mx-auto mb-4 animate-pulse" />
                        <p className="text-cyan-200 font-mono text-sm">Neural Engine Active</p>
                        <p className="text-white font-bold text-xl mt-2">Advanced Reasoning Model</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      <Footer onLegalClick={onLegalClick} />
    </div>
  );
};

export default AiInfo;
