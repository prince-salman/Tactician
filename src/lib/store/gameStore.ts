import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { League, Team, Player } from '@/types';
import { generateFMName, generateFMAge } from '@/lib/engine/nameGenerator';

interface Database {
  leagues: League[];
  teams: Team[];
  players: Player[];
}

export interface MatchResult {
  id: string;
  date: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  competition: 'league' | 'cup' | 'continental' | 'national';
}

export interface Inbox {
  id: string;
  date: string;
  from: string;
  subject: string;
  body: string;
  read: boolean;
  type: 'info' | 'warning' | 'transfer' | 'board';
}

export interface PlayerStatus {
  playerId: string;
  fatigue: number;       // 0-100
  morale: number;        // 0-100
  injured: boolean;
  injuryDaysLeft: number;
  suspended: boolean;
  suspendedGamesLeft: number;
}

export interface Standing {
  teamId: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

interface GameState {
  // Manager Profile
  currentDate: string;
  playerTeamId: string | null;
  managerName: string | null;
  managerNationality: string | null;
  managerConfederation: 'AFC' | 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'CAF' | null;
  managerLicense: 'D' | 'C' | 'B' | 'A' | 'Pro' | null;
  managerRole: 'Academy Coach' | 'Assistant Manager' | 'Head Coach' | null;
  language: 'id' | 'en';
  boardConfidence: number; // 0-100
  teamReputation: number;
  managerBalance: number;
  managerSalary: number;
  blacklistedClubs: string[];
  dressingRoomAtmosphere: number; // 0-100

  // Job Center
  availableJobs: any[];
  generateJobs: () => void;

  // Database
  database: Database | null;

  // Match & Competition
  matchResults: MatchResult[];
  standings: Record<string, Standing>; // keyed by teamId

  // Player States
  playerStatuses: PlayerStatus[];

  // Inbox / Notifications
  inboxMessages: Inbox[];

  // Tactics
  playerTactics: {
    formation: string;
    style: 'TIKI_TAKA' | 'COUNTER' | 'LONG_BALL';
    lineup: Record<string, string>; // positionId -> playerId
  };
  scoutedPlayerIds: string[];
  
  // Financials
  playerClubBalance: number;
  activeSponsor: { name: string; basePerWeek: number; bonusPerWin: number; remainingWeeks: number } | null;

  // Tactics & Manager status
  tacticalFamiliarity: number;
  managerBannedGamesLeft: number;
  hasSultanOwner: boolean;

  // Actions
  setDatabase: (db: Database) => void;
  setLanguage: (lang: 'id' | 'en') => void;
  advanceDay: () => void;
  setPlayerTeam: (teamId: string | null, role?: string) => void;
  setManagerProfile: (name: string, nationality: string, confederation: string, license: 'D' | 'C' | 'B' | 'A' | 'Pro') => void;
  acceptJobOffer: (teamId: string, role: string, salary: number) => void;
  rejectJobOffer: (teamId: string) => void;
  buyPlayer: (playerId: string, cost: number, swapPlayerId?: string, isLoan?: boolean) => { success: boolean, reason?: string, isBiddingWar?: boolean, newCost?: number };
  recordMatchResult: (result: MatchResult) => void;
  updatePlayerStatus: (playerId: string, updates: Partial<PlayerStatus>) => void;
  addInboxMessage: (msg: Omit<Inbox, 'id' | 'date' | 'read'>) => void;
  markInboxRead: (id: string) => void;
  upgradeLicense: () => void;
  setPlayerTactics: (formation: string, style: 'TIKI_TAKA' | 'COUNTER' | 'LONG_BALL', lineup: Record<string, string>) => void;
  scoutPlayer: (playerId: string, cost: number) => boolean;
  applyInjury: (playerId: string, duration: number, isACL: boolean) => void;
  acceptSponsor: (name: string, basePerWeek: number, bonusPerWin: number, durationWeeks: number) => void;
  upgradeStadium: (cost: number, capacityIncrease: number) => void;
  upgradeFacility: (facility: 'academyLevel' | 'coachingLevel' | 'medicalLevel', cost: number) => void;
  applyManagerBan: (games: number) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      currentDate: '2026-07-01',
      playerTeamId: null,
      managerName: null,
      managerNationality: null,
      managerConfederation: null,
      managerLicense: null,
      managerRole: null,
      language: 'id',
      boardConfidence: 70,
      teamReputation: 50,
      managerBalance: 0,
      managerSalary: 0,
      blacklistedClubs: [],
      dressingRoomAtmosphere: 80,
      availableJobs: [],
      database: null,
      matchResults: [],
      standings: {},
      playerStatuses: [],
      inboxMessages: [],
      scoutedPlayerIds: [],
      playerTactics: {
        formation: '4-3-3',
        style: 'TIKI_TAKA',
        lineup: {}
      },
      playerClubBalance: 0,
      activeSponsor: null,
      tacticalFamiliarity: 100,
      managerBannedGamesLeft: 0,
      hasSultanOwner: false,

