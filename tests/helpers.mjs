// Small hand-made content sets, so each rule can be tested on its own.
// Two eras: e1 has stepping stones a and b and the keystone k; e2 has z.
// Each project has an opening that can establish its one observation,
// fillers, a proof, a failed-design proof and three aftermath scenes.
import { compileContent } from '../src/content/compile.js';
import { choose, advance } from '../src/engine/game.js';

const SCENE_HEADER = ['id', 'project', 'phase', 'speaker', 'shows', 'text', 'left', 'left preview', 'left result', 'left effects',
  'right', 'right preview', 'right result', 'right effects', 'conditions', 'weight', 'weather', 'notes'];

const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v ?? ''));
const csv = (header, rows) => [header.join(','), ...rows.map((r) => header.map((h) => csvCell(r[h] ?? '')).join(','))].join('\n') + '\n';

// A project kit. `evidence` is what the opening's left answer establishes.
export function kit(p, inv, { investigation = '2', extra = [], proof = {}, after = {} } = {}) {
  const obs = `o${inv}`;
  return [
    { id: `${p}-open`, project: p, phase: 'opening', text: `Open ${p}`, left: 'Test', 'left effects': `observe ${obs}`, right: 'Skip', 'right effects': '' },
    { id: `${p}-fill1`, project: p, phase: 'investigation', text: `Fill ${p} 1`, left: 'Also test', 'left effects': `observe ${obs}`, right: 'Rest', 'right effects': '' },
    { id: `${p}-fill2`, project: p, phase: 'investigation', text: `Fill ${p} 2`, left: 'Wait', right: 'Wait more' },
    { id: `${p}-fill3`, project: p, phase: 'investigation', text: `Fill ${p} 3`, left: 'Ponder', right: 'Ponder more' },
    { id: `${p}-proof`, project: p, phase: 'proof', text: `Proof ${p}`,
      left: 'Share', 'left effects': proof.left ?? `commit ${inv}; legacy l${inv}1`,
      right: 'Keep', 'right effects': proof.right ?? `commit ${inv}; legacy l${inv}2` },
    { id: `${p}-fail`, project: p, phase: 'proof', text: `Fail ${p}`, left: 'Serve it', 'left effects': `fail f${inv}`, right: 'Bury it', 'right effects': `fail f${inv}` },
    { id: `${p}-after1`, project: p, phase: 'aftermath', text: `After ${p} 1`, left: 'Spread it', 'left effects': after.left1 ?? `legacy l${inv}1`, right: 'Hold it', 'right effects': after.right1 ?? `legacy l${inv}2`, conditions: 'step = 0' },
    { id: `${p}-after2`, project: p, phase: 'aftermath', text: `After ${p} 2`, left: 'Fine', 'left effects': after.left2 ?? '', right: 'Also fine', 'right effects': after.right2 ?? '', conditions: 'step = 1' },
    { id: `${p}-after3`, project: p, phase: 'aftermath', text: `After ${p} 3`, left: 'Spread it', 'left effects': after.left3 ?? `legacy l${inv}1`, right: 'Hold it', 'right effects': after.right3 ?? `legacy l${inv}2`, conditions: 'step = 2' },
    ...extra,
  ].map((r) => ({ ...r, investigation }));
}

