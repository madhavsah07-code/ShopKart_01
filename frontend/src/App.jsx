import { Routes, Route, Navigate } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetails from './pages/ProductDetails';
import Wishlist from './pages/Wishlist';

import './App.css';

function App() {
  return (
    <div className="app">

      <Routes>

        <Route
          path="/register"
          element={<Register />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/home"
          element={<Home />}
        />

        {/* Products page */}
        <Route
          path="/shop"
          element={<Products />}
        />

        {/* Product details page */}
        <Route
          path="/product/:id"
          element={<ProductDetails />}
        />

        {/* Wishlist page */}
        <Route
          path="/my-wishlist"
          element={<Wishlist />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>

    </div>
  );
}

export default App;