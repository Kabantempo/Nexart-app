/**
 * Navigation Configuration - Animations fluides
 * Configure les transitions entre screens
 */

import { StackNavigationOptions } from '@react-navigation/stack'
import { ANIMATION_DURATIONS } from '../constants/animations'

// Page transition options
export const pageTransitionOptions: StackNavigationOptions = {
  animation: 'default',
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
        }),
        transform: [
          {
            translateY: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [layouts.screen.height, 0],
            }),
          },
        ],
      },
    }
  },
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATIONS.slow,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATIONS.slow,
      },
    },
  },
}

// Quick transition for modals
export const modalTransitionOptions: StackNavigationOptions = {
  animation: 'default',
  cardStyleInterpolator: ({ current, layouts }) => {
    return {
      cardStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0.5, 1],
        }),
        transform: [
          {
            scale: current.progress.interpolate({
              inputRange: [0, 1],
              outputRange: [0.9, 1],
            }),
          },
        ],
      },
      overlayStyle: {
        opacity: current.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 0.5],
        }),
      },
    }
  },
  transitionSpec: {
    open: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATIONS.base,
      },
    },
    close: {
      animation: 'timing',
      config: {
        duration: ANIMATION_DURATIONS.base,
      },
    },
  },
}
