import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

const expectedSolfeggio = [174, 285, 396, 417, 528, 639, 741, 852, 963];
const expectedHandpan = [
  ['D3', 50, 146.83],
  ['A3', 57, 220.00],
  ['Bb3', 58, 233.08],
  ['C4', 60, 261.63],
  ['D4', 62, 293.66],
  ['E4', 64, 329.63],
  ['F4', 65, 349.23],
  ['G4', 67, 392.00],
  ['A4', 69, 440.00],
];

function fail(message) {
  console.error(`Frequency audit failed: ${message}`);
  process.exitCode = 1;
}

const solfeggioBlock = source.match(/const SOLFEGGIO_FREQUENCIES:[\s\S]*?\n\];/)?.[0] ?? '';
const actualSolfeggio = [...solfeggioBlock.matchAll(/hz:\s*([0-9.]+)/g)].map((match) => Number(match[1]));
if (JSON.stringify(actualSolfeggio) !== JSON.stringify(expectedSolfeggio)) {
  fail(`Solfeggio set drifted. Expected ${expectedSolfeggio.join(', ')}, got ${actualSolfeggio.join(', ')}`);
}

const schumannMatch = source.match(/const SCHUMANN_RESONANCE_HZ = ([0-9.]+);/);
if (!schumannMatch || Number(schumannMatch[1]) !== 7.83) {
  fail(`Schumann anchor must remain the common rounded 7.83Hz reference.`);
}

const handpanBlock = source.match(/const HANDPAN_NOTES = \[[\s\S]*?\n\];/)?.[0] ?? '';
for (const [label, midi, roundedExpected] of expectedHandpan) {
  const match = handpanBlock.match(new RegExp(`freq:\\s*([0-9.]+), label:\\s*'${label}'`));
  if (!match) {
    fail(`Missing handpan note ${label}.`);
    continue;
  }

  const actual = Number(match[1]);
  const calculated = 440 * Math.pow(2, (midi - 69) / 12);
  if (Math.abs(actual - calculated) > 0.01 || Math.abs(actual - roundedExpected) > 0.01) {
    fail(`${label} should be ${roundedExpected.toFixed(2)}Hz using A4=440Hz. Got ${actual}Hz.`);
  }
}

if (process.exitCode) {
  process.exit();
}

console.log('Frequency audit passed: Solfeggio set, Schumann anchor, and A4=440 handpan notes are correct.');
