import React, { useContext, useMemo, useState } from "react";
import styles from "./ProductCard.module.css";
import { useNavigate } from "react-router-dom";
import { WishListContext } from "../../Context/WishListContext.jsx";
import { AuthContext } from "../../Context/AuthContext.jsx";

export default function ProductCard({ product, onCategoryClick }) {
  const navigate = useNavigate();
  const { wishlist, addWishlistItem, removeWishlistItem } = useContext(WishListContext);
  const { user } = useContext(AuthContext);

  if (!product) return null;

  const title = product.title || product.slug || "Product Name";
  const originalPrice = product.price;
  const discountedPrice = product.discountPrice;
  const mainImage = product.variants?.[0]?.images?.[0]?.url;

  // 🧠 Check if this product is already in wishlist
  const isInWishlist = useMemo(() => {
    return wishlist?.some(
      (item) => item.productId?._id === product._id || item.productId === product._id
    );
  }, [wishlist, product._id]);

  // 🧩 Toggle wishlist on click
  const handleWishlistToggle = async (e) => {
    e.stopPropagation();
    if (!user?._id) {
      alert("Please login to use wishlist ❤️");
      return;
    }

    try {
      if (isInWishlist) {
        // Remove from wishlist
        const wishlistItem = wishlist.find(
          (item) => item.productId?._id === product._id || item.productId === product._id
        );
        if (wishlistItem?._id) {
          await removeWishlistItem(wishlistItem._id);
        }
      } else {
        // Add to wishlist
        await addWishlistItem(product._id);
      }
    } catch (error) {
      console.error("Wishlist toggle failed:", error);
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.imageContainer}>
        {mainImage && (
          <img
            src={mainImage}
            alt={title}
            className={styles.mainImage}
            loading="lazy"
            onClick={() => navigate(`/product/${product._id}`)}
          />
        )}

        <button
          className={styles.favoriteBtn}
          onClick={handleWishlistToggle}
          title={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          {isInWishlist ? (
            <span role="img" aria-label="remove">❤️</span>
          ) : (
            <span role="img" aria-label="save">🤍</span>
          )}
        </button>
      </div>

      <div className={styles.details}>
        <p className={styles.title}>{title}</p>

        <div className={styles.priceContainer}>
          {discountedPrice && discountedPrice < originalPrice ? (
            <>
              <span className={styles.discountPrice}>₹{discountedPrice}</span>
              <span className={styles.originalPrice}>₹{originalPrice}</span>
              <span className={styles.saveAmount}>
                (Save ₹{originalPrice - discountedPrice})
              </span>
            </>
          ) : (
            <span className={styles.currentPrice}>₹{originalPrice}</span>
          )}
        </div>

        {product.category?.name && (
          <button
            className={styles.categoryChip}
            onClick={() => onCategoryClick?.(product.category.name)}
          >
            {product.category.name}
          </button>
        )}
      </div>
    </div>
  );
}
