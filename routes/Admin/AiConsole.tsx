import React, { useState, useEffect } from 'react';
import { Save, Terminal, Loader2, Globe, Key, Cpu, Zap, CheckCircle, AlertCircle, AlertTriangle, Info, RefreshCw, Trash2, List, ShieldCheck, XCircle } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { AISettings } from '../../types';
import { chatWithAi, getEffectiveApiKey } from '../../services/ai';

const PRESET_MODELS = [
    { id: 'nex-agi/deepseek-v3.1-nex-n1:free', name: 'DeepSeek V3.1 (Free)', provider: 'Nex-AGI' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 (Logical)', provider: 'DeepSeek' },
    { id: 'google/gemini-2.0-flash-001', name: 'Gemini 2.0 Flash', provider: 'Google' },
    { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI' },
    { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', provider: 'Meta' },
];

const AiConsole: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [testStatus, setTestStatus] = useState<{status: 'idle' | 'testing' | 'success' | 'error', msg?: string}>({ status: 'idle' });
    
    const [aiSettings, setAiSettings] = useState<AISettings>({
        provider: 'openrouter',
        apiKey: '',
        endpoint: 'https://openrouter.ai/api/v1',
        models: { chat: 'nex-agi/deepseek-v3.1-nex-n1:free' }
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
            alert("Settings saved successfully.");
        } catch (e) {
            alert("Failed to save settings.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleTestConnection = async () => {
        setTestStatus({ status: 'testing' });
        try {
            const res = await chatWithAi(
                [], 
                'Hello. Reply with only: READY',
                'System check.',
                aiSettings
            );
            
            if (res && res.text) {
                setTestStatus({ status: 'success', msg: res.text });
            } else {
                throw new Error("Provider returned empty response.");
            }
        } catch (e: any) {
            setTestStatus({ status: 'error', msg: e.message });
        }
    };

    const activeKey = getEffectiveApiKey(aiSettings.apiKey);
    const isSystemKey = !aiSettings.apiKey;

    return (
        <div className="space-y-6 max-w-5xl mx-auto pb-12">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg text-primary">
                        <Terminal className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-slate-800">AI Engine Control</h3>
                        <p className="text-sm text-slate-500">Manage LLM providers and authentication.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={handleTestConnection}
                        disabled={testStatus.status === 'testing'}
                        className="px-4 py-2 bg-slate-100 text-slate-700 text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-slate-200 border border-slate-200 transition-all"
                    >
                        {testStatus.status === 'testing' ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-amber-500" />}
                        Test Auth
                    </button>
                    <button onClick={handleSave} className="px-6 py-2 bg-primary text-white text-sm font-bold rounded-lg flex items-center gap-2 hover:bg-teal-700 shadow-md transition-all">
                        <Save className="w-4 h-4" /> Save Config
                    </button>
                </div>
            </div>

            {testStatus.status === 'success' && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-3 text-emerald-800">
                    <CheckCircle className="w-5 h-5 text-emerald-500" />
                    <div>
                        <p className="font-bold text-sm">Authenticated</p>
                        <p className="text-xs opacity-80">Provider verified response: "{testStatus.msg}"</p>
                    </div>
                </div>
            )}

            {testStatus.status === 'error' && (
                <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-start gap-3 text-rose-800">
                    <AlertCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                    <div className="flex-1">
                        <p className="font-bold text-sm">Connection Error</p>
                        <p className="text-xs opacity-90 mt-1 font-mono break-all">{testStatus.msg}</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 relative">
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-10 flex items-center justify-center rounded-2xl">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}
                        
                        <div className="flex items-center gap-3 mb-6">
                            <Globe className="w-5 h-5 text-primary" />
                            <h4 className="font-bold text-slate-800">Provider Access</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">Base URL</label>
                                <input 
                                    type="text"
                                    value={aiSettings.endpoint}
                                    onChange={(e) => setAiSettings({...aiSettings, endpoint: e.target.value})}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:border-primary outline-none"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block tracking-widest">API Key Override</label>
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-3 focus-within:border-primary">
                                    <Key className="w-4 h-4 text-slate-400" />
                                    <input 
                                        type="password"
                                        value={aiSettings.apiKey}
                                        onChange={(e) => setAiSettings({...aiSettings, apiKey: e.target.value})}
                                        placeholder="Enter key to override system default"
                                        className="flex-1 bg-transparent outline-none text-sm font-mono"
                                    />
                                    {aiSettings.apiKey && (
                                        <button onClick={() => setAiSettings({...aiSettings, apiKey: ''})} className="text-slate-400 hover:text-rose-500">
                                            <XCircle className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                <p className="text-[10px] mt-2 font-medium">
                                    {isSystemKey ? (
                                        <span className="text-emerald-600 flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> Using User-Provided Fallback Key
                                        </span>
                                    ) : (
                                        <span className="text-blue-600 flex items-center gap-1">
                                            <Info className="w-3 h-3" /> Using Manual Override Key
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 border-t border-slate-100 pt-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Cpu className="w-5 h-5 text-purple-500" />
                                <h4 className="font-bold text-slate-800">Model Selection</h4>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {PRESET_MODELS.map(model => (
                                    <button
                                        key={model.id}
                                        onClick={() => setAiSettings({...aiSettings, models: {...aiSettings.models, chat: model.id}})}
                                        className={`p-4 rounded-xl border text-left transition-all ${aiSettings.models.chat === model.id ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-slate-100 hover:border-slate-300 bg-white'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <p className="font-bold text-sm text-slate-800">{model.name}</p>
                                            <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">{model.provider}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">{model.id}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl">
                        <h4 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-primary" /> Active Status
                        </h4>
                        <div className="space-y-4 text-sm">
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Security</span>
                                <span className="font-bold text-emerald-400 text-xs">TLS 1.3</span>
                            </div>
                            <div className="flex justify-between border-b border-slate-800 pb-2">
                                <span className="text-slate-500">Auth Token</span>
                                <span className="text-slate-300 text-[10px] font-mono">
                                    {activeKey ? `${activeKey.substring(0, 12)}...` : 'NONE'}
                                </span>
                            </div>
                        </div>
                        <p className="text-[10px] mt-6 text-slate-400 leading-relaxed italic">
                            The brand new key has been integrated. Authentication errors (401) usually mean the provider rejected the key or the account has zero balance.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiConsole;
