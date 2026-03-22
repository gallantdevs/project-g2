import React, { useEffect, useState, useContext, useMemo, useRef } from "react";
import { useParams } from "react-router-dom";
import { getComboBySlug } from "../Services/comboService.js";
import { CartContext } from "../Context/CartContext.jsx";
import { ComboContext } from "../Context/ComboContext.jsx";
import { ProductContext } from "../Context/ProductContext.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import styles from "./ComboDetails.module.css";
import { checkDelivery } from "../Services/shiprocketService.js";
import Select from "react-select";

import { normalizeColorToFamily, getColorHex } from "../utils/FormatHelpers.jsx";

/* ============================
   Color dropdown components
============================ */
const ColorOption = (props) => {
  const { innerProps, isDisabled, data, isFocused, isSelected } = props;
  if (isDisabled) return null;
  return (
    <div
      {...innerProps}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 10px",
        background: isSelected ? "#e0e8f5" : isFocused ? "#f0f0f0" : "#fff",
        cursor: "pointer",
      }}
      title={data.label}
    >
      <span
        style={{
          width: 22,
          height: 22,
          borderRadius: "999px",
          border: "1px solid #e5e7eb",
          background: data.hex,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      />
      <span style={{ fontSize: 13, color: "#111" }}>{data.label}</span>
    </div>
  );
};

const ColorSingleValue = (props) => {
  const { data } = props;
  return (
    <div
      title={data.label}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        paddingLeft: 2,
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "999px",
          border: "1px solid #e5e7eb",
          background: data.hex,
          boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)",
        }}
      />
      <span style={{ fontSize: 12 }}>{data.label}</span>
    </div>
  );
};

const customComboStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#fff",
    borderColor: "#ddd",
    fontSize: "0.85rem",
    minHeight: "42px",
    boxShadow: "none",
    "&:hover": { borderColor: "#bbb" },
  }),
  menu: (p) => ({
    ...p,
    backgroundColor: "white",
    zIndex: 9999,
    fontSize: "0.85rem",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#e0e8f5"
      : state.isFocused
      ? "#f0f0f0"
      : "white",
    color: "black",
    cursor: "pointer",
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#999",
  }),
};

