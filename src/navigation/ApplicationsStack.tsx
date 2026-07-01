import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';
import { ReviewScreenParams } from '../screens/shared/ReviewScreen';

import ApplicationsScreen from '../screens/creator/ApplicationsScreen';
import ReviewScreen from '../screens/shared/ReviewScreen';

export type ApplicationsStackParams = {
  ApplicationsList: undefined;
  Review: ReviewScreenParams;
};

const Stack = createStackNavigator<ApplicationsStackParams>();

export default function ApplicationsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="ApplicationsList" component={ApplicationsScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
    </Stack.Navigator>
  );
}
