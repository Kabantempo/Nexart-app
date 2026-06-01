import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

import FeedStack             from './FeedStack';
import DiscoverStack         from './DiscoverStack';
import FavoritesScreen       from '../screens/visitor/FavoritesScreen';
import VisitorMessagesScreen from '../screens/visitor/VisitorMessagesScreen';
import VisitorProfileScreen  from '../screens/visitor/VisitorProfileScreen';

const Tab = createBottomTabNavigator();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName; component: React.ComponentType<any> }[] = [
  { name: 'Fil',       icon: 'home-outline',      iconActive: 'home',      component: FeedStack },
  { name: 'Découvrir', icon: 'compass-outline',   iconActive: 'compass',   component: DiscoverStack },
  { name: 'Favoris',   icon: 'heart-outline',     iconActive: 'heart',     component: FavoritesScreen },
  { name: 'Messages',  icon: 'chatbubble-outline', iconActive: 'chatbubble', component: VisitorMessagesScreen },
  { name: 'Profil',    icon: 'person-outline',    iconActive: 'person',    component: VisitorProfileScreen },
];

export default function VisitorNavigator() {
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
      {TABS.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}
