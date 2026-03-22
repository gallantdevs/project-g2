import React from "react";
import { useNavigate } from "react-router-dom";
import s from "./ProductGrid.module.css";

const ProductGrid = ({ products, title }) => {
  const navigate = useNavigate();

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <div className={s.productSection}>
      <h2 className={s.sectionTitle}>{title}</h2>
      <div className={s.productGrid}>
        {products.map((prod) => {
          const firstVariant = prod.variants?.[0];
          const firstImage = firstVariant?.images?.[0]?.url || "";
          const prodPrice = prod.discountPrice ?? prod.price;
          const prodMrp = prod.price;
          const prodDiscount =
            prodMrp && prodMrp > prodPrice
              ? Math.round(((prodMrp - prodPrice) / prodMrp) * 100)
              : 0;

          return (
            <div
              key={prod._id || prod.id}
              className={s.productCard}
              onClick={() => navigate(`/product/${prod._id || prod.id}`)}
            >
              <div className={s.productImageWrap}>
                {firstImage && (
                  <img
                    src={firstImage}
                    alt={prod.title}
                    className={s.productImage}
                  />
                )}
                {prodDiscount > 0 && (
                  <span className={s.productBadge}>{prodDiscount}% OFF</span>
                )}
              </div>
              <div className={s.productInfo}>
                <h3 className={s.productTitle}>{prod.title}</h3>
                <div className={s.productPriceRow}>
                  <span className={s.productPrice}>₹{prodPrice}</span>
                  {prodMrp > prodPrice && (
                    <span className={s.productMrp}>₹{prodMrp}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductGrid;
