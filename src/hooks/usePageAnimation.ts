import { useEffect } from 'react'
import { useNavigation, useIsFocused } from '@react-navigation/native'
import { ANIMATION_DURATIONS } from '../constants/animations'

/**
 * usePageAnimation — Hook pour animer le contenu de la page au chargement
 */
export function usePageAnimation() {
  const isFocused = useIsFocused()

  // Les animations des composants enfants vont se déclencher grâce à useEffect
  // Ce hook peut être étendu pour plus de contrôle sur la page entière
  useEffect(() => {
    // Log pour debug
    if (isFocused) {
      console.debug('Page animation triggered')
    }
  }, [isFocused])

  return {
    duration: ANIMATION_DURATIONS.slow,
    delay: 0,
  }
}
