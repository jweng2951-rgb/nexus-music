import React, { useState } from 'react';
import { User } from '../types';
import { Save, Youtube, AlertCircle, CheckCircle, Link as LinkIcon, Zap, Radio, ExternalLink } from 'lucide-react';

interface Props {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

export const UserSettings: React.FC<Props> = ({ user, onUpdate }) => {
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
    <div className="max-w-4xl mx-auto mt-10 animate-fade-in">
      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl shadow-2xl border border-white/5 p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-[80px] pointer-events-none -mr-20 -mt-20"></div>

        {/* Header Status Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 border-b border-white/5 pb-8 relative z-10 gap-6">
            <div className="flex items-center space-x-6">
                <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-red-800 rounded-2xl flex items-center justify-center shadow-lg shadow-red-900/40 flex-shrink-0 ring-1 ring-white/10">
                    <Radio className="w-10 h-10 text-white" />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight">Channel Manager</h2>
                    <p className="text-slate-400 mt-2">Manage your YouTube binding and synchronization settings.</p>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                {user.channelId && (
                    <a 
                        href={`https://www.youtube.com/channel/${user.channelId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 rounded-full bg-white/5 hover:bg-red-600 hover:text-white border border-white/10 flex items-center gap-2 text-sm font-bold text-slate-300 transition-all group"
                    >
                        <Youtube className="w-4 h-4 group-hover:text-white text-red-500 transition-colors" />
                        <span>Visit Channel</span>
                        <ExternalLink className="w-3 h-3 opacity-50" />
                    </a>
                )}
                <div className={`px-4 py-2 rounded-full border flex items-center gap-2 ${user.channelId ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'}`}>
                    {user.channelId ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className={`font-bold text-sm ${user.channelId ? 'text-emerald-400' : 'text-red-400'}`}>
                        {user.channelId ? 'Channel Linked' : 'Not Linked'}
                    </span>
                </div>
            </div>
        </div>

        <form onSubmit={handleSave} className="space-y-8 relative z-10">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-300 ml-1">YouTube Channel Link or ID</label>
            <div className="relative group">
                <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors">
                    <LinkIcon className="w-5 h-5" />
                </div>
                <input
                    type="text"
                    required
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setError('');
                        setIsSaved(false);
                    }}
                    placeholder="https://www.youtube.com/channel/UC..."
                    className={`w-full pl-14 pr-14 py-5 bg-black/30 border rounded-2xl outline-none text-white placeholder-slate-600 font-medium transition-all
                        ${error 
                            ? 'border-red-500/50 focus:ring-2 focus:ring-red-500/50' 
                            : 'border-white/10 focus:ring-2 focus:ring-red-600/50 focus:border-red-500/50 hover:border-white/20'}
                    `}
                />
                {processInput(inputValue).startsWith('UC') && !error && (
                    <div className="absolute right-5 top-1/2 transform -translate-y-1/2 text-emerald-500 animate-fade-in bg-emerald-500/10 p-1 rounded-full">
                        <CheckCircle className="w-5 h-5" />
                    </div>
                )}
            </div>
            
            {error ? (
                <div className="mt-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 animate-fade-in">
                    <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                    <p className="text-red-200 text-sm leading-relaxed">{error}</p>
                </div>
            ) : (
                <p className="text-xs text-slate-500 flex items-center gap-2 ml-2">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <span>Smart Detection: Paste the full URL, and we'll extract the ID automatically.</span>
                </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-300 ml-1">Channel Alias <span className="text-slate-500 font-normal">(Internal Name)</span></label>
            <input
              type="text"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              placeholder="e.g. My Primary Shorts Channel"
              className="w-full px-6 py-4 bg-black/30 border border-white/10 rounded-2xl focus:ring-2 focus:ring-red-600/50 focus:border-red-500/50 outline-none text-white placeholder-slate-700 transition-all hover:border-white/20"
            />
          </div>

          <div className="pt-6">
            <button
                type="submit"
                disabled={!inputValue}
                className={`w-full flex items-center justify-center space-x-3 py-5 rounded-2xl text-white font-bold text-lg tracking-wide transition-all shadow-xl
                    ${isSaved 
                        ? 'bg-emerald-600 shadow-emerald-900/20 ring-2 ring-emerald-500/50' 
                        : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 shadow-red-900/30 hover:shadow-red-900/50 hover:scale-[1.01] active:scale-[0.99]'}
                    ${!inputValue ? 'opacity-50 cursor-not-allowed grayscale' : ''}
                `}
            >
                {isSaved ? (
                    <span className="flex items-center gap-2 animate-fade-in"><CheckCircle className="w-6 h-6" /> Connection Established</span>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        <span>Save Configuration</span>
                    </>
                )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};