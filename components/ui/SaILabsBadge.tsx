
import React from 'react';
import { Brain, Cpu, Sparkles } from 'lucide-react';

interface BadgeProps {
  className?: string;
  theme?: 'dark' | 'light';
  size?: 'sm' | 'md' | 'lg';
}

export const SaILabsBadge: React.FC<BadgeProps> = ({ className = "", theme = 'light', size = 'md' }) => {
  const isDark = theme === 'dark';
  
  const sizeClasses = {
    sm: { icon: "w-4 h-4", subIcon: "w-2 h-2", text: "text-base", slogan: "text-[6px]", dev: "text-[8px]" },
    md: { icon: "w-8 h-8", subIcon: "w-4 h-4", text: "text-2xl", slogan: "text-[8px]", dev: "text-[10px]" },
    lg: { icon: "w-12 h-12", subIcon: "w-6 h-6", text: "text-4xl", slogan: "text-[10px]", dev: "text-xs" }
  };

  const s = sizeClasses[size];

  return (
    <div className={`flex flex-col items-center justify-center opacity-90 hover:opacity-100 transition-all duration-300 group cursor-default select-none ${className}`}>
      <div className="flex items-center gap-3 mb-1">
        {/* Logo Mark */}
        <div className="relative">
          <div className="absolute inset-0 bg-cyan-500/20 blur-lg rounded-full group-hover:bg-cyan-500/30 transition-all"></div>
          <Brain className={`${s.icon} text-cyan-500 relative z-10`} strokeWidth={1.5} />
          <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-cyan-500/30 z-20">
             <Cpu className={`${s.subIcon} text-white`} />
          </div>
          
          {/* Circuit Lines Decoration */}
          <div className="absolute top-1/2 left-full w-4 h-[1px] bg-gradient-to-r from-cyan-500 to-transparent"></div>
          <div className="absolute top-0 right-0 w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>
        </div>

        {/* Text Block */}
        <div className="flex flex-col items-start leading-none">
          <span className={`font-display font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-cyan-500 to-blue-600 ${s.text}`}>
            SA-iLabs™®
          </span>
          <span className={`${s.slogan} font-bold uppercase tracking-[0.2em] ${isDark ? 'text-slate-400' : 'text-slate-500'} group-hover:text-cyan-600 transition-colors`}>
            Re-Imagining Intelligence
          </span>
        </div>
      </div>
      
      {/* Developer Credit */}
      <div className={`flex items-center gap-1.5 mt-1 border-t ${isDark ? 'border-slate-700' : 'border-slate-200'} pt-1 px-4`}>
        <span className={`${s.dev} ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Developed by</span>
        <span className={`${s.dev} font-bold ${isDark ? 'text-slate-300' : 'text-slate-600'} flex items-center gap-1`}>
           Christo Botha <Sparkles className="w-2 h-2 text-amber-400" />
        </span>
      </div>
    </div>
  );
};
