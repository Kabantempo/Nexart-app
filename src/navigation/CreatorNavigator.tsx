import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

import FeedStack          from './FeedStack';
import MarketStack        from './MarketStack';
import ApplicationsScreen from '../screens/creator/ApplicationsScreen';
import MessageStack       from './MessageStack';
import ProfileScreen      from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName }[] = [
  { name: 'Fil',          icon: 'home-outline',        iconActive: 'home' },
  { name: 'Marchés',      icon: 'storefront-outline',  iconActive: 'storefront' },
  { name: 'Candidatures', icon: 'document-text-outline', iconActive: 'document-text' },
  { name: 'Messages',     icon: 'chatbubble-outline',  iconActive: 'chatbubble' },
  { name: 'Profil',       icon: 'person-outline',      iconActive: 'person' },
];

const SCREENS = [FeedStack, MarketStack, ApplicationsScreen, MessageStack, ProfileScreen];

export default function CreatorNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? tab?.iconActive ?? tab?.icon ?? 'home' : tab?.icon ?? 'home-outline'}
              size={size}
              color={color}
            />
          ),
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: 60,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
        };
      }}
    >
      {TABS.map((tab, i) => (
        <Tab.Screen key={tab.name} name={tab.name} component={SCREENS[i]} />
      ))}
    </Tab.Navigator>
  );
}
