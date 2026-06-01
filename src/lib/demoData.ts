// ============================================================
// NEXART — Données de démonstration
// Mettre DEMO_MODE = false avant la mise en production
// ============================================================
export const DEMO_MODE = true;

// ─── 3 images de test (picsum.photos — toujours disponibles) ─

const IMG1 = 'https://picsum.photos/seed/nexart-a/800/500'; // paysage chaud
const IMG2 = 'https://picsum.photos/seed/nexart-b/800/500'; // texture craft
const IMG3 = 'https://picsum.photos/seed/nexart-c/800/500'; // portrait

export const PHOTOS = {
  // Marchés / événements
  marche1: IMG1, marche2: IMG2, marche3: IMG3,
  marche4: IMG1, marche5: IMG2,
  // Portfolios créateurs
  cera1: IMG2, cera2: IMG3, cera3: IMG1,
  bij1:  IMG3, bij2:  IMG1, bij3:  IMG2,
  tat1:  IMG1, tat2:  IMG2, tat3:  IMG3,
  tex1:  IMG2, tex2:  IMG3,
  // Avatars
  av1: IMG3, av2: IMG1, av3: IMG2,
  av4: IMG3, av5: IMG1,
  av6: IMG2, av7: IMG3,
};

// ─── Événements ──────────────────────────────────────────

