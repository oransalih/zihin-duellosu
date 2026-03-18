import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StartScreen } from '../screens/StartScreen';
import { SetupScreen } from '../screens/SetupScreen';
import { GameScreen } from '../screens/GameScreen';
import { ResultScreen } from '../screens/ResultScreen';
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { ProfileSetupScreen } from '../screens/ProfileSetupScreen';
import { Colors } from '../constants/theme';
import { GameOverResult } from '@zihin-duellosu/shared';

export type RootStackParamList = {
  Start: undefined;
  Setup: { roomId: string };
  Game: undefined;
  Result: { result: GameOverResult };
  Onboarding: undefined;
  ProfileSetup: undefined;
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
      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          gestureEnabled: false,
        }}
      />
      <Stack.Screen
        name="ProfileSetup"
        component={ProfileSetupScreen}
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
        }}
      />
    </Stack.Navigator>
  );
}
