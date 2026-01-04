
import React, { useState } from 'react';
import { Award, Gift, ChevronRight, Lock } from 'lucide-react';

interface TokenWidgetProps {
  balance: number;
}

const TokenWidget: React.FC<TokenWidgetProps> = ({ balance }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">
      {/* Header / Summary */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 bg-gradient-to-r from-amber-50 to-white cursor-pointer flex justify-between items-center group transition-all"
      >
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shadow-sm group-hover:scale-110 transition-transform">
              <Award className="w-5 h-5" />
           </div>
           <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Health Tokens</p>
              <p className="text-xl font-display font-bold text-slate-800">{balance} <span className="text-xs text-slate-500 font-normal">available</span></p>
           </div>
        </div>
        <ChevronRight className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
      </div>

      {/* Expandable Reward Shop */}
      {isOpen && (
        <div className="p-4 border-t border-slate-100 bg-slate-50 animate-in slide-in-from-top-2">
           <p className="text-xs text-slate-500 mb-4">Redeem tokens for discounts on cash services.</p>
           
           <div className="space-y-3">
              {/* Reward 1 */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 hover:border-amber-200 transition-colors">
                 <div className="flex items-center gap-3">
                    <Gift className="w-4 h-4 text-purple-500" />
                    <div>
                       <p className="text-sm font-bold text-slate-700">R50 Off Consultation</p>
                       <p className="text-[10px] text-slate-400">Requires 500 Tokens</p>
                    </div>
                 </div>
                 <button 
                    disabled={balance < 500}
                    className={`px-3 py-1 text-xs font-bold rounded-full border ${balance >= 500 ? 'bg-primary text-white border-primary hover:bg-teal-700' : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'}`}
                 >
                    Redeem
                 </button>
              </div>

              {/* Reward 2 */}
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-200 opacity-60">
                 <div className="flex items-center gap-3">
                    <Lock className="w-4 h-4 text-slate-400" />
                    <div>
                       <p className="text-sm font-bold text-slate-700">Free Follow-up</p>
                       <p className="text-[10px] text-slate-400">Requires 1000 Tokens</p>
                    </div>
                 </div>
                 <div className="text-[10px] font-bold text-slate-400">Locked</div>
              </div>
           </div>
           
           <div className="mt-4 pt-3 border-t border-slate-200 text-center">
              <p className="text-[10px] text-slate-400">Earn 50 tokens for every on-time appointment.</p>
           </div>
        </div>
      )}
    </div>
  );
};

export default TokenWidget;
