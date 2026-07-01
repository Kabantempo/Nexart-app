export type UserRole = 'creator' | 'organizer' | 'visitor';
export type TravelRadius = '5' | '10' | '25' | 'national';
export type EventType = 'permanent' | 'seasonal' | 'popup' | 'salon' | 'fair';
export type EventStatus = 'draft' | 'published' | 'closed';
export type ApplicationStatus = 'pending' | 'accepted' | 'refused';
export type ReviewerRole = 'creator' | 'organizer';

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string;
  avatar_url: string | null;
  bio: string | null;
  is_admin?: boolean;
  created_at: string;
}

export type PageFont = 'default' | 'serif' | 'mono';

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
  bg_color: '#0D0D0D',
  accent_color: '#6366F1',
  bio_color: '#F5F3EF',
  tagline: null,
  music_url: null,
  music_label: null,
};

export interface CreatorProfile {
  id: string;
  user_id: string;
  disciplines: string[];
  city: string | null;
  region: string | null;
  department: string | null;
  travel_radius: TravelRadius;
  portfolio_images: string[];
  website: string | null;
  instagram: string | null;
  etsy: string | null;
  siret: string | null;
  siret_verified: boolean;
  insurance_doc_url: string | null;
  insurance_verified: boolean;
  availability: {
    weekends: boolean;
    custom: Array<{ from: string; to: string }>;
  };
  page_settings?: PageSettings | null;
}

export interface OrganizerProfile {
  id: string;
  user_id: string;
  organization_name: string;
  website: string | null;
  instagram: string | null;
}

export interface Event {
  id: string;
  organizer_id: string;
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
  stand_count: number;
  stand_price: number | null;
  stand_dimensions: string | null;
  discipline_tags: string[];
  cover_image: string | null;
  media: string[];
  rules: string | null;
  stripe_enabled: boolean;
  status: EventStatus;
  created_at: string;
}

export interface Application {
  id: string;
  event_id: string;
  creator_id: string;
  message: string | null;
  refusal_reason: string | null;
  status: ApplicationStatus;
  stripe_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  event_id: string;
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
}

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

// Types enrichis pour les jointures courantes
export interface EventWithOrganizer extends Event {
  organizer: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> & {
    organizer_profile: Pick<OrganizerProfile, 'organization_name'> | null;
  };
}

export interface ApplicationWithEvent extends Application {
  event: Pick<Event, 'id' | 'title' | 'city' | 'start_date' | 'end_date' | 'cover_image'>;
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

// Tags prédéfinis
export const DISCIPLINE_TAGS = [
  'Tatouage', 'Céramique', 'Gravure', 'Joaillerie', 'Bijoux', 'Illustration',
  'Textile', 'Maroquinerie', 'Sculpture', 'Photographie', 'Peinture', 'Poterie',
  'Broderie', 'Lutherie', 'Verrerie', 'Reliure', 'Cosmétique naturelle', 'Savonnerie',
  'Coutellerie', 'Bougies', 'Macramé', 'Origami', 'Calligraphie', 'Sérigraphie',
] as const;

export type DisciplineTag = typeof DISCIPLINE_TAGS[number];

export const CREATOR_REVIEW_TAGS = ['Ponctuel', 'Respectueux des règles', 'Qualité produit', 'Professionnel'] as const;
export const ORGANIZER_REVIEW_TAGS = ['Fiable', 'Stand bien géré', 'Bon flux client', 'Communication claire'] as const;

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
  instagram: string | null;
  website: string | null;
  siret_verified: boolean;
  insurance_verified: boolean;
  page_settings?: PageSettings | null;
}
