import React, { useState } from 'react';
import { User } from '../types';
import { Save, Youtube, AlertCircle, CheckCircle, Link as LinkIcon, Zap } from 'lucide-react';

interface Props { user: User; onUpdate: (data: Partial<User>) => void; }

export const UserSettings: React.FC<Props> = ({ user, onUpdate }) => {
  const [inputValue, setInputValue] = useState(user.channelId || '');
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState('');

  const processInput = (input: string): string => {
    const clean = input.trim();
    if (clean.startsWith('UC') && clean.length === 24) return clean;
    if (clean.includes('/channel/')) return clean.split('/channel/')[1].split(/[/?]/)[0];
    return clean;
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const extractedId = processInput(inputValue);
    if (!extractedId.startsWith('UC')) { setError('Invalid ID. Must start with UC.'); return; }
    setInputValue(extractedId);
    onUpdate({ channelId: extractedId });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 animate-fade-in">
      <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-10 border border-white/5">
        <div className="flex items-center gap-6 mb-10"><Youtube className="w-12 h-12 text-red-600" /><h2 className="text-3xl font-bold text-white">Connect Channel</h2></div>
        <form onSubmit={handleSave} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Channel Link / ID</label>
                <input value={inputValue} onChange={e => setInputValue(e.target.value)} placeholder="Paste URL..." className="w-full p-4 bg-black/30 rounded-2xl border border-white/10 text-white" />
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            <button type="submit" className="w-full py-4 bg-red-600 rounded-2xl text-white font-bold">{isSaved ? 'Saved!' : 'Connect'}</button>
        </form>
      </div>
    </div>
  );
};