export const DEMO_EVENTS = [
  {
    id: 'demo-event-1',
    organizer_id: 'demo-org-1',
    title: 'Marché des Créateurs Bastille — Juin 2026',
    description: 'Le marché incontournable des créateurs indépendants au cœur du 11e. Chaque week-end de juin, 35 stands soigneusement sélectionnés pour un public passionné d\'artisanat authentique.',
    event_type: 'permanent' as const,
    theme: ['Artisanat général', 'Design', 'Bijoux'],
    location: 'Place de la Bastille', city: 'Paris', region: 'Île-de-France', department: '75',
    lat: 48.8533, lng: 2.3692,
    start_date: '2026-06-07', end_date: '2026-06-29',
    start_time: '10:00', end_time: '19:00',
    stand_count: 35, stand_price: 120, stand_dimensions: '2m × 2m',
    discipline_tags: ['Tatouage', 'Illustration', 'Céramique', 'Bijoux', 'Joaillerie', 'Textile'],
    cover_image: PHOTOS.marche1,
    media: [PHOTOS.marche2, PHOTOS.marche3],
    rules: 'Stand propre obligatoire. RC Pro requise. Installation dès 8h30. Commission 0%.',
    stripe_enabled: true, status: 'published' as const,
    created_at: '2026-01-15T10:00:00Z',
  },
  {
    id: 'demo-event-2',
    organizer_id: 'demo-org-2',
    title: 'Salon du Design & Craft Lyon — Automne 2026',
    description: '5e édition du Salon Design & Craft de Lyon. 3 jours d\'exposition dans la Halle Tony Garnier. 80 exposants sélectionnés, conférences, ateliers et démonstrations live.',
    event_type: 'salon' as const,
    theme: ['Design', 'Artisanat contemporain'],
    location: 'Halle Tony Garnier', city: 'Lyon', region: 'Auvergne-Rhône-Alpes', department: '69',
    lat: 45.7305, lng: 4.8291,
    start_date: '2026-10-09', end_date: '2026-10-11',
    start_time: '10:00', end_time: '20:00',
    stand_count: 80, stand_price: 450, stand_dimensions: '3m × 2m',
    discipline_tags: ['Céramique', 'Joaillerie', 'Bijoux', 'Gravure', 'Verrerie', 'Sculpture'],
    cover_image: PHOTOS.marche4,
    media: [PHOTOS.marche5, PHOTOS.marche1],
    rules: 'Sélection sur portfolio. RC Pro + Décennale obligatoires. 3 invitations presse par exposant.',
    stripe_enabled: true, status: 'published' as const,
    created_at: '2026-02-01T10:00:00Z',
  },
  {
    id: 'demo-event-3',
    organizer_id: 'demo-org-1',
    title: 'Pop-up Artisanat Bordeaux — Été 2026',
    description: 'Pop-up éphémère au Marché des Chartrons. Créateurs et artisans régionaux, ambiance conviviale et musique live.',
    event_type: 'popup' as const,
    theme: ['Artisanat régional', 'Made in Sud-Ouest'],
    location: 'Marché des Chartrons', city: 'Bordeaux', region: 'Nouvelle-Aquitaine', department: '33',
    lat: 44.8603, lng: -0.5576,
    start_date: '2026-07-18', end_date: '2026-07-19',
    start_time: '10:00', end_time: '18:00',
    stand_count: 20, stand_price: 80, stand_dimensions: '2m × 1,5m',
    discipline_tags: ['Céramique', 'Maroquinerie', 'Textile', 'Broderie', 'Bougies'],
    cover_image: PHOTOS.marche5,
    media: [PHOTOS.marche2],
    rules: 'Créateurs locaux en priorité. RC Pro recommandée.',
    stripe_enabled: false, status: 'published' as const,
    created_at: '2026-03-10T10:00:00Z',
  },
  {
    id: 'demo-event-4',
    organizer_id: 'demo-org-2',
    title: 'Marché de Noël Artisanal Strasbourg 2026',
    description: 'Stand au sein du célèbre Marché de Noël de Strasbourg. Section "Artisans d\'exception" — créateurs français sélectionnés pour la qualité de leur travail.',
    event_type: 'fair' as const,
    theme: ['Noël', 'Cadeaux', 'Artisanat d\'exception'],
    location: 'Place de la Cathédrale', city: 'Strasbourg', region: 'Grand Est', department: '67',
    lat: 48.5818, lng: 7.7510,
    start_date: '2026-11-27', end_date: '2026-12-31',
    start_time: '11:00', end_time: '20:00',
    stand_count: 25, stand_price: 1200, stand_dimensions: '2,5m × 2m',
    discipline_tags: ['Joaillerie', 'Bijoux', 'Gravure', 'Verrerie', 'Calligraphie'],
    cover_image: PHOTOS.marche3,
    media: [PHOTOS.marche4, PHOTOS.marche5],
    rules: 'Sélection rigoureuse sur dossier. 100% fait main obligatoire.',
    stripe_enabled: true, status: 'published' as const,
    created_at: '2026-01-20T10:00:00Z',
  },
  {
    id: 'demo-event-5',
    organizer_id: 'demo-org-1',
    title: 'Marché Bio & Craft Nantes — Été 2026',
    description: 'Marché hebdomadaire estival alliant artisanat et produits bio. Chaque dimanche de juillet-août sur le Quai de la Fosse.',
    event_type: 'seasonal' as const,
    theme: ['Bio', 'Artisanat', 'Été'],
    location: 'Quai de la Fosse', city: 'Nantes', region: 'Pays de la Loire', department: '44',
    lat: 47.2151, lng: -1.5659,
    start_date: '2026-07-05', end_date: '2026-08-30',
    start_time: '10:00', end_time: '19:00',
    stand_count: 30, stand_price: 95, stand_dimensions: '2m × 2m',
    discipline_tags: ['Céramique', 'Illustration', 'Macramé', 'Broderie', 'Bougies', 'Cosmétique naturelle'],
    cover_image: PHOTOS.marche2,
    media: [PHOTOS.marche1, PHOTOS.marche3],
    rules: 'Ouverture à tous les créateurs. Stand partagé possible.',
    stripe_enabled: false, status: 'published' as const,
    created_at: '2026-02-28T10:00:00Z',
  },
];

// ─── Créateurs publics ────────────────────────────────────

