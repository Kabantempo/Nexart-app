# Nexart — CLAUDE.md

Plateforme double-sided de mise en relation entre créateurs/artisans et marchés/événements artisanaux en France.

## Concept

**Nexart** connecte deux types d'utilisateurs :
- **Créateurs / Artisans** : tatoueurs, céramistes, graveurs, joailliers… qui cherchent des marchés pour exposer
- **Organisateurs** : marchés permanents, pop-ups, salons, foires qui cherchent des artisans

---

## Stack technique

| Couche | Technologie |
|--------|------------|
| Mobile (iOS + Android) | React Native + Expo SDK 54 |
| Site web | HTML/CSS/JS vanilla (`website/index.html`) |
| Backend | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| Paiements | Stripe Connect (stands payants) |
| Navigation | React Navigation v7 (bottom tabs + stack) |
| Langage | TypeScript strict |
| Styling | StyleSheet natif RN + design tokens |

---

## Structure du projet

```
nexart/
├── src/
│   ├── screens/
│   │   ├── auth/             # Login, Register, Onboarding, RoleScreen
│   │   ├── creator/          # Home, SearchEvents, ApplicationsScreen, Profile
│   │   ├── organizer/        # Home, CreateEvent, ManageEvents, Applications
│   │   └── shared/           # Messages, Profile, Settings
│   ├── components/
│   │   ├── ui/               # Button, Input, Card, Badge, Avatar, Tag…
│   │   └── features/         # EventCard, CreatorCard, ApplicationItem…
│   ├── navigation/           # RootNavigator, AuthNavigator, Creator/OrganizerNavigator
│   ├── lib/
│   │   └── supabase.ts       # Client Supabase (SecureStore)
│   ├── hooks/                # useAuth, useEvents, useApplications, useMessages…
│   ├── stores/               # AuthContext
│   ├── types/                # Tous les types TS (Profile, Event, Application…)
│   ├── utils/                # Helpers (formatDate, distanceLabel…)
│   └── constants/            # theme.ts (couleurs, spacing, typo)
├── website/
│   └── index.html            # Landing page marketing
├── assets/
├── App.tsx
└── CLAUDE.md
```

---

## MVP — Fonctionnalités (6 mois)

### A. Profils créateurs / artisans

- [ ] Création profil : nom, bio, disciplines (tags prédéfinis), photo, galerie (5-20 photos)
- [ ] Localisation : région/ville + rayon déplacement (5, 10, 25 km, nationale)
- [ ] Portfolio visuel : galerie catégorisée par type de travail
- [ ] Tags disciplines : tatouage, céramique, gravure, joaillerie, illustration, textile, bijoux, maroquinerie…
- [ ] Calendrier de disponibilités : weekends, périodes "dispo du X au Y"
- [ ] Liens externes : Etsy, site perso, Instagram
- [ ] Badges : "Créateur vérifié" (SIRET), "Assurance RC valide", "Sélectionné par organisateurs"

### B. Événements / Marchés

- [ ] Fiche événement : nom, lieu exact, dates/horaires, type (permanent/saisonnier/pop-up/salon/foire)
- [ ] Thème : Noël, artisanat général, design, bijoux, etc.
- [ ] Stands : capacité, prix, dimensions
- [ ] Médias : photos + vidéo teaser
- [ ] Règlement : commission, assurance requise, setup time
- [ ] Calendrier : 100 prochains marchés en France (liste + carte)
- [ ] Filtres avancés : région, discipline, budget, date, thème, type
- [ ] Plan de stands : schéma visuel des emplacements disponibles

### C. Mise en relation / Candidature

- [ ] Candidature 1 clic : "Je m'inscris" depuis la fiche événement
- [ ] Message optionnel : note personnalisée à l'organisateur
- [ ] Dashboard candidature : En attente / Acceptée / Refusée / Passée
- [ ] Notifications push + email : alerte dès réponse de l'organisateur
- [ ] Paiement stand intégré : Stripe Connect (si organisateur a activé)

### D. Messagerie

- [ ] Chat 1:1 créateur ↔ organisateur
- [ ] Sujets : logistique, confirmations, derniers détails
- [ ] Historique conservé : visible sur le profil du marché
- [ ] Notifications : badge + push sur nouveau message

### E. Évaluations / Avis

- [ ] Après chaque marché : note 1-5 dans les deux sens
  - Créateur → Organisateur : "Fiable", "Stand bien géré", "Bon flux client"
  - Organisateur → Créateur : "Ponctuel", "Respect des règles", "Qualité produit"
- [ ] Avis texte optionnel (100 caractères max)
- [ ] Score public visible sur les profils
- [ ] Badge "Créateur de confiance" : 5+ avis ≥ 4 étoiles

---

## Base de données Supabase (schéma complet)

