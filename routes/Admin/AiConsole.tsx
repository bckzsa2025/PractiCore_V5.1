
import React, { useState, useEffect } from 'react';
import { Save, Terminal, Loader2, Globe, Key, Cpu, Zap, PhoneCall, Code, Play, Bot, ShieldCheck, XCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { AISettings } from '../../types';
import { chatWithAi, getEffectiveApiKey } from '../../services/ai';

const PRESET_MODELS = [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', provider: 'Google' },
    { id: 'nex-agi/deepseek-v3.1-nex-n1:free', name: 'DeepSeek V3.1 (Free)', provider: 'Nex-AGI' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Logical)', provider: 'DeepSeek' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Emma-I™ (Llama 3.3)', provider: 'Meta' },
];

const AiConsole: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<{status: 'idle' | 'testing' | 'success' | 'error', msg?: string}>({ status: 'idle' });
    
    // Voice Simulator State
    const [simInput, setSimInput] = useState('');
    const [simOutput, setSimOutput] = useState<{text: string, twiml: string} | null>(null);
    const [isSimulating, setIsSimulating] = useState(false);

    const [aiSettings, setAiSettings] = useState<AISettings>({
        provider: 'openrouter',
        apiKey: '',
        endpoint: 'https://openrouter.ai/api/v1',
        models: { chat: 'nex-agi/deepseek-v3.1-nex-n1:free' },
        systemInstruction: ''
    });

    useEffect(() => {
        const loadConfig = async () => {
            setIsLoading(true);
            try {
                const aConfig = await apiClient.settings.getAI();
                setAiSettings(aConfig);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        loadConfig();
    }, []);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            await apiClient.settings.saveAI(aiSettings);
            setTestStatus({ status: 'idle' });
            alert("AI settings saved.");
        } catch (e) {
            alert("Failed to save AI configuration.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setTestStatus({ status: 'testing' });
        try {
            // Test uses the current settings state
            const res = await chatWithAi([], 'READY?', null, undefined, aiSettings);
            if (res && res.text) setTestStatus({ status: 'success', msg: res.text });
        } catch (e: any) {
            setTestStatus({ status: 'error', msg: e.message });
        }
    };

    const handleVoiceSimulation = async () => {
        if (!simInput.trim()) return;
        setIsSimulating(true);
        try {
            // Call the virtual voice webhook simulator
            const xml = await apiClient.webhooks.twilio.voice(simInput);
            
            // Extract the 'Say' text from the TwiML XML
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xml, "text/xml");
            const sayText = xmlDoc.getElementsByTagName("Say")[0]?.childNodes[0]?.nodeValue || "No TwiML text.";
            
            setSimOutput({ text: sayText, twiml: xml });

            // AUDIBLE FEEDBACK
            const utterance = new SpeechSynthesisUtterance(sayText);
            utterance.rate = 1.1;
            window.speechSynthesis.speak(utterance);

        } catch(e) {
            alert("Voice simulation failed.");
        } finally {
            setIsSimulating(false);
        }
    };

    const activeKey = getEffectiveApiKey(aiSettings.apiKey);
    const isSystemKey = !aiSettings.apiKey;

    return (
        <div className="space-y-8 max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-primary">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">AI Intelligence Core</h3>
                        <p className="text-sm text-slate-500">Global LLM orchestrator and simulation environment.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleTestConnection}
                        disabled={testStatus.status === 'testing'}
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-200 border border-slate-200 transition-all"
                    >
                        {testStatus.status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                        Verify Auth
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-teal-700 shadow-md transition-all">
                        <Save className="w-4 h-4" /> Save Configuration
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative overflow-hidden">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-slate-800">API Provider Node</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">Endpoint Gateway</label>
                                <input type="text" value={aiSettings.endpoint} onChange={e => setAiSettings({...aiSettings, endpoint: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary outline-none" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">API Master Key</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-primary">
                                    <Key className="w-4 h-4 text-slate-400" />
                                    <input type="password" value={aiSettings.apiKey} onChange={e => setAiSettings({...aiSettings, apiKey: e.target.value})} placeholder="Using Emma-I™ Fallback" className="flex-1 bg-transparent outline-none text-xs font-mono" />
                                    {aiSettings.apiKey && <button onClick={() => setAiSettings({...aiSettings, apiKey: ''})} className="text-slate-400 hover:text-rose-500"><XCircle className="w-4 h-4" /></button>}
                                </div>
                                <p className="text-[9px] mt-2 text-slate-400">
                                    {isSystemKey ? "✓ Operating on pre-configured enterprise token." : "⚠ Operating on user-provided manual override."}
                                </p>
                            </div>
                        </div>

                        <div className="mt-6">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 block">System Instruction (Persona)</label>
                            <textarea 
                                value={aiSettings.systemInstruction || ''}
                                onChange={e => setAiSettings({...aiSettings, systemInstruction: e.target.value})}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono focus:border-primary outline-none h-32 resize-none"
                                placeholder="You are a helpful medical assistant..."
                            ></textarea>
                            <p className="text-[9px] mt-2 text-slate-400">Overrides the default Nurse Betty persona.</p>
                        </div>

                        <div className="mt-10 pt-8 border-t border-slate-100">
                            <div className="flex items-center gap-3 mb-6">
                                <Cpu className="w-5 h-5 text-purple-500" />
                                <h4 className="font-bold text-slate-800">Model Selection Engine</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {PRESET_MODELS.map(model => (
                                    <button key={model.id} onClick={() => setAiSettings({...aiSettings, models: {chat: model.id}})} className={`p-4 rounded-xl border text-left transition-all ${aiSettings.models.chat === model.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-slate-300 bg-white'}`}>
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-xs text-slate-800">{model.name}</p>
                                            <span className="text-[8px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">{model.provider}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">{model.id}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Telephony Simulator */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <PhoneCall className="w-5 h-5 text-emerald-500" />
                                <h4 className="font-bold text-slate-800">Telephony Simulator</h4>
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">VIRTUAL CALL SERVER</span>
                        </div>
                        
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            Simulate an incoming patient call. This tests the logic used by the Twilio voice webhook, converting transcriptions to AI triage responses. 
                            <strong>(Audio output will play via browser speakers)</strong>
                        </p>

                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                value={simInput}
                                onChange={e => setSimInput(e.target.value)}
                                placeholder="Patient says: I'd like to book an appointment for tomorrow..."
                                onKeyDown={e => e.key === 'Enter' && handleVoiceSimulation()}
                                className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-emerald-500 transition-all"
                            />
                            <button 
                                onClick={handleVoiceSimulation}
                                disabled={isSimulating || !simInput.trim()}
                                className="px-6 py-3 bg-slate-800 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-slate-900 disabled:opacity-50"
                            >
                                {isSimulating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />} Simulate
                            </button>
                        </div>

                        {simOutput && (
                            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2 text-emerald-700 font-bold text-[10px] uppercase tracking-widest">
                                        <Bot className="w-4 h-4" /> AI Voice Triage
                                    </div>
                                    <p className="text-sm text-emerald-900 leading-relaxed italic">"{simOutput.text}"</p>
                                </div>
                                <div className="p-4 bg-slate-900 rounded-xl">
                                    <div className="flex items-center gap-2 mb-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                        <Code className="w-4 h-4" /> TwiML Payload
                                    </div>
                                    <pre className="text-[10px] text-teal-400 font-mono whitespace-pre-wrap overflow-auto max-h-32">{simOutput.twiml}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl shadow-slate-900/40 sticky top-24">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" /> Core Security Stack
                        </h4>
                        <div className="space-y-4 text-xs">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Auth Protocol</span>
                                <span className="font-bold text-emerald-400">Bearer TLS 1.3</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Active Token</span>
                                <span className="text-slate-300 font-mono">
                                    {activeKey ? `${activeKey.substring(0, 10)}...` : 'NONE'}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-500">Latency</span>
                                <span className="text-slate-300">~1.2s avg</span>
                            </div>
                        </div>
                        <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10 italic text-[10px] text-slate-400 leading-relaxed">
                            "Emma-I™ logic is now running on custom-optimized prompt structures for clinical triage."
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiConsole;
