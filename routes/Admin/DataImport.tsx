
import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2, Download, Users, Truck } from 'lucide-react';
import { apiClient } from '../../libs/api';
import { User, Supplier } from '../../types';

const DataImport: React.FC = () => {
    const [importType, setImportType] = useState<'patients' | 'suppliers'>('patients');
    const [isProcessing, setIsProcessing] = useState(false);
    const [log, setLog] = useState<{type: 'success'|'error', msg: string} | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        setLog(null);

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                let text = event.target?.result as string;
                
                // 🛡️ Sanitize: Remove UTF-8 Byte Order Mark (BOM) if present (Common in Excel CSVs)
                // Without this, the first column 'Name' becomes '\ufeffName' and fails validation.
                text = text.replace(/^\uFEFF/, '');

                // Normalize newlines and filter empty rows
                const rows = text.split(/\r?\n/).map(row => row.trim()).filter(row => row.length > 0);
                
                if (rows.length < 2) throw new Error("CSV file is empty or missing data rows.");

                // Parse Headers (Case insensitive, trimmed)
                const headers = rows[0].split(',').map(h => h.trim().toLowerCase());
                
                let successCount = 0;

                if (importType === 'patients') {
                    // VALIDATION: Check required headers
                    const reqFields = ['name', 'email', 'phone'];
                    const missing = reqFields.filter(f => !headers.includes(f));
                    if (missing.length > 0) {
                        throw new Error(`Invalid CSV Format. Missing columns: ${missing.join(', ')}`);
                    }

                    // Map columns dynamically based on header index
                    const nameIdx = headers.indexOf('name');
                    const emailIdx = headers.indexOf('email');
                    const phoneIdx = headers.indexOf('phone');

                    const patients: User[] = rows.slice(1).map((row, i): User | null => {
                        // Handle comma separation respecting basic CSV rules (simple split)
                        const cols = row.split(',').map(c => c.trim());
                        
                        // Basic row validation
                        if (!cols[nameIdx] || !cols[emailIdx]) {
                            console.warn(`Skipping row ${i + 2}: Missing Name or Email`);
                            return null;
                        }

                        return {
                            id: 'p_' + Math.random().toString(36).substr(2, 6),
                            name: cols[nameIdx],
                            email: cols[emailIdx],
                            phone: cols[phoneIdx] || '',
                            role: 'patient',
                            medicalSummary: { conditions: [], allergies: [] }
                        };
                    }).filter((p): p is User => p !== null);

                    if (patients.length === 0) throw new Error("No valid patient records found in file.");

                    const result = await apiClient.patients.bulkCreate(patients);
                    successCount = result.count;

                } else {
                    // Supplier Import Logic
                    // We allow 'name' alias for 'companyname'
                    if (!headers.includes('companyname') && !headers.includes('name')) {
                         throw new Error("Invalid CSV. Missing 'CompanyName' (or 'Name') column.");
                    }

                    // Dynamic Mapping
                    const nameIdx = headers.indexOf('companyname') > -1 ? headers.indexOf('companyname') : headers.indexOf('name');
                    const catIdx = headers.indexOf('category');
                    const contactIdx = headers.indexOf('contactperson');
                    const emailIdx = headers.indexOf('email');
                    const phoneIdx = headers.indexOf('phone');

                    const suppliers: Supplier[] = rows.slice(1).map((row): Supplier => {
                        const cols = row.split(',').map(c => c.trim());
                        return {
                            id: 's_' + Math.random().toString(36).substr(2, 6),
                            name: cols[nameIdx] || 'Unknown',
                            category: cols[catIdx] || 'General',
                            contactPerson: cols[contactIdx] || '',
                            email: cols[emailIdx] || '',
                            phone: cols[phoneIdx] || ''
                        };
                    });

                    const result = await apiClient.suppliers.bulkCreate(suppliers);
                    successCount = result.count;
                }

                setLog({ type: 'success', msg: `Successfully processed and imported ${successCount} ${importType}.` });
            } catch (err: any) {
                console.error(err);
                setLog({ type: 'error', msg: err.message });
            } finally {
                setIsProcessing(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        };
        reader.readAsText(file);
    };

    const downloadTemplate = () => {
        let csvContent = "";
        let filename = "";
        if (importType === 'patients') {
            csvContent = "Name,Email,Phone\nJohn Doe,john@example.com,+27821234567\nJane Smith,jane@test.com,+27712345678";
            filename = "patients_template.csv";
        } else {
            csvContent = "CompanyName,Category,ContactPerson,Email,Phone\nMediSupply Co,Medical,Mike Ross,sales@medisupply.co.za,+27215551234\nTech IT,IT Support,Sarah Connor,support@techit.com,+27119998888";
            filename = "suppliers_template.csv";
        }

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-bold text-slate-800">Bulk Data Import</h3>
                    <p className="text-sm text-slate-500">Upload CSV files to populate your database.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Import Type Selector */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <h4 className="font-bold text-slate-700">1. Select Data Type</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <button 
                            onClick={() => { setImportType('patients'); setLog(null); }}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${importType === 'patients' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}`}
                        >
                            <Users className="w-8 h-8" />
                            <span className="font-bold">Patients</span>
                        </button>
                        <button 
                            onClick={() => { setImportType('suppliers'); setLog(null); }}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${importType === 'suppliers' ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-300'}`}
                        >
                            <Truck className="w-8 h-8" />
                            <span className="font-bold">Suppliers</span>
                        </button>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
                        <div className="font-bold mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" /> CSV Format Required
                        </div>
                        {importType === 'patients' ? (
                            <code className="block bg-white p-2 rounded border border-blue-200 text-xs font-mono">Name, Email, Phone</code>
                        ) : (
                            <code className="block bg-white p-2 rounded border border-blue-200 text-xs font-mono">CompanyName, Category, ContactPerson, Email, Phone</code>
                        )}
                        <button onClick={downloadTemplate} className="mt-3 text-xs font-bold underline hover:text-blue-900 flex items-center gap-1">
                            <Download className="w-3 h-3" /> Download Sample Template
                        </button>
                    </div>
                </div>

                {/* Upload Zone */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <h4 className="font-bold text-slate-700 mb-6">2. Upload File</h4>
                    
                    <div 
                        className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-slate-50 transition-colors cursor-pointer group min-h-[200px]"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileUpload} 
                            accept=".csv" 
                            className="hidden" 
                        />
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:text-primary group-hover:bg-primary/10 mb-4 transition-colors">
                            {isProcessing ? <Loader2 className="w-8 h-8 animate-spin" /> : <Upload className="w-8 h-8" />}
                        </div>
                        <p className="text-slate-600 font-medium">Click to upload CSV</p>
                        <p className="text-xs text-slate-400 mt-2">Max 5MB</p>
                    </div>

                    {log && (
                        <div className={`mt-6 p-4 rounded-lg flex items-start gap-3 ${log.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                            {log.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" /> : <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />}
                            <div className="text-sm font-bold break-words">{log.msg}</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataImport;
