import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, NavigationContainerRef } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { View, Text } from 'react-native';
import { RootNavigator, RootStackParamList } from './src/navigation/RootNavigator';
import { Colors } from './src/constants/theme';
import { LanguageProvider } from './src/i18n';
import { useProfileStore } from './src/store/profile-store';
import { initAudio } from './src/services/feedback';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: string | null }
> {
  state = { error: null };
  componentDidCatch(e: Error) {
    this.setState({ error: e.message + '\n' + e.stack });
  }
  render() {
    if (this.state.error) {
      return (
        <View style={{ flex: 1, backgroundColor: '#000', padding: 20, justifyContent: 'center' }}>
          <Text style={{ color: '#ff4444', fontSize: 12 }}>{this.state.error}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const initialize = useProfileStore((s) => s.initialize);
  const profile = useProfileStore((s) => s.profile);
  const loaded = useProfileStore((s) => s.loaded);
  const [ready, setReady] = useState(false);
  const navRef = React.useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    void initAudio();
    initialize().then(() => setReady(true));
  }, [initialize]);

  // Once profile is loaded and nav is ready, show onboarding on first run
  const handleNavReady = () => {
    if (!loaded) return;
    if (!profile.hasSeenOnboarding) {
      navRef.current?.navigate('Onboarding');
    }
  };

  if (!ready) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors.background }} />
    );
  }

  return (
    <NavigationContainer
      ref={navRef}
      onReady={handleNavReady}
      theme={{
        dark: true,
        colors: {
          primary: Colors.primary,
          background: Colors.background,
          card: Colors.surface,
          text: Colors.text,
          border: Colors.border,
          notification: Colors.primary,
        },
        fonts: {
          regular: { fontFamily: 'System', fontWeight: '400' },
          medium: { fontFamily: 'System', fontWeight: '500' },
          bold: { fontFamily: 'System', fontWeight: '700' },
          heavy: { fontFamily: 'System', fontWeight: '900' },
        },
      }}
    >
      <RootNavigator />
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <LanguageProvider>
          <AppInner />
        </LanguageProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
