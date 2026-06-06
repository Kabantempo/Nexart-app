#!/usr/bin/env node

/**
 * Critical Flows Test Script
 * Vérifie les chemins d'utilisateur critiques
 *
 * Usage: node scripts/test-critical-flows.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');

let flowTests = [];

function checkFile(filepath, description) {
  const exists = fs.existsSync(filepath);
  return {
    path: filepath,
    exists,
    description,
    status: exists ? '✅' : '❌',
  };
}

function checkContent(filepath, searchString) {
  if (!fs.existsSync(filepath)) return false;
  const content = fs.readFileSync(filepath, 'utf8');
  return content.includes(searchString);
}

// ─── Flow 1: Auth & Onboarding ────────────────────────────────────────────

console.log('🔐 FLOW 1: Auth & Onboarding');
console.log('   WelcomeScreen → LoginScreen → RoleScreen → CreateProfileScreen\n');

const flow1 = [
  checkFile(path.join(srcDir, 'screens/auth/WelcomeScreen.tsx'), 'Welcome screen'),
  checkFile(path.join(srcDir, 'screens/auth/LoginScreen.tsx'), 'Login with Supabase'),
  checkFile(path.join(srcDir, 'screens/auth/RegisterScreen.tsx'), 'Register new user'),
  checkFile(path.join(srcDir, 'screens/auth/RoleScreen.tsx'), 'Choose creator/organizer'),
  checkFile(path.join(srcDir, 'screens/creator/CreateProfileScreen.tsx'), 'Profile onboarding'),
];

flow1.forEach((test, i) => {
  console.log(`   ${test.status} ${test.description}`);
});

const authFlowOk = flow1.every(t => t.exists);
console.log(`\n   Result: ${authFlowOk ? '✅ READY' : '❌ BROKEN'}\n`);

// ─── Flow 2: Phase 1 — Create Profile ─────────────────────────────────────

console.log('📝 FLOW 2: Phase 1 — Create Profile & Search Events');
console.log('   CreateProfileScreen → SearchEventsScreen → EventDetailScreen\n');

const flow2Checks = [
  {
    file: path.join(srcDir, 'screens/creator/CreateProfileScreen.tsx'),
    requires: ['useState', 'Supabase', 'bio', 'disciplines', 'region', 'city', 'travelRadius'],
    desc: 'Profile form (4 steps)',
  },
  {
    file: path.join(srcDir, 'screens/creator/SearchEventsScreen.tsx'),
    requires: ['useCallback', 'FlatList', 'filtres', 'EventCard'],
    desc: 'Event search & filters',
  },
  {
    file: path.join(srcDir, 'screens/creator/EventDetailScreen.tsx'),
    requires: ['ApplySection', 'candidature', 'event.title'],
    desc: 'Event detail + apply',
  },
];

let flow2Ok = true;
flow2Checks.forEach(check => {
  const exists = fs.existsSync(check.file);
  console.log(`   ${exists ? '✅' : '❌'} ${check.desc}`);
  if (exists) {
    const content = fs.readFileSync(check.file, 'utf8');
    const hasAll = check.requires.every(req => content.includes(req));
    if (!hasAll) {
      console.log(`      ⚠️  Missing some requirements`);
      flow2Ok = false;
    }
  } else {
    flow2Ok = false;
  }
});

console.log(`\n   Result: ${flow2Ok ? '✅ READY' : '⚠️  REVIEW'}\n`);

// ─── Flow 3: Phase 2 — Applications ───────────────────────────────────────

console.log('📋 FLOW 3: Phase 2 — Applications & Candidatures');
console.log('   Apply → ApplicationsScreen → Message → Accept → Pay (Stripe)\n');

const flow3Checks = [
  {
    file: path.join(srcDir, 'screens/creator/ApplicationsScreen.tsx'),
    requires: ['useCreatorApplications', 'STATUS_CONFIG', 'Stripe', 'ReviewModal'],
    desc: 'Creator applications list',
  },
  {
    file: path.join(srcDir, 'screens/organizer/EventApplicationsScreen.tsx'),
    requires: ['applications', 'accept', 'refuse'],
    desc: 'Organizer receives applications',
  },
  {
    file: path.join(srcDir, 'hooks/useApplications.ts'),
    requires: ['useCreatorApplications', 'supabase'],
    desc: 'Applications hook',
  },
];

let flow3Ok = true;
flow3Checks.forEach(check => {
  const exists = fs.existsSync(check.file);
  console.log(`   ${exists ? '✅' : '❌'} ${check.desc}`);
  if (exists) {
    const content = fs.readFileSync(check.file, 'utf8');
    const hasAll = check.requires.every(req => content.includes(req));
    if (!hasAll) {
      const missing = check.requires.filter(req => !content.includes(req));
      console.log(`      ⚠️  Missing: ${missing.join(', ')}`);
      flow3Ok = false;
    }
  } else {
    flow3Ok = false;
  }
});

console.log(`\n   Result: ${flow3Ok ? '✅ READY' : '⚠️  NEEDS WORK'}\n`);

// ─── Flow 4: Phase 2 — Messaging ─────────────────────────────────────────

console.log('💬 FLOW 4: Phase 2 — Real-time Messaging');
console.log('   MessagesScreen → ConversationScreen → Send Message (Realtime)\n');

const flow4Checks = [
  {
    file: path.join(srcDir, 'screens/shared/MessagesScreen.tsx'),
    requires: ['conversations', 'FlatList', 'preview'],
    desc: 'Message conversations list',
  },
  {
    file: path.join(srcDir, 'screens/shared/ConversationScreen.tsx'),
    requires: ['useMessages', 'Realtime', 'TextInput', 'message'],
    desc: 'Real-time chat',
  },
  {
    file: path.join(srcDir, 'hooks/useConversations.ts'),
    requires: ['supabase', 'conversation'],
    desc: 'Conversations hook',
  },
  {
    file: path.join(srcDir, 'hooks/useMessages.ts'),
    requires: ['Realtime', 'subscribe'],
    desc: 'Messages real-time hook',
  },
];

let flow4Ok = true;
flow4Checks.forEach(check => {
  const exists = fs.existsSync(check.file);
  console.log(`   ${exists ? '✅' : '❌'} ${check.desc}`);
  if (exists) {
    const content = fs.readFileSync(check.file, 'utf8');
    const hasAll = check.requires.every(req => content.includes(req));
    if (!hasAll) {
      const missing = check.requires.filter(req => !content.includes(req));
      console.log(`      ⚠️  Missing: ${missing.join(', ')}`);
      flow4Ok = false;
    }
  } else {
    flow4Ok = false;
  }
});

console.log(`\n   Result: ${flow4Ok ? '✅ READY' : '⚠️  NEEDS WORK'}\n`);

// ─── Flow 5: Organizer Flow ───────────────────────────────────────────────

console.log('🗓️  FLOW 5: Organizer — Create Event & Receive Applications');
console.log('   HomeScreen → CreateEventScreen → ManageEventsScreen → EventApplicationsScreen\n');

const flow5Checks = [
  {
    file: path.join(srcDir, 'screens/organizer/HomeScreen.tsx'),
    requires: ['organizer', 'dashboard'],
    desc: 'Organizer home',
  },
  {
    file: path.join(srcDir, 'screens/organizer/CreateEventScreen.tsx'),
    requires: ['event', 'title', 'start_date', 'Supabase'],
    desc: 'Create event form',
  },
  {
    file: path.join(srcDir, 'screens/organizer/ManageEventsScreen.tsx'),
    requires: ['events', 'FlatList'],
    desc: 'Manage events',
  },
  {
    file: path.join(srcDir, 'screens/organizer/EventApplicationsScreen.tsx'),
    requires: ['applications', 'accept', 'refuse'],
    desc: 'View applications',
  },
];

let flow5Ok = true;
flow5Checks.forEach(check => {
  const exists = fs.existsSync(check.file);
  console.log(`   ${exists ? '✅' : '❌'} ${check.desc}`);
  if (!exists) flow5Ok = false;
});

console.log(`\n   Result: ${flow5Ok ? '✅ READY' : '❌ INCOMPLETE'}\n`);

// ─── Summary ──────────────────────────────────────────────────────────────

console.log('='.repeat(60));
console.log('📊 CRITICAL FLOWS SUMMARY');
console.log('='.repeat(60) + '\n');

const flows = [
  { name: 'Auth & Onboarding', ok: authFlowOk },
  { name: 'Phase 1 (Profile + Search + Apply)', ok: flow2Ok },
  { name: 'Phase 2 (Applications + Payments)', ok: flow3Ok },
  { name: 'Phase 2 (Real-time Messaging)', ok: flow4Ok },
  { name: 'Organizer (Create + Manage)', ok: flow5Ok },
];

flows.forEach(flow => {
  console.log(`${flow.ok ? '✅' : '⚠️'} ${flow.name}`);
});

const allOk = flows.every(f => f.ok);
const count = flows.filter(f => f.ok).length;

console.log('\n' + '='.repeat(60));
console.log(`Status: ${count}/${flows.length} flows ready`);
console.log('='.repeat(60) + '\n');

if (allOk) {
  console.log('🎉 All critical flows are READY for testing!\n');
  console.log('Next: Run "expo start" and test manually:\n');
  console.log('1. Login/Register → CreateProfile → SearchEvents → Apply');
  console.log('2. Applications → Send Message → Chat');
  console.log('3. Organizer: Create Event → Accept Application → Pay\n');
  process.exit(0);
} else {
  console.log('⚠️  Some flows need review. See details above.\n');
  process.exit(1);
}
