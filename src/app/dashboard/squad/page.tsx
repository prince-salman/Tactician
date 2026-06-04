'use client';
import { useGameStore } from '@/lib/store/gameStore';

export default function SquadPage() {
  const database = useGameStore(state => state.database);
  const playerTeamId = useGameStore(state => state.playerTeamId);

  if (!database || !playerTeamId) return null;

  const squad = database.players.filter(p => p.teamId === playerTeamId).sort((a, b) => b.overall - a.overall);
  const team = database.teams.find(t => t.id === playerTeamId);

  const getPositionColor = (pos: string) => {
    switch (pos) {
      case 'GK': return 'bg-amber-500/20 text-amber-400 border-amber-500/50';
      case 'DEF': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      case 'MID': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50';
      case 'FWD': return 'bg-red-500/20 text-red-400 border-red-500/50';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/50';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-emerald-400';
    if (rating >= 75) return 'text-blue-400';
    if (rating >= 65) return 'text-amber-400';
    return 'text-slate-400';
  };

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
    return `€${amount}`;
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex justify-between items-end pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-white">{team?.name} Squad</h1>
          <p className="text-slate-400 mt-1">Total Players: {squad.length}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Transfer Budget</div>
          <div className="text-2xl font-bold text-emerald-400">{formatMoney(team?.transferBudget || 0)}</div>
        </div>
      </header>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Position</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">OVR</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">POT</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Value</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Wage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {squad.map(player => (
                <tr key={player.id} className="hover:bg-slate-800/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold border ${getPositionColor(player.position)}`}>
                      {player.position}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {player.name}
                  </td>
                  <td className="px-6 py-4 text-slate-400">{player.age}</td>
                  <td className={`px-6 py-4 font-bold ${getRatingColor(player.overall)}`}>{player.overall}</td>
                  <td className={`px-6 py-4 font-bold opacity-70 ${getRatingColor(player.potential)}`}>{player.potential}</td>
                  <td className="px-6 py-4 text-slate-300 font-medium">{formatMoney(player.value)}</td>
                  <td className="px-6 py-4 text-slate-400">{formatMoney(player.wage)}/w</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
