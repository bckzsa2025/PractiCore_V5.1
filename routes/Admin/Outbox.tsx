
import React, { useEffect, useState } from 'react';
import { Mail, MessageSquare, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { apiClient } from '../../libs/api';

const Outbox: React.FC = () => {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchLogs = async () => {
        setLoading(true);
        const allLogs = await apiClient.logs.list() as any[];
        // Filter for communications only
        const comms = allLogs.filter(l => l.message.includes('EMAIL SENT') || l.level === 'email' || l.level === 'sms').reverse();
        setLogs(comms);
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 h-full flex flex-col animate-in fade-in">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                        <Mail className="w-5 h-5 text-slate-500" /> Communications Outbox
                    </h3>
                    <p className="text-sm text-slate-500">History of sent emails and messages.</p>
                </div>
                <button onClick={fetchLogs} className="p-2 hover:bg-slate-200 rounded-lg transition-colors">
                    <RefreshCw className={`w-4 h-4 text-slate-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            <div className="flex-1 overflow-auto p-4 space-y-4">
                {logs.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400">
                        <Mail className="w-12 h-12 mb-3 opacity-20" />
                        <p>No messages sent yet.</p>
                    </div>
                ) : (
                    logs.map((log) => (
                        <div key={log.id} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm flex items-start gap-4 hover:border-primary/20 transition-all">
                            <div className={`p-2 rounded-lg shrink-0 ${log.message.includes('EMAIL') ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>
                                {log.message.includes('EMAIL') ? <Mail className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-bold text-slate-800 text-sm">{log.message.includes('EMAIL') ? 'Email Notification' : 'SMS Alert'}</span>
                                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {new Date(log.timestamp).toLocaleString()}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-600 break-words font-mono bg-slate-50 p-2 rounded border border-slate-100">
                                    {log.message}
                                </p>
                                <div className="mt-2 flex items-center gap-1 text-[10px] text-green-600 font-bold">
                                    <CheckCircle className="w-3 h-3" /> Sent via Virtual Gateway
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Outbox;
