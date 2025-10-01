import React from "react";
import locationIcon from "../images/location-icon.png";

const Hero: React.FC = () => {
  return (
    <div className="hero-section">
      <div className="search-container">
        <div className="tabs">
          <div className="tab active">Buy</div>
          <div className="tab">Rent</div>
          <div className="tab">PG/Co-Living</div>
          <div className="tab">Plots/Land</div>
        </div>

        <div className="inputs">
          <select className="location-select">
            <option>Location</option>
          </select>
          <input type="text" placeholder="Preferred localities or landmarks" />
          <div className="icon-buttons">
            <button className="icon-btn">
              <img src={locationIcon} alt="Locate" />
            </button>
          </div>
          <a href="#" className="search-btn">
            Search
          </a>
        </div>
      </div>
    </div>
  );
};

export default Hero;
