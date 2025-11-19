import React, { useState } from 'react';
import { MusicTrack, UserRole, User } from '../types';
import { Play, Pause, Plus, Trash2, Headphones, CheckSquare, Square, Disc, X, User as UserIcon } from 'lucide-react';

interface Props { tracks: MusicTrack[]; role: UserRole; onAddTrack?: (track: MusicTrack) => void; onDeleteTrack?: (id: string) => void; allUsers?: User[]; }

export const MusicLibrary: React.FC<Props> = ({ tracks, role, onAddTrack, onDeleteTrack, allUsers }) => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', category: '', isrc: '' });
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>(['all']);

  const togglePlay = (id: string) => { playingId === id ? setPlayingId(null) : setPlayingId(id); };
  const toggleUserSelection = (id: string) => {
    if(id==='all') { setSelectedAssignees(['all']); return; }
    let newSel = selectedAssignees.filter(x=>x!=='all').includes(id) ? selectedAssignees.filter(x=>x!==id && x!=='all') : [...selectedAssignees.filter(x=>x!=='all'), id];
    setSelectedAssignees(newSel.length ? newSel : ['all']);
  };

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (onAddTrack) { onAddTrack({ id: `m-${Date.now()}`, ...newTrack, url: '#', assignedToIds: selectedAssignees }); setIsAdding(false); setNewTrack({ title:'', artist:'', category:'', isrc:'' }); setSelectedAssignees(['all']); }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-2xl shadow-2xl border border-white/5 overflow-hidden animate-fade-in">
      <div className="p-6 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-4"><Headphones className="w-8 h-8 text-rose-500" /><div><h2 className="text-lg font-bold text-white">Music Library</h2></div></div>
        {role === UserRole.ADMIN && <button onClick={() => setIsAdding(!isAdding)} className="px-4 py-2 bg-white text-black rounded-xl text-sm font-bold flex gap-2"><Plus className="w-4 h-4" /> {isAdding ? 'Cancel' : 'Add Track'}</button>}
      </div>
      {isAdding && role === UserRole.ADMIN && (
        <form onSubmit={handleAdd} className="p-6 bg-slate-800/30 space-y-4">
            <div className="grid grid-cols-4 gap-4">
                <input required placeholder="Title" value={newTrack.title} onChange={e => setNewTrack({...newTrack, title: e.target.value})} className="px-4 py-2 rounded bg-black/40 text-white border border-white/10" />
                <input required placeholder="Artist" value={newTrack.artist} onChange={e => setNewTrack({...newTrack, artist: e.target.value})} className="px-4 py-2 rounded bg-black/40 text-white border border-white/10" />
                <input placeholder="ISRC" value={newTrack.isrc} onChange={e => setNewTrack({...newTrack, isrc: e.target.value})} className="px-4 py-2 rounded bg-black/40 text-white border border-white/10" />
                <input required placeholder="Genre" value={newTrack.category} onChange={e => setNewTrack({...newTrack, category: e.target.value})} className="px-4 py-2 rounded bg-black/40 text-white border border-white/10" />
            </div>
            <div className="flex gap-2 flex-wrap">{allUsers?.filter(u=>u.role==='USER').map(u => (<button type="button" key={u.id} onClick={() => toggleUserSelection(u.id)} className={`px-3 py-1 rounded text-xs border ${selectedAssignees.includes(u.id)?'bg-indigo-600 border-indigo-500 text-white':'bg-slate-800 border-transparent text-slate-400'}`}>{u.username}</button>))}</div>
            <button type="submit" className="px-6 py-2 bg-rose-600 text-white rounded font-bold">Save</button>
        </form>
      )}
      <div className="overflow-x-auto"><table className="w-full text-left text-sm text-slate-400"><thead className="bg-slate-900/80 uppercase text-xs"><tr><th className="px-6 py-4">Play</th><th className="px-6 py-4">Details</th><th className="px-6 py-4">ISRC</th><th className="px-6 py-4 text-right">Actions</th></tr></thead><tbody>
      {tracks.map(t => (<tr key={t.id} className="border-t border-white/5 hover:bg-white/5"><td className="px-6 py-4"><button onClick={()=>togglePlay(t.id)} className="p-2 rounded-full bg-slate-800 hover:text-white">{playingId===t.id?<Pause className="w-4 h-4"/>:<Play className="w-4 h-4"/>}</button></td><td className="px-6 py-4"><div className="text-white font-bold">{t.title}</div><div className="text-xs">{t.artist}</div></td><td className="px-6 py-4 font-mono">{t.isrc}</td><td className="px-6 py-4 text-right">{role===UserRole.ADMIN && onDeleteTrack && <button onClick={()=>onDeleteTrack(t.id)} className="text-red-500"><Trash2 className="w-4 h-4"/></button>}</td></tr>))}
      </tbody></table></div>
    </div>
  );
};