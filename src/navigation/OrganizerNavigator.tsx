import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';

import OrganizerHomeScreen from '../screens/organizer/HomeScreen';
import OrganizerEventStack from './OrganizerEventStack';
import CreateEventScreen   from '../screens/organizer/CreateEventScreen';
import CreatorMapScreen    from '../screens/organizer/CreatorMapScreen';
import MessageStack        from './MessageStack';
import ProfileScreen       from '../screens/shared/ProfileScreen';

const Tab = createBottomTabNavigator();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName; component: React.ComponentType<any> }[] = [
  { name: 'Tableau de bord', icon: 'grid-outline',       iconActive: 'grid',         component: OrganizerHomeScreen },
  { name: 'Mes marchés',     icon: 'storefront-outline', iconActive: 'storefront',   component: OrganizerEventStack },
  { name: 'Créer',           icon: 'add-circle-outline', iconActive: 'add-circle',   component: CreateEventScreen },
  { name: 'Carte',           icon: 'map-outline',        iconActive: 'map',          component: CreatorMapScreen },
  { name: 'Messages',        icon: 'chatbubble-outline', iconActive: 'chatbubble',   component: MessageStack },
  { name: 'Profil',          icon: 'person-outline',     iconActive: 'person',       component: ProfileScreen },
];

export default function OrganizerNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons
              name={focused ? tab?.iconActive ?? tab?.icon ?? 'grid' : tab?.icon ?? 'grid-outline'}
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
