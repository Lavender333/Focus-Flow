import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8');

const expectedSolfeggio = [174, 285, 396, 417, 528, 639, 741, 852, 963];
const expectedChantGuides = [
  ['voo', 98],
  ['mom', 130.81],
  ['err', 98],
  ['hum', 130.81],
  ['om', 136.1],
  ['mmm', 130.81],
  ['si', 220],
  ['chui', 196],
  ['xu', 174.61],
  ['he', 220],
  ['hu', 196],
  ['xi', 261.63],
  ['lam', 256],
  ['vam', 288],
  ['ram', 320],
  ['yam', 341.3],
  ['ham', 384],
  ['eee', 480],
  ['aaa', 341.3],
  ['ooo', 256],
  ['why', 256],
];
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

for (const hz of expectedSolfeggio) {
  const entryPattern = new RegExp(`\\{ id: '${hz}', hz: ${hz}[,}]`);
  if (!entryPattern.test(solfeggioBlock)) {
    fail(`Solfeggio id ${hz} must match its displayed ${hz}Hz value.`);
  }
}

const schumannMatch = source.match(/const SCHUMANN_RESONANCE_HZ = ([0-9.]+);/);
if (!schumannMatch || Number(schumannMatch[1]) !== 7.83) {
  fail(`Schumann anchor must remain the common rounded 7.83Hz reference.`);
}

const chantBlock = source.match(/const SONIC_CHANTS:[\s\S]*?\n\];/)?.[0] ?? '';
for (const [id, expectedHz] of expectedChantGuides) {
  const match = chantBlock.match(new RegExp(`id: '${id}'[\\s\\S]*?referenceHz:\\s*([0-9.]+)`));
  if (!match) {
    fail(`Missing chant guide reference for ${id}.`);
    continue;
  }

  const actual = Number(match[1]);
  if (Math.abs(actual - expectedHz) > 0.01) {
    fail(`${id} chant guide should be ${expectedHz}Hz. Got ${actual}Hz.`);
  }
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

if (!source.includes('const [isHealingMode, setIsHealingMode] = useState(false);')) {
  fail('Binaural mode must default off so frequency buttons play exact pure tones by default.');
}

if (!source.includes('osc1.frequency.setValueAtTime(freq.hz, now);')) {
  fail('Pure Solfeggio playback must set oscillator frequency to the selected Hz exactly.');
}

if (!source.includes('osc1.frequency.setValueAtTime(freq.hz - 3, now);') || !source.includes('osc2.frequency.setValueAtTime(freq.hz + 3, now);')) {
  fail('Binaural playback must use ±3Hz carriers around the selected center tone.');
}

if (process.exitCode) {
  process.exit();
}

console.log('Frequency audit passed: Solfeggio set, chant guides, Schumann anchor, binaural carriers, and A4=440 handpan notes are correct.');
