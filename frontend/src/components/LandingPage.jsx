import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted, onNewStack }) => {
  return (
    <div className="landing-page">
      <header>
        <div className="logo" style={{color: '#fff'}}>
          {/* <span role="img" aria-label="globe">🌍</span> */}
          ai planet <span>formerly Phi</span>
        </div>
        <nav>
          <div className="nav-item">Products</div>
          <div className="nav-item">Models</div>
          <div className="nav-item">Solutions</div>
          <div className="nav-item">Community</div>
          <button className="contact-btn">Contact Us</button>
        </nav>
      </header>
      <section className="hero">
        <h1>
          Deploy <span className="highlight">GenAI Apps</span>
          <br />
          in minutes, not months.
        </h1>
        <p>Integrate reliable, private and secure GenAI solutions within your enterprise environment</p>
        <div className="cta-buttons">
          <button className="get-started-btn" onClick={onGetStarted}>Get Started</button>
          <button className="book-demo-btn">Book Demo</button>
        </div>
      </section>
      <section className="benefits-container">
        <div className="benefits-box">
          <div className="benefit-card">
            <h3>20x</h3>
            <p>Speed Launch</p>
          </div>
          <div className="benefit-card">
            <h3>upto 30x</h3>
            <p>Expense Reduction</p>
          </div>
          <div className="benefit-card">
            <h3>10x</h3>
            <p>Output Enhancement</p>
          </div>
        </div>
      </section>
      <footer>
        <p>Reliable by reputable companies and a worldwide network</p>
      </footer>
    </div>
  );
};

export default LandingPage;