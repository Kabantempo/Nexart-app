# Nexart — Site web vs App mobile

_Mis à jour le 09/09/2026._

## Architecture réelle

Deux dépôts distincts, **une seule base Supabase** (`cvqeysnymnkfxfithhsr`).

```
Claude/github-repos/
├── Nexart-site/     ← SITE WEB — Next.js 13 App Router, déployé sur nexart.fr (Hostinger VPS)
│                       Public + dashboards complets + back-office admin
│
└── Nexart-app/      ← APP MOBILE — React Native 0.85 + Expo SDK 56 (iOS, Android, web)
                        Usage nomade : candidater, échanger, suivre ses marchés
```

> ⚠️ Le dossier `Nexart-app/web/` est un **ancien clone partiel** du site, antérieur
> au dépôt `Nexart-site`. Il est obsolète, exclu du `tsconfig.json`, et destiné à
> être supprimé. Ne rien y développer.

---

## Qui fait quoi

| | Site (`nexart.fr`) | App mobile |
|---|---|---|
| **Audience** | tout le monde, SEO, partage | utilisateurs connectés |
| **Point fort** | profondeur fonctionnelle, gros formulaires, back-office | rapidité, notifications push, géoloc, appareil photo |
| **Source de vérité** | **charte graphique, schéma DB, règles métier, paiements** | consommateur de ces règles |
| **Migrations Supabase** | `supabase/migrations/` — toutes partent d'ici | aucune |
| **Stripe** | crée les sessions, reçoit les webhooks | edge function pour les stands uniquement |

**Règle simple : une nouveauté produit se conçoit sur le site, puis se porte dans l'app.**

---

## Ce que fait le site et pas (encore) l'app

Le site a pris ~264 commits d'avance depuis le 1er août 2026.

| Domaine | Site | App |
|---|---|---|
| Abonnements Stripe (Boost/Pro/Premium, Org Pro/Studio) | ✅ | ❌ écran manquant, `TIER_LIMITS` en place |
| Packs de crédits pay-as-you-go | ✅ | ❌ écran manquant, `CREDIT_PACKS` en place |
| Parrainage | ✅ | ⚠️ hook prêt, écran manquant |
| Badge « Créateur vérifié » (SIRET) | ✅ | ⚠️ hook prêt, écran manquant |
| Documents événement (contrat, règlement, convocation) | ✅ | ⚠️ hook prêt, écran manquant |
| Plan de stands interactif | ✅ | ❌ |
| Portfolio en grille (`portfolio_grid`) | ✅ | ❌ (portfolio en liste) |
| Stands payants : `awaiting_payment` → `confirmed`, contre-proposition | ✅ | ❌ statuts typés, flux absent |
| Bénévoles, campagnes email, exposants, checklists, FAQ | ✅ | ❌ |
| Analytics organisateur + export CSV | ✅ | ❌ |
| Back-office admin complet | ✅ | ⚠️ panel réduit |
| RGPD : export de données, suppression de compte | ✅ | ⚠️ suppression seulement |
| Blog / SEO / pages légales | ✅ | ⚠️ pages info statiques |

## Ce que fait l'app et pas le site

| | |
|---|---|
| Notifications push natives | Expo Notifications, token stocké dans `profiles.push_token` |
| Carte plein écran avec géoloc temps réel | `react-native-maps` |
| Appareil photo / galerie | `expo-image-picker` pour le portfolio |
| Partage natif | fiche marché, profil créateur |
| Haptique, swipe cards, pull-to-refresh | ergonomie mobile |

---

## Ce qui doit rester synchronisé

| Élément | Côté site | Côté app | Comment |
|---|---|---|---|
| Charte graphique | `lib/design-tokens.ts` | `src/constants/theme.ts` | port manuel, mêmes valeurs |
| Thème clair/sombre | CSS vars dans `app/globals.css` | `lightColors` / `darkColors` | mêmes hex |
| Schéma DB | `supabase/migrations/` | `src/types/index.ts` | relire les colonnes après chaque migration |
| Offres & limites | `lib/stripe.ts` | `src/constants/plans.ts` | mêmes montants, mêmes limites |
| Statuts de candidature | enum `application_status` | `ApplicationStatus` + `APPLICATION_STATUS_CONFIG` | 7 valeurs |
| Disciplines | liste site | `DISCIPLINE_TAGS` | 24 tags |

### Points de vigilance déjà rencontrés

- `applications.rejection_reason` est un **`jsonb` `{ reasons: string[] }`**.
  L'app écrivait `refusal_reason` (colonne inexistante) : le refus échouait
  silencieusement en production. Corrigé le 09/09/2026.
- Le solde de crédits est la **somme de `credits.amount`**, pas une colonne.
- `event_type` a gagné la valeur `marche`, `user_role` la valeur `admin`,
  `application_status` quatre valeurs liées aux stands payants.

---

## Flux utilisateur

**Découverte** — le site fait entrer (SEO, partage, pages publiques) :
```
nexart.fr → marchés / créateurs → inscription → « continuer sur l'app »
```

**Usage courant** — l'app prend le relais :
```
candidater → notification push de la réponse → message avec l'organisateur → jour J
```

**Gestion lourde** — retour au site :
```
créer un événement détaillé · gérer bénévoles et exposants · analytics · facturation
```
