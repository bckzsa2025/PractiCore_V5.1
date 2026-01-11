
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Image as ImageIcon, Video, Paperclip, Loader2, Maximize2, Minimize2, Mic, MicOff, Volume2, VolumeX, Globe, AlertCircle, PlayCircle, PauseCircle, RotateCcw, StopCircle, Search, Brain, Stethoscope, Bot, PhoneOff, RefreshCw, Activity, Play, Pause, Square, RotateCcw as ReplayIcon, Plus, Trash2, History, XCircle } from 'lucide-react';
import { AIMessage, User, Attachment } from '../../types';
import { chatWithAi } from '../../services/ai';
import { apiClient, ChatSession } from '../../libs/api';
import { useLiveSession } from '../../hooks/useLiveSession';
import { useVoice } from '../../hooks/useVoice';
import { SaILabsBadge } from './SaILabsBadge';

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

const AudioVisualizer = ({ isSpeaking, volume }: { isSpeaking: boolean, volume: number }) => {
    const bars = [1, 2, 3, 4, 5];
    return (
        <div className="flex items-center justify-center gap-1.5 h-12">
            {bars.map((i) => {
                const dynamicHeight = isSpeaking 
                    ? Math.random() * 32 + 16 
                    : Math.max(8, volume * 100 * (i % 2 === 0 ? 1.2 : 0.8));
                return (
                    <div 
                        key={i}
                        className={`w-2 rounded-full transition-all duration-75 ${isSpeaking ? 'bg-emerald-400' : 'bg-primary/50'}`}
                        style={{ height: `${Math.min(48, dynamicHeight)}px`, opacity: volume > 0.05 || isSpeaking ? 1 : 0.3 }}
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

const ChatWidget: React.FC<ChatWidgetProps> = ({ user }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  // Session State
  const [currentSessionId, setCurrentSessionId] = useState<string>('new');
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<{data: string, mimeType: string, preview: string} | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isConnected, isSpeaking: isLiveSpeaking, volume, error: liveError, startSession, stopSession } = useLiveSession();
  const { speak, stop, pause, resume, restart, isMuted, setIsMuted, playbackState } = useVoice();
  const [voiceMode, setVoiceMode] = useState(false);

  // Load Sessions on Open
  useEffect(() => {
      if (isOpen) loadSessions();
  }, [isOpen]);

  // Load Messages when Session Changes
  useEffect(() => {
      if (currentSessionId === 'new') {
          setMessages([{ 
              id: 'welcome', 
              role: 'assistant', 
              content: 'Hello! I am Nurse Betty. How can I help you today?', 
              timestamp: Date.now() 
          }]);
      } else {
          apiClient.chats.get(currentSessionId).then(session => {
              if (session) setMessages(session.messages);
          });
      }
  }, [currentSessionId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, voiceMode, isTyping, selectedImage]);

  const loadSessions = async () => {
      const list = await apiClient.chats.list();
      setSessions(list);
  };

  const handleNewChat = () => {
      setCurrentSessionId('new');
      setShowHistory(false);
  };

  const handleSelectSession = (id: string) => {
      setCurrentSessionId(id);
      setShowHistory(false);
  };

  const handleDeleteSession = async (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm("Delete this conversation?")) {
          await apiClient.chats.delete(id);
          if (currentSessionId === id) handleNewChat();
          loadSessions();
      }
  };

  const saveCurrentSession = async (newMessages: AIMessage[]) => {
      let title = "New Conversation";
      // Generate title from first user message
      const firstUserMsg = newMessages.find(m => m.role === 'user');
      if (firstUserMsg && firstUserMsg.content) {
          title = firstUserMsg.content.substring(0, 30) + (firstUserMsg.content.length > 30 ? '...' : '');
      }

      let id = currentSessionId;
      if (id === 'new') id = 'chat_' + Date.now();

      const session: ChatSession = {
          id,
          title,
          messages: newMessages,
          timestamp: Date.now()
      };

      await apiClient.chats.save(session);
      setCurrentSessionId(id);
      loadSessions(); // Refresh sidebar list
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
          setErrorMsg("Please select an image file.");
          return;
      }

      const reader = new FileReader();
      reader.onload = (evt) => {
          const base64 = evt.target?.result as string;
          setSelectedImage({
              data: base64,
              mimeType: file.type,
              preview: base64
          });
      };
      reader.readAsDataURL(file);
      // Reset input so same file can be selected again
      e.target.value = '';
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim() && !selectedImage) return;

    setErrorMsg(null);
    
    // Create User Message
    const userMsg: AIMessage = { 
        id: Date.now().toString(), 
        role: 'user', 
        content: textToSend, 
        timestamp: Date.now(),
        attachments: selectedImage ? [{ type: 'image', url: selectedImage.preview }] : undefined
    };
    
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    const imagePayload = selectedImage;
    setSelectedImage(null); // Clear image immediately from UI
    setIsTyping(true);
    
    // Save state immediately (optimistic UI)
    await saveCurrentSession(updatedMessages);

    try {
        const response = await chatWithAi(
            updatedMessages, 
            textToSend, 
            imagePayload ? { data: imagePayload.data, mimeType: imagePayload.mimeType } : null
        );
        
        const aiMsg: AIMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.text || "I processed that.",
            timestamp: Date.now(),
            sources: response.sources,
            attachments: response.attachments
        };
        
        const finalMessages = [...updatedMessages, aiMsg];
        setMessages(finalMessages);
        setIsTyping(false);
        
        // Save final state
        await saveCurrentSession(finalMessages);

        // TRIGGER AUTOMATIC VOICE REPLY
        if (!voiceMode && !isMuted) speak(aiMsg.content || "");

    } catch (err: any) {
        setErrorMsg(`Error: ${err.message}`);
        setIsTyping(false);
    }
  };

  const toggleVoiceMode = () => {
    if (voiceMode) { stopSession(); setVoiceMode(false); } 
    else { stop(); setVoiceMode(true); startSession(); }
  };

  const renderAttachments = (attachments?: Attachment[]) => {
      if (!attachments || attachments.length === 0) return null;
      return (
          <div className="flex flex-wrap gap-2 mt-2">
              {attachments.map((att, idx) => (
                  <div key={idx} className="rounded-lg overflow-hidden border border-slate-200 shadow-sm max-w-[200px]">
                      {att.type === 'image' && (
                          <img src={att.url} alt="Generated" className="w-full h-auto" />
                      )}
                      {att.type === 'video' && (
                          <div className="bg-black relative group aspect-video flex items-center justify-center">
                              <video src={att.url} controls className="w-full h-full" />
                          </div>
                      )}
                      <div className="bg-slate-50 p-1 text-[8px] text-center text-slate-500 font-mono uppercase">
                          Generated by {att.type === 'image' ? 'Imagen 3' : 'Veo'}
                      </div>
                  </div>
              ))}
          </div>
      );
  };

  if (!isOpen) {
    return (
        <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 z-50 group flex items-center justify-center">
            <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75 group-hover:bg-primary/30 transition-all"></div>
            <BeateAiLogo pulsing={true} />
        </button>
    );
  }

  return (
      <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 transition-all duration-300 ${isExpanded ? 'w-[600px] h-[800px]' : 'w-96 h-[600px]'}`}>
        <div className="bg-white w-full h-full rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden relative">
          
          {/* Header */}
          <div className="bg-slate-900 p-4 shrink-0 flex items-center justify-between text-white z-20 relative">
             <div className="flex items-center gap-3">
                <BeateAiLogo size="sm" />
                <div>
                    <h3 className="text-sm font-bold leading-none">Nurse Betty</h3>
                    <p className="text-[10px] text-cyan-400 mt-1 font-bold uppercase tracking-wider">AI Medical Assistant</p>
                </div>
             </div>
             <div className="flex items-center gap-1">
                <button onClick={() => setShowHistory(!showHistory)} className={`p-2 rounded-lg transition-colors ${showHistory ? 'bg-white/20 text-white' : 'hover:bg-white/10 text-slate-400'}`} title="Chat History">
                    <History className="w-4 h-4" />
                </button>
                <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                    {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
             </div>
          </div>

          {/* Audio Toolbar (Conditional) */}
          {!voiceMode && (
             <div className="bg-slate-900 px-4 pb-2 border-b border-slate-800 z-20">
                 <div className="flex items-center justify-between bg-slate-800/50 rounded-lg p-2 border border-slate-700">
                    <div className="flex items-center gap-1">
                        <button 
                            onClick={playbackState === 'playing' ? pause : resume} 
                            disabled={playbackState === 'stopped'}
                            className={`p-1.5 rounded-md transition-colors ${playbackState === 'playing' ? 'text-amber-400 hover:bg-amber-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'} disabled:opacity-30`}
                        >
                            {playbackState === 'playing' ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        </button>
                        <button 
                            onClick={stop} 
                            disabled={playbackState === 'stopped'}
                            className="p-1.5 text-rose-400 hover:bg-rose-400/10 rounded-md transition-colors disabled:opacity-30"
                        >
                            <Square className="w-3 h-3 fill-current" />
                        </button>
                        <button 
                            onClick={restart}
                            className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-md transition-colors"
                        >
                            <ReplayIcon className="w-3 h-3" />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-3 w-px bg-slate-700 mx-1"></div>
                        <button 
                            onClick={() => setIsMuted(!isMuted)} 
                            className={`p-1.5 rounded-md transition-colors ${isMuted ? 'text-rose-400 bg-rose-400/10' : 'text-slate-400 hover:text-white'}`}
                        >
                            {isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                        </button>
                    </div>
                 </div>
             </div>
          )}

          {/* Main Content Container */}
          <div className="flex-1 flex overflow-hidden relative">
              
              {/* History Sidebar Overlay */}
              <div className={`absolute inset-y-0 left-0 w-64 bg-slate-50 border-r border-slate-200 transform transition-transform duration-300 z-10 ${showHistory ? 'translate-x-0' : '-translate-x-full'}`}>
                  <div className="p-4 border-b border-slate-200">
                      <button onClick={handleNewChat} className="w-full py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-teal-700 shadow-sm transition-all">
                          <Plus className="w-4 h-4" /> New Conversation
                      </button>
                  </div>
                  <div className="overflow-y-auto h-full pb-20 p-2 space-y-1">
                      {sessions.length === 0 && <p className="text-xs text-slate-400 text-center py-4">No history yet.</p>}
                      {sessions.map(s => (
                          <div 
                            key={s.id} 
                            onClick={() => handleSelectSession(s.id)}
                            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer text-xs transition-colors ${currentSessionId === s.id ? 'bg-white border-l-4 border-primary shadow-sm' : 'hover:bg-slate-200 text-slate-600'}`}
                          >
                              <div className="truncate flex-1 font-medium">{s.title}</div>
                              <button onClick={(e) => handleDeleteSession(e, s.id)} className="p-1 text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all">
                                  <Trash2 className="w-3 h-3" />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50 w-full" onClick={() => setShowHistory(false)}>
                 {messages.map((msg, i) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                       <div className={`max-w-[85%] rounded-2xl p-3 text-sm shadow-sm ${msg.role === 'user' ? 'bg-primary text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                          {msg.attachments && renderAttachments(msg.attachments)}
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          {msg.sources && msg.sources.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-slate-100/20 text-[10px] opacity-70">
                                  <span className="font-bold">Sources:</span> {msg.sources.map(s => s.title).join(', ')}
                              </div>
                          )}
                       </div>
                    </div>
                 ))}
                 {isTyping && (
                    <div className="flex justify-start">
                       <div className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                          <span className="text-xs text-slate-400">Thinking...</span>
                       </div>
                    </div>
                 )}
                 <div ref={messagesEndRef} />
              </div>
          </div>

          {/* Voice Mode Overlay */}
          {voiceMode && (
             <div className="absolute inset-x-0 bottom-[72px] bg-white/90 backdrop-blur-md p-8 flex flex-col items-center justify-center gap-6 animate-in slide-in-from-bottom-full z-20">
                <AudioVisualizer isSpeaking={isLiveSpeaking} volume={volume} />
                <div className="text-center">
                   <p className="text-sm font-bold text-slate-800">{isLiveSpeaking ? 'Nurse Betty is speaking...' : 'I am listening...'}</p>
                   <p className="text-xs text-slate-400 mt-1">{liveError || 'Secure Voice Triage Active'}</p>
                </div>
                <button onClick={toggleVoiceMode} className="p-4 bg-rose-500 text-white rounded-full shadow-lg hover:bg-rose-600 transition-all">
                   <MicOff className="w-6 h-6" />
                </button>
             </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-slate-100 shrink-0 bg-white z-20">
             {selectedImage && (
                 <div className="mb-2 p-2 bg-slate-100 rounded-lg flex items-center justify-between">
                     <div className="flex items-center gap-2">
                         <div className="w-8 h-8 rounded overflow-hidden">
                             <img src={selectedImage.preview} alt="Upload" className="w-full h-full object-cover" />
                         </div>
                         <span className="text-xs font-bold text-slate-600">Image attached</span>
                     </div>
                     <button onClick={() => setSelectedImage(null)} className="text-slate-400 hover:text-rose-500"><XCircle className="w-4 h-4" /></button>
                 </div>
             )}
             {errorMsg && <div className="mb-2 text-[10px] text-rose-500 font-bold flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errorMsg}</div>}
             <div className="flex items-center gap-2">
                <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-lg transition-colors hover:bg-slate-100 text-slate-400">
                   <Paperclip className="w-5 h-5" />
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                
                <button onClick={toggleVoiceMode} className={`p-2 rounded-lg transition-colors ${voiceMode ? 'bg-cyan-100 text-cyan-600' : 'hover:bg-slate-100 text-slate-400'}`}>
                   <Mic className="w-5 h-5" />
                </button>
                <div className="flex-1 relative">
                   <input 
                      ref={inputRef}
                      type="text" 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSend()}
                      placeholder="Ask a question or request a diagram..."
                      className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-primary text-sm"
                   />
                   <button onClick={() => handleSend()} className="absolute right-2 top-2 p-1 text-primary hover:bg-primary/10 rounded-lg transition-colors">
                      <Send className="w-5 h-5" />
                   </button>
                </div>
             </div>
          </div>
          <div className="flex justify-center p-2 border-t border-slate-50 bg-slate-50/50 z-20">
             <SaILabsBadge size="sm" />
          </div>
        </div>
      </div>
  );
};

export default ChatWidget;
