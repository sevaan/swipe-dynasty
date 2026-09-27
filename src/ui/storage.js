// Saves (script section 7). The campaign is a versioned snapshot written
// atomically to IndexedDB, with the one before it kept as a backup. Every
// write says which revision it expects to replace, so a stale second tab
// can't silently overwrite a newer game. Two small records sit beside it:
// the checkpoint after the shared history ("Another future") and the meta
// record of endings seen, which outlives a restart. localStorage stands in
// when IndexedDB isn't available. The old prototype save stays untouched
// under its old keys. Settings are a small separate record in localStorage.

const DB_NAME = 'one-bright-idea';
const STORE = 'snapshots';
const KEY = 'campaign-v1';
const LS = 'obi.campaign.v1';
const OLD_KEYS = ['current', 'previous']; // the Milestone 1 prototype, in the same store
const OLD_LS = 'obi.save';
const SETTINGS_KEY = 'obi.settings';
const DEFAULT_SETTINGS = { scale: 1, reduceMotion: false, effects: true };

export function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* settings are a convenience */ }
}

const valid = (rec) => rec && typeof rec.revision === 'number' && rec.state && typeof rec.state === 'object';

function idb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') { reject(new Error('no IndexedDB')); return; }
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error || new Error('IndexedDB would not open'));
    req.onblocked = () => reject(new Error('IndexedDB is blocked'));
  });
}

// Plain request callbacks, not awaits, inside each transaction: some Safari
// versions close a transaction early if you await a promise in the middle of it.
function idbSaves(db) {
  const run = (mode, body) => new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const out = {};
    body(t.objectStore(STORE), out);
    t.oncomplete = () => resolve(out.value);
    t.onabort = t.onerror = () => reject(t.error || new Error('save failed'));
  });
  const getMany = (keys) => run('readonly', (store, out) => {
    out.value = {};
    for (const k of keys) { const r = store.get(k); r.onsuccess = () => { out.value[k] = r.result; }; }
  });
  return {
    kind: 'indexeddb',
    async load() {
      const got = await getMany([KEY, `${KEY}.previous`]);
      const current = got[KEY];
      const previous = got[`${KEY}.previous`];
      return { current: valid(current) ? current : null, previous: valid(previous) ? previous : null, damaged: current != null && !valid(current) };
    },
    // Replaces the snapshot only if nobody else wrote since `expected`.
    write(state, expected) {
      return run('readwrite', (store, out) => {
        const a = store.get(KEY);
        a.onsuccess = () => {
          const current = a.result;
          const have = valid(current) ? current.revision : 0;
          if (have !== expected) { out.value = { ok: false, conflict: true, revision: have }; return; }
          if (valid(current)) store.put(current, `${KEY}.previous`);
          store.put({ revision: expected + 1, savedAt: Date.now(), state }, KEY);
          out.value = { ok: true, revision: expected + 1 };
        };
      });
    },
    async get(name) { return (await getMany([`${KEY}.${name}`]))[`${KEY}.${name}`] ?? null; },
    put(name, value) { return run('readwrite', (store, out) => { store.put(value, `${KEY}.${name}`); out.value = true; }); },
    async hasOld() {
      const got = await getMany(OLD_KEYS);
      let ls = null;
      try { ls = localStorage.getItem(OLD_LS); } catch { /* none */ }
      return OLD_KEYS.some((k) => got[k] != null) || ls != null;
    },
    clear() { return run('readwrite', (store, out) => { for (const k of [KEY, `${KEY}.previous`, `${KEY}.checkpoint`]) store.delete(k); out.value = true; }); },
  };
}

function lsSaves() {
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return undefined; } };
  return {
    kind: 'localstorage',
    async load() {
      const current = read(LS);
      const previous = read(`${LS}.previous`);
      return { current: valid(current) ? current : null, previous: valid(previous) ? previous : null, damaged: current !== null && !valid(current) };
    },
    async write(state, expected) {
      try {
        const current = read(LS);
        const have = valid(current) ? current.revision : 0;
        if (have !== expected) return { ok: false, conflict: true, revision: have };
        if (valid(current)) localStorage.setItem(`${LS}.previous`, JSON.stringify(current));
        const revision = expected + 1;
        localStorage.setItem(LS, JSON.stringify({ revision, savedAt: Date.now(), state }));
        return { ok: true, revision };
      } catch (e) {
        return { ok: false, error: e };
      }
    },
    async get(name) { return read(`${LS}.${name}`) ?? null; },
    async put(name, value) { try { localStorage.setItem(`${LS}.${name}`, JSON.stringify(value)); } catch { /* reported by the next campaign save */ } return true; },
    async hasOld() { try { return localStorage.getItem(OLD_LS) != null; } catch { return false; } },
    async clear() {
      try { for (const k of [LS, `${LS}.previous`, `${LS}.checkpoint`]) localStorage.removeItem(k); } catch { /* nothing to clear */ }
      return true;
    },
  };
}

export async function openSaves() {
  try { return idbSaves(await idb()); } catch { return lsSaves(); }
}

// Export and import: the history, its checkpoint and the endings seen, as
// text, to copy between devices by hand.
export function exportText(bundle) {
  return btoa(unescape(encodeURIComponent(JSON.stringify({ game: 'one-bright-idea', version: 1, ...bundle }))));
}

export function importText(text) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(String(text).trim()))));
    if (data?.game !== 'one-bright-idea' || data.version !== 1 || !data.state) return { error: "That isn't a save from this version of One Bright Idea." };
    return { state: data.state, checkpoint: data.checkpoint ?? null, meta: data.meta ?? null };
  } catch {
    return { error: "That text isn't a save (it may have been cut short when copying)." };
  }
}
