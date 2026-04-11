#!/usr/bin/env node
/**
 * set-admin-claim.mjs
 *
 * Grant or revoke the `admin: true` custom claim on a Firebase Auth user.
 *
 * Usage:
 *   node scripts/set-admin-claim.mjs --env <dev|prod> --email <email> [--revoke] [--key <path>]
 *
 * Options:
 *   --env     dev  → ebook-staging-16b0a
 *             prod → digitallearningvault-5912c
 *   --email   The user's email address
 *   --revoke  Remove the admin claim instead of granting it
 *   --key     Path to the service-account JSON key file.
 *             Defaults:
 *               dev  → ~/.config/firebase-keys/ebook-staging.json
 *               prod → ~/.config/firebase-keys/ebook-prod.json
 *
 * Download keys from:
 *   Firebase Console → <project> → Project Settings → Service Accounts
 *   → Generate new private key
 *
 * Store keys OUTSIDE the repo:
 *   ~/.config/firebase-keys/ebook-staging.json
 *   ~/.config/firebase-keys/ebook-prod.json
 */

import { createRequire } from 'module';
import { resolve } from 'path';
import { homedir } from 'os';
import { readFileSync, existsSync } from 'fs';

const require = createRequire(import.meta.url);

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);

function flag(name) {
  const i = args.indexOf(name);
  return i !== -1 ? args[i + 1] : undefined;
}

const env = flag('--env');
const email = flag('--email');
const keyOverride = flag('--key');
const revoke = args.includes('--revoke');

if (!env || !['dev', 'prod'].includes(env)) {
  console.error('Error: --env must be "dev" or "prod"');
  process.exit(1);
}
if (!email) {
  console.error('Error: --email is required');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Config per environment
// ---------------------------------------------------------------------------
const ENV_CONFIG = {
  dev: {
    projectId: 'ebook-staging-16b0a',
    defaultKey: resolve(homedir(), '.config/firebase-keys/ebook-staging.json'),
  },
  prod: {
    projectId: 'digitallearningvault-5912c',
    defaultKey: resolve(homedir(), '.config/firebase-keys/ebook-prod.json'),
  },
};

const { projectId, defaultKey } = ENV_CONFIG[env];
const keyPath = keyOverride ? resolve(keyOverride) : defaultKey;

if (!existsSync(keyPath)) {
  console.error(`Error: service-account key not found at: ${keyPath}`);
  console.error(
    'Download it from Firebase Console → Project Settings → Service Accounts → Generate new private key'
  );
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load service account and initialise Admin SDK
// ---------------------------------------------------------------------------
const serviceAccount = JSON.parse(readFileSync(keyPath, 'utf8'));

// Dynamic import of firebase-admin (ESM-compatible)
const admin = (await import('firebase-admin')).default;

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId,
  });
}

const auth = admin.auth();

// ---------------------------------------------------------------------------
// Grant / revoke claim
// ---------------------------------------------------------------------------
try {
  const user = await auth.getUserByEmail(email);
  const existingClaims = user.customClaims ?? {};

  if (revoke) {
    const { admin: _removed, ...rest } = existingClaims;
    await auth.setCustomUserClaims(user.uid, rest);
    console.log(`✓ Revoked admin claim for ${email} on project ${projectId}`);
  } else {
    await auth.setCustomUserClaims(user.uid, { ...existingClaims, admin: true });
    console.log(`✓ Granted admin claim to ${email} on project ${projectId}`);
  }

  console.log(
    'The user must log out and back in (or wait for token refresh ~1 hour) for the change to take effect.'
  );
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    console.error(`Error: No user found with email "${email}" in project ${projectId}`);
  } else {
    console.error('Error setting custom claim:', err.message);
  }
  process.exit(1);
}
