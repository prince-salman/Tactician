const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

// ==========================================
// PENGATURAN BOT
// ==========================================
// Ubah MAX_PAGES ke 999 jika Anda ingin men-scrape semua tim di dunia.
// Untuk pengujian awal, kita set 1 halaman saja (berisi ~60 tim top dunia).
const MAX_PAGES = 1; 
const DELAY_MS = 2000; // Jeda 2 detik agar IP tidak diblokir SoFIFA

const BASE_URL = 'https://sofifa.com';
const DB_PATH = path.join(__dirname, '..', '..', '..', 'public', 'database.json');

// Utils
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const parseRating = (text) => {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : 50;
};

// ==========================================
// FUNGSI SCRAPING
// ==========================================

async function fetchHtml(url) {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    return cheerio.load(data);
  } catch (error) {
    console.error(`Gagal mengambil ${url}:`, error.message);
    return null;
  }
}

async function scrapeTeams() {
  console.log(`[1] Memulai Scraping Data Tim... (Target: ${MAX_PAGES} Halaman)`);
  const teams = [];
  
  for (let page = 1; page <= MAX_PAGES; page++) {
    const offset = (page - 1) * 60;
    const url = `${BASE_URL}/teams?offset=${offset}`;
    console.log(`Mengambil Halaman Tim ${page}...`);
    
    const $ = await fetchHtml(url);
    if (!$) break;

    $('tbody tr').each((_, element) => {
      const nameEl = $(element).find('td:nth-child(2) a');
      const teamName = nameEl.text().trim();
      const teamHref = nameEl.attr('href');
      
      const ovr = parseRating($(element).find('td:nth-child(3)').text());
      const atk = parseRating($(element).find('td:nth-child(4)').text());
      const mid = parseRating($(element).find('td:nth-child(5)').text());
      const def = parseRating($(element).find('td:nth-child(6)').text());
      const budgetText = $(element).find('td:nth-child(7)').text().trim();
      
      // Hitung budget
      let transferBudget = 1000000;
      if (budgetText.includes('M')) {
        transferBudget = parseFloat(budgetText.replace('€', '').replace('M', '')) * 1000000;
      } else if (budgetText.includes('K')) {
        transferBudget = parseFloat(budgetText.replace('€', '').replace('K', '')) * 1000;
      }

      if (teamName && teamHref) {
        teams.push({
          id: teamHref.split('/')[2], // Ambil ID dari URL /team/10/manchester-city/
          name: teamName,
          shortName: teamName.substring(0, 3).toUpperCase(),
          url: `${BASE_URL}${teamHref}`,
          nationId: 'INT', // Sementara diset INT
          leagueId: 'L-1', // League mapper akan lebih kompleks untuk versi full
          isNational: teamName.includes('National'),
          reputation: ovr,
          stadium: `${teamName} Stadium`,
          stadiumCapacity: ovr * 500,
          transferBudget: transferBudget,
          wageBudget: transferBudget / 10
        });
      }
    });
    
    await sleep(DELAY_MS);
  }
  
  console.log(`Berhasil mendapatkan ${teams.length} tim asli!`);
  return teams;
}

async function scrapePlayersForTeam(team) {
  console.log(`[2] Scraping Skuad: ${team.name}...`);
  const players = [];
  const $ = await fetchHtml(team.url);
  
  if (!$) return players;

  // SoFIFA table untuk pemain
  $('table.table.table-hover.persist-area tbody tr').each((_, element) => {
    // Lewati baris yang bukan pemain (seperti baris on-loan atau reserves kadang beda struktur)
    const nameEl = $(element).find('td:nth-child(2) a:first-child');
    const playerName = nameEl.text().trim();
    if (!playerName) return;

    // Ambil rating
    const overall = parseRating($(element).find('td:nth-child(4)').text());
    const potential = parseRating($(element).find('td:nth-child(5)').text());
    
    // Ambil Umur
    const age = parseRating($(element).find('td:nth-child(3)').text());
    
    // Posisi
    const pos = $(element).find('td:nth-child(2) span.pos').first().text().trim();
    let mappedPos = 'MID';
    if (['GK'].includes(pos)) mappedPos = 'GK';
    else if (['CB', 'RB', 'LB', 'RWB', 'LWB'].includes(pos)) mappedPos = 'DEF';
    else if (['CM', 'CDM', 'CAM', 'RM', 'LM'].includes(pos)) mappedPos = 'MID';
    else if (['ST', 'CF', 'RW', 'LW'].includes(pos)) mappedPos = 'FWD';

    players.push({
      id: `P-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: playerName,
      nationId: 'INT',
      age: age || 25,
      position: mappedPos,
      overall: overall || 50,
      potential: potential || 50,
      teamId: team.id,
      value: (overall || 50) * 100000,
      wage: (overall || 50) * 1000
    });
  });

  return players;
}

async function runScraper() {
  const teams = await scrapeTeams();
  let allPlayers = [];
  
  // Scrape pemain untuk setiap tim yang didapat
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const squad = await scrapePlayersForTeam(team);
    allPlayers = allPlayers.concat(squad);
    
    // Hindari rate-limit
    await sleep(DELAY_MS);
  }

  console.log(`[3] Proses Scraping Selesai! Total Pemain: ${allPlayers.length}`);
  
  // Buat 1 League dummy untuk menampung semua klub ini
  const leagues = [{
    id: 'L-1',
    name: 'Global Real League',
    nationId: 'INT',
    level: 1
  }];

  const db = { leagues, teams, players: allPlayers };
  fs.writeFileSync(DB_PATH, JSON.stringify(db));
  console.log(`[SUCCESS] Database 100% Asli berhasil disimpan di: ${DB_PATH}`);
}

// Mulai Bot
runScraper();
