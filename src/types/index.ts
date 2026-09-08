/**
 * Types du domaine Nexart — alignés sur le schéma Supabase de production
 * (projet `cvqeysnymnkfxfithhsr`), vérifié le 09/09/2026.
 *
 * Le site Next.js et l'app mobile tapent la MÊME base : toute colonne
 * ajoutée côté site doit être répercutée ici.
 */

// ─────────────────────────────────────────────
// ENUMS POSTGRES (valeurs exactes de la base)
// ─────────────────────────────────────────────

/** enum `user_role` */
export type UserRole = 'creator' | 'organizer' | 'visitor' | 'admin';

/** enum `travel_radius` */
export type TravelRadius = '5' | '10' | '25' | 'national';

/** enum `event_type` — `marche` ajouté côté site */
export type EventType = 'permanent' | 'seasonal' | 'popup' | 'salon' | 'fair' | 'marche';

/** enum `event_status` */
export type EventStatus = 'draft' | 'published' | 'closed';

/**
 * enum `application_status`.
 * `awaiting_payment` / `confirmed` / `stand_proposed` / `counter_proposed`
 * viennent du flux stands payants + contre-proposition du site.
 */
export type ApplicationStatus =
  | 'pending'
  | 'accepted'
  | 'refused'
  | 'awaiting_payment'
  | 'confirmed'
  | 'stand_proposed'
  | 'counter_proposed';

/** enum `reviewer_role` */
export type ReviewerRole = 'creator' | 'organizer';

/** Colonne texte `profiles.subscription_tier` (contrainte CHECK côté base). */
export type SubscriptionTier = 'free' | 'boost' | 'pro' | 'premium' | 'org_pro' | 'org_studio';

/** Colonne texte `profiles.subscription_status`. */
export type SubscriptionStatus = 'active' | 'cancelled' | 'past_due' | 'trialing';


// ─────────────────────────────────────────────
// PROFILS
// ─────────────────────────────────────────────

export interface NotificationPrefs {
  messages: boolean;
  applications: boolean;
  reminders: boolean;
  newsletter: boolean;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  messages: true,
  applications: true,
  reminders: true,
  newsletter: false,
};

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  banner_url: string | null;
  bio: string | null;
  username: string | null;
  show_real_name: boolean;
  push_token: string | null;
  is_admin?: boolean;
  is_banned: boolean;
  is_creator: boolean;
  is_organizer: boolean;
  onboarding_done: boolean;
  created_at: string;

  // Préférences (migration 20260814_user_settings_prefs)
  notification_prefs: NotificationPrefs | null;
  profile_visibility: 'public' | 'private' | null;
  preferred_language: 'fr' | 'en' | null;

  // Parrainage (migration 20260815_referrals)
  referral_code: string | null;

  // Stripe / abonnement (migration 20260830_stripe_profiles_credits)
  stripe_customer_id: string | null;
  subscription_tier: SubscriptionTier;
  subscription_status: SubscriptionStatus | null;
  subscription_id: string | null;
  subscription_ends_at: string | null;

  // RGPD — suppression de compte (migration 20260727_rgpd_soft_delete)
  deleted_at: string | null;
  is_hard_deleted: boolean;
}

export type PageFont = 'default' | 'serif' | 'mono';

/** `creator_profiles.page_settings` — page créateur personnalisable. */
export interface PageSettings {
  bio_font: PageFont;
  bg_color: string;
  accent_color: string;
  bio_color: string;
  tagline: string | null;
  music_url: string | null;
  music_label: string | null;
}

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  bio_font: 'default',
  bg_color: '#0F0F0F',      // --bg-primary (sombre), charte v1.5.0
  accent_color: '#6366F1',  // violet.primary
  bio_color: '#F9FAFB',     // --text-primary (sombre)
  tagline: null,
  music_url: null,
  music_label: null,
};

/** Élément de `creator_profiles.portfolio_grid` (migration 20260816). */
export interface PortfolioGridItem {
  url: string;
  colSpan: number;
  rowSpan: number;
}

export interface CreatorProfile {
  id: string;
  user_id: string;
  disciplines: string[];
  city: string | null;
  region: string | null;
  department: string | null;
  postal_code: string | null;
  travel_radius: TravelRadius;
  lat: number | null;
  lng: number | null;

  portfolio_images: string[];
  portfolio_videos: string[] | null;
  portfolio_grid: PortfolioGridItem[] | null;
  page_settings: PageSettings | null;

  website: string | null;
  instagram: string | null;
  etsy: string | null;
  facebook: string | null;
  tiktok: string | null;
  phone: string | null;

  siret: string | null;
  siret_number: string | null;
  siret_verified: boolean;
  insurance_doc_url: string | null;
  insurance_verified: boolean;
  legal_status: string | null;

  price_min: number | null;
  price_max: number | null;

