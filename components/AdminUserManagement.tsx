import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, Save, X, Download, Percent, BarChart2, AlertTriangle, UserCircle, CheckCircle, Link as LinkIcon, ExternalLink } from 'lucide-react';

interface Props {
  users: User[];
  onAddUser: (user: Partial<User>) => void;
  onUpdateUser: (id: string, data: Partial<User>) => void;
  onDeleteUser: (id: string) => void;
  onExportData: (userId?: string) => void;
  onViewStats: (userId: string) => void;
}

export const AdminUserManagement: React.FC<Props> = ({ users, onAddUser, onUpdateUser, onDeleteUser, onExportData, onViewStats }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [formData, setFormData] = useState({ username: '', password: '', revenueShare: '80', channelId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
        const updatePayload: Partial<User> = { 
            username: formData.username, 
            revenueShare: parseFloat(formData.revenueShare),
            channelId: formData.channelId
        };
        if(formData.password) updatePayload.password = formData.password;
        
        onUpdateUser(editingId, updatePayload);
    } else {
        onAddUser({
            username: formData.username,
            password: formData.password,
            role: UserRole.USER,
            revenueShare: parseFloat(formData.revenueShare),
            channelId: formData.channelId,
            status: 'active'
        });
    }
    closeModal();
  };

  const openEdit = (user: User) => {
      setEditingId(user.id);
      setFormData({ 
          username: user.username, 
          password: '', 
          revenueShare: user.revenueShare.toString(),
          channelId: user.channelId || ''
      });
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ username: '', password: '', revenueShare: '80', channelId: '' });
  };

  const nonAdminUsers = users.filter(u => u.role !== UserRole.ADMIN);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative max-w-md w-full group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search users..." 
            className="pl-10 pr-4 py-3 w-full bg-slate-900/50 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-slate-600 backdrop-blur-sm transition-all"
          />
        </div>
        <div className="flex gap-3">
             <button 
                onClick={() => onExportData()}
                className="flex items-center space-x-2 px-5 py-3 bg-slate-800/50 text-slate-200 border border-white/5 rounded-xl hover:bg-slate-800 transition-all"
            >
                <Download className="w-4 h-4" />
                <span className="text-sm font-medium">Export CSV</span>
            </button>
            <button 
                onClick={() => setIsModalOpen(true)}
                className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg transition-all"
            >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-bold">Create Creator</span>
            </button>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Creator Profile</th>
              <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Rev Share</th>
              <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Binding Status</th>
              <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 bg-transparent">
            {nonAdminUsers.length === 0 ? (
                <tr>
                    <td colSpan={4} className="px-6 py-16 text-center text-slate-500 flex flex-col items-center justify-center">
                        <UserCircle className="w-12 h-12 mb-3 opacity-20" />
                        <span>No sub-accounts active. Create one to get started.</span>
                    </td>
                </tr>
            ) : nonAdminUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center shadow-inner">
                      <span className="text-lg font-bold text-indigo-400">{user.username.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-semibold text-white">{user.username}</div>
                      <div className="text-xs text-slate-500 font-mono mt-0.5">{user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex items-center text-xs font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {user.revenueShare}% Split
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-sm">
                  {user.channelId ? (
                      <div className="flex items-center gap-3">
                          <div className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                              <CheckCircle className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-400 text-xs font-bold">Linked</span>
                          </div>
                          <a 
                            href={`https://www.youtube.com/channel/${user.channelId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-slate-500 font-mono text-xs opacity-50 hover:opacity-100 hover:text-indigo-400 transition-all border-b border-transparent hover:border-indigo-400"
                            title="Visit Channel"
                          >
                              <span>{user.channelId}</span>
                              <ExternalLink className="w-3 h-3" />
                          </a>
                      </div>
                  ) : (
                      <div className="px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1.5 w-fit">
                          <LinkIcon className="w-3 h-3 text-red-500" />
                          <span className="text-red-400 text-xs font-bold">Unlinked</span>
                      </div>
                  )}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => onViewStats(user.id)} className="p-2 bg-slate-800/50 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all border border-transparent hover:border-blue-500/20" title="View Analytics">
                        <BarChart2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onExportData(user.id)} className="p-2 bg-slate-800/50 text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all border border-transparent hover:border-emerald-500/20" title="Export Data">
                        <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => openEdit(user)} className="p-2 bg-slate-800/50 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all border border-transparent hover:border-indigo-500/20" title="Edit">
                        <Edit2 className="w-4 h-4" />
                    </button>
                    <button onClick={() => onDeleteUser(user.id)} className="p-2 bg-slate-800/50 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20" title="Delete">
                        <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
              <h2 className="text-xl font-bold text-white">{editingId ? 'Edit Creator Profile' : 'Onboard New Creator'}</h2>
              <button onClick={closeModal} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label>
                            <input 
                                type="text" 
                                required 
                                value={formData.username}
                                onChange={e => setFormData({...formData, username: e.target.value})}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition-all placeholder-slate-600"
                                placeholder="e.g. creator_one"
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label>
                            <input 
                                type="text" 
                                required={!editingId}
                                value={formData.password}
                                onChange={e => setFormData({...formData, password: e.target.value})}
                                className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition-all placeholder-slate-600"
                                placeholder={editingId ? 'Unchanged' : 'Required'}
                            />
                        </div>
                        <div className="col-span-1">
                            <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Revenue Share (%)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-500">
                                    <Percent className="w-4 h-4" />
                                </span>
                                <input 
                                    type="number" 
                                    min="0"
                                    max="100"
                                    required 
                                    value={formData.revenueShare}
                                    onChange={e => setFormData({...formData, revenueShare: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white transition-all placeholder-slate-600 font-mono"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-4 bg-slate-800/50 rounded-xl border border-white/5">
                        <label className="block text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center gap-2">
                            <LinkIcon className="w-3 h-3" /> 
                            Bind Channel (Force Sync)
                        </label>
                        <input 
                            type="text" 
                            value={formData.channelId}
                            onChange={e => setFormData({...formData, channelId: e.target.value})}
                            placeholder="Paste Channel ID (UC...)"
                            className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-white font-mono text-sm transition-all"
                        />
                        <p className="text-[10px] text-slate-500 mt-2">Admin Override: Manually linking an ID here will connect the data immediately.</p>
                    </div>

                    <div className="pt-2 flex gap-4">
                        <button type="button" onClick={closeModal} className="flex-1 px-4 py-3 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700 font-bold transition-colors">Cancel</button>
                        <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold shadow-lg shadow-indigo-500/20 flex justify-center items-center gap-2 transition-all">
                            <Save className="w-4 h-4" />
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};