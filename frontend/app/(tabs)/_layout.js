import { Tabs } from 'expo-router/tabs';
import { Home, ClipboardList, User, Bike } from 'lucide-react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';

export default function TabLayout() {
  const { token } = useAuthStore(); // ✅ reactively track token
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  // ✅ Redirect to login (index.js) if user logs out or token is cleared
  useEffect(() => {
    if (!token) {
      router.replace("/");
    }
  }, [token]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#111',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          height: 70,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Home size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          title: 'Orders',
          tabBarIcon: ({ color }) => <ClipboardList size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="track"
        options={{
          title: 'Tracking',
          tabBarIcon: ({ color }) => <Bike size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <User size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
