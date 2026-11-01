// state.ts — which cartridge is in the handheld, and best scores. Both live in
// this viewer's localStorage; every access tolerates storage being unavailable.

export const CARTRIDGE_EVENT = 'cartridge-change';

export function getInserted(): string | null {
  try { return localStorage.getItem('cartridge'); } catch { return null; }
}

export function setInserted(id: string | null) {
  try {
    if (id) localStorage.setItem('cartridge', id);
    else localStorage.removeItem('cartridge');
  } catch { /* private mode: the choice lasts for this page only */ }
  document.dispatchEvent(new CustomEvent(CARTRIDGE_EVENT, { detail: id }));
}

export function getBest(id: string): number | null {
  try {
    const v = localStorage.getItem(`best:${id}`);
    return v === null ? null : Number(v);
  } catch { return null; }
}

/** Store `score` if it beats the best; returns the (possibly new) best. */
export function recordScore(id: string, score: number): number {
  const best = getBest(id);
  if (best !== null && best >= score) return best;
  try { localStorage.setItem(`best:${id}`, String(score)); } catch { /* ignore */ }
  return score;
}
