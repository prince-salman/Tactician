import React, { useMemo } from 'react';

interface TeamLogoProps {
  teamId: string;
  teamName: string;
  shortName: string;
  size?: number;
  className?: string;
}

const colorMap: Record<string, string> = {
  Red: '#ef4444',
  Blue: '#3b82f6',
  White: '#f8fafc',
  Black: '#0f172a',
  Green: '#10b981',
  Yellow: '#eab308',
  Purple: '#a855f7',
  Orange: '#f97316',
  Cyan: '#06b6d4',
  Maroon: '#831843'
};

const palettes = [
  ['#1e3a8a', '#93c5fd'],
  ['#7f1d1d', '#fca5a5'],
  ['#14532d', '#86efac'],
  ['#4c1d95', '#d8b4fe'],
  ['#0f172a', '#cbd5e1'],
  ['#78350f', '#fcd34d']
];

// Hash function
const hashCode = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
};

export function TeamLogo({ teamId, teamName, shortName, size = 64, className = '' }: TeamLogoProps) {
  const { primaryColor, secondaryColor, shapeType, patternType } = useMemo(() => {
    const hash = hashCode(teamId);
    
    let primary = '';
    // Determine color from name if exists
    for (const [key, hex] of Object.entries(colorMap)) {
      if (teamName.includes(key)) {
        primary = hex;
        break;
      }
    }
    
    // If no color word in name, pick from palette
    let secondary = '';
    if (!primary) {
      const palette = palettes[hash % palettes.length];
      primary = palette[0];
      secondary = palette[1];
    } else {
      // Generate a complementing secondary color
      secondary = primary === '#f8fafc' ? '#94a3b8' : '#ffffff';
      if (primary === '#0f172a') secondary = '#e2e8f0';
    }

    return {
      primaryColor: primary,
      secondaryColor: secondary,
      shapeType: hash % 4, // 0: Shield A, 1: Shield B, 2: Circle, 3: Hexagon
      patternType: (hash >> 2) % 3, // 0: Solid, 1: Stripes, 2: Halves
    };
  }, [teamId, teamName]);

  const initials = shortName || teamName.substring(0, 3).toUpperCase();
  const fontSize = size * 0.35;

  // Shapes paths
  const getShapePath = (type: number) => {
    switch(type) {
      case 0: // Classic Shield
        return `M10,10 L90,10 L90,50 C90,80 50,95 50,95 C50,95 10,80 10,50 Z`;
      case 1: // Round Bottom Shield
        return `M15,10 L85,10 L85,45 A 35 35 0 0 1 15 45 Z`;
      case 2: // Circle
        return `M50,95 A 45 45 0 1 0 50 5 A 45 45 0 1 0 50 95`;
      case 3: // Hexagon
        return `M50,5 L90,25 L90,75 L50,95 L10,75 L10,25 Z`;
      default:
        return `M10,10 L90,10 L90,50 C90,80 50,95 50,95 C50,95 10,80 10,50 Z`;
    }
  };

  const getPattern = (type: number) => {
    switch(type) {
      case 1: // Stripes
        return (
          <pattern id={`stripe-${teamId}`} width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="10" height="20" fill={secondaryColor} opacity="0.8" />
          </pattern>
        );
      case 2: // Halves
        return (
          <pattern id={`half-${teamId}`} width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="50" height="100" fill={secondaryColor} opacity="0.8" />
          </pattern>
        );
      default:
        return null;
    }
  };

  const patternId = patternType === 1 ? `url(#stripe-${teamId})` : patternType === 2 ? `url(#half-${teamId})` : 'none';

  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={`${className} drop-shadow-md transition-transform hover:scale-105`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {getPattern(patternType)}
        <filter id={`shadow-${teamId}`}>
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.3" />
        </filter>
      </defs>
      
      {/* Background Shape */}
      <path 
        d={getShapePath(shapeType)} 
        fill={primaryColor} 
        stroke={secondaryColor} 
        strokeWidth="4" 
        filter={`url(#shadow-${teamId})`}
      />
      
      {/* Pattern Overlay */}
      {patternType > 0 && (
        <path 
          d={getShapePath(shapeType)} 
          fill={patternId} 
        />
      )}

      {/* Inner Border */}
      <path 
        d={getShapePath(shapeType)} 
        fill="none" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        strokeOpacity="0.5"
        transform="scale(0.9) translate(5, 5)"
      />

      {/* Initials */}
      <text 
        x="50" 
        y="58" 
        fontFamily="Impact, sans-serif" 
        fontSize={fontSize} 
        fontWeight="bold" 
        fill={primaryColor === '#f8fafc' || primaryColor === '#eab308' ? '#0f172a' : '#ffffff'} 
        textAnchor="middle" 
        letterSpacing="1"
        style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}
      >
        {initials}
      </text>
    </svg>
  );
}
