import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '../../constants/theme';

type Tab = 'terms' | 'privacy';

const TERMS = `CONDITIONS GÉNÉRALES D'UTILISATION

Dernière mise à jour : 30 juin 2026

1. OBJET
Nexart est une plateforme de mise en relation entre créateurs artisanaux et organisateurs d'événements (marchés, salons, expositions).

2. ACCÈS ET UTILISATION
L'accès à la plateforme est gratuit. Certaines fonctionnalités nécessitent la création d'un compte. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.

3. RÔLES UTILISATEURS
- Créateur : Artisan proposant ses créations pour participer à des événements
- Organisateur : Structure organisant des événements artisanaux
- Visiteur : Utilisateur découvrant la plateforme et ses acteurs

4. CONTENU
Les utilisateurs sont responsables du contenu qu'ils publient. Nexart se réserve le droit de modérer et supprimer tout contenu inapproprié.

5. PROPRIÉTÉ INTELLECTUELLE
La plateforme et son contenu sont protégés par les lois sur la propriété intellectuelle. Les utilisateurs conservent la propriété de leurs œuvres.

6. LIMITATION DE RESPONSABILITÉ
Nexart est une plateforme d'intermédiation et ne peut être tenue responsable des relations contractuelles entre utilisateurs.

7. RÉSILIATION
L'utilisateur peut supprimer son compte à tout moment. Nexart peut suspendre un compte en cas de violation des présentes CGU.

8. DROIT APPLICABLE
Les présentes CGU sont soumises au droit français. Tout litige sera soumis aux tribunaux compétents français.`;

const PRIVACY = `POLITIQUE DE CONFIDENTIALITÉ

Dernière mise à jour : 30 juin 2026

1. RESPONSABLE DU TRAITEMENT
Nexart, société éditrice de la plateforme nexart.fr, est responsable du traitement de vos données personnelles.

2. DONNÉES COLLECTÉES
Nous collectons :
- Données d'identification : nom, email, rôle
- Données de profil : biographie, localisation, disciplines, portfolio
- Données d'activité : candidatures, messages, événements créés
- Données techniques : adresse IP, logs de connexion

3. FINALITÉS DU TRAITEMENT
Vos données sont utilisées pour :
- Gérer votre compte et votre profil
- Mettre en relation créateurs et organisateurs
- Envoyer des notifications et communications liées à votre activité
- Améliorer nos services

4. BASE LÉGALE
Le traitement est fondé sur l'exécution du contrat d'utilisation et votre consentement.

5. CONSERVATION
Vos données sont conservées pendant la durée d'utilisation du service et 3 ans après la suppression du compte.

6. VOS DROITS
Conformément au RGPD, vous disposez des droits d'accès, de rectification, d'effacement, de portabilité et d'opposition. Contactez-nous : contact@nexart.fr

7. COOKIES
Nous utilisons des cookies pour maintenir votre session et améliorer l'expérience utilisateur. Vous pouvez les désactiver dans les paramètres de votre navigateur.

8. SÉCURITÉ
Nous utilisons Supabase (infrastructure AWS) avec chiffrement SSL pour protéger vos données.`;

export default function LegalScreen() {
  const [tab, setTab] = useState<Tab>('terms');

  return (
    <View style={s.container}>
      {/* Tabs */}
      <View style={s.tabs}>
        <TouchableOpacity style={[s.tab, tab === 'terms' && s.tabActive]} onPress={() => setTab('terms')} activeOpacity={0.7}>
          <Text style={[s.tabText, tab === 'terms' && s.tabTextActive]}>CGU</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, tab === 'privacy' && s.tabActive]} onPress={() => setTab('privacy')} activeOpacity={0.7}>
          <Text style={[s.tabText, tab === 'privacy' && s.tabTextActive]}>Confidentialité</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <Text style={s.text}>{tab === 'terms' ? TERMS : PRIVACY}</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  tabs: {
    flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border,
    backgroundColor: colors.surface,
  },
  tab: {
    flex: 1, paddingVertical: 14, alignItems: 'center',
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabActive:     { borderBottomColor: colors.primary },
  tabText:      { ...typography.label, color: colors.text.secondary },
  tabTextActive: { color: colors.primary, fontWeight: '700' },

  scroll:   { flex: 1 },
  content:  { padding: spacing.xl, paddingBottom: spacing.xxl },
  text:     { ...typography.body, color: colors.text.secondary, lineHeight: 22, whiteSpace: 'pre-wrap' as never },
});
