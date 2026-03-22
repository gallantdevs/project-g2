import React from "react";
import styles from "./Collabration.module.css";

const Collaboration = () => {
 
  const offers = [
    {
      id: 1,
      brand: "CRED",
      title: "Get mystery cashback",
      amount: "Upto ₹500",
      subText: "on MOV Rs.499 and above",
      imgSrc: "/collabration/cred.jpg", 
      theme: "cardCred",
    },
    {
      id: 2,
      brand: "HDFC Bank",
      title: "Get Flat Instant Discount",
      amount: "₹150/-",
      subText: "on HDFC Credit Card",
      imgSrc: "/collabration/11HDFCjpg.jpg",
      theme: "cardHdfc",
    },
    {
      id: 3,
      brand: "MobiKwik",
      title: "Get Additional Cashback",
      amount: "Upto ₹250",
      subText: "on transactions via the MobiKwik wallet",
      imgSrc: "/collabration/credmobi.jpg",
      theme: "cardMobikwik",
    },
    {
      id: 4,
      brand: "Freecharge",
      title: "Get Cashback On UPI",
      amount: "Upto Rs.50/-",
      subText: "Minimum Shopping of Rs.999/-",
      imgSrc: "/collabration/Freecharge.jpg",
      theme: "cardFreecharge",
    },
    {
      id: 5,
      brand: "Flash.co",
      title: "GET FLASH CASHBACK",
      amount: "₹100",
      subText: "on purchasing through your flash.co email id",
      imgSrc: "/collabration/flash.jpg",
      theme: "cardFlash",
    },
  ];

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Official Collaborations</h1>

      <div className={styles.grid}>
        {offers.map((offer) => (
          <div
            key={offer.id}
            className={`${styles.card} ${styles[offer.theme]}`}
          >
            <div className={styles.logoContainer}>
              <img
                src={offer.imgSrc}
                alt={`${offer.brand} Logo`}
                className={styles.logoImg}
              />
            </div>

            <div className={styles.offerCapsule}>
              <div className={styles.capsuleTitle}>{offer.title}</div>
              <span className={styles.capsuleAmount}>{offer.amount}</span>
            </div>

            <p className={styles.subText}>{offer.subText}</p>

            <button className={styles.redeemBtn}>Redeem Now</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Collaboration;
