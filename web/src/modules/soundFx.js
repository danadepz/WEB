// Tiny synthesized UI sound effects — no audio assets needed.
// A shared WebAudio context is created lazily on the first user gesture
// (browser autoplay policies forbid earlier playback).

const STORAGE_KEY = 'wm-sfx';
const HOVER_THROTTLE_MS = 60;

let audioContext = null;
let enabled = window.localStorage.getItem(STORAGE_KEY) !== 'off';
let lastHoverAt = 0;
const listeners = new Set();

const ensureContext = () => {
  if (typeof window === 'undefined') return null;
  const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextCtor) return null;
  if (!audioContext) audioContext = new AudioContextCtor();
  if (audioContext.state === 'suspended') {
    audioContext.resume().catch(() => {});
  }
  return audioContext;
};

// One short synthesized blip. `slide` bends the pitch for a snappier feel.
const blip = ({ frequency, slideTo, duration = 0.06, type = 'sine', gain = 0.045 }) => {
  if (!enabled) return;
  try {
    const ctx = ensureContext();
    if (!ctx || ctx.state !== 'running') return;
    const osc = ctx.createOscillator();
    const amp = ctx.createGain();
    const now = ctx.currentTime;
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.01);
  } catch {
    // Audio is decorative — never break the UI for it.
  }
};

export const playHover = () => {
  const now = Date.now();
  if (now - lastHoverAt < HOVER_THROTTLE_MS) return;
  lastHoverAt = now;
  blip({ frequency: 1450, slideTo: 1900, duration: 0.045, type: 'triangle', gain: 0.028 });
};

export const playClick = () => {
  blip({ frequency: 640, slideTo: 430, duration: 0.075, type: 'sine', gain: 0.055 });
};

export const playConfirm = () => {
  blip({ frequency: 660, duration: 0.08, type: 'triangle', gain: 0.05 });
  window.setTimeout(() => blip({ frequency: 990, duration: 0.1, type: 'triangle', gain: 0.05 }), 90);
};

export const isSfxEnabled = () => enabled;

export const setSfxEnabled = (next) => {
  enabled = Boolean(next);
  window.localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off');
  if (enabled) playConfirm();
  listeners.forEach((listener) => listener(enabled));
};

// Subscribe the header toggle (or any UI) to preference changes.
export const onSfxChange = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

// Delegated global wiring: one pair of document listeners covers every
// link/button/control, including elements rendered later.
const INTERACTIVE_SELECTOR =
  'a[href], button, [role="button"], [role="menuitem"], [role="switch"], [role="tab"], input, select, textarea, summary, label';

const isUsable = (element) =>
  element &&
  !element.disabled &&
  element.getAttribute('aria-disabled') !== 'true';

export const attachGlobalSoundFx = () => {
  const onMouseOver = (event) => {
    const element = event.target?.closest?.(INTERACTIVE_SELECTOR);
    if (!isUsable(element)) return;
    // Only fire when entering from outside this element, not between children.
    if (event.relatedTarget && element.contains(event.relatedTarget)) return;
    playHover();
  };
  const onClick = (event) => {
    const element = event.target?.closest?.(INTERACTIVE_SELECTOR);
    if (!isUsable(element)) return;
    playClick();
  };
  document.addEventListener('mouseover', onMouseOver, { passive: true });
  document.addEventListener('click', onClick, { passive: true });
  return () => {
    document.removeEventListener('mouseover', onMouseOver);
    document.removeEventListener('click', onClick);
  };
};
