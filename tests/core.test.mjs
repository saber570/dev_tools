import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import test from 'node:test';
import { formatJson, formatSql, getCronSchedule, isValidCalendarDate, parseTimestamp } from '../src/core.mjs';

test('JSON formatting and minification preserve numeric values exactly', () => {
  const source = '{"id":9223372036854775807,"negative":-9223372036854775808,"decimal":0.12345678901234567890,"huge":1e999,"zero":-0,"nested":[9007199254740993],"text":"9007199254740993"}';
  assert.equal(formatJson(formatJson(source), 0), source);
  for (const invalid of ['{"id":01}', '{"a":1,}', 'NaN', '{"a":undefined}']) {
    assert.throws(() => formatJson(invalid));
  }
});

test('SQL preserves quoted content and comment boundaries', () => {
  const literals = ["'a b'", "'x from y'", "'a  b'", "'x, y'", "'it''s here'", '"from"'];
  const formatted = formatSql(`select ${literals.join(', ')} -- keep from here\nfrom users /* order by here */`);
  for (const literal of literals) assert.ok(formatted.includes(literal), literal);
  assert.match(formatted, /-- keep from here\n/);
  assert.ok(formatted.includes('/* order by here */'));
  assert.match(formatted, /\nFROM\n/);
});

test('SQL keyword case and indentation controls affect formatting', () => {
  assert.match(formatSql('select id from users', 'lower', '4'), /^select\n {4}id\nfrom/);
  assert.match(formatSql('select id from users', 'preserve', 'tab'), /^select\n\tid/);
  assert.throws(() => formatSql("select 'unterminated"));
});

test('Cron combines restricted day-of-month and weekday with OR', () => {
  const result = getCronSchedule('0 9 1 * 1', { currentDate: '2026-09-05T12:00:00+08:00', tz: 'Asia/Shanghai' });
  assert.equal(result.dayOr, true);
  assert.deepEqual(result.next.map(date => date.toISOString()), [
    '2026-09-07T01:00:00.000Z', '2026-09-14T01:00:00.000Z', '2026-09-21T01:00:00.000Z',
    '2026-09-28T01:00:00.000Z', '2026-10-01T01:00:00.000Z',
  ]);
});

test('Cron supports steps, ranges, Sunday aliases, and distant leap days', () => {
  const options = { currentDate: '2026-09-05T04:02:00Z', tz: 'UTC' };
  assert.equal(getCronSchedule('*/5 * * * *', options).next[0].toISOString(), '2026-09-05T04:05:00.000Z');
  assert.equal(getCronSchedule('0 9 * * 1-5', options).next[0].toISOString(), '2026-09-07T09:00:00.000Z');
  assert.deepEqual(getCronSchedule('0 9 * * 0', options), getCronSchedule('0 9 * * 7', options));
  const leapDays = getCronSchedule('0 0 29 2 *', options).next;
  assert.equal(leapDays.length, 5);
  assert.equal(leapDays[0].toISOString(), '2028-02-29T00:00:00.000Z');
});

test('Cron rejects invalid fields instead of silently normalizing them', () => {
  for (const expression of ['0 0 * *', '0 0 0 * * *', '*/0 * * * *', '60 * * * *', '0 24 * * *', '0 0 * * 8', '0 0 1 13 *', '0 0 30 2 *']) {
    assert.throws(() => getCronSchedule(expression), expression);
  }
});

test('Timestamp parsing validates the entire input and the Date range', () => {
  for (const invalid of ['', '123abc', '1.5', '1e3', 'Infinity', '999999999999999999', '8640000000000001']) {
    assert.throws(() => parseTimestamp(invalid, 'ms'), invalid);
  }
  assert.equal(parseTimestamp('-1', 's').toISOString(), '1969-12-31T23:59:59.000Z');
  assert.equal(parseTimestamp('0', 'ms').getTime(), 0);
  assert.equal(parseTimestamp('8640000000000000', 'ms').getTime(), 8640000000000000);
  assert.equal(parseTimestamp('-8640000000000000', 'ms').getTime(), -8640000000000000);
  assert.throws(() => parseTimestamp('8640000000001', 's'));
});

test('Calendar validation rejects rollovers and observes Gregorian leap years', () => {
  assert.equal(isValidCalendarDate(1949, 12, 31), true);
  assert.equal(isValidCalendarDate(2000, 2, 29), true);
  for (const date of [[1900, 2, 29], [2026, 2, 29], [2026, 4, 31], [2026, 0, 1], [2026, 1, 0]]) {
    assert.equal(isValidCalendarDate(...date), false);
  }
});

test('ID validation and local date parsing work in both positive and negative timezones', () => {
  const appModule = new URL('./support/app.mjs', import.meta.url).href;
  const coreModule = new URL('../src/core.mjs', import.meta.url).href;
  const code = `
    import assert from 'node:assert/strict';
    import { createApp, openTool } from ${JSON.stringify(appModule)};
    import { parseLocalDateTime } from ${JSON.stringify(coreModule)};
    const app = createApp();
    try {
      await openTool(app.window, 'idcard');
      app.window.document.getElementById('idCheck').click();
      assert.equal(app.window.document.getElementById('idStatusText').textContent, '身份证号码有效');
      const date = parseLocalDateTime('2024-02-29 12:34:56');
      assert.deepEqual([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds()], [2024, 1, 29, 12, 34, 56]);
      assert.equal(parseLocalDateTime('0099-01-02 00:00:00').getFullYear(), 99);
      for (const invalid of ['2026-02-29 12:00:00', '2026-04-31 12:00:00', '2026-01-01 24:00:00', '2026-01-01 12:60:00', '2026-01-01 12:00:00junk']) assert.throws(() => parseLocalDateTime(invalid));
      if (process.env.TZ === 'America/Los_Angeles') assert.throws(() => parseLocalDateTime('2026-03-08 02:30:00'));
    } finally { app.window.close(); }
  `;
  for (const timezone of ['Asia/Shanghai', 'America/Los_Angeles']) {
    execFileSync(process.execPath, ['--input-type=module', '-e', code], {
      env: { ...process.env, TZ: timezone }, timeout: 15000, stdio: 'pipe',
    });
  }
});
