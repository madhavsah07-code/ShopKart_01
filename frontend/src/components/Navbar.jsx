import { useNavigate } from 'react-router-dom';
import { logoutCustomer } from '../services/api';
import { useState } from 'react';

function Navbar({ customerName }) {
  const navigate = useNavigate();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await logoutCustomer();
      navigate('/login');
    } catch (err) {
      // Even if logout fails, redirect to login
      navigate('/login');
    }
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => navigate('/home')}>
          <svg className="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="8" cy="21" r="1" />
            <circle cx="19" cy="21" r="1" />
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
          </svg>
          <span className="brand-name">ShopKart</span>
        </div>

        <div className="navbar-right">
          {customerName && (
            <div className="navbar-user">
              <div className="navbar-avatar">
                {customerName.charAt(0).toUpperCase()}
              </div>
              <span className="navbar-username">{customerName}</span>
            </div>
          )}
          <button
            className="btn btn-logout"
            onClick={handleLogout}
            disabled={loggingOut}
            id="logout-btn"
          >
            {loggingOut ? (
              <span className="btn-loading">
                <span className="spinner spinner-sm"></span>
              </span>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <span>Logout</span>
              </>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
