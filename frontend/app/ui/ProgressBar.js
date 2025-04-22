import React, { useEffect } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import theme from '../constants/theme';

const ProgressBar = ({ 
  progress, 
  height = 6, 
  fillColor = theme.colors.primary,
  animated = true,
  style,
}) => {
  const animatedWidth = new Animated.Value(0);
  
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated]);
  
  const width = animated 
    ? animatedWidth.interpolate({
        inputRange: [0, 1],
        outputRange: ['0%', '100%'],
      }) 
    : `${progress * 100}%`;
  
  return (
    <View style={[styles.container, { height }, style]}>
      <Animated.View
        style={[
          styles.fill,
          {
            width,
            backgroundColor: fillColor,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: theme.colors.buttonSecondary,
    borderRadius: 8,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 8,
  },
});

export default ProgressBar;