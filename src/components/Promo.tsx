import React from "react";

const Promo: React.FC = () => {
  return (
    <section className="promo-section">
      <div className="promo-card">
        <h3>Post your property ads for free!</h3>
        <a href="#" className="promo-btn">
          List your Property <span>&#9654;</span>
        </a>
      </div>
      <div className="promo-card">
        <h3>Explore India’s Top Residential Cities List</h3>
        <a href="#" className="promo-btn">
          Explore Now <span>&#9654;</span>
        </a>
      </div>
      <div className="promo-card">
        <h3>Helping you to Find your Dream Property</h3>
        <a href="#" className="promo-btn">
          Post your Requirement <span>&#9654;</span>
        </a>
      </div>
    </section>
  );
};

export default Promo;
