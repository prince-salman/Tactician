'use client';
import { useGameStore } from '@/lib/store/gameStore';
import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Trophy, Users, MessageSquare, TrendingUp, AlertTriangle, Calendar, Star, Briefcase } from 'lucide-react';
import { TeamLogo } from '@/components/TeamLogo';

export default function DashboardHome() {
  const database = useGameStore(state => state.database);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const managerName = useGameStore(state => state.managerName);
  const managerRole = useGameStore(state => state.managerRole);
  const currentDate = useGameStore(state => state.currentDate);
  const boardConfidence = useGameStore(state => state.boardConfidence);
  const standings = useGameStore(state => state.standings);
  const matchResults = useGameStore(state => state.matchResults);
  const inboxMessages = useGameStore(state => state.inboxMessages);
  const playerStatuses = useGameStore(state => state.playerStatuses);
  const addInboxMessage = useGameStore(state => state.addInboxMessage);
  const managerLicense = useGameStore(state => state.managerLicense);
  const managerConfederation = useGameStore(state => state.managerConfederation);
  const upgradeLicense = useGameStore(state => state.upgradeLicense);

  const myTeam = database?.teams.find(t => t.id === playerTeamId);
  const myLeague = database?.leagues.find(l => l.id === myTeam?.leagueId);
  const mySquad = database?.players.filter(p => p.teamId === playerTeamId) || [];

  // Kalender: Tim lawan berikutnya
  const leagueTeams = database?.teams.filter(t => t.leagueId === myTeam?.leagueId && t.id !== playerTeamId) || [];
  const nextOpponent = leagueTeams[Math.floor(Math.random() * leagueTeams.length)];

  // Standings untuk liga saya
  const leagueStandings = useMemo(() => {
    if (!database || !myTeam) return [];
    return database.teams
      .filter(t => t.leagueId === myTeam.leagueId)
      .map(t => ({
        team: t,
        standing: standings[t.id] || { teamId: t.id, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }
      }))
      .sort((a, b) => {
        if (b.standing.points !== a.standing.points) return b.standing.points - a.standing.points;
        return (b.standing.goalsFor - b.standing.goalsAgainst) - (a.standing.goalsFor - a.standing.goalsAgainst);
      })
      .slice(0, 5);
  }, [database, myTeam, standings]);

  // Pemain yang Cedera/Suspend
  const injuredPlayers = playerStatuses.filter(ps => ps.injured || ps.suspended);

  // Last 5 matches
  const recentMatches = matchResults
    .filter(m => m.homeTeamId === playerTeamId || m.awayTeamId === playerTeamId)
    .slice(-5)
    .reverse();

  // Add welcome message saat pertama kali
  useEffect(() => {
    if (managerName && inboxMessages.length === 0) {
      addInboxMessage({ from: 'Chairman', subject: 'Welcome to the club!', body: `Selamat datang ${managerName}! Kami yakin dengan kemampuan Anda untuk memimpin tim ini.`, type: 'board' });
      addInboxMessage({ from: 'Assistant Manager', subject: 'Squad Report', body: 'Skuad siap berlatih. Beberapa pemain membutuhkan perhatian khusus sebelum musim dimulai.', type: 'info' });
    }
  }, [managerName]);

  const unreadCount = inboxMessages.filter(m => !m.read).length;

  const formatMoney = (n: number) => {
    if (n >= 1000000) return `€${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `€${(n / 1000).toFixed(0)}K`;
    return `€${n}`;
  };

  const getBoardColor = (v: number) => {
    if (v >= 70) return 'text-emerald-400';
    if (v >= 40) return 'text-amber-400';
    return 'text-red-400';
  };

  if (!database) return null;

  // Jika Nganggur
  if (!playerTeamId || playerTeamId === 'UNEMPLOYED') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Briefcase size={64} className="text-slate-600 mb-6" />
        <h1 className="text-4xl font-black text-white mb-2">Anda Belum Punya Klub</h1>
        <p className="text-slate-400 mb-8 max-w-md">Pergi ke Job Center dan lamar posisi pelatih yang sesuai dengan lisensi {managerConfederation} Level {managerLicense} Anda.</p>
        <Link href="/dashboard/job-center" className="px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all uppercase tracking-widest">
          Buka Job Center →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <header className="flex justify-between items-start pb-6 border-b border-slate-800">
        <div>
          <p className="text-slate-500 text-sm font-medium uppercase tracking-wider">{managerRole}</p>
          <h1 className="text-4xl font-black text-white">{myTeam?.name}</h1>
          <p className="text-slate-400 mt-1">{myLeague?.name} · {new Date(currentDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-slate-500">Transfer Budget</div>
            <div className="text-xl font-black text-emerald-400">{formatMoney(myTeam?.transferBudget || 0)}</div>
          </div>
          <div className="w-px h-10 bg-slate-800" />
          <div className="text-right">
            <div className="text-xs text-slate-500">Board</div>
            <div className={`text-xl font-black ${getBoardColor(boardConfidence)}`}>{boardConfidence}%</div>
          </div>
        </div>
      </header>

      {/* Top Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Next Match */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-emerald-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2"><Calendar size={14} /> Pertandingan Berikutnya</h3>
            <span className="text-xs text-slate-500">{myLeague?.name}</span>
          </div>
          <div className="flex justify-between items-center bg-slate-950 p-6 rounded-xl">
            <div className="text-center flex-1 flex flex-col items-center">
              <TeamLogo 
                teamId={myTeam?.id || ''} 
                teamName={myTeam?.name || ''} 
                shortName={myTeam?.shortName || ''} 
                size={80} 
                className="mb-3"
              />
              <span className="text-sm font-bold text-white">{myTeam?.name}</span>
              <div className="text-xs text-emerald-500 mt-1">OVR {myTeam?.reputation}</div>
            </div>
            <div className="px-6">
              <div className="text-slate-400 font-black text-2xl">VS</div>
              <div className="text-xs text-slate-600 text-center mt-1">Home</div>
            </div>
            <div className="text-center flex-1 flex flex-col items-center">
              <TeamLogo 
                teamId={nextOpponent?.id || ''} 
                teamName={nextOpponent?.name || 'TBD'} 
                shortName={nextOpponent?.shortName || ''} 
                size={80} 
                className="mb-3"
              />
              <span className="text-sm font-bold text-white">{nextOpponent?.name || 'TBD'}</span>
              <div className="text-xs text-slate-500 mt-1">OVR {nextOpponent?.reputation}</div>
            </div>
          </div>
          <Link href="/dashboard/match" className="block text-center w-full mt-4 py-3 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-bold transition-colors uppercase tracking-wider shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            ⚽ Mainkan Pertandingan
          </Link>
        </div>

        {/* Board Confidence */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-blue-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-4"><TrendingUp size={14} /> Board Confidence</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-slate-400">Overall</span>
                <span className={getBoardColor(boardConfidence)}>{boardConfidence}%</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-3">
                <div className={`h-3 rounded-full transition-all duration-500 ${boardConfidence >= 70 ? 'bg-emerald-500' : boardConfidence >= 40 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${boardConfidence}%` }} />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-500 mb-2">Lisensi Pelatih</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">{managerConfederation} License {managerLicense}</span>
                {managerLicense !== 'Pro' && (
                  <button
                    onClick={upgradeLicense}
                    className="text-xs px-3 py-1 bg-blue-800 hover:bg-blue-700 text-blue-300 rounded font-bold transition-colors"
                  >
                    Upgrade →
                  </button>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-500 mb-2">Target Musim Ini (Board Objective)</div>
              <div className="text-sm font-bold text-amber-400 bg-amber-900/20 border border-amber-800/40 p-2 rounded">
                Menghindari Degradasi
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800">
              <div className="text-xs text-slate-500 mb-2">Form Terakhir</div>
              <div className="flex gap-2">
                {recentMatches.length === 0 && <span className="text-xs text-slate-600 italic">Belum ada pertandingan</span>}
                {recentMatches.map((m, i) => {
                  const myScore = m.homeTeamId === playerTeamId ? m.homeScore : m.awayScore;
                  const oppScore = m.homeTeamId === playerTeamId ? m.awayScore : m.homeScore;
                  const result = myScore > oppScore ? 'W' : myScore === oppScore ? 'D' : 'L';
                  return (
                    <span key={i} className={`w-8 h-8 rounded flex items-center justify-center font-black text-xs ${result === 'W' ? 'bg-emerald-700 text-white' : result === 'D' ? 'bg-amber-700 text-white' : 'bg-red-800 text-white'}`}>
                      {result}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* League Standings Mini */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-4"><Trophy size={14} /> Klasemen Liga</h3>
          {leagueStandings.length === 0 ? (
            <p className="text-slate-500 text-sm">Mainkan pertandingan untuk mengisi klasemen</p>
          ) : (
            <div className="space-y-2">
              {leagueStandings.map(({ team, standing }, i) => (
                <div key={team.id} className={`flex items-center gap-3 py-2 px-3 rounded-lg text-sm ${team.id === playerTeamId ? 'bg-emerald-900/20 border border-emerald-800/30' : ''}`}>
                  <span className="text-slate-500 w-4 text-center">{i + 1}</span>
                  <TeamLogo teamId={team.id} teamName={team.name} shortName={team.shortName} size={24} />
                  <span className={`flex-1 font-medium ${team.id === playerTeamId ? 'text-emerald-400' : 'text-slate-300'} truncate`}>{team.name}</span>
                  <span className="text-slate-400 w-5 text-center">{standing.played}</span>
                  <span className="font-black text-white w-5 text-center">{standing.points}</span>
                </div>
              ))}
              <Link href="/dashboard/schedule" className="block text-center text-xs text-slate-500 hover:text-emerald-400 transition-colors mt-2 pt-2 border-t border-slate-800">
                Lihat Klasemen Penuh →
              </Link>
            </div>
          )}
        </div>

        {/* Squad Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-purple-400 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-4"><Users size={14} /> Status Skuad</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Total Pemain</span>
              <span className="font-black text-white">{mySquad.length}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-400 text-sm flex items-center gap-1"><AlertTriangle size={12} className="text-red-400" /> Cedera</span>
              <span className={`font-black ${injuredPlayers.filter(p => p.injured).length > 0 ? 'text-red-400' : 'text-slate-500'}`}>
                {injuredPlayers.filter(p => p.injured).length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-800">
              <span className="text-slate-400 text-sm flex items-center gap-1"><AlertTriangle size={12} className="text-amber-400" /> Suspended</span>
              <span className={`font-black ${injuredPlayers.filter(p => p.suspended).length > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                {injuredPlayers.filter(p => p.suspended).length}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-slate-400 text-sm flex items-center gap-1"><Star size={12} className="text-amber-400" /> Avg OVR</span>
              <span className="font-black text-amber-400">
                {mySquad.length > 0 ? Math.round(mySquad.reduce((sum, p) => sum + p.overall, 0) / mySquad.length) : '-'}
              </span>
            </div>
          </div>
          <Link href="/dashboard/squad" className="block text-center text-xs text-slate-500 hover:text-purple-400 transition-colors mt-3 pt-3 border-t border-slate-800">
            Lihat Squad Lengkap →
          </Link>
        </div>

        {/* Inbox */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-slate-300 font-bold uppercase tracking-wider text-sm flex items-center gap-2 mb-4">
            <MessageSquare size={14} className="text-blue-400" />
            Inbox {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span>}
          </h3>
          <div className="space-y-2">
            {inboxMessages.slice(0, 4).map(msg => (
              <div key={msg.id} className={`p-3 rounded-lg cursor-pointer transition-colors border-l-2 text-sm ${
                !msg.read ? 'bg-slate-800 border-blue-500' : 'bg-slate-900/50 border-slate-700 opacity-60'
              } ${msg.type === 'warning' ? 'border-amber-500' : msg.type === 'board' ? 'border-purple-500' : msg.type === 'transfer' ? 'border-emerald-500' : ''}`}>
                <div className="font-bold text-slate-200">{msg.subject}</div>
                <div className="text-slate-500 text-xs mt-0.5">Dari: {msg.from}</div>
              </div>
            ))}
            {inboxMessages.length === 0 && <p className="text-slate-600 text-sm italic">Tidak ada pesan</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
