'use client';
import { useState, useRef, useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { Player, Team } from '@/types';
import { NegotiationState, DialogueOption, startNegotiation, getDialogueOptions, processDialogue } from '@/lib/engine/transferEngine';

export default function TransfersPage() {
  const database = useGameStore(state => state.database);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const scoutedPlayerIds = useGameStore(state => state.scoutedPlayerIds || []);
  const buyPlayer = useGameStore(state => state.buyPlayer);
  const scoutPlayer = useGameStore(state => state.scoutPlayer);

  const [searchTerm, setSearchTerm] = useState('');
  const [positionFilter, setPositionFilter] = useState('ALL');
  
  // Negotiation Modal State
  const [negoState, setNegoState] = useState<NegotiationState | null>(null);
  const [swapPlayerId, setSwapPlayerId] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{sender: string, msg: string, type: 'user' | 'ai'}[]>([]);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  if (!database || !playerTeamId) return null;

  const team = database.teams.find(t => t.id === playerTeamId);
  if (!team) return null;

  const mySquad = database.players.filter(p => p.teamId === playerTeamId);

  // Filter players that are NOT in our team
  let marketPlayers = database.players.filter(p => p.teamId !== playerTeamId);
  if (searchTerm) marketPlayers = marketPlayers.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  if (positionFilter !== 'ALL') marketPlayers = marketPlayers.filter(p => p.position === positionFilter);
  marketPlayers.sort((a, b) => b.overall - a.overall);
  marketPlayers = marketPlayers.slice(0, 100);

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`;
    return `€${amount}`;
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-emerald-400';
    if (rating >= 75) return 'text-blue-400';
    if (rating >= 65) return 'text-amber-400';
    return 'text-slate-400';
  };

  const startNego = (player: Player) => {
    const club = database.teams.find(t => t.id === player.teamId);
    if (!club) return;
    
    const initialState = startNegotiation(team, club, player);
    setNegoState(initialState);
    setSwapPlayerId('');
    
    setChatHistory([
      { sender: 'System', msg: `Memulai negosiasi dengan ${club.name} untuk ${player.name}.`, type: 'ai' },
      { sender: initialState.speaker, msg: initialState.lastMessage, type: 'ai' }
    ]);
  };

  const handleDialogueChoice = (option: DialogueOption) => {
    if (!negoState) return;
    
    let swapPlayer: Player | undefined;
    if (option.actionType === 'SWAP_PLAYER' && swapPlayerId) {
       swapPlayer = mySquad.find(p => p.id === swapPlayerId);
       if (!swapPlayer) {
          alert('Pilih pemain untuk ditukar dulu!');
          return;
       }
    } else if (option.actionType === 'SWAP_PLAYER' && !swapPlayerId) {
       alert('Pilih pemain dari skuad Anda untuk ditukar!');
       return;
    }

    // Add user choice to chat
    let userText = option.text;
    if (swapPlayer) userText += ` (${swapPlayer.name})`;
    setChatHistory(prev => [...prev, { sender: 'Anda (Manager)', msg: userText, type: 'user' }]);

    // Process logic
    const newState = processDialogue(negoState, option, swapPlayer);
    
    setTimeout(() => {
       setChatHistory(prev => [...prev, { sender: newState.speaker, msg: newState.lastMessage, type: 'ai' }]);
       setNegoState(newState);
    }, 800);
  };

  const finalizeDeal = () => {
    if (!negoState || negoState.phase !== 'DONE') return;
    
    const cost = negoState.isLoan ? 0 : negoState.offeredFee;
    if (team.transferBudget < cost) {
      alert("Dana transfer Anda tidak cukup untuk menyelesaikan kesepakatan ini!");
      return;
    }

    const outcome = buyPlayer(negoState.targetPlayer.id, cost, negoState.swapPlayer?.id, negoState.isLoan);
    
    if (outcome.success) {
      if (outcome.isBiddingWar) {
         alert(`GILA! Klub raksasa ikut menawar pemain ini! Anda terpaksa membayar €${((outcome.newCost || 0)/1000000).toFixed(1)}M (Termasuk Fee Agen Rakus)! Tapi pemain berhasil didapatkan.`);
      } else {
         alert("Transfer berhasil! Pemain telah bergabung dengan skuad.");
      }
      setNegoState(null);
    } else {
      alert(outcome.reason || "Transfer gagal! Dana transfer tidak cukup.");
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <header className="flex justify-between items-end pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-4xl font-black text-white">Transfer Market</h1>
          <p className="text-slate-400 mt-1">Negosiasi pemain & sistem pinjaman</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-400">Transfer Budget</div>
          <div className="text-3xl font-black text-emerald-400">{formatMoney(team.transferBudget)}</div>
        </div>
      </header>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <input 
          type="text" 
          placeholder="Cari pemain..." 
          className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
        >
          <option value="ALL">Semua Posisi</option>
          <option value="FWD">Attackers (FWD)</option>
          <option value="MID">Midfielders (MID)</option>
          <option value="DEF">Defenders (DEF)</option>
          <option value="GK">Goalkeepers (GK)</option>
        </select>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">OVR</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Pos</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Age</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Club</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider">Market Value</th>
                <th className="px-6 py-4 font-medium uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {marketPlayers.map(player => {
                const club = database.teams.find(t => t.id === player.teamId);
                const isScouted = scoutedPlayerIds.includes(player.id);
                
                return (
                  <tr key={player.id} className="hover:bg-slate-800/50 transition-colors group">
                    <td className={`px-6 py-4 font-black text-lg ${isScouted ? getRatingColor(player.overall) : 'text-slate-600'}`}>
                      {isScouted ? player.overall : '??'}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {player.name}
                    </td>
                    <td className="px-6 py-4 text-slate-400 font-bold">{player.position}</td>
                    <td className="px-6 py-4 text-slate-400">{player.age}</td>
                    <td className="px-6 py-4 text-slate-300">{club?.name || 'Free Agent'}</td>
                    <td className={`px-6 py-4 font-medium ${isScouted ? 'text-emerald-400/80' : 'text-slate-500'}`}>
                      {isScouted ? formatMoney(player.value) : 'Unknown'}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end gap-2">
                      {!isScouted && (
                        <button 
                          onClick={() => scoutPlayer(player.id, 50000)}
                          className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded font-bold transition-all text-xs uppercase tracking-wider"
                          title="Cost: €50K"
                        >
                          Scout
                        </button>
                      )}
                      <button 
                        onClick={() => startNego(player)}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold transition-all text-xs uppercase tracking-wider shadow-lg"
                      >
                        Nego
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* NEGOTIATION MODAL */}
      {negoState && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl flex flex-col md:flex-row overflow-hidden shadow-2xl animate-fade-in h-[600px]">
            
            {/* Control Panel (Left) */}
            <div className="w-full md:w-1/2 p-6 border-r border-slate-700 flex flex-col">
              <h2 className="text-2xl font-black text-white mb-1">Meja Perundingan</h2>
              <p className="text-sm text-slate-400 mb-4">Target: <span className="font-bold text-emerald-400">{negoState.targetPlayer.name} ({negoState.targetPlayer.overall} OVR)</span></p>

              {/* Patience Meter */}
              <div className="mb-6 bg-slate-950 p-3 rounded-lg border border-slate-800">
                 <div className="flex justify-between text-xs font-bold text-slate-400 mb-1">
                   <span>Tingkat Kesabaran</span>
                   <span>{negoState.patience}%</span>
                 </div>
                 <div className="w-full bg-slate-800 rounded-full h-2">
                   <div className={`h-2 rounded-full transition-all ${negoState.patience > 70 ? 'bg-emerald-500' : negoState.patience > 30 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${Math.max(0, negoState.patience)}%` }}></div>
                 </div>
              </div>

              <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar">
                {(negoState.phase === 'INIT' || negoState.phase === 'CLUB_FEE' || negoState.phase === 'AGENT_WAGE') && getDialogueOptions(negoState, mySquad).map(opt => (
                  <div key={opt.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 hover:border-slate-600 transition-all group">
                    <button 
                      onClick={() => handleDialogueChoice(opt)}
                      className="w-full text-left font-medium text-slate-300 group-hover:text-emerald-400 text-sm leading-relaxed"
                    >
                      "{opt.text}"
                    </button>
                    
                    {opt.actionType === 'SWAP_PLAYER' && (
                      <div className="mt-2 pt-2 border-t border-slate-800">
                        <select 
                          value={swapPlayerId}
                          onChange={e => setSwapPlayerId(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-xs outline-none focus:border-emerald-500"
                        >
                          <option value="">-- Pilih Pemain --</option>
                          {mySquad.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.overall} OVR)</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                ))}

                {negoState.phase === 'DONE' && (
                  <div className="bg-emerald-900/20 border border-emerald-800 p-6 rounded-xl text-center">
                    <h3 className="text-emerald-400 font-bold mb-2">Kesepakatan Berhasil!</h3>
                    <p className="text-slate-300 text-sm mb-4">Biaya Transfer: {formatMoney(negoState.offeredFee)}</p>
                    <button onClick={finalizeDeal} className="px-6 py-2 bg-emerald-600 text-white rounded font-bold shadow-[0_0_15px_rgba(16,185,129,0.4)] animate-pulse">
                      Tanda Tangani Kontrak
                    </button>
                  </div>
                )}
                
                {negoState.phase === 'FAILED' && (
                  <div className="bg-red-900/20 border border-red-800 p-6 rounded-xl text-center">
                    <h3 className="text-red-400 font-bold mb-2">Negosiasi Gagal</h3>
                    <p className="text-slate-400 text-sm">Pihak seberang telah meninggalkan meja perundingan.</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-slate-800">
                <button 
                  onClick={() => setNegoState(null)}
                  className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded font-bold transition-colors text-sm"
                >
                  Tutup
                </button>
              </div>
            </div>

            {/* Chat Dialog (Right) */}
            <div className="w-full md:w-1/2 bg-slate-950 flex flex-col">
              <div className="p-4 border-b border-slate-800 bg-slate-900/50">
                <h3 className="font-bold text-slate-200">Live Negotiation</h3>
                <p className="text-xs text-slate-500">with {negoState.sellerTeam.name} Representatives</p>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-4 custom-scrollbar">
                {chatHistory.map((chat, idx) => (
                  <div key={idx} className={`flex flex-col ${chat.type === 'user' ? 'items-end' : 'items-start'}`}>
                    <span className="text-[10px] text-slate-500 mb-1 px-1 uppercase tracking-wider">{chat.sender}</span>
                    <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm ${
                      chat.type === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-none' 
                        : chat.sender === 'System' 
                          ? 'bg-slate-800 text-slate-300 italic w-full text-center rounded-2xl'
                          : 'bg-emerald-900/40 border border-emerald-800/50 text-slate-200 rounded-tl-none'
                    }`}>
                      {chat.msg}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
