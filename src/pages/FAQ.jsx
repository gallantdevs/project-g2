import React, { useState } from "react";
import styles from "./FAQ.module.css";
import { faqData } from "../data/FAQdata";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const naviagte = useNavigate();
  const [activeTabId, setActiveTabId] = useState(1);
  const [openQuestionIndex, setOpenQuestionIndex] = useState(0);
  const activeContent = faqData.find((item) => item.id === activeTabId);
  const handleTabClick = (id) => {
    setActiveTabId(id);
    setOpenQuestionIndex(-1);
  };

  const toggleQuestion = (index) => {
    if (openQuestionIndex === index) {
      setOpenQuestionIndex(-1);
    } else {
      setOpenQuestionIndex(index);
    }
  };

  return (
    <div className={styles.container}>
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>HOME {">"} FAQ</div>

      {/* Yellow Banner */}
      <div className={styles.contactBanner}>
        <span className={styles.bannerText}>Need help :</span>
        <button
          className={styles.contactBtn}
          onClick={() => naviagte("/contact")}
        >
          Contact Us
        </button>
      </div>

      {/* Main Heading */}
      <h2 className={styles.mainHeading}>
        Common Questions Asked by Our Customers
      </h2>

      <div className={styles.contentWrapper}>
        {/* Left Sidebar */}
        <div className={styles.sidebar}>
          {faqData.map((tab) => (
            <div
              key={tab.id}
              className={`${styles.sidebarItem} ${
                activeTabId === tab.id ? styles.activeItem : ""
              }`}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className={styles.starIcon}>☆</span>
              {tab.title}
            </div>
          ))}
        </div>

        {/* Right Content Area */}
        <div className={styles.faqContent}>
          {activeContent &&
            activeContent.questions.map((q, index) => (
              <div key={index} className={styles.accordionItem}>
                <div
                  className={styles.questionRow}
                  onClick={() => toggleQuestion(index)}
                >
                  <span>{q.question}</span>
                  <span
                    className={`${styles.arrow} ${
                      openQuestionIndex === index ? styles.arrowOpen : ""
                    }`}
                  >
                    ▼
                  </span>
                </div>

                {openQuestionIndex === index && (
                  <div className={styles.answer}>
                    {Array.isArray(q.answer) ? (
                      q.answer.map((line, i) => (
                        <p
                          key={i}
                          style={
                            i === 0
                              ? { fontWeight: "bold", marginBottom: "10px" }
                              : {}
                          }
                        >
                          {line}
                        </p>
                      ))
                    ) : (
                      <p>{q.answer}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;