export const DEMO_CREATORS = [
  {
    id: 'demo-creator-1',
    full_name: 'Sophie Leroux',
    avatar_url: PHOTOS.av1,
    bio: 'Tatoueuse fine line & aquarelle depuis 8 ans. Je crée des œuvres délicates inspirées de la nature et du japonisme. SIRET validé, RC Pro Maif.',
    disciplines: ['Tatouage', 'Illustration'],
    city: 'Paris', region: 'Île-de-France', department: '75',
    travel_radius: 'national' as const,
    portfolio_images: [PHOTOS.tat1, PHOTOS.tat2, PHOTOS.tat3],
    website: 'https://sophieleroux.fr',
    instagram: '@sophie_leroux_tattoo',
    etsy: null,
    siret_verified: true,
    insurance_verified: true,
    availability: { weekends: true, custom: [] },
  },
  {
    id: 'demo-creator-2',
    full_name: 'Marc Dumont',
    avatar_url: PHOTOS.av2,
    bio: 'Céramiste indépendant. Je travaille la grès et la porcelaine pour créer de la vaisselle fonctionnelle et des pièces décoratives. Atelier à Montpellier.',
    disciplines: ['Céramique', 'Poterie'],
    city: 'Montpellier', region: 'Occitanie', department: '34',
    travel_radius: '25' as const,
    portfolio_images: [PHOTOS.cera1, PHOTOS.cera2, PHOTOS.cera3],
    website: null,
    instagram: '@marc_ceramique',
    etsy: 'https://etsy.com/shop/marcdumont',
    siret_verified: true,
    insurance_verified: false,
    availability: { weekends: true, custom: [] },
  },
  {
    id: 'demo-creator-3',
    full_name: 'Isabelle Chen',
    avatar_url: PHOTOS.av3,
    bio: 'Joaillière créatrice franco-taïwanaise. Bijoux en or recyclé et pierres semi-précieuses, façonnés à la main dans mon atelier parisien du 11e.',
    disciplines: ['Joaillerie', 'Bijoux'],
    city: 'Paris', region: 'Île-de-France', department: '75',
    travel_radius: '10' as const,
    portfolio_images: [PHOTOS.bij1, PHOTOS.bij2, PHOTOS.bij3],
    website: 'https://isabellechen.com',
    instagram: '@isabelle_chen_bijoux',
    etsy: null,
    siret_verified: true,
    insurance_verified: true,
    availability: { weekends: true, custom: [] },
  },
  {
    id: 'demo-creator-4',
    full_name: 'Lucas Bernard',
    avatar_url: PHOTOS.av4,
    bio: 'Brodeur et designer textile. Je crée des pièces uniques alliant tradition et modernité — vêtements, accessoires et objets de décoration.',
    disciplines: ['Broderie', 'Textile'],
    city: 'Bordeaux', region: 'Nouvelle-Aquitaine', department: '33',
    travel_radius: '25' as const,
    portfolio_images: [PHOTOS.tex1, PHOTOS.tex2, PHOTOS.cera1],
    website: null,
    instagram: '@lucas_broderie',
    etsy: 'https://etsy.com/shop/lucasbernard',
    siret_verified: false,
    insurance_verified: false,
    availability: { weekends: true, custom: [] },
  },
  {
    id: 'demo-creator-5',
    full_name: 'Amélie Fontaine',
    avatar_url: PHOTOS.av5,
    bio: 'Illustratrice et graveure. Tirages d\'art en édition limitée, ex-libris et affiches personnalisées. Atelier à Lyon.',
    disciplines: ['Illustration', 'Gravure', 'Sérigraphie'],
    city: 'Lyon', region: 'Auvergne-Rhône-Alpes', department: '69',
    travel_radius: '50' as const,
    portfolio_images: [PHOTOS.tat3, PHOTOS.tat1, PHOTOS.bij3],
    website: 'https://ameliefontaine.art',
    instagram: '@amelie_illustration',
    etsy: null,
    siret_verified: true,
    insurance_verified: true,
    availability: { weekends: false, custom: [{ from: '2026-07-01', to: '2026-08-31' }] },
  },
];

// ─── Applications ─────────────────────────────────────────

