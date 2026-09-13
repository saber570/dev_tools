const MAX_INPUT = 1000000;
const MAX_OUTPUT = 1000000;
const MAX_MATCHES = 1000;
const MAX_REPLACEMENTS = 10000;

function fail(code) {
  throw Object.assign(new Error(code), { code });
}

function runRegex({ operation, pattern, flags, text, replacement = '' }) {
  if (text.length > MAX_INPUT || pattern.length > 10000 || replacement.length > MAX_OUTPUT) fail('INPUT_LIMIT');
  const regex = new RegExp(pattern, flags);
  if (operation === 'match') {
    const matcher = regex.global ? regex : new RegExp(regex.source, regex.flags + 'g');
    const matches = [];
    let size = 0, truncated = false;
    for (const match of text.matchAll(matcher)) {
      size += match.reduce((sum, value) => sum + (value?.length || 0), 0);
      if (matches.length >= MAX_MATCHES || size > MAX_OUTPUT) { truncated = true; break; }
      matches.push({ value: match[0], index: match.index, groups: match.slice(1) });
    }
    return { matches, truncated };
  }
  if (operation !== 'replace') fail('INVALID_OPERATION');

  // Bound native replacement expansion, including $` and $', before allocating the output.
  const substitutions = replacement.match(/\$(?:[$&`']|\d{1,2}|<[^>]*>)/g) || [];
  const matches = regex.global ? text.matchAll(regex) : [new RegExp(regex.source, regex.flags).exec(text)].filter(Boolean);
  let count = 0, upperBound = text.length;
  for (const match of matches) {
    if (++count > MAX_REPLACEMENTS) fail('REPLACE_LIMIT');
    upperBound += replacement.length - match[0].length;
    for (const token of substitutions) {
      if (token === '$$') continue;
      if (token === '$`' || token === "$'") upperBound += text.length;
      else if (token === '$&') upperBound += match[0].length;
      else if (token.startsWith('$<')) upperBound += match.groups?.[token.slice(2, -1)]?.length || 0;
      else {
        const index = Number(token.slice(1));
        upperBound += Math.max(match[index]?.length || 0, match[Number(token[1])]?.length || 0);
      }
    }
    if (upperBound > MAX_OUTPUT) fail('OUTPUT_LIMIT');
  }
  return { text: text.replace(regex, replacement) };
}

self.onmessage = ({ data }) => {
  try {
    self.postMessage({ ok: true, result: runRegex(data) });
  } catch (error) {
    self.postMessage({ ok: false, error: { code: error.code || 'REGEX', message: error.message } });
  }
};
