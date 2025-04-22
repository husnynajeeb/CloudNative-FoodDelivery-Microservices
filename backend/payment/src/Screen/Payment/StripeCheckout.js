// StripeCheckoutScreen.js
import React, { useState } from 'react';
import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useLocalSearchParams } from 'expo-router';

const SERVER_URL = 'http://192.168.42.110:5000'; // Replace with your backend

const StripeCheckoutScreen = ({ route, navigation }) => {
  const { _id } = useLocalSearchParams();
  const [checkoutUrl, setCheckoutUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  const createCheckoutSession = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/payments/create-checkout-session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: _id, amount: 1000 }) // Use dynamic amount and order ID
      });
      

      // Log the response to check if URL is returned
      const data = await response.json();
      console.log('Backend response:', data);  // <-- Log this
  
      const { url } = data;
      if (url) {
        setCheckoutUrl(url);
      } else {
        console.error('No URL returned from backend');
      }
    } catch (error) {
      console.error('Stripe session error:', error);
    }
    setLoading(false);
  };
  

  const handleWebViewNavigation = (event) => {
    if (event.url.includes('success')) {
      navigation.replace('SuccessScreen'); // Or go back, show confirmation, etc.
    } else if (event.url.includes('cancel')) {
      navigation.goBack();
    }
  };

  if (checkoutUrl) {
    return (
      <WebView
        source={{ uri: checkoutUrl }}
        onNavigationStateChange={handleWebViewNavigation}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" />}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Complete your payment</Text>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="Pay with Stripe" onPress={createCheckoutSession} />
      )}
    </View>
  );
};

export default StripeCheckoutScreen;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 18, marginBottom: 20 },
});
