import React from "react";
import propaddaLogo from '../images/logo.png';
import facebookLogo from '../images/facebook.png';
import twitterLogo from '../images/twitter.png';
import instagramLogo from '../images/instagram.png';
import linkedinLogo from '../images/linkedin.png';
import youtubeLogo from '../images/youtube.png';
import { Link } from "react-router-dom";

const Footer: React.FC = () => {
  return (
    <footer className="main-footer">
      <div className="footer-top">
        <div className="footer-links">
          <ul>
            <li><Link to="/">HOME</Link></li>
            <li><Link to="/about">ABOUT US</Link></li>
            <li><Link to="/Testimonials">TESTIMONIALS</Link></li>
            <li><Link to="/terms">TERMS & CONDITIONS</Link></li>
            <li><Link to="/feedback">FEEDBACK</Link></li>
            <li><Link to="/policy">PRIVACY POLICY</Link></li>
            <li><Link to="/faq">FAQ’S</Link></li>
            <li><Link to="/contact">CONTACT US</Link></li>
          </ul>
        </div>
        
        <div className="footer-contact">
          <div className="contact-box">
            <p className="headings">CONTACT</p>
            <p>1234567890</p>
          </div>
          <div className="contact-box">
            <p className="headings">MAIL</p>
            <p>HELLO@GMAIL.COM</p>
          </div>
          <div className="contact-box">
            <p className="headings">ADDRESS</p>
            <p>NEW DELHI</p>
          </div>
        </div>

        <div className="footer-brand">
          <img src={propaddaLogo} alt="PropAdda Logo" />
          <h4>YOUR PERFECT <br /><span>HOME AWAITS</span></h4>
          <a href="contactus.html" className="contact-us-btn">Contact Us →</a>
        </div>
      </div>

      <hr />

      <div className="footer-bottom">
        <div className="social-links">
          <a href="#"><img src={facebookLogo} alt="Facebook" /></a>
          <a href="#"><img src={twitterLogo} alt="Twitter" /></a>
          <a href="#"><img src={instagramLogo} alt="Instagram" /></a>
          <a href="#"><img src={linkedinLogo} alt="LinkedIn" /></a>
          <a href="#"><img src={youtubeLogo} alt="YouTube" /></a>
        </div>

        <p className="copyright">
          © {new Date().getFullYear()} PropAdda. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
