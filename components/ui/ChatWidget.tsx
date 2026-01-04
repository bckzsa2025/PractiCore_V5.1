
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Image as ImageIcon, Video, Paperclip, Loader2, Maximize2, Minimize2, Mic, MicOff, Volume2, Globe, AlertCircle, PlayCircle, ExternalLink, Search, Brain, Stethoscope, Bot, PhoneOff, RefreshCw, Terminal, Lock, Database, Zap, Activity } from 'lucide-react';
import { AIMessage, User, Appointment } from '../../types';
import { generateImage, generateMedicalVideo, chatWithAi } from '../../services/ai';
import { useLiveSession } from '../../hooks/useLiveSession';
import { SaILabsBadge } from './SaILabsBadge';
import { apiClient } from '../../libs/api';

// --- Custom Components ---

const BeateAiLogo = ({ size = "md", pulsing = false }: { size?: "sm" | "md" | "lg", pulsing?: boolean }) => {
  const dim = size === "sm" ? "w-8 h-8" : size === "lg" ? "w-16 h-16" : "w-10 h-10";
  const iconSize = size === "sm" ? "w-4 h-4" : size === "lg" ? "w-8 h-8" : "w-6 h-6";
  const badgeSize = size === "sm" ? "w-3 h-3" : size === "lg" ? "w-5 h-5" : "w-4 h-4";

  return (
    <div className={`relative ${dim} flex items-center justify-center shrink-0`}>
      {pulsing && <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>}
      <div className="absolute inset-0 bg-gradient-to-tr from-primary to-teal-400 rounded-full opacity-10"></div>
      <div className="relative z-10 bg-white rounded-full p-1 shadow-sm border border-slate-100 flex items-center justify-center h-full w-full">
         <Brain className={`${iconSize} text-primary`} />
      </div>
      <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-md border border-slate-100 flex items-center justify-center z-20">
          <Stethoscope className={`${badgeSize} text-rose-500`} />
      </div>
    </div>
  );
};

// --- Visualizer Component ---
const AudioVisualizer = ({ isSpeaking, volume }: { isSpeaking: boolean, volume: number }) => {
    const bars = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center justify-center gap-1.5 h-12">
            {bars.map((i) => {
                const baseHeight = isSpeaking ? 24 : 12;
                const dynamicHeight = isSpeaking 
                    ? Math.random() * 32 + 16 
                    : Math.max(8, volume * 100 * (i % 2 === 0 ? 1.2 : 0.8));
                return (
                    <div 
                        key={i}
                        className={`w-2 rounded-full transition-all duration-75 ${isSpeaking ? 'bg-emerald-400' : 'bg-primary/50'}`}
                        style={{ 
                            height: `${Math.min(48, dynamicHeight)}px`,
                            opacity: volume > 0.05 || isSpeaking ? 1 : 0.3 
                        }}
                    ></div>
                );
            })}
        </div>
    );
};