      setDatabase: (db) => {
         set({ database: db });
         get().generateJobs();
      },
      setLanguage: (lang) => set({ language: lang }),

      advanceDay: () => set((state) => {
        const nextDay = new Date(state.currentDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        let newDatabase = state.database;
        let newInbox = [...state.inboxMessages];
        let newAtmosphere = state.dressingRoomAtmosphere;
        let newStatuses = [...state.playerStatuses];
        
        // Random Drama Events (Setiap hari)
        if (state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && newDatabase) {
           const mySquad = newDatabase.players.filter(p => p.teamId === state.playerTeamId);
           const myLeague = newDatabase.leagues.find(l => l.id === newDatabase!.teams.find(t=>t.id===state.playerTeamId)?.leagueId);
           
           if (mySquad.length > 0) {
             // 1. Assign Trait if missing (Backward compatibility)
             mySquad.forEach(p => {
                if (!p.trait) {
                   const TRAITS = ['Professional', 'Professional', 'Hothead', 'Mercenary', 'Loyal', 'Ambitious', 'Troublemaker'] as const;
                   p.trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];
                }
             });

             // 2. Homesickness Check (1% chance per day for foreigners)
             if (Math.random() < 0.01) {
                const randomPlayer = mySquad[Math.floor(Math.random() * mySquad.length)];
                const teamNation = newDatabase.teams.find(t=>t.id===state.playerTeamId)?.nationId;
                if (randomPlayer.nationId !== teamNation && Math.random() > 0.5) {
                   newInbox.push({
                     id: `msg-${Date.now()}-homesick`,
                     date: nextDay.toISOString().split('T')[0],
                     from: randomPlayer.name,
                     subject: 'Saya Ingin Pulang...',
                     body: `Bos, saya kesulitan beradaptasi dengan budaya dan cuaca di sini. Saya kangen rumah. Bisakah Anda menjual saya kembali ke ${randomPlayer.nationId}?`,
                     read: false,
                     type: 'warning'
                   });
                   newAtmosphere = Math.max(0, newAtmosphere - 5);
                }
             }

             // 3. Trait-based Complaints (Ambitious / Mercenary)
             if (Math.random() < 0.02) {
                const randomPlayer = mySquad[Math.floor(Math.random() * mySquad.length)];
                if (randomPlayer.trait === 'Ambitious' && state.boardConfidence < 50) {
                   newInbox.push({
                     id: `msg-${Date.now()}-ambitious`,
                     date: nextDay.toISOString().split('T')[0],
                     from: randomPlayer.name,
                     subject: 'Klub Ini Kurang Ambisi',
                     body: `Bos, kita terus-terusan kalah. Saya butuh bermain di turnamen elit, bukan berjuang di zona bawah. Lakukan sesuatu!`,
                     read: false,
                     type: 'warning'
                   });
                   newAtmosphere = Math.max(0, newAtmosphere - 10);
                } else if (randomPlayer.trait === 'Hothead' && Math.random() < 0.3) {
                   newInbox.push({
                     id: `msg-${Date.now()}-hothead`,
                     date: nextDay.toISOString().split('T')[0],
                     from: 'Assistant Manager',
                     subject: 'Perkelahian di Ruang Ganti',
                     body: `${randomPlayer.name} mengamuk saat latihan hari ini dan bertengkar dengan rekan setimnya. Suasana tim sangat buruk sekarang.`,
                     read: false,
                     type: 'warning'
                   });
                   newAtmosphere = Math.max(0, newAtmosphere - 15);
                } else if (randomPlayer.trait === 'Troublemaker' && Math.random() < 0.3) {
                   newInbox.push({
                     id: `msg-${Date.now()}-troublemaker`,
                     date: nextDay.toISOString().split('T')[0],
                     from: 'Assistant Manager',
                     subject: 'Pemain Bolos Latihan',
                     body: `Bos, ${randomPlayer.name} tidak datang latihan hari ini. Dia beralasan sakit, tapi fotonya sedang berpesta tersebar di media sosial! Tim sangat kecewa dengan sikapnya.`,
                     read: false,
                     type: 'warning'
                   });
                   newAtmosphere = Math.max(0, newAtmosphere - 20);
                }
             }
             
             // Mind Games Pelatih AI (Fitur 7)
             if (Math.random() < 0.05) {
                newInbox.push({
                   id: `msg-${Date.now()}-mindgames`,
                   date: nextDay.toISOString().split('T')[0],
                   from: 'Media Sport',
                   subject: 'Psywar Pelatih Rival',
                   body: `Pelatih rival melontarkan komentar merendahkan skuad Anda di konferensi pers pagi ini: "Mereka tim yang rapuh dan manajernya tidak becus." Beberapa pemain muda kita terlihat terpukul mentalnya (Morale Turun).`,
                   read: false,
                   type: 'info'
                });
                newAtmosphere = Math.max(0, newAtmosphere - 5);
             }
             
             // Player Scandals (Fitur 13)
             if (Math.random() < 0.02) {
                newInbox.push({
                   id: `msg-${Date.now()}-scandal`,
                   date: nextDay.toISOString().split('T')[0],
                   from: 'Paparazzi',
                   subject: '🚨 SKANDAL PEMAIN',
                   body: `Salah satu pemain inti Anda tertangkap kamera sedang berpesta liar sehari sebelum latihan wajib. Fans sangat marah dan menuntut tindakan tegas! Suasana ruang ganti memanas.`,
                   read: false,
                   type: 'warning'
                });
                newAtmosphere = Math.max(0, newAtmosphere - 15);
             }
             
             // Sultan Takeover (Fitur 9)
             if (!state.hasSultanOwner && Math.random() < 0.01) { // 1% chance per day
                newInbox.push({
                   id: `msg-${Date.now()}-sultan`,
                   date: nextDay.toISOString().split('T')[0],
                   from: 'Dewan Direksi Baru',
                   subject: '💎 AKUISISI KLUB OLEH KONSORSIUM TIMUR TENGAH',
                   body: `Klub kita baru saja dibeli oleh konsorsium miliarder! Mereka telah menyuntikkan dana sebesar €500M ke kas klub. Namun ingat, ekspektasi mereka sangat tinggi. Kekalahan tidak akan ditolerir!`,
                   read: false,
                   type: 'board'
                });
                set({
                   hasSultanOwner: true,
                   playerClubBalance: state.playerClubBalance + 500000000
                });
             }
             
             // 4. Assistant Manager Pre-match Report (Setiap hari Jumat jika ada match besok/lusa)
             if (nextDay.getDay() === 5 && Math.random() < 0.5) {
                newInbox.push({
                   id: `msg-${Date.now()}-assistant`,
                   date: nextDay.toISOString().split('T')[0],
                   from: 'Assistant Manager',
                   subject: 'Saran Taktik Akhir Pekan',
                   body: `Bos, perkiraan cuaca untuk pertandingan akhir pekan ini memprediksi hujan deras. Hati-hati jika Anda memaksakan formasi penguasaan bola (Tiki-Taka), lapangan akan becek dan passing tidak akurat. Mungkin saatnya mencoba Long Ball.`,
                   read: false,
                   type: 'info'
                });
             }
           }
        }
        
        let newBalance = state.playerClubBalance;
        let newSponsor = state.activeSponsor;

        // 2. Refresh Jobs seminggu sekali (Tiap hari Senin)
        if (nextDay.getDay() === 1) {
           get().generateJobs();
        }

        // 3. Financials & Salary (Mingguan setiap hari Minggu)
        if (nextDay.getDay() === 0) {
           if (state.playerTeamId && state.managerSalary > 0) {
              state.managerBalance += state.managerSalary;
           }
           
           if (state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && newDatabase) {
              const mySquad = newDatabase.players.filter(p => p.teamId === state.playerTeamId);
              const weeklyWageBill = mySquad.reduce((sum, p) => sum + p.wage, 0);
              newBalance -= weeklyWageBill;

              if (newSponsor) {
                 newBalance += newSponsor.basePerWeek;
                 newSponsor = { ...newSponsor, remainingWeeks: newSponsor.remainingWeeks - 1 };
                 if (newSponsor.remainingWeeks <= 0) newSponsor = null;
              }

              // Kebangkrutan check
              if (newBalance < -50000000) { // Minus 50 juta
                 newInbox.push({
                   id: `msg-${Date.now()}-bankrupt`,
                   date: nextDay.toISOString().split('T')[0],
                   from: 'Chairman',
                   subject: 'PEMECATAN: Klub Bangkrut!',
                   body: `Ini adalah bencana finansial! Anda telah menghancurkan keuangan klub ini. Kami berada di ambang kebangkrutan karena beban gaji yang tidak masuk akal. Anda DIBERHENTIKAN dengan tidak hormat!`,
                   read: false,
                   type: 'warning'
                 });
                 // Fire the manager
                 return {
                    currentDate: nextDay.toISOString().split('T')[0],
                    database: newDatabase,
                    inboxMessages: newInbox,
                    dressingRoomAtmosphere: 50,
                    playerStatuses: newStatuses,
                    playerTeamId: 'UNEMPLOYED',
                    managerRole: null,
                    playerClubBalance: 0,
                    activeSponsor: null
                 };
              }
           }
        }

        // Youth Intake Day (1 Maret)
        if (state.currentDate.endsWith('-03-01') && state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && newDatabase) {
           const myTeam = newDatabase.teams.find(t => t.id === state.playerTeamId);
           if (myTeam) {
              const academyLevel = myTeam.academyLevel || 1;
              const firstNames = ["James", "John", "Leo", "Kylian", "Ethan", "Noah", "Mason", "Liam"];
              const lastNames = ["Smith", "Messi", "Mbappe", "Williams", "Jones", "Brown", "Davis"];
              const TRAITS = ['Professional', 'Professional', 'Hothead', 'Mercenary', 'Loyal', 'Ambitious', 'Troublemaker'] as const;
              
              const newYouths = [];
              const numIntake = 1 + Math.floor(Math.random() * 3); // 1-3 youth
              
              for (let i=0; i<numIntake; i++) {
                 // Academy Lvl 1: max pot 75. Lvl 5: max pot 95.
                 const maxPot = 70 + (academyLevel * 5); 
                 const pot = Math.min(99, maxPot - Math.floor(Math.random() * 15));
                 
                 newYouths.push({
                    id: `p_youth_${Date.now()}_${i}`,
                    name: `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`,
                    nationId: myTeam.nationId || 'ENG',
                    age: 16,
                    position: ['FWD', 'MID', 'DEF', 'GK'][Math.floor(Math.random() * 4)] as any,
                    overall: Math.max(40, pot - 30),
                    potential: pot,
                    teamId: state.playerTeamId,
                    value: pot * 50000,
                    wage: 500,
                    trait: TRAITS[Math.floor(Math.random() * TRAITS.length)]
                 });
              }
              
              newDatabase = { ...newDatabase, players: [...newDatabase.players, ...newYouths] };
              
              newInbox.push({
                 id: `msg-${Date.now()}-youth`,
                 date: nextDay.toISOString().split('T')[0],
                 from: 'Academy Director',
                 subject: '🌟 YOUTH INTAKE DAY!',
                 body: `Bos! Akademi kita (Level ${academyLevel}) baru saja meluluskan ${numIntake} talenta muda. Mereka sudah langsung masuk ke skuad utama. Tolong cek potensinya!`,
                 read: false,
                 type: 'info'
              });
           }
        }

        // Cek Pergantian Musim (Setiap 1 Juli)
        if (nextDay.getDate() === 1 && nextDay.getMonth() === 6 && newDatabase) {
           let updatedPlayers = [...newDatabase.players];
           
           // 1. Tambah Umur & Pensiun
           let retiredCount = 0;
           updatedPlayers = updatedPlayers.filter(p => {
             const age = p.age + 1;
             // Pensiun jika umur > 38 (peluang makin besar semakin tua)
             if (age > 38 && Math.random() < (age - 37) * 0.2) {
               retiredCount++;
               return false;
             }
             p.age = age;
             return true;
           });
           
           // 2. Youth Intake (Tambahkan pemain 16 tahun untuk tiap tim)
           let intakeCount = 0;
           newDatabase.teams.forEach(team => {
             // Tiap tim melahirkan 1-3 pemain baru
             const intakeAmount = 1 + Math.floor(Math.random() * 3);
             intakeCount += intakeAmount;
             for (let i = 0; i < intakeAmount; i++) {
               const pos = ['GK', 'DEF', 'MID', 'FWD'][Math.floor(Math.random() * 4)];
               // Variasi bakat (Wonderkid vs Reguler vs Flop)
               const talentRoll = Math.random();
               let potBonus = 5 + Math.floor(Math.random() * 10); // Default reguler (5-15)
               if (talentRoll > 0.9) {
                 potBonus = 15 + Math.floor(Math.random() * 15); // Wonderkid (15-30)
               } else if (talentRoll < 0.2) {
                 potBonus = Math.floor(Math.random() * 5); // Flop/Low potential (0-5)
               }

               const newOvr = Math.max(40, team.reputation - 25 - Math.floor(Math.random() * 15)); 
               const newPlayer: Player = {
                 id: `p-regen-${Date.now()}-${team.id}-${i}`,
                 name: generateFMName(team.nationId),
                 nationId: team.nationId,
                 age: 16,
                 position: pos as any,
                 overall: newOvr,
                 potential: Math.min(99, newOvr + potBonus),
                 teamId: team.id,
                 value: newOvr * 10000,
                 wage: newOvr * 100,
                 trait: 'Professional' // Default fallback
               };
               updatedPlayers.push(newPlayer);
             }
           });
           
           newDatabase = { ...newDatabase, players: updatedPlayers };
        }
        
        // International Break & FIFA Virus (Fitur 11 & 14)
        const dateString = nextDay.toISOString().split('T')[0];
        if (dateString.endsWith('-03-25') || dateString.endsWith('-09-10') || dateString.endsWith('-11-15')) {
           if (state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && newDatabase) {
              const myPlayers = newDatabase.players.filter(p => p.teamId === state.playerTeamId);
              const nationalPlayers = myPlayers.filter(p => p.overall >= 78);
              
              if (nationalPlayers.length > 0) {
                 const names = nationalPlayers.map(p => p.name).join(', ');
                 newInbox.push({
                    id: `msg-${Date.now()}-int`,
                    date: dateString,
                    from: 'Tim Nasional',
                    subject: '🌍 JEDA INTERNASIONAL: Pemain Dipanggil',
                    body: `Para pemain berikut telah dipanggil untuk membela negara mereka: ${names}. Mereka telah kembali ke klub hari ini dengan kondisi fisik yang terkuras.`,
                    read: false,
                    type: 'info'
                 });
                 
                 // Apply Fatigue & FIFA Virus
                 nationalPlayers.forEach(p => {
                    let existing = newStatuses.find(s => s.playerId === p.id);
                    if (!existing) {
                       existing = { playerId: p.id, fatigue: 100, morale: 80, injured: false, injuryDaysLeft: 0, suspended: false, suspendedGamesLeft: 0 };
                       newStatuses.push(existing);
                    }
                    existing.fatigue = Math.max(0, existing.fatigue - 40); // Kelelahan timnas
                    
                    // FIFA Virus (20% chance cedera ringan/menengah)
                    if (Math.random() < 0.2 && !existing.injured) {
                       const dur = 3 + Math.floor(Math.random() * 14); // 3-17 hari
                       existing.injured = true;
                       existing.injuryDaysLeft = dur;
                       
                       newInbox.push({
                          id: `msg-${Date.now()}-fifavirus-${p.id}`,
                          date: dateString,
                          from: 'Tim Medis',
                          subject: '🚑 FIFA VIRUS: Cedera Timnas',
                          body: `Bos, kabar buruk! ${p.name} kembali dari jeda internasional dengan cedera. Dia diperkirakan absen selama ${dur} hari ke depan.`,
                          read: false,
                          type: 'warning'
                       });
                    }
                 });
              }
           }
        }
        
        // Recover fatigue harian lambat
        newStatuses = newStatuses.map(s => ({ ...s, fatigue: Math.min(100, s.fatigue + 5) }));

        // Auto-heal injuries & suspensions
        const updatedStatuses = newStatuses.map(ps => {
          let updated = { ...ps };
          if (updated.injured && updated.injuryDaysLeft > 0) {
            updated.injuryDaysLeft -= 1;
            if (updated.injuryDaysLeft === 0) updated.injured = false;
          }
          return updated;
        });

        return {
          currentDate: nextDay.toISOString().split('T')[0],
          database: newDatabase,
          inboxMessages: newInbox,
          dressingRoomAtmosphere: newAtmosphere,
          playerStatuses: updatedStatuses,
          playerClubBalance: newBalance,
          activeSponsor: newSponsor
        };
      }),

