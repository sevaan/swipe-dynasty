import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV, tableFromCSV } from '../src/content/csv.js';

test('quoted commas, escaped quotes and line breaks', () => {
  const { rows } = parseCSV('a,b,c\n"x, y","say ""hi""","line one\nline two"\n');
  assert.deepEqual(rows[1].cells, ['x, y', 'say "hi"', 'line one\nline two']);
});

test('CRLF endings, a byte-order mark and no trailing newline', () => {
  const { rows } = parseCSV('﻿id,text\r\n1,one\r\n2,"two\r\nlines"');
  assert.equal(rows.length, 3);
  assert.deepEqual(rows[0].cells, ['id', 'text']);
  assert.deepEqual(rows[2].cells, ['2', 'two\nlines']);
});

test('row line numbers account for line breaks inside quotes', () => {
  const { rows } = parseCSV('h\n"a\nb"\nc\n');
  assert.deepEqual(rows.map((r) => r.line), [1, 2, 4]);
});

test('an unclosed quote is reported with its line', () => {
  const { error } = parseCSV('h\nok\n"never closed\n');
  assert.equal(error.line, 3);
});

test('headers are normalised; comment and blank rows are skipped', () => {
  const { header, records } = tableFromCSV('ID, Left  Answer\n# a note,\n\n7,Go\n');
  assert.deepEqual(header, ['id', 'left answer']);
  assert.equal(records.length, 1);
  assert.deepEqual(records[0].values, { id: '7', 'left answer': 'Go' });
  assert.equal(records[0].line, 4);
});
