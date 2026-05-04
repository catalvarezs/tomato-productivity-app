import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Animated, Modal, TextInput,
} from 'react-native';
import { Play, Pause, RotateCcw, Music2, CloudRain, Waves, Coffee, VolumeX, ChevronDown, CheckCircle2 } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { TimerMode, Session, TimerTechnique, AmbientSoundType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../colors';

interface TimerViewProps { onSessionComplete: (session: Session) => void; }

const TECHNIQUES_CONFIG: Record<TimerTechnique, { config: Record<TimerMode, number> }> = {
  POMODORO: { config: { [TimerMode.FOCUS]: 25, [TimerMode.SHORT_BREAK]: 5, [TimerMode.LONG_BREAK]: 15 } },
  FIFTY_TWO: { config: { [TimerMode.FOCUS]: 52, [TimerMode.SHORT_BREAK]: 17, [TimerMode.LONG_BREAK]: 17 } },
  NINETY: { config: { [TimerMode.FOCUS]: 90, [TimerMode.SHORT_BREAK]: 20, [TimerMode.LONG_BREAK]: 20 } },
  CUSTOM: { config: { [TimerMode.FOCUS]: 45, [TimerMode.SHORT_BREAK]: 10, [TimerMode.LONG_BREAK]: 20 } }
};

const SOUND_URLS: Record<AmbientSoundType, string> = {
  NONE: '',
  RAIN: 'https://actions.google.com/sounds/v1/weather/rain_heavy_loud.ogg',
  FOREST: 'https://actions.google.com/sounds/v1/water/waves_crashing_on_rock_beach.ogg',
  CAFE: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg',
};

export const TimerView: React.FC<TimerViewProps> = ({ onSessionComplete }) => {
  const { t } = useLanguage();
  const [technique, setTechnique] = useState<TimerTechnique>('POMODORO');
  const [mode, setMode] = useState<TimerMode>(TimerMode.FOCUS);
  const [customConfig, setCustomConfig] = useState(TECHNIQUES_CONFIG.CUSTOM.config);
  const [selectedSound, setSelectedSound] = useState<AmbientSoundType>('NONE');
  const [showSoundModal, setShowSoundModal] = useState(false);
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);
  const [isEditingTime, setIsEditingTime] = useState(false);
  const [editValue, setEditValue] = useState('');
  const [interruptions, setInterruptions] = useState(0);
  const soundRef = useRef<Audio.Sound | null>(null);
  const glowAnim = useRef(new Animated.Value(0.6)).current;
  const glowOpacity = useRef(new Animated.Value(0.75)).current;

  const getDuration = useCallback(() => {
    if (technique === 'CUSTOM') return customConfig[mode] * 60;
    return TECHNIQUES_CONFIG[technique].config[mode] * 60;
  }, [technique, mode, customConfig]);

  const [timeLeft, setTimeLeft] = useState(getDuration());
  const [isActive, setIsActive] = useState(false);

  const getTechniqueLabel = (key: TimerTechnique) => {
    switch (key) {
      case 'POMODORO': return t.methods.cards.pomodoro.title;
      case 'FIFTY_TWO': return t.methods.cards.fiftyTwo.title;
      case 'NINETY': return t.methods.cards.ultradian.title;
      case 'CUSTOM': return t.timer.technique.custom;
    }
  };

  useEffect(() => { setIsActive(false); setTimeLeft(getDuration()); setInterruptions(0); }, [technique, mode, getDuration]);

  useEffect(() => {
    const totalTime = getDuration();
    const timeRatio = totalTime > 0 ? timeLeft / totalTime : 0;
    const inverseRatio = 1 - timeRatio;
    Animated.parallel([
      Animated.timing(glowAnim, { toValue: 0.6 + (inverseRatio * 0.4), duration: 1000, useNativeDriver: true }),
      Animated.timing(glowOpacity, { toValue: 0.2 + (timeRatio * 0.55), duration: 1000, useNativeDriver: true }),
    ]).start();
  }, [timeLeft]);

  useEffect(() => {
    let isMounted = true;
    const manageSound = async () => {
      if (soundRef.current) { await soundRef.current.unloadAsync(); soundRef.current = null; }
      if (!isActive || selectedSound === 'NONE') return;
      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync({ uri: SOUND_URLS[selectedSound] }, { isLooping: true, volume: 0.5 });
        if (isMounted) { soundRef.current = sound; await sound.playAsync(); } else { await sound.unloadAsync(); }
      } catch (_) {}
    };
    manageSound();
    return () => { isMounted = false; if (soundRef.current) { soundRef.current.unloadAsync(); soundRef.current = null; } };
  }, [isActive, selectedSound]);

  const handleComplete = useCallback(async () => {
    setIsActive(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSessionComplete({ id: Math.random().toString(36).slice(2), duration: getDuration(), timestamp: Date.now(), mode, completedAt: new Date().toISOString(), interruptions });
    setTimeLeft(getDuration()); setInterruptions(0);
  }, [mode, getDuration, onSessionComplete, interruptions]);

  useEffect(() => {
    if (!isActive) return;
    if (timeLeft === 0) { handleComplete(); return; }
    const interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); if (isActive) setInterruptions((p) => p + 1); setIsEditingTime(false); setIsActive((a) => !a); };
  const resetTimer = () => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsActive(false); setTimeLeft(getDuration()); setInterruptions(0); };
  const handleCustomTimeSubmit = () => {
    const minutes = parseInt(editValue, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 240) { setCustomConfig((prev) => ({ ...prev, [mode]: minutes })); if (technique !== 'CUSTOM') setTechnique('CUSTOM'); }
    setIsEditingTime(false);
  };

  const modes = [TimerMode.FOCUS, TimerMode.SHORT_BREAK, TimerMode.LONG_BREAK];
  const techniques: TimerTechnique[] = ['POMODORO', 'FIFTY_TWO', 'NINETY', 'CUSTOM'];
  const soundOptions: { key: AmbientSoundType; label: string; Icon: any }[] = [
    { key: 'NONE', label: 'Silent', Icon: VolumeX },
    { key: 'RAIN', label: 'Heavy Rain', Icon: CloudRain },
    { key: 'FOREST', label: 'Ocean Waves', Icon: Waves },
    { key: 'CAFE', label: 'Coffee Shop', Icon: Coffee },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.modeRow}>
        {modes.map((m) => (
          <TouchableOpacity key={m} onPress={() => setMode(m)} style={[styles.modeBtn, mode === m && styles.modeBtnActive]}>
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]} numberOfLines={1}>{t.timer.modes[m]}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.techniqueBtn} onPress={() => setShowTechniqueModal(true)}>
        <Text style={styles.techniqueBtnText}>{getTechniqueLabel(technique)}</Text>
        <ChevronDown size={14} color={COLORS.slate[500]} />
      </TouchableOpacity>
      <View style={styles.timerWrapper}>
        <Animated.View style={[styles.glowOuter, { transform: [{ scale: glowAnim }], opacity: glowOpacity }]} />
        <Animated.View style={[styles.glowMid, { transform: [{ scale: glowAnim }], opacity: Animated.multiply(glowOpacity, 0.5) }]} />
        <View style={styles.timerCircle}>
          {isEditingTime ? (
            <View style={styles.editContainer}>
              <TextInput autoFocus keyboardType="number-pad" value={editValue} onChangeText={setEditValue} onBlur={handleCustomTimeSubmit} onSubmitEditing={handleCustomTimeSubmit} style={styles.editInput} maxLength={3} selectionColor="rgba(255,255,255,0.5)" />
              <Text style={styles.editLabel}>{t.timer.edit.label}</Text>
            </View>
          ) : (
            <TouchableOpacity onPress={() => { if (isActive) return; setEditValue(Math.floor(timeLeft / 60).toString()); setIsEditingTime(true); }} activeOpacity={isActive ? 1 : 0.7}>
              <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      <View style={styles.controls}>
        <TouchableOpacity onPress={resetTimer} style={styles.controlBtn}><RotateCcw size={22} color={COLORS.slate[400]} /></TouchableOpacity>
        <TouchableOpacity onPress={toggleTimer} style={[styles.playBtn, isActive && styles.playBtnActive]}>
          {isActive ? <Pause size={32} color={COLORS.primary} fill={COLORS.primary} /> : <Play size={32} color={COLORS.slate[400]} fill={COLORS.slate[400]} />}
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowSoundModal(true)} style={[styles.controlBtn, selectedSound !== 'NONE' && styles.controlBtnActive]}>
          <Music2 size={22} color={selectedSound !== 'NONE' ? COLORS.primary : COLORS.slate[400]} />
        </TouchableOpacity>
      </View>
      <Modal visible={showTechniqueModal} transparent animationType="fade" onRequestClose={() => setShowTechniqueModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTechniqueModal(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.timer.technique.label}</Text>
            {techniques.map((tk) => (
              <TouchableOpacity key={tk} onPress={() => { setTechnique(tk); setShowTechniqueModal(false); }} style={[styles.modalItem, technique === tk && styles.modalItemActive]}>
                <Text style={[styles.modalItemText, technique === tk && styles.modalItemTextActive]}>{getTechniqueLabel(tk)}</Text>
                {technique === tk && <CheckCircle2 size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal visible={showSoundModal} transparent animationType="fade" onRequestClose={() => setShowSoundModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSoundModal(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.timer.controls.sound}</Text>
            {soundOptions.map(({ key, label, Icon }) => (
              <TouchableOpacity key={key} onPress={() => { setSelectedSound(key); setShowSoundModal(false); }} style={[styles.modalItem, selectedSound === key && styles.modalItemActive]}>
                <View style={styles.modalItemRow}><Icon size={16} color={selectedSound === key ? COLORS.primary : COLORS.slate[500]} /><Text style={[styles.modalItemText, { marginLeft: 10 }, selectedSound === key && styles.modalItemTextActive]}>{label}</Text></View>
                {selectedSound === key && <CheckCircle2 size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const CIRCLE_SIZE = 260;
const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, backgroundColor: COLORS.background },
  modeRow: { flexDirection: 'row', backgroundColor: COLORS.slate[100], borderRadius: 16, padding: 4, width: '100%', maxWidth: 360 },
  modeBtn: { flex: 1, paddingVertical: 8, paddingHorizontal: 4, borderRadius: 12, alignItems: 'center' },
  modeBtnActive: { backgroundColor: COLORS.card, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  modeBtnText: { fontSize: 12, fontWeight: '600', color: COLORS.slate[500] },
  modeBtnTextActive: { color: COLORS.primary },
  techniqueBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 8, backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 1 },
  techniqueBtnText: { fontSize: 13, fontWeight: '500', color: COLORS.slate[600] },
  timerWrapper: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, alignItems: 'center', justifyContent: 'center' },
  glowOuter: { position: 'absolute', width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 50, elevation: 20 },
  glowMid: { position: 'absolute', width: CIRCLE_SIZE * 0.8, height: CIRCLE_SIZE * 0.8, borderRadius: CIRCLE_SIZE * 0.4, backgroundColor: COLORS.primary, shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 30, elevation: 15 },
  timerCircle: { width: CIRCLE_SIZE, height: CIRCLE_SIZE, borderRadius: CIRCLE_SIZE / 2, backgroundColor: 'rgba(248,250,252,0.15)', alignItems: 'center', justifyContent: 'center', zIndex: 10 },
  timeText: { fontSize: 58, fontWeight: '300', color: '#ffffff', letterSpacing: -2, fontVariant: ['tabular-nums'] },
  editContainer: { alignItems: 'center' },
  editInput: { fontSize: 54, fontWeight: '300', color: '#ffffff', letterSpacing: -2, textAlign: 'center', minWidth: 160, padding: 0 },
  editLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.7)', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 },
  controls: { flexDirection: 'row', alignItems: 'center', gap: 32, paddingBottom: 8 },
  controlBtn: { width: 54, height: 54, borderRadius: 27, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  controlBtnActive: { borderColor: `${COLORS.primary}33`, backgroundColor: `${COLORS.primary}0D` },
  playBtn: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 12, elevation: 8 },
  playBtnActive: { borderColor: `${COLORS.primary}33`, backgroundColor: `${COLORS.primary}0D` },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  modalCard: { backgroundColor: COLORS.card, borderRadius: 20, padding: 8, width: '100%', maxWidth: 320, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12 },
  modalTitle: { fontSize: 11, fontWeight: '700', color: COLORS.slate[400], letterSpacing: 1.5, textTransform: 'uppercase', paddingHorizontal: 12, paddingVertical: 8 },
  modalItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12, borderRadius: 12 },
  modalItemActive: { backgroundColor: `${COLORS.primary}1A` },
  modalItemRow: { flexDirection: 'row', alignItems: 'center' },
  modalItemText: { fontSize: 14, color: COLORS.slate[600], fontWeight: '400' },
  modalItemTextActive: { color: COLORS.primary, fontWeight: '600' },
});
