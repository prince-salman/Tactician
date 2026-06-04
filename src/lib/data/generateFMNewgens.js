const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', '..', '..', 'public', 'database.json');

const names = {
  europe: {
    first: ['Liam', 'Noah', 'Oliver', 'William', 'Elias', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Sebastian', 'Jack', 'Daniel', 'Michael', 'David', 'Joseph', 'Samuel', 'Arthur', 'Leo', 'Max', 'Leon', 'Paul', 'Julian', 'Finn', 'Louis', 'Hugo', 'Gabriel', 'Anton', 'Oscar', 'Victor', 'Nils', 'Emil', 'Anders', 'Lars', 'Sven', 'Jens', 'Hans', 'Klaus', 'Stefan', 'Thomas', 'Marco', 'Luca', 'Matteo', 'Alessandro', 'Leonardo', 'Lorenzo', 'Giovanni', 'Andrea', 'Francesco', 'Antonio', 'Jean', 'Pierre', 'Luc', 'Antoine', 'Francois', 'Jacques', 'Nicolas', 'Julien', 'Bastien', 'Mathieu', 'Ivan', 'Dmitry', 'Sergey', 'Alexey', 'Mikhail', 'Andrey', 'Nikolay', 'Vladimir', 'Igor', 'Oleg', 'Jan', 'Kacper', 'Bartosz', 'Kamil'],
    last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Petrov', 'Andersen', 'Nielsen', 'Hansen', 'Pedersen', 'Larsen', 'Jensen', 'Christensen', 'Sørensen', 'Kowalski', 'Novak', 'Horvath']
  },
  latinAmerica: {
    first: ['Santiago', 'Mateo', 'Sebastián', 'Leonardo', 'Matías', 'Emiliano', 'Diego', 'Daniel', 'Miguel', 'Alexander', 'Alejandro', 'Jesús', 'Javier', 'Carlos', 'José', 'Juan', 'Luis', 'Pedro', 'Manuel', 'Jorge', 'Fernando', 'Ricardo', 'Roberto', 'Eduardo', 'Mario', 'Julio', 'Andrés', 'Pablo', 'Gabriel', 'Lucas', 'Thiago', 'Matheus', 'Enzo', 'Nicolas', 'Arthur', 'Bernardo', 'Gustavo', 'Rafael', 'João', 'Felipe', 'Victor', 'Esteban', 'Hernan', 'Gonzalo', 'Ramon', 'Cristian'],
    last: ['García', 'Martínez', 'Rodríguez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ruiz', 'Alvarez', 'Fernández', 'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes', 'Rojas', 'Mendoza', 'Iglesias', 'Navarro', 'Delgado', 'Vargas']
  },
  africa: {
    first: ['Amadou', 'Moussa', 'Ibrahim', 'Mamadou', 'Oumar', 'Aliou', 'Samba', 'Demba', 'Papiss', 'Sadio', 'Kolo', 'Yaya', 'Didier', 'Salomon', 'Gervinho', 'Samuel', 'Emmanuel', 'Michael', 'Victor', 'Sunday', 'Kelechi', 'Wilfred', 'Ahmed', 'Mohamed', 'Mahmoud', 'Tarek', 'Hassan', 'Kwame', 'Kofi', 'Akwasi', 'Asamoah', 'Sulley', 'Sipho', 'Thabo', 'Siyabonga', 'Bongani', 'Dumisani'],
    last: ['Diop', 'Ndiaye', 'Fall', 'Gueye', 'Sow', 'Ba', 'Cisse', 'Traore', 'Toure', 'Keita', 'Kone', 'Diallo', 'Coulibaly', 'Diarra', 'Mendy', 'Camara', 'Odegbami', 'Okocha', 'Kanu', 'Martins', 'Mikel', 'Iwobi', 'Salah', 'Elneny', 'Trezeguet', 'Gyan', 'Ayew', 'Mensah', 'Essien', 'Appiah', 'Drogba', 'Kalou', 'Khumalo', 'Mokoena', 'Tshabalala', 'Ndlovu']
  },
  asia: {
    first: ['Hiroshi', 'Kenji', 'Taro', 'Yuki', 'Shinji', 'Takumi', 'Ji-Sung', 'Heung-Min', 'Tae-Yong', 'Min-Jae', 'Wei', 'Li', 'Hao', 'Zhi', 'Wu', 'Supachok', 'Chanathip', 'Teerasil', 'Ali', 'Mehdi', 'Sardar', 'Alireza', 'Omar', 'Fahad', 'Salem', 'Nawaf', 'Pratama', 'Asnawi', 'Witan', 'Egy', 'Rizky', 'Evan', 'Rohan', 'Arjun', 'Rahul', 'Aditya'],
    last: ['Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kim', 'Lee', 'Park', 'Choi', 'Jeong', 'Kang', 'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Songkrasin', 'Dangda', 'Jaided', 'Bunta', 'Daei', 'Mahdavikia', 'Karimi', 'Azmoun', 'Taremi', 'Al-Dawsari', 'Al-Muwallad', 'Al-Faraj', 'Arhan', 'Mangkualam', 'Sulaeman', 'Vikri', 'Ridho', 'Dimas', 'Singh', 'Sharma', 'Patel', 'Kumar']
  }
};

function getRegion(nationId) {
  if (!nationId) return 'europe';
  const n = nationId.toLowerCase();
  
  if (['brazil', 'argentina', 'colombia', 'mexico', 'uruguay', 'chile', 'peru', 'ecuador', 'paraguay', 'venezuela', 'bolivia', 'costa rica', 'panama', 'honduras'].includes(n)) {
    return 'latinAmerica';
  }
  if (['senegal', 'nigeria', 'egypt', 'ghana', 'ivory coast', "côte d'ivoire", 'morocco', 'algeria', 'cameroon', 'south africa', 'zimbabwe', 'mali', 'tunisia', 'dr congo'].includes(n)) {
    return 'africa';
  }
  if (['japan', 'south korea', 'korea republic', 'china pr', 'saudi arabia', 'iran', 'australia', 'thailand', 'indonesia', 'vietnam', 'india', 'uae', 'qatar', 'iraq', 'syria', 'uzbekistan'].includes(n)) {
    return 'asia';
  }
  return 'europe';
}

function generateFMName(nationId) {
  const region = getRegion(nationId);
  const firstPool = names[region].first;
  const lastPool = names[region].last;
  
  const first = firstPool[Math.floor(Math.random() * firstPool.length)];
  const last = lastPool[Math.floor(Math.random() * lastPool.length)];
  
  return `${first} ${last}`;
}

function generateFMAge() {
  // Bell curve distribution around age 24
  const rand = Math.random() + Math.random() + Math.random();
  // rand is between 0 and 3, average 1.5
  return Math.floor(16 + (rand / 3) * 20); // 16 to 36
}

console.log('Mereset seluruh pemain ke FM Newgen System...');

try {
  const dbData = fs.readFileSync(DB_PATH, 'utf8');
  const db = JSON.parse(dbData);

  db.players = db.players.map(p => {
      return {
          ...p,
          name: generateFMName(p.nationId),
          age: generateFMAge()
      };
  });

  fs.writeFileSync(DB_PATH, JSON.stringify(db));
  console.log(`✅ FM Newgen Overhaul selesai! Total ${db.players.length} pemain telah diganti nama aslinya dan diregenerasi umurnya.`);

} catch (error) {
  console.error('Gagal menjalankan FM Newgen System:', error);
}
