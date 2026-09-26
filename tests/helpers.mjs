// Small hand-made content sets, so each rule can be tested on its own.
import { compileContent } from '../src/content/compile.js';

const CARD_HEADER = 'id,era,type,speaker,text,left answer,left effects,right answer,right effects,conditions,weight,trigger for,epitaph';

export function fixture({ cards, inventions, extraDeaths = '', start = 'c-start', tuning = {} }) {
  const deaths = ['low', 'high'].flatMap((end) => ['A', 'B', 'C', 'D'].map((m) => `d-${m}-${end},test,${m},${end},${m} ${end},${m} ${end}.`));
  const files = {
    'world.json': JSON.stringify({
      files: { characters: 'characters.csv', flags: 'flags.csv', inventions: 'inventions.csv', deaths: 'deaths.csv', cards: ['cards.csv'] },
      start: { era: 'test', card: start },
      tuning: { minCardsBeforeBreakthrough: 2, triggerWindow: 1, ...tuning },
      eras: [{
        id: 'test', name: 'Test', keystone: 'k', next: 'after',
        meters: { people: { label: 'A' }, resources: { label: 'B' }, belief: { label: 'C' }, power: { label: 'D' } },
      }, {
        id: 'after', name: 'After',
        meters: { people: { label: 'A' }, resources: { label: 'B' }, belief: { label: 'C' }, power: { label: 'D' } },
      }],
    }),
    'characters.csv': 'id,name,portrait,per life\nguy,Guy,G,\n',
    'flags.csv': 'id,scope\nseen_start,timeline\n',
    'inventions.csv': `id,era,type,name,requires,threshold,related\n${inventions}\nafter-bad,after,bad idea,the after nap,,,\n`,
    'deaths.csv': `id,era,meter,end,text,epitaph\n${deaths.join('\n')}\n${['low', 'high'].flatMap((end) => ['A', 'B', 'C', 'D'].map((m) => `a-${m}-${end},after,${m},${end},${m} ${end},${m} ${end}.`)).join('\n')}\n${extraDeaths}`,
    'cards.csv': `${CARD_HEADER}\n${cards}\nafter-1,after,,guy,After card,L,A +1,R,A -1,,,,\n`,
  };
  const out = compileContent(files);
  if (out.errors.length) throw new Error(`fixture errors: ${JSON.stringify(out.errors, null, 1)}`);
  return out.content;
}

export const sideOf = (state, side) => ({ side, card: state.life.current.card, turn: state.turn });
