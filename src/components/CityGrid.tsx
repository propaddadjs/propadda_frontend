import React from "react";
import city1 from "../images/city1.jpg";
import city2 from "../images/city2.jpg";
import city3 from "../images/city3.jpeg";
import city4 from "../images/city4.png";

const CityGrid: React.FC = () => {
  return (
    <section className="explore-cities">
      <h5>EXPLORE CITIES</h5>
      <h2>
        FIND THE <span className="highlight">PROPERTY OF YOUR DREAM</span> IN
        YOUR PREFERRED CITY
      </h2>
      <div className="city-grid">
        <a href="#" className="city-card">
          <img src={city1} alt="Bangalore" />
          <h4>Bangalore</h4>
          <p>34007 + Properties</p>
        </a>
        <a href="#" className="city-card">
          <img src={city2} alt="Gurgaon" />
          <h4>Gurgaon</h4>
          <p>33548 + Properties</p>
        </a>
        <a href="#" className="city-card">
          <img src={city3} alt="Mumbai" />
          <h4>Mumbai</h4>
          <p>33267 + Properties</p>
        </a>
        <a href="#" className="city-card">
          <img src={city4} alt="New Delhi" />
          <h4>New Delhi</h4>
          <p>31908 + Properties</p>
        </a>
      </div>
      <div className="view-more-container">
        <a href="#" className="view-all-btn">
          View more Cities <span>&#9654;</span>
        </a>
      </div>
    </section>
  );
};

export default CityGrid;
