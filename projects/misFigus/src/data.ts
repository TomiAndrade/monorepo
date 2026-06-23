import catalog from '../figuritas-wc2026.json';
import banderas from '../banderas.json';

export type Sticker = {
  code: string;
  name: string;
  team: string;
};

export type StickerSection = {
  title: string;
  flag: string;
  data: Sticker[][];
};

export const FLAGS = banderas as Record<string, string>;

export const TEAM_ES: Record<string, string> = {
  'We Are Panini': 'We Are Panini',
  'FIFA World Cup 2026': 'Copa Mundial FIFA 2026',
  'FIFA World Cup History': 'Historia Copa Mundial FIFA',
  'Host Countries and Cities': 'Sedes y Ciudades',
  'Algeria': 'Argelia',
  'Argentina': 'Argentina',
  'Australia': 'Australia',
  'Austria': 'Austria',
  'Belgium': 'Bélgica',
  'Bosnia and Herzegovina': 'Bosnia y Herzegovina',
  'Brazil': 'Brasil',
  'Canada': 'Canadá',
  'Cape Verde': 'Cabo Verde',
  'Colombia': 'Colombia',
  'Congo DR': 'Congo RD',
  'Croatia': 'Croacia',
  'Curaçao': 'Curazao',
  'Czechia': 'Chequia',
  'Ecuador': 'Ecuador',
  'Egypt': 'Egipto',
  'England': 'Inglaterra',
  'France': 'Francia',
  'Germany': 'Alemania',
  'Ghana': 'Ghana',
  'Haiti': 'Haití',
  'Iran': 'Irán',
  'Iraq': 'Irak',
  'Ivory Coast': 'Costa de Marfil',
  'Japan': 'Japón',
  'Jordan': 'Jordania',
  'Mexico': 'México',
  'Morocco': 'Marruecos',
  'Netherlands': 'Países Bajos',
  'New Zealand': 'Nueva Zelanda',
  'Norway': 'Noruega',
  'Panama': 'Panamá',
  'Paraguay': 'Paraguay',
  'Portugal': 'Portugal',
  'Qatar': 'Catar',
  'Saudi Arabia': 'Arabia Saudita',
  'Scotland': 'Escocia',
  'Senegal': 'Senegal',
  'South Africa': 'Sudáfrica',
  'South Korea': 'Corea del Sur',
  'Spain': 'España',
  'Sweden': 'Suecia',
  'Switzerland': 'Suiza',
  'Türkiye': 'Turquía',
  'Tunisia': 'Túnez',
  'Uruguay': 'Uruguay',
  'USA': 'EE. UU.',
  'Uzbekistan': 'Uzbekistán',
};

// Group stickers into rows of COLS for the grid
const COLS = 5;

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function buildSections(): StickerSection[] {
  const teamOrder: string[] = [];
  const teamMap = new Map<string, Sticker[]>();

  for (const s of catalog.stickers as Sticker[]) {
    if (!teamMap.has(s.team)) {
      teamOrder.push(s.team);
      teamMap.set(s.team, []);
    }
    teamMap.get(s.team)!.push(s);
  }

  return teamOrder.map((team) => ({
    title: TEAM_ES[team] ?? team,
    flag: FLAGS[team] ?? '🏳️',
    data: chunkArray(teamMap.get(team)!, COLS),
  }));
}

export const SECTIONS: StickerSection[] = buildSections();
export const ALL_STICKERS: Sticker[] = catalog.stickers as Sticker[];
export const STICKER_MAP = new Map<string, Sticker>(
  ALL_STICKERS.map((s) => [s.code, s])
);
export const TOTAL = catalog.count;
export const COLS_COUNT = COLS;
