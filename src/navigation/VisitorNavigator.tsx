import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/theme';
import { TabIcon } from '../components/ui/TabIcon';

import FeedStack             from './FeedStack';
import DiscoverStack         from './DiscoverStack';
import VisitorMessagesScreen from '../screens/visitor/VisitorMessagesScreen';
import VisitorProfileScreen  from '../screens/visitor/VisitorProfileScreen';
import FavoritesScreen       from '../screens/visitor/FavoritesScreen';

const Tab = createBottomTabNavigator();
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

const TABS: { name: string; icon: IoniconName; iconActive: IoniconName; component: React.ComponentType<any> }[] = [
  { name: 'Fil',       icon: 'home-outline',       iconActive: 'home',        component: FeedStack },
  { name: 'Découvrir', icon: 'compass-outline',    iconActive: 'compass',     component: DiscoverStack },
  { name: 'Messages',  icon: 'chatbubble-outline', iconActive: 'chatbubble',  component: VisitorMessagesScreen },
  { name: 'Profil',    icon: 'person-outline',     iconActive: 'person',      component: VisitorProfileScreen },
  // Favoris accessible via le header (icône ♥) — pas dans la tab bar
  { name: 'Favoris',   icon: 'heart-outline',      iconActive: 'heart',       component: FavoritesScreen },
];

// Seuls les 4 premiers s'affichent dans la tab bar
const VISIBLE_TABS = TABS.slice(0, 4);

export default function VisitorNavigator() {
  return (
    <Tab.Navigator
      sceneContainerStyle={{ paddingBottom: 80 }}
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
          // Cache l'onglet Favoris de la barre
          tabBarButton: route.name === 'Favoris' ? () => null : undefined,
          tabBarItemStyle: route.name === 'Favoris' ? { display: 'none' } : undefined,
        };
      }}
    >
      {TABS.map(tab => (
        <Tab.Screen key={tab.name} name={tab.name} component={tab.component} />
      ))}
    </Tab.Navigator>
  );
}
