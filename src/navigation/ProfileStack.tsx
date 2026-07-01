import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';
import ProfileScreen from '../screens/shared/ProfileScreen';
import PageCustomizationScreen from '../screens/shared/PageCustomizationScreen';

export type ProfileStackParams = {
  ProfileMain: undefined;
  PageCustomization: undefined;
};

const Stack = createStackNavigator<ProfileStackParams>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background }, animation: 'default' }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PageCustomization" component={PageCustomizationScreen} />
    </Stack.Navigator>
  );
}
