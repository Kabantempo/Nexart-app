import { useCallback, useState } from 'react'
import { Linking } from 'react-native'
import * as WebBrowser from 'expo-web-browser'
import { supabase } from '../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

/**
 * useGoogleAuth — Hook pour connexion Google avec Supabase OAuth
 * Utilise signInWithOAuth (même que le site)
 */
export function useGoogleAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'exp://localhost:19006/auth/callback',
        },
      })

      if (err) {
        setError(err.message)
      } else {
        console.log('✅ Connexion Google réussie')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion Google')
    } finally {
      setLoading(false)
    }
  }, [])

  return { handleGoogleSignIn, loading, error, isReady: true }
}
