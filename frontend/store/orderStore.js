import { create } from 'zustand';
import axios from '../lib/axiosOrder'; // 🔥 axios instance pointing to ORDER SERVICE
import useAuthStore from './authStore'; // 🔥 to get token & user

const useOrderStore = create((set) => ({
  activeOrder: null,
  completedOrders: [],
  loading: false,

  fetchOrders: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    try {
      set({ loading: true });

      // Fetch active order
      const activeRes = await axios.get(`/orders/customer/${user._id}/active`);
      set({ activeOrder: activeRes.data.order });

    } catch (err) {
      console.log('No active order or error fetching active order.');
      set({ activeOrder: null });
    }

    try {
      // Fetch completed orders
      const completedRes = await axios.get(`/orders/customer/${user._id}/completed`);
      set({ completedOrders: completedRes.data });
    } catch (err) {
      console.error('Error fetching completed orders:', err.message);
      set({ completedOrders: [] });
    }

    set({ loading: false });
  },
}));

export default useOrderStore;