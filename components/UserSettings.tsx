
import React, { useState, useEffect } from 'react';
import { User, Channel } from '../types';
import { dataService } from '../services/dataService';
import { Trash2, ExternalLink, Youtube, Upload, CheckCircle2, AlertCircle, BarChart2, X } from 'lucide-react';

interface Props {
  user: User;
  onViewChannelStats: (channelId: string) => void;
}

export const UserSettings: React.FC<Props> = ({ user, onViewChannelStats }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [bulkInput, setBulkInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'} | null>(null);

  useEffect(() => { loadChannels(); }, [user.id]);

  const loadChannels = async () => {
    const data = await dataService.getUserChannels(user.id);
    setChannels(data);
  };

  const showNotification = (msg: string, type: 'success'|'error') => {
      setToast({msg, type});
      setTimeout(() => setToast(null), 3000);
  };

  const handleBulkImport = async () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return;

    const newChannels: Channel[] = [];
    const invalidLines: string[] = [];

    lines.forEach(line => {
      let id = line;
      // Smart Parse: Extract UC ID from URL
      if (line.includes('/channel/')) {
          id = line.split('/channel/')[1].split(/[/?]/)[0];
      } else if (line.includes('@')) {
          invalidLines.push(line); // Handle links are not supported for syncing
          return;
      }

      if (id.startsWith('UC') && id.length > 10) {
          newChannels.push({ userId: user.id, channelId: id });
      } else {
          invalidLines.push(line);
      }
    });

    if (newChannels.length > 0) {
      setIsImporting(true);
      const success = await dataService.saveBulkChannels(newChannels);
      if (success) {
          await loadChannels();
          setBulkInput(invalidLines.join('\n')); // Keep invalid ones
          showNotification(`Successfully bound ${newChannels.length} channels.`, 'success');
      } else {
          showNotification('Error saving channels. Some IDs might be bound to other users.', 'error');
      }
      setIsImporting(false);
    } else {
      showNotification('No valid Channel IDs (UC...) found.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Are you sure you want to unbind this channel? Data collection will stop.')) {
      await dataService.deleteChannel(id);
      loadChannels();
      showNotification('Channel unbound.', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {toast && (
          <div className={`fixed top-20 right-10 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2 animate-fade-in ${toast.type === 'success' ? 'bg-emerald-900/90 border-emerald-500/30 text-emerald-100' : 'bg-red-900/90 border-red-500/30 text-red-100'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
              {toast.msg}
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/40 p-8 rounded-3xl border border-white/5">
        <div>
          <h2 className="text-3xl font-bold text-white">Channel Management</h2>
          <p className="text-slate-400 mt-2">Bind your YouTube channels to start tracking revenue.</p>
        </div>
        <div className="flex items-center gap-4 bg-indigo-500/10 px-6 py-4 rounded-2xl border border-indigo-500/20">
             <Youtube className="w-8 h-8 text-indigo-400" />
             <div>
                 <p className="text-xs font-bold text-indigo-300 uppercase">Total Channels</p>
                 <p className="text-2xl font-bold text-white">{channels.length}</p>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Bulk Import Column */}
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-slate-900/40 backdrop-blur-md p-6 rounded-3xl border border-white/5 shadow-lg h-full">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-indigo-400" /> Bulk Bind Channels</h3>
                <div className="bg-indigo-900/20 p-3 rounded-xl border border-indigo-500/20 mb-4">
                    <p className="text-xs text-indigo-200">Paste YouTube Channel Links or IDs. One per line.</p>
                </div>
                <textarea 
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    className="w-full h-64 p-4 bg-black/30 border border-white/10 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-300 placeholder-slate-600"
                    placeholder={"https://www.youtube.com/channel/UC_123...\nUC_abcde123..."}
                />
                <button 
                    onClick={handleBulkImport} 
                    disabled={isImporting || !bulkInput}
                    className="w-full mt-4 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-900/20"
                >
                    {isImporting ? 'Processing...' : 'Bind Channels'}
                </button>
             </div>
        </div>

        {/* Channel List Column */}
        <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-lg overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <h3 className="font-bold text-white">Active Bindings</h3>
            </div>
            <div className="flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900/80 text-slate-400 font-medium border-b border-white/5 sticky top-0 backdrop-blur-md z-10">
                        <tr>
                            <th className="px-6 py-4">Channel ID</th>
                            <th className="px-6 py-4 text-right">Analytics</th>
                            <th className="px-6 py-4 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {channels.length === 0 ? (
                            <tr><td colSpan={3} className="px-6 py-12 text-center text-slate-500">No channels bound yet.</td></tr>
                        ) : channels.map(ch => (
                            <tr key={ch.id} className="hover:bg-white/[0.02] transition-colors group">
                                <td className="px-6 py-4 font-mono text-slate-300 flex items-center gap-3">
                                    <Youtube className="w-5 h-5 text-red-500" />
                                    <span className="select-all">{ch.channelId}</span>
                                    <a href={`https://youtube.com/channel/${ch.channelId}`} target="_blank" className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-white transition-opacity"><ExternalLink className="w-3 h-3" /></a>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => onViewChannelStats(ch.channelId)} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-xs font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-1 ml-auto">
                                        <BarChart2 className="w-3 h-3" /> View Stats
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(ch.id!)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};
