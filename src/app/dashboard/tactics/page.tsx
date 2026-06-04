'use client';
import { useState, useEffect } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { DndContext, useDraggable, useDroppable, DragEndEvent } from '@dnd-kit/core';
import { Player } from '@/types';

// Komponen Posisi di Lapangan (Droppable)
function PitchPosition({ id, label, player, style }: { id: string, label: string, player?: Player, style: any }) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div 
      ref={setNodeRef}
      className={`absolute flex flex-col items-center justify-center w-16 h-16 rounded-full border-2 transition-all ${
        isOver ? 'border-emerald-400 bg-emerald-500/50 scale-110 shadow-[0_0_15px_rgba(52,211,153,0.5)]' 
        : player ? 'border-slate-300 bg-slate-900 shadow-lg' 
        : 'border-white/30 bg-black/20 hover:border-white/60'
      }`}
      style={style}
    >
      {player ? (
        <>
          <div className="text-[10px] font-bold text-slate-300">{player.overall}</div>
          <div className="text-[9px] text-white truncate w-14 text-center font-medium px-1">
            {player.name.split(' ').pop()}
          </div>
        </>
      ) : (
        <span className="text-white/50 text-xs font-bold">{label}</span>
      )}
    </div>
  );
}

// Komponen Pemain di Bench (Draggable)
function DraggablePlayer({ player }: { player: Player }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: player.id,
    data: player
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 50,
  } : undefined;

  const getRatingColor = (rating: number) => {
    if (rating >= 85) return 'text-emerald-400';
    if (rating >= 75) return 'text-blue-400';
    if (rating >= 65) return 'text-amber-400';
    return 'text-slate-400';
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="bg-slate-900 border border-slate-700 p-3 rounded-lg flex justify-between items-center cursor-grab active:cursor-grabbing hover:border-emerald-500 transition-colors shadow-md"
    >
      <div>
        <div className="font-medium text-sm text-slate-200">{player.name}</div>
        <div className="text-xs text-slate-500">{player.position}</div>
      </div>
      <div className={`font-black ${getRatingColor(player.overall)}`}>
        {player.overall}
      </div>
    </div>
  );
}

const FORMATIONS = {
  '4-3-3': [
    { id: 'ST', label: 'ST', top: '15%', left: '50%' },
    { id: 'LW', label: 'LW', top: '25%', left: '20%' },
    { id: 'RW', label: 'RW', top: '25%', left: '80%' },
    { id: 'CM1', label: 'CM', top: '45%', left: '30%' },
    { id: 'CM2', label: 'CM', top: '50%', left: '50%' },
    { id: 'CM3', label: 'CM', top: '45%', left: '70%' },
    { id: 'LB', label: 'LB', top: '70%', left: '15%' },
    { id: 'CB1', label: 'CB', top: '75%', left: '35%' },
    { id: 'CB2', label: 'CB', top: '75%', left: '65%' },
    { id: 'RB', label: 'RB', top: '70%', left: '85%' },
    { id: 'GK', label: 'GK', top: '90%', left: '50%' },
  ],
  '4-4-2': [
    { id: 'ST1', label: 'ST', top: '15%', left: '35%' },
    { id: 'ST2', label: 'ST', top: '15%', left: '65%' },
    { id: 'LM', label: 'LM', top: '40%', left: '15%' },
    { id: 'CM1', label: 'CM', top: '45%', left: '35%' },
    { id: 'CM2', label: 'CM', top: '45%', left: '65%' },
    { id: 'RM', label: 'RM', top: '40%', left: '85%' },
    { id: 'LB', label: 'LB', top: '70%', left: '15%' },
    { id: 'CB1', label: 'CB', top: '75%', left: '35%' },
    { id: 'CB2', label: 'CB', top: '75%', left: '65%' },
    { id: 'RB', label: 'RB', top: '70%', left: '85%' },
    { id: 'GK', label: 'GK', top: '90%', left: '50%' },
  ],
  '3-5-2': [
    { id: 'ST1', label: 'ST', top: '15%', left: '35%' },
    { id: 'ST2', label: 'ST', top: '15%', left: '65%' },
    { id: 'LWB', label: 'LWB', top: '40%', left: '10%' },
    { id: 'CM1', label: 'CM', top: '45%', left: '30%' },
    { id: 'CAM', label: 'CAM', top: '35%', left: '50%' },
    { id: 'CM2', label: 'CM', top: '45%', left: '70%' },
    { id: 'RWB', label: 'RWB', top: '40%', left: '90%' },
    { id: 'CB1', label: 'CB', top: '75%', left: '25%' },
    { id: 'CB2', label: 'CB', top: '75%', left: '50%' },
    { id: 'CB3', label: 'CB', top: '75%', left: '75%' },
    { id: 'GK', label: 'GK', top: '90%', left: '50%' },
  ]
};

