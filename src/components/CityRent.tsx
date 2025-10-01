import React from "react";

const CityRent: React.FC = () => {
  return (
    <section className="city-rent-section">
      <h2 className="rent-title">
        PROPERTY OPTIONS IN TOP CITIES FOR
        <div className="dropdown">
          <button className="dropbtn">
            <span className="drop-text">RENT</span>
            <span className="arrow">&#9660;</span>
          </button>
          <div className="dropdown-content">
            <a href="#">RENT</a>
            <a href="#">BUY</a>
            <a href="#">PG / CO-LIVING</a>
            <a href="#">PLOTS / LAND</a>
          </div>
        </div>
      </h2>
      <div className="city-tabs">
        <span>Bangalore</span>
        <span className="active">Mumbai</span>
        <span>Hyderabad</span>
        <span>Thane</span>
        <span>Pune</span>
      </div>
      <div className="rent-columns">
        <div className="rent-category">
          <h4>Flat for Rent in Mumbai</h4>
          <ul>
            <li>Flat for Rent in Andheri East</li>
            <li>Flat for Rent in Bandra West</li>
          </ul>
        </div>
        <div className="rent-category">
          <h4>PG in Mumbai</h4>
          <ul>
            <li>PG in Powai</li>
            <li>PG in Malad West</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default CityRent;
