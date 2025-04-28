import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  Easing
} from 'react-native-reanimated';

const Header = ({ title, onBack, rightElement }) => {
  const backScale = useSharedValue(1);
  
  const animatedBackStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: backScale.value }]
    };
  });
  
  const handleBackPress = () => {
    backScale.value = withTiming(0.9, {
      duration: 100,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    }, () => {
      backScale.value = withTiming(1, {
        duration: 100,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    });
    
    if (onBack) {
      onBack();
    }
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {onBack && (
          <Animated.View style={[styles.backButtonContainer, animatedBackStyle]}>
            <TouchableOpacity 
              onPress={handleBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={24} color="#1F2937" />
            </TouchableOpacity>
          </Animated.View>
        )}
        
        <View style={styles.titleContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
        </View>
        
        {rightElement ? (
          <View style={styles.rightElementContainer}>
            {rightElement}
          </View>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === 'ios' ? 88 : 64,
    paddingTop: Platform.OS === 'ios' ? 44 : 0,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    ...Platform.select({
      ios: {
        shadowColor: '#111827',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      },
    }),
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
  },
  titleContainer: {
    position: 'absolute',
    left: 56,
    right: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    color: '#1F2937',
  },
  rightElementContainer: {
    width: 40,
    alignItems: 'flex-end',
  },
  placeholder: {
    width: 40,
  },
});

export default Header;