import React from "react";
import s from "./TrustBadges.module.css";

const TrustBadges = () => {
  return (
    <div className={s.trustRowSection}>
      <img src="/Genuine.svg" alt="100% Genuine" />
      <img src="/happy-customer.svg" alt="Happy Customers" />
      <img src="/Make-in-india.svg" alt="Made in India" />
    </div>
  );
};

export default TrustBadges;
