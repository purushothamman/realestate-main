// utils/animations.js
import { Platform } from 'react-native';

export const getAnimationConfig = (config) => ({
  ...config,
  useNativeDriver: Platform.OS !== 'web'
});

// Usage
Animated.timing(animatedValue, getAnimationConfig({
  toValue: 1,
  duration: 300
})).start();globalStyles.js