import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, CloudLightning, Search, AlertTriangle } from 'lucide-react';
import { CsvRow, User } from '../types';

interface Props {
  onDataParsed: (data: CsvRow[]) => void;
  users: User[]; // Need users to verify binding
}

export const AdminDataUpload: React.FC<Props> = ({ onDataParsed, users }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  
  // Analysis State
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [orphanedCount, setOrphanedCount] = useState(0);
  const [orphanedIds, setOrphanedIds] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const analyzeFile = () => {
    if (!file) return;

    setStatus('analyzing');
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.split('\n');
        const tempParsed: CsvRow[] = [];
        
        const startIndex = lines[0].toLowerCase().includes('date') ? 1 : 0;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split(',');
            if (parts.length >= 7) {
                tempParsed.push({
                    date: parts[0].trim(),
                    channelId: parts[1].trim(),
                    videoTitle: parts[2].trim(),
                    country: parts[3].trim(),
                    views: parts[4].trim(),
                    premiumViews: parts[5].trim(),
                    grossRevenue: parts[6].trim()
                });
            }
        }

        if (tempParsed.length === 0) {
            throw new Error("No valid data rows found.");
        }

        // PERFORM INTEGRITY CHECK
        const userChannelIds = new Set(users.map(u => u.channelId).filter(Boolean));
        const orphans = new Set<string>();
        let matches = 0;

        tempParsed.forEach(row => {
            if (userChannelIds.has(row.channelId)) {
                matches++;
            } else {
                orphans.add(row.channelId);
            }
        });

        setParsedData(tempParsed);
        setMatchedCount(matches);
        setOrphanedCount(tempParsed.length - matches); // Total - Matched
        setOrphanedIds(Array.from(orphans));

        setTimeout(() => {
            setStatus('ready');
        }, 800);

      } catch (error) {
        setStatus('error');
        setMessage("Failed to parse CSV. Please verify headers and column order.");
      }
    };

    reader.readAsText(file);
  };

  const confirmSync = () => {
      onDataParsed(parsedData);
      setStatus('success');
      setMessage(`Successfully synchronized ${matchedCount} records.`);
  };

  return (
    <div className="max-w-4xl mx-auto mt-12 animate-fade-in">
        <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl shadow-2xl border border-white/5 p-10">
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-6 shadow-lg shadow-cyan-500/20">
                    <CloudLightning className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-white tracking-tight">Data Sync Hub</h2>
                <p className="text-slate-400 mt-2 text-lg">Import YouTube CMS analytics with integrity pre-check.</p>
            </div>

            {/* Upload Area */}
            {status === 'idle' || status === 'analyzing' || status === 'error' ? (
                <>
                    <div 
                        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 relative group
                            ${isDragging 
                                ? 'border-cyan-500 bg-cyan-500/10' 
                                : 'border-slate-700 hover:border-slate-500 bg-slate-800/30'}
                        `}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                                setFile(e.dataTransfer.files[0]);
                            }
                        }}
                    >
                        <input 
                            type="file" 
                            accept=".csv" 
                            onChange={handleFileChange} 
                            className="hidden" 
                            id="csv-upload"
                        />
                        
                        {!file ? (
                            <label htmlFor="csv-upload" className="cursor-pointer block relative z-10">
                                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 border border-white/5 group-hover:scale-110 transition-transform group-hover:bg-slate-700">
                                    <Upload className="w-8 h-8 text-slate-400 group-hover:text-white transition-colors" />
                                </div>
                                <span className="text-cyan-400 font-bold text-lg hover:text-cyan-300 underline decoration-dashed underline-offset-4">Click to upload CSV</span> 
                                <span className="text-slate-400 text-lg"> or drop file here</span>
                            </label>
                        ) : (
                            <div className="flex items-center justify-center gap-6 relative z-10">
                                <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center border border-green-500/30">
                                    <FileText className="w-8 h-8 text-green-400" />
                                </div>
                                <div className="text-left">
                                    <p className="font-bold text-white text-lg">{file.name}</p>
                                    <p className="text-sm text-slate-400 font-mono">{(file.size / 1024).toFixed(2)} KB</p>
                                </div>
                                <button 
                                    onClick={() => { setFile(null); setStatus('idle'); }}
                                    className="ml-4 px-4 py-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors text-sm font-medium border border-white/5 hover:border-red-500/30"
                                >
                                    Change File
                                </button>
                            </div>
                        )}
                    </div>
                    {file && (
                         <button
                            onClick={analyzeFile}
                            disabled={status === 'analyzing'}
                            className={`mt-8 w-full py-4 px-6 rounded-2xl text-white font-bold text-lg tracking-wide transition-all shadow-lg
                                ${status === 'analyzing' 
                                    ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-blue-900/30 transform hover:scale-[1.01] active:scale-[0.99]'}
                            `}
                        >
                            {status === 'analyzing' ? 'Analyzing Data Structure...' : 'Analyze File'}
                        </button>
                    )}
                    {status === 'error' && (
                        <div className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 animate-fade-in">
                            <div className="p-2 bg-red-500/20 rounded-full"><AlertCircle className="w-6 h-6 text-red-400" /></div>
                            <div><h4 className="font-bold text-red-400 text-lg">Analysis Failed</h4><p className="text-red-200/70 mt-1">{message}</p></div>
                        </div>
                    )}
                </>
            ) : (
                // Analysis Result State
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 text-center">
                            <h3 className="text-emerald-400 font-bold uppercase text-xs tracking-wider mb-2">Matched Rows</h3>
                            <p className="text-4xl font-bold text-white">{matchedCount}</p>
                            <p className="text-emerald-200/50 text-xs mt-2">Data assigned to valid users</p>
                        </div>
                        <div className={`border rounded-2xl p-6 text-center ${orphanedCount > 0 ? 'bg-amber-500/10 border-amber-500/20' : 'bg-slate-800/30 border-white/5'}`}>
                            <h3 className={`${orphanedCount > 0 ? 'text-amber-400' : 'text-slate-400'} font-bold uppercase text-xs tracking-wider mb-2`}>Orphaned Rows</h3>
                            <p className="text-4xl font-bold text-white">{orphanedCount}</p>
                            <p className="text-slate-500 text-xs mt-2">Data with no matching Channel ID</p>
                        </div>
                    </div>

                    {orphanedIds.length > 0 && (
                        <div className="bg-slate-800/30 rounded-2xl border border-white/5 p-6">
                            <div className="flex items-center gap-2 mb-4 text-amber-400">
                                <AlertTriangle className="w-5 h-5" />
                                <h4 className="font-bold text-sm">Unmatched Channel IDs Detected</h4>
                            </div>
                            <div className="bg-black/30 rounded-xl p-4 max-h-32 overflow-y-auto custom-scrollbar">
                                <div className="flex flex-wrap gap-2">
                                    {orphanedIds.map(id => (
                                        <span key={id} className="text-xs font-mono bg-amber-500/10 text-amber-300 px-2 py-1 rounded border border-amber-500/20">{id}</span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-3">Please ensure you create users with these Channel IDs before syncing if you want this data to be assigned.</p>
                        </div>
                    )}

                    <div className="flex gap-4">
                        <button onClick={() => { setStatus('idle'); setFile(null); }} className="flex-1 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-colors">Cancel</button>
                        <button 
                            onClick={confirmSync} 
                            className="flex-[2] py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-900/30 transition-all transform active:scale-[0.99]"
                        >
                            Confirm & Sync Data
                        </button>
                    </div>
                </div>
            )}

            {status === 'success' && (
                <div className="mt-8 p-5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-start gap-4 animate-fade-in">
                    <div className="p-2 bg-emerald-500/20 rounded-full"><CheckCircle className="w-6 h-6 text-emerald-400" /></div>
                    <div><h4 className="font-bold text-emerald-400 text-lg">Synchronization Complete</h4><p className="text-emerald-200/70 mt-1">{message}</p></div>
                </div>
            )}
        </div>
    </div>
  );
};