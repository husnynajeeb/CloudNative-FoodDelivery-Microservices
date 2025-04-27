import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';

const useAuthStore = create((set) => ({
  user: null,
  token: null,
  login: async (token, user) => {
    await SecureStore.setItemAsync('token', token);
    set({ token, user });
    console.log('User logged in:', user);
  },
  logout: async () => {
    await SecureStore.deleteItemAsync('token');
    set({ token: null, user: null });
  }
}));

export default useAuthStore;
