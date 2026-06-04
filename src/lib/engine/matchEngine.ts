import { Team, Player } from '@/types';

export interface MatchEvent {
  minute: number;
  type: 'GOAL' | 'YELLOW_CARD' | 'RED_CARD' | 'CHANCE' | 'START' | 'END' | 'HALF_TIME' | 'VAR';
  teamId?: string;
  playerId?: string;
  description: string;
}

const REFEREES = ["Pierluigi Collina", "Howard Webb", "Michael Oliver", "Anthony Taylor", "Cuneyt Cakir", "Bjorn Kuipers", "Felix Brych", "Szymon Marciniak"];

export interface MatchInjury {
  playerId: string;
  duration: number; // days
  isACL: boolean;
}

export interface MatchResult {
  homeScore: number;
  awayScore: number;
  events: MatchEvent[];
  injuries: MatchInjury[];
  hasControversy?: boolean;
}

export const simulateMatch = (
  homeTeam: Team, 
  awayTeam: Team, 
  homeOvr: number = 75, 
  awayOvr: number = 75,
  homeSquad: Player[] = [],
  awaySquad: Player[] = [],
  homeAtmosphere: number = 80,
  weather: 'NORMAL' | 'RAIN' | 'SNOW' = 'NORMAL',
  homeStyle: 'TIKI_TAKA' | 'COUNTER' | 'LONG_BALL' = 'TIKI_TAKA',
  awayStyle: 'TIKI_TAKA' | 'COUNTER' | 'LONG_BALL' = 'TIKI_TAKA',
  homeFamiliarity: number = 100,
  isHomeManagerBanned: boolean = false
): MatchResult => {
  const events: MatchEvent[] = [];
  const injuries: MatchInjury[] = [];
  let hasControversy = false;
  let homeScore = 0;
  let awayScore = 0;

  // Home advantage + random variance
  const homeAdvantage = 3;
  // Mutiny Effect: Jika atmosfer hancur, tim bermain setengah hati (-10 OVR)
  const isHomeMutiny = homeAtmosphere < 30;
  let effectiveHomeOvr = isHomeMutiny ? homeOvr - 10 : homeOvr;
  let effectiveAwayOvr = awayOvr;

  // Weather Penalti: Tiki-taka hancur di lapangan becek (Hujan)
  if (weather === 'RAIN') {
     if (homeStyle === 'TIKI_TAKA') effectiveHomeOvr -= 10;
     if (awayStyle === 'TIKI_TAKA') effectiveAwayOvr -= 10;
  } else if (weather === 'SNOW') {
     // Lapangan licin mengurangi performa semua taktik berbasis penguasaan bola
     if (homeStyle === 'TIKI_TAKA') effectiveHomeOvr -= 5;
     if (awayStyle === 'TIKI_TAKA') effectiveAwayOvr -= 5;
  }

  // Tactical Familiarity (Fitur 4)
  if (homeFamiliarity < 50) {
     effectiveHomeOvr -= Math.floor((50 - homeFamiliarity) / 5); // Max penalty -10
  } else if (homeFamiliarity === 100) {
     effectiveHomeOvr += 5; // Bonus
  }

  // Touchline Ban (Fitur 17)
  if (isHomeManagerBanned) {
     effectiveHomeOvr -= 5;
  }

  // Jet Lag untuk Away Team (Fitur 18)
  const isAwayJetLagged = Math.random() < 0.15;
  if (isAwayJetLagged) {
     effectiveAwayOvr -= 8;
  }

  // Balotelli Effect (Fitur 15)
  let homeTroubleEvent = null;
  const homeTroublemaker = homeSquad.find(p => p.trait === 'Troublemaker');
  if (homeTroublemaker) {
     if (Math.random() < 0.15) {
        effectiveHomeOvr += 20; // Mode Dewa
        homeTroubleEvent = `🌟 ${homeTroublemaker.name} sedang dalam mood luar biasa hari ini! Dia terlihat tak terhentikan (+OVR).`;
     } else if (Math.random() < 0.25) {
        effectiveHomeOvr -= 20; // Malas
        homeTroubleEvent = `🥱 ${homeTroublemaker.name} terlihat malas berlari hari ini, merusak tempo permainan timnya (-OVR).`;
     }
  }

  let awayTroubleEvent = null;
  const awayTroublemaker = awaySquad.find(p => p.trait === 'Troublemaker');
  if (awayTroublemaker) {
     if (Math.random() < 0.15) {
        effectiveAwayOvr += 20;
        awayTroubleEvent = `🌟 ${awayTroublemaker.name} sedang dalam mood luar biasa hari ini! Dia terlihat tak terhentikan (+OVR).`;
     } else if (Math.random() < 0.25) {
        effectiveAwayOvr -= 20;
        awayTroubleEvent = `🥱 ${awayTroublemaker.name} terlihat malas berlari hari ini, merusak tempo permainan timnya (-OVR).`;
     }
  }

  const homePower = effectiveHomeOvr + homeAdvantage + (Math.random() * 10);
  const awayPower = effectiveAwayOvr + (Math.random() * 10);

  // Referee
  const referee = REFEREES[Math.floor(Math.random() * REFEREES.length)];

  events.push({ minute: 0, type: 'START', description: `Kickoff! ${homeTeam.name} vs ${awayTeam.name}. Wasit hari ini: ${referee}.` });
  
  if (isHomeManagerBanned) {
     events.push({ minute: 0, type: 'CHANCE', description: `🚫 Sang Manajer ${homeTeam.name} terkena hukuman BANNED dan tidak boleh menemani tim di pinggir lapangan hari ini. Ini pukulan besar bagi mental pemain (-OVR).` });
  }
  if (isAwayJetLagged) {
     events.push({ minute: 0, type: 'CHANCE', teamId: awayTeam.id, description: `✈️ Terlihat para pemain ${awayTeam.name} mengalami JET LAG akibat perjalanan jauh. Fisik mereka tampak terkuras di awal pertandingan (-OVR).` });
  }
  if (isHomeMutiny) {
     events.push({ minute: 1, type: 'CHANCE', teamId: homeTeam.id, description: `⚠️ KABAR BURUK: Beredar rumor pemberontakan di ruang ganti ${homeTeam.name}! Pemain terlihat bermain setengah hati.` });
  }
  if (homeTroubleEvent) {
     events.push({ minute: 2, type: 'CHANCE', teamId: homeTeam.id, description: homeTroubleEvent });
  }
  if (awayTroubleEvent) {
     events.push({ minute: 2, type: 'CHANCE', teamId: awayTeam.id, description: awayTroubleEvent });
  }

  // Generate events for 90 minutes
  for (let minute = 1; minute <= 90; minute++) {
    // Determine if an event happens this minute (approx 10% chance)
    if (Math.random() < 0.1) {
      // Determine which team creates the event based on relative power
      const totalPower = homePower + awayPower;
      const isHomeEvent = Math.random() < (homePower / totalPower);
      const activeTeam = isHomeEvent ? homeTeam : awayTeam;
      
      // What kind of event? (80% Chance, 15% Yellow, 2% Red, 3% Goal from nowhere)
      const eventRoll = Math.random();
      
      if (eventRoll < 0.25) { // Ditingkatkan peluang ada event serangan
        // Direct Goal Chance calculation based on power
        // Penambahan cap min-max agar realistis (tim kecil masih punya minimal 15% peluang gol saat dapat bola, tim besar maksimal 80%)
        let chanceToScore = 0.30 + ((isHomeEvent ? homePower - awayPower : awayPower - homePower) / 100);
        chanceToScore = Math.max(0.15, Math.min(0.80, chanceToScore));
        
        // Random Upset Generator (Momen Magis di Sepakbola)
        if (Math.random() > 0.95) {
            chanceToScore = 0.99; // Keberuntungan mutlak / gol fantastis
        }

        if (Math.random() < chanceToScore) {
          // Cek kemungkinan intervensi VAR (10% chance gol dianulir)
          if (Math.random() > 0.9) {
            
            // Kontroversi VAR (Fitur 17) - 2% Chance
            if (Math.random() > 0.8) {
               events.push({
                 minute,
                 type: 'VAR',
                 teamId: activeTeam.id,
                 description: `📺 VAR CONTROVERSY! Gol ${activeTeam.name} dianulir oleh wasit ${referee} dengan alasan yang sangat meragukan. Tayangan ulang menunjukkan pemain berada dalam posisi Onside! Skuad protes keras!`
               });
               if (activeTeam.id === homeTeam.id || activeTeam.id === awayTeam.id) {
                  hasControversy = true;
               }
            } else {
               events.push({
                 minute,
                 type: 'VAR',
                 teamId: activeTeam.id,
                 description: `📺 VAR mengintervensi! Gol ${activeTeam.name} dianulir karena offside tipis.`
               });
            }
          } else {
            if (isHomeEvent) homeScore++; else awayScore++;
            events.push({
              minute,
              type: 'GOAL',
              teamId: activeTeam.id,
              description: `GOAL!!! Serangan mematikan oleh ${activeTeam.name}! Skor menjadi ${homeScore} - ${awayScore}.`
            });
          }
        } else {
          // Cek kemungkinan VAR penalti jika gagal gol
          if (Math.random() > 0.95) {
             if (isHomeEvent) homeScore++; else awayScore++;
             events.push({
                minute,
                type: 'VAR',
                teamId: activeTeam.id,
                description: `📺 VAR REVIEW: PENALTI! Pelanggaran di kotak terlarang. ${activeTeam.name} sukses mengeksekusi penalti! Skor: ${homeScore} - ${awayScore}.`
             });
          } else {
             events.push({
               minute,
               type: 'CHANCE',
               teamId: activeTeam.id,
               description: `Peluang emas untuk ${activeTeam.name}, namun tembakan masih melenceng atau diselamatkan kiper!`
             });
          }
        }
      } else if (eventRoll > 0.85 && eventRoll < 0.98) {
        events.push({
          minute,
          type: 'YELLOW_CARD',
          teamId: activeTeam.id,
          description: `Yellow card for a reckless tackle by a ${activeTeam.name} player.`
        });
      } else if (eventRoll >= 0.98) {
        // Hothead trait increases red card chance
        let description = `RED CARD! Absolute shock as ${activeTeam.name} goes down to 10 men!`;
        const activeSquad = isHomeEvent ? homeSquad : awaySquad;
        if (activeSquad.length > 0) {
           const hotheads = activeSquad.filter(p => p.trait === 'Hothead');
           if (hotheads.length > 0 && Math.random() < 0.6) {
              const culprit = hotheads[Math.floor(Math.random() * hotheads.length)];
              description = `RED CARD! Pemain bertemperamen panas ${culprit.name} dari ${activeTeam.name} diusir keluar lapangan setelah tekel kasar!`;
           }
        }

        events.push({
          minute,
          type: 'RED_CARD',
          teamId: activeTeam.id,
          description
        });
      }

      // INJURY CALCULATION (Tekel keras / Cuaca ekstrem)
      if (['CHANCE', 'YELLOW_CARD', 'RED_CARD'].includes(events[events.length - 1]?.type)) {
         // Peluang cedera: Normal 1%, Snow 3%, Rain 2%
         const injuryChance = weather === 'SNOW' ? 0.03 : weather === 'RAIN' ? 0.02 : 0.01;
         if (Math.random() < injuryChance) {
             const activeSquad = isHomeEvent ? homeSquad : awaySquad;
             if (activeSquad.length > 0) {
                 const victim = activeSquad[Math.floor(Math.random() * activeSquad.length)];
                 const isACL = Math.random() < (weather === 'SNOW' ? 0.2 : 0.05); // ACL chance higher in snow
                 const duration = isACL ? Math.floor(Math.random() * 90) + 180 : Math.floor(Math.random() * 14) + 3; // 3-17 hari atau 6-9 bulan
                 
                 injuries.push({ playerId: victim.id, duration, isACL });
                 events.push({
                    minute,
                    type: 'CHANCE',
                    teamId: activeTeam.id,
                    description: `🚑 CEDERA: ${victim.name} dari ${activeTeam.name} terkapar di lapangan${isACL ? ' sambil memegangi lututnya! Sepertinya sangat parah!' : ' dan butuh perawatan medis.'}`
                 });
             }
         }
      }
    }

    if (minute === 45) {
      events.push({ minute: 45, type: 'HALF_TIME', description: `Half Time. ${homeTeam.shortName} ${homeScore} - ${awayScore} ${awayTeam.shortName}` });
    }
  }

  events.push({ minute: 90, type: 'END', description: `Full Time! Final Score: ${homeScore} - ${awayScore}` });

  return {
    homeScore,
    awayScore,
    events,
    injuries,
    hasControversy
  };
};
