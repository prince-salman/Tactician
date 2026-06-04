const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'public', 'database.json');

console.log('Memulai Ultimate Generic Naming Obfuscation...');

const colors = ['Red', 'Blue', 'White', 'Black', 'Green', 'Yellow', 'Purple', 'Orange', 'Cyan', 'Maroon'];
const animalMascots = ['Lions', 'Tigers', 'Eagles', 'Wolves', 'Bears', 'Panthers', 'Hawks', 'Falcons', 'Rhinos', 'Bulls'];
const genericSuffixes = ['FC', 'Athletic', 'United', 'City', 'Rovers', 'Wanderers', 'Sporting', 'Dynamo', 'Strikers', 'Kickers'];

// Hash string to number for deterministic pseudo-randomness
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

const generateUltimateTeamName = (oldName, nationId, reputation) => {
  if (!oldName) return 'Generic FC';
  
  const hash = hashCode(oldName);
  
  // Try to extract a city-like name (just take the first word if it's long enough, else generic)
  const words = oldName.replace(/FC|CF|Club|Real|Atletico|United|City|Sporting|Dynamo/gi, '').trim().split(' ');
  let baseWord = words.find(w => w.length >= 4) || words[0] || 'Metro';
  
  // Special override for very high reputation teams to mimic PES classic fake names
  if (reputation > 85) {
     const iconic = ['Merseyside', 'London', 'Manchester', 'Madrid', 'Catalunya', 'Bavaria', 'Piemonte', 'Lombardia', 'Parisien'];
     baseWord = iconic[hash % iconic.length];
  }
  
  const structureType = hash % 3;
  let newName = '';
  
  if (structureType === 0) {
    newName = `${baseWord} ${colors[hash % colors.length]}`;
  } else if (structureType === 1) {
    newName = `${baseWord} ${animalMascots[hash % animalMascots.length]}`;
  } else {
    newName = `${baseWord} ${genericSuffixes[hash % genericSuffixes.length]}`;
  }
  
  return newName;
};

const generateUltimateLeagueName = (oldName, nationId) => {
  if (!oldName) return 'Division 1';
  const hash = hashCode(oldName);
  const levels = ['Pro Division', 'Super League', 'Premiership', 'Division 1', 'Elite League'];
  const levelName = levels[hash % levels.length];
  
  if (nationId) {
    return `${nationId} ${levelName}`;
  }
  
  // Extract nation hint if available, else just generic
  const words = oldName.split(' ');
  const nationHint = words[0];
  return `${nationHint} ${levelName}`;
};

try {
  const dbData = fs.readFileSync(DB_PATH, 'utf8');
  const db = JSON.parse(dbData);

  // Proses Leagues
  db.leagues = db.leagues.map(l => ({
    ...l,
    name: generateUltimateLeagueName(l.name, l.nationId)
  }));

  // Proses Teams
  db.teams = db.teams.map(t => {
      const newName = generateUltimateTeamName(t.name, t.nationId, t.reputation);
      // Also generate a shortName
      const words = newName.split(' ');
      let shortName = words.length > 1 ? (words[0].substring(0,2) + words[1].substring(0,1)).toUpperCase() : newName.substring(0,3).toUpperCase();
      
      return {
          ...t,
          name: newName,
          shortName: shortName
      };
  });

  fs.writeFileSync(DB_PATH, JSON.stringify(db));
  console.log('✅ Ultimate Obfuscation Selesai! Semua nama klub dan liga kini 100% generik.');

} catch (error) {
  console.error('Gagal melakukan obfuscation:', error);
}
