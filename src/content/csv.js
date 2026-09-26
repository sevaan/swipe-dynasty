// RFC 4180 CSV parser: quoted fields, "" escapes, line breaks inside quotes,
// CRLF or LF endings, and a leading byte-order mark. Each row remembers the
// line it started on so errors can point writers at the right spot.

export function parseCSV(text) {
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  const rows = [];
  let cells = [];
  let field = '';
  let quoted = false;
  let line = 1;
  let rowLine = 1;
  let i = 0;

  const endField = () => { cells.push(field); field = ''; };
  const endRow = () => {
    endField();
    rows.push({ line: rowLine, cells });
    cells = [];
  };

  while (i < text.length) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
        quoted = false; i += 1; continue;
      }
      if (ch === '\r') { i += 1; if (text[i] !== '\n') { field += '\n'; line += 1; } continue; }
      if (ch === '\n') line += 1;
      field += ch; i += 1; continue;
    }
    if (ch === '"' && field === '') { quoted = true; i += 1; continue; }
    if (ch === ',') { endField(); i += 1; continue; }
    if (ch === '\r' && text[i + 1] === '\n') { i += 1; continue; }
    if (ch === '\n' || ch === '\r') {
      endRow(); line += 1; rowLine = line; i += 1; continue;
    }
    field += ch; i += 1;
  }
  if (quoted) {
    return { rows, error: { line: rowLine, message: 'A quoted cell never closes (missing ")' } };
  }
  if (field !== '' || cells.length > 0) endRow();
  return { rows };
}

// Turns parsed rows into objects keyed by normalised header names
// ("Left Answer" -> "left answer"). Blank rows and rows whose first cell
// starts with # are skipped, so writers can comment out a card.
export function tableFromCSV(text) {
  const { rows, error } = parseCSV(text);
  if (error) return { header: [], records: [], error };
  const headerRow = rows.find((r) => r.cells.some((c) => c.trim() !== ''));
  if (!headerRow) return { header: [], records: [] };
  const header = headerRow.cells.map((h) => h.trim().toLowerCase().replace(/\s+/g, ' '));
  const records = [];
  for (const row of rows) {
    if (row === headerRow || row.line < headerRow.line) continue;
    if (row.cells.every((c) => c.trim() === '')) continue;
    if (row.cells[0].trim().startsWith('#')) continue;
    const values = {};
    header.forEach((h, idx) => { if (h) values[h] = (row.cells[idx] ?? '').trim(); });
    records.push({ line: row.line, values, extra: row.cells.length > header.length });
  }
  return { header, records };
}
