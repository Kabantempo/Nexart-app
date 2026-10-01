import React, { useMemo } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeColors, colors } from '../constants/theme';
import { useThemeColors } from '../stores/theme';

import FeedScreen       from '../screens/feed/FeedScreen';
import CreatePostScreen from '../screens/feed/CreatePostScreen';

export type FeedStackParams = {
  Feed:       undefined;
  CreatePost: undefined;
};

const Stack = createStackNavigator<FeedStackParams>();

export default function FeedStack() {
  const colors = useThemeColors();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="Feed"       component={FeedScreen} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} />
    </Stack.Navigator>
  );
}
