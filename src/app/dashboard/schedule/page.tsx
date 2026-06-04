'use client';
import { useGameStore } from '@/lib/store/gameStore';
import { useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Shield } from 'lucide-react';
import { TeamLogo } from '@/components/TeamLogo';

export default function SchedulePage() {
  const database = useGameStore(state => state.database);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const standings = useGameStore(state => state.standings);
  const matchResults = useGameStore(state => state.matchResults);

  if (!database || !playerTeamId) return null;

  const myTeam = database.teams.find(t => t.id === playerTeamId);
  if (!myTeam) return null;

  const league = database.leagues.find(l => l.id === myTeam.leagueId);
  const leagueTeams = database.teams.filter(t => t.leagueId === myTeam.leagueId);

  // Standings berdasarkan real match results
  const leagueStandings = useMemo(() => {
    return leagueTeams.map(t => ({
      team: t,
      standing: standings[t.id] || {
        teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0,
        goalsFor: 0, goalsAgainst: 0, points: 0
      }
    })).sort((a, b) => {
      if (b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
      const gdA = a.standing.goalsFor - a.standing.goalsAgainst;
      const gdB = b.standing.goalsFor - b.standing.goalsAgainst;
      return gdB - gdA;
    });
  }, [leagueTeams, standings]);

  // Recent matches di liga ini
  const leagueTeamIds = new Set(leagueTeams.map(t => t.id));
  const recentLeagueMatches = matchResults
    .filter(m => leagueTeamIds.has(m.homeTeamId) && leagueTeamIds.has(m.awayTeamId))
    .slice(-10)
    .reverse();

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-end pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3"><Trophy className="text-amber-400" /> Klasemen</h1>
          <p className="text-slate-400 mt-1">{league?.name} · Musim 2026/2027</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Standings Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-slate-950/50 border-b border-slate-800 px-6 py-3">
            <h2 className="font-bold text-slate-300 text-sm uppercase tracking-wider">Tabel Klasemen</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="text-slate-500 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-3 font-medium">#</th>
                  <th className="px-4 py-3 font-medium">Klub</th>
                  <th className="px-4 py-3 font-medium text-center">M</th>
                  <th className="px-4 py-3 font-medium text-center">W</th>
                  <th className="px-4 py-3 font-medium text-center">D</th>
                  <th className="px-4 py-3 font-medium text-center">L</th>
                  <th className="px-4 py-3 font-medium text-center">GF</th>
                  <th className="px-4 py-3 font-medium text-center">GA</th>
                  <th className="px-4 py-3 font-medium text-center">GD</th>
                  <th className="px-6 py-3 font-black text-emerald-400 text-center">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {leagueStandings.map(({ team, standing }, index) => {
                  const isMyTeam = team.id === playerTeamId;
                  const pos = index + 1;
                  const isTier1 = pos <= 4;
                  const isTier2 = pos === 5 || pos === 6;
                  const isTier3 = pos === 7;
                  const isRelegation = index >= leagueStandings.length - 3;
                  const gd = standing.goalsFor - standing.goalsAgainst;

                  return (
                    <tr
                      key={team.id}
                      className={`transition-colors ${isMyTeam ? 'border-y-2 border-emerald-500 bg-slate-800/80' : 'hover:bg-slate-800/30'}
                        ${isTier1 && !isMyTeam ? 'bg-emerald-950/20' : ''}
                        ${isTier2 && !isMyTeam ? 'bg-blue-950/20' : ''}
                        ${isTier3 && !isMyTeam ? 'bg-amber-950/20' : ''}
                      `}
                    >
                      <td className="px-6 py-3">
                        <div className={`w-6 h-6 flex items-center justify-center rounded text-xs font-bold
                          ${isTier1 ? 'bg-emerald-500 text-white' : isTier2 ? 'bg-blue-500 text-white' : isTier3 ? 'bg-amber-500 text-white' : isRelegation ? 'bg-red-500/80 text-white' : 'text-slate-500'}`}>
                          {pos}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TeamLogo teamId={team.id} teamName={team.name} shortName={team.shortName} size={32} />
                          <span className={`font-bold ${isMyTeam ? 'text-emerald-400' : 'text-slate-200'}`}>
                            {team.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-400">{standing.played}</td>
                      <td className="px-4 py-3 text-center text-slate-300">{standing.won}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{standing.drawn}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{standing.lost}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{standing.goalsFor}</td>
                      <td className="px-4 py-3 text-center text-slate-400">{standing.goalsAgainst}</td>
                      <td className={`px-4 py-3 text-center font-medium ${gd > 0 ? 'text-emerald-400' : gd < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                        {gd > 0 ? `+${gd}` : gd}
                      </td>
                      <td className="px-6 py-3 text-center font-black text-lg text-white">{standing.points}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-800 flex flex-wrap gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.5)]" /> Tier 1 Continental (ECL)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-500 rounded-sm shadow-[0_0_8px_rgba(59,130,246,0.5)]" /> Tier 2 Continental (EPC)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-amber-500 rounded-sm shadow-[0_0_8px_rgba(245,158,11,0.5)]" /> Tier 3 Continental (EHL)</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-red-500/80 rounded-sm shadow-[0_0_8px_rgba(239,68,68,0.5)]" /> Degradasi</span>
          </div>
        </div>

        {/* Recent Results */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
            <h3 className="font-bold text-slate-300 text-sm uppercase tracking-wider mb-4 flex items-center gap-2"><Shield size={14} className="text-blue-400" /> Hasil Terakhir</h3>
            {recentLeagueMatches.length === 0 ? (
              <p className="text-slate-500 text-sm italic">Belum ada pertandingan. Mainkan match pertama Anda!</p>
            ) : (
              <div className="space-y-3">
                {recentLeagueMatches.map(m => {
                  const home = database.teams.find(t => t.id === m.homeTeamId);
                  const away = database.teams.find(t => t.id === m.awayTeamId);
                  const isMyMatch = m.homeTeamId === playerTeamId || m.awayTeamId === playerTeamId;
                  return (
                    <div key={m.id} className={`p-3 rounded-lg text-sm ${isMyMatch ? 'bg-emerald-900/20 border border-emerald-900/50' : 'bg-slate-800/50'}`}>
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 flex items-center justify-end gap-2 truncate">
                           <span className="font-medium text-slate-200">{home?.name}</span>
                           {home && <TeamLogo teamId={home.id} teamName={home.name} shortName={home.shortName} size={28} />}
                        </div>
                        
                        <span className="font-black text-white bg-slate-900 px-3 py-1 rounded text-base shrink-0 mx-2">{m.homeScore} - {m.awayScore}</span>
                        
                        <div className="flex-1 flex items-center justify-start gap-2 truncate">
                           {away && <TeamLogo teamId={away.id} teamName={away.name} shortName={away.shortName} size={28} />}
                           <span className="font-medium text-slate-200">{away?.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <Link href="/dashboard/match"
            className="block w-full text-center py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-black rounded-xl transition-colors uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            ⚽ Main Pertandingan
          </Link>
        </div>
      </div>
    </div>
  );
}
