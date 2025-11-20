import React, { useState } from 'react';
import { MusicTrack, UserRole, User } from '../types';
import { Play, Pause, Plus, Trash2, Headphones, CheckSquare, Square, Disc, User as UserIcon, X, Link as LinkIcon } from 'lucide-react';

interface Props {
  tracks: MusicTrack[];
  role: UserRole;
  onAddTrack?: (track: MusicTrack) => void;
  onDeleteTrack?: (id: string) => void;
  allUsers?: User[]; 
}

export const MusicLibrary: React.FC<Props> = ({ tracks, role, onAddTrack, onDeleteTrack, allUsers }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', category: '', isrc: '', url: '' });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(['all']);

  const togglePlay = (id: string) => { setPlayingId(playingId === id ? null : id); };
  const toggleUserSelection = (userId: string) => {
    if (userId === 'all') { setSelectedAssignees(['all']); return; }
    let newSelection = [...selectedAssignees].filter(id => id !== 'all');
    if (newSelection.includes(userId)) newSelection = newSelection.filter(id => id !== userId);
    else newSelection.push(userId);
    if (newSelection.length === 0) newSelection = ['all'];
    setSelectedAssignees(newSelection);
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTrack) {
      onAddTrack({ id: `m-${Date.now()}`, title: newTrack.title, artist: newTrack.artist, category: newTrack.category, url: newTrack.url || '#', assignedToIds: selectedAssignees, isrc: newTrack.isrc });
      setNewTrack({ title: '', artist: '', category: '', isrc: '', url: '' });
      setSelectedAssignees(['all']);
      setIsAdding(false);
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 overflow-hidden animate-fade-in">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
        <div className="flex items-center gap-4"><div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shadow-lg shadow-rose-500/20"><Headphones className="w-6 h-6 text-white" /></div><div><h2 className="text-lg font-bold text-white">Music Library</h2><p className="text-sm text-slate-400">Licensed Audio Assets & Distribution</p></div></div>
        {role === UserRole.ADMIN && (<button onClick={() => setIsAdding(!isAdding)} className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm ${isAdding ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-white text-black hover:bg-slate-200 shadow-lg shadow-white/10'}`}>{isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}<span>{isAdding ? 'Cancel' : 'Add New Track'}</span></button>)}
      </div>
      {isAdding && role === UserRole.ADMIN && (
        <div className="p-8 bg-slate-800/30 border-b border-white/5 animate-fade-in">
            <form onSubmit={handleAdd} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Title</label><input required value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all" placeholder="Track Name" /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Artist</label><input required value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all" placeholder="Artist Name" /></div>
                     <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">ISRC Code</label><input value={newTrack.isrc} onChange={e => setNewTrack({...newTrack, isrc: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all font-mono text-sm" placeholder="US-XXX-XX..." /></div>
                    <div><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Genre</label><input required value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all" placeholder="e.g. Pop, Lo-fi" /></div>
                    <div className="col-span-1 md:col-span-2"><label className="block text-xs font-bold text-slate-500 uppercase mb-2">Audio URL (MP3)</label><div className="relative"><LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" /><input value={newTrack.url} onChange={e => setNewTrack({...newTrack, url: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder-slate-600 transition-all font-mono text-sm" placeholder="https://example.com/song.mp3" /></div></div>
                </div>
                <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2"><UserIcon className="w-3 h-3" /> Distribute To (Select Users):</label>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => toggleUserSelection('all')} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border ${selectedAssignees.includes('all') ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}>{selectedAssignees.includes('all') ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />} All Users</button>
                        {allUsers?.filter(u => u.role === UserRole.USER).map(u => (<button key={u.id} type="button" onClick={() => toggleUserSelection(u.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all border ${selectedAssignees.includes(u.id) ? 'bg-indigo-500 text-white border-indigo-400' : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}>{selectedAssignees.includes(u.id) ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />} {u.username}</button>))}
                    </div>
                </div>
                <div className="flex justify-end"><button type="submit" className="px-6 py-3 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-xl hover:shadow-lg hover:shadow-rose-500/25 font-bold transition-all transform active:scale-95">Save & Distribute</button></div>
            </form>
        </div>
      )}
      <div className="overflow-x-auto"><table className="min-w-full divide-y divide-white/5"><thead><tr className="bg-slate-900/80 text-xs uppercase text-slate-400 font-semibold"><th className="px-6 py-4 text-left pl-8">Play</th><th className="px-6 py-4 text-left">Track Details</th><th className="px-6 py-4 text-left">ISRC</th>{role === UserRole.ADMIN && <th className="px-6 py-4 text-left">Assigned To</th>}<th className="px-6 py-4 text-right pr-8">Actions</th></tr></thead><tbody className="divide-y divide-white/5">{tracks.length === 0 ? (<tr><td colSpan={role === UserRole.ADMIN ? 5 : 4} className="px-6 py-16 text-center text-slate-500"><Disc className="w-12 h-12 mx-auto mb-3 opacity-20" /> No music tracks available yet.</td></tr>) : tracks.map((track) => (<tr key={track.id} className="group hover:bg-white/[0.02] transition-colors"><td className="px-6 py-4 pl-8 whitespace-nowrap w-16">{track.url && track.url !== '#' ? (<div className="flex items-center"><audio src={track.url} controls className="h-8 w-48 rounded opacity-60 hover:opacity-100 transition-opacity" onPlay={() => togglePlay(track.id)} /></div>) : (<button onClick={() => togglePlay(track.id)} disabled className="w-10 h-10 rounded-full flex items-center justify-center bg-slate-800 border border-white/10 text-slate-600 cursor-not-allowed"><Play className="w-4 h-4 ml-0.5" /></button>)}</td><td className="px-6 py-4 whitespace-nowrap"><div><h4 className="font-bold text-sm text-white">{track.title}</h4><div className="flex items-center text-xs text-slate-500 mt-1 gap-2"><span>{track.artist}</span><span className="w-1 h-1 rounded-full bg-slate-600"></span><span className="bg-slate-800 px-1.5 py-0.5 rounded border border-white/5 text-slate-400">{track.category}</span></div></div></td><td className="px-6 py-4 whitespace-nowrap"><span className="font-mono text-xs text-slate-400">{track.isrc || 'N/A'}</span></td>{role === UserRole.ADMIN && (<td className="px-6 py-4 whitespace-nowrap">{track.assignedToIds.includes('all') ? (<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">Global</span>) : (<div className="flex -space-x-1">{track.assignedToIds.map((uid, i) => (<div key={i} className="w-6 h-6 rounded-full bg-slate-700 border border-slate-900 flex items-center justify-center text-[10px] text-white font-bold" title={uid}>{allUsers?.find(u => u.id === uid)?.username.charAt(0).toUpperCase()}</div>))}</div>)}</td>)}<td className="px-6 py-4 whitespace-nowrap text-right pr-8"><div className="flex items-center justify-end gap-4">{role === UserRole.ADMIN && onDeleteTrack && (<button onClick={() => onDeleteTrack(track.id)} className="text-slate-600 hover:text-red-400 p-2 hover:bg-red-500/10 rounded-lg transition-all opacity-50 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>)}</div></td></tr>))}</tbody></table></div>
    </div>
  );
};