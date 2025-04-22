import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from 'react-native';

const PaymentScreen = () => {
  const [selected, setSelected] = useState(null);

  const paymentMethods = [
    {
      id: '1',
      title: 'Visa ending in 1234',
      masked: '**** **** **** 1234',
    },
    {
      id: '2',
      title: 'Mastercard ending in 5678',
      masked: '**** **** **** 5678',
    },
    {
      id: '3',
      title: 'PayPal',
      masked: '',
    },
  ];

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.methodItem}
      onPress={() => setSelected(item.id)}
    >
      <View>
        <Text style={styles.masked}>{item.masked}</Text>
        {item.title !== 'PayPal' && (
          <Text style={styles.subText}>{item.title}</Text>
        )}
      </View>
      {selected === item.id && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Payment</Text>
      <Text style={styles.subHeader}>Choose a payment method</Text>
      <FlatList
        data={paymentMethods}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        style={styles.list}
      />
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText}>Add Payment Method</Text>
      </TouchableOpacity>
    </View>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#F8FAFC',
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  methodItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  masked: {
    fontSize: 16,
    fontWeight: '500',
  },
  subText: {
    fontSize: 13,
    color: '#64748B',
  },
  checkmark: {
    fontSize: 20,
    color: '#22C55E',
    fontWeight: 'bold',
  },
  button: {
    marginTop: 'auto',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 30,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
