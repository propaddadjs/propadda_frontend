import React from "react";
import Header_Pages from "../components/HeaderPages";
import Breadcrumb from "../components/Breadcrumb";
import TestimonialCarousel from "../components/TestimonialCarousel";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";

const Testimonials: React.FC = () => {
  return (
    <>
      <div className="hero-wrapper">
        <Header_Pages centeredText="TESTIMONIALS" />
      </div>

      <Breadcrumb
        items={[
          { label: "Home", href: "index.html" },
          { label: "Testimonials" },
        ]}
      />

      <TestimonialCarousel />

      <PropertyAction />

      <Footer />
    </>
  );
};

export default Testimonials;
