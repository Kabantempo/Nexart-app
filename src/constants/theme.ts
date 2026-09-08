/**
 * ============================================================
 * NEXART — DESIGN TOKENS (APP MOBILE)
 * ============================================================
 * Port React Native de `lib/design-tokens.ts` du site Next.js.
 * Le site reste la SOURCE DE VÉRITÉ de la charte graphique :
 * toute évolution part de là et se répercute ici.
 *
 * Emplacement : src/constants/theme.ts
 * Synchronisé : charte v1.5.0 (site, 21/08/2026) — sync app 09/09/2026
 *
 * Différences assumées vs le site (contraintes React Native) :
 *   - pas de CSS vars : les palettes claire/sombre sont deux objets
 *     figés, sélectionnés par getColors(scheme) / useThemeColors()
 *   - tailles en number (px) et non en string
 *   - lineHeight en px absolus (le site utilise des ratios)
 *   - ombres en objets RN (shadowColor / shadowOffset / elevation)
 * ============================================================
 */

// ─────────────────────────────────────────────
// PALETTE BRUTE — identique au site, valeurs stables
// (ne dépendent pas du thème clair/sombre)
// ─────────────────────────────────────────────

export const palette = {

  // Accent principal
  violet: {
    primary: '#6366F1',  // CTAs, liens, highlights
    hover:   '#818CF8',  // hover / accent dark mode
    dark:    '#5B5BD6',  // active / pressed
    wash:    '#EEF2FF',  // fonds badges, sélection
    bg:      '#EDE9FE',  // fond très léger (badges "Nouveau")
    bgHover: '#DDD6FE',
    text:    '#4338CA',  // texte sur fond violet léger
    ring:    'rgba(99, 102, 241, 0.25)',
  },

  // Feedback sémantique
  feedback: {
    danger:  { bg: '#FFEBEE', border: '#E05A5A', text: '#B71C1C', solid: '#E05A5A' },
    success: { bg: '#E8F5E9', border: '#4CAF50', text: '#2E7D32', solid: '#4CAF50' },
    warning: { bg: '#FFF8E1', border: '#FF9800', text: '#B45309', solid: '#FF9800' },
    info:    { bg: '#E3F2FD', border: '#2196F3', text: '#1565C0', solid: '#2196F3' },
  },

  // Statuts candidatures (créateur ↔ organisateur)
  status: {
    pending:  { bg: '#FFF8E1', text: '#B45309', dot: '#F59E0B' },
    accepted: { bg: '#E8F5E9', text: '#2E7D32', dot: '#4CAF50' },
    refused:  { bg: '#FFEBEE', text: '#B71C1C', dot: '#E05A5A' },
    paid:     { bg: '#ECFDF5', text: '#065F46', dot: '#10B981' },
    refunded: { bg: '#F3F4F6', text: '#4B5563', dot: '#9CA3AF' },
    new:      { bg: '#EDE9FE', text: '#4338CA', dot: '#6366F1' },
  },

  // Vert émeraude — stats positives, compteurs
  green: {
    primary: '#10B981',
    light:   '#34D399',
    emerald: '#6EE7B7',
    success: '#4CAF50',
    bg:      '#ECFDF5',
    bgLight: '#D1FAE5',
    text:    '#065F46',
  },

  // Rouge — alertes, suppressions
  red: {
    vivid:     '#EF4444',
    soft:      '#F87171',
    medium:    '#FCA5A5',
    bg:        '#FEF2F2',
    bgSoft:    '#FEE2E2',
    text:      '#991B1B',
    vividText: '#DC2626',
  },

  // Violet étendu — dégradés, badges, tags
  purple: {
    primary:    '#8B5CF6',
    violet:     '#A855F7',
    light:      '#A78BFA',
    pale:       '#C4B5FD',
    dark:       '#7C3AED',
    deep:       '#6D28D9',
    darker:     '#5B21B6',
    indigo:     '#4F46E5',
    indigoDark: '#4338CA',
    indigoDeep: '#3730A3',
    deepDark:   '#1E1B4B',
    bg:         '#EDE9FE',
    bgLight:    '#C7D2FE',
    bgPale:     '#A5B4FC',
    bgEef:      '#EEF2FF',
    bgF5:       '#F5F3FF',
    bgE0:       '#E0E7FF',
  },

  // Gris
  gray: {
    50:  '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  white: '#FFFFFF',
  black: '#000000',
} as const;


// ─────────────────────────────────────────────
// THÈME CLAIR / SOMBRE
// Valeurs reprises de app/globals.css du site
// (:root = sombre par défaut, [data-theme="light"] = clair)
// ─────────────────────────────────────────────

export const lightColors = {
  background: '#F9FAFB',   // --bg-secondary : fond d'écran
  surface:    '#FFFFFF',   // --card-bg      : cartes, modales
  muted:      '#F4F4F8',   // --bg-tertiary  : fonds subtils

  primary:   palette.violet.primary,  // #6366F1 — --accent (clair)
  secondary: palette.violet.dark,     // #5B5BD6 — pressed / actions secondaires
  accent:    palette.violet.wash,     // #EEF2FF — fonds badges

  text: {
    primary:   '#1A1A1A',  // --text-primary
    secondary: '#6B7280',  // --text-secondary
    muted:     '#9CA3AF',  // --text-tertiary
    inverse:   '#FFFFFF',  // sur fond violet / bouton plein
  },

  border:       '#E5E7EB', // --border-color
  borderStrong: '#AAAAAA',

  error:   palette.feedback.danger.solid,   // #E05A5A
  success: palette.feedback.success.solid,  // #4CAF50
  warning: palette.feedback.warning.solid,  // #FF9800
  info:    palette.feedback.info.solid,     // #2196F3

  overlay:  'rgba(0, 0, 0, 0.45)',
  skeleton: '#E5E7EB',
} as const;

export const darkColors = {
  background: '#0F0F0F',   // --bg-primary (sombre)
  surface:    '#1A1A1A',   // --card-bg / --bg-secondary (sombre)
  muted:      '#111111',   // --bg-tertiary (sombre)

  primary:   palette.violet.hover,    // #818CF8 — --accent (sombre)
  secondary: palette.violet.primary,  // #6366F1
  accent:    'rgba(99, 102, 241, 0.14)',

  text: {
    primary:   '#F9FAFB',
    secondary: '#9CA3AF',
    muted:     '#6B7280',
    inverse:   '#0F0F0F',
  },

  border:       '#2D2D2D',
  borderStrong: '#3F3F3F',

  error:   '#FF8585',   // --accent-red (sombre)
  success: '#4ADE80',
  warning: '#FBBF24',
  info:    '#60A5FA',

  overlay:  'rgba(0, 0, 0, 0.65)',
  skeleton: '#242424',
} as const;

export type ColorScheme = 'light' | 'dark';
export type ThemeColors = typeof lightColors;

/** Palette du thème demandé. useThemeColors() l'appelle pour toi. */
export function getColors(scheme: ColorScheme): ThemeColors {
  return scheme === 'dark' ? (darkColors as unknown as ThemeColors) : lightColors;
}

/**
 * Palette par défaut — thème clair.
 * Conservée pour les fichiers qui font `import { colors }`.
 * Pour un écran qui doit suivre le thème, préférer useThemeColors().
 */
export const colors = lightColors;


// ─────────────────────────────────────────────
// ESPACEMENT — identique au site
// ─────────────────────────────────────────────

export const spacing = {
  xs:   4,
  sm:   8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
  xxxl:64,
} as const;


// ─────────────────────────────────────────────
// BORDER RADIUS
// Site : sm 8 / md 12 / lg 16 / pill 9999
// xl et full sont des extensions app (déjà utilisées par les écrans).
// ─────────────────────────────────────────────

export const radius = {
  sm:   8,
  md:  12,
  lg:  16,
  xl:  24,
  pill: 9999,
  full: 9999,
} as const;


// ─────────────────────────────────────────────
// TYPOGRAPHIE
// Échelle du site ; lineHeight converti en px absolus (RN)
// ─────────────────────────────────────────────

export const typography = {
  h1:      { fontSize: 40, fontWeight: '800' as const, lineHeight: 48, letterSpacing: -0.8 },
  h2:      { fontSize: 24, fontWeight: '700' as const, lineHeight: 31, letterSpacing: -0.4 },
  h3:      { fontSize: 19, fontWeight: '700' as const, lineHeight: 27, letterSpacing: -0.2 },
  bodyL:   { fontSize: 17, fontWeight: '400' as const, lineHeight: 31 },
  body:    { fontSize: 16, fontWeight: '400' as const, lineHeight: 26 },
  small:   { fontSize: 14, fontWeight: '400' as const, lineHeight: 21 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label:   { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
} as const;


// ─────────────────────────────────────────────
// OMBRES — équivalents RN des ombres CSS du site
// ─────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 2, elevation: 1,
  },
  md: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 6, elevation: 3,
  },
  lg: {
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.10, shadowRadius: 25, elevation: 8,
  },
} as const;


// ─────────────────────────────────────────────
// BREAKPOINTS & DURÉES
// ─────────────────────────────────────────────

export const breakpoints = {
  mobile:  640,
  tablet:  768,
  desktop: 1024,
} as const;

/** Durées en ms — équivalents des transitions CSS du site. */
export const durations = {
  fast: 150,
  base: 250,
  slow: 400,
} as const;
