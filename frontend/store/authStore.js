import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set) => ({
  user: null,
  token: null,

  login: async (token, user) => {
    if (token) await SecureStore.setItemAsync('token', token);
    if (user) await SecureStore.setItemAsync('user', JSON.stringify(user));
    set({ token, user });
  },
  
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    set({ token: null, user: null });
    console.log('🚪 User logged out');
  },

  restoreSession: async () => {
    const token = await SecureStore.getItemAsync('token');
    const userStr = await SecureStore.getItemAsync('user');
    const user = userStr ? JSON.parse(userStr) : null;
    set({ token, user });
    console.log('🔁 Session restored:', { token, user });
  },
}));

export default useAuthStore;