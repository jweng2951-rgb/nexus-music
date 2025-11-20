import React, { useState, useEffect } from 'react';
import { User, Channel } from '../types';
import { dataService } from '../services/dataService';
import { Plus, Trash2, ExternalLink, Youtube, Save, AlertCircle, CheckCircle2, Upload } from 'lucide-react';

interface Props { user: User; }

export const UserSettings: React.FC<Props> = ({ user }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [bulkInput, setBulkInput] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => { loadChannels(); }, [user.id]);

  const loadChannels = async () => {
    const data = await dataService.getUserChannels(user.id);
    setChannels(data);
    setLoading(false);
  };

  const handleBulkImport = async () => {
    const lines = bulkInput.split('\n').map(l => l.trim()).filter(l => l);
    if (lines.length === 0) return;

    const newChannels: Channel[] = [];
    const errors: string[] = [];

    lines.forEach(line => {
      // 简单提取逻辑
      let id = line;
      if (line.includes('/channel/')) id = line.split('/channel/')[1].split('/')[0];
      if (id.startsWith('UC')) newChannels.push({ userId: user.id, channelId: id });
      else errors.push(line);
    });

    if (newChannels.length > 0) {
      setIsImporting(true);
      await dataService.saveBulkChannels(newChannels);
      await loadChannels();
      setBulkInput('');
      setIsImporting(false);
      setToast(`Successfully added ${newChannels.length} channels.`);
    } else {
      setToast('No valid Channel IDs found (Must start with UC...)');
    }
    setTimeout(() => setToast(''), 3000);
  };

  const handleDelete = async (id: string) => {
    if(confirm('Unbind this channel?')) {
      await dataService.deleteChannel(id);
      loadChannels();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* 统计卡片 */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Channel Management</h2>
          <p className="text-slate-500 mt-1">Manage your bounded YouTube channels here.</p>
        </div>
        <div className="flex items-center gap-4">
            <div className="px-5 py-3 bg-indigo-50 rounded-xl border border-indigo-100 text-center">
                <p className="text-xs font-bold text-indigo-500 uppercase">Total Channels</p>
                <p className="text-2xl font-bold text-indigo-700">{channels.length}</p>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 批量导入区 */}
        <div className="lg:col-span-1 space-y-6">
             <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Upload className="w-5 h-5 text-indigo-600" /> Bulk Import</h3>
                <p className="text-sm text-slate-500 mb-4">Paste Channel IDs (one per line). We automatically strip URLs.</p>
                <textarea 
                    value={bulkInput}
                    onChange={e => setBulkInput(e.target.value)}
                    className="w-full h-48 p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                    placeholder={"UC_12345...\nhttps://youtube.com/channel/UC_abcde..."}
                />
                <button 
                    onClick={handleBulkImport} 
                    disabled={isImporting || !bulkInput}
                    className="w-full mt-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50"
                >
                    {isImporting ? 'Importing...' : 'Import Channels'}
                </button>
                {toast && <div className="mt-3 p-3 bg-emerald-50 text-emerald-700 text-sm rounded-lg border border-emerald-100 flex gap-2"><CheckCircle2 className="w-4 h-4"/> {toast}</div>}
             </div>
        </div>

        {/* 频道列表区 */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h3 className="font-bold text-slate-800">Linked Channels</h3>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 font-medium border-b border-slate-100 sticky top-0">
                        <tr>
                            <th className="px-6 py-3">Channel ID</th>
                            <th className="px-6 py-3 text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {channels.length === 0 ? (
                            <tr><td colSpan={2} className="px-6 py-12 text-center text-slate-400">No channels linked yet.</td></tr>
                        ) : channels.map(ch => (
                            <tr key={ch.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-mono text-slate-600 flex items-center gap-2">
                                    <Youtube className="w-4 h-4 text-red-500" />
                                    {ch.channelId}
                                    <a href={`https://youtube.com/channel/${ch.channelId}`} target="_blank" className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-indigo-600"><ExternalLink className="w-3 h-3" /></a>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDelete(ch.id!)} className="text-slate-400 hover:text-red-600 p-2 rounded-md hover:bg-red-50 transition-all"><Trash2 className="w-4 h-4" /></button>
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