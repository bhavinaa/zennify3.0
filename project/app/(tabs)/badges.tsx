import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { BadgeItem } from '@/components/badges/BadgeItem';
import { firestore } from '@/utils/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Badge } from '@/components/badges/BadgeItem';
import { badgesData } from '@/utils/questData';
import { Award } from 'lucide-react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

export default function BadgesScreen() {
  const { user, userData } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadBadges = async () => {
      if (!user || !userData) return;
      
      try {
        // Transform badges data into the format needed for BadgeItem
        const userBadges = userData.badges || [];
        
        const formattedBadges = badgesData.map(badge => ({
          id: badge.id,
          name: badge.name,
          description: badge.description,
          icon: badge.icon,
          color: badge.color,
          unlocked: userBadges.includes(badge.id)
        }));
        
        setBadges(formattedBadges);
      } catch (error) {
        console.error('Error loading badges:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadBadges();
  }, [user, userData]);
  
  // Calculate badge stats
  const unlockedCount = badges.filter(badge => badge.unlocked).length;
  const totalCount = badges.length;
  const progressPercentage = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Achievements</Text>
      </View>
      
      <Animated.View entering={FadeInUp.duration(500)} style={styles.statsContainer}>
        <View style={styles.statsHeader}>
          <Award color="#4C66EE" size={24} />
          <Text style={styles.statsTitle}>Badge Collection</Text>
        </View>
        
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            You've unlocked {unlockedCount} out of {totalCount} badges
          </Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBackground}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${progressPercentage}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progressPercentage)}%</Text>
          </View>
        </View>
      </Animated.View>
      
      <FlatList
        data={badges}
        renderItem={({ item, index }) => (
          <Animated.View entering={FadeInUp.delay(100 + index * 50).duration(400)}>
            <BadgeItem 
              badge={item} 
              isNew={userData?.badges?.includes(item.id) && 
                     item.id !== 'newbie' && 
                     badges.filter(b => b.unlocked).length === 1}
            />
          </Animated.View>
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.badgesList}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              No badges available yet. Complete quests to earn badges!
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FF',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 20,
    color: '#333',
  },
  statsContainer: {
    margin: 20,
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#6E78B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statsTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
    marginLeft: 8,
  },
  stats: {
    marginBottom: 8,
  },
  statsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: '#F0F2F8',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4C66EE',
    borderRadius: 4,
  },
  progressText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4C66EE',
    width: 50,
    textAlign: 'right',
  },
  badgesList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  emptyContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginTop: 20,
  },
  emptyText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});