import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ScrollView, Alert, ActivityIndicator, Platform, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../stores/auth';
import { createPost, extractHashtags, PostType } from '../../hooks/usePosts';
import { supabase } from '../../lib/supabase';
import { POST_TYPE_CONFIG } from '../../components/PostCard';
import { colors, spacing, typography, radius } from '../../constants/theme';

const POST_TYPES = Object.entries(POST_TYPE_CONFIG) as [PostType, { label: string; color: string }][];

export default function CreatePostScreen() {
  const nav = useNavigation<any>();
  const { profile } = useAuth();

  const [type, setType]         = useState<PostType>('general');
  const [content, setContent]   = useState('');
  const [images, setImages]     = useState<string[]>([]);
  const [eventRef, setEventRef] = useState('');
  const [location, setLocation] = useState('');
  const [saving, setSaving]     = useState(false);
  const [uploading, setUploading] = useState(false);

  const hashtags = extractHashtags(content);
  const charsLeft = 280 - content.length;

  const pickImages = async () => {
    if (images.length >= 3) { Alert.alert('Maximum 3 photos'); return; }
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { Alert.alert('Permission requise'); return; }
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsMultipleSelection: true,
      quality: 0.8, selectionLimit: 3 - images.length,
    });
    if (result.canceled || !profile?.id) return;
    setUploading(true);
    const urls: string[] = [];
    for (const asset of result.assets) {
      const ext = asset.uri.split('.').pop() ?? 'jpg';
      const path = `${profile.id}/${Date.now()}.${ext}`;
      const resp = await fetch(asset.uri); const blob = await resp.blob();
      const { error } = await supabase.storage.from('portfolios').upload(path, blob, { upsert: false });
      if (!error) {
        const { data: { publicUrl } } = supabase.storage.from('portfolios').getPublicUrl(path);
        urls.push(publicUrl);
      }
    }
    setImages(prev => [...prev, ...urls]);
    setUploading(false);
  };

  const handlePost = async () => {
    if (!content.trim()) { Alert.alert('Contenu requis'); return; }
    if (!profile?.id)    return;
    setSaving(true);
    const { error } = await createPost({
      creatorId:    profile.id,
      content:      content.trim(),
      images,
      postType:     type,
      eventRef:     eventRef.trim() || undefined,
      locationName: location.trim() || undefined,
    });
    setSaving(false);
    if (error) { Alert.alert('Erreur', error); return; }
    nav.goBack();
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <View style={s.header}>
        <TouchableOpacity onPress={() => nav.goBack()}><Text style={s.cancel}>Annuler</Text></TouchableOpacity>
        <Text style={s.title}>Nouveau post</Text>
        <TouchableOpacity style={[s.postBtn, (!content.trim() || saving) && s.postBtnDisabled]} onPress={handlePost} disabled={!content.trim() || saving}>
          <Text style={s.postBtnText}>{saving ? '…' : 'Publier'}</Text>
        </TouchableOpacity>
      </View>

      {/* Type selector */}
      <Text style={s.label}>Type</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.typeRow}>
        {POST_TYPES.map(([t, cfg]) => (
          <TouchableOpacity
            key={t}
            style={[s.typeChip, type === t && { backgroundColor: cfg.color + '20', borderColor: cfg.color }]}
            onPress={() => setType(t)}
          >
            <Text style={[s.typeChipText, type === t && { color: cfg.color, fontWeight: '700' }]}>{cfg.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      <TextInput
        style={s.textarea}
        value={content}
        onChangeText={setContent}
        placeholder="Quoi de neuf ? Utilisez #hashtags pour plus de visibilité…"
        placeholderTextColor={colors.text.secondary}
        multiline
        maxLength={280}
        autoFocus
      />
      <Text style={[s.charCount, charsLeft < 20 && { color: colors.error }]}>{charsLeft}</Text>

      {/* Hashtags preview */}
      {hashtags.length > 0 && (
        <View style={s.hashtagRow}>
          {hashtags.map(h => <Text key={h} style={s.hashtagPreview}>#{h}</Text>)}
        </View>
      )}

      {/* Event ref */}
      {(type === 'guest_appearance' || type === 'experience') && (
        <>
          <Text style={s.label}>Marché concerné (optionnel)</Text>
          <TextInput style={s.input} value={eventRef} onChangeText={setEventRef} placeholder="Ex : Marché de Noël de Lyon" placeholderTextColor={colors.text.secondary} />
        </>
      )}

      {/* Location */}
      <Text style={s.label}>Lieu (optionnel)</Text>
      <TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="Ex : Marseille, 13001" placeholderTextColor={colors.text.secondary} />

      {/* Images */}
      <Text style={s.label}>Photos ({images.length}/3)</Text>
      <View style={s.imageRow}>
        {images.map((uri, i) => (
          <View key={i} style={s.imgWrap}>
            <Image source={{ uri }} style={s.img} />
            <TouchableOpacity style={s.imgRemove} onPress={() => setImages(prev => prev.filter((_, j) => j !== i))}>
              <Ionicons name="close" size={14} color="#fff" />
            </TouchableOpacity>
          </View>
        ))}
        {images.length < 3 && (
          <TouchableOpacity style={s.imgAdd} onPress={pickImages} disabled={uploading}>
            {uploading ? <ActivityIndicator color={colors.primary} /> : <Text style={s.imgAddText}>+</Text>}
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  content:   { padding: spacing.xl, paddingTop: spacing.xxl },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl },
  cancel:    { color: colors.text.secondary, ...typography.label },
  title:     { ...typography.h3, color: colors.text.primary },
  postBtn:   { backgroundColor: colors.primary, borderRadius: radius.full, paddingHorizontal: spacing.lg, paddingVertical: 8 },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
  label:     { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 11, marginBottom: spacing.sm, marginTop: spacing.lg },
  typeRow:   { gap: spacing.xs, paddingBottom: spacing.sm },
  typeChip:  { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radius.full, borderWidth: 1, borderColor: colors.border },
  typeChipText: { ...typography.caption, color: colors.text.secondary },
  textarea:  { ...typography.body, color: colors.text.primary, minHeight: 120, textAlignVertical: 'top', lineHeight: 24 },
  charCount: { ...typography.caption, color: colors.text.secondary, textAlign: 'right', marginBottom: spacing.sm },
  hashtagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.sm },
  hashtagPreview: { ...typography.caption, color: colors.primary },
  input:     { backgroundColor: colors.surface, color: colors.text.primary, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  imageRow:  { flexDirection: 'row', gap: spacing.sm },
  imgWrap:   { position: 'relative' },
  img:       { width: 90, height: 90, borderRadius: radius.md, backgroundColor: colors.surface },
  imgRemove: { position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.error, alignItems: 'center', justifyContent: 'center' },
  imgRemoveText: { color: 'white', fontSize: 10, fontWeight: '700' },
  imgAdd:    { width: 90, height: 90, borderRadius: radius.md, borderWidth: 2, borderColor: colors.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  imgAddText:{ ...typography.h2, color: colors.text.secondary },
});