export function fixture({ scenes, tuning = {}, flags = '', optional = false } = {}) {
  // optional: adds project po, whose invention o is an optional discovery in e1
  const allScenes = scenes || [...kit('pa', 'a'), ...kit('pb', 'b'), ...kit('pk', 'k'), ...kit('pz', 'z'), ...(optional ? kit('po', 'o') : [])];
  const ids = optional ? ['a', 'b', 'k', 'z', 'o'] : ['a', 'b', 'k', 'z'];
  const files = {
    'world.json': JSON.stringify({
      files: {
        characters: 'characters.csv', flags: 'flags.csv', observations: 'observations.csv', projects: 'projects.csv',
        inventions: 'inventions.csv', legacies: 'legacies.csv', failures: 'failures.csv', deaths: 'deaths.csv', scenes: ['scenes.csv'],
      },
      start: { era: 'e1', project: 'pa' },
      tuning: { investigationMin: 2, investigationMax: 3, aftermath: 3, ...tuning },
      eras: [
        { id: 'e1', name: 'One', required: ['a', 'b'], optional: optional ? ['o'] : [], keystone: 'k', next: 'e2', names: ['Ada', 'Bo', 'Cy', 'Di', 'Ed'] },
        { id: 'e2', name: 'Two', required: ['z'], optional: [], keystone: null, names: ['Fay', 'Gus'] },
      ],
      transient: ['glint'],
    }),
    'characters.csv': 'id,name,portrait,role\nhelper,A helper,,assistant\n',
    'flags.csv': `id,scope,default\nseen-a,timeline,\n${flags}`,
    'observations.csv': `id,project,text\noa,pa,Saw A\nob,pb,Saw B\nok,pk,Saw K\noz,pz,Saw Z\n${optional ? 'oo,po,Saw O\n' : ''}`,
    'projects.csv': `id,era,name,problem,outcomes,failures,start look,requires,investigation\n`
      + 'pa,e1,Project A,A is hard,a,fa,start,,2\n'
      + 'pb,e1,Project B,B is hard,b,fb,start,a,2\n'
      + 'pk,e1,Project K,K is hard,k,fk,start,a; b,2\n'
      + 'pz,e2,Project Z,Z is hard,z,fz,start,,2\n'
      + (optional ? 'po,e1,Project O,O is a detour,o,fo,start,,2\n' : ''),
    'inventions.csv': 'id,era,type,name,project,requires,recipe,legacies\n'
      + 'a,e1,stepping stone,the a,pa,,oa,la1; la2\n'
      + 'b,e1,stepping stone,the b,pb,a,ob,lb1; lb2\n'
      + 'k,e1,keystone,the k,pk,a; b,ok,lk1; lk2\n'
      + 'z,e2,stepping stone,the z,pz,,oz,lz1; lz2\n'
      + (optional ? 'o,e1,optional,the o,po,,oo,lo1; lo2\n' : ''),
    'legacies.csv': 'id,invention,adoption,problem,inherit,epitaph\n'
      + ids.flatMap((i) => [1, 2].map((n) => `l${i}${n},${i},Adopted ${i}${n},Problem ${i}${n},Because {maker} made ${i}${n},Epitaph ${i}${n}`)).join('\n') + '\n',
    'failures.csv': 'id,project,name,epitaph,inherit\n'
      + ids.map((i) => `f${i},p${i},the failed ${i},Failed ${i},{maker} failed at ${i}`).join('\n') + '\n',
    'deaths.csv': 'id,kind,project,text\nboom,danger,,Boom.\nold,natural,,Old age.\n',
    'scenes.csv': csv(SCENE_HEADER, allScenes.map(({ investigation, ...r }) => r)),
  };
  const out = compileContent(files);
  if (out.errors.length) throw new Error(`fixture errors: ${JSON.stringify(out.errors, null, 1)}`);
  return out.content;
}

export const act = (state, side) => ({ side, scene: state.life.current.id, turn: state.turn });

// Plays one side, or a function (state) => side, until the life ends.
// Returns the state at the epitaph and every event along the way.
export function playLife(state, content, policy) {
  const events = [];
  let s = state;
  let guard = 0;
  while (s.phase === 'play' && guard++ < 100) {
    const side = typeof policy === 'function' ? policy(s) : policy;
    const r = choose(s, content, act(s, side));
    if (r.events.some((e) => e.type === 'rejected')) throw new Error(`rejected: ${JSON.stringify(r.events)}`);
    events.push(...r.events);
    s = r.state;
  }
  return { state: s, events };
}

// From the epitaph to the next life (or era, or end).
export function nextLife(state, content) {
  let s = state;
  let guard = 0;
  while (s.phase !== 'play' && s.phase !== 'end' && guard++ < 10) s = advance(s, content, { turn: s.turn }).state;
  return s;
}
