const fs = require('fs');
const path = require('path');

// ==========================================
// 1. DATA REFERENSI DUNIA (200+ NEGARA)
// ==========================================
const worldNations = [
  // Eropa (Top)
  { id: 'ENG', name: 'England', region: 'Europe', topTeams: ['Arsenal', 'Chelsea', 'Liverpool', 'Manchester City', 'Manchester United', 'Tottenham', 'Newcastle'] },
  { id: 'ESP', name: 'Spain', region: 'Europe', topTeams: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Sevilla', 'Valencia', 'Athletic Club'] },
  { id: 'ITA', name: 'Italy', region: 'Europe', topTeams: ['Juventus', 'AC Milan', 'Inter Milan', 'Napoli', 'Roma', 'Lazio'] },
  { id: 'GER', name: 'Germany', region: 'Europe', topTeams: ['Bayern Munich', 'Borussia Dortmund', 'Bayer Leverkusen', 'RB Leipzig', 'Eintracht Frankfurt'] },
  { id: 'FRA', name: 'France', region: 'Europe', topTeams: ['Paris Saint-Germain', 'Marseille', 'Lyon', 'Monaco', 'Lille'] },
  { id: 'POR', name: 'Portugal', region: 'Europe', topTeams: ['Benfica', 'Porto', 'Sporting CP', 'Braga'] },
  { id: 'NED', name: 'Netherlands', region: 'Europe', topTeams: ['Ajax', 'PSV Eindhoven', 'Feyenoord', 'AZ Alkmaar'] },
  // Amerika Selatan (Top)
  { id: 'BRA', name: 'Brazil', region: 'SouthAmerica', topTeams: ['Flamengo', 'Palmeiras', 'Sao Paulo', 'Corinthians', 'Santos', 'Fluminense'] },
  { id: 'ARG', name: 'Argentina', region: 'SouthAmerica', topTeams: ['Boca Juniors', 'River Plate', 'Racing Club', 'Independiente'] },
  // Asia
  { id: 'JPN', name: 'Japan', region: 'Asia', topTeams: ['Kawasaki Frontale', 'Urawa Red Diamonds', 'Yokohama F. Marinos', 'Kashima Antlers'] },
  { id: 'KOR', name: 'South Korea', region: 'Asia', topTeams: ['Jeonbuk Hyundai', 'Ulsan Hyundai', 'FC Seoul'] },
  { id: 'INA', name: 'Indonesia', region: 'Asia', topTeams: ['Persib Bandung', 'Persija Jakarta', 'Bali United', 'Persebaya', 'Arema FC'] },
  { id: 'KSA', name: 'Saudi Arabia', region: 'Asia', topTeams: ['Al Hilal', 'Al Nassr', 'Al Ittihad', 'Al Ahli'] },
  // Amerika Utara
  { id: 'USA', name: 'United States', region: 'NorthAmerica', topTeams: ['Inter Miami', 'LA Galaxy', 'Los Angeles FC', 'Seattle Sounders'] },
  { id: 'MEX', name: 'Mexico', region: 'NorthAmerica', topTeams: ['Club America', 'Chivas', 'Monterrey', 'Cruz Azul'] },
  // Afrika
  { id: 'EGY', name: 'Egypt', region: 'Africa', topTeams: ['Al Ahly', 'Zamalek'] },
  { id: 'RSA', name: 'South Africa', region: 'Africa', topTeams: ['Mamelodi Sundowns', 'Kaizer Chiefs', 'Orlando Pirates'] },
  { id: 'MAR', name: 'Morocco', region: 'Africa', topTeams: ['Wydad AC', 'Raja CA'] }
];

// Generate sisa negara dunia (total 210 negara FIFA)
const genericNations = [
  'Albania', 'Algeria', 'Andorra', 'Angola', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 
  'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 
  'Botswana', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 
  'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 
  'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 
  'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'Gabon', 'Gambia', 'Georgia', 'Ghana', 'Greece', 'Grenada', 'Guam', 'Guatemala', 
  'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary', 'Iceland', 'India', 'Iran', 'Iraq', 
  'Ireland', 'Israel', 'Ivory Coast', 'Jamaica', 'Jordan', 'Kazakhstan', 'Kenya', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 
  'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Macau', 'Madagascar', 'Malawi', 
  'Malaysia', 'Maldives', 'Mali', 'Malta', 'Mauritania', 'Mauritius', 'Moldova', 'Mongolia', 'Montenegro', 'Mozambique', 
  'Myanmar', 'Namibia', 'Nepal', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Northern Ireland', 
  'Norway', 'Oman', 'Pakistan', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 
  'Puerto Rico', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'San Marino', 'Scotland', 'Senegal', 'Serbia', 'Seychelles', 
  'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Somalia', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 
  'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Togo', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 
  'Uganda', 'Ukraine', 'United Arab Emirates', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Venezuela', 'Vietnam', 'Wales', 'Yemen', 'Zambia', 'Zimbabwe'
];

genericNations.forEach(nationName => {
  const code = nationName.substring(0, 3).toUpperCase();
  if (!worldNations.find(n => n.id === code || n.name === nationName)) {
    worldNations.push({
      id: code,
      name: nationName,
      region: 'Generic',
      topTeams: [`${nationName} City FC`, `Sporting ${nationName}`, `Real ${nationName}`, `${nationName} United`]
    });
  }
});

// ==========================================
// 2. NAME GENERATORS (BASED ON REGION)
// ==========================================
const names = {
  Europe: {
    first: ['John', 'Thomas', 'Kevin', 'Alex', 'David', 'Marcus', 'Lukas', 'Oliver'],
    last: ['Smith', 'Muller', 'Dubois', 'Silva', 'Rossi', 'Hansen', 'Olsen']
  },
  SouthAmerica: {
    first: ['Carlos', 'Juan', 'Diego', 'Mateo', 'Lucas', 'Thiago', 'Gabriel'],
    last: ['Garcia', 'Martinez', 'Rodriguez', 'Silva', 'Santos', 'Oliveira']
  },
  Asia: {
    first: ['Hiroshi', 'Kenji', 'Min-ho', 'Ji-hoon', 'Budi', 'Rizky', 'Ali', 'Mohammed'],
    last: ['Sato', 'Suzuki', 'Kim', 'Lee', 'Setiawan', 'Hidayat', 'Al-Dawsari']
  },
  Africa: {
    first: ['Emmanuel', 'Samuel', 'Musa', 'Kofi', 'Kwame', 'Amadou', 'Youssef'],
    last: ['Mensah', 'Diallo', 'Keita', 'Traore', 'Toure', 'Diop']
  },
  Generic: {
    first: ['Michael', 'Daniel', 'Paul', 'Chris', 'James', 'David'],
    last: ['Brown', 'Johnson', 'Williams', 'Jones', 'Davis']
  }
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const generatePlayerName = (region) => {
  const r = names[region] || names.Generic;
  return `${r.first[rand(0, r.first.length - 1)]} ${r.last[rand(0, r.last.length - 1)]}`;
};

// Top 2026 Players
const topWorldPlayers = [
  { name: 'Erling Haaland', team: 'Manchester City', pos: 'FWD', ovr: 92, pot: 95 },
  { name: 'Vinicius Jr', team: 'Real Madrid', pos: 'FWD', ovr: 91, pot: 94 },
  { name: 'Jude Bellingham', team: 'Real Madrid', pos: 'MID', ovr: 91, pot: 95 },
  { name: 'Kylian Mbappe', team: 'Real Madrid', pos: 'FWD', ovr: 93, pot: 94 },
  { name: 'Bukayo Saka', team: 'Arsenal', pos: 'FWD', ovr: 89, pot: 92 },
  { name: 'Lamine Yamal', team: 'Barcelona', pos: 'FWD', ovr: 87, pot: 96 },
  { name: 'Phil Foden', team: 'Manchester City', pos: 'MID', ovr: 89, pot: 92 },
  { name: 'Jamal Musiala', team: 'Bayern Munich', pos: 'MID', ovr: 89, pot: 94 },
  { name: 'Florian Wirtz', team: 'Bayer Leverkusen', pos: 'MID', ovr: 89, pot: 94 },
  { name: 'Lionel Messi', team: 'Inter Miami', pos: 'FWD', ovr: 88, pot: 88 },
  { name: 'Cristiano Ronaldo', team: 'Al Nassr', pos: 'FWD', ovr: 86, pot: 86 }
];

// ==========================================
// 3. MAIN GENERATOR
// ==========================================
console.log(`Generating 100% World Database for ${worldNations.length} Nations...`);

const leagues = [];
const teams = [];
const players = [];

let leagueIdCounter = 1;
let teamIdCounter = 1;
let playerIdCounter = 1;

worldNations.forEach(nation => {
  const leagueId = `L-${leagueIdCounter}`;
  
  leagues.push({
    id: leagueId,
    name: `${nation.name} Premier League`,
    nationId: nation.id,
    level: 1
  });

  // Basic teams logic (ensure minimum 10 teams per league)
  const clubNames = [...nation.topTeams];
  while(clubNames.length < 10) {
    clubNames.push(`${nation.name} Club ${clubNames.length + 1}`);
  }

  clubNames.forEach(teamName => {
    const teamId = `T-${teamIdCounter}`;
    
    // Determine stats based on region and top status
    let reputation = rand(30, 60);
    let transferBudget = rand(1000000, 10000000);
    
    if (['Europe'].includes(nation.region)) { reputation += 20; transferBudget *= 5; }
    if (nation.topTeams.includes(teamName)) { reputation += 15; transferBudget *= 3; }

    teams.push({
      id: teamId,
      name: teamName,
      shortName: teamName.substring(0, 3).toUpperCase(),
      nationId: nation.id,
      leagueId: leagueId,
      isNational: false,
      reputation: Math.min(100, reputation),
      stadium: `${teamName} Arena`,
      stadiumCapacity: rand(10000, 80000),
      transferBudget,
      wageBudget: transferBudget / 10
    });

    // Generate 20 players per team
    const positions = ['GK', 'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD'];
    
    positions.forEach(pos => {
      // Check real player
      const realPlayerIdx = topWorldPlayers.findIndex(tp => tp.team === teamName && tp.pos === pos);
      if (realPlayerIdx !== -1) {
        const tp = topWorldPlayers.splice(realPlayerIdx, 1)[0];
        players.push({
          id: `P-${playerIdCounter}`,
          name: tp.name,
          nationId: nation.id,
          age: rand(21, 35),
          position: tp.pos,
          overall: tp.ovr,
          potential: tp.pot,
          teamId: teamId,
          value: tp.ovr * rand(300000, 1000000),
          wage: tp.ovr * rand(5000, 20000)
        });
      } else {
        const age = rand(16, 38);
        const baseRating = Math.max(30, reputation - rand(5, 25));
        const potential = rand(baseRating, Math.min(99, baseRating + (30 - age)));
        
        players.push({
          id: `P-${playerIdCounter}`,
          name: generatePlayerName(nation.region),
          nationId: nation.id,
          age,
          position: pos,
          overall: baseRating,
          potential: potential,
          teamId: teamId,
          value: baseRating * rand(10000, 100000),
          wage: baseRating * rand(500, 3000)
        });
      }
      playerIdCounter++;
    });

    teamIdCounter++;
  });
  leagueIdCounter++;
});

// Output
const dbPath = path.join(__dirname, '..', '..', '..', 'public', 'database.json');
fs.writeFileSync(dbPath, JSON.stringify({ leagues, teams, players }));

console.log(`Success! Generated:`);
console.log(`- ${leagues.length} Leagues (Nations)`);
console.log(`- ${teams.length} Teams`);
console.log(`- ${players.length} Players`);
console.log(`Data saved to: ${dbPath}`);
