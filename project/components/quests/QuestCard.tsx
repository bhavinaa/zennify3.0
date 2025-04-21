import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Check, Clock, Dumbbell, Brain, Heart, Music } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming, Easing } from 'react-native-reanimated';

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  type: 'meditation' | 'exercise' | 'mindfulness' | 'gratitude' | 'mood';
  completed: boolean;
  timeEstimate: string;
}

interface QuestCardProps {
  quest: Quest;
  onComplete: (id: string) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // Get the correct icon for quest type
  const getQuestIcon = () => {
    switch(quest.type) {
      case 'meditation':
        return <Brain color="#4C66EE" size={22} />;
      case 'exercise':
        return <Dumbbell color="#4C66EE" size={22} />;
      case 'mindfulness':
        return <Heart color="#4C66EE" size={22} />;
      case 'gratitude':
        return <Music color="#4C66EE" size={22} />;
      default:
        return <Brain color="#4C66EE" size={22} />;
    }
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotateZ: `${rotation.value}deg` }
      ]
    };
  });
  
  const handleComplete = () => {
    if (quest.completed || isCompleting) return;
    
    setIsCompleting(true);
    
    // Animate card when completing
    scale.value = withSpring(0.95);
    rotation.value = withTiming(-2, { duration: 150 });
    
    setTimeout(() => {
      rotation.value = withTiming(2, { duration: 300 });
      setTimeout(() => {
        rotation.value = withTiming(0, { duration: 150 });
        scale.value = withSpring(1);
        onComplete(quest.id);
        setIsCompleting(false);
      }, 300);
    }, 150);
  };
  
  return (
    <Animated.View style={[styles.container, quest.completed && styles.completedContainer, animatedStyle]}>
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          {getQuestIcon()}
        </View>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsText}>+{quest.points} XP</Text>
        </View>
      </View>
      
      <Text style={styles.title}>{quest.title}</Text>
      <Text style={styles.description}>{quest.description}</Text>
      
      <View style={styles.footer}>
        <View style={styles.timeContainer}>
          <Clock size={14} color="#8892CA" />
          <Text style={styles.timeText}>{quest.timeEstimate}</Text>
        </View>
        
        <TouchableOpacity 
          style={[
            styles.completeButton, 
            quest.completed && styles.completedButton
          ]}
          onPress={handleComplete}
          disabled={quest.completed || isCompleting}
        >
          <Text style={[
            styles.completeButtonText,
            quest.completed && styles.completedButtonText
          ]}>
            {quest.completed ? 'Completed' : 'Complete'}
          </Text>
          {quest.completed && (
            <Check size={16} color="#FFF" style={styles.checkIcon} />
          )}
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#6E78B8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  completedContainer: {
    backgroundColor: '#F8F9FF',
    borderColor: '#E5E9FF',
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#EFF1FF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pointsContainer: {
    backgroundColor: '#EFF1FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  pointsText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4C66EE',
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontFamily: 'Inter-Regular',
    fontSize: 12,
    color: '#8892CA',
    marginLeft: 4,
  },
  completeButton: {
    backgroundColor: '#EFF1FF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  completedButton: {
    backgroundColor: '#4C66EE',
  },
  completeButtonText: {
    fontFamily: 'Inter-Bold',
    fontSize: 14,
    color: '#4C66EE',
  },
  completedButtonText: {
    color: '#FFF',
  },
  checkIcon: {
    marginLeft: 4,
  },
});