      setPlayerTeam: (teamId, role) => set({
        playerTeamId: teamId,
        managerRole: (role as any) || 'Head Coach'
      }),

      setManagerProfile: (name, nationality, confederation, license) => set({
        managerName: name,
        managerNationality: nationality,
        managerConfederation: confederation as any,
        managerLicense: license,
        playerTeamId: 'UNEMPLOYED', // Default pengangguran
        managerBalance: 10000, // Modal awal 10.000
        managerSalary: 0
      }),

      generateJobs: () => set(state => {
         if (!state.database) return state;
         const newJobs: any[] = [];
         const shuffledTeams = [...state.database.teams].sort(() => 0.5 - Math.random());
         const myLicense = state.managerLicense || 'D';
         
         const licenseRank = { 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'Pro': 5 };
         
         // Ambil 20 tim secara acak
         for (let i = 0; i < 20; i++) {
            const team = shuffledTeams[i];
            if (!team) continue;
            
            let requiredLicense = 'Pro';
            let role = 'Head Coach';
            
            // Randomize role to provide more opportunities for lower licenses
            const roll = Math.random();
            if (team.reputation < 55) {
               requiredLicense = roll > 0.5 ? 'D' : 'C';
            } else if (team.reputation < 65) {
               requiredLicense = roll > 0.3 ? 'C' : 'B';
            } else if (team.reputation < 75) {
               if (roll > 0.7) { role = 'Assistant Manager'; requiredLicense = 'B'; }
               else { requiredLicense = 'A'; }
            } else {
               if (roll > 0.8) { role = 'Academy Coach'; requiredLicense = 'C'; }
               else if (roll > 0.5) { role = 'Assistant Manager'; requiredLicense = 'A'; }
               else { requiredLicense = 'Pro'; }
            }

            const league = state.database.leagues.find(l => l.id === team.leagueId);
            
            newJobs.push({
               id: `job-${Date.now()}-${i}`,
               team: { id: team.id, name: team.name, shortName: team.shortName },
               league: league,
               role,
               requiredLicense,
               baseWage: Math.floor(team.reputation * 120 * (role === 'Head Coach' ? 1 : 0.5)),
               reputation: team.reputation
            });
         }
         
         // Guarantee at least 5 jobs that the player's CURRENT license can accept!
         // (If they are desperate)
         let guaranteed = 0;
         for (let i = 20; i < state.database.teams.length && guaranteed < 5; i++) {
            const team = shuffledTeams[i];
            if (!team) continue;
            if (team.reputation < 55) {
               const league = state.database.leagues.find(l => l.id === team.leagueId);
               newJobs.push({
                  id: `job-guaranteed-${Date.now()}-${i}`,
                  team: { id: team.id, name: team.name, shortName: team.shortName },
                  league: league,
                  role: 'Head Coach',
                  requiredLicense: myLicense, // Paskan dengan lisensi player!
                  baseWage: Math.floor(team.reputation * 100),
                  reputation: team.reputation
               });
               guaranteed++;
            }
         }

         return { availableJobs: newJobs.sort((a, b) => b.reputation - a.reputation) };
      }),
      
