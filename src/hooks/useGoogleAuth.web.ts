import { useCallback, useState } from 'react'

/**
 * useGoogleAuth — Hook mockée pour web
 * Google Auth n'est implémenté que sur mobile (iOS/Android)
 */
export function useGoogleAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = useCallback(async () => {
    setError('Google Auth n\'est disponible que sur mobile (iOS/Android)')
    console.warn('⚠️ Google Auth: Non supporté sur web')
  }, [])

  return { handleGoogleSignIn, loading, error, isReady: false }
}
