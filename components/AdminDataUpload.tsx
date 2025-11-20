import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, CloudLightning } from 'lucide-react';
import { CsvRow, User } from '../types';

interface Props {
  onDataParsed: (data: CsvRow[]) => void;
  users: User[]; 
}

export const AdminDataUpload: React.FC<Props> = ({ onDataParsed }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'ready' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [parsedData, setParsedData] = useState<CsvRow[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setMessage('');
    }
  };

  const parseCSVLine = (line: string) => {
    // Robust CSV Regex to handle quotes: "Title, with comma",ID,Date...
    const regex = /(?:,|\n|^)("(?:(?:"")*[^"]*)*"|[^",\n]*|(?:\n|$))/g;
    const matches = [];
    let match;
    while ((match = regex.exec(line)) !== null) {
        if (match[1] !== undefined) {
             // Remove enclosing quotes and unescape double quotes
            let val = match[1].replace(/^"|"$/g, '').replace(/""/g, '"');
            matches.push(val);
        }
    }
    // If simpler format (no quotes), fallback to split if regex fails or returns odd length
    if (matches.length < 5) return line.split(',');
    return matches;
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
        
        // Auto-detect header row
        let startIndex = 0;
        if (lines[0].toLowerCase().includes('date') || lines[0].toLowerCase().includes('channel')) startIndex = 1;

        for (let i = startIndex; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            // Use Robust Parser
            const parts = parseCSVLine(line);
            
            // Flexible mapping: Assuming standard YT Export format or our template
            // Template: Date, Channel ID, Video Title, Country, Views, Premium Views, Revenue
            if (parts.length >= 7) {
                tempParsed.push({
                    date: parts[0].trim(),
                    channelId: parts[1].trim(),
                    videoTitle: parts[2].trim(),
                    country: parts[3].trim(),
                    views: parts[4].trim().replace(/,/g, ''), // Remove commas from numbers
                    premiumViews: parts[5].trim().replace(/,/g, ''),
                    grossRevenue: parts[6].trim().replace(/,/g, '').replace('$', '')
                });
            }
        }

        if (tempParsed.length === 0) throw new Error("No valid rows found. Check CSV format.");

        setParsedData(tempParsed);
        setTimeout(() => setStatus('ready'), 800);
      } catch (error) {
        setStatus('error');
        setMessage("Failed to parse CSV. Ensure format is: Date, ChannelID, Title, Country, Views, Premium, Revenue");
      }
    };
    reader.readAsText(file);
  };

  const confirmSync = () => {
      onDataParsed(parsedData);
      setStatus('success');
      setMessage(`Successfully synchronized ${parsedData.length} records.`);
  };

  return (
    <div className="max-w-3xl mx-auto mt-12 animate-fade-in">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-blue-50 mb-6"><CloudLightning className="w-8 h-8 text-blue-600" /></div>
            <h2 className="text-2xl font-bold text-slate-800">Data Sync Hub</h2>
            <p className="text-slate-500 mt-2 mb-8">Import standard YouTube CMS exports.</p>

            {status === 'idle' || status === 'analyzing' || status === 'error' ? (
                <>
                    <div className={`border-2 border-dashed rounded-2xl p-12 transition-all ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-slate-400'}`} onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }} onDragLeave={() => setIsDragging(false)} onDrop={(e) => { e.preventDefault(); setIsDragging(false); if (e.dataTransfer.files?.[0]) setFile(e.dataTransfer.files[0]); }}>
                        <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" id="csv-upload" />
                        {!file ? (<label htmlFor="csv-upload" className="cursor-pointer block"><Upload className="w-8 h-8 text-slate-400 mx-auto mb-4" /><span className="text-blue-600 font-bold hover:underline">Click to upload</span> <span className="text-slate-500">or drop CSV</span></label>) : (<div className="flex items-center justify-center gap-4"><FileText className="w-8 h-8 text-emerald-500" /><div className="text-left"><p className="font-bold text-slate-800">{file.name}</p><p className="text-sm text-slate-400">{(file.size / 1024).toFixed(1)} KB</p></div><button onClick={() => { setFile(null); setStatus('idle'); }} className="ml-4 text-sm text-red-500 font-bold">Remove</button></div>)}
                    </div>
                    {file && (<button onClick={analyzeFile} disabled={status === 'analyzing'} className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all">{status === 'analyzing' ? 'Analyzing...' : 'Analyze Data'}</button>)}
                    {status === 'error' && <div className="mt-6 p-4 bg-red-50 text-red-600 rounded-xl flex items-center gap-2"><AlertCircle className="w-5 h-5" /> {message}</div>}
                </>
            ) : (
                <div className="space-y-6">
                    <div className="bg-slate-50 rounded-xl p-6 border border-slate-100"><p className="text-3xl font-bold text-slate-800">{parsedData.length}</p><p className="text-sm text-slate-500 uppercase tracking-wide font-bold mt-1">Valid Rows Ready to Sync</p></div>
                    <div className="flex gap-4"><button onClick={() => { setStatus('idle'); setFile(null); }} className="flex-1 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold">Cancel</button><button onClick={confirmSync} className="flex-[2] py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-200">Confirm & Sync</button></div>
                </div>
            )}
            {status === 'success' && <div className="mt-8 p-5 bg-emerald-50 text-emerald-700 rounded-xl flex items-center gap-3"><CheckCircle className="w-6 h-6" /><span className="font-bold">{message}</span></div>}
        </div>
    </div>
  );
};