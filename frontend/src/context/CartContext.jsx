import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getCart,
  addToCart as apiAddToCart,
  updateCartItem as apiUpdateCartItem,
  removeFromCart as apiRemoveFromCart,
  clearCart as apiClearCart,
} from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { customer, isAuthenticated } = useAuth();
  const [cart, setCart] = useState({
    items: [],
    totalCount: 0,
    subtotal: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart({ items: [], totalCount: 0, subtotal: 0 });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getCart();
      if (data?.success && data?.cart) {
        setCart(data.cart);
      }
    } catch (err) {
      console.error('Failed to fetch cart:', err);
      setError(err.response?.data?.message || 'Failed to load cart');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart, customer]);

  const addToCartItem = async (productId, quantity = 1) => {
    if (!isAuthenticated) {
      throw new Error('AUTH_REQUIRED');
    }
    setError(null);
    try {
      const res = await apiAddToCart(productId, quantity);
      if (res?.success && res?.cart) {
        setCart(res.cart);
        return res;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add item to cart';
      setError(msg);
      throw new Error(msg);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (!isAuthenticated) return;
    setError(null);
    try {
      const res = await apiUpdateCartItem(productId, quantity);
      if (res?.success && res?.cart) {
        setCart(res.cart);
        return res;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update quantity';
      setError(msg);
      throw new Error(msg);
    }
  };

  const removeItem = async (productId) => {
    if (!isAuthenticated) return;
    setError(null);
    try {
      const res = await apiRemoveFromCart(productId);
      if (res?.success && res?.cart) {
        setCart(res.cart);
        return res;
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to remove item';
      setError(msg);
      throw new Error(msg);
    }
  };

  const resetCart = async () => {
    try {
      await apiClearCart();
    } catch {
      // Ignored
    } finally {
      setCart({ items: [], totalCount: 0, subtotal: 0 });
    }
  };

  const cartCount = cart.items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const cartSubtotal = cart.items.reduce(
    (sum, item) => sum + ((item.product?.price || 0) * (item.quantity || 0)),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        cartSubtotal,
        loading,
        error,
        addToCart: addToCartItem,
        updateQuantity,
        removeFromCart: removeItem,
        clearCart: resetCart,
        refreshCart: fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export default CartContext;
