import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function About() {
  return (
    <div className="page-wrapper about-page-wrapper">
      <Navbar />

      <main className="about-main container">
        <section className="about-hero">
          <span className="hero-pill">About Our Store</span>
          <h1>Welcome to ShopKart</h1>
          <p className="about-lead">
            Empowering modern shoppers across India with curated products, guaranteed authentic quality, and a friction-free e-commerce experience.
          </p>
        </section>

        <section className="about-mission-grid">
          <div className="about-card">
            <span className="card-emoji">🎯</span>
            <h3>Our Mission</h3>
            <p>
              To deliver an online retail experience that balances simplicity, high standards of product curation, and reliable doorstep service.
            </p>
          </div>

          <div className="about-card">
            <span className="card-emoji">🛡️</span>
            <h3>Authenticity Guaranteed</h3>
            <p>
              Every electronic device, lifestyle essential, and wearable in our catalog is verified and comes directly with standard manufacturer warranties.
            </p>
          </div>

          <div className="about-card">
            <span className="card-emoji">⚡</span>
            <h3>Seamless Payments</h3>
            <p>
              Powered by Razorpay, ShopKart protects your payment details with 256-bit encryption, instant UPI, card verification, and full buyer protection.
            </p>
          </div>
        </section>

        <section className="about-cta-section">
          <h2>Ready to discover great deals?</h2>
          <p>Browse through hundreds of items and find what suits your lifestyle best.</p>
          <Link to="/products" className="btn btn-hero-primary" style={{ maxWidth: '240px', margin: '1.5rem auto 0' }}>
            Start Shopping Now ➔
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
