import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, CloudLightning } from 'lucide-react';
import { CsvRow } from '../types';

interface Props { onDataParsed: (data: CsvRow[]) => void; }

export const AdminDataUpload: React.FC<Props> = ({ onDataParsed }) => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const processFile = () => {
    if (!file) return;
    setStatus('processing');
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const parsedData: CsvRow[] = [];
        const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;
        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            const parts = line.split(',');
            if (parts.length >= 7) {
                parsedData.push({ date: parts[0].trim(), channelId: parts[1].trim(), videoTitle: parts[2].trim(), country: parts[3].trim(), views: parts[4].trim(), premiumViews: parts[5].trim(), grossRevenue: parts[6].trim() });
            }
        }
        if (parsedData.length === 0) throw new Error("No valid data rows found.");
        setTimeout(() => { onDataParsed(parsedData); setStatus('success'); setMessage(`Successfully synchronized ${parsedData.length} records.`); }, 1000);
      } catch (error) { setStatus('error'); setMessage("Failed to parse CSV."); }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 animate-fade-in">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl shadow-2xl border border-white/5 p-10 text-center">
            <CloudLightning className="w-16 h-16 text-cyan-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white">Data Sync Hub</h2>
            <p className="text-slate-400 mt-2 mb-8">Import YouTube CMS analytics.</p>
            <div className="border-2 border-dashed border-slate-700 rounded-2xl p-12 bg-slate-800/30">
                <input type="file" accept=".csv" onChange={(e) => { if(e.target.files?.[0]) { setFile(e.target.files[0]); setStatus('idle'); } }} className="hidden" id="csv-upload" />
                {!file ? (
                    <label htmlFor="csv-upload" className="cursor-pointer block"><Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" /><span className="text-cyan-400 font-bold text-lg">Click to upload CSV</span></label>
                ) : (
                    <div className="flex items-center justify-center gap-4"><FileText className="w-8 h-8 text-green-400" /><p className="font-bold text-white">{file.name}</p><button onClick={() => setFile(null)} className="text-sm text-slate-400 border border-white/10 px-3 py-1 rounded">Change</button></div>
                )}
            </div>
            {file && status !== 'success' && <button onClick={processFile} disabled={status === 'processing'} className="mt-8 w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-lg">{status === 'processing' ? 'Processing...' : 'Execute Synchronization'}</button>}
            {status === 'success' && <div className="mt-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center justify-center gap-4"><CheckCircle className="w-6 h-6 text-emerald-400" /><span className="text-emerald-400">{message}</span></div>}
            {status === 'error' && <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-4"><AlertCircle className="w-6 h-6 text-red-400" /><span className="text-red-400">{message}</span></div>}
        </div>
    </div>
  );
};