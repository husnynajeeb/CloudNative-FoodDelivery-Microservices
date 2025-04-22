import React from 'react';
import { Text, StyleSheet, TouchableOpacity } from 'react-native';
import theme from '../constants/theme';

const LinkText = ({ 
  text, 
  onPress, 
  color = theme.colors.primary,
  fontSize = 14,
  underline = false,
  style 
}) => {
  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={styles.container}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.text, 
        { 
          color, 
          fontSize,
          textDecorationLine: underline ? 'underline' : 'none'
        },
        style
      ]}>
        {text}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 4,
  },
  text: {
    fontFamily: theme.typography.fontFamily.medium,
  },
});

export default LinkText;