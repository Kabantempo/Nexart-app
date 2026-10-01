import React, { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import * as Linking from 'expo-linking';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import { Session, User } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/lib/supabase';
import { AuthContext } from './src/stores/auth';
import { ThemeProvider, useTheme } from './src/stores/theme';
import { Profile } from './src/types';
import RootNavigator from './src/navigation';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import OnboardingModal, { useOnboarding } from './src/components/OnboardingModal';
import SplashScreen from './src/screens/SplashScreen';
import { ToastProvider } from './src/components/ui/Toast';

// Fix mouse wheel scroll on web
// React Native Web sets touch-action:none which blocks wheel events
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    html, body, #root { height: 100%; overflow: hidden; }
    div[style*="overflow: scroll"], div[style*="overflow: auto"] {
      touch-action: pan-y !important;
      -webkit-overflow-scrolling: touch;
    }
  `;
  document.head.appendChild(style);

  // Forward wheel events to the nearest scrollable parent when RN blocks them
  document.addEventListener('wheel', (e) => {
    let el = e.target as HTMLElement | null;
    while (el && el !== document.body) {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        el.scrollTop += e.deltaY;
        e.preventDefault();
        return;
      }
      el = el.parentElement;
    }
  }, { passive: false });
}

function AppInner({ profile }: { profile: Profile | null }) {
  usePushNotifications(profile?.id);
  const { visible, dismiss } = useOnboarding(profile?.role);
  const { scheme } = useTheme();

  return (
    <>
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      <RootNavigator />
      {profile?.role && visible && (
        <OnboardingModal role={profile.role} visible={visible} onDismiss={dismiss} />
      )}
    </>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser]       = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [recovering, setRecovering] = useState(false);

  // Le mail de réinitialisation ouvre l'app sur nexart://reset-password#access_token=…&type=recovery.
  const handleRecoveryUrl = useCallback(async (url: string | null) => {
    if (!url || !url.includes('type=recovery')) return;
    const params = new URLSearchParams(url.split('#')[1] ?? '');
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');
    if (!access_token || !refresh_token) return;
    const { error } = await supabase.auth.setSession({ access_token, refresh_token });
    if (!error) setRecovering(true);
  }, []);

  useEffect(() => {
    Linking.getInitialURL().then(handleRecoveryUrl);
    const sub = Linking.addEventListener('url', e => handleRecoveryUrl(e.url));
    return () => sub.remove();
  }, [handleRecoveryUrl]);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile(data);
    setLoading(false);
  }, []);

  const refetchProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) await fetchProfile(currentUser.id);
  }, [fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) fetchProfile(session.user.id);
      else { setProfile(null); setLoading(false); }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  if (showSplash) {
    return (
      <SafeAreaProvider>
        <SplashScreen onFinish={() => setShowSplash(false)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ session, user, profile, loading, refetchProfile, setProfile }}>
        <ThemeProvider>
          <ToastProvider>
            {recovering
              ? <ResetPasswordScreen onDone={() => setRecovering(false)} />
              : <AppInner profile={profile} />}
          </ToastProvider>
        </ThemeProvider>
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
