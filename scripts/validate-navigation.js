#!/usr/bin/env node

/**
 * Navigation Validation Script
 * Vérifie que tous les navigateurs et écrans sont correctement branchés
 *
 * Usage: node scripts/validate-navigation.js
 */

const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'src');
const navigationDir = path.join(srcDir, 'navigation');
const screensDir = path.join(srcDir, 'screens');

let errors = [];
let warnings = [];
let passes = [];

// ─── Utilitaires ──────────────────────────────────────────────────────────

function readFile(filepath) {
  try {
    return fs.readFileSync(filepath, 'utf8');
  } catch (e) {
    return null;
  }
}

function fileExists(filepath) {
  return fs.existsSync(filepath);
}

function getScreens(type) {
  const dir = path.join(screensDir, type);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));
}

function extractExports(content) {
  const defaultExportMatch = content.match(/export\s+default\s+(?:function|const)\s+(\w+)/);
  const namedExports = content.match(/export\s+(?:function|const|interface|type)\s+(\w+)/g) || [];

  return {
    default: defaultExportMatch ? defaultExportMatch[1] : null,
    named: namedExports.map(e => e.match(/(\w+)$/)[1]),
  };
}

function extractImports(content) {
  const importPattern = /import\s+(?:{[\s\S]*?}|[\w]+|\*\s+as\s+\w+)\s+from\s+['"]([^'"]+)['"]/g;
  const imports = [];
  let match;

  while ((match = importPattern.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
}

// ─── Tests ────────────────────────────────────────────────────────────────

console.log('🔍 Validating Navigation Architecture...\n');

// 1. Vérifier que RootNavigator existe et importe tous les navigateurs
console.log('Test 1: RootNavigator imports');
const rootNavFile = path.join(navigationDir, 'index.tsx');
if (!fileExists(rootNavFile)) {
  errors.push('RootNavigator (src/navigation/index.tsx) not found');
} else {
  const rootContent = readFile(rootNavFile);
  const imports = extractImports(rootContent);

  const expectedNavigators = [
    'AuthNavigator',
    'CreatorNavigator',
    'OrganizerNavigator',
    'VisitorNavigator',
  ];

  expectedNavigators.forEach(nav => {
    if (imports.some(i => i.includes(nav))) {
      passes.push(`✓ RootNavigator imports ${nav}`);
    } else {
      errors.push(`RootNavigator missing import for ${nav}`);
    }
  });
}

// 2. Vérifier que tous les navigateurs existent
console.log('\nTest 2: Navigator files exist');
const navigators = [
  'AuthNavigator.tsx',
  'CreatorNavigator.tsx',
  'OrganizerNavigator.tsx',
  'VisitorNavigator.tsx',
  'MarketStack.tsx',
  'DiscoverStack.tsx',
  'FeedStack.tsx',
  'MessageStack.tsx',
  'OrganizerEventStack.tsx',
];

navigators.forEach(nav => {
  const navPath = path.join(navigationDir, nav);
  if (fileExists(navPath)) {
    passes.push(`✓ ${nav} exists`);
  } else {
    errors.push(`Navigator missing: ${nav}`);
  }
});

// 3. Vérifier que les écrans existent et sont exportés
console.log('\nTest 3: Screen files and exports');
const screenTypes = ['auth', 'creator', 'organizer', 'shared', 'discover', 'feed', 'visitor'];

screenTypes.forEach(type => {
  const screens = getScreens(type);
  screens.forEach(screenFile => {
    const screenPath = path.join(screensDir, type, screenFile);
    const content = readFile(screenPath);

    if (!content) {
      errors.push(`Cannot read screen: ${type}/${screenFile}`);
      return;
    }

    const exports = extractExports(content);
    if (!exports.default) {
      warnings.push(`Screen missing default export: ${type}/${screenFile}`);
    } else {
      passes.push(`✓ ${type}/${screenFile} exports ${exports.default}`);
    }
  });
});

// 4. Vérifier les imports dans chaque navigateur
console.log('\nTest 4: Navigator imports match screen files');

const navigatorTests = [
  {
    file: 'AuthNavigator.tsx',
    expectedScreens: ['LoginScreen', 'RegisterScreen', 'RoleScreen', 'WelcomeScreen'],
  },
  {
    file: 'CreatorNavigator.tsx',
    expectedScreens: ['FeedStack', 'MarketStack', 'ApplicationsScreen', 'MessageStack', 'ProfileScreen'],
  },
  {
    file: 'OrganizerNavigator.tsx',
    expectedScreens: ['HomeScreen', 'OrganizerEventStack', 'MessageStack', 'ProfileScreen'],
  },
  {
    file: 'MarketStack.tsx',
    expectedScreens: ['SearchEventsScreen', 'EventDetailScreen', 'CreateProfileScreen'],
  },
  {
    file: 'MessageStack.tsx',
    expectedScreens: ['MessagesScreen', 'ConversationScreen'],
  },
];

navigatorTests.forEach(test => {
  const navPath = path.join(navigationDir, test.file);
  if (!fileExists(navPath)) {
    errors.push(`Navigator file missing: ${test.file}`);
    return;
  }

  const content = readFile(navPath);
  test.expectedScreens.forEach(screen => {
    if (content.includes(screen)) {
      passes.push(`✓ ${test.file} imports ${screen}`);
    } else {
      warnings.push(`${test.file} may be missing import for ${screen}`);
    }
  });
});

// 5. Vérifier les types de navigation
console.log('\nTest 5: Navigation type definitions');

const typeTests = [
  {
    file: 'MarketStack.tsx',
    expectedTypes: ['EventList', 'EventDetail', 'CreateProfile'],
  },
  {
    file: 'MessageStack.tsx',
    expectedTypes: ['Messages', 'Conversation'],
  },
];

typeTests.forEach(test => {
  const navPath = path.join(navigationDir, test.file);
  if (!fileExists(navPath)) return;

  const content = readFile(navPath);
  test.expectedTypes.forEach(type => {
    if (content.includes(type)) {
      passes.push(`✓ ${test.file} defines route ${type}`);
    } else {
      warnings.push(`${test.file} may be missing route type ${type}`);
    }
  });
});

// 6. Vérifier que les écrans utilisent les bons props
console.log('\nTest 6: Screen props usage');

const screenPropsTests = [
  {
    file: 'SearchEventsScreen.tsx',
    dir: 'creator',
    expectedProps: ['navigation', 'route'],
  },
  {
    file: 'EventDetailScreen.tsx',
    dir: 'creator',
    expectedProps: ['navigation', 'route'],
  },
  {
    file: 'ApplicationsScreen.tsx',
    dir: 'creator',
    expectedProps: ['navigation'],
  },
  {
    file: 'MessagesScreen.tsx',
    dir: 'shared',
    expectedProps: ['navigation'],
  },
];

screenPropsTests.forEach(test => {
  const screenPath = path.join(screensDir, test.dir, test.file);
  if (!fileExists(screenPath)) {
    errors.push(`Screen missing: ${test.dir}/${test.file}`);
    return;
  }

  const content = readFile(screenPath);
  const hasNavigation = content.includes('navigation') || content.includes('useNavigation');
  const hasRoute = content.includes('route') || content.includes('useRoute');

  if (test.expectedProps.includes('navigation') && hasNavigation) {
    passes.push(`✓ ${test.file} uses navigation`);
  } else if (test.expectedProps.includes('navigation')) {
    warnings.push(`${test.file} may not be using navigation correctly`);
  }

  if (test.expectedProps.includes('route') && hasRoute) {
    passes.push(`✓ ${test.file} uses route params`);
  }
});

// ─── Rapport final ────────────────────────────────────────────────────────

console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION REPORT');
console.log('='.repeat(60) + '\n');

if (passes.length > 0) {
  console.log(`✅ Passed (${passes.length}):`);
  passes.slice(0, 10).forEach(p => console.log(`   ${p}`));
  if (passes.length > 10) console.log(`   ... and ${passes.length - 10} more`);
  console.log();
}

if (warnings.length > 0) {
  console.log(`⚠️  Warnings (${warnings.length}):`);
  warnings.forEach(w => console.log(`   ⚠️  ${w}`));
  console.log();
}

if (errors.length > 0) {
  console.log(`❌ Errors (${errors.length}):`);
  errors.forEach(e => console.log(`   ❌ ${e}`));
  console.log();
}

// Summary
const total = passes.length + warnings.length + errors.length;
const score = Math.round((passes.length / total) * 100);

console.log('='.repeat(60));
console.log(`Score: ${score}% (${passes.length}/${total})`);
console.log('='.repeat(60));

if (errors.length > 0) {
  console.log('\n🔴 Navigation has CRITICAL issues — cannot launch');
  process.exit(1);
} else if (warnings.length > 0) {
  console.log('\n🟡 Navigation has warnings — review before launch');
  process.exit(0);
} else {
  console.log('\n✅ Navigation is VALID — ready to test flows');
  process.exit(0);
}
