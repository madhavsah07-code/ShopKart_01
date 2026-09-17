import axios from 'axios';

const api = axios.create({
  baseURL: '/customers',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const registerCustomer = async ({
  fullName,
  email,
  password,
  phone
}) => {

  const response = await api.post('/register', {
    fullName,
    email,
    password,
    phone
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

export default api;
