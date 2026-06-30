import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '../stores/auth';
import { colors } from '../constants/theme';
import linking from './linking';

import AuthNavigator      from './AuthNavigator';
import CreatorNavigator   from './CreatorNavigator';
import OrganizerNavigator from './OrganizerNavigator';
import VisitorNavigator   from './VisitorNavigator';
import DiscoverStack      from './DiscoverStack';
import AboutScreen        from '../screens/info/AboutScreen';
import ContactScreen      from '../screens/info/ContactScreen';
import LegalScreen        from '../screens/info/LegalScreen';
import AdminScreen        from '../screens/admin/AdminScreen';

const Stack = createStackNavigator();

export default function RootNavigator() {
  const { session, profile, loading } = useAuth();

  if (loading) return null;

  // Accès autorisé si session réelle OU profil injecté (mode test)
  const isAuthenticated = !!session || !!profile;

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
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <>
            <Stack.Screen name="Auth"     component={AuthNavigator} />
            <Stack.Screen name="Discover" component={DiscoverStack} />
          </>
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
        <Stack.Screen
          name="Admin"
          component={AdminScreen}
          options={{ headerShown: true, title: 'Panel Admin', headerBackTitle: 'Retour' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
