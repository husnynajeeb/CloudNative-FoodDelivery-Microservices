// components/ui/Input.jsx
import React, { useState, useRef } from 'react';
import { 
  View, 
  TextInput, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  Animated,
  Platform
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';

export default function Input({
  label,
  error,
  containerStyle,
  inputStyle,
  icon,
  showPasswordToggle = false,
  secureTextEntry,
  onFocus,
  onBlur,
  value,
  ...props
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const animatedLabelPosition = useRef(new Animated.Value(value ? 1 : 0)).current;
  const inputRef = useRef(null);

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
    
    Animated.timing(animatedLabelPosition, {
      toValue: 1,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
    
    if (!value) {
      Animated.timing(animatedLabelPosition, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const labelStyle = {
    position: 'absolute',
    left: icon ? 44 : 16,
    top: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, -8],
    }),
    fontSize: animatedLabelPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [16, 12],
    }),
    color: error 
      ? '#DC2626'
      : isFocused 
        ? '#3563E9'
        : '#6B7280',
    backgroundColor: 'white',
    paddingHorizontal: 4,
    zIndex: 1,
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <Animated.Text
        style={[labelStyle, labelStyle]}
        onPress={() => inputRef.current?.focus()}
      >
        {label}
      </Animated.Text>
      
      <View style={styles.inputContainer}>
        {icon && <View style={styles.iconLeft}>{icon}</View>}
        
        <TextInput
          ref={inputRef}
          style={[
            styles.input,
            icon && styles.inputWithLeftIcon,
            (showPasswordToggle || error) && styles.inputWithRightIcon,
            isFocused && styles.inputFocused,
            error && styles.inputError,
            inputStyle
          ]}
          onFocus={handleFocus}
          onBlur={handleBlur}
          secureTextEntry={secureTextEntry && !passwordVisible}
          placeholderTextColor="#9CA3AF"
          value={value}
          {...props}
        />
        
        {showPasswordToggle && (
          <TouchableOpacity 
            style={styles.iconRight} 
            onPress={() => setPasswordVisible(!passwordVisible)}
          >
            {passwordVisible ? (
              <EyeOff size={18} color="#6B7280" />
            ) : (
              <Eye size={18} color="#6B7280" />
            )}
          </TouchableOpacity>
        )}
      </View>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    position: 'relative',
  },
  inputContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    flex: 1,
    backgroundColor: 'white',
    ...(Platform.OS === 'web' ? {
      outlineStyle: 'none',
    } : {}),
  },
  inputWithLeftIcon: {
    paddingLeft: 56,
  },
  inputWithRightIcon: {
    paddingRight: 48,
  },
  inputFocused: {
    borderColor: '#3563E9',
    borderWidth: 2,
  },
  inputError: {
    borderColor: '#DC2626',
    borderWidth: 2,
  },
  iconLeft: {
    position: 'absolute',
    left: 16,
    zIndex: 1,
  },
  iconRight: {
    position: 'absolute',
    right: 16,
    zIndex: 1,
  },
  errorText: {
    marginTop: 4,
    color: '#DC2626',
    fontSize: 12,
  },
});
