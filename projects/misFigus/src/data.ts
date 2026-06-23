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
    title: team,
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
