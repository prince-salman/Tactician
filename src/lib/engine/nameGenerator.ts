// Kumpulan nama-nama untuk berbagai region di dunia

const names = {
  europe: {
    first: ['Liam', 'Noah', 'Oliver', 'William', 'Elias', 'James', 'Benjamin', 'Lucas', 'Henry', 'Alexander', 'Sebastian', 'Jack', 'Daniel', 'Michael', 'David', 'Joseph', 'Samuel', 'Arthur', 'Leo', 'Max', 'Leon', 'Paul', 'Julian', 'Finn', 'Louis', 'Hugo', 'Gabriel', 'Anton', 'Oscar', 'Victor', 'Nils', 'Emil', 'Anders', 'Lars', 'Sven', 'Jens', 'Hans', 'Klaus', 'Stefan', 'Thomas', 'Marco', 'Luca', 'Matteo', 'Alessandro', 'Leonardo', 'Lorenzo', 'Giovanni', 'Andrea', 'Francesco', 'Antonio', 'Jean', 'Pierre', 'Luc', 'Antoine', 'Francois', 'Jacques', 'Nicolas', 'Julien', 'Bastien', 'Mathieu', 'Ivan', 'Dmitry', 'Sergey', 'Alexey', 'Mikhail', 'Andrey', 'Nikolay', 'Vladimir', 'Igor', 'Oleg'],
    last: ['Smith', 'Jones', 'Taylor', 'Brown', 'Williams', 'Wilson', 'Johnson', 'Davies', 'Robinson', 'Wright', 'Thompson', 'Evans', 'Walker', 'White', 'Roberts', 'Müller', 'Schmidt', 'Schneider', 'Fischer', 'Weber', 'Meyer', 'Wagner', 'Becker', 'Schulz', 'Hoffmann', 'Rossi', 'Russo', 'Ferrari', 'Esposito', 'Bianchi', 'Romano', 'Colombo', 'Ricci', 'Marino', 'Greco', 'Martin', 'Bernard', 'Dubois', 'Thomas', 'Robert', 'Richard', 'Petit', 'Durand', 'Leroy', 'Moreau', 'Ivanov', 'Smirnov', 'Kuznetsov', 'Popov', 'Sokolov', 'Lebedev', 'Kozlov', 'Novikov', 'Morozov', 'Petrov', 'Andersen', 'Nielsen', 'Hansen', 'Pedersen', 'Larsen', 'Jensen', 'Christensen', 'Sørensen']
  },
  latinAmerica: {
    first: ['Santiago', 'Mateo', 'Sebastián', 'Leonardo', 'Matías', 'Emiliano', 'Diego', 'Daniel', 'Miguel', 'Alexander', 'Alejandro', 'Jesús', 'Javier', 'Carlos', 'José', 'Juan', 'Luis', 'Pedro', 'Manuel', 'Jorge', 'Fernando', 'Ricardo', 'Roberto', 'Eduardo', 'Mario', 'Julio', 'Andrés', 'Pablo', 'Gabriel', 'Lucas', 'Thiago', 'Matheus', 'Enzo', 'Nicolas', 'Arthur', 'Bernardo', 'Gustavo', 'Rafael', 'João', 'Felipe', 'Victor'],
    last: ['García', 'Martínez', 'Rodríguez', 'López', 'González', 'Pérez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Rivera', 'Gómez', 'Díaz', 'Cruz', 'Morales', 'Ortiz', 'Gutiérrez', 'Chávez', 'Ruiz', 'Alvarez', 'Fernández', 'Silva', 'Santos', 'Oliveira', 'Souza', 'Rodrigues', 'Ferreira', 'Alves', 'Pereira', 'Lima', 'Gomes', 'Costa', 'Ribeiro', 'Martins', 'Carvalho', 'Almeida', 'Lopes', 'Soares', 'Fernandes']
  },
  africa: {
    first: ['Amadou', 'Moussa', 'Ibrahim', 'Mamadou', 'Oumar', 'Aliou', 'Samba', 'Demba', 'Papiss', 'Sadio', 'Kolo', 'Yaya', 'Didier', 'Salomon', 'Gervinho', 'Samuel', 'Emmanuel', 'Michael', 'Victor', 'Sunday', 'Kelechi', 'Wilfred', 'Ahmed', 'Mohamed', 'Mahmoud', 'Tarek', 'Hassan', 'Kwame', 'Kofi', 'Akwasi', 'Asamoah', 'Sulley', 'Michael'],
    last: ['Diop', 'Ndiaye', 'Fall', 'Gueye', 'Sow', 'Ba', 'Cisse', 'Traore', 'Toure', 'Keita', 'Kone', 'Diallo', 'Coulibaly', 'Diarra', 'Mendy', 'Camara', 'Odegbami', 'Okocha', 'Kanu', 'Martins', 'Mikel', 'Iwobi', 'Salah', 'Elneny', 'Trezeguet', 'Gyan', 'Ayew', 'Mensah', 'Essien', 'Appiah', 'Drogba', 'Kalou']
  },
  asia: {
    first: ['Hiroshi', 'Kenji', 'Taro', 'Yuki', 'Shinji', 'Takumi', 'Ji-Sung', 'Heung-Min', 'Tae-Yong', 'Min-Jae', 'Wei', 'Li', 'Hao', 'Zhi', 'Wu', 'Supachok', 'Chanathip', 'Teerasil', 'Ali', 'Mehdi', 'Sardar', 'Alireza', 'Omar', 'Fahad', 'Salem', 'Nawaf', 'Pratama', 'Asnawi', 'Witan', 'Egy', 'Rizky', 'Evan'],
    last: ['Suzuki', 'Takahashi', 'Tanaka', 'Watanabe', 'Ito', 'Yamamoto', 'Nakamura', 'Kobayashi', 'Kim', 'Lee', 'Park', 'Choi', 'Jeong', 'Kang', 'Wang', 'Li', 'Zhang', 'Liu', 'Chen', 'Yang', 'Songkrasin', 'Dangda', 'Jaided', 'Bunta', 'Daei', 'Mahdavikia', 'Karimi', 'Azmoun', 'Taremi', 'Al-Dawsari', 'Al-Muwallad', 'Al-Faraj', 'Arhan', 'Mangkualam', 'Sulaeman', 'Vikri', 'Ridho', 'Dimas']
  }
};

