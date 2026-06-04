const fs = require('fs');

const generateRealDatabase = () => {
  const leagues = [
    { id: 'L-1', name: 'Premier League', nationId: 'ENG', level: 1 },
    { id: 'L-2', name: 'La Liga', nationId: 'ESP', level: 1 },
    { id: 'L-3', name: 'Serie A', nationId: 'ITA', level: 1 },
    { id: 'L-4', name: 'Bundesliga', nationId: 'GER', level: 1 },
    { id: 'L-5', name: 'Ligue 1', nationId: 'FRA', level: 1 },
    { id: 'L-6', name: 'Liga 1', nationId: 'INA', level: 1 },
  ];

  const teamsData = [
    // Premier League
    { league: 'L-1', teams: ['Arsenal', 'Aston Villa', 'Bournemouth', 'Brentford', 'Brighton', 'Chelsea', 'Crystal Palace', 'Everton', 'Fulham', 'Liverpool', 'Luton Town', 'Manchester City', 'Manchester United', 'Newcastle United', 'Nottingham Forest', 'Sheffield United', 'Tottenham Hotspur', 'West Ham United', 'Wolverhampton', 'Burnley'] },
    // La Liga
    { league: 'L-2', teams: ['Real Madrid', 'Barcelona', 'Atletico Madrid', 'Girona', 'Athletic Club', 'Real Sociedad', 'Real Betis', 'Valencia', 'Villarreal', 'Getafe', 'Osasuna', 'Alaves', 'Sevilla', 'Rayo Vallecano', 'Las Palmas', 'Mallorca', 'Celta Vigo', 'Cadiz', 'Granada', 'Almeria'] },
    // Serie A
    { league: 'L-3', teams: ['Inter Milan', 'AC Milan', 'Juventus', 'Bologna', 'Roma', 'Atalanta', 'Lazio', 'Napoli', 'Torino', 'Fiorentina', 'Monza', 'Genoa', 'Lecce', 'Udinese', 'Hellas Verona', 'Cagliari', 'Empoli', 'Frosinone', 'Sassuolo', 'Salernitana'] },
    // Bundesliga (18 teams)
    { league: 'L-4', teams: ['Bayer Leverkusen', 'Bayern Munich', 'VfB Stuttgart', 'RB Leipzig', 'Borussia Dortmund', 'Eintracht Frankfurt', 'Freiburg', 'Hoffenheim', 'Heidenheim', 'Werder Bremen', 'Augsburg', 'VfL Wolfsburg', 'Mainz 05', 'Borussia Monchengladbach', 'Union Berlin', 'VfL Bochum', 'FC Koln', 'Darmstadt 98'] },
    // Ligue 1 (18 teams)
    { league: 'L-5', teams: ['Paris Saint-Germain', 'Monaco', 'Brest', 'Lille', 'Nice', 'Lyon', 'Lens', 'Marseille', 'Rennes', 'Toulouse', 'Reims', 'Montpellier', 'Strasbourg', 'Nantes', 'Le Havre', 'Metz', 'Lorient', 'Clermont'] },
    // Liga 1
    { league: 'L-6', teams: ['Persib Bandung', 'Persija Jakarta', 'Bali United', 'Borneo FC', 'Persebaya', 'PSM Makassar', 'Arema FC', 'Madura United', 'PSIS Semarang', 'Persis Solo', 'Persik Kediri', 'Dewa United', 'Bhayangkara FC', 'Persita', 'PSS Sleman', 'RANS Nusantara', 'Persikabo', 'Barito Putera'] },
  ];

  const topPlayers = [
    { name: 'Erling Haaland', team: 'Manchester City', pos: 'FWD', ovr: 92, pot: 95 },
    { name: 'Kevin De Bruyne', team: 'Manchester City', pos: 'MID', ovr: 91, pot: 91 },
    { name: 'Rodri', team: 'Manchester City', pos: 'MID', ovr: 90, pot: 91 },
    { name: 'Phil Foden', team: 'Manchester City', pos: 'FWD', ovr: 88, pot: 92 },
    { name: 'Bukayo Saka', team: 'Arsenal', pos: 'FWD', ovr: 88, pot: 91 },
    { name: 'Martin Odegaard', team: 'Arsenal', pos: 'MID', ovr: 88, pot: 90 },
    { name: 'William Saliba', team: 'Arsenal', pos: 'DEF', ovr: 87, pot: 91 },
    { name: 'Mohamed Salah', team: 'Liverpool', pos: 'FWD', ovr: 90, pot: 90 },
    { name: 'Virgil van Dijk', team: 'Liverpool', pos: 'DEF', ovr: 89, pot: 89 },
    { name: 'Jude Bellingham', team: 'Real Madrid', pos: 'MID', ovr: 90, pot: 95 },
    { name: 'Vinicius Jr', team: 'Real Madrid', pos: 'FWD', ovr: 90, pot: 94 },
    { name: 'Kylian Mbappe', team: 'Real Madrid', pos: 'FWD', ovr: 92, pot: 94 }, // 2026 realistic
    { name: 'Lamine Yamal', team: 'Barcelona', pos: 'FWD', ovr: 85, pot: 95 },
    { name: 'Pedri', team: 'Barcelona', pos: 'MID', ovr: 87, pot: 92 },
    { name: 'Harry Kane', team: 'Bayern Munich', pos: 'FWD', ovr: 91, pot: 91 },
    { name: 'Jamal Musiala', team: 'Bayern Munich', pos: 'MID', ovr: 88, pot: 93 },
    { name: 'Florian Wirtz', team: 'Bayer Leverkusen', pos: 'MID', ovr: 88, pot: 93 },
    { name: 'Lautaro Martinez', team: 'Inter Milan', pos: 'FWD', ovr: 89, pot: 90 },
    { name: 'Rafael Leao', team: 'AC Milan', pos: 'FWD', ovr: 87, pot: 91 },
    { name: 'Victor Osimhen', team: 'Napoli', pos: 'FWD', ovr: 88, pot: 90 },
    { name: 'Gianluigi Donnarumma', team: 'Paris Saint-Germain', pos: 'GK', ovr: 88, pot: 91 },
    { name: 'Marc Klok', team: 'Persib Bandung', pos: 'MID', ovr: 72, pot: 72 },
    { name: 'Rizky Ridho', team: 'Persija Jakarta', pos: 'DEF', ovr: 70, pot: 78 },
  ];

  const firstNames = ['John', 'David', 'Chris', 'James', 'Daniel', 'Paul', 'Luis', 'Carlos', 'Jose', 'Juan', 'Diego', 'Lucas', 'Budi', 'Andi', 'Rizky', 'Aditya', 'Thomas', 'Kevin', 'Alex'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Garcia', 'Martinez', 'Rodriguez', 'Lopez', 'Gonzalez', 'Silva', 'Santos', 'Setiawan', 'Hidayat', 'Muller', 'Schmidt', 'Dubois', 'Leroy'];

  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

  const teams = [];
  const players = [];
  let teamIdCounter = 1;
  let playerIdCounter = 1;

  teamsData.forEach(leagueData => {
    const leagueId = leagueData.league;
    const leagueInfo = leagues.find(l => l.id === leagueId);
    
    leagueData.teams.forEach(teamName => {
      const teamId = `T-${teamIdCounter}`;
      
      let reputation = rand(60, 80);
      let transferBudget = rand(10000000, 50000000);
      
      // Buff top teams
      if (['Real Madrid', 'Manchester City', 'Bayern Munich', 'Arsenal', 'Liverpool', 'Paris Saint-Germain'].includes(teamName)) {
        reputation = rand(90, 99);
        transferBudget = rand(100000000, 250000000);
      } else if (leagueInfo.nationId === 'INA') {
        reputation = rand(30, 50);
        transferBudget = rand(500000, 2000000);
      }

      teams.push({
        id: teamId,
        name: teamName,
        shortName: teamName.substring(0, 3).toUpperCase(),
        nationId: leagueInfo.nationId,
        leagueId: leagueId,
        isNational: false,
        reputation,
        stadium: `${teamName} Stadium`,
        stadiumCapacity: rand(20000, 80000),
        transferBudget,
        wageBudget: transferBudget / 10,
      });

      // Generate Squad
      const positions = ['GK', 'GK', 'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD', 'FWD'];
      
      positions.forEach(pos => {
        // Check if top player exists for this team and position
        const topPlayerIdx = topPlayers.findIndex(tp => tp.team === teamName && tp.pos === pos);
        let player = null;
        
        if (topPlayerIdx !== -1) {
          const tp = topPlayers.splice(topPlayerIdx, 1)[0];
          player = {
            id: `P-${playerIdCounter}`,
            name: tp.name,
            nationId: leagueInfo.nationId,
            age: rand(20, 32),
            position: tp.pos,
            overall: tp.ovr,
            potential: tp.pot,
            teamId: teamId,
            value: tp.ovr * rand(200000, 800000),
            wage: tp.ovr * rand(2000, 8000),
          };
        } else {
          // Generate generic player with stats matching team reputation
          const age = rand(16, 36);
          const baseRating = Math.max(40, reputation - rand(5, 20));
          const potential = rand(baseRating, Math.min(99, baseRating + (30 - age)));
          
          player = {
            id: `P-${playerIdCounter}`,
            name: `${firstNames[rand(0, firstNames.length - 1)]} ${lastNames[rand(0, lastNames.length - 1)]}`,
            nationId: leagueInfo.nationId,
            age,
            position: pos,
            overall: baseRating,
            potential: potential,
            teamId: teamId,
            value: baseRating * rand(100000, 400000),
            wage: baseRating * rand(1000, 4000),
          };
        }
        
        players.push(player);
        playerIdCounter++;
      });
      teamIdCounter++;
    });
  });

  const db = { leagues, teams, players };
  fs.writeFileSync('database.json', JSON.stringify(db));
  console.log('Database successfully generated at database.json');
};

generateRealDatabase();
