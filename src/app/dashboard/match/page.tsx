'use client';
import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@/lib/store/gameStore';
import { simulateMatch, MatchResult as EngineResult, MatchEvent } from '@/lib/engine/matchEngine';
import { MatchResult } from '@/lib/store/gameStore';
import { Team } from '@/types';
import { useRouter } from 'next/navigation';
import { Mic, ChevronRight } from 'lucide-react';
import { TeamLogo } from '@/components/TeamLogo';

// Press Conference questions after match
const PRESS_QUESTIONS = [
  { q: "Bagaimana Anda menilai performa tim hari ini?", options: [
    { text: "Tim bermain luar biasa!", moraleEffect: 10, boardEffect: 3 },
    { text: "Masih banyak yang harus diperbaiki.", moraleEffect: -5, boardEffect: 5 },
    { text: "Saya tidak mau berkomentar.", moraleEffect: -3, boardEffect: -3 },
  ]},
  { q: "Ada pemain yang menampilkan performa mengecewakan?", options: [
    { text: "Semua pemain berjuang keras.", moraleEffect: 8, boardEffect: 0 },
    { text: "Ya, ada satu dua yang harus lebih fokus.", moraleEffect: -8, boardEffect: 2 },
    { text: "Pertanyaan selanjutnya saja.", moraleEffect: 0, boardEffect: -2 },
  ]},
  { q: "Apa target Anda di sisa musim ini?", options: [
    { text: "Kami akan berjuang untuk juara!", moraleEffect: 12, boardEffect: 8 },
    { text: "Target kami adalah top half.", moraleEffect: 5, boardEffect: 3 },
    { text: "Satu pertandingan dalam satu waktu.", moraleEffect: 3, boardEffect: 0 },
  ]},
];

