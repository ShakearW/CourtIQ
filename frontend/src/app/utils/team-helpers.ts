export const TEAM_COLORS: Record<string, string> = {
    ATL: '#C8102E', BOS: '#007A33', BKN: '#000000', CHA: '#00788C', CHI: '#CE1141',
    CLE: '#860038', DAL: '#00538C', DEN: '#0E2240', DET: '#C8102E', GSW: '#1D428A',
    HOU: '#C4CED4', IND: '#FDBB30', LAC: '#C8102E', LAL: '#552583', MEM: '#5D76A9',
    MIA: '#98002E', MIL: '#00471B', MIN: '#0C2340', NOP: '#0C2340', NYK: '#F58426',
    OKC: '#007AC1', ORL: '#0077C0', PHI: '#006BB6', PHX: '#371761', POR: '#E03A3E',
    SAC: '#5A2D81', SAS: '#C4CED4', TOR: '#000000', UTA: '#002B5C', WAS: '#002B5C'
  };

  export const TEAM_SECONDARY_COLORS: Record<string, string> = {
    ATL: '#FDB927', BOS: '#cfcfcf', BKN: '#cfcfcf', CHA: '#1d1160', CHI: '#000000',
    CLE: '#041E42', DAL: '#002B5e', DEN: '#FEC524', DET: '#bec0c2', GSW: '#ffc72c',
    HOU: '#CE1141', IND: '#002D62', LAC: '#1d428a', LAL: '#FDB927', MEM: '#12173F',
    MIA: '#F9A01B', MIL: '#c4b392', MIN: '#78BE20', NOP: '#C8102E', NYK: '#006BB6',
    OKC: '#ef3b24', ORL: '#C4ced4', PHI: '#ed174c', PHX: '#e56020', POR: '#000000',
    SAC: '#63727A', SAS: '#000000', TOR: '#ce1141', UTA: '#F9A01B', WAS: '#C4CED4'
  };



const LOGO_OVERRIDES: Record<string, string> = { NOP: 'no', UTA: 'utah' };

export function getTeamColor(abbr: string): string {
  return TEAM_COLORS[abbr] || '#333';
}

export function getTeamSecondaryColor(abbr: string): string {
  return TEAM_SECONDARY_COLORS[abbr] || '#666';
}

export function getLogoAbbr(abbr: string): string {
    
  return LOGO_OVERRIDES[abbr] || abbr.toLowerCase();
}