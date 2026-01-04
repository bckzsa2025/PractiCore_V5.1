
import React, { useState } from 'react';
import { Mail, Lock, Loader2, ArrowRight, ShieldAlert } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { User } from '../../types';
import { SaILabsBadge } from '../../components/ui/SaILabsBadge';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [mode, setMode] = useState<'patient' | 'staff' | 'developer'>('patient');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
        const user = await apiClient.auth.login(email);
        onLoginSuccess(user);
    } catch (err) {
        setError('Invalid credentials. Please try again.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center text-primary mb-6">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </div>
        
        {/* Role Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex mb-6">
            <button 
                onClick={() => { setMode('patient'); setEmail(''); setPassword(''); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'patient' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Patient
            </button>
            <button 
                onClick={() => { setMode('staff'); setEmail('admin@drsetzer.com'); setPassword('admin'); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'staff' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-slate-700'}`}
            >
                Staff
            </button>
            <button 
                onClick={() => { setMode('developer'); setEmail('dev@practizone.system'); setPassword('sudo'); }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-1 ${mode === 'developer' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-slate-600'}`}
            >
                <ShieldAlert className="w-3 h-3" /> Dev
            </button>
        </div>

        <h2 className="text-3xl font-display font-bold text-slate-900">
          {mode === 'patient' ? 'Patient Portal' : mode === 'staff' ? 'Staff Login' : 'Developer Console'}
        </h2>
        <p className="mt-2 text-sm text-slate-600">
          {mode === 'patient' && <>Or <button className="font-bold text-primary hover:text-blue-500">register for a new profile</button></>}
          {mode === 'staff' && 'Secure access for authorized personnel only.'}
          {mode === 'developer' && 'Authorized Sudo Access Only. All actions logged.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={`py-8 px-4 shadow-xl sm:rounded-lg sm:px-10 border ${mode === 'developer' ? 'bg-slate-900 border-slate-700 shadow-slate-900/50' : 'bg-white border-slate-100 shadow-slate-200'}`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className={`block text-sm font-bold ${mode === 'developer' ? 'text-slate-300' : 'text-slate-700'}`}>
                Email address
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`appearance-none block w-full pl-10 px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${mode === 'developer' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                  placeholder={mode === 'developer' ? "sudo@system" : "you@example.com"}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={`block text-sm font-bold ${mode === 'developer' ? 'text-slate-300' : 'text-slate-700'}`}>
                Password
              </label>
              <div className="mt-1 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`appearance-none block w-full pl-10 px-3 py-2.5 border rounded-lg shadow-sm focus:outline-none focus:ring-primary focus:border-primary sm:text-sm ${mode === 'developer' ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'border-slate-300 placeholder-slate-400'}`}
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
                <div className="text-red-500 text-sm font-bold text-center bg-red-50 p-2 rounded">
                    {error}
                </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all disabled:opacity-70 ${mode === 'developer' ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-primary hover:bg-blue-700 focus:ring-primary'}`}
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>{mode === 'developer' ? 'Initialize Shell' : 'Sign In'} <ArrowRight className="w-4 h-4" /></>}
              </button>
            </div>
          </form>
        </div>
        
        {/* Branding Footer */}
        <div className="mt-12 flex justify-center">
            <SaILabsBadge size="sm" />
        </div>
      </div>
    </div>
  );
};

export default Login;
