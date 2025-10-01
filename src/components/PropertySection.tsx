import React, { useState } from "react";
import Carousel from "./Carousel";
import house1 from "../images/house1.jpg";
import house2 from "../images/house2.jpg";
import house3 from "../images/house3.jpeg";
import house4 from "../images/house4.jpg";
import house5 from "../images/house5.jpg";

const PropertySection: React.FC = () => {
  const [active, setActive] = useState<"villa" | "flat" | "plot" | "pg">("villa");

  const renderCards = () => {
    switch (active) {
      case "villa":
        return (
          <>
            <div className="property-card">
              <div className="label">Selling</div>
              <img src={house1} alt="Villa 1" />
              <div className="property-info">
                <h4>The Park Villas</h4>
                <p>4 Bedroom | 3 Bathroom | Hall | Kitchen</p>
                <p className="location">Villa | Delhi</p>
                <div className="price-row">
                  <span className="price">₹1.3 Cr</span>
                  <button className="diagonal-btn">More Details </button>
                </div>
              </div>
            </div>
            <div className="property-card">
              <div className="label">Renting</div>
              <img src={house2} alt="Villa 2" />
              <div className="property-info">
                <h4>Mahaveera Villa</h4>
                <p>2 Bedroom | 1 Bathroom | Hall | Kitchen</p>
                <p className="location">Villa | Greater Noida</p>
                <div className="price-row">
                  <span className="price">₹50K INR/m</span>
                  <button className="diagonal-btn">More Details</button>
                </div>
              </div>
            </div>
            <div className="property-card">
              <div className="label">Selling</div>
              <img src={house3} alt="Villa 3" />
              <div className="property-info">
                <h4>Radiance Residency</h4>
                <p>3 Bedroom | 3 Bathroom | Hall | Kitchen</p>
                <p className="location">Villa | Lucknow</p>
                <div className="price-row">
                  <span className="price">₹1.3 Cr</span>
                  <button className="diagonal-btn">More Details </button>
                </div>
              </div>
            </div>
            <div className="property-card">
              <div className="label">Renting</div>
              <img src={house4} alt="Villa 4" />
              <div className="property-info">
                <h4>Bhartikunj</h4>
                <p>4 Bedroom | 3 Bathroom | Hall | Kitchen</p>
                <p className="location">Villa | Mathura</p>
                <div className="price-row">
                  <span className="price">₹70K INR/m</span>
                  <button className="diagonal-btn">More Details </button>
                </div>
              </div>
            </div>
            <div className="property-card">
              <div className="label">Selling</div>
              <img src={house5} alt="Villa 5" />
              <div className="property-info">
                <h4>The Park Villas</h4>
                <p>4 Bedroom | 3 Bathroom | Hall | Kitchen</p>
                <p className="location">Villa | Himachal</p>
                <div className="price-row">
                  <span className="price">₹1.9 Cr</span>
                  <button className="diagonal-btn">More Details </button>
                </div>
              </div>
            </div>
          </>
        );
      default:
        return <p>Other categories can be filled similarly…</p>;
    }
  };

  return (
    <section className="featured-properties">
      <h3>FEATURED PROPERTIES</h3>
      <h2>
        <span className="highlight">RECOMMENDED</span> FOR YOU
      </h2>

      <div className="property-filters">
        {["villa", "flat", "plot", "pg"].map((type) => (
          <button
            key={type}
            className={`filter ${active === type ? "active" : ""}`}
            onClick={() => setActive(type as any)}
          >
            {type === "villa" && "Bungalow / Villa"}
            {type === "flat" && "Flat / Apartment"}
            {type === "plot" && "Plot"}
            {type === "pg" && "PG / Co-Living"}
          </button>

          
        ))}
      </div>

      <Carousel>{renderCards()}</Carousel>
      <a href="#" className="view-all-btn">View all Properties <span>&#9654;</span></a>
    </section>
  );
};

export default PropertySection;
