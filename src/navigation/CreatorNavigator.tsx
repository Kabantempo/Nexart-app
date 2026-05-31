import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { colors } from '../constants/theme';

import CreatorHomeScreen from '../screens/creator/HomeScreen';
import MarketStack from './MarketStack';
import ApplicationsScreen from '../screens/creator/ApplicationsScreen';
import MessagesScreen from '../screens/shared/MessagesScreen';
import ProfileScreen from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();

export default function CreatorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
      }}
    >
      <Tab.Screen name="Accueil"       component={CreatorHomeScreen} />
      <Tab.Screen name="Marchés"       component={MarketStack} />
      <Tab.Screen name="Candidatures"  component={ApplicationsScreen} />
      <Tab.Screen name="Messages"      component={MessagesScreen} />
      <Tab.Screen name="Profil"        component={ProfileScreen} />
    </Tab.Navigator>
  );
}