  is_active_creator: boolean;
  active_creator_until: string | null;
  open_to_collab: boolean;
  notify_weekly: boolean | null;

  availability: {
    weekends: boolean;
    custom: Array<{ from: string; to: string }>;
    available_now?: boolean;
  };
}

export type StripeConnectStatus = 'pending' | 'onboarding' | 'active' | 'restricted';

export interface OrganizerProfile {
  id: string;
  user_id: string;
  organization_name: string;
  website: string | null;
  instagram: string | null;
  cover_image: string | null;

  siret_number: string | null;
  siret_verified: boolean;
  verification_doc_url: string | null;
  verification_doc_verified: boolean;
  verified_at: string | null;
  verified_by: string | null;

  past_events: unknown[] | null;
  event_types: string[] | null;
  events_per_year: string | null;
  typical_capacity: string | null;

  // Stripe Connect (migration 20260815_stripe_connect)
  stripe_account_id: string | null;
  stripe_connect_status: StripeConnectStatus | null;
  stripe_connect_onboarded_at: string | null;
}


// ─────────────────────────────────────────────
// ÉVÉNEMENTS
// ─────────────────────────────────────────────

export type PricingModel = 'fixed' | 'variable' | 'percent' | 'free';

/** Case du plan de stands (`events.stand_plan`). */
export interface StandPlanCell {
  id: string;
  label: string;
  status: 'free' | 'reserved' | 'taken' | 'blocked';
  price?: number | null;
}

export interface Event {
  id: string;
  organizer_id: string;
  slug: string | null;          // migration 20260830_events_slug
  title: string;
  description: string | null;
  event_type: EventType;
  theme: string[];

  location: string | null;
  city: string | null;
  region: string | null;
  department: string | null;
  lat: number | null;
  lng: number | null;

  start_date: string;
  end_date: string;
  start_time: string | null;
  end_time: string | null;
  application_deadline: string | null;  // migration 20260814

  recurrence_type: string | null;
  recurrence_dates: string[] | null;
  recurrence_end_date: string | null;

  stand_count: number;
  stand_price: number | null;
  stand_dimensions: string | null;
  stand_plan: { rows: number; cols: number; cells: StandPlanCell[] } | null;
  stand_types_data: unknown | null;

  pricing_model: PricingModel | null;
  pricing_variable_min: number | null;
  pricing_variable_max: number | null;
  pricing_percent: number | null;

  discipline_tags: string[];
  cover_image: string | null;
  media: string[];
  gallery_images: string[] | null;
  faq: Array<{ question: string; answer: string }> | null;
  rules: string | null;

  stripe_enabled: boolean;
  status: EventStatus;
  created_at: string;
}


// ─────────────────────────────────────────────
// CANDIDATURES
// ─────────────────────────────────────────────

/**
 * `applications.rejection_reason` — JSONB, PAS du texte.
 * Le site écrit `{ reasons: string[] }` (raisons de refus structurées,
 * cf. app/dashboard/page.tsx du site). Il n'existe AUCUNE colonne
 * `refusal_reason` en base.
 */
export interface RejectionReason {
  reasons: string[];
}

export interface Application {
  id: string;
  event_id: string;
  creator_id: string;
  message: string | null;
  status: ApplicationStatus;
  rejection_reason: RejectionReason | null;
  portfolio_images: string[] | null;

  boosted_at: string | null;
  viewed_at: string | null;
  processing_started_at: string | null;

  // Stands payants / Stripe
  stripe_payment_id: string | null;
  stripe_payment_intent_id: string | null;
  stand_price_cents: number | null;
  stand_details: string | null;
  stand_id: string | null;
  stand_label: string | null;
  paid_at: string | null;
  refunded_at: string | null;

  // Proposition / contre-proposition de stand
  proposed_stand: { id?: string; label?: string; price?: number } | null;
  creator_response: string | null;
  counter_note: string | null;

  // Formulaire exposant personnalisé
  form_data: Record<string, unknown> | null;
  form_submitted_at: string | null;

  created_at: string;
  updated_at: string;
}


// ─────────────────────────────────────────────
// MESSAGERIE
// ─────────────────────────────────────────────

export interface Conversation {
  id: string;
  event_id: string | null;
  creator_id: string;
  organizer_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read_at: string | null;
  created_at: string;
  updated_at: string | null;
  attachment_url: string | null;
  attachment_type: string | null;
  attachment_name: string | null;
}


// ─────────────────────────────────────────────
// AVIS
// ─────────────────────────────────────────────

export interface Review {
  id: string;
  event_id: string;
  reviewer_id: string;
  reviewed_id: string;
  reviewer_role: ReviewerRole;
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string | null;
  tags: string[];
  created_at: string;
}


// ─────────────────────────────────────────────
// CRÉDITS, ABONNEMENT, PARRAINAGE
// ─────────────────────────────────────────────

