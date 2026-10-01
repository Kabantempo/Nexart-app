import test from 'node:test';
import assert from 'node:assert/strict';
import { filterEvents, filterCreators, search, getSearchCount } from '../src/lib/searchUtils';

const events = [
  { id: 'e1', title: 'Marché de Noël', city: 'Strasbourg', region: 'Grand Est', discipline_tags: ['Céramique'] },
  { id: 'e2', title: 'Salon Design', city: 'Lyon', region: 'Auvergne-Rhône-Alpes', discipline_tags: ['Bijoux'] },
  { id: 'e3', title: 'Pop-up', description: 'Artisanat local', city: 'Bordeaux', region: 'Nouvelle-Aquitaine' },
];

const creators = [
  { id: 'c1', full_name: 'Marc Dumont', city: 'Montpellier', disciplines: ['Céramique', 'Poterie'] },
  { id: 'c2', full_name: 'Isabelle Chen', bio: 'Joaillière', city: 'Lyon', disciplines: ['Bijoux'] },
];

test('filterEvents cherche dans titre, description, ville, région et disciplines', () => {
  assert.deepEqual(filterEvents(events, 'noël').map(e => e.id), ['e1']);
  assert.deepEqual(filterEvents(events, 'lyon').map(e => e.id), ['e2']);
  assert.deepEqual(filterEvents(events, 'artisanat').map(e => e.id), ['e3']);
  assert.deepEqual(filterEvents(events, 'grand est').map(e => e.id), ['e1']);
  assert.deepEqual(filterEvents(events, 'bijoux').map(e => e.id), ['e2']);
});

test('une recherche vide renvoie tout', () => {
  assert.equal(filterEvents(events, '   ').length, 3);
  assert.equal(filterCreators(creators, '').length, 2);
});

test('filterCreators cherche dans nom, bio, ville et disciplines', () => {
  assert.deepEqual(filterCreators(creators, 'dumont').map(c => c.id), ['c1']);
  assert.deepEqual(filterCreators(creators, 'joaill').map(c => c.id), ['c2']);
  assert.deepEqual(filterCreators(creators, 'poterie').map(c => c.id), ['c1']);
});

test('search respecte le type demandé', () => {
  const onlyEvents = search(events, creators, { text: 'lyon', type: 'events' });
  assert.equal(onlyEvents.events.length, 1);
  assert.equal(onlyEvents.creators.length, creators.length, 'les créateurs ne sont pas filtrés par le texte');

  const all = search(events, creators, { text: 'lyon', type: 'all' });
  assert.equal(getSearchCount(all), 2);
});

test('search combine ville et discipline', () => {
  const r = search(events, creators, { text: '', type: 'all', city: 'lyon', discipline: 'bijoux' });
  assert.deepEqual(r.events.map(e => e.id), ['e2']);
  assert.deepEqual(r.creators.map(c => c.id), ['c2']);
});
