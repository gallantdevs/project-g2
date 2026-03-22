import React from "react";
import styles from "./About.module.css";

const About = () => {
  return (
    <section className={styles.aboutSection}>
      <div className={styles.container}>
        <h1 className={styles.title}>About Us</h1>

        <p className={styles.description}>
          Founded in 1980, our journey began with a simple yet powerful vision —
          to bring high-quality readymade garments to people who value both
          comfort and style. Over the past four decades, we have grown from a
          small local store into a trusted name in the world of fashion, known
          for our commitment to quality, trust, and customer satisfaction.
        </p>

        <p className={styles.description}>
          At our store, we believe fashion is not just about clothing — it’s
          about expressing who you are. Every piece we offer is carefully
          selected and crafted to reflect a perfect blend of modern trends and
          timeless elegance.
        </p>

        <div className={styles.card}>
          <h2>Our Vision</h2>
          <p>
            To redefine readymade fashion by combining traditional craftsmanship
            with contemporary designs, making quality clothing accessible to
            everyone.
          </p>
        </div>

        <div className={styles.card}>
          <h2>Our Mission</h2>
          <p>
            To continue building lasting relationships with our customers by
            providing exceptional quality, new trends, and unbeatable value —
            all under one roof.
          </p>
        </div>

        <div className={styles.values}>
          <h2>Our Core Values</h2>
          <ul>
            <li>Quality First</li>
            <li>Integrity & Trust</li>
            <li>Customer Satisfaction</li>
            <li>Innovation in Fashion</li>
          </ul>
        </div>

        <p className={styles.footerLine}>
          “Since 1980 – A Legacy of Fashion, Quality, and Trust.”
        </p>
      </div>
    </section>
  );
};

export default About;