export default function MatchSimulationPage() {
  const router = useRouter();
  const database = useGameStore(state => state.database);
  const playerTeamId = useGameStore(state => state.playerTeamId);
  const advanceDay = useGameStore(state => state.advanceDay);
  const recordMatchResult = useGameStore(state => state.recordMatchResult);
  const addInboxMessage = useGameStore(state => state.addInboxMessage);
  const dressingRoomAtmosphere = useGameStore(state => state.dressingRoomAtmosphere);
  const playerTactics = useGameStore(state => state.playerTactics);
  const applyInjury = useGameStore(state => state.applyInjury);
  const tacticalFamiliarity = useGameStore(state => state.tacticalFamiliarity);
  const managerBannedGamesLeft = useGameStore(state => state.managerBannedGamesLeft);
  const applyManagerBan = useGameStore(state => state.applyManagerBan);

  const [isPlaying, setIsPlaying] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  const [showPressConference, setShowPressConference] = useState(false);
  const [pressStep, setPressStep] = useState(0);
  const [currentMinute, setCurrentMinute] = useState(0);
  const [homeScore, setHomeScore] = useState(0);
  const [awayScore, setAwayScore] = useState(0);
  const [matchWeather, setMatchWeather] = useState<'NORMAL' | 'RAIN' | 'SNOW'>('NORMAL');
  const [liveEvents, setLiveEvents] = useState<MatchEvent[]>([]);
  const [fullResult, setFullResult] = useState<EngineResult | null>(null);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const eventsEndRef = useRef<HTMLDivElement>(null);
  
  // 2D Dots Engine State - Formasi 4-3-3 Default
  const HOME_BASE = [
    { x: 5, y: 50 }, // GK
    { x: 20, y: 20 }, { x: 15, y: 40 }, { x: 15, y: 60 }, { x: 20, y: 80 }, // DEF
    { x: 40, y: 30 }, { x: 35, y: 50 }, { x: 40, y: 70 }, // MID
    { x: 60, y: 25 }, { x: 65, y: 50 }, { x: 60, y: 75 }, // FWD
  ];
  const AWAY_BASE = [
    { x: 95, y: 50 }, // GK
    { x: 80, y: 80 }, { x: 85, y: 60 }, { x: 85, y: 40 }, { x: 80, y: 20 }, // DEF
    { x: 60, y: 70 }, { x: 65, y: 50 }, { x: 60, y: 30 }, // MID
    { x: 40, y: 75 }, { x: 35, y: 50 }, { x: 40, y: 25 }, // FWD
  ];

  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const [homeDots, setHomeDots] = useState(HOME_BASE);
  const [awayDots, setAwayDots] = useState(AWAY_BASE);

  const engineRef = useRef({
    possession: 'HOME',
    targetX: 50,
    targetY: 50,
    carrierIdx: 6,
    passCooldown: 0
  });

  // Animasi Pergerakan 2D Dots
  useEffect(() => {
    if (!isPlaying || matchEnded) return;

    // Tick every 500ms for smoother sequence
    const interval = setInterval(() => {
      const state = engineRef.current;
      
      // Ambil event yang sesuai dengan menit saat ini
      const activeEvent = liveEvents.find(e => e.minute === currentMinute);
      
      // Jika ada event (Gol/Peluang) di menit ini, jalankan "Event Phase"
      if (activeEvent) {
         state.possession = activeEvent.teamId === homeTeam?.id ? 'HOME' : 'AWAY';
         
         // Jika GOAL atau CHANCE, bola diarahkan ke gawang
         if (activeEvent.type === 'GOAL' || activeEvent.type === 'CHANCE') {
            const isHome = state.possession === 'HOME';
            state.targetX = isHome ? 95 : 5; // Mulut gawang
            state.targetY = 48 + Math.random() * 4; // Tengah gawang
            state.carrierIdx = 10; // Striker yang nembak
            state.passCooldown = 4; // Tahan selebrasi
         }
      } else {
         // "Build-up Phase"
         // Tim yang pegang bola perlahan maju
         if (state.possession === 'HOME') {
            if (state.targetX < 85) state.targetX += Math.random() * 5;
         } else {
            if (state.targetX > 15) state.targetX -= Math.random() * 5;
         }
         
         // Kadang pindah lajur serangan
         if (Math.random() > 0.8) {
            state.targetY = Math.max(15, Math.min(85, state.targetY + (Math.random() * 40 - 20)));
         }

         // Logika Passing antar pemain
         if (state.passCooldown > 0) {
            state.passCooldown--;
         } else if (Math.random() > 0.3) {
            // Oper bola maju (ke index yang lebih besar)
            if (state.carrierIdx < 10) {
               state.carrierIdx += Math.floor(Math.random() * 3) + 1;
               if (state.carrierIdx > 10) state.carrierIdx = 10;
            } else {
               // Reset serangan kalau buntu, pindah possession
               state.possession = state.possession === 'HOME' ? 'AWAY' : 'HOME';
               state.carrierIdx = 1; // Mulai dari bek
               state.targetX = state.possession === 'HOME' ? 30 : 70;
            }
            state.passCooldown = 2;
         }
      }

      // Kalkulasi formasi (Tim menyerang melebar & maju, tim bertahan merapat & mundur)
      const homeAtk = state.possession === 'HOME';
      const homeBaseXShift = homeAtk ? (state.targetX - 50) * 0.4 : (state.targetX - 50) * 0.2;
      const awayBaseXShift = !homeAtk ? (state.targetX - 50) * 0.4 : (state.targetX - 50) * 0.2;
      
      const newHomeDots = HOME_BASE.map((base, idx) => {
         let x = base.x + homeBaseXShift;
         let y = base.y;
         
         if (homeAtk) {
            y += (state.targetY - 50) * 0.3; // Ikut arah serangan
         } else {
            y = 50 + (y - 50) * 0.7; // Rapat ke tengah
         }

         // Pemain bawa bola sedikit maju dari posisinya
         if (homeAtk && idx === state.carrierIdx && !activeEvent) {
            x += 5;
         }
         
         return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
      });

      const newAwayDots = AWAY_BASE.map((base, idx) => {
         let x = base.x + awayBaseXShift;
         let y = base.y;
         
         if (!homeAtk) {
            y += (state.targetY - 50) * 0.3; // Ikut arah serangan
         } else {
            y = 50 + (y - 50) * 0.7; // Rapat ke tengah
         }

         if (!homeAtk && idx === state.carrierIdx && !activeEvent) {
            x -= 5;
         }
         
         return { x: Math.max(2, Math.min(98, x)), y: Math.max(2, Math.min(98, y)) };
      });
      
      setHomeDots(newHomeDots);
      setAwayDots(newAwayDots);
      
      // Update posisi bola (ikut pemain, atau terbang ke gawang kalau shooting)
      if (activeEvent && (activeEvent.type === 'GOAL' || activeEvent.type === 'CHANCE')) {
         setBallPos({ x: state.targetX, y: state.targetY }); // Bola tembak ke targetX/Y (gawang)
      } else {
         if (state.possession === 'HOME') {
            setBallPos({ x: newHomeDots[state.carrierIdx].x, y: newHomeDots[state.carrierIdx].y });
         } else {
            setBallPos({ x: newAwayDots[state.carrierIdx].x, y: newAwayDots[state.carrierIdx].y });
         }
      }

    }, 500);

    return () => clearInterval(interval);
  }, [isPlaying, matchEnded, liveEvents, homeTeam, awayTeam]);

  useEffect(() => {
    if (database && playerTeamId) {
      const myTeam = database.teams.find(t => t.id === playerTeamId);
      const opponents = database.teams.filter(t => t.leagueId === myTeam?.leagueId && t.id !== playerTeamId);
      const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
      setHomeTeam(myTeam || null);
      setAwayTeam(randomOpponent || null);
    }
  }, [database, playerTeamId]);

  useEffect(() => {
    eventsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveEvents]);

  const startMatch = () => {
    if (!homeTeam || !awayTeam) return;
    
    // Ambil pemain dari database untuk home dan away
    const homeSquad = database?.players.filter(p => p.teamId === homeTeam.id) || [];
    const awaySquad = database?.players.filter(p => p.teamId === awayTeam.id) || [];
    const atmosphere = homeTeam.id === playerTeamId ? dressingRoomAtmosphere : 80;
    
    // Tentukan Cuaca
    const weatherRoll = Math.random();
    const weather = weatherRoll < 0.1 ? 'SNOW' : weatherRoll < 0.4 ? 'RAIN' : 'NORMAL';
    setMatchWeather(weather);

    // Ambil Taktik & Manager Status
    const homeStyle = homeTeam.id === playerTeamId ? playerTactics.style : 'TIKI_TAKA';
    const awayStyle = awayTeam.id === playerTeamId ? playerTactics.style : 'TIKI_TAKA';
    const homeFamiliarity = homeTeam.id === playerTeamId ? tacticalFamiliarity : 100;
    const isHomeManagerBanned = homeTeam.id === playerTeamId ? managerBannedGamesLeft > 0 : false;

    const result = simulateMatch(homeTeam, awayTeam, homeTeam.reputation, awayTeam.reputation, homeSquad, awaySquad, atmosphere, weather, homeStyle, awayStyle, homeFamiliarity, isHomeManagerBanned);
    setFullResult(result as EngineResult);
    setIsPlaying(true);
    setLiveEvents([]);

    let min = 0;
    let currentHomeScore = 0;
    let currentAwayScore = 0;

    const interval = setInterval(() => {
      if (min > 90) {
        clearInterval(interval);
        setIsPlaying(false);
        setMatchEnded(true);

        // VAR Controversy Check disetup untuk nanti pas diklik Finish Match
        if ((result as any).hasControversy && (homeTeam.id === playerTeamId || awayTeam.id === playerTeamId)) {
           setPressStep(0);
        }

        // Save result to store
        const matchRecord: MatchResult = {
          id: `match-${Date.now()}`,
          date: new Date().toISOString().split('T')[0],
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeScore: currentHomeScore,
          awayScore: currentAwayScore,
          competition: 'league'
        };
        recordMatchResult(matchRecord);

        // Send inbox message about result
        const isWin = (homeTeam.id === playerTeamId && currentHomeScore > currentAwayScore) ||
                      (awayTeam.id === playerTeamId && currentAwayScore > currentHomeScore);
        const isDraw = currentHomeScore === currentAwayScore;
        addInboxMessage({
          from: 'Match Report',
          subject: isWin ? '✅ Kemenangan!' : isDraw ? '➖ Seri' : '❌ Kekalahan',
          body: `${homeTeam.name} ${currentHomeScore} - ${currentAwayScore} ${awayTeam.name}`,
          type: isWin ? 'info' : isDraw ? 'info' : 'warning'
        });

        // Terapkan Cedera
        if ((result as any).injuries) {
           (result as any).injuries.forEach((inj: any) => {
              applyInjury(inj.playerId, inj.duration, inj.isACL);
           });
        }

        return;
      }

      setCurrentMinute(min);
      const eventsThisMinute = result.events.filter(e => e.minute === min);
      if (eventsThisMinute.length > 0) {
        setLiveEvents(prev => [...prev, ...eventsThisMinute]);
        eventsThisMinute.forEach(e => {
          if (e.type === 'GOAL') {
            if (e.teamId === homeTeam.id) currentHomeScore++;
            else currentAwayScore++;
            setHomeScore(currentHomeScore);
            setAwayScore(currentAwayScore);
          }
        });
      }
      min++;
    }, 6667); // 6.667 ms per in-game minute = 5 real-life minutes per 45 in-game minutes
  };

  const handlePressAnswer = (moraleEffect: number, boardEffect: number, isBanRisk?: boolean) => {
    // TODO: Apply effects to store
    if (isBanRisk) {
       applyManagerBan(3);
       addInboxMessage({
         from: 'League FA',
         subject: 'SANKSI TEGAS: TOUCHLINE BAN',
         body: 'Pernyataan kasar Anda terhadap wasit dan VAR di konferensi pers sangat tidak pantas. Anda dihukum larangan menemani tim selama 3 pertandingan!',
         type: 'warning'
       });
    }

    if (pressStep < currentQuestions.length - 1) {
      setPressStep(s => s + 1);
    } else {
      setShowPressConference(false);
      advanceDay();
      router.push('/dashboard');
    }
  };

  const handleFinishMatch = () => {
    if ((fullResult as any)?.hasControversy) {
       setShowPressConference(true);
    } else {
       // Tetap tampilkan normal press conference sesekali (30% chance)
       if (Math.random() < 0.3) {
          setShowPressConference(true);
       } else {
          advanceDay();
          // Auto-save happens automatically via IndexedDB persist
          addInboxMessage({
            from: 'System',
            subject: '💾 Game Tersimpan Otomatis',
            body: `Progress Anda berhasil disimpan setelah pertandingan ${homeTeam?.name} vs ${awayTeam?.name}.`,
            type: 'info'
          });
          router.push('/dashboard');
       }
    }
  };

  const currentQuestions = (fullResult as any)?.hasControversy ? [
     { q: "Wasit menganulir gol penting Anda karena VAR. Apakah menurut Anda itu konspirasi?", options: [
         { text: "(Marah) VAR adalah sampah! Wasit dibayar! Ini perampokan!", moraleEffect: 10, boardEffect: -5, isBanRisk: true },
         { text: "(Tenang) Kita hormati keputusan wasit walau menyakitkan.", moraleEffect: -5, boardEffect: 5 }
     ]}
  ] : PRESS_QUESTIONS;

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'GOAL': return '⚽';
      case 'YELLOW_CARD': return '🟨';
      case 'RED_CARD': return '🟥';
      case 'CHANCE': return '⚡';
      default: return '⏱️';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'GOAL': return 'text-emerald-400 font-bold bg-emerald-900/20 border-emerald-800/40';
      case 'RED_CARD': return 'text-red-400 font-bold bg-red-900/20 border-red-800/40';
      case 'YELLOW_CARD': return 'text-amber-400 bg-amber-900/10 border-amber-800/30';
      case 'CHANCE': return 'text-blue-400 bg-blue-900/10 border-blue-800/30';
      case 'VAR': return 'text-purple-400 font-bold bg-purple-900/20 border-purple-800/50';
      default: return 'text-slate-400 border-slate-800/50';
    }
  };

  const isMyWin = fullResult && matchEnded && (
    (homeTeam?.id === playerTeamId && homeScore > awayScore) ||
    (awayTeam?.id === playerTeamId && awayScore > homeScore)
  );
  const isDraw = matchEnded && homeScore === awayScore;

  if (!homeTeam || !awayTeam) return (
    <div className="flex items-center justify-center h-64 text-slate-500">
      <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mr-3" />
      Loading Match Prep...
    </div>
  );

  if (showPressConference) {
    const q = currentQuestions[pressStep];
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Mic className="text-red-400" />
          <h1 className="text-2xl font-black text-white">Press Conference</h1>
          <span className="text-sm text-slate-500">Pertanyaan {pressStep + 1}/{currentQuestions.length}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-6">
          <div className="bg-slate-950 rounded-lg p-5 border-l-4 border-blue-500">
            <div className="text-xs text-blue-400 font-bold uppercase tracking-wider mb-2">Jurnalis:</div>
            <p className="text-lg text-white font-medium">{q.q}</p>
          </div>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handlePressAnswer(opt.moraleEffect, opt.boardEffect, (opt as any).isBanRisk)}
                className="w-full text-left p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-600 rounded-lg font-medium text-slate-200 transition-all flex items-center justify-between group"
              >
                <span>{opt.text}</span>
                <ChevronRight className="text-slate-600 group-hover:text-emerald-400 transition-colors" size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <header className="text-center space-y-4">
        <h1 className="text-3xl font-black uppercase text-emerald-400 tracking-widest">Matchday Simulation</h1>

        {/* Scoreboard */}
        <div className={`bg-slate-900 border rounded-2xl p-8 flex items-center justify-between shadow-2xl transition-colors duration-500 ${
          matchEnded ? (isMyWin ? 'border-emerald-600' : isDraw ? 'border-amber-600' : 'border-red-700') : 'border-slate-700'
        }`}>
          <div className="w-5/12 flex items-center justify-end gap-6 text-right">
            <div>
               <h2 className={`text-3xl font-bold truncate ${homeTeam.id === playerTeamId ? 'text-emerald-400' : 'text-slate-100'}`}>{homeTeam.name}</h2>
               <p className="text-slate-500 uppercase text-sm mt-1">OVR: {homeTeam.reputation}</p>
            </div>
            <TeamLogo teamId={homeTeam.id} teamName={homeTeam.name} shortName={homeTeam.shortName} size={100} />
          </div>

          <div className="px-8 flex flex-col items-center z-10">
            <div className="text-5xl font-black mb-2 font-mono flex items-center gap-4">
              <span>{homeScore}</span>
              <span className="text-slate-600">-</span>
              <span>{awayScore}</span>
            </div>
            <div className="text-emerald-500 font-bold mb-1 animate-pulse">{currentMinute}'</div>
            {matchWeather === 'RAIN' && <div className="text-xs text-blue-400 font-bold bg-blue-900/30 px-2 py-1 rounded">🌧️ Hujan Deras</div>}
            {matchWeather === 'SNOW' && <div className="text-xs text-white font-bold bg-slate-800/80 px-2 py-1 rounded">❄️ Bersalju</div>}
          </div>

          <div className="w-5/12 flex items-center justify-start gap-6 text-left">
            <TeamLogo teamId={awayTeam.id} teamName={awayTeam.name} shortName={awayTeam.shortName} size={100} />
            <div>
               <h2 className={`text-3xl font-bold truncate ${awayTeam.id === playerTeamId ? 'text-emerald-400' : 'text-slate-100'}`}>{awayTeam.name}</h2>
               <p className="text-slate-500 uppercase text-sm mt-1">OVR: {awayTeam.reputation}</p>
            </div>
          </div>
        </div>
      </header>

      {!isPlaying && !matchEnded && (
        <div className="text-center pt-8">
          <button
            onClick={startMatch}
            className="px-12 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-black text-xl text-white transition-all hover:scale-105 shadow-[0_0_30px_-5px_rgba(16,185,129,0.5)] uppercase tracking-widest"
          >
            ⚽ Start Match
          </button>
        </div>
      )}

      {(isPlaying || matchEnded) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 2D Match Radar */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-[400px] flex flex-col relative">
            {/* Weather Effect Overlay */}
            {isPlaying && matchWeather === 'RAIN' && (
               <div className="absolute inset-0 pointer-events-none opacity-20 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzIiBoZWlnaHQ9IjIwIj48cmVjdCB3aWR0aD0iMSIgaGVpZ2h0PSIxNSIgZmlsbD0iI2ZmZiIvPjwvc3ZnPg==')] animate-[slide_1s_linear_infinite] z-20"></div>
            )}
            {isPlaying && matchWeather === 'SNOW' && (
               <div className="absolute inset-0 pointer-events-none opacity-40 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPjxjaXJjbGUgY3g9IjIiIGN5PSIyIiByPSIxLjUiIGZpbGw9IiNmZmYiLz48L3N2Zz4=')] animate-[slide_3s_linear_infinite] z-20"></div>
            )}

            <div className="bg-slate-950/50 p-4 border-b border-slate-800 font-bold text-slate-300 uppercase tracking-wider text-sm z-30">
              2D Match Radar
            </div>
            <div className="flex-1 bg-emerald-800 relative overflow-hidden border-4 border-emerald-900 m-4 rounded-lg">
              {/* Pitch Lines */}
              <div className="absolute inset-0 border-[3px] border-white/30 m-4"></div>
              <div className="absolute top-0 bottom-0 left-1/2 w-[3px] bg-white/30 -translate-x-1/2"></div>
              <div className="absolute top-1/2 left-1/2 w-24 h-24 border-[3px] border-white/30 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
              <div className="absolute top-1/4 left-4 w-1/6 h-1/2 border-[3px] border-white/30"></div>
              <div className="absolute top-1/4 right-4 w-1/6 h-1/2 border-[3px] border-white/30"></div>
              
              {/* Labels */}
              <div className="absolute top-2 left-6 text-white/50 text-xs font-bold">{homeTeam.shortName}</div>
              <div className="absolute top-2 right-6 text-white/50 text-xs font-bold">{awayTeam.shortName}</div>

              {/* 22 Players (Dots) */}
              {homeDots.map((dot, i) => (
                <div key={`h-${i}`} className="absolute w-3 h-3 bg-red-500 rounded-full shadow-sm border border-white/50 transition-all duration-[500ms] ease-linear"
                     style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%, -50%)' }} />
              ))}
              {awayDots.map((dot, i) => (
                <div key={`a-${i}`} className="absolute w-3 h-3 bg-blue-500 rounded-full shadow-sm border border-white/50 transition-all duration-[500ms] ease-linear"
                     style={{ left: `${dot.x}%`, top: `${dot.y}%`, transform: 'translate(-50%, -50%)' }} />
              ))}

              {/* The Ball (Radar Dot) */}
              <div 
                className="absolute w-3 h-3 bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,1)] transition-all duration-[500ms] ease-linear z-10" 
                style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%`, transform: 'translate(-50%, -50%)' }}
              />
              
              {/* Visual Effects */}
              {liveEvents.length > 0 && liveEvents[liveEvents.length - 1].type === 'GOAL' && (
                <div className={`absolute top-1/2 -translate-y-1/2 text-4xl animate-bounce z-20 ${
                  liveEvents[liveEvents.length - 1].teamId === homeTeam.id ? 'right-[5%]' : 'left-[5%]'
                }`}>
                  ⚽
                </div>
              )}
              {liveEvents.length > 0 && liveEvents[liveEvents.length - 1].type === 'VAR' && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-2xl font-black text-purple-400 bg-slate-900/80 px-4 py-2 rounded border border-purple-500 z-20 animate-pulse">
                  📺 VAR REVIEW
                </div>
              )}
            </div>
          </div>

          {/* Live Commentary */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg h-[400px] flex flex-col">
          <div className="bg-slate-950/50 p-4 border-b border-slate-800 font-bold text-slate-300 uppercase tracking-wider text-sm flex justify-between items-center">
            <span className="flex items-center gap-2">
              {isPlaying && !matchEnded && <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />}
              Live Commentary
            </span>
            {matchEnded && <span className="text-emerald-400 text-xs">Full Time</span>}
          </div>
          <div className="flex-1 p-4 overflow-y-auto space-y-2">
            {liveEvents.map((ev, idx) => (
              <div key={idx} className={`flex gap-4 p-3 rounded-lg border ${getEventColor(ev.type)} transition-all`}>
                <div className="w-10 font-black opacity-70 shrink-0 text-sm">{ev.minute}'</div>
                <div className="w-6 text-center shrink-0">{getEventIcon(ev.type)}</div>
                <div className="flex-1 leading-relaxed text-sm">{ev.description}</div>
              </div>
            ))}
            <div ref={eventsEndRef} />
          </div>
        </div>
        </div>
      )}

      {matchEnded && (
        <div className="text-center pt-2 animate-fade-in">
          <div className={`text-2xl font-black mb-4 ${isMyWin ? 'text-emerald-400' : isDraw ? 'text-amber-400' : 'text-red-400'}`}>
            {isMyWin ? '🏆 KEMENANGAN!' : isDraw ? '🤝 SERI' : '😞 KEKALAHAN'}
          </div>
          <button
            onClick={handleFinishMatch}
            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition-colors flex items-center gap-2 mx-auto"
          >
            <Mic size={16} /> Press Conference
          </button>
        </div>
      )}
    </div>
  );
}
