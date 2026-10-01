import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../stores/theme';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';
import PublicCreatorProfile from './PublicCreatorProfileScreen';

/** Résout `@pseudo` en identifiant de profil, comme `/u/[username]` sur le site. */
export default function UsernameProfileScreen({ route, navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const username: string = route.params?.username ?? '';
  const directId: string | undefined = route.params?.creatorId;
  const [state, setState] = useState<{ status: 'loading' } | { status: 'missing' } | { status: 'found'; id: string }>(
    directId ? { status: 'found', id: directId } : { status: 'loading' },
  );

  useEffect(() => {
    if (directId) return;
    let cancelled = false;
    supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setState(data ? { status: 'found', id: (data as { id: string }).id } : { status: 'missing' });
      });
    return () => { cancelled = true; };
  }, [username, directId]);

  if (state.status === 'found') {
    return <PublicCreatorProfile route={{ params: { creatorId: state.id } } as any} navigation={navigation} />;
  }

  return (
    <View style={s.container}>
      {state.status === 'loading' ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <>
          <Text style={s.title}>Profil introuvable</Text>
          <Text style={s.text}>Aucun profil ne correspond à @{username}.</Text>
          <TouchableOpacity style={s.btn} onPress={() => navigation.goBack()}>
            <Text style={s.btnText}>Retour</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: spacing.xl, gap: spacing.md },
  title: { ...typography.h2, color: colors.text.primary },
  text: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },
  btn: { backgroundColor: colors.primary, borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md },
  btnText: { ...typography.label, color: '#fff', fontWeight: '600' },
});
