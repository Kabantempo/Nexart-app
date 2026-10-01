import React, { useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeColors, colors } from '../constants/theme';
import { useThemeColors } from '../stores/theme';

import DiscoverHomeScreen       from '../screens/discover/DiscoverHomeScreen';
import PublicEventDetailScreen  from '../screens/discover/PublicEventDetailScreen';
import PublicCreatorProfile     from '../screens/discover/PublicCreatorProfileScreen';
import CreatorsListScreen       from '../screens/discover/CreatorsListScreen';
import EventMapScreen           from '../screens/discover/EventMapScreen';

export type DiscoverStackParams = {
  DiscoverHome:          undefined;
  PublicEventDetail:     { eventId: string };
  PublicCreatorProfile:  { creatorId: string };
  CreatorsList:          { discipline?: string };
  EventMap:              undefined;
};

const Stack = createStackNavigator<DiscoverStackParams>();

export default function DiscoverStack() {
  const colors = useThemeColors();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="DiscoverHome"         component={DiscoverHomeScreen} />
      <Stack.Screen name="PublicEventDetail"    component={PublicEventDetailScreen} />
      <Stack.Screen name="PublicCreatorProfile" component={PublicCreatorProfile} />
      <Stack.Screen name="CreatorsList"         component={CreatorsListScreen} />
      <Stack.Screen name="EventMap"             component={EventMapScreen} />
    </Stack.Navigator>
  );
}
