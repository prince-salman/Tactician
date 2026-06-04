import fs from 'fs';
import path from 'path';
import { generateFMName } from '../engine/nameGenerator';
import { Player, Team, League } from '../../types';

import { NATIONS_211 } from './nations';

const firstNames = ["James", "John", "Robert", "Michael", "William", "David", "Richard", "Joseph", "Thomas", "Charles", "Leo", "Cristiano", "Kylian", "Erling", "Kevin", "Mohamed", "Virgil", "Harry"];
const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis", "Rodriguez", "Martinez", "Messi", "Ronaldo", "Mbappe", "Haaland", "De Bruyne", "Salah", "van Dijk", "Kane"];

const TRAITS: ('Professional' | 'Hothead' | 'Mercenary' | 'Loyal' | 'Ambitious' | 'Troublemaker')[] = ['Professional', 'Professional', 'Professional', 'Hothead', 'Mercenary', 'Loyal', 'Ambitious', 'Troublemaker'];

function generateName() {
  return `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function getConfederation(nation: string): 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC' {
  const n = nation.toLowerCase();
  
  const conmebol = ['argentina', 'bolivia', 'brasil', 'chili', 'ekuador', 'kolombia', 'paraguay', 'peru', 'uruguay', 'venezuela'];
  if (conmebol.includes(n)) return 'CONMEBOL';
  
  const concacaf = ['amerika serikat', 'kanada', 'meksiko', 'kosta rika', 'panama', 'honduras', 'el salvador', 'jamaika', 'haiti', 'kuba', 'trinidad dan tobago', 'guatemala', 'nikaragua', 'curacao', 'suriname', 'puerto riko', 'bermuda', 'bahama', 'barbados', 'belize', 'kepulauan cayman', 'dominika', 'republik dominika', 'grenada', 'guyana', 'montserrat', 'st. kitts dan nevis', 'st. lucia', 'st. vincent dan grenadines', 'kepulauan turks dan caicos', 'kepulauan virgin amerika serikat', 'kepulauan virgin britania raya', 'anguilla', 'antigua dan barbuda', 'aruba'];
  if (concacaf.includes(n)) return 'CONCACAF';
  
  const ofc = ['selandia baru', 'fiji', 'kepulauan solomon', 'kaledonia baru', 'tahiti', 'vanuatu', 'papua nugini', 'samoa', 'samoa amerika', 'tonga', 'kepulauan cook'];
  if (ofc.includes(n)) return 'OFC';
  
  const afc = ['afganistan', 'australia', 'arab saudi', 'bahrain', 'bangladesh', 'bhutan', 'brunei darussalam', 'china (tiongkok)', 'filipina', 'guam', 'hong kong', 'india', 'indonesia', 'irak', 'iran', 'jepang', 'kamboja', 'kazakhstan', 'kirgistan', 'korea selatan', 'korea utara', 'kuwait', 'laos', 'lebanon', 'makau', 'maladewa', 'malaysia', 'mongolia', 'myanmar', 'nepal', 'oman', 'pakistan', 'palestina', 'qatar', 'singapura', 'sri lanka', 'suriah', 'taiwan', 'tajikistan', 'thailand', 'timor leste', 'turkmenistan', 'uni emirat arab', 'uzbekistan', 'vietnam', 'yaman', 'yordania'];
  if (afc.includes(n)) return 'AFC';
  
  const caf = ['afrika selatan', 'aljazair', 'angola', 'benin', 'botswana', 'burkina faso', 'burundi', 'chad', 'djibouti', 'eritrea', 'eswatini', 'ethiopia', 'gabon', 'gambia', 'ghana', 'guinea', 'guinea khatulistiwa', 'guinea-bissau', 'kamerun', 'kenya', 'komoro', 'kongo', 'lesotho', 'liberia', 'libya', 'madagaskar', 'malawi', 'mali', 'maroko', 'mauritania', 'mauritius', 'mesir', 'mozambik', 'namibia', 'niger', 'nigeria', 'pantai gading', 'republik afrika tengah', 'republik demokratik kongo', 'rwanda', 'sao tome dan principe', 'senegal', 'seychelles', 'sierra leone', 'somalia', 'sudan', 'sudan selatan', 'tanjung verde', 'tanzania', 'togo', 'tunisia', 'uganda', 'zambia', 'zimbabwe'];
  if (caf.includes(n)) return 'CAF';
  
  // Default to UEFA for the rest (Europe)
  return 'UEFA';
}

const TEAMS_PER_LEAGUE = 16;
const SQUAD_SIZE = 25;

// City/Club name prefixes for generic generation
const PREFIXES = ["FC", "Sporting", "Real", "Atletico", "Dynamo", "Lokomotiv", "Racing", "United", "City", "Rovers", "Wanderers"];

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createPlayer(nationId: string, teamId: string, minOvr: number, maxOvr: number, ageReq?: 'SENIOR' | 'U23' | 'U19' | 'U17') {
  let minAge = 16;
  let maxAge = 38;
  if (ageReq === 'U17') { minAge = 16; maxAge = 17; }
  else if (ageReq === 'U19') { minAge = 17; maxAge = 19; }
  else if (ageReq === 'U23') { minAge = 19; maxAge = 23; }
  else if (ageReq === 'SENIOR') { minAge = 24; maxAge = 35; }

  const age = getRandomInt(minAge, maxAge);
  const ovr = getRandomInt(minOvr, maxOvr);
  const pot = getRandomInt(ovr, Math.min(ovr + 15, 99));
  const positions = ['GK', 'DEF', 'MID', 'FWD'];
  const pos = positions[Math.floor(Math.random() * positions.length)];
  
  const value = Math.floor(Math.pow(ovr, 3.5)); 
  const wage = Math.floor(value / 100);

  const trait = TRAITS[Math.floor(Math.random() * TRAITS.length)];

  return {
    id: `P-${generateId()}`,
    name: generateName(),
    nationId: nationId,
    age: age,
    position: pos,
    overall: ovr,
    potential: pot,
    teamId: teamId,
    value: value,
    wage: wage,
    trait: trait
  };
}

async function run() {
  console.log('Starting Global Database Generation (211 Nations)...');
  
  const db: {
    leagues: League[],
    teams: Team[],
    players: Player[]
  } = {
    leagues: [],
    teams: [],
    players: []
  };

  let totalPlayers = 0;
  let teamCounter = 0;

  for (const nation of NATIONS_211) {
    const nationId = nation.id;
    const confed = getConfederation(nationId);
    
    // 1. Create League & Cup
    const leagueId = `L-${generateId()}`;
    const cupId = `C-${generateId()}`;
    
    db.leagues.push({
      id: leagueId,
      name: `Liga Utama ${nation.name}`,
      nationId: nationId,
      confederation: confed,
      level: 1,
      isCup: false
    });
    
    db.leagues.push({
      id: cupId,
      name: `Piala ${nation.name}`,
      nationId: nationId,
      confederation: confed,
      level: 1,
      isCup: true
    });

    // 2. Create National Teams
    const nationalTeams: { cat: 'SENIOR'|'U23'|'U19'|'U17', name: string, short: string }[] = [
      { cat: 'SENIOR', name: `Timnas ${nation.name}`, short: nationId },
      { cat: 'U23', name: `Timnas U23 ${nation.name}`, short: `${nationId} U23` },
      { cat: 'U19', name: `Timnas U19 ${nation.name}`, short: `${nationId} U19` },
      { cat: 'U17', name: `Timnas U17 ${nation.name}`, short: `${nationId} U17` }
    ];

    for (const nt of nationalTeams) {
      const ntId = `NT-${generateId()}`;
      db.teams.push({
        id: ntId,
        name: nt.name,
        shortName: nt.short,
        nationId: nationId,
        leagueId: 'INTERNATIONAL', // No specific domestic league
        confederation: confed,
        isNational: true,
        nationalCategory: nt.cat,
        reputation: getRandomInt(4000, 9000),
        stadium: `National Stadium of ${nation.name}`,
        stadiumCapacity: getRandomInt(40000, 80000),
        transferBudget: 0,
        wageBudget: 0
      });

      for (let i = 0; i < 23; i++) {
         const player = createPlayer(nationId, ntId, 60, 85, nt.cat as 'SENIOR'|'U23'|'U19'|'U17');
         db.players.push(player as Player);
         totalPlayers++;
      }
    }

    // 3. Create Domestic Clubs
    for (let i = 1; i <= TEAMS_PER_LEAGUE; i++) {
      const prefix = PREFIXES[Math.floor(Math.random() * PREFIXES.length)];
      const clubName = `${prefix} ${nation.name} ${i}`;
      const clubId = `T-${teamCounter++}`;
      
      const reputation = getRandomInt(3000, 8500);
      const budget = Math.floor(reputation * 1000);

      db.teams.push({
        id: clubId,
        name: clubName,
        shortName: `${prefix.substring(0,3)} ${i}`,
        nationId: nationId,
        leagueId: leagueId,
        confederation: confed,
        isNational: false,
        reputation: reputation,
        stadium: `Stadium ${i} ${nation.name}`,
        stadiumCapacity: getRandomInt(10000, 60000),
        transferBudget: budget * 10,
        wageBudget: budget
      });

      // 4. Fill Clubs with players
      for (let p = 0; p < SQUAD_SIZE; p++) {
         const player = createPlayer(nationId, clubId, 55, 80);
         db.players.push(player as Player);
         totalPlayers++;
      }
    }
  }

  console.log(`Generated ${NATIONS_211.length} nations.`);
  console.log(`Generated ${db.leagues.length} competitions (Leagues & Cups).`);
  console.log(`Generated ${db.teams.length} teams (Clubs & National Teams).`);
  console.log(`Generated ${totalPlayers} players.`);

  const outputPath = path.join(__dirname, '../../../public/database.json');
  fs.writeFileSync(outputPath, JSON.stringify(db, null, 2));
  
  console.log(`Database saved to ${outputPath}`);
  console.log(`File size: ${(fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2)} MB`);
}

run().catch(console.error);
