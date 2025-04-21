import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Award, Lock } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  unlocked: boolean;
}

interface BadgeItemProps {
  badge: Badge;
  isNew?: boolean;
}

export const BadgeItem: React.FC<BadgeItemProps> = ({ badge, isNew = false }) => {
  const scale = useSharedValue(isNew ? 0.8 : 1);
  
  // Animation for new badges
  React.useEffect(() => {
    if (isNew) {
      scale.value = withSpring(1.1, { damping: 8 });
      setTimeout(() => {
        scale.value = withSpring(1, { damping: 8 });
      }, 300);
    }
  }, [isNew]);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        { backgroundColor: badge.unlocked ? `${badge.color}15` : '#F5F5F5' },
        animatedStyle
      ]}
    >
      <View style={[styles.iconContainer, { backgroundColor: badge.unlocked ? badge.color : '#E0E0E0' }]}>
        {badge.unlocked ? (
          <Award color="#FFF" size={26} />
        ) : (
          <Lock color="#AAA" size={22} />
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={[
          styles.name, 
          { color: badge.unlocked ? badge.color : '#999' }
        ]}>
          {badge.name}
        </Text>
        
        <Text style={[
          styles.description,
          !badge.unlocked && styles.lockedDescription
        ]}>
          {badge.description}
        </Text>
      </View>
      
      {isNew && (
        <View style={styles.newBadge}>
          <Text style={styles.newText}>NEW</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  name: {
    fontFamily: 'Inter-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  description: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  lockedDescription: {
    color: '#999',
  },
  newBadge: {
    backgroundColor: '#FF8C42',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    position: 'absolute',
    top: 10,
    right: 10,
  },
  newText: {
    fontFamily: 'Inter-Bold',
    fontSize: 10,
    color: '#FFF',
  },
});