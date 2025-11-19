import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, Save, X, Download, Percent, BarChart2, AlertTriangle, UserCircle } from 'lucide-react';

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
  const [formData, setFormData] = useState({ username: '', password: '', revenueShare: '80', channelId: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
        const updatePayload: Partial<User> = { username: formData.username, revenueShare: parseFloat(formData.revenueShare), channelId: formData.channelId };
        if(formData.password) updatePayload.password = formData.password;
        onUpdateUser(editingId, updatePayload);
    } else {
        onAddUser({ username: formData.username, password: formData.password, role: UserRole.USER, revenueShare: parseFloat(formData.revenueShare), channelId: formData.channelId, status: 'active' });
    }
    closeModal();
  };

  const openEdit = (user: User) => {
      setEditingId(user.id);
      setFormData({ username: user.username, password: '', revenueShare: user.revenueShare.toString(), channelId: user.channelId || '' });
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
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Search className="h-4 w-4 text-slate-500" /></div>
          <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-3 w-full bg-slate-900/50 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none placeholder-slate-600" />
        </div>
        <div className="flex gap-3">
             <button onClick={() => onExportData()} className="flex items-center space-x-2 px-5 py-3 bg-slate-800/50 text-slate-200 border border-white/5 rounded-xl hover:bg-slate-800"><Download className="w-4 h-4" /><span className="text-sm font-medium">Export CSV</span></button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl hover:shadow-lg"><Plus className="w-4 h-4" /><span className="text-sm font-bold">Create Creator</span></button>
        </div>
      </div>
      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden shadow-2xl">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase">Creator Profile</th>
              <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase">Rev Share</th>
              <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase">Channel Status</th>
              <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {nonAdminUsers.length === 0 ? (
                <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-500"><UserCircle className="w-12 h-12 mb-3 opacity-20 mx-auto" /><span>No sub-accounts active.</span></td></tr>
            ) : nonAdminUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02] group">
                <td className="px-8 py-5 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-white/5 flex items-center justify-center"><span className="text-lg font-bold text-indigo-400">{user.username.charAt(0).toUpperCase()}</span></div>
                    <div className="ml-4"><div className="text-sm font-semibold text-white">{user.username}</div></div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap"><span className="px-3 py-1 text-xs font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20">{user.revenueShare}% Split</span></td>
                <td className="px-6 py-5 whitespace-nowrap text-sm">
                  {user.channelId ? <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div><span className="text-slate-300 font-mono bg-black/30 px-2 py-1 rounded border border-white/5 text-xs">{user.channelId}</span></div> : <span className="flex items-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 text-xs font-medium"><AlertTriangle className="w-3 h-3" />Pending</span>}
                </td>
                <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100">
                    <button onClick={() => onViewStats(user.id)} className="p-2 bg-slate-800/50 text-slate-400 hover:text-blue-400 rounded-lg"><BarChart2 className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(user)} className="p-2 bg-slate-800/50 text-slate-400 hover:text-indigo-400 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDeleteUser(user.id)} className="p-2 bg-slate-800/50 text-slate-400 hover:text-red-500 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden p-6">
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold text-white">{editingId ? 'Edit Creator' : 'New Creator'}</h2><button onClick={closeModal}><X className="w-5 h-5 text-slate-500" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div className="col-span-2"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Username</label><input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white" /></div>
                    <div className="col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Password</label><input required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white" /></div>
                    <div className="col-span-1"><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Share (%)</label><input type="number" min="0" max="100" required value={formData.revenueShare} onChange={e => setFormData({...formData, revenueShare: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white" /></div>
                </div>
                <div><label className="block text-xs font-bold text-slate-400 uppercase mb-2">Force Bind Channel ID</label><input value={formData.channelId} onChange={e => setFormData({...formData, channelId: e.target.value})} placeholder="UC..." className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl text-white" /></div>
                <button type="submit" className="w-full px-4 py-3 bg-indigo-600 text-white rounded-xl font-bold flex justify-center items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};