import { Quest } from '@/components/quests/QuestCard';

// Generate a random ID
const generateId = () => Math.random().toString(36).substring(2, 10);

// Default quests
export const defaultQuests: Quest[] = [
  {
    id: generateId(),
    title: 'Morning Meditation',
    description: 'Take 5 minutes to focus on your breath and set intentions for the day.',
    points: 15,
    type: 'meditation',
    completed: false,
    timeEstimate: '5 min'
  },
  {
    id: generateId(),
    title: 'Gratitude Journal',
    description: 'Write down three things you are grateful for today.',
    points: 10,
    type: 'gratitude',
    completed: false,
    timeEstimate: '3 min'
  },
  {
    id: generateId(),
    title: 'Mindful Walking',
    description: 'Take a 10-minute walk and focus on your surroundings and sensations.',
    points: 20,
    type: 'mindfulness',
    completed: false,
    timeEstimate: '10 min'
  },
  {
    id: generateId(),
    title: 'Deep Breathing',
    description: '10 deep breaths with 4-second inhale, 7-second hold, 8-second exhale.',
    points: 10,
    type: 'meditation',
    completed: false,
    timeEstimate: '2 min'
  },
  {
    id: generateId(),
    title: 'Body Scan Exercise',
    description: 'Lie down and mentally scan your body from head to toe, noticing sensations.',
    points: 15,
    type: 'mindfulness',
    completed: false,
    timeEstimate: '8 min'
  },
  {
    id: generateId(),
    title: 'Quick Stretch Break',
    description: 'Stand up and stretch your muscles to release tension and boost energy.',
    points: 5,
    type: 'exercise',
    completed: false,
    timeEstimate: '2 min'
  }
];

// Badges data
export interface BadgeData {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: {
    type: 'streak' | 'quests' | 'moods' | 'registration';
    value: number;
  };
}

export const badgesData: BadgeData[] = [
  {
    id: 'newbie',
    name: 'Newbie',
    description: 'Welcome to your mental wellness journey!',
    icon: 'star',
    color: '#4C66EE',
    requirement: {
      type: 'registration',
      value: 1
    }
  },
  {
    id: 'streak-3',
    name: 'Consistency',
    description: 'Logged in for 3 days in a row',
    icon: 'calendar',
    color: '#FF8C42',
    requirement: {
      type: 'streak',
      value: 3
    }
  },
  {
    id: 'streak-7',
    name: 'Wellness Warrior',
    description: 'Maintained a 7-day streak',
    icon: 'award',
    color: '#60A5FA',
    requirement: {
      type: 'streak',
      value: 7
    }
  },
  {
    id: 'quests-10',
    name: 'Quest Master',
    description: 'Completed 10 wellness quests',
    icon: 'check-circle',
    color: '#34D399',
    requirement: {
      type: 'quests',
      value: 10
    }
  },
  {
    id: 'moods-5',
    name: 'Mood Tracker',
    description: 'Tracked your mood for 5 days',
    icon: 'smile',
    color: '#A78BFA',
    requirement: {
      type: 'moods',
      value: 5
    }
  },
  {
    id: 'streak-30',
    name: 'Wellness Guru',
    description: 'Maintained a 30-day streak',
    icon: 'trophy',
    color: '#F59E0B',
    requirement: {
      type: 'streak',
      value: 30
    }
  }
];