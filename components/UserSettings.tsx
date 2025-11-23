import React, { useState, useEffect } from 'react';
import { User, Channel } from '../types';
import { dataService } from '../services/dataService';
import { Trash2, ExternalLink, Youtube, Upload, CheckCircle2, AlertCircle, BarChart2 } from 'lucide-react';

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
      // Smart Parse Logic
      if (line.includes('/channel/')) {
          id = line.split('/channel/')[1].split(/[/?]/)[0];
      } 
      // Add more robust parsing if needed (e.g. handle query params)
      
      if (id.startsWith('UC') && id.length > 10) {
          newChannels.push({ userId: user.id, channelId: id });
      } else {
          invalidLines.push(line);
      }
    });

    if (newChannels.length > 0) {
      setIsImporting(true);
      // Calls the improved Upsert function
      const success = await dataService.saveBulkChannels(newChannels);
      if (success) {
          await loadChannels();
          setBulkInput(invalidLines.join('\n')); // Keep invalid ones
          showNotification(`Success! Bound ${newChannels.length} channels.`, 'success');
      } else {
          showNotification('Database Error. Please try again.', 'error');
      }
      setIsImporting(false);
    } else {
      showNotification('No valid Channel IDs found. Please use "UC..." format.', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if(confirm('Unbind this channel?')) {
      await dataService.deleteChannel(id);
      loadChannels();
      showNotification('Channel unbound.', 'success');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in relative">
      {toast && (
          <div className={`fixed top-20 right-10 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center gap-2 animate-fade-in ${toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}
              {toast.msg}
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div><h2 className="text-2xl font-bold text-slate-800">Channel Management</h2><p className="text-slate-500 mt-1">Bind YouTube channels to track revenue.</p></div>
        <div className="flex items-center gap-4 bg-indigo-50 px-6 py-4 rounded-2xl border border-indigo-100"><Youtube className="w-8 h-8 text-indigo-600" /><div><p className="text-xs font-bold text-indigo-600 uppercase">Linked</p><p className="text-2xl font-bold text-slate-900">{channels.length}</p></div></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full flex flex-col">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-indigo-600" /> Bulk Bind</h3>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4"><p className="text-xs text-slate-500">Supported: <code>UC_xxxx</code> IDs or Full YouTube URLs.</p></div>
                <textarea value={bulkInput} onChange={e => setBulkInput(e.target.value)} className="flex-1 w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-slate-800 placeholder-slate-400" placeholder={"https://youtube.com/channel/UC...\nUC_12345..."} />
                <button onClick={handleBulkImport} disabled={isImporting || !bulkInput} className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-200">{isImporting ? 'Binding...' : 'Bind Channels'}</button>
             </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50"><h3 className="font-bold text-slate-800">Active Bindings</h3></div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0 z-10"><tr><th className="px-6 py-4">Channel ID</th><th className="px-6 py-4 text-right">Data</th><th className="px-6 py-4 text-right">Action</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {channels.length === 0 ? (<tr><td colSpan={3} className="px-6 py-12 text-center text-slate-400">No channels bound.</td></tr>) : channels.map(ch => (
                            <tr key={ch.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-slate-600 flex items-center gap-3"><Youtube className="w-5 h-5 text-red-600" /><span className="select-all">{ch.channelId}</span><a href={`https://youtube.com/channel/${ch.channelId}`} target="_blank" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600"><ExternalLink className="w-3 h-3" /></a></td>
                                <td className="px-6 py-4 text-right"><button onClick={() => onViewChannelStats(ch.channelId)} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:border-indigo-300 hover:text-indigo-600 transition-colors inline-flex items-center gap-1"><BarChart2 className="w-3 h-3" /> Stats</button></td>
                                <td className="px-6 py-4 text-right"><button onClick={() => handleDelete(ch.id!)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"><Trash2 className="w-4 h-4" /></button></td>
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