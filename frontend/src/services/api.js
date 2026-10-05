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

// ===== Customer API Functions =====
export const registerCustomer = async ({
  fullName,
  email,
  password,
  phone
}) => {
// Customer registration
  const response = await api.post('/register', {
    fullName,
    email,
    password,
    phone
  });

  return response.data;
};
// Customer login

export const loginCustomer = async ({ email, password }) => {
  const response = await api.post('/login', { email, password });
  return response.data;
};
// Get customer profile
export const getProfile = async () => {
  const response = await api.get('/me');
  return response.data;
};
//  Change customer password
export const logoutCustomer = async () => {
  const response = await api.post('/logout');
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

 // Add product to wishlist
export const addToWishlist = async (productId) => {
  const response = await wishlistApi.post(`/${productId}`);
  return response.data;
}

// Remove product from wishlist
export const removeFromWishlist = async (productId) => {
  const response = await wishlistApi.delete(`/${productId}`);
  return response.data;
}

// Get user's wishlist  
export const getWishlist = async () => {
  const response = await wishlistApi.get('/');
  return response.data;
}

export default api;
