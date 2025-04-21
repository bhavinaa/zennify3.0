import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '@/context/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { firestore } from '@/utils/firebase';
import { ChevronRight, LogOut, Settings, User as UserIcon, Bell, Moon, CircleHelp as HelpCircle } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user, userData, signOut } = useAuth();
  const [signingOut, setSigningOut] = useState(false);
  
  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      await signOut();
      router.replace('/(auth)');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };
  
  if (!userData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4C66EE" />
      </View>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={['#4C66EE', '#9DACFF']}
          style={styles.header}
        >
          <Animated.View entering={FadeInDown.duration(500)} style={styles.profileInfo}>
            <View style={styles.profileImageContainer}>
              <UserIcon color="#FFF" size={40} />
            </View>
            <Text style={styles.username}>{userData.username}</Text>
            <Text style={styles.joinedDate}>Level {userData.level} • {userData.streakDays} day streak</Text>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(100).duration(500)} style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.xp || 0}</Text>
              <Text style={styles.statLabel}>XP Earned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.questsCompleted || 0}</Text>
              <Text style={styles.statLabel}>Quests Done</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{userData.badges?.length || 1}</Text>
              <Text style={styles.statLabel}>Badges</Text>
            </View>
          </Animated.View>
        </LinearGradient>
        
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <Text style={styles.sectionTitle}>Settings</Text>
            
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <UserIcon color="#4C66EE" size={20} />
                </View>
                <Text style={styles.settingText}>Edit Profile</Text>
                <ChevronRight color="#AAB0C4" size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Bell color="#4C66EE" size={20} />
                </View>
                <Text style={styles.settingText}>Notifications</Text>
                <ChevronRight color="#AAB0C4" size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Moon color="#4C66EE" size={20} />
                </View>
                <Text style={styles.settingText}>Theme</Text>
                <ChevronRight color="#AAB0C4" size={20} />
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <Text style={styles.sectionTitle}>Support</Text>
            
            <View style={styles.settingsContainer}>
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <HelpCircle color="#4C66EE" size={20} />
                </View>
                <Text style={styles.settingText}>Help Center</Text>
                <ChevronRight color="#AAB0C4" size={20} />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.settingItem}>
                <View style={styles.settingIconContainer}>
                  <Settings color="#4C66EE" size={20} />
                </View>
                <Text style={styles.settingText}>Privacy Settings</Text>
                <ChevronRight color="#AAB0C4" size={20} />
              </TouchableOpacity>
            </View>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.signOutButton}
            onPress={handleSignOut}
            disabled={signingOut}
          >
            {signingOut ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <LogOut color="#FFF" size={20} style={{ marginRight: 8 }} />
                <Text style={styles.signOutText}>Sign Out</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
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
  header: {
    padding: 20,
    paddingTop: 30,
    paddingBottom: 30,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontFamily: 'Poppins-Bold',
    fontSize: 22,
    color: '#FFF',
    marginBottom: 4,
  },
  joinedDate: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'Poppins-Bold',
    fontSize: 20,
    color: '#FFF',
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  statDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    marginTop: 8,
  },
  settingsContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 24,
    shadowColor: '#6E78B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F2F8',
  },
  settingIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF1FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingText: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#FF4D4D',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  signOutText: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#FFF',
  },
});


