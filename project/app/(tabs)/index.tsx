import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ScrollView, Image, TouchableOpacity } from 'react-native';
import { firestore } from '@/utils/firebase';
import { collection, doc, updateDoc, getDoc, setDoc, query, where, getDocs } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StreakCounter } from '@/components/ui/StreakCounter';
import { PointCounter } from '@/components/ui/PointCounter';
import { QuestCard, Quest } from '@/components/quests/QuestCard';
import { defaultQuests, badgesData } from '@/utils/questData';
import { calculateLevel } from '@/utils/levelUtils';
import { Bell, ChevronRight } from 'lucide-react-native';
import Animated, { FadeInUp, FadeInDown } from 'react-native-reanimated';

export default function Home() {
  const { user, userData } = useAuth();
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load user's daily quests
  useEffect(() => {
    const loadQuests = async () => {
      if (!user) return;
      
      try {
        // Check if the user has quests for today
        const today = new Date().toISOString().split('T')[0];
        const questsRef = collection(firestore, 'users', user.uid, 'quests');
        const todayQuery = query(questsRef, where('date', '==', today));
        const questsSnapshot = await getDocs(todayQuery);
        
        if (questsSnapshot.empty) {
          // No quests for today, create new ones
          const dailyQuestRef = doc(firestore, 'users', user.uid, 'dailyQuests', today);
          
          // Select 3 random quests from default quests
          const shuffled = [...defaultQuests].sort(() => 0.5 - Math.random());
          const selectedQuests = shuffled.slice(0, 3);
          
          // Save quests for today
          await setDoc(dailyQuestRef, {
            date: today,
            quests: selectedQuests
          });
          
          setDailyQuests(selectedQuests);
        } else {
          // Get today's quests
          const questsDoc = questsSnapshot.docs[0];
          const questsData = questsDoc.data();
          setDailyQuests(questsData.quests || []);
        }
      } catch (error) {
        console.error('Error loading quests:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadQuests();
  }, [user, refreshTrigger]);

  // Handle quest completion
  const handleCompleteQuest = async (questId: string) => {
    if (!user || !userData) return;
    
    try {
      // Find the quest
      const questIndex = dailyQuests.findIndex(q => q.id === questId);
      if (questIndex === -1) return;
      
      // Create updated quests array
      const updatedQuests = [...dailyQuests];
      const quest = updatedQuests[questIndex];
      
      // Skip if already completed
      if (quest.completed) return;
      
      // Mark as completed
      updatedQuests[questIndex] = {
        ...quest,
        completed: true
      };
      
      // Update in state
      setDailyQuests(updatedQuests);
      
      // Update in Firestore
      const today = new Date().toISOString().split('T')[0];
      const dailyQuestRef = doc(firestore, 'users', user.uid, 'dailyQuests', today);
      await updateDoc(dailyQuestRef, { quests: updatedQuests });
      
      // Add XP to user
      const userRef = doc(firestore, 'users', user.uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const userData = userSnap.data();
        const newXp = (userData.xp || 0) + quest.points;
        const newLevel = calculateLevel(newXp);
        
        // Check if level up occurred
        const levelUp = newLevel > userData.level;
        
        await updateDoc(userRef, { 
          xp: newXp,
          level: newLevel,
          questsCompleted: (userData.questsCompleted || 0) + 1
        });
        
        // Check for new badges
        const questsCompleted = (userData.questsCompleted || 0) + 1;
        let currentBadges = userData.badges || [];
        
        badgesData.forEach(badge => {
          if (badge.requirement.type === 'quests' && 
              questsCompleted >= badge.requirement.value &&
              !currentBadges.includes(badge.id)) {
            currentBadges.push(badge.id);
          }
        });
        
        if (currentBadges.length > userData.badges?.length) {
          await updateDoc(userRef, { badges: currentBadges });
        }
      }
      
    } catch (error) {
      console.error('Error completing quest:', error);
    }
  };

  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
            <View style={styles.profileSection}>
              <View>
                <Text style={styles.greeting}>Hi, {userData.username}!</Text>
                <Text style={styles.date}>
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </Text>
              </View>
              <TouchableOpacity style={styles.notificationButton}>
                <Bell color="#4C66EE" size={22} />
              </TouchableOpacity>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <StreakCounter days={userData.streakDays || 1} />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <PointCounter 
              points={userData.xp || 0} 
              level={userData.level || 1} 
            />
          </Animated.View>
        </View>

        <Animated.View entering={FadeInDown.delay(400).duration(500)}>
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Today's Quests</Text>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => { /* Navigate to quests screen */ }}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <ChevronRight size={16} color="#4C66EE" />
              </TouchableOpacity>
            </View>
            
            {dailyQuests.length > 0 ? (
              dailyQuests.map((quest, index) => (
                <Animated.View 
                  key={quest.id}
                  entering={FadeInUp.delay(500 + index * 100).duration(500)}
                >
                  <QuestCard 
                    quest={quest} 
                    onComplete={handleCompleteQuest} 
                  />
                </Animated.View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  No quests available for today
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={() => setRefreshTrigger(prev => prev + 1)}
                >
                  <Text style={styles.refreshButtonText}>
                    Refresh Quests
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FF',
  },
  loadingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6E78B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 20,
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  greeting: {
    fontFamily: 'Poppins-Bold',
    fontSize: 24,
    color: '#333',
  },
  date: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    backgroundColor: '#EFF1FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#4C66EE',
    marginRight: 4,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
  },
  emptyStateText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  refreshButton: {
    backgroundColor: '#4C66EE',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  refreshButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#fff',
  },
});