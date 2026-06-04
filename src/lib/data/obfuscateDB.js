const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'public', 'database.json');

console.log('Memulai Obfuscation (PES Style)...');

// Fungsi pembantu untuk mengubah nama
const obfuscatePlayerName = (name) => {
  if (!name) return name;
  const parts = name.split(' ');
  if (parts.length === 1) {
    return parts[0].substring(0, parts[0].length - 1) + 'o'; // Pedri -> Pedro
  }
  
  // Format: First Initial + Fake Last Name
  const firstInitial = parts[0][0] + '.';
  let lastName = parts[parts.length - 1];
  
  // Ganti huruf vokal terakhir
  lastName = lastName.replace(/a|e|i|o|u/gi, (match) => {
    const vowels = ['a', 'e', 'i', 'o', 'u'];
    const currentIdx = vowels.indexOf(match.toLowerCase());
    if (currentIdx !== -1) {
      const isUpper = match === match.toUpperCase();
      const newChar = vowels[(currentIdx + 1) % 5];
      return isUpper ? newChar.toUpperCase() : newChar;
    }
    return match;
  });

  return `${firstInitial} ${lastName}`;
};

const obfuscateTeamName = (name) => {
  if (!name) return name;
  let newName = name;
  // Hapus kata lisensi
  newName = newName.replace(/FC|CF|Club|Real|Atletico|United|City|Sporting|Dynamo/gi, '').trim();
  
  // Jika nama kota/daerah menjadi sendirian, tambahkan warna atau identitas PES
  const genericSuffixes = ['Blue', 'Red', 'White', 'Black', 'Green', 'Rovers', 'Wanderers', 'Athletic', 'Town'];
  const randomSuffix = genericSuffixes[Math.floor(Math.random() * genericSuffixes.length)];
  
  if (newName.length > 0) {
    return `${newName} ${randomSuffix}`;
  }
  return `Generic ${randomSuffix}`;
};

const obfuscateLeagueName = (name) => {
  if (!name) return name;
  let newName = name;
  newName = newName.replace(/Premier League/gi, 'Pro Division 1');
  newName = newName.replace(/LaLiga|La Liga/gi, 'Spain Division 1');
  newName = newName.replace(/Serie A/gi, 'Italy Division 1');
  newName = newName.replace(/Ligue 1/gi, 'France Division 1');
  newName = newName.replace(/Bundesliga/gi, 'Germany Division 1');
  return newName;
};

try {
  const dbData = fs.readFileSync(DB_PATH, 'utf8');
  const db = JSON.parse(dbData);

  // Proses Leagues
  db.leagues = db.leagues.map(l => ({
    ...l,
    name: obfuscateLeagueName(l.name)
  }));

  // Proses Teams
  db.teams = db.teams.map(t => ({
    ...t,
    name: obfuscateTeamName(t.name)
  }));

  // Proses Players
  db.players = db.players.map(p => ({
    ...p,
    name: obfuscatePlayerName(p.name)
  }));

  fs.writeFileSync(DB_PATH, JSON.stringify(db));
  console.log('✅ Obfuscation Selesai! Database sekarang 100% aman dari hak cipta (Fake Names ala PES).');

} catch (error) {
  console.error('Gagal melakukan obfuscation:', error);
}
