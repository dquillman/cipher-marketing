#!/usr/bin/env node
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'node:fs';

function arg(name) {
  var index = process.argv.indexOf('--' + name);
  return index >= 0 ? process.argv[index + 1] : null;
}

function credential() {
  var keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  if (keyPath) {
    return cert(JSON.parse(readFileSync(keyPath, 'utf8')));
  }
  return applicationDefault();
}

var email = arg('email');
var uid = arg('uid');
if ((!email && !uid) || (email && uid)) {
  console.error('Usage: node scripts/grant-marketing-admin.mjs --email you@example.com');
  console.error('   or: node scripts/grant-marketing-admin.mjs --uid FIREBASE_UID');
  process.exit(2);
}

if (!getApps().length) {
  initializeApp({ credential: credential(), projectId: 'cipher-marketing-daveq' });
}

var auth = getAuth();
var user = email ? await auth.getUserByEmail(email) : await auth.getUser(uid);
var claims = { ...(user.customClaims || {}), marketingAdmin: true };
await auth.setCustomUserClaims(user.uid, claims);

console.log('Granted marketingAdmin to:');
console.log('  uid:   ' + user.uid);
console.log('  email: ' + (user.email || '(none)'));
console.log('The user must sign out and back in to refresh the ID token.');
