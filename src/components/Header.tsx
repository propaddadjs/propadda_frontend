import React from "react";
import logo from "../images/logo.png";
import { Link } from "react-router-dom";


const Header: React.FC = () => {
  return (
    <div className="hero-wrapper">
      <div className="header">
        <div className="logo">
          <img src={logo} alt="PropAdda Logo" />
          <div className="vl"></div>
          <select className="location-select">
            <option>All India</option>
          </select>
        </div>
        <div className="header-buttons">
        <Link to="/postproperty" className="post-btn">
          Post Property <span>FREE</span>
        </Link>

          <a href="#" className="login-btn">
            Log In
          </a>
        </div>
      </div>
    </div>
  );
};

export default Header;
