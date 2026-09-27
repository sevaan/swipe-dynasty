// Saves (spec 16.7). A save is a versioned snapshot written atomically to
// IndexedDB, with the one before it kept as a backup. Every write says which
// revision it expects to replace, so a stale second tab can't silently
// overwrite a newer game. If IndexedDB isn't available, localStorage stands
// in with the same rules. Settings are a small separate record in localStorage.

const DB_NAME = 'one-bright-idea';
const STORE = 'snapshots';
const LS_KEY = 'obi.save';
const SETTINGS_KEY = 'obi.settings';
const DEFAULT_SETTINGS = { scale: 1, reduceMotion: false, effects: true };

export function loadSettings() {
  try { return { ...DEFAULT_SETTINGS, ...JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{}') }; } catch { return { ...DEFAULT_SETTINGS }; }
}

export function saveSettings(settings) {
  try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); } catch { /* settings are a convenience */ }
}

const valid = (rec) => rec && typeof rec.revision === 'number' && rec.state && typeof rec.state === 'object' && rec.state.timeline;

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
  return {
    kind: 'indexeddb',
    load() {
      return run('readonly', (store, out) => {
        const a = store.get('current');
        a.onsuccess = () => {
          const b = store.get('previous');
          b.onsuccess = () => {
            const current = a.result;
            const previous = b.result;
            out.value = { current: valid(current) ? current : null, previous: valid(previous) ? previous : null, damaged: current != null && !valid(current) };
          };
        };
      });
    },
    // Replaces the snapshot only if nobody else wrote since `expected`.
    write(state, expected) {
      return run('readwrite', (store, out) => {
        const a = store.get('current');
        a.onsuccess = () => {
          const current = a.result;
          const have = valid(current) ? current.revision : 0;
          if (have !== expected) { out.value = { ok: false, conflict: true, revision: have }; return; }
          if (valid(current)) store.put(current, 'previous');
          store.put({ revision: expected + 1, savedAt: Date.now(), state }, 'current');
          out.value = { ok: true, revision: expected + 1 };
        };
      });
    },
    clear() {
      return run('readwrite', (store, out) => { store.delete('current'); store.delete('previous'); out.value = true; });
    },
  };
}

function lsSaves() {
  const read = (key) => { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch { return undefined; } };
  return {
    kind: 'localstorage',
    async load() {
      const current = read(LS_KEY);
      const previous = read(`${LS_KEY}.previous`);
      return { current: valid(current) ? current : null, previous: valid(previous) ? previous : null, damaged: current !== null && !valid(current) };
    },
    async write(state, expected) {
      try {
        const current = read(LS_KEY);
        const have = valid(current) ? current.revision : 0;
        if (have !== expected) return { ok: false, conflict: true, revision: have };
        if (valid(current)) localStorage.setItem(`${LS_KEY}.previous`, JSON.stringify(current));
        const revision = expected + 1;
        localStorage.setItem(LS_KEY, JSON.stringify({ revision, savedAt: Date.now(), state }));
        return { ok: true, revision };
      } catch (e) {
        return { ok: false, error: e };
      }
    },
    async clear() {
      try { localStorage.removeItem(LS_KEY); localStorage.removeItem(`${LS_KEY}.previous`); } catch { /* nothing to clear */ }
      return true;
    },
  };
}

export async function openSaves() {
  try { return idbSaves(await idb()); } catch { return lsSaves(); }
}

// Export and import: the snapshot as text, to copy between devices by hand.
export function exportText(state) {
  return btoa(unescape(encodeURIComponent(JSON.stringify({ game: 'one-bright-idea', state }))));
}

export function importText(text) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(String(text).trim()))));
    if (data?.game !== 'one-bright-idea' || !data.state?.timeline) return { error: "That isn't a One Bright Idea save." };
    return { state: data.state };
  } catch {
    return { error: "That text isn't a save (it may have been cut short when copying)." };
  }
}
