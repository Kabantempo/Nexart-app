import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import { useTheme } from '../../stores/theme';
import { useSiteData, euros } from '../../hooks/useSiteData';
import { downloadInvoice, invoiceNumber } from '../../lib/invoice';
import { ThemeColors, spacing, typography, radius } from '../../constants/theme';

interface Payment {
  id: string;
  amount_cents: number;
  status: string;
  created_at: string;
  application_id: string | null;
  stripe_payment_id: string | null;
  event?: { id: string; title: string; start_date: string | null; city: string | null; organizer?: { full_name: string | null } | null } | null;
}

const STATUS_LABELS: Record<string, string> = {
  completed: 'Payé', succeeded: 'Payé', paid: 'Payé', pending: 'En attente', refunded: 'Remboursé', failed: 'Échoué',
};

export default function PaymentsScreen({ navigation }: any) {
  const { colors } = useTheme();
  const s = useMemo(() => makeStyles(colors), [colors]);
  const { data, loading, error, refetch } = useSiteData<{ payments: Payment[] }>(
    '/api/creator/payments', 'Impossible de charger vos paiements.',
  );
  const payments = data?.payments ?? [];
  const [busyId, setBusyId] = useState<string | null>(null);

  const getInvoice = async (p: Payment) => {
    setBusyId(p.id);
    const err = await downloadInvoice(p);
    setBusyId(null);
    if (err) Alert.alert('Facture indisponible', err);
  };
  const canInvoice = (p: Payment) => !!p.application_id && ['completed', 'succeeded', 'paid'].includes(p.status);

  return (
    <EventScreenShell title="Mes paiements" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {payments.length === 0 ? <Text style={s.empty}>Aucun paiement pour l'instant.</Text> : null}
        {payments.map(p => (
          <View key={p.id} style={s.card}>
            <View style={s.top}>
              <Text style={s.name} numberOfLines={2}>{p.event?.title ?? 'Stand'}</Text>
              <Text style={s.amount}>{euros(p.amount_cents)}</Text>
            </View>
            <Text style={s.meta}>
              {[p.event?.organizer?.full_name, p.event?.city].filter(Boolean).join(' · ')}
            </Text>
            <Text style={s.meta}>
              {STATUS_LABELS[p.status] ?? p.status} · {new Date(p.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>
            {canInvoice(p) ? (
              <TouchableOpacity style={[s.invoice, busyId === p.id && { opacity: 0.5 }]} disabled={busyId !== null} onPress={() => getInvoice(p)}
                accessibilityRole="button" accessibilityLabel={`Télécharger la facture ${invoiceNumber(p)}`}>
                <Text style={s.invoiceText}>{busyId === p.id ? 'Génération…' : 'Télécharger la facture (PDF)'}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        ))}
      </ScrollView>
    </EventScreenShell>
  );
}

const makeStyles = (colors: ThemeColors) => StyleSheet.create({
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, gap: 2,
  },
  top: { flexDirection: 'row', justifyContent: 'space-between', gap: spacing.md },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '600', flex: 1 },
  amount: { ...typography.label, color: colors.primary, fontWeight: '700' },
  meta: { ...typography.caption, color: colors.text.secondary },
  invoice: { marginTop: spacing.sm, minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  invoiceText: { ...typography.label, color: colors.primary, fontWeight: '600' },
});
