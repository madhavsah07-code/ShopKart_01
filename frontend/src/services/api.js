import axios from 'axios';

// Customer API instance
const api = axios.create({
  baseURL: '/customers',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Product API instance
const productApi = axios.create({
  baseURL: '/products',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Wishlist API instance
const wishlistApi = axios.create({
  baseURL: '/wishlist',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Cart API instance
const cartApi = axios.create({
  baseURL: '/cart',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Orders API instance
const orderApi = axios.create({
  baseURL: '/orders',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ===== Customer API Functions =====
export const registerCustomer = async ({
  fullName,
  email,
  password,
  phone,
}) => {
  const response = await api.post('/register', {
    fullName,
    email,
    password,
    phone,
  });
  return response.data;
};

export const loginCustomer = async ({ email, password }) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get('/me');
  return response.data;
};

export const logoutCustomer = async () => {
  const response = await api.post('/logout');
  return response.data;
};

export const changePassword = async ({ oldPassword, newPassword }) => {
  const response = await api.patch('/change-password', {
    oldPassword,
    newPassword,
  });
  return response.data;
};

// ===== Product API Functions =====
export const getAllProducts = async ({ search, category, sort } = {}) => {
  const params = {};
  if (search) params.search = search;
  if (category) params.category = category;
  if (sort) params.sort = sort;

  const response = await productApi.get('/', { params });
  return response.data;
};

export const getProductById = async (id) => {
  const response = await productApi.get(`/${id}`);
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await productApi.post('/', productData);
  return response.data;
};

// ===== Wishlist API Functions =====
export const addToWishlist = async (productId) => {
  const response = await wishlistApi.post(`/${productId}`);
  return response.data;
};

export const removeFromWishlist = async (productId) => {
  const response = await wishlistApi.delete(`/${productId}`);
  return response.data;
};

export const getWishlist = async () => {
  const response = await wishlistApi.get('/');
  return response.data;
};

// ===== Cart API Functions (Lab 05) =====
export const getCart = async () => {
  const response = await cartApi.get('/');
  return response.data;
};

export const addToCart = async (productId, quantity = 1) => {
  const response = await cartApi.post(`/${productId}`, { quantity });
  return response.data;
};

export const updateCartItem = async (productId, quantity) => {
  const response = await cartApi.patch(`/${productId}`, { quantity });
  return response.data;
};

export const removeFromCart = async (productId) => {
  const response = await cartApi.delete(`/${productId}`);
  return response.data;
};

export const clearCart = async () => {
  const response = await cartApi.delete('/');
  return response.data;
};

// ===== Orders & Checkout API Functions (Lab 06) =====
export const createPaymentOrder = async (shippingAddress) => {
  const response = await orderApi.post('/create-payment-order', {
    shippingAddress,
  });
  return response.data;
};

export const verifyPayment = async (paymentData) => {
  const response = await orderApi.post('/verify-payment', paymentData);
  return response.data;
};

export const getMyOrders = async () => {
  const response = await orderApi.get('/');
  return response.data;
};

export const getOrderById = async (id) => {
  const response = await orderApi.get(`/${id}`);
  return response.data;
};

export { api, productApi, wishlistApi, cartApi, orderApi };
export default api;