      acceptJobOffer: (teamId, role, salary) => set((state) => {
        let initialBalance = 0;
        if (state.database) {
           const t = state.database.teams.find(x => x.id === teamId);
           if (t) initialBalance = t.transferBudget + 20000000; // Transfer budget + cash in bank
        }
        return {
          playerTeamId: teamId,
          managerRole: role as any,
          managerSalary: salary,
          playerClubBalance: initialBalance,
          activeSponsor: null,
          tacticalFamiliarity: 30, // Mulai dari awal = buta taktik
          managerBannedGamesLeft: 0,
          hasSultanOwner: false
        };
      }),

      rejectJobOffer: (teamId) => set(state => ({
        blacklistedClubs: [...state.blacklistedClubs, teamId]
      })),

      recordMatchResult: (result) => set((state) => {
        let newDatabase = state.database;
        let newInbox = [...state.inboxMessages];
        let newBalance = state.playerClubBalance;

        // 2. Financials from match
        if (state.database && state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED') {
           const myTeam = state.database.teams.find(t => t.id === state.playerTeamId);
           if (myTeam) {
              // Jika main di kandang
              if (result.homeTeamId === myTeam.id) {
                 const ticketPrice = myTeam.ticketPrice || 45;
                 
                 // Ultras Boycott (Fitur 12)
                 let attendanceRatio = 0.6 + (Math.random() * 0.4); // 60-100% full
                 if (state.boardConfidence < 30) {
                    attendanceRatio = 0.1; // Ultras boikot, stadion kosong!
                 }
                 
                 const attendance = Math.floor((myTeam.stadiumCapacity || 20000) * attendanceRatio);
                 const revenue = attendance * ticketPrice;
                 newBalance += revenue;
                 
                 if (attendanceRatio === 0.1) {
                    newInbox.push({
                      id: `msg-${Date.now()}-ultras`,
                      date: state.currentDate,
                      from: 'Stadium Manager',
                      subject: '🚨 ULTRAS BOIKOT PERTANDINGAN',
                      body: `Suporter garis keras kita memboikot pertandingan hari ini karena rentetan hasil buruk! Stadion kosong melompong. Pemasukan tiket kita anjlok drastis!`,
                      read: false,
                      type: 'warning'
                    });
                 }
              }

              // Sponsor Bonus Win
              if (state.activeSponsor) {
                 const isWin = (result.homeTeamId === myTeam.id && result.homeScore > result.awayScore) || 
                               (result.awayTeamId === myTeam.id && result.awayScore > result.homeScore);
                 if (isWin) {
                    newBalance += state.activeSponsor.bonusPerWin;
                 }
              }
           }
        }

        // Update standings
        const newStandings = { ...state.standings };
        const updateTeam = (teamId: string, scored: number, conceded: number) => {
          const prev = newStandings[teamId] || { teamId, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 };
          const isWin = scored > conceded;
          const isDraw = scored === conceded;
          newStandings[teamId] = {
            ...prev,
            played: prev.played + 1,
            won: prev.won + (isWin ? 1 : 0),
            drawn: prev.drawn + (isDraw ? 1 : 0),
            lost: prev.lost + (!isWin && !isDraw ? 1 : 0),
            goalsFor: prev.goalsFor + scored,
            goalsAgainst: prev.goalsAgainst + conceded,
            points: prev.points + (isWin ? 3 : isDraw ? 1 : 0)
          };
        };

        updateTeam(result.homeTeamId, result.homeScore, result.awayScore);
        updateTeam(result.awayTeamId, result.awayScore, result.homeScore);

        // Board Confidence Update
        let boardDelta = 0;
        const myTeamGame = result.homeTeamId === state.playerTeamId || result.awayTeamId === state.playerTeamId;
        if (myTeamGame) {
          const isHome = result.homeTeamId === state.playerTeamId;
          const myScore = isHome ? result.homeScore : result.awayScore;
          const oppScore = isHome ? result.awayScore : result.homeScore;
          
          if (myScore > oppScore) boardDelta = 3;
          else if (myScore === oppScore) boardDelta = -1;
          else {
             // Sultan Takeover Effect (Fitur 9): Sultan tidak mentolerir kekalahan!
             boardDelta = state.hasSultanOwner ? -15 : -8;
          }
        };

        // Matchday Fatigue Deduction & Burnout Logic
        let newStatuses = [...state.playerStatuses];
        let newFamiliarity = state.tacticalFamiliarity;
        let newBannedGames = state.managerBannedGamesLeft;

        if (state.database && state.playerTeamId) {
           const isMyMatch = result.homeTeamId === state.playerTeamId || result.awayTeamId === state.playerTeamId;
           if (isMyMatch) {
              newFamiliarity = Math.min(100, newFamiliarity + 5); // Naik per laga
              newBannedGames = Math.max(0, newBannedGames - 1);
           }
           const matchPlayers = state.database.players.filter(p => p.teamId === result.homeTeamId || p.teamId === result.awayTeamId);
           matchPlayers.forEach(p => {
              let existing = newStatuses.find(s => s.playerId === p.id);
              if (!existing) {
                 existing = { playerId: p.id, fatigue: 100, morale: 80, injured: false, injuryDaysLeft: 0, suspended: false, suspendedGamesLeft: 0 };
                 newStatuses.push(existing);
              }
              
              // Burnout check
              if (existing.fatigue < 60 && Math.random() < 0.1 && p.teamId === state.playerTeamId) {
                 // Pemain kelelahan dipaksa main -> Potential drop permanen
                 newDatabase = { ...newDatabase!, players: newDatabase!.players.map(pl => {
                    if (pl.id === p.id) return { ...pl, potential: Math.max(30, pl.potential - 1) };
                    return pl;
                 })};
                 // Tidak pakai notif inbox untuk menghemat spam, namun berefek senyap
              }
              
              // Deduct fatigue by 30
              existing.fatigue = Math.max(0, existing.fatigue - 30);
           });
        }

        return {
          matchResults: [...state.matchResults, result],
          standings: newStandings,
          boardConfidence: Math.min(100, Math.max(0, state.boardConfidence + boardDelta)),
          playerClubBalance: newBalance,
          playerStatuses: newStatuses,
          database: newDatabase,
          tacticalFamiliarity: newFamiliarity,
          managerBannedGamesLeft: newBannedGames
        };
      }),

