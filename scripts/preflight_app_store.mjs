import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { config as loadDotEnv } from 'dotenv';

loadDotEnv({ path: '.env' });
loadDotEnv({ path: '.env.local' });

const root = process.cwd();
const errors = [];
const warnings = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function requireEnv(name, description) {
  const value = process.env[name]?.trim();
  if (!value || value.includes('your_') || value.includes('MY_')) {
    errors.push(`${name} is missing or still a placeholder. ${description}`);
  }
  return value;
}

const rcKey = requireEnv('VITE_RC_KEY', 'Set the RevenueCat iOS public SDK key in .env.local before building for App Store.');
if (rcKey && !rcKey.startsWith('appl_')) {
  errors.push('VITE_RC_KEY should be the RevenueCat Apple public SDK key and usually starts with "appl_".');
}

requireEnv('FOCUS_FLOW_DEVELOPMENT_TEAM', 'Set this to the 10-character Apple Developer Team ID used for code signing.');

const app = read('src/App.tsx');
if (app.includes('setHasStudio(true);')) {
  errors.push('Studio still has a free-unlock fallback. Paid features must unlock only after a verified entitlement.');
}

if (app.includes('/Focus-Flow/terms.html') || app.includes('/Focus-Flow/privacy.html')) {
  errors.push('Terms/Privacy links still use the GitHub Pages path. iOS builds need packaged relative links.');
}

if (/soundhelix|picsum/i.test(app)) {
  errors.push('Development/test media URL found. Remove random or test-only remote assets before App Store submission.');
}

const css = read('src/index.css');
if (/googleapis|gstatic|@import\s+url\(/i.test(css)) {
  errors.push('Remote font import found in src/index.css. Native App Store builds should not depend on third-party font requests at launch.');
}

const debugConfig = read('ios/debug.xcconfig');
if (/CAPACITOR_DEBUG\s*=\s*true/i.test(debugConfig)) {
  errors.push('CAPACITOR_DEBUG is true. Turn it off before App Store submission.');
}

const project = read('ios/App/App.xcodeproj/project.pbxproj');
if (!project.includes('DEVELOPMENT_TEAM = "$(FOCUS_FLOW_DEVELOPMENT_TEAM)"')) {
  errors.push('Xcode project is not wired to FOCUS_FLOW_DEVELOPMENT_TEAM for signing.');
}

const privacy = read('privacy.html');
if (!/RevenueCat/i.test(privacy) || !/purchase identifiers/i.test(privacy)) {
  errors.push('Privacy policy must disclose RevenueCat purchase verification data.');
}

const terms = read('terms.html');
if (!/not medical care/i.test(terms)) {
  warnings.push('Terms should keep a clear wellness/not-medical-care notice.');
}

const requiredFiles = [
  'privacy.html',
  'terms.html',
  'public/privacy.html',
  'public/terms.html',
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/Contents.json',
  'ios/App/App/Assets.xcassets/AppIcon.appiconset/AppIcon-512@2x.png',
  'ios/App/App.xcodeproj/project.xcworkspace/xcshareddata/swiftpm/Package.resolved',
];

for (const file of requiredFiles) {
  if (!exists(file)) errors.push(`Required submission file is missing: ${file}`);
}

if (!exists('APP_STORE_SUBMISSION.md')) {
  errors.push('APP_STORE_SUBMISSION.md is missing. Keep review notes, privacy labels, and manual test results with the build.');
}

if (warnings.length) {
  console.warn('App Store preflight warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length) {
  console.error('App Store preflight failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('App Store preflight passed: signing env, RevenueCat env, privacy/legal files, paid unlock safety, and iOS package lock are ready.');
