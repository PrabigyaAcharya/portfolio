// cartridges.ts — the cartridge shelf. Each game's code loads only when its
// cartridge is first used, so the landing page ships none of it up front.

import type { Game } from './types';

export interface Cartridge {
  id: string;
  title: string;
  /** Second line on the label. */
  labelLine: string;
  load: () => Promise<Game<any>>;
}

export const cartridges: Cartridge[] = [
  { id: 'descent',        title: 'Descent',        labelLine: 'Tune the learning rate', load: () => import('./descent').then(m => m.default) },
  { id: 'context-window', title: 'Context Window', labelLine: 'Mind the overflow',   load: () => import('./context-window').then(m => m.default) },
  { id: 'camera-ready',   title: 'Camera Ready',   labelLine: 'Stack before the deadline', load: () => import('./camera-ready').then(m => m.default) },
];

export const findCartridge = (id: string | null | undefined) => cartridges.find(c => c.id === id);
