'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useGameStore } from '@/lib/store/gameStore';

export default function NewGamePage() {
  const router = useRouter();
  const setManagerProfile = useGameStore(state => state.setManagerProfile);
  const setPlayerTeam = useGameStore(state => state.setPlayerTeam);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nationality, setNationality] = useState('Indonesia');

  // Confederation Mapping
  const getConfederation = (country: string) => {
    const afc = ['Indonesia', 'Japan', 'South Korea'];
    const uefa = ['England', 'Spain', 'Italy', 'Germany', 'France'];
    const conmebol = ['Brazil', 'Argentina', 'Uruguay'];
    const concacaf = ['USA', 'Mexico'];
    const caf = ['Egypt', 'Nigeria', 'Senegal'];
    
    if (afc.includes(country)) return 'AFC';
    if (uefa.includes(country)) return 'UEFA';
    if (conmebol.includes(country)) return 'CONMEBOL';
    if (concacaf.includes(country)) return 'CONCACAF';
    if (caf.includes(country)) return 'CAF';
    return 'FIFA';
  };

  const confederation = getConfederation(nationality);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName) return;

    // Set Profil dengan Lisensi Dasar (D)
    setManagerProfile(`${firstName} ${lastName}`, nationality, confederation, 'D');

    // Arahkan ke Pusat Lowongan Kerja
    router.push('/dashboard/job-center');
  };

  const countries = [
    'Indonesia', 'Japan', 'South Korea',
    'England', 'Spain', 'Italy', 'Germany', 'France',
    'Brazil', 'Argentina', 'Uruguay',
    'USA', 'Mexico',
    'Egypt', 'Nigeria', 'Senegal'
  ].sort();

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl animate-fade-in">
        <h1 className="text-3xl font-black text-white text-center mb-2">Create Manager</h1>
        <p className="text-slate-400 text-center mb-8 text-sm">Welcome to Global Football Manager 2026. Start your career from the bottom.</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">First Name</label>
              <input 
                type="text" 
                required
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Shin"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Last Name</label>
              <input 
                type="text" 
                required
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                placeholder="e.g. Tae-yong"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nationality</label>
            <select 
              value={nationality}
              onChange={e => setNationality(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Starting Credentials</div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-300">Coaching License</span>
              <span className="px-3 py-1 bg-slate-800 text-emerald-400 rounded font-bold text-xs border border-emerald-900">{confederation} License D</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-slate-300">Reputation</span>
              <span className="text-sm font-bold text-amber-500">Unknown</span>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all uppercase tracking-widest mt-4"
          >
            Start Career
          </button>
        </form>
      </div>
    </div>
  );
}
