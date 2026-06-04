const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const CSV_PATH = path.join(__dirname, '..', '..', '..', 'players_22.csv');
const DB_PATH = path.join(__dirname, '..', '..', '..', 'public', 'database.json');

const leaguesMap = new Map();
const teamsMap = new Map();
const players = [];

let playerIdCounter = 1;

console.log('Memulai parsing CSV...');

// Pemetaan Posisi FIFA ke Posisi Game (GK, DEF, MID, FWD)
const mapPosition = (fifaPosStr) => {
  if (!fifaPosStr) return 'MID';
  const pos = fifaPosStr.split(',')[0].trim();
  if (['GK'].includes(pos)) return 'GK';
  if (['CB', 'RB', 'LB', 'RWB', 'LWB'].includes(pos)) return 'DEF';
  if (['CM', 'CDM', 'CAM', 'RM', 'LM'].includes(pos)) return 'MID';
  if (['ST', 'CF', 'RW', 'LW'].includes(pos)) return 'FWD';
  return 'MID';
};

fs.createReadStream(CSV_PATH)
  .pipe(csv())
  .on('data', (row) => {
    // Abaikan jika tidak punya klub
    if (!row.club_name || row.club_name.trim() === '') return;
    if (!row.league_name || row.league_name.trim() === '') return;

    const leagueName = row.league_name.trim();
    const clubName = row.club_name.trim();

    // 1. Proses Liga
    if (!leaguesMap.has(leagueName)) {
      leaguesMap.set(leagueName, {
        id: `L-${leaguesMap.size + 1}`,
        name: leagueName,
        nationId: row.nationality_name || 'INT',
        level: parseInt(row.league_level) || 1
      });
    }
    const league = leaguesMap.get(leagueName);

    // 2. Proses Tim
    if (!teamsMap.has(clubName)) {
      teamsMap.set(clubName, {
        id: `T-${teamsMap.size + 1}`,
        name: clubName,
        shortName: clubName.substring(0, 3).toUpperCase(),
        nationId: row.nationality_name || 'INT',
        leagueId: league.id,
        isNational: false,
        reputation: parseInt(row.overall) || 50, // Akan diupdate nanti berdasarkan rata-rata pemain
        stadium: `${clubName} Stadium`,
        stadiumCapacity: 40000,
        transferBudget: (parseInt(row.value_eur) || 1000000) * 10,
        wageBudget: (parseInt(row.wage_eur) || 10000) * 50
      });
    }
    const team = teamsMap.get(clubName);

    // Update reputasi tim jika ada pemain bintang
    const ovr = parseInt(row.overall) || 50;
    if (ovr > team.reputation) team.reputation = ovr;

    // 3. Proses Pemain
    // Umur ditambah 4 karena CSV dari 2022 -> Target Game 2026
    const age2022 = parseInt(row.age) || 20;
    const age2026 = age2022 + 4;
    
    // Potensi juga disesuaikan jika sudah terlalu tua
    let potential = parseInt(row.potential) || 50;
    if (age2026 > 30) potential = ovr; 

    players.push({
      id: `P-${playerIdCounter++}`,
      name: row.short_name,
      nationId: row.nationality_name,
      age: age2026,
      position: mapPosition(row.player_positions),
      overall: ovr,
      potential: potential,
      teamId: team.id,
      value: parseInt(row.value_eur) || 0,
      wage: parseInt(row.wage_eur) || 0
    });
  })
  .on('end', () => {
    console.log('Selesai membaca CSV!');
    
    const leagues = Array.from(leaguesMap.values());
    const teams = Array.from(teamsMap.values());

    const db = { leagues, teams, players };
    
    fs.writeFileSync(DB_PATH, JSON.stringify(db));
    
    console.log(`[SUCCESS] Database 100% Asli Berhasil Dibuat!`);
    console.log(`- ${leagues.length} Liga`);
    console.log(`- ${teams.length} Klub`);
    console.log(`- ${players.length} Pemain Asli (Proyeksi 2026)`);
  });
