
import React, { useState, useEffect } from 'react';
import { Database, Plus, Trash2, Search, BookOpen, Save, Loader2, RefreshCw } from 'lucide-react';
import { apiClient } from '../../libs/api';

const KnowledgeBase: React.FC = () => {
    const [vectors, setVectors] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    
    // New Entry Form
    const [newText, setNewText] = useState('');
    const [newSource, setNewSource] = useState('Manual Entry');
    const [isSaving, setIsSaving] = useState(false);

    // Test Search
    const [testQuery, setTestQuery] = useState('');
    const [testResults, setTestResults] = useState<any[]>([]);

    const fetchVectors = async () => {
        setLoading(true);
        try {
            // We need to expose a way to list all vectors in api.ts or just read from DB directly here for admin
            // Since api.knowledge.search is for RAG, we'll use api.db.getAll for management
            const all = await apiClient.db.getAll<any>('vectors');
            setVectors(all.reverse()); // Newest first
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVectors();
    }, []);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newText.trim()) return;
        
        setIsSaving(true);
        try {
            await apiClient.knowledge.add(newText, newSource);
            setNewText('');
            setNewSource('Manual Entry');
            setIsAdding(false);
            fetchVectors();
        } catch (e) {
            alert("Failed to add to Knowledge Base");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this memory fragment?")) return;
        await apiClient.db.delete('vectors', id);
        // Also need to clear from memory engine, but a reload fixes that. 
        // For MVP, we just remove from UI.
        setVectors(prev => prev.filter(v => v.id !== id));
    };

    const handleTestSearch = async () => {
        if (!testQuery) return;
        const results = await apiClient.knowledge.search(testQuery, 3);
        setTestResults(results);
    };

    const filtered = vectors.filter(v => 
        v.text.toLowerCase().includes(searchTerm.toLowerCase()) || 
        v.source.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 animate-in fade-in">
            {/* Header */}
            <div className="p-6 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-primary" /> Knowledge Base
                    </h3>
                    <p className="text-sm text-slate-500">Manage the facts and protocols Nurse Betty uses for RAG.</p>
                </div>
                <div className="flex gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Filter knowledge..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-primary w-64" 
                        />
                    </div>
                    <button 
                        onClick={() => setIsAdding(true)}
                        className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-lg hover:bg-teal-700 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Add Knowledge
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                
                {/* List View */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {isAdding && (
                        <div className="bg-white p-6 rounded-xl border-2 border-primary/20 shadow-lg mb-6 animate-in slide-in-from-top-4">
                            <h4 className="font-bold text-slate-800 mb-4">New Knowledge Entry</h4>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Source / Category</label>
                                    <input 
                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary"
                                        value={newSource}
                                        onChange={e => setNewSource(e.target.value)}
                                        placeholder="e.g. Pricing, Clinical Protocol, FAQ"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Knowledge Content</label>
                                    <textarea 
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-primary h-24 resize-none"
                                        value={newText}
                                        onChange={e => setNewText(e.target.value)}
                                        placeholder="e.g. The cost for a general checkup is R500. We are closed on public holidays."
                                    />
                                </div>
                                <div className="flex justify-end gap-2">
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-lg font-bold text-sm">Cancel</button>
                                    <button type="submit" disabled={isSaving} className="px-6 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-teal-700 disabled:opacity-50">
                                        {isSaving ? 'Indexing...' : 'Save to Vector DB'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center p-8"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
                    ) : filtered.length === 0 ? (
                        <div className="text-center p-12 text-slate-400">
                            <Database className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>No knowledge entries found.</p>
                        </div>
                    ) : (
                        filtered.map(v => (
                            <div key={v.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-primary/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded">{v.source}</span>
                                    <button onClick={() => handleDelete(v.id)} className="text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-slate-700 text-sm leading-relaxed">{v.text}</p>
                                <div className="mt-2 text-[10px] text-slate-400 font-mono">{v.id} • {new Date(v.timestamp).toLocaleString()}</div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar: Test Search */}
                <div className="w-full md:w-80 bg-white border-l border-slate-200 p-6 flex flex-col shrink-0">
                    <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-purple-500" /> Simulator
                    </h4>
                    <div className="mb-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Query Vector Engine</label>
                        <div className="flex gap-2">
                            <input 
                                className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                                value={testQuery}
                                onChange={e => setTestQuery(e.target.value)}
                                placeholder="Ask question..."
                                onKeyDown={e => e.key === 'Enter' && handleTestSearch()}
                            />
                            <button onClick={handleTestSearch} className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
                                <Search className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4">
                        {testResults.length > 0 && <p className="text-xs font-bold text-slate-400 uppercase">Top Matches</p>}
                        {testResults.map((r, i) => (
                            <div key={i} className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                                <div className="flex justify-between mb-1">
                                    <span className="text-[10px] font-bold text-purple-700">{r.source}</span>
                                    <span className="text-[10px] font-mono text-purple-500">{(r.score * 100).toFixed(1)}%</span>
                                </div>
                                <p className="text-xs text-purple-900 line-clamp-3">{r.text}</p>
                            </div>
                        ))}
                        {testResults.length === 0 && testQuery && (
                            <p className="text-xs text-slate-400 italic text-center">No relevant matches found for current threshold.</p>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default KnowledgeBase;