interface ChatWidgetProps {
    user: User | null;
    currentView: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ user, currentView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  
  const [messages, setMessages] = useState<AIMessage[]>(() => {
      if (typeof window !== 'undefined') {
          const saved = localStorage.getItem('chat_history');
          if (saved) {
              try { return JSON.parse(saved); } catch (e) { console.error(e); }
          }
      }
      return [{ 
          id: 'welcome', 
          role: 'assistant', 
          content: 'Hello! I am Nurse🧠Beate™ ©Medi-i™. I can assist with appointments, practice info, or answer general medical questions.', 
          timestamp: Date.now() 
      }];
  });

  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUserMessage, setLastUserMessage] = useState<{text: string} | null>(null);
  const [webAccess, setWebAccess] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { isConnected, isSpeaking, volume, error: liveError, startSession, stopSession } = useLiveSession();
  const [voiceMode, setVoiceMode] = useState(false);

  useEffect(() => {
      localStorage.setItem('chat_history', JSON.stringify(messages));
  }, [messages]);

  const scrollToBottom = () => {
    if (!searchQuery) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, voiceMode, errorMsg, isTyping]);

  useEffect(() => {
      if (isOpen && !voiceMode && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isOpen, voiceMode]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    setErrorMsg(null);
    const userMsg: AIMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: textToSend,
        timestamp: Date.now()
    };

    setLastUserMessage({ text: textToSend });
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    
    if (isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
    }

    try {
        const systemPrompt = "You are a helpful medical assistant for Dr. Beate Setzer's practice.";
        const response = await chatWithAi(messages, textToSend, systemPrompt);
        
        const aiMsg: AIMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.text || "Action completed.",
            timestamp: Date.now(),
            sources: response.sources
        };
        setMessages(prev => [...prev, aiMsg]);
        setIsTyping(false);

    } catch (err: any) {
        console.error(err);
        setErrorMsg(`Error: ${err.message}`);
        setIsTyping(false);
    }
  };

  const handleRetry = () => {
      if (lastUserMessage) {
          handleSend(lastUserMessage.text);
      }
  };

  const toggleVoiceMode = () => {
    if (voiceMode) {
      stopSession();
      setVoiceMode(false);
    } else {
      setVoiceMode(true);
      startSession();
    }
  };

  const filteredMessages = messages.filter(msg => 
      msg.content?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) {
    return (
        <button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 group flex items-center justify-center"
        >
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75 group-hover:bg-primary/40 duration-1000"></div>
            <div className="relative bg-gradient-to-br from-primary to-teal-700 text-white rounded-full p-4 shadow-2xl flex items-center gap-3 transition-all hover:scale-110 hover:shadow-primary/50">
                <Brain className="w-6 h-6 animate-pulse" />
                <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold whitespace-nowrap text-sm pr-1">
                    Ask Nurse🧠Beate™
                </span>
            </div>
        </button>
    );
  }

  return (
    <div className={`fixed z-50 flex flex-col transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] shadow-2xl overflow-hidden border border-white/20 bg-white/95 backdrop-blur-xl ${isExpanded ? 'inset-0 md:inset-10 rounded-2xl' : 'bottom-6 right-6 w-[400px] h-[650px] rounded-3xl'}`}>
        
        {/* Header */}
        <div className={`bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-4 flex justify-between items-center text-white shrink-0 relative overflow-hidden`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="flex items-center gap-3 relative z-10">
                <div className="bg-white/10 rounded-full p-1 backdrop-blur-md border border-white/10">
                    <BeateAiLogo size="sm" pulsing={isTyping} />
                </div>
                <div>
                    <h3 className="font-bold text-sm tracking-wide">Nurse🧠Beate™</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${isConnected || !errorMsg ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]' : 'bg-rose-500'}`}></span> 
                            <p className="text-[10px] text-slate-300 font-medium tracking-wider uppercase">
                                {voiceMode ? (isConnected ? (isSpeaking ? 'Speaking' : 'Listening') : 'Live') : 'Online'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1 relative z-10">
                {!voiceMode && (
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)} 
                        className={`p-2 rounded-full transition-colors ${isSearchOpen ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-300 hover:text-white'}`}
                    >
                        <Search className="w-4 h-4" />
                    </button>
                )}
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-white/10 rounded-full text-slate-300 hover:text-white transition-colors">
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => { setIsOpen(false); if(voiceMode) toggleVoiceMode(); }} className="p-2 hover:bg-rose-500/20 rounded-full text-slate-300 hover:text-rose-400 transition-colors">
                    <X className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Search Bar */}
        {isSearchOpen && !voiceMode && (
            <div className="bg-white p-3 border-b border-slate-100 flex items-center gap-2 animate-in slide-in-from-top-2 shrink-0 shadow-sm z-20 relative">
                <Search className="w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history..." 
                    className="flex-1 text-sm outline-none text-slate-700 bg-transparent placeholder:text-slate-400"
                    autoFocus
                />
                {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="text-slate-400 hover:text-slate-600">
                        <X className="w-3 h-3" />
                    </button>
                )}
            </div>
        )}

        {/* Error Banner */}
        {errorMsg && (
            <div className="bg-rose-50 px-4 py-3 flex items-start gap-3 text-rose-700 text-xs border-b border-rose-100 shrink-0 animate-in slide-in-from-top-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <p className="font-bold">Communication Error</p>
                    <p className="mt-1">{errorMsg}</p>
                    <button onClick={handleRetry} className="mt-2 flex items-center gap-1 font-bold underline hover:text-rose-800">
                        <RefreshCw className="w-3 h-3" /> Retry Request
                    </button>
                </div>
            </div>
        )}

        {/* Chat Area */}
        {voiceMode ? (
             <div className="flex-1 bg-slate-950 relative overflow-hidden flex flex-col items-center justify-center p-8 transition-colors duration-500">
                 {/* Background Gradient Pulse */}
                 <div className={`absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950 transition-opacity duration-1000 ${isSpeaking ? 'opacity-80' : 'opacity-100'}`}></div>
                 {isSpeaking && (
                     <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                 )}

                 {/* Status Pill */}
                 <div className="absolute top-8 z-20">
                     {liveError ? (
                         <div className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 text-rose-300 rounded-full border border-rose-500/50 backdrop-blur-md animate-in slide-in-from-top-4">
                             <AlertCircle className="w-4 h-4" />
                             <span className="text-xs font-bold">Connection Lost</span>
                             <button onClick={() => startSession()} className="ml-2 bg-rose-600 hover:bg-rose-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">Retry</button>
                         </div>
                     ) : (
                         <div className={`flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md transition-all duration-300 ${isSpeaking ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300' : 'bg-slate-800/50 border-slate-700 text-slate-400'}`}>
                             {isSpeaking ? <Volume2 className="w-4 h-4 animate-pulse" /> : <Mic className="w-4 h-4" />}
                             <span className="text-xs font-bold tracking-wide uppercase">
                                 {isSpeaking ? "Nurse Beate Speaking" : isConnected ? "Listening..." : "Connecting..."}
                             </span>
                         </div>
                     )}
                 </div>

                 {/* Main Visualizer */}
                 <div className="relative z-10 flex flex-col items-center justify-center space-y-8">
                     <div className="relative w-48 h-48 flex items-center justify-center">
                         {isConnected && (
                             <>
                                <div className={`absolute inset-0 rounded-full border border-emerald-500/20 transition-all duration-300 ${isSpeaking ? 'scale-150 opacity-20' : 'scale-100 opacity-5'}`}></div>
                                <div className={`absolute inset-0 rounded-full border border-emerald-500/30 transition-all duration-500 ${isSpeaking ? 'scale-125 opacity-30' : 'scale-100 opacity-10'}`}></div>
                             </>
                         )}
                         <div className={`w-32 h-32 rounded-full flex items-center justify-center relative z-10 transition-all duration-300 shadow-2xl ${isSpeaking ? 'bg-emerald-500 shadow-emerald-500/30 scale-105' : 'bg-slate-800 border-2 border-slate-700'}`}>
                             {isSpeaking ? (
                                <Bot className="w-16 h-16 text-white animate-bounce" />
                             ) : (
                                <Mic className={`w-12 h-12 transition-colors duration-300 ${volume > 0.1 ? 'text-emerald-400' : 'text-slate-500'}`} />
                             )}
                         </div>
                     </div>

                     {/* Audio Waveform */}
                     <div className="h-16 flex items-center justify-center w-full max-w-xs">
                        {isConnected && !liveError && (
                            <AudioVisualizer isSpeaking={isSpeaking} volume={volume} />
                        )}
                     </div>
                 </div>

                 {/* Controls */}
                 <div className="absolute bottom-10 z-20 flex items-center gap-6 w-full max-w-sm justify-center">
                     <button 
                        onClick={toggleVoiceMode} 
                        className="flex flex-col items-center gap-2 group"
                     >
                         <div className="w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-all border border-slate-700 group-hover:scale-105">
                            <MessageSquare className="w-6 h-6" />
                         </div>
                         <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-300 uppercase tracking-wider">Text Mode</span>
                     </button>
                     
                     <button 
                        onClick={() => { stopSession(); setVoiceMode(false); setIsOpen(false); }} 
                        className="flex flex-col items-center gap-2 group"
                     >
                         <div className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-lg shadow-rose-900/50 transition-all group-hover:scale-105">
                            <PhoneOff className="w-8 h-8" />
                         </div>
                         <span className="text-[10px] font-bold text-rose-500/80 group-hover:text-rose-400 uppercase tracking-wider">End Call</span>
                     </button>
                 </div>
                 
                 <div className="absolute bottom-4 opacity-30">
                    <SaILabsBadge theme="dark" size="sm" />
                 </div>
             </div>
        ) : (
            <>
                <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth" id="chat-container">
                    {filteredMessages.map((msg, idx) => (
                        <div key={msg.id} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-transparent' : 'bg-slate-200 text-slate-500'}`}>
                                {msg.role === 'assistant' ? <BeateAiLogo size="sm" /> : <div className="font-bold text-xs">YOU</div>}
                            </div>
                            
                            <div className={`max-w-[85%] space-y-2`}>
                                <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'}`}>
                                    {msg.content}
                                </div>
                                <span className="text-[10px] text-slate-400 block px-1">
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute:'2-digit'})}
                                </span>
                            </div>
                        </div>
                    ))}
                    
                    {/* Typing & Tool Status */}
                    {isTyping && !searchQuery && (
                        <div className="flex justify-start animate-in fade-in zoom-in duration-300">
                             <div className="mr-3 mt-1 hidden sm:block">
                                <BeateAiLogo size="sm" pulsing={true} />
                            </div>
                            <div className="bg-slate-50 rounded-2xl rounded-tl-none p-4 border border-primary/10 shadow-sm flex items-center gap-3">
                                <div className="flex gap-1.5">
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-100"></span>
                                    <span className="w-2 h-2 bg-primary rounded-full animate-bounce delay-200"></span>
                                </div>
                                <span className="text-xs text-primary/80 font-bold tracking-wide uppercase">Nurse Beate is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} className="h-2" />
                </div>

                <div className="p-4 bg-white/80 backdrop-blur-md border-t border-slate-100 shrink-0">
                    <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/10 transition-all shadow-sm">
                        <button 
                            onClick={toggleVoiceMode} 
                            className="p-3 text-slate-400 hover:text-primary hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-slate-100" 
                            title="Start Voice Mode"
                        >
                            <Mic className="w-5 h-5" />
                        </button>
                        <input 
                            ref={inputRef}
                            type="text" 
                            value={input}
                            onChange={e => {
                                setInput(e.target.value);
                                if (errorMsg) setErrorMsg(null);
                            }}
                            onKeyDown={e => e.key === 'Enter' && !isTyping && handleSend()}
                            placeholder={"Ask a medical question..."}
                            className="flex-1 bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400 font-medium"
                        />
                        <button 
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="p-3 bg-primary text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-primary transition-all shadow-md hover:shadow-lg disabled:shadow-none"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    <div className="text-center mt-2">
                        <p className="text-[10px] text-slate-400 font-medium">
                            AI can make mistakes. Please verify important medical information.
                        </p>
                    </div>
                </div>
            </>
        )}
    </div>
  );
};

export default ChatWidget;
