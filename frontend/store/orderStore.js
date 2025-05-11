import { create } from 'zustand';
import axios from '../lib/axiosOrder'; // axios instance pointing to ORDER SERVICE
import useAuthStore from './authStore';

const useOrderStore = create((set) => ({
  activeOrder: [],
  completedOrders: [],
  loading: false,

  fetchOrders: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      console.log('Fetching active and completed orders...');

      const [activeRes, completedRes] = await Promise.all([
        axios.get(`/orders/customer/${user.id}/active/all`),
        axios.get(`/orders/customer/${user.id}/completed`)
      ]);

      set({
        activeOrder: activeRes.data.orders || [],
        completedOrders: completedRes.data.orders || []  // ✅ correct the nested property
      });

    } catch (err) {
      console.error('❌ Failed fetching orders:', err.message);
    }
  }
}));

export default useOrderStore;
