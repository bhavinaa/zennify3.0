// import React, { useState, useEffect } from 'react';
// import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView } from 'react-native';
// import { SafeAreaView } from 'react-native-safe-area-context';
// import { firestore } from '@/utils/firebase';
// import { collection, doc, addDoc, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
// import { useAuth } from '@/context/AuthContext';
// import { MoodSelector } from '@/components/mood/MoodSelector';
// import { CalendarDays, Send, CalendarCheck2 } from 'lucide-react-native';
// import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

// // Mood type definition
// type MoodType = 'terrible' | 'bad' | 'okay' | 'good' | 'great';

// interface MoodEntry {
//   id: string;
//   mood: MoodType;
//   note: string;
//   date: string;
//   timestamp: number;
// }

// export default function MoodScreen() {
//   const { user } = useAuth();
//   const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
//   const [note, setNote] = useState('');
//   const [submitting, setSubmitting] = useState(false);
//   const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
//   const [loadingHistory, setLoadingHistory] = useState(true);
//   const [todaysMoodLogged, setTodaysMoodLogged] = useState(false);
  
//   // Load recent mood entries
//   useEffect(() => {
//     const loadMoodHistory = async () => {
//       if (!user) return;
      
//       try {
//         setLoadingHistory(true);
//         const moodsRef = collection(firestore, 'users', user.uid, 'moods');
//         const q = query(moodsRef, orderBy('timestamp', 'desc'), limit(5));
        
//         const querySnapshot = await getDocs(q);
//         const moods: MoodEntry[] = [];
        
//         querySnapshot.forEach(doc => {
//           moods.push({ 
//             id: doc.id, 
//             ...doc.data() 
//           } as MoodEntry);
//         });
        
//         setRecentMoods(moods);
        
//         // Check if today's mood is already logged
//         const today = new Date().toISOString().split('T')[0];
//         const todaysMood = moods.find(mood => mood.date === today);
        
//         if (todaysMood) {
//           setTodaysMoodLogged(true);
//           setSelectedMood(todaysMood.mood);
//           setNote(todaysMood.note);
//         }
//       } catch (error) {
//         console.error('Error loading mood history:', error);
//       } finally {
//         setLoadingHistory(false);
//       }
//     };
    
//     loadMoodHistory();
//   }, [user]);
  
//   const handleSubmitMood = async () => {
//     if (!user || !selectedMood) return;
    
//     try {
//       setSubmitting(true);
      
//       const today = new Date().toISOString().split('T')[0];
//       const timestamp = Date.now();
      
//       // Add mood entry to Firestore
//       const moodsRef = collection(firestore, 'users', user.uid, 'moods');
      
//       await addDoc(moodsRef, {
//         mood: selectedMood,
//         note: note.trim(),
//         date: today,
//         timestamp
//       });
      
//       // Refresh the mood list
//       const newMood: MoodEntry = {
//         id: 'new', // This will be replaced when we reload
//         mood: selectedMood,
//         note: note.trim(),
//         date: today,
//         timestamp
//       };
      
//       // Update state
//       setRecentMoods([newMood, ...recentMoods]);
//       setTodaysMoodLogged(true);
      
//       // Reset form (optional, you might want to keep it)
//       // setSelectedMood(null);
//       // setNote('');
      
//     } catch (error) {
//       console.error('Error saving mood:', error);
//     } finally {
//       setSubmitting(false);
//     }
//   };
  
//   // Get the mood emoji
//   const getMoodEmoji = (mood: MoodType): string => {
//     switch (mood) {
//       case 'terrible': return '😞';
//       case 'bad': return '😔';
//       case 'okay': return '😐';
//       case 'good': return '🙂';
//       case 'great': return '😄';
//     }
//   };
  
//   // Get the mood color
//   const getMoodColor = (mood: MoodType): string => {
//     switch (mood) {
//       case 'terrible': return '#F87171';
//       case 'bad': return '#FB923C';
//       case 'okay': return '#FBBF24';
//       case 'good': return '#34D399';
//       case 'great': return '#60A5FA';
//     }
//   };
  
//   // Format date
//   const formatDate = (dateString: string): string => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', {
//       weekday: 'short',
//       month: 'short',
//       day: 'numeric'
//     });
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <ScrollView showsVerticalScrollIndicator={false}>
//         <View style={styles.header}>
//           <Text style={styles.headerTitle}>Mood Tracker</Text>
//         </View>
        
//         <Animated.View entering={FadeInUp.duration(500)}>
//           <View style={styles.moodSection}>
//             <MoodSelector 
//               onSelect={setSelectedMood} 
//               selectedMood={selectedMood}
//             />
            
//             <View style={styles.noteContainer}>
//               <Text style={styles.noteLabel}>Add a note (optional)</Text>
//               <TextInput
//                 style={styles.noteInput}
//                 placeholder="How are you feeling today?"
//                 value={note}
//                 onChangeText={setNote}
//                 multiline
//                 maxLength={150}
//                 editable={!todaysMoodLogged}
//               />
//             </View>
            
