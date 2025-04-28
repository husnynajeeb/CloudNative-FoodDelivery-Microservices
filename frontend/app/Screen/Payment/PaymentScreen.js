import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import axios from 'axios';
import { colors } from '../styles/colors';
import { typography } from '../styles/typography';
import Button from '../ui/Button';
import PaymentMethodSelector from './PaymentMethodSelector';
import OrderSummary from './OrderSummary';
import Header from '../ui/Header';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  runOnJS,
} from 'react-native-reanimated';
import { Check } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

const API_URL = 'http://192.168.42.110:5003';

const PaymentScreen = () => {
  const navigation = useNavigation();
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isLoading, setIsLoading] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('visa');
  
  const successOpacity = useSharedValue(0);
  const successScale = useSharedValue(0.8);

  const userData = {
    email: 'afhamnaleef5@gmail.com', // Get from your auth system
    phone: '+94787880906'            // Get from user profile
  };
  
  // Order details (should come from props or state)
  const orderDetails = {
    subtotal: 850,
    tax: 85,
    delivery: 65,
    total: 1000,
    currency: 'LKR',
  };
  
  const paymentMethods = [
    {
      id: 'visa',
      name: 'Card',
      type: 'card',
      description: 'Pay using your credit or debit card',
    },
  ];

  const animatedSuccessStyle = useAnimatedStyle(() => ({
    opacity: successOpacity.value,
    transform: [{ scale: successScale.value }],
  }));
  
  const showSuccessAnimation = (callback) => {
    successOpacity.value = withTiming(1, { duration: 300 });
    successScale.value = withSequence(
      withTiming(1.2, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
    
    setTimeout(() => {
      successOpacity.value = withTiming(0);
      successScale.value = withTiming(0.8);
      callback?.();
    }, 2000);
  };

  const handlePayment = async () => {
    try {
      if (!selectedMethod) {
        Alert.alert('Error', 'Please select a payment method');
        return;
      }
  
      setIsLoading(true);
      console.log(userData.email, userData.phone);
  
      // 1. Create payment intent
      const response = await axios.post(`${API_URL}/payments/initiate`, {
        amount: orderDetails.total,
        currency: orderDetails.currency.toLowerCase(),
        customerEmail: userData.email,
        customerPhone: userData.phone
      });
  
      // 2. Initialize payment sheet
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'My Food App',
        paymentIntentClientSecret: response.data.clientSecret,
        returnURL: 'myfoodapp://stripe-redirect',
        defaultBillingDetails: { name: 'Customer Name' }
      });
  
      if (error) {
        setIsLoading(false);
        Alert.alert('Error', error.message);
        return;
      }
  
      // 3. Present payment sheet
      const { error: paymentError } = await presentPaymentSheet();
  
      if (paymentError) {
        setIsLoading(false);
        if (paymentError.code !== 'Canceled') {
          Alert.alert('Error', paymentError.message);
        }
        return;
      }
  
      // ✅ Webhook handles this now — no need to confirm manually
      /*
      const confirmResponse = await axios.post(`${API_URL}/payments/confirm`, {
        paymentIntentId: response.data.paymentIntentId
      });
  
      if (confirmResponse.data.success) {
        setIsPaymentComplete(true);
        runOnJS(showSuccessAnimation)(() => {
          navigation.navigate('OrderConfirmation', { 
            paymentId: confirmResponse.data.paymentId 
          });
        });
      } else {
        Alert.alert('Error', 'Payment confirmation failed');
        setIsLoading(false);
      }
      */
  
      // ✅ TEMP success screen — wait for webhook to handle real logic
      setIsPaymentComplete(true);
      runOnJS(showSuccessAnimation)(() => {
        navigation.navigate('OrderConfirmation');
      });
  
    } catch (error) {
      setIsLoading(false);
      console.error('Payment error:', error);
      Alert.alert('Error', error.response?.data?.error || error.message || 'Payment failed');
    }
  };
  

  return (
    <View style={styles.container}>
      <Header title="Payment" onBack={() => navigation.goBack()} />
      
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {isPaymentComplete && (
          <Animated.View style={[styles.successContainer, animatedSuccessStyle]}>
            <View style={styles.successIconContainer}>
              <Check color={colors.white} size={48} strokeWidth={3} />
            </View>
            <Text style={[typography.h3, styles.successText]}>
              Payment Successful!
            </Text>
          </Animated.View>
        )}

        <View style={styles.paymentContainer}>
          <OrderSummary {...orderDetails} />
          
          <PaymentMethodSelector
            methods={paymentMethods}
            selectedMethod={selectedMethod}
            onSelectMethod={setSelectedMethod}
          />
          
          <Text style={[typography.caption, styles.disclaimer]}>
            Your payment information is securely processed by Stripe. 
            We do not store your card details.
          </Text>
          
          <Button
            title={isLoading ? 'Processing...' : 'Pay Now'}
            onPress={handlePayment}
            disabled={isLoading || !selectedMethod}
            loading={isLoading}
            size="large"
            fullWidth
            style={styles.payButton}
          />
        </View>
      </ScrollView>
    </View>
  );
};



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  paymentContainer: {
    opacity: 1,
  },
  disclaimer: {
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 24,
    color: colors.gray[600],
  },
  payButton: {
    marginTop: 8,
  },
  successContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 10,
  },
  successIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  successText: {
    color: colors.success[600],
    marginTop: 16,
  },
  header: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    position: 'relative', // Important for absolute positioning of title
  },
  backButton: {
    zIndex: 2, // Ensure it's clickable
  },
  headerTitle: {
    position: 'absolute',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
  },
  
  
});

export default PaymentScreen;