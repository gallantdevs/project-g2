import React from "react";
import styles from "./ContactUs.module.css";

const ContactUs = () => {
  return (
    <div className={styles.pageWrapper}>
      <div className={styles.topBar}>
        Free Shipping Sitewide on Every Order, Don't Miss Out!!
      </div>

      <nav className={styles.navbar}>
        <div className={styles.logo}>BEYOUNG.</div>
        <div className={styles.navLinks}>
          <span>Topwear</span>
          <span>Bottomwear</span>
          <span>Combos</span>
          <span>New Arrivals</span>
          <span>Winterwear</span>
        </div>
        <div className={styles.icons}>
          <span>🔍</span>
          <span>🛒</span>
        </div>
      </nav>

      <div className={styles.heroSection}>
        <div className={styles.heroText}>
          <h1>Contact Us</h1>
          <p>Your satisfaction matters to us!</p>
        </div>
        <div className={styles.heroImage}>
          <img
            src="/public/contact.png"
            alt="Support Illustration"
          />
        </div>
      </div>

      <div className={styles.contentArea}>
        <h3 className={styles.sectionTitle}>Reach Us Out - We're all ears!</h3>

        <p className={styles.description}>
          Do you have a question? Need help with your order? Want to share
          feedback? Our support team is here for you.
        </p>

        <ul className={styles.contactList}>
          <li>
            <span className={styles.bullet}>•</span>
            <strong>WhatsApp Support:</strong>
            <a href="#" className={styles.link}>
              Click Here
            </a>
          </li>
          <li>
            <span className={styles.bullet}>•</span>
            <strong>Email Support:</strong>
            <span style={{ marginLeft: "5px" }}>kairozworld2025@gmail.com</span>
          </li>
        </ul>

        <div className={styles.workingHours}>
          Working Hours: 9am - 5pm IST Monday to Sunday.
        </div>

        <p className={styles.note}>
          Note: Queries received outside working hours will be addressed on the
          next working day.
        </p>

        <p className={styles.policyLink}>
          To know about our Returns, Exchange, and Refund Policies,{" "}
          <a href="#" className={styles.link}>
            click here
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default ContactUs;
