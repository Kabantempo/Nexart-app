import React, { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Image, ActivityIndicator } from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { DiscoverStackParams } from '../../navigation/DiscoverStack';
import { usePublicCreators } from '../../hooks/usePublicCreators';
import { PublicCreatorProfile, DISCIPLINE_TAGS } from '../../types';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Props = {
  navigation: StackNavigationProp<DiscoverStackParams, 'CreatorsList'>;
  route: RouteProp<DiscoverStackParams, 'CreatorsList'>;
};

function CreatorRow({ creator, onPress }: { creator: PublicCreatorProfile; onPress: () => void }) {
  const cover = creator.portfolio_images[0];
  return (
    <TouchableOpacity style={s.row} onPress={onPress} activeOpacity={0.8}>
      {cover
        ? <Image source={{ uri: cover }} style={s.cover} />
        : <View style={[s.cover, s.coverPlaceholder]}><Text style={s.coverPlaceholderText}>{creator.disciplines[0]?.slice(0, 2) ?? '✦'}</Text></View>
      }
      <View style={s.avatar}>
        {creator.avatar_url
          ? <Image source={{ uri: creator.avatar_url }} style={s.avatarImg} />
          : <Text style={s.avatarText}>{creator.full_name[0]?.toUpperCase()}</Text>
        }
      </View>
      <View style={s.info}>
        <View style={s.nameRow}>
          <Text style={s.name}>{creator.full_name}</Text>
          {creator.siret_verified && <Text style={s.verified}>✓</Text>}
        </View>
        <Text style={s.disciplines}>{creator.disciplines.slice(0, 3).join(' · ')}</Text>
        {creator.city && <Text style={s.city}>📍 {creator.city}</Text>}
      </View>
    </TouchableOpacity>
  );
}

export default function CreatorsListScreen({ navigation, route }: Props) {
  const [search, setSearch] = useState('');
  const [disc, setDisc]     = useState(route.params?.discipline ?? '');

  const { creators, loading } = usePublicCreators({ discipline: disc || undefined, city: search || undefined });

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.back} onPress={() => navigation.goBack()}>
        <Text style={s.backText}>← Retour</Text>
      </TouchableOpacity>
      <Text style={s.title}>Créateurs</Text>

      <View style={s.searchBar}>
        <TextInput style={s.searchInput} placeholder="Ville, nom…" placeholderTextColor={colors.text.secondary} value={search} onChangeText={setSearch} autoCapitalize="none" />
      </View>

      <View style={s.discRow}>
        {['', ...DISCIPLINE_TAGS.slice(0, 8)].map(tag => (
          <TouchableOpacity key={tag} style={[s.chip, disc === tag && s.chipActive]} onPress={() => setDisc(tag)}>
            <Text style={[s.chipText, disc === tag && s.chipTextActive]}>{tag || 'Tous'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={s.centered}><ActivityIndicator color={colors.primary} size="large" /></View>
      ) : (
        <FlatList
          data={creators}
          keyExtractor={c => c.id}
          renderItem={({ item }) => (
            <CreatorRow creator={item} onPress={() => navigation.navigate('PublicCreatorProfile', { creatorId: item.id })} />
          )}
          contentContainerStyle={s.list}
          ListEmptyComponent={<Text style={s.empty}>Aucun créateur trouvé</Text>}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, paddingTop: spacing.xxl },
  centered:  { flex: 1, alignItems: 'center', justifyContent: 'center' },
  back: { paddingHorizontal: spacing.xl, marginBottom: spacing.sm },
  backText: { color: colors.text.secondary },
  title: { ...typography.h2, color: colors.text.primary, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  searchBar: { marginHorizontal: spacing.xl, backgroundColor: colors.surface, borderRadius: radius.md, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  searchInput: { ...typography.body, color: colors.text.primary, paddingVertical: spacing.sm },
  discRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  chip: { paddingHorizontal: spacing.sm, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.caption, color: colors.text.secondary },
  chipTextActive: { color: colors.text.inverse, fontWeight: '700' },
  list: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.lg, marginBottom: spacing.sm, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  cover: { width: 80, height: 80 },
  coverPlaceholder: { backgroundColor: colors.primary + '15', alignItems: 'center', justifyContent: 'center' },
  coverPlaceholderText: { fontSize: 22 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary + '25', alignItems: 'center', justifyContent: 'center' },
  avatarImg: { width: 40, height: 40, borderRadius: 20 },
  avatarText: { ...typography.label, color: colors.primary, fontWeight: '700' },
  info: { flex: 1, paddingRight: spacing.md },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  name: { ...typography.label, color: colors.text.primary, fontWeight: '700' },
  verified: { color: colors.secondary, fontWeight: '700', fontSize: 12 },
  disciplines: { ...typography.caption, color: colors.primary, marginTop: 2 },
  city: { ...typography.caption, color: colors.text.secondary },
  empty: { ...typography.body, color: colors.text.secondary, textAlign: 'center', paddingTop: spacing.xxl },
});
