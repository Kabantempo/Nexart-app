import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { useCreatorProducts, Product } from '../../hooks/useCreatorProducts';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const euro = (n: number) => n.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });

export default function BoutiqueScreen({ route, navigation }: any) {
  const { creatorId, creatorName } = route.params as { creatorId: string; creatorName?: string };
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { products, events, loading, refetch } = useCreatorProducts(creatorId);
  const [selected, setSelected] = useState<Product | null>(null);
  const featured = selected?.featured_event_id ? events[selected.featured_event_id] : undefined;

  return (
    <EventScreenShell title={creatorName ? `Boutique de ${creatorName}` : 'Boutique'} onBack={() => navigation.goBack()}
      loading={loading} onRetry={refetch}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        <Text style={s.notice}>Les créations sont à retrouver sur le stand ou à commander auprès du créateur.</Text>
        {products.length === 0 ? <Text style={s.empty}>Aucun produit disponible pour l'instant.</Text> : null}
        <View style={s.grid}>
          {products.map(p => (
            <TouchableOpacity key={p.id} style={s.card} onPress={() => setSelected(p)} activeOpacity={0.85}>
              {p.images?.[0] ? <Image source={{ uri: p.images[0] }} style={s.image} resizeMode="cover" /> : (
                <View style={[s.image, s.noImage]}><Ionicons name="bag-outline" size={28} color={colors.text.secondary} /></View>
              )}
              <View style={s.cardBody}>
                <Text style={s.name} numberOfLines={2}>{p.title}</Text>
                <Text style={s.price}>{euro(p.price)}</Text>
                {p.stock != null && p.stock <= 3 ? <Text style={s.low}>Plus que {p.stock}</Text> : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!selected} animationType="slide" transparent onRequestClose={() => setSelected(null)}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} accessibilityRole="button" style={s.close} onPress={() => setSelected(null)} accessibilityLabel="Fermer">
              <Ionicons name="close" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            {selected ? (
              <ScrollView>
                {selected.images?.[0] ? <Image source={{ uri: selected.images[0] }} style={s.hero} resizeMode="cover" /> : null}
                <Text style={s.sheetTitle}>{selected.title}</Text>
                <Text style={s.price}>{euro(selected.price)}</Text>
                {selected.category ? <Text style={s.meta}>{selected.category}</Text> : null}
                {selected.description ? <Text style={s.desc}>{selected.description}</Text> : null}
                {featured ? (
                  <Text style={s.meta}>
                    À retrouver à « {featured.title} »{featured.city ? `, ${featured.city}` : ''} le {new Date(featured.start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </Text>
                ) : null}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  notice: { ...typography.caption, color: colors.text.secondary, marginBottom: spacing.md },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  card: {
    flexBasis: '48%', flexGrow: 1, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, overflow: 'hidden',
  },
  image: { width: '100%', height: 140, backgroundColor: colors.border },
  noImage: { alignItems: 'center', justifyContent: 'center' },
  cardBody: { padding: spacing.sm, gap: 2 },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  price: { ...typography.label, color: colors.primary, fontWeight: '700' },
  low: { ...typography.caption, color: colors.error },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.background, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl,
    padding: spacing.lg, maxHeight: '85%', gap: spacing.sm,
  },
  close: { alignSelf: 'flex-end', padding: spacing.xs },
  hero: { width: '100%', height: 240, borderRadius: radius.md, backgroundColor: colors.border, marginBottom: spacing.sm },
  sheetTitle: { ...typography.h3, color: colors.text.primary },
  meta: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.xs },
  desc: { ...typography.body, color: colors.text.secondary, marginTop: spacing.sm },
});
