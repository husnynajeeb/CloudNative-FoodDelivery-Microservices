import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
} from 'react-native';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import Animated, { 
  useAnimatedStyle, 
  withTiming,
  useSharedValue,
  Easing
} from 'react-native-reanimated';

const RadioButton = ({
  label,
  value,
  isSelected,
  onSelect,
  icon,
  description,
  style,
  labelStyle,
}) => {
  const scale = useSharedValue(1);
  const innerCircleScale = useSharedValue(isSelected ? 1 : 0);
  const containerBorderColor = useSharedValue(isSelected ? colors.primary[500] : colors.gray[300]);
  
  React.useEffect(() => {
    containerBorderColor.value = withTiming(
      isSelected ? colors.primary[500] : colors.gray[300],
      { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
    );
    
    innerCircleScale.value = withTiming(
      isSelected ? 1 : 0,
      { duration: 200, easing: Easing.bezier(0.25, 0.1, 0.25, 1) }
    );
  }, [isSelected]);
  
  const handlePress = () => {
    scale.value = withTiming(0.95, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 });
    });
    onSelect(value);
  };
  
  const animatedContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    borderColor: containerBorderColor.value,
  }));
  
  const animatedInnerCircleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: innerCircleScale.value }],
    opacity: innerCircleScale.value,
  }));
  
  return (
    <Animated.View style={[styles.container, animatedContainerStyle, style]}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={handlePress}
        style={styles.touchable}
      >
        <View style={styles.contentContainer}>
          <View style={styles.radioContainer}>
            <View style={styles.radioOuter}>
              <Animated.View style={[styles.radioInner, animatedInnerCircleStyle]} />
            </View>
          </View>
          
          <View style={styles.labelContainer}>
            {icon && <View style={styles.iconContainer}>{icon}</View>}
             <View>
              <Text style={[typography.bodyMedium, styles.label, labelStyle]}>{label}</Text>
              {description && (
                <Text style={typography.caption}>{description}</Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: 12,
    borderColor: colors.gray[300],
    backgroundColor: colors.white,
    marginBottom: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  touchable: {
    padding: 16,
    borderRadius: 12,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radioOuter: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: colors.primary[500],
  },
  labelContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    marginRight: 12,
  },
  label: {
    fontWeight: '500',
  },
});

export default RadioButton;