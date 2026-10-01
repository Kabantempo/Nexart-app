import test from 'node:test';
import assert from 'node:assert/strict';
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_CONFIG,
  countByStatus,
  formatRejectionReason,
  toRejectionReason,
} from '../src/utils/applications';

test('les sept statuts de la base ont un libellé', () => {
  assert.equal(APPLICATION_STATUSES.length, 7);
  for (const s of APPLICATION_STATUSES) {
    assert.ok(APPLICATION_STATUS_CONFIG[s].label.length > 0, s);
  }
});

test('countByStatus compte tous les statuts, y compris ceux absents', () => {
  const counts = countByStatus([
    { status: 'pending' },
    { status: 'pending' },
    { status: 'accepted' },
    { status: 'awaiting_payment' },
  ]);
  assert.equal(counts.all, 4);
  assert.equal(counts.pending, 2);
  assert.equal(counts.accepted, 1);
  assert.equal(counts.awaiting_payment, 1);
  assert.equal(counts.refused, 0);
  assert.equal(counts.counter_proposed, 0);
});

test('formatRejectionReason accepte le jsonb du site et l\'ancien texte brut', () => {
  assert.equal(formatRejectionReason(null), null);
  assert.equal(formatRejectionReason(undefined), null);
  assert.equal(formatRejectionReason('  trop tard  '), 'trop tard');
  assert.equal(formatRejectionReason('   '), null);
  assert.equal(formatRejectionReason({ reasons: [] }), null);
  assert.equal(formatRejectionReason({ reasons: ['Complet', 'Hors thème'] }), 'Complet · Hors thème');
});

test('toRejectionReason emballe au format attendu par la base', () => {
  assert.deepEqual(toRejectionReason('Complet'), { reasons: ['Complet'] });
  assert.deepEqual(toRejectionReason(['  A ', '', 'B']), { reasons: ['A', 'B'] });
  assert.equal(toRejectionReason(''), null);
  assert.equal(toRejectionReason(null), null);
  assert.equal(toRejectionReason(['  ']), null);
});
