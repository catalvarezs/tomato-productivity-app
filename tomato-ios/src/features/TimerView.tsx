import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  TextInput,
  Image,
  Slider as RNSlider,
} from 'react-native';
import { Play, Pause, RotateCcw, Music2, CloudRain, Waves, Coffee, VolumeX, ChevronDown, CheckCircle2, SkipBack, SkipForward, LogOut, ExternalLink } from 'lucide-react-native';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { TimerMode, Session, TimerTechnique, AmbientSoundType } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { useSpotify } from '../contexts/SpotifyContext';
import { COLORS } from '../colors';

// ─── Spotify SVG icon ─────────────────────────────────────────────────────────

import Svg, { Path } from 'react-native-svg';
const SpotifyIcon = ({ size = 16, color = '#1DB954' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <Path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </Svg>
);

// ─── Spotify Panel ────────────────────────────────────────────────────────────

const SpotifyPanel: React.FC = () => {
  const spotify = useSpotify();
  const [clientIdInput, setClientIdInput] = useState(spotify.clientId);
  const [showSetup, setShowSetup] = useState(false);
  const [uriInput, setUriInput] = useState('');

  if (!spotify.clientId || showSetup) {
    return (
      <View style={sp.setupContainer}>
        <View style={sp.setupHeader}>
          <SpotifyIcon size={14} />
          <Text style={sp.setupTitle}>Configurar Spotify</Text>
        </View>
        <Text style={sp.setupDesc}>
          Obtén tu Client ID en{' '}
          <Text style={{ color: '#1DB954' }}>developer.spotify.com</Text>
          {'\n'}y registra el redirect URI de tu app.
        </Text>
        <TextInput
          style={sp.input}
          value={clientIdInput}
          onChangeText={setClientIdInput}
          placeholder="Client ID de Spotify..."
          placeholderTextColor={COLORS.slate[400]}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={[sp.connectBtn, !clientIdInput.trim() && { opacity: 0.4 }]}
          onPress={() => { spotify.setClientId(clientIdInput); setShowSetup(false); }}
          disabled={!clientIdInput.trim()}
        >
          <Text style={sp.connectBtnText}>Guardar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!spotify.isConnected) {
    return (
      <View style={sp.setupContainer}>
        <View style={[sp.setupHeader, { justifyContent: 'space-between' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <SpotifyIcon size={14} />
            <Text style={sp.setupTitle}>Spotify</Text>
          </View>
          <TouchableOpacity onPress={() => setShowSetup(true)}>
            <Text style={{ fontSize: 10, color: COLORS.slate[400] }}>Cambiar ID</Text>
          </TouchableOpacity>
        </View>
        <Text style={sp.setupDesc}>Conecta tu cuenta Spotify Premium para escuchar música mientras te concentras.</Text>
        <TouchableOpacity style={sp.connectBtn} onPress={spotify.login}>
          <SpotifyIcon size={16} color="#fff" />
          <Text style={sp.connectBtnText}>Iniciar sesión</Text>
        </TouchableOpacity>
        <Text style={[sp.setupDesc, { fontSize: 10, marginTop: 6 }]}>
          Nota: necesitas la app de Spotify abierta en tu iPhone.
        </Text>
      </View>
    );
  }

  const { isPlaying, currentTrack, trackProgress, volume } = spotify;

  return (
    <View style={sp.playerContainer}>
      {/* Header */}
      <View style={sp.playerHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <SpotifyIcon size={13} />
          <Text style={sp.sectionLabel}>Spotify</Text>
        </View>
        <TouchableOpacity onPress={spotify.logout} style={{ padding: 4 }}>
          <LogOut size={13} color={COLORS.slate[400]} />
        </TouchableOpacity>
      </View>

      {/* Track info */}
      {currentTrack ? (
        <View style={sp.trackRow}>
          {currentTrack.albumArt ? (
            <Image source={{ uri: currentTrack.albumArt }} style={sp.albumArt} />
          ) : (
            <View style={[sp.albumArt, sp.albumArtPlaceholder]}>
              <SpotifyIcon size={18} color={COLORS.slate[400]} />
            </View>
          )}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text style={sp.trackName} numberOfLines={1}>{currentTrack.name}</Text>
            <Text style={sp.artistName} numberOfLines={1}>{currentTrack.artist}</Text>
          </View>
        </View>
      ) : (
        <View style={sp.noTrackRow}>
          <Text style={sp.setupDesc}>Abre Spotify y empieza a reproducir para ver el control aquí.</Text>
          <View style={sp.uriRow}>
            <TextInput
              style={sp.uriInput}
              value={uriInput}
              onChangeText={setUriInput}
              placeholder="spotify:playlist:..."
              placeholderTextColor={COLORS.slate[400]}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity
              style={[sp.uriPlayBtn, !uriInput.startsWith('spotify:') && { opacity: 0.4 }]}
              onPress={() => uriInput.startsWith('spotify:') && spotify.playUri(uriInput)}
              disabled={!uriInput.startsWith('spotify:')}
            >
              <Text style={{ fontSize: 11, color: '#fff', fontWeight: '700' }}>Play</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Progress bar */}
      {currentTrack && (
        <View style={sp.progressBar}>
          <View style={[sp.progressFill, { width: `${trackProgress * 100}%` as any }]} />
        </View>
      )}

      {/* Controls */}
      <View style={sp.controlsRow}>
        <TouchableOpacity onPress={spotify.previous} style={sp.controlBtn}>
          <SkipBack size={16} color={COLORS.slate[500]} />
        </TouchableOpacity>
        <TouchableOpacity onPress={spotify.togglePlay} style={sp.playBtn}>
          {isPlaying
            ? <Pause size={16} color="#fff" fill="#fff" />
            : <Play size={16} color="#fff" fill="#fff" />
          }
        </TouchableOpacity>
        <TouchableOpacity onPress={spotify.next} style={sp.controlBtn}>
          <SkipForward size={16} color={COLORS.slate[500]} />
        </TouchableOpacity>
      </View>

      {/* Volume */}
      <View style={sp.volumeRow}>
        <VolumeX size={12} color={COLORS.slate[400]} />
        <RNSlider
          style={{ flex: 1, marginHorizontal: 4 }}
          minimumValue={0}
          maximumValue={1}
          step={0.01}
          value={volume}
          onValueChange={spotify.setVolume}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor={COLORS.slate[200]}
          thumbTintColor="#1DB954"
        />
        <Music2 size={12} color={COLORS.slate[400]} />
      </View>
    </View>
  );
};

const SPOTIFY_GREEN = '#1DB954';

const sp = StyleSheet.create({
  setupContainer: { padding: 16, gap: 10 },
  setupHeader: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  setupTitle: { fontSize: 11, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase', letterSpacing: 1 },
  setupDesc: { fontSize: 12, color: COLORS.slate[500], lineHeight: 17 },
  input: { borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 12, color: COLORS.slate[700], backgroundColor: COLORS.slate[50] },
  connectBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: SPOTIFY_GREEN, borderRadius: 12, paddingVertical: 10 },
  connectBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  playerContainer: { paddingHorizontal: 4, paddingBottom: 8, gap: 8 },
  playerHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingTop: 10 },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.slate[400], textTransform: 'uppercase', letterSpacing: 1 },
  trackRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 12 },
  albumArt: { width: 40, height: 40, borderRadius: 8 },
  albumArtPlaceholder: { backgroundColor: COLORS.slate[100], alignItems: 'center', justifyContent: 'center' },
  trackName: { fontSize: 12, fontWeight: '600', color: COLORS.slate[800] },
  artistName: { fontSize: 11, color: COLORS.slate[500] },
  noTrackRow: { paddingHorizontal: 12, gap: 8 },
  uriRow: { flexDirection: 'row', gap: 6 },
  uriInput: { flex: 1, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, fontSize: 11, color: COLORS.slate[700], backgroundColor: COLORS.slate[50] },
  uriPlayBtn: { backgroundColor: SPOTIFY_GREEN, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, alignItems: 'center', justifyContent: 'center' },
  progressBar: { height: 3, backgroundColor: COLORS.slate[100], borderRadius: 2, marginHorizontal: 12, overflow: 'hidden' },
  progressFill: { height: 3, backgroundColor: SPOTIFY_GREEN, borderRadius: 2 },
  controlsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  controlBtn: { padding: 8 },
  playBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: SPOTIFY_GREEN, alignItems: 'center', justifyContent: 'center', shadowColor: SPOTIFY_GREEN, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.35, shadowRadius: 4, elevation: 4 },
  volumeRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: COLORS.borderLight, paddingTop: 8 },
});

interface TimerViewProps {
  onSessionComplete: (session: Session) => void;
}

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

  const [soundTab, setSoundTab] = useState<'ambient' | 'spotify'>('ambient');
  const spotify = useSpotify();

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

  // Update timer when technique or mode changes
  useEffect(() => {
    setIsActive(false);
    setTimeLeft(getDuration());
    setInterruptions(0);
  }, [technique, mode, getDuration]);

  // Glow animation synced to timer progress
  useEffect(() => {
    const totalTime = getDuration();
    const timeRatio = totalTime > 0 ? timeLeft / totalTime : 0;
    const inverseRatio = 1 - timeRatio;
    const targetScale = 0.6 + (inverseRatio * 0.4);
    const targetOpacity = 0.2 + (timeRatio * 0.55);

    Animated.parallel([
      Animated.timing(glowAnim, {
        toValue: targetScale,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(glowOpacity, {
        toValue: targetOpacity,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, [timeLeft]);

  // Audio management
  useEffect(() => {
    let isMounted = true;

    const manageSound = async () => {
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      if (!isActive || selectedSound === 'NONE') return;

      try {
        await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
        const { sound } = await Audio.Sound.createAsync(
          { uri: SOUND_URLS[selectedSound] },
          { isLooping: true, volume: 0.5 }
        );
        if (isMounted) {
          soundRef.current = sound;
          await sound.playAsync();
        } else {
          await sound.unloadAsync();
        }
      } catch (_) {}
    };

    manageSound();

    return () => {
      isMounted = false;
      if (soundRef.current) {
        soundRef.current.unloadAsync();
        soundRef.current = null;
      }
    };
  }, [isActive, selectedSound]);

  const handleComplete = useCallback(async () => {
    setIsActive(false);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSessionComplete({
      id: Math.random().toString(36).slice(2),
      duration: getDuration(),
      timestamp: Date.now(),
      mode,
      completedAt: new Date().toISOString(),
      interruptions,
    });
    setTimeLeft(getDuration());
    setInterruptions(0);
  }, [mode, getDuration, onSessionComplete, interruptions]);

  // Countdown
  useEffect(() => {
    if (!isActive) return;
    if (timeLeft === 0) {
      handleComplete();
      return;
    }
    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isActive, timeLeft, handleComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (isActive) setInterruptions((p) => p + 1);
    setIsEditingTime(false);
    setIsActive((a) => !a);
  };

  const resetTimer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setIsActive(false);
    setTimeLeft(getDuration());
    setInterruptions(0);
  };

  const handleCustomTimeSubmit = () => {
    const minutes = parseInt(editValue, 10);
    if (!isNaN(minutes) && minutes > 0 && minutes <= 240) {
      setCustomConfig((prev) => ({ ...prev, [mode]: minutes }));
      if (technique !== 'CUSTOM') setTechnique('CUSTOM');
    }
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
      {/* Mode Selector */}
      <View style={styles.modeRow}>
        {modes.map((m) => (
          <TouchableOpacity
            key={m}
            onPress={() => setMode(m)}
            style={[styles.modeBtn, mode === m && styles.modeBtnActive]}
          >
            <Text style={[styles.modeBtnText, mode === m && styles.modeBtnTextActive]} numberOfLines={1}>
              {t.timer.modes[m]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Technique selector */}
      <TouchableOpacity style={styles.techniqueBtn} onPress={() => setShowTechniqueModal(true)}>
        <Text style={styles.techniqueBtnText}>{getTechniqueLabel(technique)}</Text>
        <ChevronDown size={14} color={COLORS.slate[500]} />
      </TouchableOpacity>

      {/* Timer Circle */}
      <View style={styles.timerWrapper}>
        {/* Glow layers */}
        <Animated.View
          style={[
            styles.glowOuter,
            { transform: [{ scale: glowAnim }], opacity: glowOpacity },
          ]}
        />
        <Animated.View
          style={[
            styles.glowMid,
            { transform: [{ scale: glowAnim }], opacity: Animated.multiply(glowOpacity, 0.5) },
          ]}
        />

        {/* Circle */}
        <View style={styles.timerCircle}>
          {isEditingTime ? (
            <View style={styles.editContainer}>
              <TextInput
                autoFocus
                keyboardType="number-pad"
                value={editValue}
                onChangeText={setEditValue}
                onBlur={handleCustomTimeSubmit}
                onSubmitEditing={handleCustomTimeSubmit}
                style={styles.editInput}
                maxLength={3}
                selectionColor="rgba(255,255,255,0.5)"
              />
              <Text style={styles.editLabel}>{t.timer.edit.label}</Text>
            </View>
          ) : (
            <TouchableOpacity
              onPress={() => {
                if (isActive) return;
                setEditValue(Math.floor(timeLeft / 60).toString());
                setIsEditingTime(true);
              }}
              activeOpacity={isActive ? 1 : 0.7}
            >
              <Text style={styles.timeText}>{formatTime(timeLeft)}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={resetTimer} style={styles.controlBtn}>
          <RotateCcw size={22} color={COLORS.slate[400]} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={toggleTimer}
          style={[styles.playBtn, isActive && styles.playBtnActive]}
        >
          {isActive
            ? <Pause size={32} color={COLORS.primary} fill={COLORS.primary} />
            : <Play size={32} color={COLORS.slate[400]} fill={COLORS.slate[400]} />
          }
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setShowSoundModal(true)}
          style={[
            styles.controlBtn,
            spotify.isPlaying
              ? styles.controlBtnSpotify
              : selectedSound !== 'NONE' && styles.controlBtnActive,
          ]}
        >
          {spotify.isPlaying
            ? <SpotifyIcon size={22} color={SPOTIFY_GREEN} />
            : <Music2 size={22} color={selectedSound !== 'NONE' ? COLORS.primary : COLORS.slate[400]} />
          }
        </TouchableOpacity>
      </View>

      {/* Technique Modal */}
      <Modal visible={showTechniqueModal} transparent animationType="fade" onRequestClose={() => setShowTechniqueModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowTechniqueModal(false)}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{t.timer.technique.label}</Text>
            {techniques.map((tk) => (
              <TouchableOpacity
                key={tk}
                onPress={() => { setTechnique(tk); setShowTechniqueModal(false); }}
                style={[styles.modalItem, technique === tk && styles.modalItemActive]}
              >
                <Text style={[styles.modalItemText, technique === tk && styles.modalItemTextActive]}>
                  {getTechniqueLabel(tk)}
                </Text>
                {technique === tk && <CheckCircle2 size={16} color={COLORS.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Sound Modal */}
      <Modal visible={showSoundModal} transparent animationType="fade" onRequestClose={() => setShowSoundModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowSoundModal(false)}>
          <View style={[styles.modalCard, { padding: 0, overflow: 'hidden' }]}>
            {/* Tab header */}
            <View style={styles.soundTabHeader}>
              <TouchableOpacity
                onPress={() => setSoundTab('ambient')}
                style={[styles.soundTabBtn, soundTab === 'ambient' && styles.soundTabBtnActiveAmbient]}
              >
                <Music2 size={13} color={soundTab === 'ambient' ? COLORS.primary : COLORS.slate[400]} />
                <Text style={[styles.soundTabBtnText, soundTab === 'ambient' && styles.soundTabBtnTextAmbient]}>
                  Ambiente
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSoundTab('spotify')}
                style={[styles.soundTabBtn, soundTab === 'spotify' && styles.soundTabBtnActiveSpotify]}
              >
                <SpotifyIcon size={13} color={soundTab === 'spotify' ? SPOTIFY_GREEN : COLORS.slate[400]} />
                <Text style={[styles.soundTabBtnText, soundTab === 'spotify' && styles.soundTabBtnTextSpotify]}>
                  Spotify
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab content — inner TouchableOpacity prevents modal dismiss on content tap */}
            <TouchableOpacity activeOpacity={1}>
              {soundTab === 'ambient' ? (
                <View style={{ padding: 8 }}>
                  {soundOptions.map(({ key, label, Icon }) => (
                    <TouchableOpacity
                      key={key}
                      onPress={() => { setSelectedSound(key); setShowSoundModal(false); }}
                      style={[styles.modalItem, selectedSound === key && styles.modalItemActive]}
                    >
                      <View style={styles.modalItemRow}>
                        <Icon size={16} color={selectedSound === key ? COLORS.primary : COLORS.slate[500]} />
                        <Text style={[styles.modalItemText, { marginLeft: 10 }, selectedSound === key && styles.modalItemTextActive]}>
                          {label}
                        </Text>
                      </View>
                      {selectedSound === key && <CheckCircle2 size={16} color={COLORS.primary} />}
                    </TouchableOpacity>
                  ))}
                </View>
              ) : (
                <SpotifyPanel />
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const CIRCLE_SIZE = 260;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    backgroundColor: COLORS.background,
  },
  modeRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.slate[100],
    borderRadius: 16,
    padding: 4,
    width: '100%',
    maxWidth: 360,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeBtnActive: {
    backgroundColor: COLORS.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  modeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[500],
  },
  modeBtnTextActive: {
    color: COLORS.primary,
  },
  techniqueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  techniqueBtnText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.slate[600],
  },
  timerWrapper: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowOuter: {
    position: 'absolute',
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 50,
    elevation: 20,
  },
  glowMid: {
    position: 'absolute',
    width: CIRCLE_SIZE * 0.8,
    height: CIRCLE_SIZE * 0.8,
    borderRadius: CIRCLE_SIZE * 0.4,
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 30,
    elevation: 15,
  },
  timerCircle: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
    backgroundColor: 'rgba(248,250,252,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  timeText: {
    fontSize: 58,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: -2,
    fontVariant: ['tabular-nums'],
  },
  editContainer: {
    alignItems: 'center',
  },
  editInput: {
    fontSize: 54,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: -2,
    textAlign: 'center',
    minWidth: 160,
    padding: 0,
  },
  editLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 32,
    paddingBottom: 8,
  },
  controlBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  controlBtnActive: {
    borderColor: `${COLORS.primary}33`,
    backgroundColor: `${COLORS.primary}0D`,
  },
  controlBtnSpotify: {
    borderColor: `${SPOTIFY_GREEN}4D`,
    backgroundColor: `${SPOTIFY_GREEN}0D`,
  },
  playBtn: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  playBtnActive: {
    borderColor: `${COLORS.primary}33`,
    backgroundColor: `${COLORS.primary}0D`,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 8,
    width: '100%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  modalTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate[400],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  modalItemActive: {
    backgroundColor: `${COLORS.primary}1A`,
  },
  modalItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modalItemText: {
    fontSize: 14,
    color: COLORS.slate[600],
    fontWeight: '400',
  },
  modalItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  soundTabHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  soundTabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 10,
  },
  soundTabBtnActiveAmbient: {
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}0D`,
  },
  soundTabBtnActiveSpotify: {
    borderBottomWidth: 2,
    borderBottomColor: SPOTIFY_GREEN,
    backgroundColor: `${SPOTIFY_GREEN}0D`,
  },
  soundTabBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.slate[400],
  },
  soundTabBtnTextAmbient: {
    color: COLORS.primary,
  },
  soundTabBtnTextSpotify: {
    color: SPOTIFY_GREEN,
  },
});