const ComboDetails = () => {
  const { slug } = useParams();
  const { addCombo } = useContext(CartContext);
  const { combos } = useContext(ComboContext);
  const { products } = useContext(ProductContext);

  const [combo, setCombo] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedCombo, setSelectedCombo] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [openAccordion, setOpenAccordion] = useState("specs");
  const [pincode, setPincode] = useState("");
  const [recentSlugs, setRecentSlugs] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState(null);
  const [checking, setChecking] = useState(false);

  const scrollContainerRef = useRef(null);
  const scrollDebounce = useRef(null);

  const loadCombo = async () => {
    setLoading(true);
    try {
      const data = await getComboBySlug(slug);
      setCombo(data);
      setRecentSlugs((prev) => {
        const filtered = prev.filter((s) => s !== slug);
        return [slug, ...filtered].slice(0, 8);
      });
    } catch (err) {
      console.error("Failed to load combo:", err?.message || err);
      setCombo(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCombo();
  }, [slug]);

  useEffect(() => {
    if (combo?.maxSelection) {
      const initialCombo = Array(combo.maxSelection)
        .fill(null)
        .map(() => ({ productId: "", color: "", size: "" }));
      setSelectedCombo(initialCombo);
    } else {
      setSelectedCombo([]);
    }
  }, [combo]);

  const productOptions = useMemo(() => {
    if (!combo) return [];
    return combo.products.map((prod) => {
      const colors = [
        ...new Set((prod.variants || []).map((v) => v.color).filter(Boolean)),
      ];
      const allSizes = (prod.variants || [])
        .flatMap((v) =>
          Array.isArray(v.sizes)
            ? v.sizes.map((sz) => (typeof sz === "string" ? sz : sz?.size))
            : []
        )
        .filter(Boolean);
      const sizes = [...new Set(allSizes)];
      return {
        productId: prod._id,
        title: prod.title || prod.name,
        price: prod.price,
        colors,
        sizes,
      };
    });
  }, [combo]);

  const defaultImageByProductId = useMemo(() => {
    if (!combo) return {};
    const map = {};
    combo.products.forEach((p) => {
      const url = p?.variants?.[0]?.images?.[0]?.url;
      if (url) map[p._id] = url;
    });
    return map;
  }, [combo]);

  const galleryImageUrls = useMemo(() => {
    if (!combo) return [];

    const urls = [];
    if (combo.thumbnailImage) urls.push(combo.thumbnailImage);

    let anyRowAdded = false;

    if (Array.isArray(selectedCombo)) {
      selectedCombo.forEach((row) => {
        if (!row) return;

        if (row.productId && row.color) {
          const prod = combo.products.find((p) => p._id === row.productId);
          const variant = prod?.variants?.find(
            (v) =>
              (v?.color || "").toLowerCase().trim() ===
              row.color.toLowerCase().trim()
          );
          const url = variant?.images?.[0]?.url || defaultImageByProductId[row.productId];
          if (url) {
            urls.push(url);
            anyRowAdded = true;
          }
        } else if (row.productId) {
          const url = defaultImageByProductId[row.productId];
          if (url) {
            urls.push(url);
            anyRowAdded = true;
          }
        }
      });
    }

    if (!anyRowAdded && combo?.products) {
      combo.products
        .slice(0, combo.maxSelection)
        .forEach((p) => {
          const url = defaultImageByProductId[p._id];
          if (url) urls.push(url);
        });
    }

    return Array.from(new Set(urls.filter(Boolean)));
  }, [combo, selectedCombo, defaultImageByProductId]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [galleryImageUrls.length]);

  useEffect(() => {
    if (!combo) return;
    setSelectedCombo((prev) =>
      prev.map((row) => {
        const prod = combo.products.find((p) => p._id === row?.productId);
        const colors = [
          ...new Set((prod?.variants || []).map((v) => v.color).filter(Boolean)),
        ];
        if (row?.productId && colors.length === 1 && !row?.color) {
          return { ...row, color: colors[0] };
        }
        return row;
      })
    );
  }, [selectedCombo.map((r) => r?.productId).join(","), combo]);

  const handleIndicatorClick = (index) => {
    setSelectedImageIndex(index);
    if (window.innerWidth < 1024 && scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        left: clientWidth * index,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollDebounce.current) clearTimeout(scrollDebounce.current);
    scrollDebounce.current = setTimeout(() => {
      if (!scrollContainerRef.current) return;
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== selectedImageIndex) {
        setSelectedImageIndex(newIndex);
      }
    }, 100);
  };

  const discountBadge = useMemo(
    () =>
      combo?.originalPrice && combo?.originalPrice > combo?.comboPrice
        ? Math.round(
            ((combo.originalPrice - combo.comboPrice) / combo.originalPrice) *
              100
          )
        : 0,
    [combo]
  );

  const similarCombos = useMemo(() => {
    if (!combo || !combos) return [];
    return combos
      .filter((c) => c.slug !== slug && c.category === combo.category)
      .slice(0, 6)
      .map((c) => ({
        _id: c._id,
        id: c._id,
        title: c.name,
        price: c.originalPrice,
        discountPrice: c.comboPrice,
        variants: [
          {
            images: [
              {
                url:
                  c.products?.[0]?.variants?.[0]?.images?.[0]?.url ||
                  "/no-image.jpg",
              },
            ],
          },
        ],
        isCombo: true,
        slug: c.slug,
      }));
  }, [combo, combos, slug]);

  const relatedProducts = useMemo(() => {
    if (!combo || !products) return [];
    return products
      .filter((p) => p.category === combo.category)
      .slice(0, 6)
      .map((p) => ({
        _id: p._id,
        id: p._id,
        title: p.title || p.name,
        price: p.price,
        discountPrice: p.discountPrice,
        variants: p.variants,
        isCombo: false,
        slug: p.slug,
      }));
  }, [combo, products]);

  const recentCombos = useMemo(() => {
    if (!combos || combos.length === 0) return [];
    return recentSlugs
      .filter((s) => s !== slug)
      .slice(0, 6)
      .map((viewedSlug) => {
        const c = combos.find((combo) => combo.slug === viewedSlug);
        if (!c) return null;
        return {
          _id: c._id,
          id: c._id,
          title: c.name,
          price: c.originalPrice,
          discountPrice: c.comboPrice,
          variants: [
            {
              images: [
                {
                  url:
                    c.products?.[0]?.variants?.[0]?.images?.[0]?.url ||
                    "/no-image.jpg",
                },
              ],
            },
          ],
          isCombo: true,
          slug: c.slug,
        };
      })
      .filter(Boolean);
  }, [combos, recentSlugs, slug]);

  const allSelected = useMemo(() => {
    if (!combo?.maxSelection) return false;
    if (selectedCombo.length !== combo.maxSelection) return false;
    return selectedCombo.every((item) => {
      return (
        item &&
        item.productId &&
        item.productId !== "" &&
        item.color &&
        item.color !== "" &&
        item.size &&
        item.size !== ""
      );
    });
  }, [selectedCombo, combo?.maxSelection]);

  const handleAddToCart = async () => {
    if (!allSelected) {
      console.warn("Please select product, color, and size for all items!");
      return;
    }
    try {
      const comboData = {
        comboSlug: combo.slug,
        comboItems: selectedCombo.map((item) => ({
          productId: item.productId,
          color: item.color,
          size: item.size,
        })),
        comboPrice: combo.comboPrice,
        quantity: 1,
      };
      await addCombo(comboData);
    } catch (error) {
      console.error("Failed to add combo:", error);
    }
  };

  const handleChange = (idx, field, value) => {
    setSelectedCombo((prev) => {
      const newCombo = [...prev];
      if (!newCombo[idx]) {
        newCombo[idx] = { productId: "", color: "", size: "" };
      }
      newCombo[idx] = { ...newCombo[idx], [field]: value };
      if (field === "productId") {
        newCombo[idx].color = "";
        newCombo[idx].size = "";
      }
      return newCombo;
    });
  };

  const handlePincodeCheck = async () => {
    if (!pincode) {
      console.warn("Please enter a pincode");
      return;
    }
    try {
      setChecking(true);
      const data = await checkDelivery(pincode);
      if (
        data.success &&
        data.estimatedDelivery &&
        data.estimatedDelivery !== "N/A"
      ) {
        setDeliveryDate(data.estimatedDelivery);
      } else {
        setDeliveryDate("Not Available");
      }
    } catch (error) {
      console.error("Error checking delivery:", error);
      setDeliveryDate("Error fetching delivery info");
    } finally {
      setChecking(false);
    }
  };

  if (loading) {
    return <div className={styles.loader}>Loading Combo...</div>;
  }

  if (!combo) {
    return (
      <div className={styles.page}>
        <div style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
        }}>
          <h2>There is no combo item for selected category</h2>
        </div>
      </div>
    );
  }


  return (
    <div className={styles.page}>
      <div className={styles.breadcrumb}>
        Home / Mens Clothing / Shirts / Combo / {combo.name}
      </div>

      <div className={styles.productContainer}>
        <div className={styles.thumbnailGallery}>
          {galleryImageUrls.map((url, idx) => (
            <button
              key={`thumb-${idx}`}
              className={`${styles.thumbnail} ${
                selectedImageIndex === idx ? styles.thumbnailActive : ""
              }`}
              onClick={() => handleIndicatorClick(idx)}
            >
              <img src={url} alt={`Thumbnail ${idx + 1}`} />
            </button>
          ))}
        </div>

        <div className={styles.imageSection}>
          {discountBadge > 0 && (
            <div className={styles.discountBadge}>
              YOU SAVE ₹{combo.originalPrice - combo.comboPrice}
            </div>
          )}
          <div className={styles.comboBadge}>PICK ANY {combo.maxSelection}</div>

          <div
            className={styles.mainImageContainer}
            ref={scrollContainerRef}
            onScroll={handleScroll}
          >
            {galleryImageUrls.length > 0 ? (
              galleryImageUrls.map((url, idx) => (
                <div
                  className={`${styles.mainImageSlide} ${
                    idx === selectedImageIndex ? styles.activeSlide : ""
                  }`}
                  key={`slide-${idx}`}
                >
                  <img
                    src={url}
                    alt={`${combo.name} ${idx + 1}`}
                    className={styles.mainImage}
                  />
                </div>
              ))
            ) : (
              <div className={styles.mainImageSlide}>
                <img
                  src="/no-image.jpg"
                  alt="No image available"
                  className={styles.mainImage}
                />
              </div>
            )}
          </div>

          <div className={styles.purchased}>
            <img width="20" height="20" src="/heart.svg" alt="Popular" />
            <p>
              <span>
                <strong style={{ fontWeight: "bold", color: "black" }}>
                  17.5K
                </strong>{" "}
                Shopper Purchased In Last 30 Days
              </span>
            </p>
          </div>

          <div className={styles.dotIndicators}>
            {galleryImageUrls.map((_, idx) => (
              <button
                key={`dot-${idx}`}
                className={`${styles.dot} ${
                  selectedImageIndex === idx ? styles.dotActive : ""
                }`}
                onClick={() => handleIndicatorClick(idx)}
                aria-label={`View image ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <div className={styles.productInfo}>
          <h1 className={styles.productTitle}>{combo.name}</h1>

          <div className={styles.rating}>
            <span className={styles.ratingStars}>★★★★★</span>
            <span className={styles.ratingCount}>(1192)</span>
          </div>

          <div className={styles.priceSection}>
            <span className={styles.currentPrice}>₹{combo.comboPrice}</span>
            {combo.originalPrice > combo.comboPrice && (
              <>
                <span className={styles.originalPrice}>
                  ₹{combo.originalPrice}
                </span>
                <span className={styles.saveTag}>
                  YOU SAVE ₹{combo.originalPrice - combo.comboPrice}
                </span>
              </>
            )}
          </div>

          <div className={styles.dealBox}>
            <div className={styles.dealApplied}>✓ Deal Applied</div>
            <div className={styles.dealInfo}>
              <strong>{combo.maxSelection} Combo Cotton Shirts</strong> at ₹
              {Math.round(combo.comboPrice / combo.maxSelection)} Each
            </div>
            <div className={styles.dealInfo}>
              <strong>{combo.maxSelection} Individual Shirts</strong> at ₹
              {Math.round(combo.products[0].price)} Each
            </div>
            <div className={styles.dealSavings}>
              You Saved ₹
              {Math.round(
                combo.products[0].price - combo.comboPrice / combo.maxSelection
              )}{" "}
              Instantly!
            </div>
          </div>

          <div className={styles.UPI}>
            <img
              src="/strip2.svg"
              alt="UPI Images"
              style={{ width: "100%", height: "100%" }}
            />
          </div>

          <div className={styles.selectComboSection}>
            <h3 className={styles.sectionTitle}>Select Combo</h3>
            {[...Array(combo.maxSelection)].map((_, idx) => {
              const selectedProduct = productOptions.find(
                (opt) => opt.productId === selectedCombo[idx]?.productId
              );

              const productSelectOptions = productOptions.map((opt) => ({
                value: opt.productId,
                label: opt.title,
              }));

              const colorSelectOptions =
                selectedProduct?.colors.map((color) => {
                  const family = normalizeColorToFamily(color);
                  const hex = getColorHex(family);
                  return { value: color, label: color, hex };
                }) || [];

              const sizeSelectOptions =
                selectedProduct?.sizes.map((size) => ({
                  value: size,
                  label: size,
                })) || [];

              return (
                <div key={idx} className={styles.comboSelectRow}>
                  <div className={styles.comboRowHeader}>
                    <span className={styles.colorLabel}>Product {idx + 1}</span>
                    <span className={styles.colorLabel}>Color {idx + 1}</span>
                    <span className={styles.sizeLabel}>Size {idx + 1}</span>
                  </div>
                  <div className={styles.selectRow}>
                    <Select
                      className={styles.selectDropdown}
                      options={productSelectOptions}
                      value={
                        productSelectOptions.find(
                          (opt) => opt.value === selectedCombo[idx]?.productId
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        handleChange(idx, "productId", selectedOption.value)
                      }
                      styles={customComboStyles}
                      placeholder="Select"
                      aria-label={`Select Product ${idx + 1}`}
                    />

                    <Select
                      className={styles.selectDropdown}
                      options={colorSelectOptions}
                      value={
                        colorSelectOptions.find(
                          (opt) => opt.value === selectedCombo[idx]?.color
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        handleChange(idx, "color", selectedOption.value)
                      }
                      styles={customComboStyles}
                      placeholder="Select"
                      isDisabled={!selectedCombo[idx]?.productId}
                      aria-label={`Select Color ${idx + 1}`}
                      components={{
                        Option: ColorOption,
                        SingleValue: ColorSingleValue,
                      }}
                      isSearchable={false}
                      menuPortalTarget={document.body}
                      menuPosition="fixed"
                    />

                    <Select
                      className={styles.selectDropdown}
                      options={sizeSelectOptions}
                      value={
                        sizeSelectOptions.find(
                          (opt) => opt.value === selectedCombo[idx]?.size
                        ) || null
                      }
                      onChange={(selectedOption) =>
                        handleChange(idx, "size", selectedOption.value)
                      }
                      styles={customComboStyles}
                      placeholder="Select"
                      isDisabled={!selectedCombo[idx]?.productId}
                      aria-label={`Select Size ${idx + 1}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <button
            className={styles.addToCartBtn}
            onClick={handleAddToCart}
            disabled={!allSelected}
          >
            ADD TO CART
          </button>

          <div className={styles.deliverySection}>
            <h4>Check Delivery Date</h4>
            <div className={styles.pincodeInput}>
              <input
                type="text"
                placeholder="Enter Pincode"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
              />
              <button onClick={handlePincodeCheck} disabled={checking}>
                {checking ? "Checking..." : "Check"}
              </button>
            </div>
            {deliveryDate && (
              <div className={styles.deliveryResult}>
                {deliveryDate === "Not Available" ? (
                  <p style={{ color: "red", fontWeight: "bold" }}>
                    ❌ Delivery Not Available
                  </p>
                ) : deliveryDate === "Error fetching delivery info" ? (
                  <p style={{ color: "orange", fontWeight: "bold" }}>
                    ⚠️ Error fetching info
                  </p>
                ) : (
                  <p style={{ color: "green", fontWeight: "bold" }}>
                    Delivery by <span>{deliveryDate}</span>
                  </p>
                )}
              </div>
            )}
            <ul className={styles.deliveryInfo}>
              <li>🚚 Free Shipping</li>
              <li>💵 Cash On Delivery Available</li>
              <li>🔄 Easy 15 Days Return & Exchange</li>
            </ul>
          </div>

          <div className={styles.accordion}>
            <div className={styles.accItem}>
              <button
                className={styles.accHead}
                onClick={() =>
                  setOpenAccordion(openAccordion === "specs" ? "" : "specs")
                }
              >
                Specifications {openAccordion === "specs" ? "−" : "+"}
              </button>
              {openAccordion === "specs" && (
                <div className={styles.accBody}>
                  <div className={styles.specGrid}>
                    <div>
                      <strong>Fabric:</strong> 100% Cotton
                    </div>
                    <div>
                      <strong>Fit:</strong> Regular
                    </div>
                    <div>
                      <strong>Neck:</strong> Collared
                    </div>
                    <div>
                      <strong>Sleeves:</strong> Full/Half
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.accItem}>
              <button
                className={styles.accHead}
                onClick={() =>
                  setOpenAccordion(openAccordion === "desc" ? "" : "desc")
                }
              >
                Description {openAccordion === "desc" ? "−" : "+"}
              </button>
              {openAccordion === "desc" && (
                <div className={styles.accBody}>
                  <p>
                    {combo.description ||
                      "Premium quality combo Items. Pick any combination of colors and sizes."}
                  </p>
                </div>
              )}
            </div>

            <div className={styles.accItem}>
              <button
                className={styles.accHead}
                onClick={() =>
                  setOpenAccordion(openAccordion === "returns" ? "" : "returns")
                }
              >
                Returns & Exchange {openAccordion === "returns" ? "−" : "+"}
              </button>
              {openAccordion === "returns" && (
                <div className={styles.accBody}>
                  <ul>
                    <li>7 days easy return & exchange</li>
                    <li>Free shipping on all orders</li>
                    <li>Refunds processed within 5-7 days</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TrustBadges />

      {recentCombos.length > 0 && (
        <ProductGrid
          products={recentCombos}
          title="Recently Viewed Combos"
          isCombo={true}
        />
      )}

      {similarCombos.length > 0 ? (
        <ProductGrid
          products={similarCombos}
          title="Similar Combos"
          isCombo={true}
        />
      ) : relatedProducts.length > 0 ? (
        <ProductGrid
          products={relatedProducts}
          title="You Might Also Like"
          isCombo={false}
        />
      ) : null}
    </div>
  );
};

export default ComboDetails;
