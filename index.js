import { registerRootComponent } from 'expo';

import App from './App';
import { LogBox } from 'react-native';

LogBox.ignoreLogs([
  'Animated: `useNativeDriver`',
  'shadow* style props are deprecated',
  'Invalid style property',
  'props.pointerEvents is deprecated'
]);

// React Native Web prints some warnings to the browser console (not LogBox).
// Filter known noisy deprecation warnings until upstream libs remove them.
if (typeof window !== 'undefined') {
  const originalWarn = console.warn;
  console.warn = (...args) => {
    const first = args?.[0];
    if (typeof first === 'string' && first.includes('props.pointerEvents is deprecated')) return;
    return originalWarn(...args);
  };
}
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
