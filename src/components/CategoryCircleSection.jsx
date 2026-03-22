import React, { useEffect } from "react";
import styles from "./CategoryCirlceSection.module.css";
import { useNavigate } from "react-router-dom";

const CategoryCircleSection = ({ section, posters }) => {
  useEffect(() => {
    console.log(section.posters[0].title);

  }, [])
  
  const navigate = useNavigate();

 const handleClick = (tag) => {
  if (!tag) return;

  let tagSlug = tag
    .toLowerCase()
    .trim()
    .replace(/-category$/i, "") 
    .replace(/\s+/g, "-");     

  navigate(`/products/subcategory/${tagSlug}`);
};

  const defaultImages = [
    "/images/shirt.png",
    "/images/trouser.png",
    "/images/combos.png",
    "/images/tshirt.png",
    "/images/jeans.png",
    "/images/polos.png",
  ];

  const items = posters?.length
    ? posters.map((p, i) => ({
        image: p.image,
        title: p.tag || section.tags[i],
      }))
    : section.tags.map((tag, i) => ({
        image: defaultImages[i % defaultImages.length],
        title: tag,
      }));
// console.log(items);

  return (
    <div className={styles.categorySection}>
      <h3 className={styles.title}>{posters.posters}</h3>
      <div className={styles.scrollContainer}>
        {items.map((item, i) => (
          <div
            key={i}
            className={styles.circleCard}
            onClick={() => handleClick(item)}
          >
            <div className={styles.circleImage}>
              <img src={item.image} alt={item.title} />
            </div>
            <p className={styles.circleLabel}>{item.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryCircleSection;
