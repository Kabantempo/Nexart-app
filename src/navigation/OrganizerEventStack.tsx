import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';
import { ReviewScreenParams } from '../screens/shared/ReviewScreen';

import ManageEventsScreen from '../screens/organizer/ManageEventsScreen';
import EventApplicationsScreen from '../screens/organizer/EventApplicationsScreen';
import ReviewScreen from '../screens/shared/ReviewScreen';
import CreateEventScreen from '../screens/organizer/CreateEventScreen';

export type OrganizerEventStackParams = {
  ManageEvents: undefined;
  EditEvent: { eventId: string };
  EventApplications: { eventId: string; eventTitle: string };
  Review: ReviewScreenParams;
};

const Stack = createStackNavigator<OrganizerEventStackParams>();

export default function OrganizerEventStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="ManageEvents"       component={ManageEventsScreen} />
      <Stack.Screen name="EditEvent"          component={CreateEventScreen} />
      <Stack.Screen name="EventApplications"  component={EventApplicationsScreen} />
      <Stack.Screen name="Review"             component={ReviewScreen} />
    </Stack.Navigator>
  );
}
