import React, { useState, useMemo } from "react";
import styles from "./SavExtraOffer.module.css";

const SaveExtraOffer = ({ price = 0 }) => {
  const [isOpen, setIsOpen] = useState(false);

  const emiAmount = useMemo(() => {
    if (!price || isNaN(price)) return 0;
    return Math.ceil(price / 3);
  }, [price]);

  const formatDate = (date) => {
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });

    const suffix =
      day % 10 === 1 && day !== 11
        ? "st"
        : day % 10 === 2 && day !== 12
        ? "nd"
        : day % 10 === 3 && day !== 13
        ? "rd"
        : "th";

    return `${day}${suffix} ${month}`;
  };

  const today = new Date();
  const firstEmi = formatDate(today);
  const secondEmi = formatDate(new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000));
  const thirdEmi = formatDate(new Date(today.getTime() + 60 * 24 * 60 * 60 * 1000));

  return (
    <>
      {/* Offer Card */}
      <div className={styles.offerCard} onClick={() => setIsOpen(true)}>
        <div className={styles.offerLeft}>
          <img
            src="/snap_logo_green.svg"
            alt="Snapmint"
            className={styles.logo}
          />
          <div>
            <h4 className={styles.title}>SNAPMINT</h4>
            <p className={styles.subtitle}>
              Or Pay ₹{emiAmount} now, rest later via Kairoz Pay Later
            </p>
          </div>
        </div>
        <button className={styles.offerBtn}>Buy on EMI ›</button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <img
                src="/Logo.svg"
                alt="Kairozlogo"
                className={styles.modalLogo}
              />
              <button
                className={styles.closeBtn}
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
            </div>

            <h2 className={styles.modalTitle}>
              Pay only <span>₹{emiAmount}</span> Now
            </h2>

            <div className={styles.modalSubText}>
              0% Interest Installments · 0 Extra Cost · UPI & Cards accepted
            </div>

            {/* Dynamic EMI Boxes */}
            <div className={styles.modalStats}>
              <div className={styles.statBox}>
                <div className={styles.pie}></div>
                <p>₹{emiAmount}</p>
                <span>{firstEmi} (Today)</span>
              </div>

              <div className={styles.statBox}>
                <div className={styles.pie}></div>
                <p>₹{emiAmount}</p>
                <span>{secondEmi}</span>
              </div>

              <div className={styles.statBox}>
                <div className={styles.pie}></div>
                <p>₹{emiAmount}</p>
                <span>{thirdEmi}</span>
              </div>
            </div>

            <p className={styles.modalFooter}>
              Powered by <img src="/SnapMint_logo.svg" alt="Snapmint" />
            </p>

            <div className={styles.bottomBar}>
              Select <b>Kairoz Pay Later</b> during checkout
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SaveExtraOffer;
