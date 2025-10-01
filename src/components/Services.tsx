import React from "react";
import house1 from "../images/house1.jpg";
import house2 from "../images/house2.jpg";

const Services: React.FC = () => {
  return (
    <section className="services-section">
      <h3 className="section-subtitle">OUR SERVICES</h3>
      <h2 className="section-title">
        <span>WHAT</span> WE DO
      </h2>
      <div className="services-container">
        <div className="service-box">
          <div className="service-text">
            <h4>BUY A HOME</h4>
            <h3>Find, Buy & Own Your Dream Home</h3>
            <p>Explore from Apartments, land, builder floors, villas and more</p>
            <a href="#" className="service-btn">
              Explore Buying
            </a>
          </div>
          <div className="service-image">
            <img src={house1} alt="Buy a Home" />
          </div>
        </div>
        <div className="service-box">
          <div className="service-image">
            <img src={house2} alt="Rent a Home" />
          </div>
          <div className="service-text">
            <h4>RENT A HOME</h4>
            <h3>Rental Homes for Everyone</h3>
            <p>Explore from Apartments, builder floors, villas and more</p>
            <a href="#" className="service-btn">
              Explore Renting
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
