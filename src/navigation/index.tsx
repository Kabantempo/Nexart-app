import React, { useMemo } from 'react';
import { NavigationContainer, DefaultTheme, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../stores/auth';
import { ThemeColors, colors } from '../constants/theme';
import { useThemeColors } from '../stores/theme';
import { pageTransitionOptions } from '../lib/navigationConfig';
import { unauthLinking, visitorLinking, creatorLinking, defaultLinking } from './linking';

import AuthNavigator      from './AuthNavigator';
import AdminNavigator     from './AdminNavigator';
import CreatorNavigator   from './CreatorNavigator';
import OrganizerNavigator from './OrganizerNavigator';
import VisitorNavigator   from './VisitorNavigator';
import DiscoverStack      from './DiscoverStack';
import AboutScreen        from '../screens/info/AboutScreen';
import ContactScreen      from '../screens/info/ContactScreen';
import LegalScreen        from '../screens/info/LegalScreen';
import AdminScreen        from '../screens/admin/AdminScreen';
import BlogScreen         from '../screens/info/BlogScreen';
import BannedScreen       from '../screens/info/BannedScreen';
import UsernameProfileScreen from '../screens/discover/UsernameProfileScreen';
import CalendarScreen     from '../screens/discover/CalendarScreen';
import SearchScreen       from '../screens/discover/SearchScreen';
import TrendsScreen       from '../screens/discover/TrendsScreen';
import CompareScreen      from '../screens/discover/CompareScreen';
import SettingsScreen     from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ReferralScreen     from '../screens/shared/ReferralScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const colors = useThemeColors();
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  const isAuthenticated = !!session || !!profile;

  const linking: LinkingOptions<ReactNavigation.RootParamList> = !isAuthenticated
    ? unauthLinking
    : profile?.role === 'visitor'
      ? visitorLinking
      : profile?.role === 'creator'
        ? creatorLinking
        : defaultLinking;

  return (
    <NavigationContainer
      linking={linking}
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          background:   colors.background,
          card:         colors.surface,
          text:         colors.text.primary,
          border:       colors.border,
          primary:      colors.primary,
          notification: colors.primary,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false, ...pageTransitionOptions }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Auth"     component={AuthNavigator} />
            <Stack.Screen name="Discover" component={DiscoverStack} />
          </>
        ) : profile?.is_banned ? (
          <Stack.Screen name="Banned"    component={BannedScreen} />
        ) : profile?.is_admin ? (
          <Stack.Screen name="Admin"     component={AdminNavigator} />
        ) : profile?.role === 'creator' ? (
          <Stack.Screen name="Creator"   component={CreatorNavigator} />
        ) : profile?.role === 'organizer' ? (
          <Stack.Screen name="Organizer" component={OrganizerNavigator} />
        ) : (
          <Stack.Screen name="Visitor"   component={VisitorNavigator} />
        )}
        <Stack.Screen
          name="About"
          component={AboutScreen}
          options={{ headerShown: true, title: 'À propos', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="Contact"
          component={ContactScreen}
          options={{ headerShown: true, title: 'Contact', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="Legal"
          component={LegalScreen}
          options={{ headerShown: true, title: 'Mentions légales', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen name="Username" component={UsernameProfileScreen} />
        <Stack.Screen name="CreatorProfile" component={UsernameProfileScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="Referral" component={ReferralScreen} />
        <Stack.Screen
          name="Trends"
          component={TrendsScreen}
          options={{ headerShown: true, title: 'Tendances', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="Compare"
          component={CompareScreen}
          options={{ headerShown: true, title: 'Comparateur', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ headerShown: true, title: 'Recherche', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ headerShown: true, title: 'Calendrier', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="Blog"
          component={BlogScreen}
          options={{ headerShown: true, title: 'Blog', headerBackTitle: 'Retour' }}
        />
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ headerShown: true, title: 'Panel Admin', headerBackTitle: 'Retour' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
