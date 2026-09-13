import { parse, stringify } from 'lossless-json';
import { format } from 'sql-formatter';
import { CronExpressionParser } from 'cron-parser';

export { startRegexTask } from './regex-task.mjs';

export function formatJson(input, spaces = 2) {
  return stringify(parse(input), null, spaces);
}

export function formatSql(input, keywordCase = 'upper', indent = '2') {
  return format(input, {
    language: 'sql', keywordCase,
    tabWidth: indent === '4' ? 4 : 2,
    useTabs: indent === 'tab',
  });
}

export function getCronSchedule(input, { currentDate = new Date(), tz, count = 5 } = {}) {
  const parts = input.trim().split(/\s+/);
  if (parts.length !== 5 || parts.some(part => !/^[\d*,/\-]+$/.test(part))) {
    throw new Error('Expected five numeric cron fields');
  }
  const expression = CronExpressionParser.parse(input, { currentDate, tz });
  const names = ['minute', 'hour', 'dayOfMonth', 'month', 'dayOfWeek'];
  return {
    fields: names.map(name => [...new Set(expression.fields[name].values.map(value =>
      name === 'dayOfWeek' && value === 7 ? 0 : value))].sort((a, b) => a - b)),
    dayOr: !expression.fields.dayOfMonth.isWildcard && !expression.fields.dayOfWeek.isWildcard,
    next: expression.take(count).map(date => date.toDate()),
  };
}

export function isValidCalendarDate(year, month, day) {
  if (![year, month, day].every(Number.isInteger) || year < 0 || year > 9999) return false;
  const date = new Date(0);
  date.setUTCFullYear(year, month - 1, day);
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function parseTimestamp(input, unit) {
  const text = input.trim();
  if (!/^[+-]?\d+$/.test(text) || !['s', 'ms'].includes(unit)) throw new Error('Invalid timestamp');
  const milliseconds = Number(text) * (unit === 's' ? 1000 : 1);
  if (!Number.isSafeInteger(milliseconds) || Math.abs(milliseconds) > 8640000000000000) {
    throw new Error('Timestamp out of range');
  }
  return new Date(milliseconds);
}

export function parseLocalDateTime(input) {
  const match = input.trim().match(/^(\d{4})([-/])(\d{2})\2(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2}))?)?$/);
  if (!match) throw new Error('Invalid date format');
  const [, y, , mo, d, h = '0', mi = '0', s = '0'] = match;
  const [year, month, day, hour, minute, second] = [y, mo, d, h, mi, s].map(Number);
  if (!isValidCalendarDate(year, month, day) || hour > 23 || minute > 59 || second > 59) {
    throw new Error('Invalid date');
  }
  const date = new Date(0);
  date.setFullYear(year, month - 1, day);
  date.setHours(hour, minute, second, 0);
  // Reject local times that fall in a daylight-saving gap instead of shifting them.
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day ||
      date.getHours() !== hour || date.getMinutes() !== minute || date.getSeconds() !== second) {
    throw new Error('Local time does not exist');
  }
  return date;
}
