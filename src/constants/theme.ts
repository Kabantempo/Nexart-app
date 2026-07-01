export const colors = {
  background: '#f8fafc',   // --background
  surface:    '#ffffff',   // --card
  muted:      '#f3f4f6',   // --muted  (fond subtil)

  primary:    '#4f46e5',   // --primary  (indigo-600) — UNIFIED with site
  secondary:  '#4340c9',   // --chart-2  (indigo-700, pour actions secondaires)
  accent:     '#eef2ff',   // --accent   (indigo très clair) — UNIFIED with site

  text: {
    primary:   '#1e293b',  // --foreground
    secondary: '#6b7280',  // --muted-foreground
    inverse:   '#ffffff',  // --primary-foreground
  },

  border:  '#d1d5db',      // --border
  error:   '#ef4444',      // --destructive
  success: '#10b981',
} as const;

export const spacing = {
  xs:  4,
  sm:  8,
  md:  16,
  lg:  24,
  xl:  32,
  xxl: 48,
} as const;

export const radius = {
  sm:   6,
  md:   12,
  lg:   20,
  xl:   28,
  full: 999,
} as const;

export const typography = {
  h1:      { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  h2:      { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.3 },
  h3:      { fontSize: 18, fontWeight: '600' as const },
  body:    { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  label:   { fontSize: 13, fontWeight: '500' as const },
} as const;
