import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { colors } from '../constants/theme';
import ProfileScreen from '../screens/shared/ProfileScreen';
import PageCustomizationScreen from '../screens/shared/PageCustomizationScreen';
import SettingsScreen from '../screens/shared/SettingsScreen';
import NotificationsScreen from '../screens/shared/NotificationsScreen';
import ReferralScreen from '../screens/shared/ReferralScreen';
import DocumentsScreen from '../screens/creator/DocumentsScreen';
import VerificationScreen from '../screens/creator/VerificationScreen';

export type ProfileStackParams = {
  ProfileMain: undefined;
  PageCustomization: undefined;
  Settings: undefined;
  Notifications: undefined;
  Referral: undefined;
  Documents: undefined;
  Verification: undefined;
};

const Stack = createStackNavigator<ProfileStackParams>();

export default function ProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background }, animation: 'default' }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} />
      <Stack.Screen name="PageCustomization" component={PageCustomizationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Referral" component={ReferralScreen} />
      <Stack.Screen name="Documents" component={DocumentsScreen} />
      <Stack.Screen name="Verification" component={VerificationScreen} />
    </Stack.Navigator>
  );
}
