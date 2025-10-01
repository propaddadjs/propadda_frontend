import React from "react";

const PropertyAction: React.FC = () => {
  return (
    <section className="property-action-section">
      <div className="property-action">
        <h3>Find Property</h3>
        <p>Select from thousands of options, without brokerage.</p>
        <button className="action-btn dark">Find Now</button>
      </div>
      <div className="property-action">
        <h3>List Your Property</h3>
        <p>For Free. Without any brokerage.</p>
        <button className="action-btn dark">Free Posting</button>
      </div>
    </section>
  );
};

export default PropertyAction;
