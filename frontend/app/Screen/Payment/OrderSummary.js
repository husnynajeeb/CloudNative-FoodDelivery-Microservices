import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '../styles/typography';
import { colors } from '../styles/colors';

const OrderSummary = ({
  subtotal,
  tax = 0,
  delivery = 0,
  total,
  currency = 'LKR'
}) => {
  // Format currency
  const formatCurrency = (amount) => {
    return `${currency} ${amount.toFixed(2)}`;
  };
  
  return (
    <View style={styles.container}>
      <Text style={[typography.h5, styles.title]}>Order Summary</Text>
      
      <View style={styles.row}>
        <Text style={typography.bodyMedium}>Subtotal</Text>
        <Text style={typography.bodyMedium}>{formatCurrency(subtotal)}</Text>
      </View>
      
      {tax > 0 && (
        <View style={styles.row}>
          <Text style={typography.bodyMedium}>Tax</Text>
          <Text style={typography.bodyMedium}>{formatCurrency(tax)}</Text>
        </View>
      )}
      
      {delivery > 0 && (
        <View style={styles.row}>
          <Text style={typography.bodyMedium}>Delivery</Text>
          <Text style={typography.bodyMedium}>{formatCurrency(delivery)}</Text>
        </View>
      )}
      
      <View style={[styles.row, styles.totalRow]}>
        <Text style={[typography.h5, styles.totalLabel]}>Total</Text>
        <Text style={[typography.h5, styles.totalValue]}>{formatCurrency(total)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  totalLabel: {
    color: colors.gray[900],
  },
  totalValue: {
    color: colors.primary[600],
  },
});

export default OrderSummary;