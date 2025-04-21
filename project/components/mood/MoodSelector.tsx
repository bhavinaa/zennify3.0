import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

type MoodType = 'terrible' | 'bad' | 'okay' | 'good' | 'great';

interface MoodOption {
  value: MoodType;
  emoji: string;
  label: string;
  color: string;
}

interface MoodSelectorProps {
  onSelect: (mood: MoodType) => void;
  selectedMood: MoodType | null;
}

const moods: MoodOption[] = [
  { value: 'terrible', emoji: '😞', label: 'Terrible', color: '#F87171' },
  { value: 'bad', emoji: '😔', label: 'Bad', color: '#FB923C' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: '#FBBF24' },
  { value: 'good', emoji: '🙂', label: 'Good', color: '#34D399' },
  { value: 'great', emoji: '😄', label: 'Great', color: '#60A5FA' },
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ onSelect, selectedMood }) => {
  const scales = moods.map(() => useSharedValue(1));
  
  const handlePress = (mood: MoodType, index: number) => {
    // Animate the selected emoji
    scales[index].value = withSpring(1.2, { damping: 10 });
    setTimeout(() => {
      scales[index].value = withSpring(1);
    }, 200);
    
    onSelect(mood);
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.question}>How are you feeling today?</Text>
      
      <View style={styles.moodContainer}>
        {moods.map((mood, index) => {
          const isSelected = selectedMood === mood.value;
          
          // Create animated style for this mood
          const animatedStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: scales[index].value }],
            };
          });
          
          return (
            <TouchableOpacity
              key={mood.value}
              onPress={() => handlePress(mood.value, index)}
              style={styles.moodOption}
            >
              <Animated.View 
                style={[
                  styles.emojiContainer, 
                  { backgroundColor: isSelected ? mood.color : '#F5F7FF' },
                  animatedStyle
                ]}
              >
                <Text style={styles.emoji}>{mood.emoji}</Text>
              </Animated.View>
              <Text style={[
                styles.moodLabel,
                isSelected && { color: mood.color, fontFamily: 'Inter-Bold' }
              ]}>
                {mood.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#6E78B8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  question: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  moodContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  moodOption: {
    alignItems: 'center',
  },
  emojiContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  emoji: {
    fontSize: 28,
  },
  moodLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});