export const DEMO_APPLICATIONS = [
  {
    id: 'demo-app-1',
    event_id: 'demo-event-1',
    creator_id: 'demo-creator-1',
    message: 'Bonjour Claire, je suis tatoueuse fine line et j\'illustre aussi des tirages d\'art. Mon univers nature & japonisme devrait bien s\'inscrire dans votre marché. SIRET + RC Pro Maif.',
    status: 'accepted' as const,
    stripe_payment_id: null,
    created_at: '2026-05-10T14:00:00Z',
    updated_at: '2026-05-12T09:00:00Z',
    event: { id: 'demo-event-1', title: 'Marché des Créateurs Bastille', city: 'Paris', start_date: '2026-06-07', end_date: '2026-06-29', cover_image: PHOTOS.marche1, organizer_id: 'demo-org-1' },
  },
  {
    id: 'demo-app-2',
    event_id: 'demo-event-2',
    creator_id: 'demo-creator-1',
    message: 'Je candidate pour le Salon Design Lyon avec ma gamme de tirages d\'art et prints de tatouage.',
    status: 'pending' as const,
    stripe_payment_id: null,
    created_at: '2026-05-20T10:00:00Z',
    updated_at: '2026-05-20T10:00:00Z',
    event: { id: 'demo-event-2', title: 'Salon du Design & Craft Lyon', city: 'Lyon', start_date: '2026-10-09', end_date: '2026-10-11', cover_image: PHOTOS.marche4, organizer_id: 'demo-org-2' },
  },
  {
    id: 'demo-app-3',
    event_id: 'demo-event-3',
    creator_id: 'demo-creator-1',
    message: 'Très intéressée par ce pop-up à Bordeaux. J\'ai de la famille là-bas et je connais bien la ville.',
    status: 'refused' as const,
    stripe_payment_id: null,
    created_at: '2026-04-15T11:00:00Z',
    updated_at: '2026-04-20T16:00:00Z',
    event: { id: 'demo-event-3', title: 'Pop-up Artisanat Bordeaux', city: 'Bordeaux', start_date: '2026-07-18', end_date: '2026-07-19', cover_image: PHOTOS.marche5, organizer_id: 'demo-org-1' },
  },
  {
    id: 'demo-app-4',
    event_id: 'demo-event-4',
    creator_id: 'demo-creator-1',
    message: 'Le Marché de Noël de Strasbourg correspond exactement à mon positionnement.',
    status: 'pending' as const,
    stripe_payment_id: null,
    created_at: '2026-05-25T09:30:00Z',
    updated_at: '2026-05-25T09:30:00Z',
    event: { id: 'demo-event-4', title: 'Marché de Noël Strasbourg', city: 'Strasbourg', start_date: '2026-11-27', end_date: '2026-12-31', cover_image: PHOTOS.marche3, organizer_id: 'demo-org-2' },
  },
];

// ─── Conversations & Messages ─────────────────────────────

export const DEMO_CONVERSATIONS = [
  {
    id: 'demo-conv-1',
    event_id: 'demo-event-1',
    creator_id: 'demo-creator-1',
    organizer_id: 'demo-org-1',
    created_at: '2026-05-12T09:00:00Z',
    unread_count: 1,
    last_message: { id: 'msg-5', content: 'Tu recevras le lien de paiement dans la journée.', sender_id: 'demo-org-1', created_at: '2026-05-13T11:00:00Z' },
    event:     { id: 'demo-event-1', title: 'Marché des Créateurs Bastille' },
    creator:   { id: 'demo-creator-1', full_name: 'Sophie Leroux',  avatar_url: PHOTOS.av1 },
    organizer: { id: 'demo-org-1',     full_name: 'Claire Moreau',   avatar_url: PHOTOS.av6 },
  },
  {
    id: 'demo-conv-2',
    event_id: 'demo-event-2',
    creator_id: 'demo-creator-2',
    organizer_id: 'demo-org-2',
    created_at: '2026-05-18T14:00:00Z',
    unread_count: 0,
    last_message: { id: 'msg-9', content: 'Parfait, à bientôt !', sender_id: 'demo-creator-2', created_at: '2026-05-18T16:00:00Z' },
    event:     { id: 'demo-event-2', title: 'Salon du Design & Craft Lyon' },
    creator:   { id: 'demo-creator-2', full_name: 'Marc Dumont',    avatar_url: PHOTOS.av2 },
    organizer: { id: 'demo-org-2',     full_name: 'Thomas Blanc',   avatar_url: PHOTOS.av7 },
  },
];

