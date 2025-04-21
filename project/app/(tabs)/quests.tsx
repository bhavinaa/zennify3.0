import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  ActivityIndicator, Modal, TextInput, Platform, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '@/utils/firebase';
import {
  collection, doc, updateDoc, getDoc, setDoc, getDocs
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { QuestCard, Quest } from '@/components/quests/QuestCard';
import { defaultQuests } from '@/utils/questData';
import { calculateLevel } from '@/utils/levelUtils';
import { Filter, RefreshCw } from 'lucide-react-native';
import { v4 as uuidv4 } from 'uuid';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function QuestsScreen() {
  const { user, userData } = useAuth();
  const [quests, setQuests] = useState<Quest[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Quest[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState<'all' | Quest['type']>('all');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [points, setPoints] = useState('10');
  const [type, setType] = useState<Quest['type']>('meditation');

  const dateKey = date.toISOString().split('T')[0];

  useEffect(() => {
    const loadQuests = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const dailyQuestRef = doc(firestore, 'users', user.uid, 'dailyQuests', dateKey);
        const docSnap = await getDoc(dailyQuestRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const active = data.quests.filter((q: Quest) => !q.completed);
          const completed = data.quests.filter((q: Quest) => q.completed);
          setQuests(active);
          setCompletedQuests(completed);
        } else if (dateKey === new Date().toISOString().split('T')[0]) {
          await setDoc(dailyQuestRef, { date: dateKey, quests: defaultQuests });
          setQuests(defaultQuests);
          setCompletedQuests([]);
        } else {
          setQuests([]);
          setCompletedQuests([]);
        }
      } catch (error) {
        console.error('Error loading quests:', error);
      } finally {
        setLoading(false);
      }
    };
    loadQuests();
  }, [user, date]);

  const handleCompleteQuest = async (questId: string) => {
    if (!user || !userData) return;
    const questIndex = quests.findIndex(q => q.id === questId);
    if (questIndex === -1) return;
    const quest = quests[questIndex];
    const updatedQuests = [...quests];
    updatedQuests.splice(questIndex, 1);
    const updatedCompletedQuests = [...completedQuests, { ...quest, completed: true }];
    setQuests(updatedQuests);
    setCompletedQuests(updatedCompletedQuests);

    const dailyQuestRef = doc(firestore, 'users', user.uid, 'dailyQuests', dateKey);
    const questDoc = await getDoc(dailyQuestRef);
    if (questDoc.exists()) {
      const currentQuests = questDoc.data().quests || [];
      const updatedFirestoreQuests = currentQuests.map((q: Quest) =>
        q.id === questId ? { ...q, completed: true } : q
      );

      try {
        await updateDoc(dailyQuestRef, { quests: updatedFirestoreQuests });
      } catch (error) {
        console.error('Error updating Firestore:', error);
        Alert.alert('Error', 'Failed to save the quest. Please try again.');
      }
      // await updateDoc(dailyQuestRef, { quests: updatedFirestoreQuests });

      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newXp = (userData.xp || 0) + quest.points;
        const newLevel = calculateLevel(newXp);
        await updateDoc(userRef, {
          xp: newXp,
          level: newLevel,
          questsCompleted: (userData.questsCompleted || 0) + 1
        });
      }
    }
  };

  const handleCreateQuest = async () => {
    if (!user) return;
    const newQuest: Quest = {
      id: uuidv4(),
      title,
      description,
      points: parseInt(points),
      type,
      completed: false,
      timeEstimate: '10 min'
    };
    const dailyQuestRef = doc(firestore, 'users', user.uid, 'dailyQuests', dateKey);
    const docSnap = await getDoc(dailyQuestRef);
    if (docSnap.exists()) {
      const existingQuests = docSnap.data().quests || [];
      await updateDoc(dailyQuestRef, { quests: [...existingQuests, newQuest] });
    } else {
      await setDoc(dailyQuestRef, { date: dateKey, quests: [newQuest] });
    }
    setQuests(prev => [...prev, newQuest]);
    setShowModal(false);
    setTitle(''); setDescription(''); setPoints('10');
  };

  const filteredQuests = (activeTab === 'active' ? quests : completedQuests).filter(
    (q) => filterType === 'all' || q.type === filterType
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quest Log</Text>
        <TouchableOpacity onPress={() => setShowDatePicker(true)}><Text>{dateKey}</Text></TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {['all', 'meditation', 'exercise', 'mindfulness'].map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.filterChip, filterType === t && styles.activeFilterChip]}
            onPress={() => setFilterType(t as any)}
          >
            <Text style={{ color: filterType === t ? '#FFF' : '#4C66EE' }}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'active' && styles.activeTab]} onPress={() => setActiveTab('active')}>
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>Active ({quests.length})</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'completed' && styles.activeTab]} onPress={() => setActiveTab('completed')}>
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>Completed ({completedQuests.length})</Text>
        </TouchableOpacity>
      </View>

      {loading ? <ActivityIndicator size="large" color="#4C66EE" /> : (
        <FlatList
          data={filteredQuests}
          renderItem={({ item }) => <QuestCard quest={item} onComplete={handleCompleteQuest} />}
          keyExtractor={item => item.id}
        />
      )}

      <TouchableOpacity style={styles.addQuestButton} onPress={() => setShowModal(true)}>
        <Text style={styles.addQuestButtonText}>+ New Quest</Text>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide">
        <View style={styles.modalContent}>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Title" />
          <TextInput style={styles.input} value={description} onChangeText={setDescription} placeholder="Description" />
          <TextInput style={styles.input} value={points} onChangeText={setPoints} keyboardType="numeric" placeholder="Points" />
          <View style={styles.tabContainer}>
            {['meditation', 'exercise', 'mindfulness', 'gratitude', 'mood'].map(t => (
              <TouchableOpacity
                key={t}
                style={[styles.filterChip, type === t && styles.activeFilterChip]}
                onPress={() => setType(t as any)}
              >
                <Text style={{ color: type === t ? '#FFF' : '#4C66EE' }}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.createButton} onPress={handleCreateQuest}><Text style={{ color: '#fff' }}>Create</Text></TouchableOpacity>
          <TouchableOpacity style={styles.cancelButton} onPress={() => setShowModal(false)}><Text style={{ color: '#4C66EE' }}>Cancel</Text></TouchableOpacity>
        </View>
      </Modal>

      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selected) => {
            setShowDatePicker(false);
            if (selected) setDate(selected);
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF' },
  header: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#333' },
  tabContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 16, marginBottom: 8 },
  tab: { padding: 8, margin: 4, borderRadius: 20, backgroundColor: '#F0F2F8' },
  activeTab: { backgroundColor: '#4C66EE' },
  tabText: { color: '#666' },
  activeTabText: { color: '#FFF' },
  filterChip: { padding: 8, borderRadius: 20, backgroundColor: '#EFF1FF', marginRight: 8, marginBottom: 8 },
  activeFilterChip: { backgroundColor: '#4C66EE' },
  addQuestButton: { position: 'absolute', bottom: 30, right: 20, backgroundColor: '#4C66EE', padding: 16, borderRadius: 30 },
  addQuestButtonText: { color: '#FFF', fontWeight: 'bold' },
  modalContent: { padding: 24, flex: 1, justifyContent: 'center' },
  input: { borderWidth: 1, borderColor: '#CCC', padding: 12, marginBottom: 12, borderRadius: 8, backgroundColor: '#FFF' },
  createButton: { backgroundColor: '#4C66EE', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  cancelButton: { alignItems: 'center' },
})
