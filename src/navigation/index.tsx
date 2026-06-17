import React from 'react';
import { NavigationContainer, DefaultTheme, LinkingOptions } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../stores/auth';
import { colors } from '../constants/theme';
import { pageTransitionOptions } from '../lib/navigationConfig';
import { unauthLinking, visitorLinking, creatorLinking, defaultLinking } from './linking';

import AuthNavigator      from './AuthNavigator';
import AdminNavigator     from './AdminNavigator';
import CreatorNavigator   from './CreatorNavigator';
import OrganizerNavigator from './OrganizerNavigator';
import VisitorNavigator   from './VisitorNavigator';
import DiscoverStack      from './DiscoverStack';

const Stack = createStackNavigator();

export default function RootNavigator() {
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
        ) : profile?.is_admin ? (
          <Stack.Screen name="Admin"     component={AdminNavigator} />
        ) : profile?.role === 'creator' ? (
          <Stack.Screen name="Creator"   component={CreatorNavigator} />
        ) : profile?.role === 'organizer' ? (
          <Stack.Screen name="Organizer" component={OrganizerNavigator} />
        ) : (
          <Stack.Screen name="Visitor"   component={VisitorNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