export const DEMO_MESSAGES: Record<string, any[]> = {
  'demo-conv-1': [
    { id: 'msg-1', conversation_id: 'demo-conv-1', sender_id: 'demo-org-1',     content: 'Bonjour Sophie ! Ta candidature est acceptée, bienvenue au Marché Bastille ! Ton emplacement : stand B-12.', read_at: '2026-05-12T10:00:00Z', created_at: '2026-05-12T09:00:00Z' },
    { id: 'msg-2', conversation_id: 'demo-conv-1', sender_id: 'demo-creator-1', content: 'Merci beaucoup Claire ! Est-ce que je peux amener mon propre éclairage ? J\'ai un spot LED USB.', read_at: '2026-05-12T10:30:00Z', created_at: '2026-05-12T10:00:00Z' },
    { id: 'msg-3', conversation_id: 'demo-conv-1', sender_id: 'demo-org-1',     content: 'Bien sûr, pas de problème. Il y a une prise au stand. Installation dès 8h30, ouverture à 10h.', read_at: '2026-05-12T15:00:00Z', created_at: '2026-05-12T14:00:00Z' },
    { id: 'msg-4', conversation_id: 'demo-conv-1', sender_id: 'demo-creator-1', content: 'Parfait ! Pour le règlement, virement ou chèque ?', read_at: '2026-05-13T09:00:00Z', created_at: '2026-05-12T18:00:00Z' },
    { id: 'msg-5', conversation_id: 'demo-conv-1', sender_id: 'demo-org-1',     content: 'Paiement en ligne via Nexart — j\'ai activé Stripe. Tu recevras le lien de paiement dans la journée.', read_at: null, created_at: '2026-05-13T11:00:00Z' },
  ],
  'demo-conv-2': [
    { id: 'msg-6', conversation_id: 'demo-conv-2', sender_id: 'demo-org-2',     content: 'Bonjour Marc ! Votre céramique correspond bien au positionnement du Salon. Êtes-vous disponible les 9-11 octobre ?', read_at: '2026-05-18T15:00:00Z', created_at: '2026-05-18T14:00:00Z' },
    { id: 'msg-7', conversation_id: 'demo-conv-2', sender_id: 'demo-creator-2', content: 'Bonjour Thomas, oui absolument ! Ces dates me conviennent. Quelle est la procédure pour confirmer ?', read_at: '2026-05-18T15:30:00Z', created_at: '2026-05-18T15:00:00Z' },
    { id: 'msg-8', conversation_id: 'demo-conv-2', sender_id: 'demo-org-2',     content: 'Je vous envoie le contrat par email. Merci de le retourner signé avant le 15 juin avec la première moitié du règlement.', read_at: '2026-05-18T16:00:00Z', created_at: '2026-05-18T15:30:00Z' },
    { id: 'msg-9', conversation_id: 'demo-conv-2', sender_id: 'demo-creator-2', content: 'Parfait, à bientôt !', read_at: '2026-05-18T17:00:00Z', created_at: '2026-05-18T16:00:00Z' },
  ],
};

// ─── Posts / Feed ─────────────────────────────────────────

