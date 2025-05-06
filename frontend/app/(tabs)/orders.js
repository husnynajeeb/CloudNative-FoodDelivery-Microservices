import { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import useOrderStore from '../../store/orderStore';
import { useRouter } from 'expo-router';

export default function OrdersPage() {
  const { fetchOrders, activeOrder, completedOrders } = useOrderStore();
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'completed'

  const router = useRouter();

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* 🧭 Header */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Orders</Text>
      </View>

      {/* 🧭 Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>🛒 Current</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>📁 Past</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ padding: 16 }}>
        {activeTab === 'active' ? (
          activeOrder.length > 0 ? (
            activeOrder.map(order => (
              <View key={order._id} style={styles.card}>
                <Text style={styles.title}>{order.restaurantName || 'Restaurant'}</Text>
                <Text>{order.status} • {order.items.length} items</Text>
                <Text>Total: LKR {order.totalAmount.toFixed(2)}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No active orders</Text>
          )
        ) : (
          completedOrders.length > 0 ? (
            completedOrders.map(order => (
              <View key={order._id} style={styles.card}>
                <Text style={styles.title}>{order.restaurantName || 'Restaurant'}</Text>
                <Text>
                  {new Date(order.createdAt).toLocaleDateString()} • LKR {order.totalAmount.toFixed(2)} • {order.items.length} items
                </Text>
                <Text>{order.items.map(i => i.name).join(', ')}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>No past orders</Text>
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    paddingTop: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#fff',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 16,
    color: '#888',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#000',
  },
  activeTabText: {
    fontWeight: '700',
    color: '#000',
  },
  card: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
});
