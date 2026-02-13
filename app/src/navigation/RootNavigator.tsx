import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartScreen } from '../screens/StartScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { GameScreen } from '../screens/GameScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { PreviewScreen } from '../screens/PreviewScreen';
import { Colors } from '../constants/theme';
import { GameOverResult } from '@bull-cow/shared';

export type RootStackParamList = {
  Start: undefined;
  Preview: undefined;
  Setup: { roomId: string };
  Game: undefined;
  Result: { result: GameOverResult };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Start"
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Start" component={StartScreen} />
      <Stack.Screen name="Preview" component={PreviewScreen} />
      <Stack.Screen
        name="Setup"
        component={SetupScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name="Result"
        component={ResultScreen}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