      updatePlayerStatus: (playerId, updates) => set((state) => {
        const existing = state.playerStatuses.find(ps => ps.playerId === playerId);
        if (existing) {
          return {
            playerStatuses: state.playerStatuses.map(ps =>
              ps.playerId === playerId ? { ...ps, ...updates } : ps
            )
          };
        } else {
          return {
            playerStatuses: [...state.playerStatuses, {
              playerId,
              fatigue: 0,
              morale: 80,
              injured: false,
              injuryDaysLeft: 0,
              suspended: false,
              suspendedGamesLeft: 0,
              ...updates
            }]
          };
        }
      }),

      addInboxMessage: (msg) => set((state) => ({
        inboxMessages: [{
          ...msg,
          id: `msg-${Date.now()}`,
          date: state.currentDate,
          read: false
        }, ...state.inboxMessages]
      })),

      markInboxRead: (id) => set((state) => ({
        inboxMessages: state.inboxMessages.map(m => m.id === id ? { ...m, read: true } : m)
      })),

      upgradeLicense: () => set((state) => {
        const order: Array<'D' | 'C' | 'B' | 'A' | 'Pro'> = ['D', 'C', 'B', 'A', 'Pro'];
        const currentIdx = order.indexOf(state.managerLicense || 'D');
        if (currentIdx < order.length - 1) {
          return { managerLicense: order[currentIdx + 1] };
        }
        return state;
      }),

