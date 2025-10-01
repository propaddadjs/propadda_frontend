import React from "react";
import logo from "../images/logo.png";

interface HeaderProps {
  centeredText?: string;
}

const Header: React.FC<HeaderProps> = ({ centeredText }) => {
  return (
    <div className="header">
      <div className="logo">
        <img src={logo} alt="PropAdda Logo" />
        <div className="vl"></div>
        <select className="location-select">
          <option>All India</option>
        </select>
      </div>

      <div className="header-buttons">
        <a href="#" className="post-btn">
          Post Property <span>FREE</span>
        </a>
        <a href="#" className="login-btn">
          Log In
        </a>
      </div>

      {centeredText && <div className="centered-text">{centeredText}</div>}
    </div>
  );
};

export default Header;