export const DEMO_POSTS = [
  {
    id: 'demo-post-1',
    creator_id: 'demo-creator-1',
    post_type: 'experience' as const,
    content: 'Premier marché de la saison au #MarchéBastille 🎉 Incroyable ambiance, des clients curieux et passionnés. J\'ai vendu 12 tirages et 3 flashes ! Merci à tous pour votre soutien. #TatouageFineLine #Illustration #ArtisanatParis',
    images: [PHOTOS.marche1, PHOTOS.tat1],
    event_ref: 'Marché des Créateurs Bastille',
    location_name: 'Paris 11e',
    likes_count: 47,
    created_at: '2026-06-08T19:00:00Z',
    creator: { id: 'demo-creator-1', full_name: 'Sophie Leroux', avatar_url: PHOTOS.av1 },
  },
  {
    id: 'demo-post-2',
    creator_id: 'demo-creator-2',
    post_type: 'tip' as const,
    content: 'Conseil du jour pour les céramistes qui font des marchés : apportez toujours un chiffon humide pour nettoyer vos pièces entre les manipulations des visiteurs. Une pièce propre se vend 3× mieux ! 💡 #Céramique #Conseil #Marché',
    images: [PHOTOS.cera1],
    event_ref: null,
    location_name: 'Montpellier',
    likes_count: 31,
    created_at: '2026-06-06T14:30:00Z',
    creator: { id: 'demo-creator-2', full_name: 'Marc Dumont', avatar_url: PHOTOS.av2 },
  },
  {
    id: 'demo-post-3',
    creator_id: 'demo-creator-3',
    post_type: 'guest_appearance' as const,
    content: 'Je serai au Salon du Design & Craft de Lyon en octobre ! C\'est la 5e édition et j\'y présenterai ma nouvelle collection "Minuit" en or 18K et saphirs éthiques 💎 Venez me rendre visite au stand J-07. #Joaillerie #SalonLyon #BijouxFrance',
    images: [PHOTOS.bij1, PHOTOS.bij2, PHOTOS.bij3],
    event_ref: 'Salon du Design & Craft Lyon',
    location_name: 'Lyon',
    likes_count: 89,
    created_at: '2026-06-05T11:00:00Z',
    creator: { id: 'demo-creator-3', full_name: 'Isabelle Chen', avatar_url: PHOTOS.av3 },
  },
  {
    id: 'demo-post-4',
    creator_id: 'demo-creator-4',
    post_type: 'call_for_collab' as const,
    content: 'Je cherche un·e créateur·ice pour partager un stand au Pop-up de Bordeaux en juillet 🤝 Ma discipline : broderie & textile. Je recherche idéalement quelqu\'un en bijoux ou céramique pour une belle complémentarité. DM si intéressé·e ! #Collab #PopupBordeaux #Broderie',
    images: [PHOTOS.tex1],
    event_ref: 'Pop-up Artisanat Bordeaux',
    location_name: 'Bordeaux',
    likes_count: 23,
    created_at: '2026-06-04T09:00:00Z',
    creator: { id: 'demo-creator-4', full_name: 'Lucas Bernard', avatar_url: PHOTOS.av4 },
  },
  {
    id: 'demo-post-5',
    creator_id: 'demo-creator-5',
    post_type: 'general' as const,
    content: 'Nouvelle série "Botanique" disponible sur ma boutique Etsy 🌿 Tirages en édition limitée 30×40, impression risographie sur papier recyclé. Lien en bio ! #Illustration #Gravure #PrintMaking #Lyon',
    images: [PHOTOS.tat3, PHOTOS.bij3],
    event_ref: null,
    location_name: 'Lyon',
    likes_count: 56,
    created_at: '2026-06-03T16:00:00Z',
    creator: { id: 'demo-creator-5', full_name: 'Amélie Fontaine', avatar_url: PHOTOS.av5 },
  },
];

// ─── Organisateurs ────────────────────────────────────────

export const DEMO_ORGANIZERS = {
  'demo-org-1': {
    id: 'demo-org-1', role: 'organizer' as const,
    full_name: 'Claire Moreau', avatar_url: PHOTOS.av6,
    bio: 'Organisatrice du Marché des Créateurs Bastille depuis 2018. +50 éditions, 800 artisans sélectionnés.',
    created_at: '2018-03-01T10:00:00Z',
    organizer_profile: { organization_name: 'Marché des Créateurs Bastille', website: 'https://marchebastille.fr', instagram: '@marchebastille' },
  },
  'demo-org-2': {
    id: 'demo-org-2', role: 'organizer' as const,
    full_name: 'Thomas Blanc', avatar_url: PHOTOS.av7,
    bio: 'Co-fondateur du Salon du Design & Craft de Lyon. Édition annuelle + pop-ups thématiques.',
    created_at: '2019-06-01T10:00:00Z',
    organizer_profile: { organization_name: 'Salon du Design & Craft Lyon', website: 'https://salondesignlyon.fr', instagram: '@salondesignlyon' },
  },
};

// ─── Avis ─────────────────────────────────────────────────

export const DEMO_REVIEWS = [
  { id: 'rev-1', event_id: 'demo-event-1', reviewer_id: 'demo-creator-1', reviewed_id: 'demo-org-1', reviewer_role: 'creator' as const, rating: 5, comment: 'Super organisation, Claire est réactive et bienveillante !', tags: ['Fiable', 'Bon flux client', 'Stand bien géré'], created_at: '2026-06-30T20:00:00Z' },
  { id: 'rev-2', event_id: 'demo-event-1', reviewer_id: 'demo-org-1', reviewed_id: 'demo-creator-1', reviewer_role: 'organizer' as const, rating: 5, comment: 'Sophie est une valeur sûre : ponctuelle, stand magnifique.', tags: ['Ponctuel', 'Qualité produit', 'Respect des règles'], created_at: '2026-07-01T10:00:00Z' },
];
