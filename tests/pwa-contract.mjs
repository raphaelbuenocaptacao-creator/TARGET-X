import fs from 'node:fs';

const sw = fs.readFileSync(new URL('../sw.js', import.meta.url), 'utf8');

const requiredPatterns = [
  ['resilient shell install', /Promise\.allSettled\s*\(/],
  ['omit credentials while precaching', /credentials\s*:\s*['"]omit['"]/],
  ['no-store while precaching', /cache\s*:\s*['"]no-store['"]/],
  ['reject redirects while precaching', /redirect\s*:\s*['"]error['"]/],
  ['sensitive path protection', /SENSITIVE_PATHS/],
  ['sensitive query protection', /SENSITIVE_QUERY_KEYS/],
  ['authorization protection', /authorization/i],
  ['cookie protection', /cookie/i],
  ['partial response protection', /206|content-range/i],
  ['private or no-store response protection', /private|no-store/i],
];

const failures = requiredPatterns
  .filter(([, pattern]) => !pattern.test(sw))
  .map(([label]) => label);

if (failures.length) {
  console.error('TARGET-X PWA contract failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (/cache\.addAll\s*\(/.test(sw)) {
  console.error('TARGET-X PWA contract failed: all-or-nothing cache.addAll() detected');
  process.exit(1);
}

console.log('TARGET-X PWA contract passed.');
