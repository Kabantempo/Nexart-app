import React, { useEffect, useMemo } from 'react';
import { AppState, View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { useAuth } from '../../stores/auth';
import { useTheme } from '../../stores/theme';
import { useCredits } from '../../hooks/useCredits';
import { useCheckout } from '../../hooks/useCheckout';
import { CAN_BUY_DIGITAL_IN_APP } from '../../constants/billing';
import { CREDIT_PACKS, formatPrice } from '../../constants/plans';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

const TYPE_LABELS: Record<string, string> = {
  gift: 'Offert',
  purchase: 'Achat',
  boost_application: 'Boost de candidature',
  boost_profile: 'Boost de profil',
  monthly_refill: 'Recharge mensuelle',
  admin: 'Ajustement',
};

export default function CreditsScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { balance, history, loading, error, refetch } = useCredits(user?.id);
  const { buy, busy } = useCheckout();

  // Le crédit arrive par le site après le paiement : on relit le solde au retour dans l'app.
  useEffect(() => {
    const sub = AppState.addEventListener('change', st => { if (st === 'active') refetch(); });
    return () => sub.remove();
  }, [refetch]);

  const purchase = async (priceId: string) => {
    const err = await buy(priceId, 'credits');
    if (err) Alert.alert('Paiement impossible', err);
  };

  return (
    <EventScreenShell title="Crédits" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xxl }}>
        <View style={s.balance}>
          <Text style={s.balanceLabel}>Solde</Text>
          <Text style={s.balanceValue}>{balance}</Text>
        </View>

        {CAN_BUY_DIGITAL_IN_APP ? (
          <>
            <Text style={s.section}>Acheter des crédits</Text>
            {CREDIT_PACKS.map(p => (
              <TouchableOpacity key={p.key} style={[s.pack, busy && { opacity: 0.6 }]} onPress={() => purchase(p.priceId)} disabled={busy}
                accessibilityRole="button" accessibilityLabel={`${p.label}, ${formatPrice(p.amount)}`}>
                <Text style={s.packLabel}>{p.label}</Text>
                <Text style={s.packPrice}>{formatPrice(p.amount)}</Text>
              </TouchableOpacity>
            ))}
            <Text style={s.note}>Le paiement s'ouvre dans votre navigateur. Les crédits apparaissent ici dès le retour dans l'app.</Text>
          </>
        ) : (
          <Text style={s.note}>L'achat de crédits se fait depuis un navigateur, sur votre compte Nexart.</Text>
        )}

        <Text style={s.section}>Historique</Text>
        {history.length === 0 ? <Text style={s.note}>Aucun mouvement pour l'instant.</Text> : null}
        {history.map(h => (
          <View key={h.id} style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.rowTitle}>{TYPE_LABELS[h.type] ?? h.type}</Text>
              <Text style={s.rowMeta}>{h.created_at ? new Date(h.created_at).toLocaleDateString('fr-FR') : ''}{h.description ? ` · ${h.description}` : ''}</Text>
            </View>
            <Text style={[s.amount, h.amount < 0 && { color: colors.text.secondary }]}>{h.amount > 0 ? `+${h.amount}` : h.amount}</Text>
          </View>
        ))}
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  balance: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.lg, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.md,
  },
  balanceLabel: { ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8 },
  balanceValue: { ...typography.h1, color: colors.text.primary },
  section: {
    ...typography.caption, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.8,
    marginTop: spacing.lg, marginBottom: spacing.sm,
  },
  pack: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  packLabel: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  packPrice: { ...typography.label, color: colors.primary, fontWeight: '700' },
  note: { ...typography.caption, color: colors.text.secondary, marginTop: spacing.sm },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface,
    borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm,
  },
  rowTitle: { ...typography.label, color: colors.text.primary, fontWeight: '600' },
  rowMeta: { ...typography.caption, color: colors.text.secondary },
  amount: { ...typography.label, color: colors.success, fontWeight: '700' },
});
