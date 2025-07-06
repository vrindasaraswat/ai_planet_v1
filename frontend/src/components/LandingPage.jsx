import React from 'react';
import './LandingPage.css';

const LandingPage = ({ onGetStarted }) => {
  return (
    <div className="landing-page">
      <header>
        <div className="logo">ai planet <span>formerly DPii</span></div>
        <nav>
          <a href="#products">Products</a>
          <a href="#models">Models</a>
          <a href="#solutions">Solutions</a>
          <a href="#community">Community</a>
        </nav>
      </header>
      <section className="hero">
        <h1>Deploy GenAI Apps</h1>
        <h2>in minutes, not months.</h2>
        <p>Integrate reliable, private and secure GenAI solutions within your enterprise environment</p>
        <div className="cta-buttons">
          <button className="get-started" onClick={onGetStarted}>Get Started</button>
          <button className="book-demo">Book Demo</button>
        </div>
      </section>
      <section className="benefits">
        <div className="benefit-card">
          <h3>20x</h3>
          <p>Faster time to market</p>
        </div>
        <div className="benefit-card">
          <h3>up to 30x</h3>
          <p>Infra Cost Savings</p>
        </div>
        <div className="benefit-card">
          <h3>10x</h3>
          <p>Productivity Gains</p>
        </div>
      </section>
      <footer>
        <p>Trusted by leading organizations and 300K+ global community</p>
      </footer>
    </div>
  );
};

export default LandingPage;