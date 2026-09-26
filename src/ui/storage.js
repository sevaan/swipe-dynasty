// Saves live in this browser only (localStorage). They are not synced across
// devices; Settings has copy/paste to move a save by hand.
import { SAVE_VERSION, reconcile } from '../engine/game.js';

const KEY = 'usg.save.v1';
const SETTINGS = 'usg.settings';

function tryGet(key) {
  try { return { value: localStorage.getItem(key) }; } catch (e) { return { error: e }; }
}

export function loadSave(content) {
  const { value: raw, error } = tryGet(KEY);
  if (error) return { state: null, problem: "This browser is blocking saves, so progress won't be kept." };
  if (!raw) return { state: null };
  const result = parseSave(raw, content);
  if (result.state) return result;
  try { localStorage.setItem(`usg.save.broken.${Date.now()}`, raw); } catch { /* nothing more we can do */ }
  return { state: null, problem: `Your save couldn't be loaded (${result.problem}). It's kept aside, and this is a fresh game.` };
}

export function parseSave(raw, content) {
  try {
    const s = JSON.parse(raw);
    if (!s || typeof s !== 'object' || !s.timeline || !s.collection) return { state: null, problem: "that isn't a save" };
    if (s.save !== SAVE_VERSION) return { state: null, problem: `it's save format ${s.save}, this build reads ${SAVE_VERSION}` };
    return { state: reconcile(s, content) };
  } catch (e) {
    return { state: null, problem: 'it was damaged' };
  }
}

export function writeSave(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
    return true;
  } catch {
    return false;
  }
}

export function clearSave() {
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
}

export function loadSettings() {
  const { value } = tryGet(SETTINGS);
  const defaults = { scale: 1, reduceMotion: false, effects: true };
  try { return { ...defaults, ...(value ? JSON.parse(value) : {}) }; } catch { return defaults; }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS, JSON.stringify(settings)); } catch { /* settings are a convenience */ }
}
