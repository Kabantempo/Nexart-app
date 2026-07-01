import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { TabIcon } from '../components/ui/TabIcon';

import FeedStack           from './FeedStack';
import MarketStack         from './MarketStack';
import ApplicationsStack   from './ApplicationsStack';
import MessageStack        from './MessageStack';
import ProfileStack        from './ProfileStack';
import DiscoverStack       from './DiscoverStack';

const Tab = createBottomTabNavigator();

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName; hidden?: boolean }[] = [
  { name: 'Fil',          icon: 'home-outline',          iconActive: 'home' },
  { name: 'Marchés',      icon: 'storefront-outline',    iconActive: 'storefront' },
  { name: 'Candidatures', icon: 'document-text-outline', iconActive: 'document-text' },
  { name: 'Messages',     icon: 'chatbubble-outline',    iconActive: 'chatbubble' },
  { name: 'Profil',       icon: 'person-outline',        iconActive: 'person' },
  { name: 'Découvrir',    icon: 'compass-outline',       iconActive: 'compass', hidden: true },
];

const SCREENS = [FeedStack, MarketStack, ApplicationsStack, MessageStack, ProfileStack, DiscoverStack];

export default function CreatorNavigator() {
  return (
    <Tab.Navigator
      
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon
              name={focused ? tab?.iconActive ?? tab?.icon ?? 'home' : tab?.icon ?? 'home-outline'}
              focused={focused}
              color={color}
              size={size}
            />
          ),
          tabBarStyle: {
            position: 'absolute',
            backgroundColor: colors.surface,
            borderTopWidth: 0,
            borderRadius: 28,
            marginHorizontal: 16,
            marginBottom: 16,
            height: 64,
            paddingBottom: 8,
            paddingTop: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 20,
            elevation: 16,
          },
          tabBarActiveTintColor: colors.primary,
          tabBarInactiveTintColor: colors.text.secondary,
          tabBarShowLabel: false,
          tabBarButton: TABS.find(t => t.name === route.name)?.hidden ? () => null : undefined,
          tabBarItemStyle: TABS.find(t => t.name === route.name)?.hidden ? { display: 'none' } : undefined,
        };
      }}
    >
      {TABS.map((tab, i) => (
        <Tab.Screen key={tab.name} name={tab.name} component={SCREENS[i]} />
      ))}
    </Tab.Navigator>
  );
}