//             <TouchableOpacity 
//               style={[
//                 styles.submitButton,
//                 (!selectedMood || todaysMoodLogged) && styles.disabledButton
//               ]}
//               onPress={handleSubmitMood}
//               disabled={!selectedMood || submitting || todaysMoodLogged}
//             >
//               {submitting ? (
//                 <ActivityIndicator color="#FFF" size="small" />
//               ) : todaysMoodLogged ? (
//                 <>
//                   <CalendarCheck2 color="#FFF" size={18} style={{ marginRight: 8 }} />
//                   <Text style={styles.submitButtonText}>Today's Mood Logged</Text>
//                 </>
//               ) : (
//                 <>
//                   <Send color="#FFF" size={18} style={{ marginRight: 8 }} />
//                   <Text style={styles.submitButtonText}>Log Today's Mood</Text>
//                 </>
//               )}
//             </TouchableOpacity>
//           </View>
//         </Animated.View>
        
//         <Animated.View entering={FadeInUp.delay(200).duration(500)}>
//           <View style={styles.historySection}>
//             <View style={styles.sectionHeader}>
//               <CalendarDays color="#4C66EE" size={20} />
//               <Text style={styles.sectionTitle}>Recent Mood History</Text>
//             </View>
            
//             {loadingHistory ? (
//               <ActivityIndicator color="#4C66EE" style={{ marginTop: 20 }} />
//             ) : recentMoods.length > 0 ? (
//               <View style={styles.moodHistory}>
//                 {recentMoods.map((entry, index) => (
//                   <View key={entry.id} style={styles.moodHistoryItem}>
//                     <View style={[
//                       styles.moodIconContainer, 
//                       { backgroundColor: getMoodColor(entry.mood) }
//                     ]}>
//                       <Text style={styles.moodEmoji}>{getMoodEmoji(entry.mood)}</Text>
//                     </View>
//                     <View style={styles.moodItemContent}>
//                       <Text style={styles.moodDate}>{formatDate(entry.date)}</Text>
//                       {entry.note ? (
//                         <Text style={styles.moodNote}>{entry.note}</Text>
//                       ) : (
//                         <Text style={styles.emptyNote}>No note added</Text>
//                       )}
//                     </View>
//                   </View>
//                 ))}
//               </View>
//             ) : (
//               <View style={styles.emptyHistory}>
//                 <Text style={styles.emptyHistoryText}>
//                   You haven't logged any moods yet.
//                 </Text>
//               </View>
//             )}
//           </View>
//         </Animated.View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F5F7FF',
//   },
//   header: {
//     padding: 20,
//     backgroundColor: '#FFF',
//   },
//   headerTitle: {
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 20,
//     color: '#333',
//   },
//   moodSection: {
//     padding: 20,
//   },
//   noteContainer: {
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 16,
//     marginTop: 16,
//     marginBottom: 20,
//   },
//   noteLabel: {
//     fontFamily: 'Inter-Medium',
//     fontSize: 16,
//     color: '#333',
//     marginBottom: 12,
//   },
//   noteInput: {
//     fontFamily: 'Inter-Regular',
//     fontSize: 16,
//     color: '#333',
//     borderWidth: 1,
//     borderColor: '#E5E9FF',
//     borderRadius: 12,
//     padding: 12,
//     height: 100,
//     textAlignVertical: 'top',
//   },
//   submitButton: {
//     backgroundColor: '#4C66EE',
//     borderRadius: 12,
//     paddingVertical: 16,
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexDirection: 'row',
//   },
//   disabledButton: {
//     backgroundColor: '#A9B4EF',
//   },
//   submitButtonText: {
//     fontFamily: 'Inter-Bold',
//     fontSize: 16,
//     color: '#FFF',
//   },
//   historySection: {
//     padding: 20,
//   },
//   sectionHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   sectionTitle: {
//     fontFamily: 'Poppins-SemiBold',
//     fontSize: 18,
//     color: '#333',
//     marginLeft: 8,
//   },
//   moodHistory: {
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 16,
//   },
//   moodHistoryItem: {
//     flexDirection: 'row',
//     marginBottom: 16,
//     borderBottomWidth: 1,
//     borderBottomColor: '#F0F2F8',
//     paddingBottom: 16,
//   },
//   moodIconContainer: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   moodEmoji: {
//     fontSize: 20,
//   },
//   moodItemContent: {
//     flex: 1,
//   },
//   moodDate: {
//     fontFamily: 'Inter-Bold',
//     fontSize: 14,
//     color: '#333',
//     marginBottom: 4,
//   },
//   moodNote: {
//     fontFamily: 'Inter-Regular',
//     fontSize: 14,
//     color: '#666',
//   },
//   emptyNote: {
//     fontFamily: 'Inter-Regular',
//     fontSize: 14,
//     color: '#999',
//     fontStyle: 'italic',
//   },
//   emptyHistory: {
//     backgroundColor: '#FFF',
//     borderRadius: 16,
//     padding: 30,
//     alignItems: 'center',
//   },
//   emptyHistoryText: {
//     fontFamily: 'Inter-Medium',
//     fontSize: 16,
//     color: '#666',
//     textAlign: 'center',
//   },
// });


