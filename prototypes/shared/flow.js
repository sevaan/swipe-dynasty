// The life's shape, the same in every prototype: the arrival, six cards
// each followed by its result, the reveal after the fourth, and the
// epitaph after the sixth. It holds no design; a prototype subscribes and
// draws each step however it likes.
//
//   const flow = createFlow(life, render);
//   flow.start();          // shows the arrival
//   flow.choose('left');   // on a card: shows that answer's result
//   flow.next();           // moves on from an arrival, result, reveal or epitaph
//
// render(step, flow) gets one of:
//   { type: 'arrival' }
//   { type: 'card', index, card }
//   { type: 'result', index, card, side, option }
//   { type: 'reveal' }
//   { type: 'epitaph', side }   side: the card-six answer, for the legacy line
// plus flow.choices (card id -> side) and flow.life.

export function createFlow(life, render) {
  const flow = { life, choices: {}, step: null, history: [] };
  const show = (step) => {
    flow.history.push(flow.step);
    flow.step = step;
    render(step, flow);
  };
  flow.start = () => {
    flow.choices = {};
    flow.history = [];
    flow.step = null;
    show({ type: 'arrival' });
  };
  flow.choose = (side) => {
    const s = flow.step;
    if (s?.type !== 'card') return false;
    flow.choices[s.card.id] = side;
    show({ type: 'result', index: s.index, card: s.card, side, option: s.card[side] });
    return true;
  };
  flow.next = () => {
    const s = flow.step;
    if (!s) return;
    if (s.type === 'arrival') show({ type: 'card', index: 0, card: life.cards[0] });
    else if (s.type === 'result' && s.index === 3) show({ type: 'reveal' });
    else if (s.type === 'result' && s.index === 5) show({ type: 'epitaph', side: s.side });
    else if (s.type === 'result') show({ type: 'card', index: s.index + 1, card: life.cards[s.index + 1] });
    else if (s.type === 'reveal') show({ type: 'card', index: 4, card: life.cards[4] });
    else if (s.type === 'epitaph') flow.start();
  };
  // The legacy and obituary lines for the epitaph
  flow.epitaph = () => ({
    name: life.inventor.name,
    invented: `Invented ${life.invention.name[0].toLowerCase()}${life.invention.name.slice(1)}.`,
    death: life.death.natural,
    legacy: life.legacy[flow.choices[life.cards[5].id] || 'left'],
  });
  return flow;
}