      setPlayerTactics: (formation, style, lineup) => set((state) => {
         let familiarityDrop = 0;
         if (state.playerTactics.formation !== formation || state.playerTactics.style !== style) {
            familiarityDrop = 40; // Ganti taktik besar besaran merusak chemistry
         }
         return {
            playerTactics: { formation, style, lineup },
            tacticalFamiliarity: Math.max(0, state.tacticalFamiliarity - familiarityDrop)
         };
      }),

      scoutPlayer: (playerId, cost) => {
        let success = false;
        set((state) => {
          if (!state.database || !state.playerTeamId) return state;
          const myTeam = state.database.teams.find(t => t.id === state.playerTeamId);
          if (!myTeam || myTeam.transferBudget < cost) return state;
          
          if (state.scoutedPlayerIds.includes(playerId)) return state;

          myTeam.transferBudget -= cost;
          success = true;
          return {
            database: {
              ...state.database,
              teams: state.database.teams.map(t => t.id === myTeam.id ? myTeam : t)
            },
            scoutedPlayerIds: [...state.scoutedPlayerIds, playerId]
          };
        });
        return success;
      },

      buyPlayer: (playerId, cost, swapPlayerId, isLoan) => {
        let outcome = { success: false, reason: 'Unknown', isBiddingWar: false, newCost: cost };
        set((state) => {
          if (!state.database || !state.playerTeamId) return state;
          const myTeam = state.database.teams.find(t => t.id === state.playerTeamId);
          if (!myTeam) return state;

          const targetPlayer = state.database.players.find(x => x.id === playerId);
          if (!targetPlayer) return state;
          
          let finalCost = cost;
          // Bidding War & Agen Serakah (Fitur 19 & 8)
          if (targetPlayer.potential > 85 && !isLoan && Math.random() < 0.3) {
             finalCost = cost * 2 + 10000000; // Harga melonjak 2x + Agen minta fee 10M
             outcome.isBiddingWar = true;
             outcome.newCost = finalCost;
          }

          if (myTeam.transferBudget < finalCost) {
             outcome.reason = outcome.isBiddingWar ? `Gagal! Klub raksasa ikut campur dan menaikkan harga jadi €${(finalCost/1000000).toFixed(1)}M. Dana Anda tidak cukup!` : 'Dana transfer tidak mencukupi.';
             return state;
          }

          const newTeams = state.database.teams.map(t => {
            if (t.id === state.playerTeamId) {
              return { ...t, transferBudget: t.transferBudget - finalCost };
            }
            return t;
          });

          const newPlayers = state.database!.players.map(p => {
            if (p.id === playerId) {
              return { ...p, teamId: state.playerTeamId ?? undefined };
            }
            if (swapPlayerId && p.id === swapPlayerId) {
              return { ...p, teamId: targetPlayer.teamId };
            }
            return p;
          });

          outcome.success = true;
          return {
            database: { ...state.database, teams: newTeams, players: newPlayers }
          };
        });
        return outcome;
      },

