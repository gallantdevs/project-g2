import React from "react";
import styles from "./ComboCard.module.css";
import { useNavigate } from "react-router-dom";

export default function ComboCard({ combo }) {
  const navigate = useNavigate();

  const mainImage =
    combo.products?.[0]?.variants?.[0]?.images?.[0]?.url || "/no-image.jpg";

  const discountPercent = combo.originalPrice
    ? Math.round(
        ((combo.originalPrice - combo.comboPrice) / combo.originalPrice) * 100
      )
    : 0;

  return (
    <div
      className={styles.comboCard}
      onClick={() => navigate(`/combo/${combo.slug}`)}
    >
      <div className={styles.imageContainer}>
        <img src={mainImage} alt={combo.name} className={styles.productImage} />
        {discountPercent > 0 && (
          <span className={styles.discountBadge}>{discountPercent}% OFF</span>
        )}
        <span className={styles.comboBadge}>PICK ANY {combo.maxSelection}</span>
      </div>

      <div className={styles.productInfo}>
        <h3 className={styles.productName}>{combo.name}</h3>

        <div className={styles.comboProducts}>
          {combo.products.slice(0, 2).map((p) => (
            <span key={p._id} className={styles.comboProductName}>
              {p.title}
            </span>
          ))}
          {combo.products.length > 2 && (
            <span className={styles.moreProducts}>
              +{combo.products.length - 2} more
            </span>
          )}
        </div>

        <div className={styles.priceContainer}>
          <span className={styles.currentPrice}>₹{combo.comboPrice}</span>
          {combo.originalPrice && (
            <>
              <span className={styles.originalPrice}>
                ₹{combo.originalPrice}
              </span>
              <span className={styles.discount}>({discountPercent}% OFF)</span>
            </>
          )}
        </div>

        <div className={styles.pickInfo}>
          Select {combo.minSelection} to {combo.maxSelection} items
        </div>
      </div>
    </div>
  );
}
