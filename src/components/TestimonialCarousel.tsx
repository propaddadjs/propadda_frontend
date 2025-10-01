import React, { useState } from "react";
import TestimonialCard from "./TestimonialCard";

const Testimonials = [
  {
    text: "My experience with Propadda was excellent. The quality of the leads were superb. I never thought my property would have been sold so fast. Thank you Propadda! Even after selling the property I am flooded with enquiries.",
    name: "Rajarajeshwar Shetty",
    role: "Owner Brahmagiri, Udupi",
    avatar: "assets/avatar_male.png",
  },
  // Duplicate as needed or fetch dynamically
  {
    text: "My experience with Propadda was excellent. The quality of the leads were superb. I never thought my property would have been sold so fast. Thank you Propadda! Even after selling the property I am flooded with enquiries.",
    name: "Rajarajeshwar Shetty",
    role: "Owner Brahmagiri, Udupi",
    avatar: "assets/avatar_male.png",
  },
  {
    text: "My experience with Propadda was excellent. The quality of the leads were superb. I never thought my property would have been sold so fast. Thank you Propadda! Even after selling the property I am flooded with enquiries.",
    name: "Rajarajeshwar Shetty",
    role: "Owner Brahmagiri, Udupi",
    avatar: "assets/avatar_male.png",
  },
];

const TestimonialCarousel: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const updateIndex = (newIndex: number) => {
    if (newIndex < 0) newIndex = Testimonials.length - 1;
    if (newIndex >= Testimonials.length) newIndex = 0;
    setCurrentIndex(newIndex);
  };

  return (
    <section className="testimonial-section">
      <div className="testimonial-carousel">
        {Testimonials.map((t, index) => (
          <div
            key={index}
            style={{ display: index === currentIndex ? "block" : "none" }}
          >
            <TestimonialCard {...t} />
          </div>
        ))}

        {/* Navigation */}
        <button className="carousel-prev" onClick={() => updateIndex(currentIndex - 1)}>
          &#10094;
        </button>
        <button className="carousel-next" onClick={() => updateIndex(currentIndex + 1)}>
          &#10095;
        </button>
      </div>

      {/* Dots */}
      <div className="testimonial-dots">
        {Testimonials.map((_, index) => (
          <span
            key={index}
            className={`dot ${index === currentIndex ? "active" : ""}`}
            onClick={() => updateIndex(index)}
          />
        ))}
      </div>
    </section>
  );
};

export default TestimonialCarousel;
