import { League, Player, Team } from '@/types';

// Dummy data seeders
const FIRST_NAMES = ['John', 'David', 'Michael', 'Chris', 'James', 'Daniel', 'Paul', 'Mark', 'Luis', 'Carlos', 'Jose', 'Juan', 'Diego', 'Mateo', 'Lucas', 'Budi', 'Andi', 'Rizky', 'Aditya', 'Pratama'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Gonzalez', 'Silva', 'Santos', 'Ronaldo', 'Messi', 'Mbappe', 'Setiawan', 'Hidayat', 'Saputra', 'Wijaya', 'Nugroho'];
const NATIONS = ['ENG', 'ESP', 'ITA', 'GER', 'FRA', 'BRA', 'ARG', 'INA', 'JPN', 'KOR'];

// Utility to generate random number
const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

// Generate Player Name
const generateName = () => {
  return `${FIRST_NAMES[rand(0, FIRST_NAMES.length - 1)]} ${LAST_NAMES[rand(0, LAST_NAMES.length - 1)]}`;
};

// Generate 50,000 players for 2026 Database
export const generateGlobalDatabase = () => {
  console.log('Generating Global 2026 Database...');
  const leagues: League[] = [];
  const teams: Team[] = [];
  const players: Player[] = [];

  // Create Leagues
  const LEAGUE_NAMES = ['Premier League', 'La Liga', 'Serie A', 'Bundesliga', 'Ligue 1', 'Liga 1 Indonesia', 'Brasileirao', 'MLS', 'J1 League', 'Saudi Pro League'];
  
  LEAGUE_NAMES.forEach((name, idx) => {
    leagues.push({
      id: `L-${idx + 1}`,
      name,
      nationId: NATIONS[idx % NATIONS.length],
      level: 1,
    });
  });

  // Create Teams (20 per league)
  let teamCounter = 1;
  let playerCounter = 1;

  leagues.forEach((league) => {
    for (let i = 1; i <= 20; i++) {
      const teamId = `T-${teamCounter}`;
      teams.push({
        id: teamId,
        name: `${league.name} Team ${i}`,
        shortName: `TM${i}`,
        nationId: league.nationId,
        leagueId: league.id,
        isNational: false,
        reputation: rand(50, 100),
        stadium: `Stadium ${teamCounter}`,
        stadiumCapacity: rand(15000, 80000),
        transferBudget: rand(10000000, 200000000),
        wageBudget: rand(100000, 5000000),
      });

      // Generate 25 Players per team
      const positions: ('GK' | 'DEF' | 'MID' | 'FWD')[] = ['GK', 'GK', 'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD'];
      
      positions.forEach((pos) => {
        const age = rand(16, 38);
        const potential = rand(60, 99);
        const overall = rand(50, Math.min(potential, age > 22 ? 95 : 85));
        const TRAITS = ['Professional', 'Professional', 'Hothead', 'Mercenary', 'Loyal', 'Ambitious', 'Troublemaker'] as const;
        
        players.push({
          id: `P-${playerCounter}`,
          name: generateName(),
          nationId: league.nationId, // Simplified
          age,
          position: pos,
          overall,
          potential,
          teamId: teamId,
          value: overall * rand(100000, 500000),
          wage: overall * rand(1000, 5000),
          trait: TRAITS[rand(0, TRAITS.length - 1)]
        });
        playerCounter++;
      });

      teamCounter++;
    }
  });

  // Add Free Agents
  for (let i = 0; i < 5000; i++) {
    const age = rand(16, 40);
    const potential = rand(50, 85);
    const overall = rand(45, Math.min(potential, 80));
    const TRAITS = ['Professional', 'Professional', 'Hothead', 'Mercenary', 'Loyal', 'Ambitious', 'Troublemaker'] as const;
    
    players.push({
      id: `P-${playerCounter}`,
      name: generateName(),
      nationId: NATIONS[rand(0, NATIONS.length - 1)],
      age,
      position: ['GK', 'DEF', 'MID', 'FWD'][rand(0, 3)] as 'GK' | 'DEF' | 'MID' | 'FWD',
      overall,
      potential,
      teamId: undefined, // Free Agent
      value: overall * rand(50000, 300000),
      wage: overall * rand(500, 2000),
      trait: TRAITS[rand(0, TRAITS.length - 1)]
    });
    playerCounter++;
  }

  return { leagues, teams, players };
};
