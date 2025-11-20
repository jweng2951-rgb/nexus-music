
import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, Save, X, Download, Percent, BarChart2, UserCircle, Link as LinkIcon, Radio } from 'lucide-react';

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
  const [formData, setFormData] = useState({ username: '', password: '', revenueShare: '80' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
        const updatePayload: Partial<User> = { username: formData.username, revenueShare: parseFloat(formData.revenueShare) };
        if(formData.password) updatePayload.password = formData.password;
        onUpdateUser(editingId, updatePayload);
    } else {
        onAddUser({
            username: formData.username,
            password: formData.password,
            role: UserRole.USER,
            revenueShare: parseFloat(formData.revenueShare),
            status: 'active'
        });
    }
    closeModal();
  };

  const openEdit = (user: User) => {
      setEditingId(user.id);
      setFormData({ username: user.username, password: '', revenueShare: user.revenueShare.toString() });
      setIsModalOpen(true);
  };

  const closeModal = () => {
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ username: '', password: '', revenueShare: '80' });
  };

  const nonAdminUsers = users.filter(u => u.role !== UserRole.ADMIN);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
          <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-3 w-full bg-slate-900/50 border border-white/10 text-white rounded-xl focus:ring-2 focus:ring-indigo-500/50 outline-none" />
        </div>
        <div className="flex gap-3">
             <button onClick={() => onExportData()} className="flex items-center gap-2 px-5 py-3 bg-slate-800/50 text-slate-200 border border-white/5 rounded-xl hover:bg-slate-800"><Download className="w-4 h-4" /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 font-bold"><Plus className="w-4 h-4" /> Create User</button>
        </div>
      </div>

      <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl border border-white/5 overflow-hidden">
        <table className="min-w-full divide-y divide-white/5">
          <thead className="bg-slate-900/80">
            <tr>
              <th className="px-8 py-5 text-left text-xs font-semibold text-slate-400 uppercase">User</th>
              <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase">Share %</th>
              <th className="px-6 py-5 text-left text-xs font-semibold text-slate-400 uppercase">Channel Status</th>
              <th className="px-8 py-5 text-right text-xs font-semibold text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {nonAdminUsers.map((user) => (
              <tr key={user.id} className="hover:bg-white/[0.02]">
                <td className="px-8 py-5 flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white">{user.username[0].toUpperCase()}</div>
                    <div><div className="font-bold text-white">{user.username}</div><div className="text-xs text-slate-500">{user.id}</div></div>
                </td>
                <td className="px-6 py-5"><span className="px-2 py-1 rounded bg-indigo-500/10 text-indigo-400 text-xs font-bold border border-indigo-500/20">{user.revenueShare}%</span></td>
                <td className="px-6 py-5">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <Radio className="w-4 h-4" />
                        <span>Multi-Channel Mode</span>
                    </div>
                </td>
                <td className="px-8 py-5 text-right space-x-2">
                    <button onClick={() => onViewStats(user.id)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded"><BarChart2 className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-700 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-700 rounded"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex justify-between mb-6"><h2 className="text-xl font-bold text-white">{editingId ? 'Edit User' : 'New User'}</h2><button onClick={closeModal}><X className="w-5 h-5 text-slate-500" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" placeholder="Username" />
                <input required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white" placeholder="Password" />
                <div className="relative"><input type="number" min="0" max="100" required value={formData.revenueShare} onChange={e => setFormData({...formData, revenueShare: e.target.value})} className="w-full p-3 pl-10 bg-black/30 border border-white/10 rounded-xl text-white" /><Percent className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" /></div>
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold"><Save className="w-4 h-4 inline mr-2" /> Save User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