/** Ligne du grand livre `credits` (solde = somme des `amount`). */
export interface Credit {
  id: string;
  user_id: string;
  amount: number;               // positif = crédit, négatif = débit
  type: string;                 // 'gift' | 'purchase' | 'boost' | 'referral'…
  description: string | null;
  ref_id: string | null;
  created_at: string;
}

/** Achat de crédits via Stripe (`credit_transactions`). */
export interface CreditTransaction {
  id: string;
  user_id: string;
  credit_type: string;
  payment_intent_id: string | null;
  credits_bought: number;
  amount_paid: number;          // en centimes
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referee_id: string;
  credited_at: string | null;
  created_at: string;
}


// ─────────────────────────────────────────────
// VÉRIFICATIONS & DOCUMENTS
// ─────────────────────────────────────────────

export type VerificationStatus = 'pending' | 'approved' | 'rejected';

/** Demande de badge « Créateur vérifié » (SIRET). */
export interface CreatorVerification {
  id: string;
  creator_id: string | null;
  siret: string;
  document_url: string | null;
  status: VerificationStatus | null;
  rejection_reason: string | null;   // texte ici, contrairement à `applications`
  reviewed_by: string | null;
  reviewed_at: string | null;
  created_at: string | null;
}

/** Proposition de discipline hors liste, validée par un admin. */
export interface DisciplineProposal {
  id: string;
  creator_id: string;
  name: string;
  status: VerificationStatus | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
}

export type EventDocumentType = 'contrat' | 'reglement' | 'convocation' | 'facture';

export interface EventDocument {
  id: string;
  event_id: string;
  candidature_id: string | null;
  creator_id: string;
  organizer_id: string;
  type: EventDocumentType;
  pdf_url: string;
  file_name: string;
  contract_number: string | null;
  stand_number: string | null;
  verification_token: string | null;
  verified_at: string | null;
  sent_at: string | null;
  downloaded_at: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string | null;
  link: string | null;
  read_at: string | null;
  created_at: string | null;
}


// ─────────────────────────────────────────────
// TYPES ENRICHIS — jointures courantes
// ─────────────────────────────────────────────

export interface EventWithOrganizer extends Event {
  organizer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> & {
    organizer_profile: Pick<OrganizerProfile, 'organization_name'> | null;
  };
}

export interface ApplicationWithEvent extends Application {
  event: Pick<Event, 'id' | 'title' | 'city' | 'start_date' | 'end_date' | 'cover_image' | 'slug'>;
}

export interface ApplicationWithCreator extends Application {
  creator: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> & {
    creator_profile: Pick<CreatorProfile, 'disciplines' | 'city'> | null;
  };
}

export interface ConversationWithDetails extends Conversation {
  event: Pick<Event, 'id' | 'title'>;
  creator: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  organizer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>;
  last_message: Pick<Message, 'content' | 'created_at'> | null;
}


// ─────────────────────────────────────────────
// TAGS PRÉDÉFINIS
// ─────────────────────────────────────────────

export const DISCIPLINE_TAGS = [
  'Tatouage', 'Céramique', 'Gravure', 'Joaillerie', 'Bijoux', 'Illustration',
  'Textile', 'Maroquinerie', 'Sculpture', 'Photographie', 'Peinture', 'Poterie',
  'Broderie', 'Lutherie', 'Verrerie', 'Reliure', 'Cosmétique naturelle', 'Savonnerie',
  'Coutellerie', 'Bougies', 'Macramé', 'Origami', 'Calligraphie', 'Sérigraphie',
] as const;

export type DisciplineTag = typeof DISCIPLINE_TAGS[number];

export const CREATOR_REVIEW_TAGS = ['Ponctuel', 'Respectueux des règles', 'Qualité produit', 'Professionnel'] as const;
export const ORGANIZER_REVIEW_TAGS = ['Fiable', 'Stand bien géré', 'Bon flux client', 'Communication claire'] as const;

/** Raisons de refus proposées à l'organisateur (miroir du site). */
export const REJECTION_REASONS = [
  'Emplacements complets',
  'Discipline déjà représentée',
  'Priorité aux créateurs locaux',
  'Dossier incomplet',
  'Univers non adapté à l\'événement',
] as const;


// ─────────────────────────────────────────────
// DIVERS
// ─────────────────────────────────────────────

export interface VisitorInquiry {
  id: string;
  visitor_id: string;
  creator_id: string;
  message: string;
  reply: string | null;
  replied_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FavoriteEvent   { user_id: string; event_id: string;   created_at: string }
export interface FavoriteCreator { user_id: string; creator_id: string; created_at: string }

export interface PublicCreatorProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  disciplines: string[];
  city: string | null;
  region: string | null;
  portfolio_images: string[];
  portfolio_grid?: PortfolioGridItem[] | null;
  instagram: string | null;
  website: string | null;
  siret_verified: boolean;
  insurance_verified: boolean;
  page_settings?: PageSettings | null;
  created_at?: string | null;
}
