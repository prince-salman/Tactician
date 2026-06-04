export interface Player {
  id: string;
  name: string;
  nationId: string;
  age: number;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  overall: number;
  potential: number;
  teamId?: string;
  value: number;
  wage: number;
  trait: 'Professional' | 'Hothead' | 'Mercenary' | 'Loyal' | 'Ambitious' | 'Troublemaker';
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  nationId: string;
  leagueId: string;
  confederation?: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC';
  subConfederation?: string;
  isNational: boolean;
  nationalCategory?: 'SENIOR' | 'U23' | 'U19' | 'U17';
  reputation: number;
  stadium: string;
  stadiumCapacity: number;
  transferBudget: number;
  wageBudget: number;
  balance?: number;
  ticketPrice?: number;
  academyLevel?: number; // 1-5
  coachingLevel?: number; // 1-5
  medicalLevel?: number; // 1-5
}

export interface League {
  id: string;
  name: string;
  nationId: string;
  confederation?: 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC';
  level: number;
  isCup?: boolean;
}

export interface Tournament {
  id: string;
  name: string;
  type: 'GLOBAL_CLUB' | 'CONTINENTAL_CLUB' | 'DOMESTIC_CUP' | 'SUPER_CUP' | 'GLOBAL_NATIONAL' | 'CONTINENTAL_NATIONAL' | 'PRESEASON' | 'NON_FIFA';
  confederation?: 'GLOBAL' | 'UEFA' | 'CONMEBOL' | 'CONCACAF' | 'AFC' | 'CAF' | 'OFC' | 'INDEPENDENT';
  tier?: 1 | 2 | 3;
  participants: string[]; // Team IDs
  isActive: boolean;
}

export interface Match {
  id: string;
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  date: string;
  isPlayed: boolean;
}
