import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { cartAPI } from '../services/api';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      isLoading: false,
      isSynced: false, // Whether cart is synced with backend

      // Add item to cart (local + API if authenticated)
      addItem: async (product, quantity = 1) => {
        const items = get().items;
        const existingItem = items.find(item => item.id === product.id);

        // Update local state immediately
        if (existingItem) {
          set({
            items: items.map(item =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { ...product, quantity }] });
        }

        // Try to sync with backend (if user is logged in)
        try {
          const authData = localStorage.getItem('auth-storage');
          if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.state?.token) {
              await cartAPI.add(product.id, quantity);
            }
          }
        } catch (error) {
          console.log('Cart sync skipped (not logged in)');
        }
      },

      // Remove item from cart
      removeItem: async (productId) => {
        set({ items: get().items.filter(item => item.id !== productId) });

        // Sync with backend
        try {
          const authData = localStorage.getItem('auth-storage');
          if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.state?.token) {
              await cartAPI.remove(productId);
            }
          }
        } catch (error) {
          console.log('Cart sync skipped');
        }
      },

      // Update item quantity
      updateQuantity: async (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.id === productId ? { ...item, quantity } : item
          ),
        });

        // Sync with backend
        try {
          const authData = localStorage.getItem('auth-storage');
          if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.state?.token) {
              await cartAPI.update(productId, quantity);
            }
          }
        } catch (error) {
          console.log('Cart sync skipped');
        }
      },

      // Clear cart
      clearCart: async () => {
        set({ items: [] });

        try {
          const authData = localStorage.getItem('auth-storage');
          if (authData) {
            const parsed = JSON.parse(authData);
            if (parsed.state?.token) {
              await cartAPI.clear();
            }
          }
        } catch (error) {
          console.log('Cart sync skipped');
        }
      },

      // Fetch cart from backend
      fetchCart: async () => {
        set({ isLoading: true });
        try {
          const response = await cartAPI.get();
          const items = response.cart.items.map(item => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            image: item.product.image,
            quantity: item.quantity,
          }));
          set({ items, isLoading: false, isSynced: true });
        } catch (error) {
          set({ isLoading: false });
        }
      },

      // Get total items count
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Get subtotal
      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // Get formatted subtotal with currency
      getFormattedSubtotal: () => {
        const subtotal = get().getSubtotal();
        return `Rs. ${subtotal.toLocaleString()}`;
      },
    }),
    {
      name: 'estore-cart',
    }
  )
);

export default useCartStore;
