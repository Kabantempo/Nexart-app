import React, { useCallback, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { supabase } from './src/lib/supabase';
import { AuthContext } from './src/stores/auth';
import { Profile } from './src/types';
import RootNavigator from './src/navigation';
import { usePushNotifications } from './src/hooks/usePushNotifications';
import OnboardingModal, { useOnboarding } from './src/components/OnboardingModal';

function AppInner({ profile }: { profile: Profile | null }) {
  usePushNotifications(profile?.id);
  const { visible, dismiss } = useOnboarding(profile?.role);

  return (
    <>
      <StatusBar style="dark" />
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

  return (
    <SafeAreaProvider>
      <AuthContext.Provider value={{ session, user, profile, loading, refetchProfile, setProfile }}>
        <AppInner profile={profile} />
      </AuthContext.Provider>
    </SafeAreaProvider>
  );
}