// Improved MoodScreen with functionality, XP/streak tracking, and mood graph

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { firestore } from '@/utils/firebase';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { MoodSelector } from '@/components/mood/MoodSelector';
import { LineChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';
import { CalendarCheck2, Send, CalendarDays } from 'lucide-react-native';

const screenWidth = Dimensions.get('window').width;

const moodToNumeric = {
  terrible: 1,
  bad: 2,
  okay: 3,
  good: 4,
  great: 5,
};

export default function MoodScreen() {
  const { user } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todaysMoodLogged, setTodaysMoodLogged] = useState(false);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);
        const ref = collection(firestore, 'users', user.uid, 'moods');
        const q = query(ref, orderBy('timestamp', 'desc'), limit(7));
        const snapshot = await getDocs(q);

        const entries = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHistory(entries);

        const todayEntry = entries.find((e) => e.date === today);
        if (todayEntry) {
          setTodaysMoodLogged(true);
          setSelectedMood(todayEntry.mood);
          setNote(todayEntry.note);
        }
      } catch (err) {
        console.error('Load error:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const getYesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const handleSubmit = async () => {
    if (!user || !selectedMood) return;

    try {
      setSubmitting(true);
      const moodsRef = collection(firestore, 'users', user.uid, 'moods');
      const existing = query(moodsRef, where('date', '==', today));
      const existsSnap = await getDocs(existing);

      if (!existsSnap.empty) {
        await updateDoc(existsSnap.docs[0].ref, {
          mood: selectedMood,
          note: note.trim(),
          timestamp: Date.now(),
        });
      } else {
        await addDoc(moodsRef, {
          mood: selectedMood,
          note: note.trim(),
          date: today,
          timestamp: Date.now(),
        });

        const userRef = doc(firestore, 'users', user.uid);
        const snap = await getDoc(userRef);
        if (snap.exists()) {
          const d = snap.data();
          const isStreak = d.lastMoodEntry === getYesterday();
          const streak = isStreak ? (d.streakDays || 0) + 1 : 1;
          const newXp = (d.xp || 0) + 5;

          await updateDoc(userRef, {
            streakDays: streak,
            xp: newXp,
            lastMoodEntry: today,
          });
        }
      }

      setTodaysMoodLogged(true);
    } catch (err) {
      console.error('Submit error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const moodLabels = history.map((h) => h.date.split('-').slice(1).join('/')).reverse();
  const moodData = history.map((h) => moodToNumeric[h.mood]).reverse();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <Text style={styles.header}>Mood Tracker</Text>
        <MoodSelector selectedMood={selectedMood} onSelect={setSelectedMood} />

        <TextInput
          placeholder="Add a note"
          style={styles.note}
          value={note}
          onChangeText={setNote}
        />

        <TouchableOpacity
          style={[styles.button, todaysMoodLogged && styles.disabled]}
          onPress={handleSubmit}
          disabled={submitting || !selectedMood}
        >
          {submitting ? <ActivityIndicator color="#FFF" /> : (
            <Text style={styles.buttonText}>{todaysMoodLogged ? 'Update Mood' : 'Log Mood'}</Text>
          )}
        </TouchableOpacity>

        <View style={styles.graphContainer}>
          <Text style={styles.sectionHeader}>Mood Trend (Past Week)</Text>
          {loading ? <ActivityIndicator color="#4C66EE" /> : (
            <LineChart
              data={{
                labels: moodLabels,
                datasets: [{ data: moodData }],
              }}
              width={screenWidth - 40}
              height={220}
              chartConfig={{
                backgroundColor: '#F5F7FF',
                backgroundGradientFrom: '#E5E9FF',
                backgroundGradientTo: '#F5F7FF',
                color: (opacity = 1) => `rgba(76, 102, 238, ${opacity})`,
              }}
              style={{ borderRadius: 12 }}
              bezier
            />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F7FF', padding: 20 },
  header: { fontSize: 24, fontWeight: '700', marginBottom: 20, color: '#333' },
  note: {
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    borderColor: '#E5E9FF',
    borderWidth: 1,
    marginVertical: 20,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#4C66EE',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabled: { backgroundColor: '#A9B4EF' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  sectionHeader: { fontSize: 18, fontWeight: '600', marginBottom: 8, color: '#333' },
  graphContainer: { backgroundColor: '#FFF', padding: 12, borderRadius: 12 },
});
