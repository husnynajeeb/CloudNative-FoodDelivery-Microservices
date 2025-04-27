import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text } from 'react-native';
import RestaurantCard from '../app/ui/RestaurantCard';
import axios from '../lib/axiosOrder';
import { useRouter } from 'expo-router';


export default function HomeScreen() {
  const [restaurants, setRestaurants] = useState([]);
  const router = useRouter();


  useEffect(() => {
    axios.get('/orders/restaurants-with-menus')
      .then(res => setRestaurants(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: 16 }}
        renderItem={({ item }) => (
          <RestaurantCard
            image="https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg"
            name={item.businessName}
            onPress={() => router.push({
              pathname: `/restaurant/${item._id}`,
              params: { name: item.businessName }
            })}
            

          />
        )}
        ListEmptyComponent={<Text style={styles.empty}>No restaurants available</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  empty: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888'
  }
});
