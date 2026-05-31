import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';

import SearchEventsScreen from '../screens/creator/SearchEventsScreen';
import EventDetailScreen from '../screens/creator/EventDetailScreen';

export type MarketStackParams = {
  EventList: undefined;
  EventDetail: { eventId: string };
};

const Stack = createStackNavigator<MarketStackParams>();

export default function MarketStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="EventList" component={SearchEventsScreen} />
      <Stack.Screen name="EventDetail" component={EventDetailScreen} />
    </Stack.Navigator>
  );
}
