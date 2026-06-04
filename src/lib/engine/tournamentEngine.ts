import { Team, Match } from '@/types';

// ==========================================
// TOURNAMENT ARCHITECTURE & FAST SIMULATION
// ==========================================

export interface TournamentConfig {
  id: string;
  name: string;
  type: 'GROUP' | 'KNOCKOUT' | 'HYBRID';
  tier: 1 | 2 | 3;
  participants: string[];
}

/**
 * FAST SIMULATION ALGORITHM (Latar Belakang)
 * Sangat penting untuk menjaga performa game agar browser tidak hang saat
 * memproses ribuan pertandingan dari 211 negara.
 * 
 * Fungsi ini HANYA menghasilkan skor akhir tanpa event (tanpa radar pergerakan bola).
 */
export function simulateFastMatch(homeTeam: Team, awayTeam: Team): { homeScore: number, awayScore: number } {
  // Base chance calculation based on Reputation
  // Example: Rep 8000 vs Rep 5000
  const homeAdvantage = 500; // Bonus for home team
  const homeStrength = homeTeam.reputation + homeAdvantage;
  const awayStrength = awayTeam.reputation;
  
  const totalStrength = homeStrength + awayStrength;
  
  // Normalize probability
  const homeProb = homeStrength / totalStrength;
  
  // Random roll (0 to 1)
  const roll = Math.random();
  
  let homeScore = 0;
  let awayScore = 0;
  // Peluang Kejutan (Upset) di Dunia Sepakbola Realistis (sekitar 12% pertandingan)
  const isUpset = Math.random() < 0.12;

  if (isUpset) {
     // Tim yang harusnya kalah, justru menang atau menahan imbang secara dramatis
     if (homeProb > 0.6) {
       awayScore = Math.floor(Math.random() * 2) + 1; // 1-2
       homeScore = Math.floor(Math.random() * 2); // 0-1
     } else if (homeProb < 0.4) {
       homeScore = Math.floor(Math.random() * 2) + 1; // 1-2
       awayScore = Math.floor(Math.random() * 2); // 0-1
     } else {
       // Draw dramatis
       homeScore = Math.floor(Math.random() * 3) + 1;
       awayScore = homeScore;
     }
  } else {
    // Hasil Normal berdasarkan kekuatan (Probability)
    if (roll < homeProb - 0.2) {
       // Home dominates
       homeScore = Math.floor(Math.random() * 3) + 2; // 2 to 4
       awayScore = Math.floor(Math.random() * 2); // 0 to 1
    } else if (roll < homeProb + 0.1) {
       // Home wins tight match
       homeScore = Math.floor(Math.random() * 2) + 1; // 1 to 2
       awayScore = homeScore - 1; 
    } else if (roll < homeProb + 0.3) {
       // Draw
       homeScore = Math.floor(Math.random() * 2);
       awayScore = homeScore;
    } else {
       // Away wins normal
       awayScore = Math.floor(Math.random() * 3) + 1;
       homeScore = Math.floor(Math.random() * 2);
    }
  }
  
  // Momen magis / skor tinggi langka
  if (Math.random() > 0.95) {
     homeScore += 2;
     awayScore += 1;
  }
  return { homeScore, awayScore };
}

/**
 * Generate Group Stage Brackets
 * Membagi tim ke dalam grup (misal: 32 tim menjadi 8 grup isi 4)
 */
export function generateGroupStage(teams: Team[], groupCount: number) {
  const groups: Team[][] = Array.from({ length: groupCount }, () => []);
  
  // Sort teams by reputation for seeding
  const seededTeams = [...teams].sort((a, b) => b.reputation - a.reputation);
  
  seededTeams.forEach((team, index) => {
    const groupIndex = index % groupCount;
    groups[groupIndex].push(team);
  });
  
  return groups;
}

/**
 * Generate Knockout Matchups (Home & Away)
 */
export function generateKnockoutMatches(teams: Team[]): { home: Team, away: Team }[] {
  // teams must be even
  const matches = [];
  for (let i = 0; i < teams.length; i += 2) {
    if (teams[i + 1]) {
      matches.push({ home: teams[i], away: teams[i + 1] });
    }
  }
  return matches;
}
