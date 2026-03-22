import React from "react";
import styles from "./Footer.module.css";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const naviagte = useNavigate();

  return (
    <footer className={styles.footer}>
      {/* Newsletter Section */}
      <div className={styles.newsletter}>
        <p>
          Xclusive coupons, extra savings, and tons of EVERYDAY deals delivered
          straight to your inbox.
        </p>
        <div className={styles.inputBox}>
          <input
            type="email"
            placeholder="Enter your email address"
            className={styles.emailInput}
          />
          <button className={styles.subscribeBtn}>Subscribe</button>
        </div>
      </div>

      {/* Footer Links Section */}
      <div className={styles.footerLinks}>
        <div>
          <h4>SUPPORT</h4>
          <ul>
            <li>Track Order</li>
            <li onClick={() => naviagte("/return")}>
              Returns & Exchange Policy
            </li>
            <li onClick={() => naviagte("/FAQ")}>FAQ's</li>
            <li onClick={() => naviagte("/termcondition")}>
              Terms and Conditions
            </li>
            <li>Privacy Policy</li>
            <li>Shipping Policy</li>
            <li onClick={() => naviagte("/contact")}>Contact Us</li>
          </ul>
        </div>

        <div>
          <h4>COMPANY</h4>
          <ul>
            <li onClick={() => naviagte("/about")}>About Us</li>
            <li onClick={() => naviagte("/collabration")}>Collaboration</li>
            <li onClick={() => naviagte("/carrer")}>Career</li>
            <li>Media</li>
            <li>Kairostan</li>
            <li>Kairoz Blog</li>
            <li onClick={() => naviagte("/sitemap")}>Sitemap</li>
          </ul>
        </div>

        <div>
          <h4>STORES NEAR ME</h4>
          <ul>
            <li>Udaipur</li>
            <li>Lucknow</li>
            <li>Ahmedabad</li>
            <li>Kota</li>
            <li>Mirzapur</li>
            <li>Bhilwara</li>
            <li>More</li>
          </ul>
        </div>

        <div>
          <h4>LOCATION</h4>
          <p>support@beyoung.in</p>
          <p>
            Eklingpura Chouraha, Ahmedabad Main Road
            <br />
            (NH 8 - Near Mahadev Hotel) Udaipur, India - 313002
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
