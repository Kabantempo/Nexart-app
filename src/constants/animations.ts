/**
 * Animation Constants — Partagé entre app et site
 * Timing et easing unifiés pour cohérence visuelle
 */

// Durations (en millisecondes)
export const ANIMATION_DURATIONS = {
  fast: 150,      // Quick feedback
  base: 200,      // Standard transition
  slow: 300,      // Prominent animation
  verySlow: 500,  // Hero/intro animations
} as const

// Easing (React Native Animated)
export const EASING = {
  easeInOut: 'easeInOut',
  easeOut: 'easeOut',
  easeIn: 'easeIn',
  linear: 'linear',
} as const

// Common animations
export const ANIMATIONS = {
  // Fade in
  fadeIn: {
    duration: ANIMATION_DURATIONS.base,
    easing: EASING.easeOut,
  },
  // Slide up + fade
  slideUpFade: {
    duration: ANIMATION_DURATIONS.slow,
    easing: EASING.easeOut,
  },
  // Scale + fade
  scaleInFade: {
    duration: ANIMATION_DURATIONS.base,
    easing: EASING.easeOut,
  },
  // Quick bounce (loading states)
  bounce: {
    duration: ANIMATION_DURATIONS.base,
    easing: EASING.easeInOut,
  },
} as const

// Delays for staggered animations
export const STAGGER_DELAY = 50 // ms between items

// Page transition timing
export const PAGE_TRANSITION = ANIMATION_DURATIONS.slow
