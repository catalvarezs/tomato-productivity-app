import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { Plus, CheckSquare, Square, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Task, TaskStatus } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { COLORS } from '../colors';

interface TasksViewProps { tasks: Task[]; setTasks: (tasks: Task[]) => void; }

export const TasksView: React.FC<TasksViewProps> = ({ tasks, setTasks }) => {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const addTask = () => {
    if (!inputValue.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks([{ id: Math.random().toString(36).slice(2), title: inputValue.trim(), status: TaskStatus.TODO, createdAt: Date.now(), tags: [] }, ...tasks]);
    setInputValue('');
  };

  const toggleStatus = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setTasks(tasks.map((task) => task.id !== id ? task : { ...task, status: task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE }));
  };

  const deleteTask = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const pendingTasks = tasks.filter((t) => t.status !== TaskStatus.DONE);
  const completedTasks = tasks.filter((t) => t.status === TaskStatus.DONE);
  const formatDate = (ts: number) => new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

  const TaskItem = ({ item }: { item: Task }) => {
    const isDone = item.status === TaskStatus.DONE;
    return (
      <View style={[styles.taskCard, isDone && styles.taskCardDone]}>
        <TouchableOpacity onPress={() => toggleStatus(item.id)} style={styles.taskCheckbox}>
          {isDone ? <CheckSquare size={22} color={COLORS.primary} strokeWidth={2.5} /> : <Square size={22} color={COLORS.slate[300]} strokeWidth={2} />}
        </TouchableOpacity>
        <Text style={[styles.taskTitle, isDone && styles.taskTitleDone]} numberOfLines={2}>{item.title}</Text>
        <View style={styles.taskMeta}>
          <Text style={styles.taskDate}>{formatDate(item.createdAt)}</Text>
          <TouchableOpacity onPress={() => deleteTask(item.id)} style={styles.deleteBtn}><Trash2 size={15} color={COLORS.slate[400]} /></TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t.tasks.title}</Text>
        <Text style={styles.subtitle}>{t.tasks.subtitle}</Text>
      </View>
      <View style={[styles.inputWrapper, isFocused && styles.inputWrapperFocused]}>
        <TextInput style={styles.input} value={inputValue} onChangeText={setInputValue} placeholder={t.tasks.inputPlaceholder} placeholderTextColor={COLORS.slate[400]} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} onSubmitEditing={addTask} returnKeyType="done" />
        {inputValue.trim().length > 0 && (
          <TouchableOpacity onPress={addTask} style={styles.addBtn}><Plus size={20} color="#fff" strokeWidth={3} /></TouchableOpacity>
        )}
      </View>
      <FlatList
        data={[]}
        renderItem={null}
        ListHeaderComponent={
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionLabel}>{t.tasks.inProgress}</Text>
              <View style={styles.badge}><Text style={styles.badgeText}>{pendingTasks.length}</Text></View>
            </View>
            {pendingTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}><CheckSquare size={24} color={COLORS.slate[300]} /></View>
                <Text style={styles.emptyTitle}>{t.tasks.emptyPending.title}</Text>
                <Text style={styles.emptySubtitle}>{t.tasks.emptyPending.subtitle}</Text>
              </View>
            ) : pendingTasks.map((task) => <View key={task.id} style={{ marginBottom: 10 }}><TaskItem item={task} /></View>)}
            {completedTasks.length > 0 && (
              <>
                <View style={[styles.sectionHeader, styles.sectionHeaderCompleted]}>
                  <Text style={styles.sectionLabel}>{t.tasks.completed}</Text>
                  <View style={[styles.badge, styles.badgeGreen]}><Text style={[styles.badgeText, styles.badgeTextGreen]}>{completedTasks.length}</Text></View>
                </View>
                {completedTasks.map((task) => <View key={task.id} style={{ marginBottom: 10 }}><TaskItem item={task} /></View>)}
              </>
            )}
            <View style={{ height: 40 }} />
          </>
        }
        keyExtractor={() => 'header'}
        showsVerticalScrollIndicator={false}
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: 20 },
  header: { paddingTop: 8, paddingBottom: 20 },
  title: { fontSize: 30, fontWeight: '700', color: COLORS.slate[800], letterSpacing: -0.5, marginBottom: 4 },
  subtitle: { fontSize: 14, color: COLORS.slate[500] },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 16, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  inputWrapperFocused: { borderColor: COLORS.primary, shadowColor: COLORS.primary, shadowOpacity: 0.12 },
  input: { flex: 1, paddingVertical: 16, fontSize: 15, fontWeight: '500', color: COLORS.slate[700], textAlign: 'center' },
  addBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 4 },
  list: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionHeaderCompleted: { marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: COLORS.borderLight },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: COLORS.slate[400], letterSpacing: 1.5, textTransform: 'uppercase' },
  badge: { backgroundColor: `${COLORS.primary}1A`, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  badgeGreen: { backgroundColor: 'rgba(34,197,94,0.12)' },
  badgeTextGreen: { color: '#16a34a' },
  emptyState: { alignItems: 'center', paddingVertical: 40, borderWidth: 2, borderStyle: 'dashed', borderColor: COLORS.borderLight, borderRadius: 20, backgroundColor: `${COLORS.slate[50]}80`, marginBottom: 12 },
  emptyIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.card, alignItems: 'center', justifyContent: 'center', marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2, elevation: 2 },
  emptyTitle: { fontSize: 14, fontWeight: '600', color: COLORS.slate[400], marginBottom: 4 },
  emptySubtitle: { fontSize: 12, color: COLORS.slate[400], opacity: 0.7 },
  taskCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.card, borderRadius: 14, borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: 14, paddingVertical: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  taskCardDone: { backgroundColor: `${COLORS.slate[50]}CC`, borderColor: COLORS.borderLight },
  taskCheckbox: { marginRight: 12 },
  taskTitle: { flex: 1, fontSize: 14, fontWeight: '500', color: COLORS.slate[700], lineHeight: 20 },
  taskTitleDone: { color: COLORS.slate[400], textDecorationLine: 'line-through' },
  taskMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginLeft: 8 },
  taskDate: { fontSize: 10, color: COLORS.slate[400], backgroundColor: COLORS.slate[50], paddingHorizontal: 6, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: COLORS.borderLight },
  deleteBtn: { padding: 4 },
});
