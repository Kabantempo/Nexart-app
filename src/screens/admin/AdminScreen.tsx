import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  ActivityIndicator, Image, RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../stores/auth';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Creator = {
  user_id: string;
  siret_number: string | null;
  siret_verified: boolean;
  insurance_verified: boolean;
  insurance_doc_url: string | null;
  profiles: { full_name: string; avatar_url: string | null } | null;
};

type Filter = 'pending' | 'all';

export default function AdminScreen() {
  const { profile } = useAuth();
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [filter, setFilter] = useState<Filter>('pending');
  const [saving, setSaving] = useState<string | null>(null);

  const fetchCreators = useCallback(async () => {
    const { data } = await supabase
      .from('creator_profiles')
      .select('user_id, siret_number, siret_verified, insurance_verified, insurance_doc_url, profiles(full_name, avatar_url)')
      .order('user_id');
    setCreators((data as unknown as Creator[]) ?? []);
  }, []);

  useEffect(() => {
    if (!profile) return;
    if (!profile.is_admin) { navigation.goBack(); return; }
    fetchCreators().finally(() => setLoading(false));
  }, [profile, navigation, fetchCreators]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCreators();
    setRefreshing(false);
  };

  const handleVerify = async (userId: string, field: 'siret_verified' | 'insurance_verified', value: boolean) => {
    setSaving(`${userId}-${field}`);
    await supabase.from('creator_profiles').update({ [field]: value }).eq('user_id', userId);
    setCreators(prev => prev.map(c => (c.user_id === userId ? { ...c, [field]: value } : c)));
    setSaving(null);
  };

  if (!profile?.is_admin) return null;

  const pending = creators.filter(c => !c.siret_verified || (!c.insurance_verified && c.insurance_doc_url));
  const displayed = filter === 'pending' ? pending : creators;

  if (loading) {
    return (
      <View style={s.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={s.container}
      contentContainerStyle={s.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={s.headerRow}>
        <View style={s.headerIcon}>
          <Ionicons name="shield-checkmark" size={20} color="#FFF" />
        </View>
        <View>
          <Text style={s.headerTitle}>Panel Admin</Text>
          <Text style={s.headerSub}>Vérification des créateurs</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={s.statsRow}>
        <StatCard label="Total" value={creators.length} color={colors.primary} bg={colors.primary + '15'} />
        <StatCard label="SIRET en attente" value={creators.filter(c => !c.siret_verified && c.siret_number).length} color="#F59E0B" bg="#FFFBEB" />
        <StatCard label="Vérifiés" value={creators.filter(c => c.siret_verified && c.insurance_verified).length} color={colors.success} bg={colors.success + '15'} />
      </View>

      {/* Filter */}
      <View style={s.filterRow}>
        {([{ k: 'pending', label: `En attente (${pending.length})` }, { k: 'all', label: `Tous (${creators.length})` }] as { k: Filter; label: string }[]).map(f => (
          <TouchableOpacity
            key={f.k}
            onPress={() => setFilter(f.k)}
            style={[s.filterBtn, filter === f.k && s.filterBtnActive]}
          >
            <Text style={[s.filterBtnText, filter === f.k && s.filterBtnTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* List */}
      {displayed.length === 0 ? (
        <View style={s.empty}>
          <Ionicons name="checkmark-circle-outline" size={40} color={colors.success} />
          <Text style={s.emptyTitle}>Tout est vérifié ✓</Text>
          <Text style={s.emptySub}>Aucune demande en attente.</Text>
        </View>
      ) : (
        displayed.map(c => (
          <View key={c.user_id} style={s.card}>
            <View style={s.cardHeader}>
              {c.profiles?.avatar_url ? (
                <Image source={{ uri: c.profiles.avatar_url }} style={s.avatar} />
              ) : (
                <View style={s.avatarFallback}>
                  <Ionicons name="person" size={18} color="#FFF" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <Text style={s.creatorName}>{c.profiles?.full_name ?? 'Créateur'}</Text>
                <Text style={s.creatorId}>{c.user_id.slice(0, 8)}…</Text>
              </View>
            </View>

            {/* SIRET */}
            <View style={[s.section, { borderColor: c.siret_verified ? '#A7F3D0' : '#FDE68A', backgroundColor: c.siret_verified ? '#ECFDF5' : '#FFFBEB' }]}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>SIRET</Text>
                <View style={[s.badge, { backgroundColor: c.siret_verified ? colors.success : '#F59E0B' }]}>
                  <Text style={s.badgeText}>{c.siret_verified ? 'Vérifié' : 'En attente'}</Text>
                </View>
              </View>
              {c.siret_number ? (
                <Text style={s.siretNumber}>{c.siret_number}</Text>
              ) : (
                <Text style={s.muted}>Numéro non renseigné</Text>
              )}
              {!c.siret_verified && c.siret_number && (
                <View style={s.actionsRow}>
                  <TouchableOpacity
                    style={s.btnValidate}
                    onPress={() => handleVerify(c.user_id, 'siret_verified', true)}
                    disabled={saving === `${c.user_id}-siret_verified`}
                  >
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                    <Text style={s.btnValidateText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.btnReject}
                    onPress={() => handleVerify(c.user_id, 'siret_verified', false)}
                    disabled={saving === `${c.user_id}-siret_verified`}
                  >
                    <Ionicons name="close" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
              {c.siret_verified && (
                <TouchableOpacity onPress={() => handleVerify(c.user_id, 'siret_verified', false)}>
                  <Text style={s.revoke}>Révoquer</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* RC Pro */}
            <View style={[s.section, {
              borderColor: c.insurance_verified ? '#A7F3D0' : c.insurance_doc_url ? '#FDE68A' : colors.border,
              backgroundColor: c.insurance_verified ? '#ECFDF5' : c.insurance_doc_url ? '#FFFBEB' : colors.surface,
            }]}>
              <View style={s.sectionHeader}>
                <Text style={s.sectionTitle}>RC Pro</Text>
                <View style={[s.badge, { backgroundColor: c.insurance_verified ? colors.success : c.insurance_doc_url ? '#F59E0B' : colors.border }]}>
                  <Text style={[s.badgeText, !c.insurance_verified && !c.insurance_doc_url && { color: colors.text.secondary }]}>
                    {c.insurance_verified ? 'Vérifié' : c.insurance_doc_url ? 'Doc reçu' : 'Aucun doc'}
                  </Text>
                </View>
              </View>

              {c.insurance_doc_url ? (
                <TouchableOpacity onPress={() => Linking.openURL(c.insurance_doc_url!)} style={s.docLink}>
                  <Ionicons name="document-text-outline" size={14} color={colors.primary} />
                  <Text style={s.docLinkText}>Voir le document</Text>
                  <Ionicons name="open-outline" size={12} color={colors.primary} />
                </TouchableOpacity>
              ) : (
                <Text style={s.muted}>Aucun document déposé</Text>
              )}

              {!c.insurance_verified && c.insurance_doc_url && (
                <View style={s.actionsRow}>
                  <TouchableOpacity
                    style={s.btnValidate}
                    onPress={() => handleVerify(c.user_id, 'insurance_verified', true)}
                    disabled={saving === `${c.user_id}-insurance_verified`}
                  >
                    <Ionicons name="checkmark" size={14} color="#FFF" />
                    <Text style={s.btnValidateText}>Valider</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.btnReject}
                    onPress={() => handleVerify(c.user_id, 'insurance_verified', false)}
                    disabled={saving === `${c.user_id}-insurance_verified`}
                  >
                    <Ionicons name="close" size={14} color={colors.error} />
                  </TouchableOpacity>
                </View>
              )}
              {c.insurance_verified && (
                <TouchableOpacity onPress={() => handleVerify(c.user_id, 'insurance_verified', false)}>
                  <Text style={s.revoke}>Révoquer</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

function StatCard({ label, value, color, bg }: { label: string; value: number; color: string; bg: string }) {
  return (
    <View style={[s.statCard, { backgroundColor: bg }]}>
      <Text style={[s.statValue, { color }]}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.xl, paddingBottom: spacing.xxl },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background },

  headerRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg },
  headerIcon: { width: 36, height: 36, borderRadius: radius.sm, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.h3, color: colors.text.primary, fontWeight: '800' },
  headerSub: { ...typography.caption, color: colors.text.secondary },

  statsRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  statCard: { flex: 1, borderRadius: radius.md, padding: spacing.sm },
  statValue: { fontSize: 22, fontWeight: '800' },
  statLabel: { ...typography.caption, color: colors.text.secondary, fontWeight: '600', marginTop: 2 },

  filterRow: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.lg },
  filterBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.sm, backgroundColor: colors.muted },
  filterBtnActive: { backgroundColor: colors.primary },
  filterBtnText: { ...typography.caption, color: colors.text.secondary, fontWeight: '600' },
  filterBtnTextActive: { color: colors.text.inverse },

  empty: { alignItems: 'center', padding: spacing.xxl, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, borderStyle: 'dashed' },
  emptyTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700', marginTop: spacing.sm },
  emptySub: { ...typography.caption, color: colors.text.secondary, marginTop: 2 },

  card: { borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarFallback: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  creatorName: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  creatorId: { ...typography.caption, color: colors.text.secondary },

  section: { borderRadius: radius.sm, borderWidth: 1, padding: spacing.sm, gap: spacing.xs },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  badge: { paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.full },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFF' },
  siretNumber: { ...typography.body, fontWeight: '700', color: colors.text.primary, letterSpacing: 1 },
  muted: { ...typography.caption, color: colors.text.secondary },

  actionsRow: { flexDirection: 'row', gap: spacing.xs },
  btnValidate: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, backgroundColor: colors.success, borderRadius: radius.sm, paddingVertical: spacing.sm },
  btnValidateText: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  btnReject: { paddingHorizontal: spacing.md, borderRadius: radius.sm, backgroundColor: colors.error + '15', alignItems: 'center', justifyContent: 'center' },
  revoke: { fontSize: 11, color: colors.text.secondary },

  docLink: { flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' },
  docLinkText: { ...typography.caption, color: colors.primary, fontWeight: '600' },
});
