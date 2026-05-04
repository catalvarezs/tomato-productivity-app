import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, SafeAreaView } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Timer, CheckSquare, BookOpen, Wind, Globe, CheckCircle2 } from 'lucide-react-native';

import { LanguageProvider, useLanguage } from './src/contexts/LanguageContext';
import { SpotifyProvider } from './src/contexts/SpotifyContext';
import { usePersistedState } from './src/hooks/usePersistedState';
import { TimerView } from './src/features/TimerView';
import { TasksView } from './src/features/TasksView';
import { BreathingView } from './src/features/BreathingView';
import { MethodsView } from './src/features/MethodsView';
import { Task, Session, Language } from './src/types';
import { COLORS } from './src/colors';
import { LANGUAGES } from './src/translations';

const Tab = createBottomTabNavigator();

// Tomato SVG-like icon using View
const TomatoIcon: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
    <View style={{ width: size * 0.85, height: size * 0.85, borderRadius: size * 0.5, backgroundColor: COLORS.primary }} />
    <View style={{ position: 'absolute', top: 0, left: size * 0.4, width: size * 0.12, height: size * 0.3, backgroundColor: '#16a34a', borderRadius: 4, transform: [{ rotate: '-15deg' }] }} />
  </View>
);

const LANGUAGE_OPTIONS: Language[] = ['en', 'es', 'pt', 'de', 'ca'];

function LanguageModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { language, setLanguage } = useLanguage();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose}>
        <View style={modalStyles.card}>
          <Text style={modalStyles.title}>Language</Text>
          {LANGUAGE_OPTIONS.map((lang) => (
            <TouchableOpacity
              key={lang}
              onPress={() => { setLanguage(lang); onClose(); }}
              style={[modalStyles.item, language === lang && modalStyles.itemActive]}
            >
              <Text style={[modalStyles.itemText, language === lang && modalStyles.itemTextActive]}>
                {LANGUAGES[lang]}
              </Text>
              {language === lang && <CheckCircle2 size={16} color={COLORS.primary} />}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

function AppNavigator() {
  const { t } = useLanguage();
  const [tasks, setTasks] = usePersistedState<Task[]>('tomato_tasks', []);
  const [sessions, setSessions] = usePersistedState<Session[]>('tomato_sessions', []);
  const [showLang, setShowLang] = useState(false);

  const handleSessionComplete = (session: Session) => {
    setSessions([session, ...sessions]);
  };

  const headerRight = () => (
    <TouchableOpacity onPress={() => setShowLang(true)} style={tabStyles.langBtn}>
      <Globe size={18} color={COLORS.slate[500]} />
    </TouchableOpacity>
  );

  return (
    <>
      <LanguageModal visible={showLang} onClose={() => setShowLang(false)} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.slate[400],
          tabBarStyle: {
            backgroundColor: COLORS.card,
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            paddingTop: 4,
            height: 88,
            paddingBottom: 24,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: COLORS.background,
            shadowColor: 'transparent',
            elevation: 0,
            borderBottomWidth: 0,
          },
          headerTitleStyle: {
            fontSize: 16,
            fontWeight: '700',
            color: COLORS.slate[800],
          },
          headerLeft: () => (
            <View style={tabStyles.headerLeft}>
              <TomatoIcon size={24} />
              <Text style={tabStyles.headerBrand}>Tomato</Text>
            </View>
          ),
          headerRight,
        }}
      >
        <Tab.Screen
          name="Timer"
          options={{
            tabBarLabel: t.nav.timer,
            tabBarIcon: ({ color }) => <Timer size={22} color={color} />,
            headerTitle: '',
          }}
        >
          {() => (
            <SafeAreaView style={tabStyles.screen} edges={['bottom']}>
              <View style={tabStyles.screenPad}>
                <TimerView onSessionComplete={handleSessionComplete} />
              </View>
            </SafeAreaView>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Tasks"
          options={{
            tabBarLabel: t.nav.tasks,
            tabBarIcon: ({ color }) => <CheckSquare size={22} color={color} />,
            headerTitle: '',
          }}
        >
          {() => (
            <SafeAreaView style={tabStyles.screen} edges={['bottom']}>
              <TasksView tasks={tasks} setTasks={setTasks} />
            </SafeAreaView>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Breathing"
          options={{
            tabBarLabel: t.nav.breathing,
            tabBarIcon: ({ color }) => <Wind size={22} color={color} />,
            headerTitle: '',
          }}
        >
          {() => (
            <SafeAreaView style={tabStyles.screen} edges={['bottom']}>
              <BreathingView />
            </SafeAreaView>
          )}
        </Tab.Screen>

        <Tab.Screen
          name="Methods"
          options={{
            tabBarLabel: t.nav.methods,
            tabBarIcon: ({ color }) => <BookOpen size={22} color={color} />,
            headerTitle: '',
          }}
        >
          {() => (
            <SafeAreaView style={tabStyles.screen} edges={['bottom']}>
              <MethodsView />
            </SafeAreaView>
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <SpotifyProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <AppNavigator />
        </NavigationContainer>
      </SpotifyProvider>
    </LanguageProvider>
  );
}

const tabStyles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screenPad: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 16,
  },
  headerBrand: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.slate[800],
    letterSpacing: -0.3,
  },
  langBtn: {
    padding: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: COLORS.slate[100],
  },
});

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 8,
    width: '100%',
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 12,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.slate[400],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
  },
  itemActive: {
    backgroundColor: `${COLORS.primary}1A`,
  },
  itemText: {
    fontSize: 14,
    color: COLORS.slate[600],
  },
  itemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
