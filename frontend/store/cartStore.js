import { create } from 'zustand';

const useCartStore = create((set, get) => ({
  cartItems: [],
  restaurantId: null,
  restaurantName: '',
  
  addToCart: (item, restaurantInfo = {}) => {
    const existingItem = get().cartItems.find(i => i._id === item._id);
    
    if (existingItem) {
      set(state => ({
        cartItems: state.cartItems.map(i =>
          i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }));
    } else {
      set(state => ({
        cartItems: [...state.cartItems, { ...item, quantity: 1 }],
        restaurantId: restaurantInfo.id || get().restaurantId,
        restaurantName: restaurantInfo.name || get().restaurantName,
      }));
    }
  },

  incrementItem: (itemId) => {
    set(state => ({
      cartItems: state.cartItems.map(i =>
        i._id === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    }));
  },

  decrementItem: (itemId) => {
    set(state => ({
      cartItems: state.cartItems.map(i =>
        i._id === itemId
          ? { ...i, quantity: Math.max(i.quantity - 1, 0) }
          : i
      ).filter(i => i.quantity > 0)
    }));
  },

  clearCart: () => set({ cartItems: [], restaurantId: null, restaurantName: '' }),
}));

export default useCartStore;
