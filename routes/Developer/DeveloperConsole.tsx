
import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Activity, Database, Server, Shield, Cpu, HardDrive, LogOut, Code, Bug, Globe, Download, Upload, AlertTriangle, CheckCircle, Loader2, RefreshCcw } from 'lucide-react';
import { User } from '../../types';
import { apiClient } from '../../libs/api';
import { SaILabsBadge } from '../../components/ui/SaILabsBadge';

interface DeveloperConsoleProps {
  user: User;
  onLogout: () => void;
}

const DeveloperConsole: React.FC<DeveloperConsoleProps> = ({ user, onLogout }) => {
  const [activeTab, setActiveTab] = useState('system');
  const [logs, setLogs] = useState<string[]>([]);
  const [stats, setStats] = useState({ cpu: 12, memory: 45, requests: 1240, latency: 45 });
  const [dbStatus, setDbStatus] = useState<{msg: string, type: 'info'|'success'|'error'} | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Simulate live data
  useEffect(() => {
    const interval = setInterval(() => {
        setStats(prev => ({
            cpu: Math.floor(Math.random() * 30) + 10,
            memory: Math.floor(Math.random() * 10) + 40,
            requests: prev.requests + Math.floor(Math.random() * 5),
            latency: Math.floor(Math.random() * 20) + 30
        }));
        
        const newLog = `[${new Date().toISOString()}] INFO: API Request /health processed in ${Math.floor(Math.random() * 50)}ms`;
        setLogs(prev => [newLog, ...prev].slice(0, 50));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleBackup = async () => {
      setIsProcessing(true);
      setDbStatus({ msg: "Generating full system backup...", type: 'info' });
      
      try {
          // 1. Export IndexedDB Data (Patients, Appointments, Logs)
          const dbDump = await apiClient.db.exportDump();
          
          // 2. Export ALL LocalStorage Config (Settings, Tokens, CMS Images, Everything)
          const configDump: Record<string, string> = {};
          for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key) {
                  configDump[key] = localStorage.getItem(key) || '';
              }
          }

          // 3. Combine
          const fullBackup = {
              version: "1.0.6",
              timestamp: new Date().toISOString(),
              database: dbDump,
              config: configDump
          };
          
          // 4. Download
          const blob = new Blob([JSON.stringify(fullBackup, null, 2)], { type: "application/json" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `MediCore_Full_Backup_${new Date().toISOString().replace(/[:.]/g, '-')}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          
          setDbStatus({ msg: "Backup downloaded successfully.", type: 'success' });
      } catch (err) {
          console.error(err);
          setDbStatus({ msg: "Failed to generate backup.", type: 'error' });
      } finally {
          setIsProcessing(false);
      }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);
      setDbStatus({ msg: "Parsing backup file...", type: 'info' });

      const reader = new FileReader();
      reader.onload = async (event) => {
          try {
              const data = JSON.parse(event.target?.result as string);
              
              // Validation
              if (!data.database || !data.config) {
                  throw new Error("Invalid backup format. Missing core sections.");
              }

              if (window.confirm(`Restore backup from ${data.timestamp}? \n\n⚠️ DANGER: This will WIPE all current data and replace it with the backup.`)) {
                  
                  // 1. Clean Wipe of LocalStorage
                  localStorage.clear();

                  // 2. Restore IndexedDB
                  await apiClient.db.importDump(data.database);
                  
                  // 3. Restore LocalStorage
                  Object.keys(data.config).forEach(key => {
                      localStorage.setItem(key, data.config[key]);
                  });

                  setDbStatus({ msg: "System restored. Rebooting...", type: 'success' });
                  setTimeout(() => window.location.reload(), 2000);
              } else {
                  setDbStatus({ msg: "Restore cancelled.", type: 'info' });
              }
          } catch (err) {
              console.error(err);
              setDbStatus({ msg: "Error: Corrupt or invalid backup file.", type: 'error' });
          } finally {
              setIsProcessing(false);
              // Reset file input
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  const handleForceResetPWA = async () => {
      if (confirm("🔥 NUKE PROTOCOL: Reset App, Unregister SW, and Clear ALL Caches?\n\nThis is used to fix 'Ghost UI' issues.")) {
          // 1. Unregister SW
          if ('serviceWorker' in navigator) {
              const registrations = await navigator.serviceWorker.getRegistrations();
              for (const registration of registrations) {
                  await registration.unregister();
              }
          }
          
          // 2. Clear Caches (Critical for PWA)
          if ('caches' in window) {
              const cacheNames = await caches.keys();
              await Promise.all(
                  cacheNames.map(name => caches.delete(name))
              );
          }

          // 3. Reload
          window.location.reload();
      }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-mono flex flex-col">
      {/* Top Bar */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between px-6 backdrop-blur-md sticky top-0 z-50">
         <div className="flex items-center gap-3">
             <Terminal className="w-5 h-5 text-green-500" />
             <span className="font-bold text-slate-100">MediCore™::DevConsole <span className="text-slate-600 text-xs">v1.0.6</span></span>
         </div>
         <div className="flex items-center gap-6">
             <div className="flex items-center gap-2 text-xs">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online
             </div>
             <div className="flex items-center gap-2">
                 <div className="w-6 h-6 bg-slate-800 rounded flex items-center justify-center text-xs font-bold text-slate-400">SU</div>
                 <span className="text-sm font-bold text-slate-400">{user.email}</span>
             </div>
             <button onClick={onLogout} className="p-2 hover:bg-red-500/10 hover:text-red-400 rounded transition-colors">
                 <LogOut className="w-4 h-4" />
             </button>
         </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
         {/* Sidebar */}
         <aside className="w-64 border-r border-slate-800 bg-slate-900/30 flex flex-col">
            <nav className="p-4 space-y-1">
                <button onClick={() => setActiveTab('system')} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-bold transition-all ${activeTab === 'system' ? 'bg-slate-800 text-white border-l-2 border-green-500' : 'hover:bg-slate-800/50 text-slate-500'}`}>
                    <Activity className="w-4 h-4" /> System Health
                </button>
                <button onClick={() => setActiveTab('logs')} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-bold transition-all ${activeTab === 'logs' ? 'bg-slate-800 text-white border-l-2 border-green-500' : 'hover:bg-slate-800/50 text-slate-500'}`}>
                    <Code className="w-4 h-4" /> Live Logs
                </button>
                <button onClick={() => setActiveTab('db')} className={`w-full flex items-center gap-3 px-3 py-2 rounded text-sm font-bold transition-all ${activeTab === 'db' ? 'bg-slate-800 text-white border-l-2 border-green-500' : 'hover:bg-slate-800/50 text-slate-500'}`}>
                    <Database className="w-4 h-4" /> Database Ops
                </button>
            </nav>
            <div className="mt-auto p-4 border-t border-slate-800 space-y-6">
                <div className="bg-slate-900 p-3 rounded border border-slate-800 text-xs">
                    <p className="text-slate-500 mb-1">Worker Status</p>
                    <div className="flex justify-between items-center text-green-400 font-bold">
                        <span>Active</span>
                        <span>AsyncDB</span>
                    </div>
                </div>
                
                {/* Branding Badge in Sidebar */}
                <div className="flex justify-center pb-2 opacity-50 hover:opacity-100 transition-opacity">
                    <SaILabsBadge theme="dark" size="sm" />
                </div>
            </div>
         </aside>

         {/* Main View */}
         <main className="flex-1 overflow-y-auto p-8">
            {activeTab === 'system' && (
                <div className="space-y-6 animate-in fade-in">
                    <h2 className="text-xl font-bold text-white mb-6">System Telemetry</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2 text-slate-400 text-xs font-bold uppercase">
                                <Cpu className="w-4 h-4" /> Client CPU
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.cpu}%</div>
                            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-500 transition-all duration-500" style={{ width: `${stats.cpu}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2 text-slate-400 text-xs font-bold uppercase">
                                <HardDrive className="w-4 h-4" /> IDB Usage
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.memory} MB</div>
                            <div className="w-full bg-slate-800 h-1 mt-3 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 transition-all duration-500" style={{ width: `${stats.memory}%` }}></div>
                            </div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2 text-slate-400 text-xs font-bold uppercase">
                                <Globe className="w-4 h-4" /> API Calls
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.requests}</div>
                            <div className="text-xs text-green-500 mt-2 flex items-center gap-1">▲ 12% vs last hour</div>
                        </div>
                        <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg">
                            <div className="flex items-center gap-3 mb-2 text-slate-400 text-xs font-bold uppercase">
                                <Server className="w-4 h-4" /> Latency
                            </div>
                            <div className="text-3xl font-bold text-white">{stats.latency}ms</div>
                             <div className="text-xs text-slate-500 mt-2">VirtualDB</div>
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg mt-6">
                        <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                            <RefreshCcw className="w-5 h-5 text-amber-500" /> PWA Diagnostics & Reset
                        </h3>
                        <p className="text-sm text-slate-400 mb-4">
                            If you are experiencing caching issues, stale data, or "Ghost UI" bugs, use this button.
                            It will unregister the Service Worker and <strong>completely wipe the browser cache</strong>.
                        </p>
                        <button 
                            onClick={handleForceResetPWA}
                            className="px-4 py-2 bg-amber-600/20 text-amber-500 hover:bg-amber-600/30 border border-amber-600/50 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
                        >
                            <AlertTriangle className="w-4 h-4" /> Force Reset App & Cache
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'db' && (
                <div className="space-y-6 animate-in fade-in">
                    <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <Database className="w-6 h-6 text-purple-500" /> Database Operations
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Backup Card */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Download className="w-5 h-5 text-blue-400" /> Export Data (Backup)
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Download a full JSON dump of the <strong>IndexedDB</strong> and <strong>LocalStorage</strong> configurations.
                                Useful for migrations or debugging.
                            </p>
                            <button 
                                onClick={handleBackup}
                                disabled={isProcessing}
                                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />} Download Backup
                            </button>
                        </div>

                        {/* Restore Card */}
                        <div className="bg-slate-900 border border-slate-800 p-6 rounded-lg">
                            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <Upload className="w-5 h-5 text-red-400" /> Restore System
                            </h3>
                            <p className="text-slate-400 text-sm mb-6">
                                Upload a previously generated backup JSON. 
                                <span className="text-red-400 block mt-1 font-bold">⚠ WARNING: This will overwrite ALL current data.</span>
                            </p>
                            <button 
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isProcessing}
                                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 border border-slate-700"
                            >
                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />} Select Backup File
                            </button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".json" 
                                onChange={handleRestore}
                            />
                        </div>
                    </div>

                    {/* Status Message */}
                    {dbStatus && (
                        <div className={`p-4 rounded-lg flex items-start gap-3 border ${
                            dbStatus.type === 'success' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                            dbStatus.type === 'error' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        }`}>
                            {dbStatus.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertTriangle className="w-5 h-5 shrink-0" />}
                            <span className="text-sm font-bold">{dbStatus.msg}</span>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'logs' && (
                <div className="space-y-6 animate-in fade-in h-full flex flex-col">
                    <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                        <Terminal className="w-6 h-6 text-slate-400" /> Real-time Logs
                    </h2>
                    <div className="flex-1 bg-black rounded-xl border border-slate-800 p-4 font-mono text-xs overflow-y-auto">
                        {logs.map((log, i) => (
                            <div key={i} className="mb-1 text-slate-400 border-b border-slate-900 pb-1 last:border-0">
                                <span className="text-green-500">$</span> {log}
                            </div>
                        ))}
                    </div>
                </div>
            )}
         </main>
      </div>
    </div>
  );
};

export default DeveloperConsole;
