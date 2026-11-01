// input.ts — one virtual pad fed by the keyboard and by on-screen buttons.
// Presses are latched until the next tick so a quick tap between ticks still
// registers.

import { noButtons, type Buttons, type Input, type Key } from './types';

export class Pad {
  private held = noButtons();
  private downs = noButtons();

  press(k: Key) {
    if (!this.held[k]) this.downs[k] = true;
    this.held[k] = true;
  }

  release(k: Key) {
    this.held[k] = false;
  }

  /** Read and clear the presses since the last tick. */
  take(): Input {
    const input = { held: { ...this.held }, pressed: { ...this.downs } };
    this.downs = noButtons();
    return input;
  }

  reset() {
    this.held = noButtons();
    this.downs = noButtons();
  }

  /** Drive the pad from an autopilot's buttons (attract mode). */
  set(buttons: Buttons) {
    for (const k of Object.keys(buttons) as Key[]) {
      if (buttons[k]) this.press(k); else this.release(k);
    }
  }
}

const KEYS: Record<string, Key> = {
  ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right',
  z: 'a', Z: 'a', ' ': 'a', x: 'b', X: 'b', Enter: 'start',
};

/**
 * Keyboard → pad. `active` decides per event whether the game has the keys
 * (e.g. only while the well is focused). Returns a cleanup function.
 */
export function bindKeys(pad: Pad, active: (e: KeyboardEvent) => boolean): () => void {
  const ctl = new AbortController();
  document.addEventListener('keydown', (e) => {
    const k = KEYS[e.key];
    if (!k || e.altKey || e.ctrlKey || e.metaKey || !active(e)) return;
    e.preventDefault();
    pad.press(k);
  }, { signal: ctl.signal });
  document.addEventListener('keyup', (e) => {
    const k = KEYS[e.key];
    if (k) pad.release(k);
  }, { signal: ctl.signal });
  window.addEventListener('blur', () => pad.reset(), { signal: ctl.signal });
  return () => ctl.abort();
}

/**
 * On-screen buttons → pad, with hold support. Clicks on them are swallowed so
 * links (the d-pad arms) don't navigate while a game is in. Returns cleanup.
 */
export function bindButtons(pad: Pad, map: Array<[HTMLElement, Key]>): () => void {
  const ctl = new AbortController();
  for (const [el, k] of map) {
    const prevTouch = el.style.touchAction;
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      el.setPointerCapture?.(e.pointerId);
      el.classList.add('pressed');
      pad.press(k);
    }, { signal: ctl.signal });
    const up = () => { el.classList.remove('pressed'); pad.release(k); };
    el.addEventListener('pointerup', up, { signal: ctl.signal });
    el.addEventListener('pointercancel', up, { signal: ctl.signal });
    el.addEventListener('click', (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, { signal: ctl.signal, capture: true });
    ctl.signal.addEventListener('abort', () => { el.style.touchAction = prevTouch; el.classList.remove('pressed'); });
  }
  return () => ctl.abort();
}
