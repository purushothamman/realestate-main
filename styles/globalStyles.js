// styles/globalStyles.js
import { Platform, StyleSheet } from 'react-native';

export const createStyles = (styles) => {
  const webStyles = {};
  
  Object.keys(styles).forEach(key => {
    const style = styles[key];
    
    // Convert shadow props to boxShadow for web
    if (Platform.OS === 'web' && style.shadowColor) {
      const { shadowColor, shadowOffset, shadowOpacity, shadowRadius, ...rest } = style;
      const offsetX = shadowOffset?.width || 0;
      const offsetY = shadowOffset?.height || 0;
      const rgba = `rgba(0, 0, 0, ${shadowOpacity || 0.25})`;
      
      webStyles[key] = {
        ...rest,
        boxShadow: `${offsetX}px ${offsetY}px ${shadowRadius || 4}px ${rgba}`
      };
    } else {
      webStyles[key] = style;
    }
  });
  
  return StyleSheet.create(webStyles);
};