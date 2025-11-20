import React, { useState } from 'react';
import { User, ChannelStats } from '../types';
import { Save, Youtube, AlertCircle, CheckCircle, Link as LinkIcon, Zap, Radio, ExternalLink, DollarSign, Eye, Crown, Globe } from 'lucide-react';

interface Props {
  user: User;
  stats: ChannelStats | null;
  onUpdate: (data: Partial<User>) => void;
}

export const UserSettings: React.FC<Props> = ({ user, stats, onUpdate }) => {
  const [inputValue, setInputValue] = useState(user.channelId || '');
  const [channelName, setChannelName] = useState(user.channelName || '');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const processInput = (input: string): string => {
    const cleanInput = input.trim();
    if (cleanInput.startsWith('UC') && cleanInput.length === 24) return cleanInput;
    if (cleanInput.includes('/channel/')) {
        const parts = cleanInput.split('/channel/');
        const potentialId = parts[1].split(/[/?]/)[0];
        if (potentialId.startsWith('UC')) return potentialId;
    }
    return cleanInput;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const extractedId = processInput(inputValue);

    if (inputValue.includes('@')) {
        setError('Please use the full Channel URL (contains "/channel/UC..."), not the Handle (@name).');
        return;
    }

    if (!extractedId.startsWith('UC')) {
        setError('Invalid Channel ID. It must start with "UC".');
        return;
    }

    setInputValue(extractedId);
    onUpdate({ channelId: extractedId, channelName });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto mt-6 animate-fade-in space-y-8">
      {user.channelId && stats && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-emerald-500/20 shadow-lg flex flex-col justify-between relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><DollarSign className="w-16 h-16 text-emerald-500" /></div>
                   <div><p className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-1">Estimated Earnings</p><h3 className="text-3xl font-bold text-white">${stats.totalRevenue.toFixed(2)}</h3><p className="text-xs text-slate-500 mt-2">Net share ({user.revenueShare}%)</p></div>
                   <div className="w-full bg-emerald-500/10 h-1 mt-4 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 w-full animate-pulse"></div></div>
              </div>
              <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-indigo-500/20 shadow-lg flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity"><Eye className="w-16 h-16 text-indigo-500" /></div>
                   <div className="space-y-4">
                       <div><p className="text-sm font-bold text-indigo-400 uppercase tracking-wider mb-1">Total Traffic</p><h3 className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</h3></div>
                       <div><p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1"><Crown className="w-3 h-3" /> Premium</p><h3 className="text-xl font-bold text-slate-200">{stats.totalPremiumViews.toLocaleString()}</h3></div>
                   </div>
              </div>
               <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-lg flex flex-col relative overflow-hidden">
                   <div className="flex items-center gap-2 mb-4"><Globe className="w-4 h-4 text-blue-400" /><p className="text-sm font-bold text-white uppercase tracking-wider">Top Markets</p></div>
                   <div className="flex-1 overflow-y-auto max-h-[120px] space-y-2 pr-2 custom-scrollbar">
                       {stats.topCountries.slice(0, 4).map((c, i) => (<div key={c.code} className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"><div className="flex items-center gap-3"><span className="text-xs font-mono text-slate-500">{i+1}</span><span className="font-bold text-slate-200">{c.code}</span></div><div className="text-right"><span className="block text-emerald-400 text-xs font-mono">${c.revenue.toFixed(2)}</span></div></div>))}
                       {stats.topCountries.length === 0 && <p className="text-slate-500 text-xs">No geographic data available.</p>}
                   </div>
               </div>
          </div>
      )}

      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl shadow-2xl border border-white/5 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-white/5 pb-8 relative z-10 gap-6">
            <div className="flex items-center space-x-6"><div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40 flex-shrink-0 ring-1 ring-white/10"><Radio className="w-10 h-10 text-white" /></div><div><h2 className="text-3xl font-bold text-white tracking-tight">Channel Connection</h2><p className="text-slate-400 mt-2">Manage synchronization settings & binding.</p></div></div>
            <div className="flex items-center gap-3">
                {user.channelId && (<a href={`https://www.youtube.com/channel/${user.channelId}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 rounded-full bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 flex items-center gap-2 text-sm font-bold text-slate-300 transition-all group"><Youtube className="w-4 h-4 group-hover:text-white text-red-500 transition-colors" /><span>Visit Channel</span><ExternalLink className="w-3 h-3 opacity-50" /></a>)}
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${user.channelId ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>{user.channelId ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}<span className={`font-bold text-sm ${user.channelId ? 'text-emerald-400' : 'text-red-400'}`}>{user.channelId ? 'Active' : 'Disconnected'}</span></div>
            </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-300 ml-1">YouTube Channel Link or ID</label>
            <div className="relative group">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors"><LinkIcon className="w-5 h-5" /></div>
                <input type="text" required value={inputValue} onChange={(e) => { setInputValue(e.target.value); setError(''); setIsSaved(false); }} placeholder="https://www.youtube.com/channel/UC..." className={`w-full pl-14 pr-14 py-5 bg-black/30 border rounded-2xl outline-none text-white placeholder-slate-600 font-medium transition-all ${error ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/50' : 'border-white/10 focus:ring-2 focus:ring-red-600/50 focus:border-red-500/50 hover:border-white/20'}`} />
                {processInput(inputValue).startsWith('UC') && !error && (<div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-emerald-500 animate-fade-in bg-emerald-500/10 p-1 rounded-full"><CheckCircle className="w-5 h-5" /></div>)}
            </div>
            {error ? (<div className="mt-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-fade-in"><AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" /><p className="text-red-200 text-sm leading-relaxed">{error}</p></div>) : (<p className="text-xs text-slate-500 flex items-center gap-2 ml-2"><Zap className="w-3 h-3 text-yellow-500" /><span>Smart Detection: Paste the full URL and we'll extract the ID.</span></p>)}
          </div>
          <div className="space-y-3">
               <label className="block text-sm font-bold text-slate-300 ml-1">Channel Name (Optional)</label>
               <input type="text" value={channelName} onChange={(e) => setChannelName(e.target.value)} placeholder="e.g. My Awesome Shorts" className="w-full px-6 py-5 bg-black/30 border border-white/10 rounded-2xl outline-none text-white placeholder-slate-600 font-medium focus:ring-2 focus:ring-indigo-500/50 transition-all" />
          </div>
          <div className="pt-6">
            <button type="submit" className={`w-full py-5 rounded-2xl font-bold text-lg shadow-lg transition-all transform active:scale-[0.99] flex items-center justify-center gap-3 ${isSaved ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-500 hover:to-red-600 shadow-red-900/30'}`}>{isSaved ? <><CheckCircle className="w-6 h-6" /> Configuration Saved</> : <><Save className="w-5 h-5" /> Save Configuration</>}</button>
          </div>
        </form>
      </div>
    </div>
  );
};