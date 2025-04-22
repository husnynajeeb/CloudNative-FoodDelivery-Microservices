// components/ui/Button.jsx
import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  ActivityIndicator,
  StyleSheet 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export default function Button({ 
  title, 
  variant = 'primary', 
  fullWidth = true,
  loading = false,
  disabled = false,
  style,
  textStyle,
  onPress,
  ...props 
}) {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));
  
  const handlePressIn = () => {
    scale.value = withTiming(0.98, { 
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
  };
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { 
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
  };
  
  return (
    <AnimatedTouchable
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        variant === 'primary' && styles.primaryButton,
        variant === 'outline' && styles.outlineButton,
        variant === 'text' && styles.textButton,
        (disabled || loading) && styles.disabledButton,
        style,
        animatedStyle
      ]}
      onPress={loading || disabled ? undefined : onPress}
      activeOpacity={0.8}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...props}
    >
      {loading ? (
        <ActivityIndicator 
          size="small" 
          color={variant === 'primary' ? '#fff' : '#3563E9'} 
        />
      ) : (
        <Text style={[
          styles.text,
          variant === 'primary' && styles.primaryText,
          variant === 'outline' && styles.outlineText,
          variant === 'text' && styles.textButtonText,
          (disabled || loading) && styles.disabledText,
          textStyle
        ]}>
          {title}
        </Text>
      )}
    </AnimatedTouchable>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#3563E9',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3563E9',
  },
  textButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  disabledButton: {
    backgroundColor: '#E5E7EB',
    borderColor: '#E5E7EB',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#fff',
  },
  outlineText: {
    color: '#3563E9',
  },
  textButtonText: {
    color: '#3563E9',
  },
  disabledText: {
    color: '#9CA3AF',
  },
});