      applyInjury: (playerId, duration, isACL) => set(state => {
        let finalDuration = duration;
        
        // Medical Facility discount
        if (state.database && state.playerTeamId) {
           const player = state.database.players.find(p => p.id === playerId);
           if (player && player.teamId === state.playerTeamId) {
              const myTeam = state.database.teams.find(t => t.id === state.playerTeamId);
              const medLevel = myTeam?.medicalLevel || 1;
              const discount = (medLevel - 1) * 0.1;
              finalDuration = Math.floor(finalDuration * (1 - discount));
           }
        }

        const newStatuses = [...state.playerStatuses];
        const playerIdx = newStatuses.findIndex(p => p.playerId === playerId);
        
        if (playerIdx === -1) {
          newStatuses.push({ playerId, fatigue: 100, morale: 80, injured: true, injuryDaysLeft: finalDuration, suspended: false, suspendedGamesLeft: 0 });
        } else {
          newStatuses[playerIdx] = { ...newStatuses[playerIdx], injured: true, injuryDaysLeft: finalDuration };
        }

        let newDatabase = state.database;
        if (isACL && newDatabase) {
           newDatabase = { ...newDatabase, players: newDatabase.players.map(p => {
              if (p.id === playerId) {
                 return { ...p, overall: Math.max(30, p.overall - 5), potential: Math.max(30, p.potential - 5) };
              }
              return p;
           })};
        }

        return { playerStatuses: newStatuses, database: newDatabase };
      }),

