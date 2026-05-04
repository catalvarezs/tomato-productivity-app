import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { Zap, Wind, Brain, Battery, Target } from 'lucide-react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../colors';

interface MethodCardProps { title: string; timing: string; Icon: React.FC<any>; description: string; bestForLabel: string; bestFor: string; }

const MethodCard: React.FC<MethodCardProps> = ({ title, timing, Icon, description, bestForLabel, bestFor }) => (
  <View style={styles.card}>
    <View style={styles.cardHeader}>
      <View style={styles.iconWrapper}><Icon size={24} color={COLORS.primary} /></View>
      <View style={styles.cardTitleRow}>
        <Text style={styles.cardTitle}>{title}</Text>
        <View style={styles.timingBadge}><Text style={styles.timingBadgeText}>{timing}</Text></View>
      </View>
    </View>
    <Text style={styles.cardDesc}>{description}</Text>
    <View style={styles.bestForRow}>
      <Battery size={14} color={COLORS.primary} style={{ marginTop: 2 }} />
      <Text style={styles.bestForText}><Text style={styles.bestForLabel}>{bestForLabel}</Text>{' '}{bestFor}</Text>
    </View>
  </View>
);

export const MethodsView: React.FC = () => {
  const { t } = useLanguage();
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.methods.title}</Text>
        <Text style={styles.subtitle}>{t.methods.subtitle}</Text>
      </View>
      <MethodCard title={t.methods.cards.pomodoro.title} timing="25m / 5m" Icon={Zap} description={t.methods.cards.pomodoro.desc} bestForLabel={t.methods.bestFor} bestFor={t.methods.cards.pomodoro.bestFor} />
      <MethodCard title={t.methods.cards.fiftyTwo.title} timing="52m / 17m" Icon={Wind} description={t.methods.cards.fiftyTwo.desc} bestForLabel={t.methods.bestFor} bestFor={t.methods.cards.fiftyTwo.bestFor} />
      <MethodCard title={t.methods.cards.ultradian.title} timing="90m / 20m" Icon={Brain} description={t.methods.cards.ultradian.desc} bestForLabel={t.methods.bestFor} bestFor={t.methods.cards.ultradian.bestFor} />
      <View style={styles.parkinsonsCard}>
        <View style={styles.parkinsonsHeader}><Target size={18} color={COLORS.primary} /><Text style={styles.parkinsonsTitle}>{t.methods.whyTitle}</Text></View>
        <Text style={styles.parkinsonsDesc}>{t.methods.whyDesc}</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
  header: { paddingTop: 8, paddingBottom: 24 },
  title: { fontSize: 30, fontWeight: '700', color: COLORS.slate[800], letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.slate[500] },
  card: { backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2, gap: 12 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  iconWrapper: { width: 48, height: 48, borderRadius: 14, backgroundColor: `${COLORS.primary}1A`, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardTitleRow: { flex: 1, gap: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: COLORS.slate[800] },
  timingBadge: { alignSelf: 'flex-start', backgroundColor: COLORS.slate[100], paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20 },
  timingBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.slate[600] },
  cardDesc: { fontSize: 13, color: COLORS.slate[600], lineHeight: 20 },
  bestForRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bestForText: { flex: 1, fontSize: 12, color: COLORS.slate[500], lineHeight: 18 },
  bestForLabel: { color: COLORS.slate[700], fontWeight: '600' },
  parkinsonsCard: { backgroundColor: `${COLORS.primary}0D`, borderRadius: 20, borderWidth: 1, borderColor: `${COLORS.primary}1A`, padding: 20, gap: 10, marginBottom: 16 },
  parkinsonsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  parkinsonsTitle: { fontSize: 15, fontWeight: '700', color: COLORS.primary },
  parkinsonsDesc: { fontSize: 13, color: COLORS.slate[600], lineHeight: 20 },
});
