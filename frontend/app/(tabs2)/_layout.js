import { Tabs } from 'expo-router/tabs';
import { Utensils, CircleCheck } from 'lucide-react-native';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import useAuthStore from '../../store/authStore';

export default function TabLayout() {
  const { token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    useAuthStore.getState().restoreSession();
  }, []);

  useEffect(() => {
    if (!token) {
      router.replace('/');
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
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <Utensils size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="status"
        options={{
          title: 'Status',
          tabBarIcon: ({ color }) => <CircleCheck size={22} color={color} />,
        }}
      />
    </Tabs>
  );
}