      acceptSponsor: (name, basePerWeek, bonusPerWin, durationWeeks) => set({
         activeSponsor: { name, basePerWeek, bonusPerWin, remainingWeeks: durationWeeks }
      }),

      upgradeStadium: (cost, capacityIncrease) => set((state) => {
         if (state.playerClubBalance < cost || !state.database || !state.playerTeamId) return state;
         
         const newDatabase = { ...state.database, teams: state.database.teams.map(t => {
            if (t.id === state.playerTeamId) {
               return { ...t, stadiumCapacity: t.stadiumCapacity + capacityIncrease };
            }
            return t;
         })};

         return {
            playerClubBalance: state.playerClubBalance - cost,
            database: newDatabase
         };
      }),

      upgradeFacility: (facility, cost) => set((state) => {
         if (state.playerClubBalance < cost || !state.database || !state.playerTeamId) return state;
         
         const newDatabase = { ...state.database, teams: state.database.teams.map(t => {
            if (t.id === state.playerTeamId) {
               const currentLvl = t[facility as keyof typeof t] || 1;
               if (typeof currentLvl === 'number' && currentLvl >= 5) return t;
               return { ...t, [facility]: (currentLvl as number) + 1 };
            }
            return t;
         })};

         return {
            playerClubBalance: state.playerClubBalance - cost,
            database: newDatabase
         };
      }),

      applyManagerBan: (games) => set(state => ({
         managerBannedGamesLeft: state.managerBannedGamesLeft + games
      }))

    }),
    {
      name: 'globalfm-save',
      partialize: (state) => ({
        currentDate: state.currentDate,
        playerTeamId: state.playerTeamId,
        managerName: state.managerName,
        managerNationality: state.managerNationality,
        managerConfederation: state.managerConfederation,
        managerLicense: state.managerLicense,
        managerRole: state.managerRole,
        language: state.language,
        boardConfidence: state.boardConfidence,
        matchResults: state.matchResults,
        standings: state.standings,
        playerStatuses: state.playerStatuses,
        inboxMessages: state.inboxMessages,
        playerTactics: state.playerTactics,
        scoutedPlayerIds: state.scoutedPlayerIds,
        availableJobs: state.availableJobs,
      }),

    }
  )
);
