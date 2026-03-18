import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors, Spacing, FontSize, BorderRadius, ms } from '../constants/theme';
import { useTranslation } from '../i18n';
import { useProfileStore } from '../store/profile-store';
import { RootStackParamList } from '../navigation/RootNavigator';
import { UsernameModal } from '../components/UsernameModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
type Nav = NativeStackNavigationProp<RootStackParamList>;

// eslint-disable-next-line @typescript-eslint/no-require-imports
const bullIcon = require('../../assets/images/bull_icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cowIcon = require('../../assets/images/cow_icon.png');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const trophyImg = require('../../assets/images/trophy.png');

export function OnboardingScreen() {
  const navigation = useNavigation<Nav>();
  const { t } = useTranslation();
  const setHasSeenOnboarding = useProfileStore((s) => s.setHasSeenOnboarding);
  const username = useProfileStore((s) => s.profile.username);
  const [currentPage, setCurrentPage] = useState(0);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const TOTAL_PAGES = 3;

  const dismiss = async () => {
    await setHasSeenOnboarding();
    navigation.goBack();
  };

  const goNext = () => {
    if (currentPage < TOTAL_PAGES - 1) {
      const next = currentPage + 1;
      scrollRef.current?.scrollTo({ x: SCREEN_WIDTH * next, animated: true });
      setCurrentPage(next);
    } else {
      // Last page: collect username if not set, then dismiss
      if (!username) {
        setShowUsernameModal(true);
      } else {
        dismiss();
      }
    }
  };

  const handleScroll = (e: { nativeEvent: { contentOffset: { x: number } } }) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <View style={styles.topBar}>
        <Pressable onPress={dismiss} style={({ pressed }) => [styles.skipBtn, pressed && styles.pressed]}>
          <Text style={styles.skipText}>{t.onboarding.skip}</Text>
        </Pressable>
      </View>

      {/* Pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
        style={styles.scrollView}
      >
        {/* Page 1 — What is the game */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <View style={styles.pageContent}>
            <Text style={styles.pageEmoji}>🎯</Text>
            <Text style={styles.pageTitle}>{t.onboarding.page1.title}</Text>
            <Text style={styles.pageSubtitle}>{t.onboarding.page1.subtitle}</Text>
          </View>
        </View>

        {/* Page 2 — Bulls & Cows */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <View style={styles.pageContent}>
            <Text style={styles.pageTitle}>{t.onboarding.page2.title}</Text>
            <Text style={styles.pageSubtitle}>{t.onboarding.page2.subtitle}</Text>

            <View style={styles.clueCard}>
              <Image source={bullIcon} style={styles.clueIcon} />
              <View style={styles.clueText}>
                <Text style={styles.clueName}>{t.onboarding.page2.bull}</Text>
                <Text style={styles.clueDesc}>{t.onboarding.page2.bullDesc}</Text>
              </View>
            </View>

            <View style={styles.clueCard}>
              <Image source={cowIcon} style={styles.clueIcon} />
              <View style={styles.clueText}>
                <Text style={styles.clueName}>{t.onboarding.page2.cow}</Text>
                <Text style={styles.clueDesc}>{t.onboarding.page2.cowDesc}</Text>
              </View>
            </View>

            <View style={styles.exampleBox}>
              <Text style={styles.exampleText}>{t.onboarding.page2.example}</Text>
              <Text style={styles.exampleResult}>{t.onboarding.page2.exampleResult}</Text>
            </View>
          </View>
        </View>

        {/* Page 3 — Winning */}
        <View style={[styles.page, { width: SCREEN_WIDTH }]}>
          <View style={styles.pageContent}>
            <Image source={trophyImg} style={styles.trophy} />
            <Text style={styles.pageTitle}>{t.onboarding.page3.title}</Text>
            <View style={styles.rulesList}>
              {[
                t.onboarding.page3.rule1,
                t.onboarding.page3.rule2,
                t.onboarding.page3.rule3,
                t.onboarding.page3.rule4,
              ].map((rule, i) => (
                <Text key={i} style={styles.ruleItem}>{rule}</Text>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Dots */}
      <View style={styles.dots}>
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === currentPage && styles.dotActive]}
          />
        ))}
      </View>

      {/* Next / Start button */}
      <Pressable
        style={({ pressed }) => [styles.nextBtn, pressed && styles.pressed]}
        onPress={goNext}
      >
        <Text style={styles.nextBtnText}>
          {currentPage === TOTAL_PAGES - 1 ? t.onboarding.start : t.onboarding.next}
        </Text>
      </Pressable>

      <UsernameModal
        visible={showUsernameModal}
        onSaved={() => { setShowUsernameModal(false); dismiss(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
  },
  skipBtn: {
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  skipText: {
    fontSize: FontSize.md,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  page: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  pageContent: {
    alignItems: 'center',
    gap: Spacing.md,
    width: '100%',
  },
  pageEmoji: {
    fontSize: ms(64, 0.5),
  },
  trophy: {
    width: ms(96),
    height: ms(96),
    resizeMode: 'contain',
    marginBottom: Spacing.sm,
  },
  pageTitle: {
    fontSize: FontSize.xxl,
    fontWeight: '900',
    color: Colors.textBright,
    textAlign: 'center',
    letterSpacing: ms(1),
  },
  pageSubtitle: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: ms(24),
  },
  clueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    width: '100%',
  },
  clueIcon: {
    width: ms(44),
    height: ms(44),
    resizeMode: 'contain',
  },
  clueText: {
    flex: 1,
    gap: ms(2),
  },
  clueName: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textGreen,
  },
  clueDesc: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  exampleBox: {
    backgroundColor: Colors.cardBg,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    padding: Spacing.md,
    width: '100%',
    gap: Spacing.xs,
  },
  exampleText: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
  },
  exampleResult: {
    fontSize: FontSize.md,
    fontWeight: '700',
    color: Colors.textGreen,
  },
  rulesList: {
    gap: Spacing.md,
    width: '100%',
  },
  ruleItem: {
    fontSize: FontSize.md,
    color: Colors.text,
    lineHeight: ms(24),
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md,
  },
  dot: {
    width: ms(8),
    height: ms(8),
    borderRadius: ms(4),
    backgroundColor: Colors.border,
  },
  dotActive: {
    backgroundColor: Colors.primaryLight,
    width: ms(20),
  },
  nextBtn: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: ms(16),
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primaryLight,
    borderBottomWidth: 3,
    borderBottomColor: Colors.primaryDark,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  nextBtnText: {
    fontSize: FontSize.lg,
    fontWeight: '900',
    color: Colors.textBright,
    letterSpacing: ms(2),
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
