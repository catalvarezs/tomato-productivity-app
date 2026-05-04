import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet, Dimensions } from 'react-native';
import { Wind, Heart, Box, ArrowLeft } from 'lucide-react-native';
import { BreathingPattern } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../colors';

const PATTERNS: BreathingPattern[] = [
  { id: 'box', nameKey: 'box', descKey: 'box', benefitKey: 'box', inhale: 4, holdIn: 4, exhale: 4, holdOut: 4 },
  { id: 'relax', nameKey: 'relax', descKey: 'relax', benefitKey: 'relax', inhale: 4, holdIn: 7, exhale: 8, holdOut: 0 },
  { id: 'coherence', nameKey: 'coherence', descKey: 'coherence', benefitKey: 'coherence', inhale: 5.5, holdIn: 0, exhale: 5.5, holdOut: 0 },
];

export const BreathingView: React.FC = () => {
  const { t } = useLanguage();
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null);
  if (selectedPattern) return <BreathingVisualizer pattern={selectedPattern} onClose={() => setSelectedPattern(null)} />;
  const icons = { box: Box, relax: Wind, coherence: Heart };
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.breathing.title}</Text>
        <Text style={styles.subtitle}>{t.breathing.subtitle}</Text>
      </View>
      {PATTERNS.map((pattern) => {
        const cardT = t.breathing.cards[pattern.nameKey as keyof typeof t.breathing.cards];
        const Icon = icons[pattern.id as keyof typeof icons];
        return (
          <TouchableOpacity key={pattern.id} onPress={() => setSelectedPattern(pattern)} style={styles.card} activeOpacity={0.85}>
            <View style={styles.cardIconWrapper}><Icon size={24} color={COLORS.primary} /></View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>{cardT.title}</Text>
              <Text style={styles.cardDesc}>{cardT.desc}</Text>
              <View style={styles.cardBadge}><Text style={styles.cardBadgeText}>{cardT.benefit}</Text></View>
            </View>
          </TouchableOpacity>
        );
      })}
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

type Phase = 'inhale' | 'holdIn' | 'exhale' | 'holdOut';
const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');
const CIRCLE_SIZE = Math.min(SCREEN_W * 0.72, SCREEN_H * 0.4);

const BreathingVisualizer: React.FC<{ pattern: BreathingPattern; onClose: () => void }> = ({ pattern, onClose }) => {
  const { t } = useLanguage();
  const [phase, setPhase] = useState<Phase>('inhale');
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const opacityAnim = useRef(new Animated.Value(0.2)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const animRef = useRef<Animated.CompositeAnimation | null>(null);

  const runPhase = (nextPhase: Phase) => {
    const durations: Record<Phase, number> = { inhale: pattern.inhale, holdIn: pattern.holdIn, exhale: pattern.exhale, holdOut: pattern.holdOut };
    const nextPhases: Record<Phase, Phase> = { inhale: 'holdIn', holdIn: 'exhale', exhale: 'holdOut', holdOut: 'inhale' };
    const dur = durations[nextPhase];
    const next = nextPhases[nextPhase];
    if (dur <= 0) { runPhase(next); return; }
    setPhase(nextPhase);
    const isExpanded = nextPhase === 'inhale' || nextPhase === 'holdIn';
    if (animRef.current) animRef.current.stop();
    animRef.current = Animated.parallel([
      Animated.timing(scaleAnim, { toValue: isExpanded ? 1.0 : 0.6, duration: dur * 1000, useNativeDriver: true }),
      Animated.timing(opacityAnim, { toValue: isExpanded ? 0.75 : 0.2, duration: dur * 1000, useNativeDriver: true }),
    ]);
    animRef.current.start();
    timerRef.current = setTimeout(() => runPhase(next), dur * 1000);
  };

  useEffect(() => {
    runPhase('inhale');
    return () => { if (timerRef.current) clearTimeout(timerRef.current); if (animRef.current) animRef.current.stop(); };
  }, []);

  const instructionText = () => {
    switch (phase) {
      case 'inhale': return t.breathing.instructions.inhale;
      case 'holdIn': return t.breathing.instructions.hold;
      case 'exhale': return t.breathing.instructions.exhale;
      case 'holdOut': return t.breathing.instructions.hold;
    }
  };

  return (
    <View style={visualStyles.container}>
      <TouchableOpacity onPress={onClose} style={visualStyles.backBtn}><ArrowLeft size={20} color={COLORS.slate[400]} /></TouchableOpacity>
      <View style={visualStyles.circleWrapper}>
        <Animated.View style={[visualStyles.glow, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]} />
        <View style={visualStyles.circle}><Text style={visualStyles.instructionText}>{instructionText()}</Text></View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
  header: { paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 30, fontWeight: '700', color: COLORS.slate[800], letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.slate[500] },
  card: { flexDirection: 'row', backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  cardIconWrapper: { width: 48, height: 48, borderRadius: 14, backgroundColor: `${COLORS.primary}1A`, alignItems: 'center', justifyContent: 'center', marginRight: 16, flexShrink: 0 },
  cardContent: { flex: 1, gap: 8 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.slate[800] },
  cardDesc: { fontSize: 13, color: COLORS.slate[600], lineHeight: 19 },
  cardBadge: { alignSelf: 'flex-start', backgroundColor: `${COLORS.primary}1A`, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginTop: 2 },
  cardBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.primary },
});

const visualStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  backBtn: { position: 'absolute', top: 16, left: 16, padding: 10, borderRadius: 20, backgroundColor: COLORS.slate[100], zIndex: 10 },
  circleWrapper: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 50, elevation: 20 },
  circle: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, alignItems: 'center', justifyContent: 'center', zIndex: 5 },
  instructionText: { fontSize: 42, fontWeight: '300', color: '#ffffff', letterSpacing: -1 },
});
