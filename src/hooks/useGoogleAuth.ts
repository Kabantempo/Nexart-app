import { useCallback, useState } from 'react'
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import Constants from 'expo-constants'
import { supabase } from '../lib/supabase'

WebBrowser.maybeCompleteAuthSession()

/**
 * useGoogleAuth — Hook pour connexion Google avec Supabase OAuth
 * Utilise Expo Google Auth + Supabase OAuth
 */
export function useGoogleAuth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Google auth config
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '',
    redirectUrl: `${Constants.expoConfig?.scheme}://oauth-callback`,
  })

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      // Launch Google sign-in
      const result = await promptAsync()
      if (result?.type !== 'success') {
        setError('Connexion Google annulée')
        setLoading(false)
        return
      }

      // Get token from Google
      const { id_token, access_token } = result.params
      if (!id_token) {
        setError('Token Google non obtenu')
        setLoading(false)
        return
      }

      // Sign in with Supabase using OAuth
      const { data, error: supabaseError } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: id_token,
      })

      if (supabaseError) {
        setError(supabaseError.message)
      } else {
        console.log('✅ Connexion Google réussie', data.user?.email)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la connexion Google')
    } finally {
      setLoading(false)
    }
  }, [promptAsync])

  return { handleGoogleSignIn, loading, error, isReady: !!request }
}
