
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, Check } from 'lucide-react';
import { SaILabsBadge } from './SaILabsBadge';

interface ConsentSplashProps {
  onAccept: () => void;
}

const ConsentSplash: React.FC<ConsentSplashProps> = ({ onAccept }) => {
  const [popiaChecked, setPopiaChecked] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [medicalChecked, setMedicalChecked] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const CONSENT_VERSION_KEY = 'dr_setzer_consent_v1.0';

  useEffect(() => {
    // Check if already consented to CURRENT version
    const consented = localStorage.getItem(CONSENT_VERSION_KEY);
    if (!consented) {
        setIsVisible(true);
    } else {
        onAccept();
    }
  }, [onAccept]);

  const handleAccept = () => {
    if (popiaChecked && termsChecked && medicalChecked) {
        localStorage.setItem(CONSENT_VERSION_KEY, new Date().toISOString());
        setIsVisible(false);
        onAccept();
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
       <div className="bg-white max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-300 my-8">
          <div className="bg-slate-100 p-6 text-center border-b border-slate-200">
             <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                <ShieldCheck className="w-8 h-8" />
             </div>
             <h2 className="text-2xl font-display font-bold text-slate-800">Welcome to Dr. Setzer</h2>
             <p className="text-sm text-slate-500 mt-1">Please review and accept our compliance terms to proceed.</p>
          </div>
          
          <div className="p-6 space-y-4">
             <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <input 
                    type="checkbox" 
                    id="popia"
                    checked={popiaChecked}
                    onChange={e => setPopiaChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="popia" className="text-sm text-slate-600 cursor-pointer select-none">
                    <span className="font-bold text-slate-800 block">POPIA Consent</span>
                    I consent to the processing of my personal and medical information in accordance with the Protection of Personal Information Act.
                </label>
             </div>

             <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <input 
                    type="checkbox" 
                    id="terms"
                    checked={termsChecked}
                    onChange={e => setTermsChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-slate-600 cursor-pointer select-none">
                    <span className="font-bold text-slate-800 block">Terms of Service</span>
                    I agree to the practice terms, including cancellation policies and billing procedures.
                </label>
             </div>

             <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                <input 
                    type="checkbox" 
                    id="medical"
                    checked={medicalChecked}
                    onChange={e => setMedicalChecked(e.target.checked)}
                    className="mt-1 w-4 h-4 accent-primary cursor-pointer"
                />
                <label htmlFor="medical" className="text-sm text-slate-600 cursor-pointer select-none">
                    <span className="font-bold text-slate-800 block">Medical Disclaimer</span>
                    I understand that this website and AI assistant provide information only and do not replace professional medical advice.
                </label>
             </div>
          </div>

          <div className="p-6 bg-slate-50 border-t border-slate-200 flex flex-col gap-6">
             <button 
                onClick={handleAccept}
                disabled={!popiaChecked || !termsChecked || !medicalChecked}
                className="w-full py-3 bg-primary text-white font-bold rounded-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
             >
                <Lock className="w-4 h-4" /> Enter Secure Site
             </button>
             
             <div className="flex justify-center pt-2">
                <SaILabsBadge size="sm" />
             </div>
          </div>
       </div>
    </div>
  );
};

export default ConsentSplash;
