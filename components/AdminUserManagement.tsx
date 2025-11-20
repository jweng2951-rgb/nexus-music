import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Plus, Search, Edit2, Trash2, Save, X, Download, Percent, BarChart2, Radio } from 'lucide-react';

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
        onAddUser({ username: formData.username, password: formData.password, role: UserRole.USER, revenueShare: parseFloat(formData.revenueShare), status: 'active' });
    }
    closeModal();
  };

  const openEdit = (user: User) => { setEditingId(user.id); setFormData({ username: user.username, password: '', revenueShare: user.revenueShare.toString() }); setIsModalOpen(true); };
  const closeModal = () => { setIsModalOpen(false); setEditingId(null); setFormData({ username: '', password: '', revenueShare: '80' }); };
  const nonAdminUsers = users.filter(u => u.role !== UserRole.ADMIN);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex justify-between items-center gap-4">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input type="text" placeholder="Search users..." className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 text-slate-800 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm" />
        </div>
        <div className="flex gap-3">
            <button onClick={() => onExportData()} className="flex items-center gap-2 px-4 py-2.5 bg-white text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 font-medium shadow-sm"><Download className="w-4 h-4" /> Export</button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold shadow-sm shadow-indigo-200"><Plus className="w-4 h-4" /> Create User</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">User</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Share %</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Mode</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {nonAdminUsers.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-sm">{user.username[0].toUpperCase()}</div>
                    <div><div className="font-bold text-slate-800 text-sm">{user.username}</div><div className="text-xs text-slate-400">{user.id}</div></div>
                </td>
                <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100">{user.revenueShare}%</span></td>
                <td className="px-6 py-4"><div className="flex items-center gap-2 text-xs text-slate-500"><Radio className="w-3.5 h-3.5 text-slate-400" /><span>Multi-Channel</span></div></td>
                <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => onViewStats(user.id)} className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"><BarChart2 className="w-4 h-4" /></button>
                    <button onClick={() => openEdit(user)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => onDeleteUser(user.id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-4 h-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between mb-6"><h2 className="text-lg font-bold text-slate-800">{editingId ? 'Edit User' : 'New User'}</h2><button onClick={closeModal}><X className="w-5 h-5 text-slate-400 hover:text-slate-600" /></button></div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div><label className="text-xs font-bold text-slate-500 uppercase">Username</label><input required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase">Password</label><input required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" /></div>
                <div className="relative"><label className="text-xs font-bold text-slate-500 uppercase">Revenue Share (%)</label><input type="number" min="0" max="100" required value={formData.revenueShare} onChange={e => setFormData({...formData, revenueShare: e.target.value})} className="w-full mt-1 p-3 pl-10 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none" /><Percent className="absolute left-3 top-9 w-4 h-4 text-slate-400" /></div>
                <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-100">Save User</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};