// Region mapper
function getRegion(nationId: string): 'europe' | 'latinAmerica' | 'africa' | 'asia' {
  if (!nationId) return 'europe';
  const n = nationId.toLowerCase();
  
  if (['brazil', 'argentina', 'colombia', 'mexico', 'uruguay', 'chile', 'peru', 'ecuador', 'paraguay', 'venezuela', 'bolivia'].includes(n)) {
    return 'latinAmerica';
  }
  if (['senegal', 'nigeria', 'egypt', 'ghana', 'ivory coast', "côte d'ivoire", 'morocco', 'algeria', 'cameroon', 'south africa', 'zimbabwe'].includes(n)) {
    return 'africa';
  }
  if (['japan', 'south korea', 'china pr', 'saudi arabia', 'iran', 'australia', 'thailand', 'indonesia', 'vietnam', 'india', 'uae', 'qatar'].includes(n)) {
    return 'asia';
  }
  // Default to europe
  return 'europe';
}

export function generateFMName(nationId: string): string {
  const region = getRegion(nationId);
  const firstPool = names[region].first;
  const lastPool = names[region].last;
  
  const first = firstPool[Math.floor(Math.random() * firstPool.length)];
  const last = lastPool[Math.floor(Math.random() * lastPool.length)];
  
  return `${first} ${last}`;
}

export function generateFMAge(type: 'youth' | 'senior'): number {
  if (type === 'youth') {
    // 16 to 18
    return 16 + Math.floor(Math.random() * 3);
  } else {
    // 16 to 36 with a bell curve around 24
    const rand = Math.random() + Math.random() + Math.random();
    return Math.floor(16 + (rand / 3) * 20);
  }
}
