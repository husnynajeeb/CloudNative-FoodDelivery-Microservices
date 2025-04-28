import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import RadioButton from '../ui/RadioButton';
import { typography } from '../styles/typography';
import { colors } from '../styles/colors';
import { CreditCard } from 'lucide-react-native';

const PaymentMethodSelector = ({
  methods,
  selectedMethod,
  onSelectMethod,
}) => {
  return (
    <View style={styles.container}>
      <Text style={[typography.h5, styles.title]}>Select Payment Method</Text>
      
      {methods.map((method) => {
        let icon = method.icon;
        
        if (!icon && method.type === 'card') {
          if (method.cardType === 'visa') {
            icon = <CreditCard color={colors.primary[500]} size={24} />;
          } else if (method.cardType === 'mastercard') {
            icon = <CreditCard color={colors.primary[500]} size={24} />;
          } else if (method.cardType === 'amex') {
            icon = <CreditCard color={colors.primary[500]} size={24} />;
          } else if (method.cardType === 'discover') {
            icon = <CreditCard color={colors.primary[500]} size={24} />;
          } else {
            icon = <CreditCard color={colors.primary[500]} size={24} />;
          }
        }
        
        return (
          <RadioButton
            key={method.id}
            label={method.name}
            value={method.id}
            isSelected={selectedMethod === method.id}
            onSelect={onSelectMethod}
            icon={icon}
            description={method.description}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 16,
  },
});

export default PaymentMethodSelector;