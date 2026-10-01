import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';
import { ReviewScreenParams } from '../screens/shared/ReviewScreen';

import ManageEventsScreen from '../screens/organizer/ManageEventsScreen';
import EventApplicationsScreen from '../screens/organizer/EventApplicationsScreen';
import ReviewScreen from '../screens/shared/ReviewScreen';
import CreateEventScreen from '../screens/organizer/CreateEventScreen';
import EventWaitlistScreen from '../screens/organizer/EventWaitlistScreen';
import EventExhibitorsScreen from '../screens/organizer/EventExhibitorsScreen';
import EventVolunteersScreen from '../screens/organizer/EventVolunteersScreen';
import EventTeamScreen from '../screens/organizer/EventTeamScreen';
import EventChecklistScreen from '../screens/organizer/EventChecklistScreen';
import EventFaqsScreen from '../screens/organizer/EventFaqsScreen';
import EventToolsScreen from '../screens/organizer/EventToolsScreen';
import EventCampaignsScreen from '../screens/organizer/EventCampaignsScreen';
import EventAnalyticsScreen from '../screens/organizer/EventAnalyticsScreen';
import EventStandPlanScreen from '../screens/organizer/EventStandPlanScreen';
import EventMarketingScreen from '../screens/organizer/EventMarketingScreen';
import EventRemindersScreen from '../screens/organizer/EventRemindersScreen';

export type OrganizerEventStackParams = {
  ManageEvents: undefined;
  EventWaitlist: { eventId: string; eventTitle: string };
  EventExhibitors: { eventId: string; eventTitle: string };
  EventVolunteers: { eventId: string; eventTitle: string };
  EventTeam: { eventId: string; eventTitle: string };
  EventChecklist: { eventId: string; eventTitle: string };
  EventFaqs: { eventId: string; eventTitle: string };
  EventTools: { eventId: string; eventTitle: string };
  EventCampaigns: { eventId: string; eventTitle: string };
  EventAnalytics: { eventId: string; eventTitle: string };
  EventStandPlan: { eventId: string; eventTitle: string };
  EventMarketing: { eventId: string; eventTitle: string };
  EventReminders: { eventId: string; eventTitle: string };
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
      <Stack.Screen name="EventWaitlist"      component={EventWaitlistScreen} />
      <Stack.Screen name="EventExhibitors"    component={EventExhibitorsScreen} />
      <Stack.Screen name="EventVolunteers"    component={EventVolunteersScreen} />
      <Stack.Screen name="EventTeam"          component={EventTeamScreen} />
      <Stack.Screen name="EventChecklist"     component={EventChecklistScreen} />
      <Stack.Screen name="EventFaqs"          component={EventFaqsScreen} />
      <Stack.Screen name="EventTools"         component={EventToolsScreen} />
      <Stack.Screen name="EventCampaigns"     component={EventCampaignsScreen} />
      <Stack.Screen name="EventAnalytics"     component={EventAnalyticsScreen} />
      <Stack.Screen name="EventStandPlan"     component={EventStandPlanScreen} />
      <Stack.Screen name="EventMarketing"     component={EventMarketingScreen} />
      <Stack.Screen name="EventReminders"     component={EventRemindersScreen} />
      <Stack.Screen name="EventApplications"  component={EventApplicationsScreen} />
      <Stack.Screen name="Review"             component={ReviewScreen} />
    </Stack.Navigator>
  );
}