```sql
-- Auth & rôles
profiles (
  id uuid PK,
  role 'creator'|'organizer',
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz
)

-- Artisans
creator_profiles (
  id uuid PK,
  user_id uuid FK profiles,
  disciplines text[],          -- tags prédéfinis
  city text, region text, department text,
  travel_radius 5|10|25|'national',
  portfolio_images text[],     -- URLs Supabase Storage
  website text, instagram text, etsy text,
  siret_verified bool DEFAULT false,
  insurance_verified bool DEFAULT false,
  availability jsonb            -- {weekends: bool, custom: [{from, to}]}
)

-- Organisateurs
organizer_profiles (
  id uuid PK,
  user_id uuid FK profiles,
  organization_name text,
  website text, instagram text
)

-- Événements
events (
  id uuid PK,
  organizer_id uuid FK profiles,
  title text, description text,
  event_type 'permanent'|'seasonal'|'popup'|'salon'|'fair',
  theme text[],
  location text, city text, region text, department text, lat float, lng float,
  start_date date, end_date date, start_time time, end_time time,
  stand_count int, stand_price numeric, stand_dimensions text,
  discipline_tags text[],
  cover_image text, media text[],
  rules text,
  stripe_enabled bool DEFAULT false,
  status 'draft'|'published'|'closed',
  created_at timestamptz
)

-- Candidatures
applications (
  id uuid PK,
  event_id uuid FK events,
  creator_id uuid FK profiles,
  message text,
  status 'pending'|'accepted'|'refused',
  stripe_payment_id text,
  created_at timestamptz, updated_at timestamptz
)

-- Messagerie
conversations (
  id uuid PK,
  event_id uuid FK events,
  creator_id uuid FK profiles,
  organizer_id uuid FK profiles,
  created_at timestamptz
)
messages (
  id uuid PK,
  conversation_id uuid FK conversations,
  sender_id uuid FK profiles,
  content text,
  read_at timestamptz,
  created_at timestamptz
)

-- Avis
reviews (
  id uuid PK,
  event_id uuid FK events,
  reviewer_id uuid FK profiles,
  reviewed_id uuid FK profiles,
  reviewer_role 'creator'|'organizer',
  rating int CHECK (rating BETWEEN 1 AND 5),
  comment text,                -- 100 chars max
  tags text[],                 -- "fiable", "ponctuel", etc.
  created_at timestamptz
)
```

---

## Tags disciplines (liste prédéfinie)

```
Tatouage · Céramique · Gravure · Joaillerie · Bijoux · Illustration
Textile · Maroquinerie · Sculpture · Photographie · Peinture · Poterie
Broderie · Lutherie · Verrerie · Reliure · Cosmétique naturelle · Savonnerie
Coutellerie · Bougies · Macramé · Origami · Calligraphie · Sérigraphie
```

---

## Design

| Token | Valeur |
|-------|--------|
| Fond | `#0D0D0D` |
| Surface | `#1A1A1A` |
| Accent or | `#C9A84C` |
| Vert sauge | `#7A9E87` |
| Texte principal | `#F5F3EF` |
| Texte secondaire | `#8A8A8A` |
| Erreur | `#E05A5A` |

Style : artisanal moderne, chaud, authentique — pas corporate.

---

## Commandes

```bash
npx expo start          # App mobile
npx expo start --web    # Version web
npx tsc --noEmit        # Check TypeScript
cd website && npx serve . -p 3000  # Site marketing
```

## Variables d'environnement (`.env`)

```
EXPO_PUBLIC_SUPABASE_URL=https://cvqeysnymnkfxfithhsr.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
EXPO_PUBLIC_STRIPE_KEY=pk_...
```

## Conventions

- Composants PascalCase, fichiers kebab-case
- Hooks custom préfixés `use`
- Types dans `src/types/` — pas d'`any` implicite
- Queries Supabase dans des hooks, jamais dans les composants
- Une feature = un hook dédié

---

## Progression MVP

### Infrastructure
- [x] Projet Expo SDK 54 + TypeScript initialisé
- [x] Dépendances : Supabase, React Navigation v7
- [x] Structure dossiers `src/`
- [x] Client Supabase configuré (SecureStore)
- [x] Auth flow complet (Welcome → Login/Register → RoleScreen)
- [x] Navigation conditionnelle par rôle (Creator / Organizer tabs)
- [x] Landing page marketing (`website/index.html`)
- [ ] Schéma BDD Supabase créé (SQL à exécuter)
- [ ] Row Level Security (RLS) Supabase

### Profils (A)
- [ ] Écran création profil artisan (disciplines, localisation, bio)
- [ ] Upload photo profil + galerie (Supabase Storage)
- [ ] Calendrier de disponibilités
- [ ] Badges vérification

### Événements (B)
- [ ] Écran création événement (organisateur)
- [ ] Fiche détail événement
- [ ] Liste / Carte des événements (SearchEventsScreen)
- [ ] Filtres avancés

### Candidatures (C)
- [ ] Bouton "Je m'inscris" sur fiche événement
- [ ] Dashboard candidatures (créateur)
- [ ] Dashboard candidatures reçues (organisateur)
- [ ] Stripe Connect (paiement stands)

### Messagerie (D)
- [ ] Chat 1:1 temps réel (Supabase Realtime)
- [ ] Notifications push (Expo Notifications)

### Avis (E)
- [ ] Formulaire d'avis post-marché
- [ ] Affichage scores sur profils
- [ ] Système de badges "Créateur de confiance"
