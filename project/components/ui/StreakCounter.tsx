import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface StreakCounterProps {
  days: number;
}

export const StreakCounter: React.FC<StreakCounterProps> = ({ days }) => {
  const scale = useSharedValue(1);
  
  // Create animated style for the bounce effect
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });
  
  // Bounce animation when component mounts
  React.useEffect(() => {
    scale.value = withSpring(1.1, { damping: 4 });
    setTimeout(() => {
      scale.value = withSpring(1, { damping: 4 });
    }, 300);
  }, [days]);
  
  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <View style={styles.iconContainer}>
        <Calendar color="#FF8C42" size={20} />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.label}>Current Streak</Text>
        <Text style={styles.days}>{days} {days === 1 ? 'day' : 'days'}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF6ED',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#FF8C42',
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
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: '#8E6245',
  },
  days: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#FF8C42',
  },
});