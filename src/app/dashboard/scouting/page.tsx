'use client';
import { useGameStore } from '@/lib/store/gameStore';
import { Search, Star, Eye } from 'lucide-react';
import { useState } from 'react';
import { TeamLogo } from '@/components/TeamLogo';

export default function ScoutingPage() {
  const database = useGameStore(state => state.database);
  const scoutedPlayerIds = useGameStore(state => state.scoutedPlayerIds || []);
  const scoutPlayer = useGameStore(state => state.scoutPlayer);
  const playerClubBalance = useGameStore(state => state.playerClubBalance);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [ageFilter, setAgeFilter] = useState('ALL');

  if (!database || !playerTeamId || playerTeamId === 'UNEMPLOYED') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-400 p-12">
        <Search size={64} className="mb-4 opacity-50" />
        <h2 className="text-2xl font-black text-slate-300">Scouting Network</h2>
        <p>Anda harus bergabung dengan sebuah klub terlebih dahulu.</p>
      </div>
    );
  }

  const SCOUT_COST = 50000; // €50,000 per scout report
  
  let players = database.players.filter(p => p.teamId !== playerTeamId);
  
  if (searchQuery) {
    players = players.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }
  if (posFilter !== 'ALL') {
    players = players.filter(p => p.position === posFilter);
  }
  if (ageFilter === 'YOUNG') players = players.filter(p => p.age <= 23);
  if (ageFilter === 'PRIME') players = players.filter(p => p.age >= 24 && p.age <= 30);
  if (ageFilter === 'VETERAN') players = players.filter(p => p.age >= 31);
  
  // Limit to top 50 by overall
  players = players.sort((a, b) => b.overall - a.overall).slice(0, 50);

  const handleScout = (playerId: string) => {
    if (playerClubBalance < SCOUT_COST) {
      return alert('Kas klub tidak cukup untuk mengirim Scout (€50.000 per laporan).');
    }
    const success = scoutPlayer(playerId, SCOUT_COST);
    if (success) {
      alert('Laporan scout berhasil diterima! Atribut pemain ini sekarang terbuka.');
    }
  };

  return (
    <div className="space-y-6 pb-20 animate-fade-in">
      <div>
        <h1 className="text-3xl font-black text-white flex items-center gap-3">
          <Search className="text-emerald-400" /> Jaringan Scouting
        </h1>
        <p className="text-slate-400 mt-1">Kirim scout untuk membuka data pemain dari seluruh dunia. Biaya: €50.000/laporan.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <input 
          type="text" 
          placeholder="Cari nama pemain..." 
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500 w-full md:w-80"
        />
        <select value={posFilter} onChange={e => setPosFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white">
          <option value="ALL">Semua Posisi</option>
          <option value="GK">Kiper</option>
          <option value="DEF">Bertahan</option>
          <option value="MID">Gelandang</option>
          <option value="FWD">Penyerang</option>
        </select>
        <select value={ageFilter} onChange={e => setAgeFilter(e.target.value)} className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-2 text-white">
          <option value="ALL">Semua Usia</option>
          <option value="YOUNG">Muda (≤23)</option>
          <option value="PRIME">Prima (24-30)</option>
          <option value="VETERAN">Veteran (31+)</option>
        </select>
      </div>

      {/* Player Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-950 text-slate-500 text-xs uppercase tracking-wider">
                <th className="text-left p-4">Pemain</th>
                <th className="text-center p-4">Pos</th>
                <th className="text-center p-4">Usia</th>
                <th className="text-center p-4">OVR</th>
                <th className="text-center p-4">POT</th>
                <th className="text-center p-4">Klub</th>
                <th className="text-center p-4">Nilai</th>
                <th className="text-center p-4">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {players.map(p => {
                const isScouted = scoutedPlayerIds.includes(p.id);
                const team = database.teams.find(t => t.id === p.teamId);
                return (
                  <tr key={p.id} className="border-t border-slate-800 hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 font-bold text-white">{p.name}</td>
                    <td className="text-center p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        p.position === 'GK' ? 'bg-amber-900/50 text-amber-400' :
                        p.position === 'DEF' ? 'bg-blue-900/50 text-blue-400' :
                        p.position === 'MID' ? 'bg-green-900/50 text-green-400' :
                        'bg-red-900/50 text-red-400'
                      }`}>{p.position}</span>
                    </td>
                    <td className="text-center p-4 text-slate-300">{p.age}</td>
                    <td className="text-center p-4">
                      {isScouted ? (
                        <span className={`font-black ${p.overall >= 80 ? 'text-emerald-400' : p.overall >= 70 ? 'text-white' : 'text-slate-400'}`}>{p.overall}</span>
                      ) : (
                        <span className="text-slate-600">???</span>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {isScouted ? (
                        <span className="text-amber-400 font-bold flex items-center justify-center gap-1"><Star size={12}/>{p.potential}</span>
                      ) : (
                        <span className="text-slate-600">???</span>
                      )}
                    </td>
                    <td className="text-center p-4 text-slate-400 text-xs">{team?.shortName || team?.name || '-'}</td>
                    <td className="text-center p-4 text-emerald-400 font-bold text-xs">€{(p.value/1000000).toFixed(1)}M</td>
                    <td className="text-center p-4">
                      {isScouted ? (
                        <span className="text-xs text-emerald-500 font-bold"><Eye size={14} className="inline mr-1"/>Terbuka</span>
                      ) : (
                        <button onClick={() => handleScout(p.id)} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded transition-colors">
                          Scout
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