export default function TacticsPage() {
  const database = useGameStore(state => state.database);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const playerTactics = useGameStore(state => state.playerTactics);
  const setPlayerTactics = useGameStore(state => state.setPlayerTactics);

  const [squad, setSquad] = useState<Player[]>([]);
  const [activeFormation, setActiveFormation] = useState<string>('4-3-3');
  const [lineup, setLineup] = useState<Record<string, Player | undefined>>({});
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (database && playerTeamId) {
      const myPlayers = database.players.filter(p => p.teamId === playerTeamId).sort((a, b) => b.overall - a.overall);
      setSquad(myPlayers);

      // Load tactics from store
      if (playerTactics) {
        setActiveFormation(playerTactics.formation || '4-3-3');
        const loadedLineup: Record<string, Player | undefined> = {};
        Object.keys(playerTactics.lineup).forEach(posId => {
          loadedLineup[posId] = myPlayers.find(p => p.id === playerTactics.lineup[posId]);
        });
        setLineup(loadedLineup);
      }
    }
  }, [database, playerTeamId, playerTactics]);

  if (!database || !playerTeamId) return null;

  const isPlayerInLineup = (playerId: string) => {
    return Object.values(lineup).some(p => p?.id === playerId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { over, active } = event;
    if (over && over.id) {
      const positionId = over.id as string;
      const player = active.data.current as Player;
      
      setLineup(prev => ({
        ...prev,
        [positionId]: player
      }));
      setIsSaved(false);
    }
  };

  const removePlayer = (pos: string) => {
    setLineup(prev => ({ ...prev, [pos]: undefined }));
    setIsSaved(false);
  };

  const handleFormationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setActiveFormation(e.target.value);
    setLineup({}); // Reset lineup when changing formation
    setIsSaved(false);
  };

  const saveTactics = () => {
    const lineupRecord: Record<string, string> = {};
    Object.keys(lineup).forEach(posId => {
      if (lineup[posId]) {
        lineupRecord[posId] = lineup[posId]!.id;
      }
    });
    setPlayerTactics(activeFormation, playerTactics.style || 'TIKI_TAKA', lineupRecord);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const availableSquad = squad.filter(p => !isPlayerInLineup(p.id));
  const pitchPositions = FORMATIONS[activeFormation as keyof typeof FORMATIONS] || FORMATIONS['4-3-3'];
  const team = database.teams.find(t => t.id === playerTeamId);

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-full space-y-6 pb-12">
        <header className="flex justify-between items-end pb-6 border-b border-slate-800">
          <div>
            <h1 className="text-4xl font-black text-white">Tactics & Lineup</h1>
            <p className="text-slate-400 mt-1">{team?.name} • Tactical Board</p>
          </div>
          <div className="flex gap-4 items-center">
            <select 
              value={activeFormation}
              onChange={handleFormationChange}
              className="bg-slate-900 border border-slate-700 text-white rounded px-4 py-2 font-bold outline-none focus:border-emerald-500"
            >
              <option value="4-3-3">4-3-3 Attack</option>
              <option value="4-4-2">4-4-2 Classic</option>
              <option value="3-5-2">3-5-2 Wingbacks</option>
            </select>
            <button 
              onClick={saveTactics}
              className={`px-6 py-2 rounded font-bold transition-all ${isSaved ? 'bg-emerald-800 text-emerald-400' : 'bg-emerald-600 hover:bg-emerald-500 text-white'}`}
            >
              {isSaved ? '✓ Saved!' : 'Save Tactics'}
            </button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8 flex-1">
          {/* Pitch Area */}
          <div className="lg:w-2/3">
            <div className="relative w-full max-w-[600px] mx-auto aspect-[3/4] bg-emerald-800 rounded-lg border-4 border-emerald-900 overflow-hidden shadow-2xl">
              {/* Pitch Lines */}
              <div className="absolute inset-0 border-[3px] border-white/40 m-4"></div>
              {/* Center Line & Circle */}
              <div className="absolute top-1/2 left-0 w-full h-[3px] bg-white/40 -translate-y-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-32 h-32 border-[3px] border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              {/* Penalty Boxes */}
              <div className="absolute top-4 left-1/2 w-1/2 h-1/6 border-[3px] border-white/40 -translate-x-1/2"></div>
              <div className="absolute bottom-4 left-1/2 w-1/2 h-1/6 border-[3px] border-white/40 -translate-x-1/2"></div>
              
              {/* Drop Zones / Players on Pitch */}
              {pitchPositions.map(pos => (
                <div key={pos.id} onClick={() => removePlayer(pos.id)} className="cursor-pointer">
                  <PitchPosition 
                    id={pos.id} 
                    label={pos.label} 
                    player={lineup[pos.id]} 
                    style={{ top: pos.top, left: pos.left, transform: 'translate(-50%, -50%)' }} 
                  />
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-slate-500 mt-4">Drag players from the bench onto the pitch. Click a player on the pitch to remove them.</p>
          </div>

          {/* Bench / Available Players */}
          <div className="lg:w-1/3 bg-slate-950 p-4 rounded-xl border border-slate-800 flex flex-col h-[600px]">
            <h3 className="text-xl font-bold text-white mb-4">Bench ({availableSquad.length})</h3>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {availableSquad.map(player => (
                <DraggablePlayer key={player.id} player={player} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </DndContext>
  );
}
