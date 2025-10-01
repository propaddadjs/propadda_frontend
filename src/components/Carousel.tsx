import React, { useRef } from "react";

interface CarouselProps {
  children: React.ReactNode;
}

const Carousel: React.FC<CarouselProps> = ({ children }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const scrollAmount = 240;

  const scroll = (direction: "left" | "right") => {
    if (trackRef.current) {
      trackRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="carousel-container">
      <button className="carousel-btn left-btn" onClick={() => scroll("left")}>
        &#8249;
      </button>
      <div className="carousel-track" ref={trackRef}>
        {children}
      </div>
      <button className="carousel-btn right-btn" onClick={() => scroll("right")}>
        &#8250;
      </button>
    </div>
  );
};

export default Carousel;
