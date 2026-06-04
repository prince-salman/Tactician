import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';
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
  type: 'info' | 'warning' | 'transfer' | 'board' | 'success';
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

export interface NewsItem {
  id: string;
  date: string;
  title: string;
  content: string;
  type: 'TRANSFER' | 'MANAGER' | 'NATURALISASI' | 'GOSSIP';
}

interface GameState {
  // Manager Profile
  currentDate: string;
  playerTeamId: string | null;
  managerName: string | null;
  managerNationality: string | null;
  managerConfederation: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC' | null;
  managerLicense: 'D' | 'C' | 'B' | 'A' | 'Pro' | null;
  managerRole: 'Head Coach' | 'Assistant Manager' | 'Academy Coach' | null;
  managerExperience: number; // XP Points
  bankLoan: number; // Hutang bank
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

  // News & Inbox
  inboxMessages: Inbox[];
  news: NewsItem[];

  // Match & Competition
  matchResults: MatchResult[];
  standings: Record<string, Standing>; // keyed by teamId

  // Player States
  playerStatuses: PlayerStatus[];

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
  takeLoan: (amount: number) => void;
  repayLoan: (amount: number) => void;
}

const storage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    return (await get(name)) || null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await set(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    await del(name);
  },
};

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
      managerExperience: 0,
      bankLoan: 0,
      language: 'id',
      boardConfidence: 70,
      teamReputation: 50,
      managerBalance: 0,
      managerSalary: 0,
      blacklistedClubs: [],
      dressingRoomAtmosphere: 80,
      availableJobs: [],
      database: null,
      news: [],
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
        let newNews = [...state.news];
        let newAtmosphere = state.dressingRoomAtmosphere;
        let newStatuses = [...state.playerStatuses];
        let newBoardConfidence = state.boardConfidence;
        let newSultan = state.hasSultanOwner;
        
        if (newDatabase) {
           if (nextDay.getDate() === 1 && nextDay.getMonth() === 6) {
              newNews.push({ id: `news-${Date.now()}-season`, date: nextDay.toISOString().split('T')[0], title: `MUSIM BARU DIMULAI!`, content: `Bursa transfer musim panas dibuka. Pemain tua mempertimbangkan pensiun.`, type: 'GOSSIP' });
              
              newDatabase.players = newDatabase.players.map(p => {
                 let updatedP = { ...p };
                 updatedP.age += 1;

                 if (updatedP.age > 35 && Math.random() < 0.4) {
                    newNews.push({ id: `news-${Date.now()}-ret-${p.id}`, date: nextDay.toISOString().split('T')[0], title: `LEGENDA GANTUNG SEPATU: ${p.name} Pensiun.`, content: `Di usia ${updatedP.age} tahun, pemain ini memutuskan pensiun dari sepakbola profesional.`, type: 'GOSSIP' });
                    updatedP = {
                       ...updatedP,
                       name: `Regen ${Math.random().toString(36).substring(2,6)}`,
                       age: 16,
                       overall: Math.max(40, updatedP.overall - 30),
                       potential: Math.min(99, updatedP.overall + 10),
                       value: 100000,
                       wage: 1000
                    };
                 } 
                 else if (updatedP.age >= 33) {
                    updatedP.overall = Math.max(30, updatedP.overall - Math.floor(Math.random() * 3));
                 }
                 else if (updatedP.age <= 23) {
                    updatedP.overall = Math.min(updatedP.potential, updatedP.overall + Math.floor(Math.random() * 4));
                 }
                 return updatedP;
              });
           }

           if (state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && !state.hasSultanOwner && Math.random() < 0.001) {
              const myTeamIndex = newDatabase.teams.findIndex(t => t.id === state.playerTeamId);
              if (myTeamIndex > -1) {
                 newDatabase.teams[myTeamIndex].transferBudget += 500000000;
                 newDatabase.teams[myTeamIndex].reputation = 9999;
                 newSultan = true;
                 newBoardConfidence = 50;
                 newInbox.push({id: `msg-${Date.now()}-sultan`, date: nextDay.toISOString().split('T')[0], from: 'Pemilik Baru', subject: 'Klub Telah Dibeli Sultan!', body: 'Kami telah menyuntikkan 500 Juta Euro ke kas transfer. Tapi ingat, kami menuntut Anda meraih Tiga Gelar musim ini atau Anda dipecat!', read: false, type: 'warning'});
                 newNews.push({ id: `news-${Date.now()}-sultan`, date: nextDay.toISOString().split('T')[0], title: `KLUB KAYA BARU! ${newDatabase.teams[myTeamIndex].name} Dibeli Triliuner.`, content: `Fans berpesta! Klub ini baru saja mendapat suntikan dana tak terbatas.`, type: 'GOSSIP' });
              }
           }

           if (Math.random() < 0.05) {
             const somePlayer = newDatabase.players[Math.floor(Math.random() * newDatabase.players.length)];
             const someLeague = newDatabase.leagues[Math.floor(Math.random() * newDatabase.leagues.length)];
             const newNation = someLeague.nationId;
             if (somePlayer.nationId !== newNation && Math.random() < 0.1 && somePlayer.overall >= 70) {
               const oldNation = somePlayer.nationId;
               somePlayer.nationId = newNation;
               newNews.push({ id: `news-${Date.now()}-nat`, date: nextDay.toISOString().split('T')[0], title: `PSSI/FA BERGERAK! ${somePlayer.name} Dinaturalisasi!`, content: `Pemain keturunan ${oldNation} tersebut kini resmi berpaspor ${newNation}. Proses perpindahan federasinya segera rampung.`, type: 'NATURALISASI' });
             }
           }

           if (nextDay.getDay() === 1) {
              if (Math.random() < 0.5) {
                 const p = newDatabase.players[Math.floor(Math.random() * newDatabase.players.length)];
                 const t = newDatabase.teams.find(tm => tm.id === p.teamId);
                 if (t) newNews.push({ id: `news-${Date.now()}-gos`, date: nextDay.toISOString().split('T')[0], title: `GOSIP RUANG GANTI: ${t.name} Memanas?`, content: `Media lokal membocorkan adanya perpecahan setelah ${p.name} terlihat cekcok dengan pelatih di sesi latihan.`, type: 'GOSSIP' });
              }

              if (Math.random() < 0.3) {
                 const randomClub = newDatabase.teams.filter(t => t.id !== state.playerTeamId && !t.isNational)[Math.floor(Math.random() * newDatabase.teams.length)];
                 const randomPlayer = newDatabase.players.filter(p => p.teamId !== randomClub.id && p.teamId !== state.playerTeamId && p.overall > 70)[Math.floor(Math.random() * newDatabase.players.length)];
                 if (randomClub && randomPlayer) {
                    const oldClub = newDatabase.teams.find(t => t.id === randomPlayer.teamId);
                    if (oldClub) {
                       randomPlayer.teamId = randomClub.id;
                       newNews.push({ id: `news-${Date.now()}-tf`, date: nextDay.toISOString().split('T')[0], title: `HERE WE GO! ${randomPlayer.name} ke ${randomClub.name}!`, content: `${oldClub.name} resmi melepas pemain bintangnya seharga ${(randomPlayer.value/1000000).toFixed(1)} Juta Euro.`, type: 'TRANSFER' });
                    }
                 }
              }

              if (Math.random() < 0.2) {
                 const strugglingClub = newDatabase.teams.filter(t => t.id !== state.playerTeamId && !t.isNational && t.reputation < 6000)[Math.floor(Math.random() * newDatabase.teams.length)];
                 if (strugglingClub) {
                    newNews.push({ id: `news-${Date.now()}-mgr`, date: nextDay.toISOString().split('T')[0], title: `RESMI DIPECAAT! ${strugglingClub.name} Cari Manajer Baru.`, content: `Rentetan hasil buruk membuat manajemen ${strugglingClub.name} hilang kesabaran dan memecat pelatih kepalanya pagi ini.`, type: 'MANAGER' });
                 }
              }
           }
        }
        
        if (state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && newDatabase) {
           const newXp = state.managerExperience + 1;
           let newLicense = state.managerLicense;
           
           if (newXp === 100 && newLicense === 'D') { newLicense = 'C'; newInbox.push({id: `msg-${Date.now()}-lic`, date: nextDay.toISOString().split('T')[0], from: 'Asosiasi Sepakbola', subject: '🎉 Lisensi Naik ke C!', body: 'Berdasarkan pengalaman Anda memanajemen tim selama 100 hari, lisensi kepelatihan Anda telah dinaikkan ke tingkat C!', read: false, type: 'success'}); }
           else if (newXp === 300 && newLicense === 'C') { newLicense = 'B'; newInbox.push({id: `msg-${Date.now()}-lic`, date: nextDay.toISOString().split('T')[0], from: 'Asosiasi Sepakbola', subject: '🎉 Lisensi Naik ke B!', body: 'Dedikasi luar biasa! Pengalaman 300 hari mengantarkan Anda meraih Lisensi B!', read: false, type: 'success'}); }
           else if (newXp === 600 && newLicense === 'B') { newLicense = 'A'; newInbox.push({id: `msg-${Date.now()}-lic`, date: nextDay.toISOString().split('T')[0], from: 'Asosiasi Sepakbola', subject: '🎉 Lisensi Naik ke A!', body: '600 hari bekerja keras. Anda kini memegang Lisensi A, tiket menuju klub besar!', read: false, type: 'success'}); }
           else if (newXp === 1000 && newLicense === 'A') { newLicense = 'Pro'; newInbox.push({id: `msg-${Date.now()}-lic`, date: nextDay.toISOString().split('T')[0], from: 'Asosiasi Sepakbola', subject: '👑 LISENSI PRO DIRAIH!', body: 'Legenda sejati. 1000 hari karir. Anda telah mendapatkan gelar Lisensi Pro. Anda bebas melatih klub raksasa manapun sekarang!', read: false, type: 'success'}); }

           const mySquad = newDatabase.players.filter(p => p.teamId === state.playerTeamId);
           
           if (mySquad.length > 0) {
             mySquad.forEach(p => {
                if (!p.trait) {
                   const TRAITS = ['Professional', 'Professional', 'Hothead', 'Mercenary', 'Loyal', 'Ambitious', 'Troublemaker'] as const;
                   p.trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];
                }
             });

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
             
             if (!state.hasSultanOwner && Math.random() < 0.01) {
                newInbox.push({
                   id: `msg-${Date.now()}-sultan`,
                   date: nextDay.toISOString().split('T')[0],
                   from: 'Dewan Direksi Baru',
                   subject: '💎 AKUISISI KLUB OLEH KONSORSIUM TIMUR TENGAH',
                   body: `Klub kita baru saja dibeli oleh konsorsium miliarder! Mereka telah menyuntikkan dana sebesar €500M ke kas klub. Namun ingat, ekspektasi mereka sangat tinggi. Kekalahan tidak akan ditolerir!`,
                   read: false,
                   type: 'board'
                });
                newSultan = true;
             }
             
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

        if (nextDay.getDay() === 1) {
           get().generateJobs();
        }

        if (nextDay.getDay() === 0) {
           if (state.playerTeamId && state.managerSalary > 0) {
              set(s => ({ managerBalance: s.managerBalance + state.managerSalary }));
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

              if (newBalance < -50000000) {
                 newInbox.push({
                   id: `msg-${Date.now()}-bankrupt`,
                   date: nextDay.toISOString().split('T')[0],
                   from: 'Chairman',
                   subject: 'PEMECATAN: Klub Bangkrut!',
                   body: `Ini adalah bencana finansial! Anda telah menghancurkan keuangan klub ini. Kami berada di ambang kebangkrutan karena beban gaji yang tidak masuk akal. Anda DIBERHENTIKAN dengan tidak hormat!`,
                   read: false,
                   type: 'warning'
                 });
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

        if (state.currentDate.endsWith('-03-01') && state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && newDatabase) {
           const myTeam = newDatabase.teams.find(t => t.id === state.playerTeamId);
           if (myTeam) {
              const academyLevel = myTeam.academyLevel || 1;
              const firstNames = ["James", "John", "Leo", "Kylian", "Ethan", "Noah", "Mason", "Liam"];
              const lastNames = ["Smith", "Messi", "Mbappe", "Williams", "Jones", "Brown", "Davis"];
              const TRAITS = ['Professional', 'Professional', 'Hothead', 'Mercenary', 'Loyal', 'Ambitious', 'Troublemaker'] as const;
              
              const newYouths = [];
              const numIntake = 1 + Math.floor(Math.random() * 3);
              
              for (let i=0; i<numIntake; i++) {
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
                 
                 nationalPlayers.forEach(p => {
                    let existing = newStatuses.find(s => s.playerId === p.id);
                    if (!existing) {
                       existing = { playerId: p.id, fatigue: 100, morale: 80, injured: false, injuryDaysLeft: 0, suspended: false, suspendedGamesLeft: 0 };
                       newStatuses.push(existing);
                    }
                    existing.fatigue = Math.max(0, existing.fatigue - 40);
                    
                    if (Math.random() < 0.2 && !existing.injured) {
                       const dur = 3 + Math.floor(Math.random() * 14);
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
        
        newStatuses = newStatuses.map(s => ({ ...s, fatigue: Math.min(100, s.fatigue + 5) }));

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
          news: newNews,
          dressingRoomAtmosphere: newAtmosphere,
          playerStatuses: updatedStatuses,
          playerClubBalance: newBalance - (state.bankLoan > 0 ? (state.bankLoan * 0.001) : 0),
          activeSponsor: newSponsor,
          boardConfidence: newBoardConfidence,
          hasSultanOwner: newSultan,
          managerExperience: (state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED') ? state.managerExperience + 1 : state.managerExperience,
          managerLicense: (state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED' && [100, 300, 600, 1000].includes(state.managerExperience + 1)) ? 
             (state.managerExperience + 1 === 100 ? 'C' : state.managerExperience + 1 === 300 ? 'B' : state.managerExperience + 1 === 600 ? 'A' : 'Pro') 
             : state.managerLicense
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
        playerTeamId: 'UNEMPLOYED',
        managerBalance: 10000,
        managerSalary: 0
      }),

      generateJobs: () => set(state => {
         if (!state.database) return state;
         const newJobs: any[] = [];
         // Filter out national teams - only club jobs
         const clubTeams = state.database.teams.filter(t => !t.isNational);
         const shuffledTeams = [...clubTeams].sort(() => 0.5 - Math.random());
         const myLicense = state.managerLicense || 'D';
         const licenseRank: Record<string, number> = { 'D': 1, 'C': 2, 'B': 3, 'A': 4, 'Pro': 5 };
         const myRank = licenseRank[myLicense] || 1;
         
         // 1. Generate 15 random jobs (may or may not be accessible)
         for (let i = 0; i < Math.min(15, shuffledTeams.length); i++) {
            const team = shuffledTeams[i];
            if (!team) continue;
            
            let requiredLicense = 'D';
            let role = 'Head Coach';
            
            if (team.reputation < 4000) {
               requiredLicense = 'D';
            } else if (team.reputation < 5000) {
               requiredLicense = Math.random() > 0.5 ? 'D' : 'C';
            } else if (team.reputation < 6000) {
               requiredLicense = Math.random() > 0.5 ? 'C' : 'B';
            } else if (team.reputation < 7000) {
               requiredLicense = Math.random() > 0.3 ? 'B' : 'A';
            } else if (team.reputation < 8000) {
               requiredLicense = Math.random() > 0.5 ? 'A' : 'Pro';
            } else {
               requiredLicense = 'Pro';
               if (Math.random() > 0.7) { role = 'Assistant Manager'; requiredLicense = 'A'; }
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
         
         // 2. GUARANTEE at least 8 jobs that the player CAN apply to
         const existingTeamIds = new Set(newJobs.map(j => j.team.id));
         let guaranteed = 0;
         
         // Sort remaining teams by reputation ascending (smallest first = easiest to get)
         const remainingTeams = shuffledTeams
           .filter(t => !existingTeamIds.has(t.id))
           .sort((a, b) => a.reputation - b.reputation);
         
         for (const team of remainingTeams) {
            if (guaranteed >= 8) break;
            
            const league = state.database.leagues.find(l => l.id === team.leagueId);
            newJobs.push({
               id: `job-guaranteed-${Date.now()}-${guaranteed}`,
               team: { id: team.id, name: team.name, shortName: team.shortName },
               league: league,
               role: 'Head Coach',
               requiredLicense: myLicense, // Match player's exact license
               baseWage: Math.floor(team.reputation * 80),
               reputation: team.reputation
            });
            guaranteed++;
         }

         return { availableJobs: newJobs.sort((a, b) => b.reputation - a.reputation) };
      }),
      
      acceptJobOffer: (teamId, role, salary) => set((state) => {
        let initialBalance = 0;
        if (state.database) {
           const t = state.database.teams.find(x => x.id === teamId);
           if (t) initialBalance = t.transferBudget + 20000000;
        }
        return {
          playerTeamId: teamId,
          managerRole: role as any,
          managerSalary: salary,
          playerClubBalance: initialBalance,
          activeSponsor: null,
          tacticalFamiliarity: 30,
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

        if (state.database && state.playerTeamId && state.playerTeamId !== 'UNEMPLOYED') {
           const myTeam = state.database.teams.find(t => t.id === state.playerTeamId);
           if (myTeam) {
              if (result.homeTeamId === myTeam.id) {
                 const ticketPrice = myTeam.ticketPrice || 45;
                 let attendanceRatio = 0.6 + (Math.random() * 0.4);
                 if (state.boardConfidence < 30) attendanceRatio = 0.1;
                 
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

              if (state.activeSponsor) {
                 const isWin = (result.homeTeamId === myTeam.id && result.homeScore > result.awayScore) || 
                               (result.awayTeamId === myTeam.id && result.awayScore > result.homeScore);
                 if (isWin) newBalance += state.activeSponsor.bonusPerWin;
              }
           }
        }

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

        let boardDelta = 0;
        const myTeamGame = result.homeTeamId === state.playerTeamId || result.awayTeamId === state.playerTeamId;
        if (myTeamGame) {
          const isHome = result.homeTeamId === state.playerTeamId;
          const myScore = isHome ? result.homeScore : result.awayScore;
          const oppScore = isHome ? result.awayScore : result.homeScore;
          
          if (myScore > oppScore) boardDelta = 3;
          else if (myScore === oppScore) boardDelta = -1;
          else boardDelta = state.hasSultanOwner ? -15 : -8;
        };

        let newStatuses = [...state.playerStatuses];
        let newFamiliarity = state.tacticalFamiliarity;
        let newBannedGames = state.managerBannedGamesLeft;

        if (state.database && state.playerTeamId) {
           const isMyMatch = result.homeTeamId === state.playerTeamId || result.awayTeamId === state.playerTeamId;
           if (isMyMatch) {
              newFamiliarity = Math.min(100, newFamiliarity + 5);
              newBannedGames = Math.max(0, newBannedGames - 1);
           }
           const matchPlayers = state.database.players.filter(p => p.teamId === result.homeTeamId || p.teamId === result.awayTeamId);
           matchPlayers.forEach(p => {
              let existing = newStatuses.find(s => s.playerId === p.id);
              if (!existing) {
                 existing = { playerId: p.id, fatigue: 100, morale: 80, injured: false, injuryDaysLeft: 0, suspended: false, suspendedGamesLeft: 0 };
                 newStatuses.push(existing);
              }
              if (existing.fatigue < 60 && Math.random() < 0.1 && p.teamId === state.playerTeamId) {
                 newDatabase = { ...newDatabase!, players: newDatabase!.players.map(pl => {
                    if (pl.id === p.id) return { ...pl, potential: Math.max(30, pl.potential - 1) };
                    return pl;
                 })};
              }
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
            familiarityDrop = 40;
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
          if (targetPlayer.potential > 85 && !isLoan && Math.random() < 0.3) {
             finalCost = cost * 2 + 10000000;
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

      applyManagerBan: (games) => set({ managerBannedGamesLeft: games }),

      takeLoan: (amount) => set((state) => {
         if (state.bankLoan > 0) return {};
         if (!state.playerTeamId || state.playerTeamId === 'UNEMPLOYED') return {};
         
         let db = state.database;
         if (!db) return {};
         const myTeamIndex = db.teams.findIndex(t => t.id === state.playerTeamId);
         if (myTeamIndex > -1) {
            db.teams[myTeamIndex].transferBudget += amount;
            return { bankLoan: amount, database: db };
         }
         return {};
      }),

      repayLoan: (amount) => set((state) => {
         if (state.bankLoan <= 0) return {};
         if (!state.playerTeamId || state.playerTeamId === 'UNEMPLOYED') return {};
         
         let db = state.database;
         if (!db) return {};
         const myTeamIndex = db.teams.findIndex(t => t.id === state.playerTeamId);
         if (myTeamIndex > -1 && db.teams[myTeamIndex].transferBudget >= amount) {
            db.teams[myTeamIndex].transferBudget -= amount;
            return { bankLoan: Math.max(0, state.bankLoan - amount), database: db };
         }
         return {};
      })
    }),
    {
      name: 'globalfm-save',
      storage: createJSONStorage(() => storage),
    }
  )
);
