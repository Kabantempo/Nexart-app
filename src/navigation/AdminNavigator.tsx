import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { colors } from '../constants/theme'
import AdminPanel from '../screens/admin/AdminPanel'

const Stack = createStackNavigator()

export default function AdminNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="AdminPanel" component={AdminPanel} />
    </Stack.Navigator>
  )
}
