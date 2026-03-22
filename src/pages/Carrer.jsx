import React from "react";
// import styles from "./Carrer.module.css";

const Career = () => {
  const jobs = [
    {
      id: 1,
      title: "Graphic Designer",
      description:
        "Looking for a perfect workplace? Here is your chance to work at fast-growing e-commerce fashion brand....",
    },
    {
      id: 2,
      title: "Fashion Designer",
      description:
        "Looking for a perfect workplace? Here is your chance to work at fast-growing e-commerce fashion brand....",
    },
    {
      id: 3,
      title: "Copywriter",
      description:
        "Looking for a perfect workplace? Here is your chance to work at fast-growing e-commerce fashion brand....",
    },
    {
      id: 4,
      title: "Content Writer",
      description:
        "Looking for a perfect workplace? Here is your chance to work at fast-growing e-commerce fashion brand....",
    },
    {
      id: 5,
      title: "Social Media Executive",
      description:
        "Looking for a perfect workplace? Here is your chance to work at fast-growing e-commerce fashion brand....",
    },
    {
      id: 6,
      title: "SEO Executive",
      description:
        "Looking for a perfect workplace? Here is your chance to work at fast-growing e-commerce fashion brand....",
    },
    {
      id: 7,
      title: "Google Ads Executive",
      description:
        "Looking for a perfect workplace? Here is your chance to work at fast-growing e-commerce fashion brand....",
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.heroSection}>
        <img
          src="./public/carrerPosterjpg.jpg"
          alt="Beyoung Office Culture"
          className={styles.heroImage}
        />
      </div>

      <h1 className={styles.pageTitle}>Join Beyoung Family</h1>

      <div className={styles.grid}>
        {jobs.map((job) => (
          <div key={job.id} className={styles.card}>
            <div>
              <h2 className={styles.jobTitle}>{job.title}</h2>
              <p className={styles.jobDescription}>{job.description}</p>
            </div>

            <button className={styles.readMoreBtn}>Read More</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Career;
