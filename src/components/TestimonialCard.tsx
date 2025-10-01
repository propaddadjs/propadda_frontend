import React from "react";
import quote from "../images/quote.png";
import avatar from "../images/avatar_male.png";

interface TestimonialCardProps {
  text: string;
  name: string;
  role: string;
  avatar: string;
}

const TestimonialCard: React.FC<TestimonialCardProps> = ({ text, name, role}) => {
  return (
    <div className="testimonial-card">
      <img src={quote} className="quote-icon" alt="quote" />
      <p>{text}</p>
      <div className="testimonial-profile">
        <img src={avatar} className="avatar" alt={name} />
        <div>
          <strong>{name}</strong>
          <br />
          <span>{role}</span>
        </div>
      </div>
    </div>
  );
};

export default TestimonialCard;
