import React from 'react';
import { ScrollView } from 'react-native';
import EventScreenShell from '../../components/EventScreenShell';
import StatTiles from '../../components/StatTiles';
import { useSiteData } from '../../hooks/useSiteData';
import { spacing } from '../../constants/theme';

interface CreatorStats {
  profileViews: number;
  applicationsReceived: number;
  acceptedCount: number;
  rejectedCount: number;
  averageRating: number;
  reviewCount: number;
  acceptanceRate: number;
}

export default function CreatorAnalyticsScreen({ navigation }: any) {
  const { data, loading, error, refetch } = useSiteData<CreatorStats>(
    '/api/creator/analytics', 'Impossible de charger vos statistiques.',
  );

  return (
    <EventScreenShell title="Mes statistiques" onBack={() => navigation.goBack()} loading={loading} error={error} onRetry={refetch}>
      {data ? (
        <ScrollView contentContainerStyle={{ padding: spacing.md }}>
          <StatTiles tiles={[
            { label: 'Vues du profil', value: String(data.profileViews) },
            { label: 'Candidatures', value: String(data.applicationsReceived) },
            { label: 'Acceptées', value: String(data.acceptedCount) },
            { label: 'Refusées', value: String(data.rejectedCount) },
            { label: "Taux d'acceptation", value: `${data.acceptanceRate} %` },
            { label: `Note moyenne (${data.reviewCount} avis)`, value: data.reviewCount ? data.averageRating.toFixed(1) : '—' },
          ]} />
        </ScrollView>
      ) : null}
    </EventScreenShell>
  );
}
