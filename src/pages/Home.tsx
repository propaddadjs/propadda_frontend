import React from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import PropertySection from "../components/PropertySection";
import CityGrid from "../components/CityGrid";
import Services from "../components/Services";
import WhyChoose from "../components/WhyChoose";
import Promo from "../components/Promo";
import CityRent from "../components/CityRent";
import PropertyAction from "../components/PropertyAction";
import Footer from "../components/Footer";

const Home: React.FC = () => {
  return (
    <>
      <Header />
      <Hero />
      <PropertySection />
      <CityGrid />
      <Services />
      <WhyChoose />
      <Promo />
      <CityRent />
      <PropertyAction />
      <Footer />
    </>
  );
};

export default Home;
