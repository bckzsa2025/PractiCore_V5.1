
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { SaILabsBadge } from './ui/SaILabsBadge';

interface AuthModalProps {
  onLogin: (email: string) => void;
  onClose: () => void;
  isLoading: boolean;
}

const AuthModal: React.FC<AuthModalProps> = ({ onLogin, onClose, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(email && password) onLogin(email);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden p-8 animate-in zoom-in duration-300">
         <div className="text-center mb-8">
            <h2 className="text-2xl font-bold font-display text-slate-800">Patient Portal</h2>
            <p className="text-slate-500">Secure access to your medical records.</p>
         </div>

         <form onSubmit={handleSubmit} className="space-y-4">
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email Address</label>
               <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                    placeholder="name@example.com"
                    required
                  />
               </div>
            </div>
            <div>
               <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Password</label>
               <div className="relative">
                  <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 p-3 bg-slate-50 border border-slate-200 rounded-lg focus:border-primary outline-none"
                    placeholder="••••••••"
                    required
                  />
               </div>
            </div>

            <button 
                type="submit" 
                disabled={isLoading}
                className="w-full py-3 bg-primary text-white rounded-lg font-bold hover:bg-teal-600 shadow-lg flex justify-center items-center gap-2"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In securely'}
            </button>
         </form>
         
         <div className="mt-6 text-center space-y-4">
            <button onClick={onClose} className="text-sm text-slate-400 hover:text-slate-600">Cancel</button>
            <div className="flex justify-center pt-2 border-t border-slate-100">
               <SaILabsBadge size="sm" />
            </div>
         </div>
      </div>
    </div>
  );
};

export default AuthModal;
