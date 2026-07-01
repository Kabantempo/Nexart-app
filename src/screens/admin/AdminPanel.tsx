import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '../../lib/supabase'
import { colors, spacing, typography, radius } from '../../constants/theme'
import { Toast } from '../../components/Toast'

interface Creator {
  user_id: string
  siret_number: string | null
  siret_verified: boolean
  insurance_verified: boolean
  insurance_doc_url: string | null
  profiles: { full_name: string; avatar_url: string | null } | null
}

export default function AdminPanel() {
  const [loading, setLoading] = useState(true)
  const [creators, setCreators] = useState<Creator[]>([])
  const [filter, setFilter] = useState<'all' | 'pending'>('pending')
  const [saving, setSaving] = useState<string | null>(null)
  const [toast, setToast] = useState<{ visible: boolean; message: string; type: 'success' | 'error' }>({
    visible: false,
    message: '',
    type: 'success',
  })

  useEffect(() => {
    fetchCreators()
  }, [])

  const fetchCreators = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('creator_profiles')
      .select('user_id, siret_number, siret_verified, insurance_verified, insurance_doc_url, profiles(full_name, avatar_url)')
      .order('user_id')
    setCreators((data as unknown as Creator[]) ?? [])
    setLoading(false)
  }

  const handleVerify = async (
    userId: string,
    field: 'siret_verified' | 'insurance_verified',
    value: boolean
  ) => {
    setSaving(`${userId}-${field}`)
    await supabase.from('creator_profiles').update({ [field]: value }).eq('user_id', userId)
    setCreators(prev =>
      prev.map(c => (c.user_id === userId ? { ...c, [field]: value } : c))
    )
    setSaving(null)
    setToast({
      visible: true,
      message: value ? 'Vérifié' : 'Refusé',
      type: 'success',
    })
  }

  const pending = creators.filter(
    c => !c.siret_verified || (!c.insurance_verified && c.insurance_doc_url)
  )
  const displayed = filter === 'pending' ? pending : creators

  const stats = [
    {
      label: 'Total',
      value: creators.length,
      color: colors.primary,
      icon: 'people-outline',
    },
    {
      label: 'SIRET en attente',
      value: creators.filter(c => !c.siret_verified && c.siret_number).length,
      color: '#F59E0B',
      icon: 'document-outline',
    },
    {
      label: 'RC Pro en attente',
      value: creators.filter(c => !c.insurance_verified && c.insurance_doc_url).length,
      color: '#EF4444',
      icon: 'shield-outline',
    },
    {
      label: 'Vérifiés',
      value: creators.filter(c => c.siret_verified && c.insurance_verified).length,
      color: '#10B981',
      icon: 'checkmark-circle-outline',
    },
  ]

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    )
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchCreators} />}
    >
      <Toast visible={toast.visible} message={toast.message} type={toast.type} duration={3000} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Ionicons name="shield" size={24} color="#FFF" />
        </View>
        <View>
          <Text style={styles.title}>Panel Admin</Text>
          <Text style={styles.subtitle}>Vérification des créateurs</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {stats.map(stat => (
          <View key={stat.label} style={styles.statCard}>
            <Ionicons name={stat.icon as any} size={24} color={stat.color} />
            <Text style={[styles.statValue, { color: stat.color }]}>{stat.value}</Text>
            <Text style={styles.statLabel}>{stat.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter */}
      <View style={styles.filterRow}>
        {[
          { k: 'pending', label: `En attente (${pending.length})` },
          { k: 'all', label: `Tous (${creators.length})` },
        ].map(f => (
          <TouchableOpacity
            key={f.k}
            style={[styles.filterBtn, filter === f.k && styles.filterBtnActive]}
            onPress={() => setFilter(f.k as 'all' | 'pending')}
          >
            <Text
              style={[
                styles.filterBtnText,
                filter === f.k && styles.filterBtnTextActive,
              ]}
            >
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Créateurs */}
      {displayed.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="checkmark-circle" size={40} color="#10B981" />
          <Text style={styles.emptyTitle}>Tout est vérifié</Text>
          <Text style={styles.emptySubtitle}>Aucune demande en attente.</Text>
        </View>
      ) : (
        <View style={styles.creatorsList}>
          {displayed.map(creator => (
            <View key={creator.user_id} style={styles.creatorCard}>
              {/* Creator Info */}
              <View style={styles.creatorHeader}>
                <View style={styles.creatorAvatar}>
                  <Ionicons name="person" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.creatorName}>
                    {creator.profiles?.full_name ?? 'Créateur'}
                  </Text>
                  <Text style={styles.creatorId}>{creator.user_id.slice(0, 8)}…</Text>
                </View>
              </View>

              {/* Documents */}
              <View style={styles.documentsRow}>
                {/* SIRET */}
                <View
                  style={[
                    styles.documentCard,
                    creator.siret_verified ? styles.documentVerified : styles.documentPending,
                  ]}
                >
                  <View style={styles.documentHeader}>
                    <Text style={styles.documentLabel}>SIRET</Text>
                    <View
                      style={[
                        styles.documentBadge,
                        creator.siret_verified
                          ? styles.documentBadgeVerified
                          : styles.documentBadgePending,
                      ]}
                    >
                      <Text style={styles.documentBadgeText}>
                        {creator.siret_verified ? 'Vérifié' : 'En attente'}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.documentValue}>
                    {creator.siret_number ?? 'Non fourni'}
                  </Text>
                  {creator.siret_number && !creator.siret_verified && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={styles.actionBtnAccept}
                        onPress={() => handleVerify(creator.user_id, 'siret_verified', true)}
                        disabled={saving === `${creator.user_id}-siret_verified`}
                      >
                        {saving === `${creator.user_id}-siret_verified` ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <>
                            <Ionicons name="checkmark" size={16} color="#FFF" />
                            <Text style={styles.actionBtnText}>Accepter</Text>
                          </>
                        )}
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionBtnReject}
                        onPress={() => handleVerify(creator.user_id, 'siret_verified', false)}
                        disabled={saving === `${creator.user_id}-siret_verified`}
                      >
                        <Ionicons name="close" size={16} color="#FFF" />
                        <Text style={styles.actionBtnText}>Refuser</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Insurance */}
                {creator.insurance_doc_url && (
                  <View
                    style={[
                      styles.documentCard,
                      creator.insurance_verified
                        ? styles.documentVerified
                        : styles.documentPending,
                    ]}
                  >
                    <View style={styles.documentHeader}>
                      <Text style={styles.documentLabel}>RC Pro</Text>
                      <View
                        style={[
                          styles.documentBadge,
                          creator.insurance_verified
                            ? styles.documentBadgeVerified
                            : styles.documentBadgePending,
                        ]}
                      >
                        <Text style={styles.documentBadgeText}>
                          {creator.insurance_verified ? 'Vérifié' : 'En attente'}
                        </Text>
                      </View>
                    </View>
                    {!creator.insurance_verified && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.actionBtnAccept}
                          onPress={() =>
                            handleVerify(creator.user_id, 'insurance_verified', true)
                          }
                          disabled={
                            saving === `${creator.user_id}-insurance_verified`
                          }
                        >
                          {saving === `${creator.user_id}-insurance_verified` ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <Ionicons name="checkmark" size={16} color="#FFF" />
                              <Text style={styles.actionBtnText}>Accepter</Text>
                            </>
                          )}
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtnReject}
                          onPress={() =>
                            handleVerify(creator.user_id, 'insurance_verified', false)
                          }
                          disabled={
                            saving === `${creator.user_id}-insurance_verified`
                          }
                        >
                          <Ionicons name="close" size={16} color="#FFF" />
                          <Text style={styles.actionBtnText}>Refuser</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },

  // Stats
  statsGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: 85,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  statLabel: {
    fontSize: 11,
    color: colors.text.secondary,
    fontWeight: '600',
    textAlign: 'center',
  },

  // Filter
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#F3F4F6',
  },
  filterBtnActive: {
    backgroundColor: colors.primary,
  },
  filterBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#4B5563',
    textAlign: 'center',
  },
  filterBtnTextActive: {
    color: '#FFF',
  },

  // Empty State
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },

  // Creators List
  creatorsList: {
    gap: spacing.md,
  },
  creatorCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Creator Header
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  creatorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  creatorName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text.primary,
  },
  creatorId: {
    fontSize: 12,
    color: colors.text.secondary,
    marginTop: 2,
  },

  // Documents
  documentsRow: {
    gap: spacing.md,
  },
  documentCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  documentVerified: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  documentPending: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },

  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  documentLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text.primary,
  },
  documentBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  documentBadgeVerified: {
    backgroundColor: '#059669',
  },
  documentBadgePending: {
    backgroundColor: '#F59E0B',
  },
  documentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
  },

  documentValue: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: spacing.md,
    fontFamily: 'monospace',
  },

  // Action Buttons
  actionButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtnAccept: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtnReject: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFF',
  },
})
