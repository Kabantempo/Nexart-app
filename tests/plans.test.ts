import test from 'node:test';
import assert from 'node:assert/strict';
import { TIER_LIMITS, TIER_LABELS, TIER_MONTHLY_PRICE, TIER_PRICE_IDS, CREDIT_PACKS, formatPrice } from '../src/constants/plans';

test('formatPrice affiche les centimes en euros, à la française', () => {
  assert.equal(formatPrice(0), 'Gratuit');
  assert.equal(formatPrice(599), '5,99 €');
  assert.equal(formatPrice(1499), '14,99 €');
  assert.equal(formatPrice(7900), '79,00 €');
});

test('chaque offre a des limites, un libellé et un prix', () => {
  const tiers = Object.keys(TIER_LIMITS).sort();
  assert.deepEqual(Object.keys(TIER_LABELS).sort(), tiers);
  assert.deepEqual(Object.keys(TIER_MONTHLY_PRICE).sort(), tiers);
});

test('les prix mensuels sont des entiers en centimes', () => {
  for (const [tier, cents] of Object.entries(TIER_MONTHLY_PRICE)) {
    assert.ok(Number.isInteger(cents) && cents >= 0, tier);
  }
  assert.equal(TIER_MONTHLY_PRICE.free, 0);
});

test('les packs de crédits sont cohérents', () => {
  assert.ok(CREDIT_PACKS.length > 0);
  for (const p of CREDIT_PACKS) {
    assert.ok(p.amount > 0 && Number.isInteger(p.amount), p.key);
    assert.ok(p.credits > 0, p.key);
    assert.ok(p.label.length > 0, p.key);
  }
  const keys = CREDIT_PACKS.map(p => p.key);
  assert.equal(new Set(keys).size, keys.length, 'clés uniques');
});

test('chaque offre payante a un identifiant de prix Stripe, et chaque pack aussi', () => {
  for (const tier of Object.keys(TIER_LIMITS)) {
    if (tier === 'free') assert.equal(TIER_PRICE_IDS[tier as keyof typeof TIER_PRICE_IDS], undefined);
    else assert.match(String(TIER_PRICE_IDS[tier as keyof typeof TIER_PRICE_IDS]), /^price_/, tier);
  }
  const ids = [...Object.values(TIER_PRICE_IDS), ...CREDIT_PACKS.map(p => p.priceId)];
  assert.equal(new Set(ids).size, ids.length, 'identifiants de prix uniques');
  for (const p of CREDIT_PACKS) assert.match(p.priceId, /^price_/, p.key);
});
