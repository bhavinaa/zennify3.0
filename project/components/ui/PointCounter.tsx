import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Star } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface PointCounterProps {
  points: number;
  level: number;
}

export const PointCounter: React.FC<PointCounterProps> = ({ points, level }) => {
  const scale = useSharedValue(1);
  
  // Create animated style for the bounce effect
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  // Calculate progress to next level (simplified)
  const pointsToNextLevel = level * 100;
  const progress = Math.min((points / pointsToNextLevel) * 100, 100);
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.iconContainer}>
        <Star color="#5E6CE5" size={20} fill="#5E6CE5" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Level {level}</Text>
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <Text style={styles.pointsText}>{points}/{pointsToNextLevel} XP</Text>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF1FF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#4C66EE',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    color: '#4C66EE',
    marginBottom: 4,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBackground: {
    height: 8,
    flex: 1,
    backgroundColor: '#D9DEFF',
    borderRadius: 4,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4C66EE',
    borderRadius: 4,
  },
  pointsText: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#7986E6',
    width: 80,
    textAlign: 'right',
  },
});