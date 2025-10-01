import React from "react";
import img1 from "../images/img_1.png";

const WhyChoose: React.FC = () => {
  return (
    <>
      <section className="why-choose-header">
        <h4>BENEFITS OF PROPADDA</h4>
        <h2>
          WHY CHOOSE <span>PROPADDA</span>
        </h2>
      </section>
      <div className="why-image">
        <img src={img1} alt="Why Choose PropAdda" />
      </div>
      <section className="why-choose-text">
        <div className="why-content">
          <div className="why-text">
            <h3>Think real estate is complicated?</h3>
            <p>
              At PropAdda.in, we simplify the journey. Whether you’re buying,
              selling, or investing, we bring you verified listings, trusted
              agents, and modern tools to help you make confident decisions —
              fast.
            </p>
          </div>
          <div className="why-text-button-container">
            <a href="#" className="about-btn">
              More About Us <span>&#9654;</span>
            </a>
          </div>
        </div>
      </section>
    </>
  );
};

export default WhyChoose;
