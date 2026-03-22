import React, { useState, useContext, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductContext } from "../Context/ProductContext.jsx";
import { CartContext } from "../Context/CartContext.jsx";
import TrustBadges from "../components/TrustBadges.jsx";
import ProductGrid from "../components/ProductGrid.jsx";
import s from "./ProductDetails.module.css";
import { checkDelivery } from "../Services/shiprocketService";
import SaveExtraOffer from "../components/SaveExtraOffer.jsx";
import { AuthContext } from "../Context/AuthContext.jsx";

const ProductDetails = () => {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { products, loading } = useContext(ProductContext) || {};
  const { add } = useContext(CartContext);
  const { token } = useContext(AuthContext);

  // Find product
  const product = useMemo(
    () => products?.find((p) => String(p._id || p.id) === String(routeId)),
    [products, routeId]
  );

  const GetDeliveryDate = () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 6);
    const options = { weekday: "short", day: "numeric", month: "short" };
    const formattedDate = currentDate.toLocaleDateString("en-GB", options);
    return formattedDate;
  };

  const variants = product?.variants ?? [];
  const swatches = useMemo(() => {
    return variants
      .map((v) => ({ color: v.color, img: v.images?.[0]?.url || "" }))
      .filter((x) => x.img);
  }, [variants]);

  const [selectedColor, setSelectedColor] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [openAccordion, setOpenAccordion] = useState("specs");
  const [missingField, setMissingField] = useState(null);
  const [recentViewIds, setRecentViewIds] = useState([]);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const scrollContainerRef = useRef(null);
  const scrollDebounce = useRef(null);

  const handleIndicatorClick = (index) => {
    setSelectedImage(index); 

    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        left: clientWidth * index,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = () => {
    if (scrollDebounce.current) {
      clearTimeout(scrollDebounce.current);
    }

    scrollDebounce.current = setTimeout(() => {
      if (!scrollContainerRef.current) return;

      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      const newIndex = Math.round(scrollLeft / clientWidth); 

      if (newIndex !== selectedImage) {
        setSelectedImage(newIndex);
      }
    }, 100); 
  };
  const handleCheckDelivery = async () => {
    if (!pincode || pincode.length !== 6) {
      alert("Please enter a valid 6-digit pincode.");
      return;
    }

    setDeliveryLoading(true);
    setDeliveryInfo(null);

    try {
      const result = await checkDelivery(pincode);
      if (result.success) {
        const estimated =
          result.estimatedDelivery && result.estimatedDelivery !== "N/A"
            ? result.estimatedDelivery
            : "3–5 Days";

        setDeliveryInfo({
          status: "available",
          message: `Delivery by ${estimated}`,
        });
      } else {
        setDeliveryInfo({
          status: "unavailable",
          message: "❌ Delivery not available for this pincode.",
        });
      }
    } catch (error) {
      console.error("Delivery check error:", error);
      setDeliveryInfo({
        status: "error",
        message: "Something went wrong while checking delivery.",
      });
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Recently viewed
  useEffect(() => {
    if (product) {
      setRecentViewIds((prev) => {
        const filtered = prev.filter((id) => id !== routeId);
        return [routeId, ...filtered].slice(0, 10);
      });
    }
  }, [product, routeId]);

  // Default color
  useEffect(() => {
    if (variants.length > 0 && !selectedColor) {
      const firstVariant = variants[0];
      setSelectedColor(firstVariant.color || "");
      setSelectedImage(0);
    }
  }, [variants, selectedColor]);

  // Current variant
  const currentVariant = useMemo(
    () => variants.find((v) => v.color === selectedColor) ?? variants[0],
    [variants, selectedColor]
  );

  // Images
  const productImages = useMemo(
    () => currentVariant?.images?.map((i) => i.url).filter(Boolean) ?? [],
    [currentVariant]
  );

  // Normalized sizes
  const normalizedSizes = useMemo(() => {
    const raw = currentVariant?.sizes;

    if (!raw || !Array.isArray(raw) || raw.length === 0) {
      return null;
    }

    return raw
      .map((sz) => {
        if (typeof sz === "string") {
          return { size: sz, totalQty: 0, reservedQty: 0 };
        }

        if (typeof sz === "object" && sz !== null) {
          if (sz.size) {
            return {
              size: sz.size || "",
              totalQty: Number(sz.totalQty || 0),
              reservedQty: Number(sz.reservedQty || 0),
            };
          }

          let sizeStr = "";
          let idx = 0;
          while (sz[idx] !== undefined) {
            sizeStr += sz[idx];
            idx++;
          }

          return {
            size: sizeStr.trim() || "",
            totalQty: Number(sz.totalQty || 0),
            reservedQty: Number(sz.reservedQty || 0),
          };
        }

        return { size: "", totalQty: 0, reservedQty: 0 };
      })
      .filter((sz) => sz.size);
  }, [currentVariant]);

  // Fallback sizes
  const fallbackSizes = ["S", "M", "L", "XL", "XXL", "3XL"];

  // Add to cart
  const addToCartHandler = () => {
    if (!token) {
      return alert("Please Login first After Add item to cart");
    }
    if (!selectedColor || !selectedSize) {
      alert("Please select color and size");
      return;
    }
    const payload = {
      productId: product._id,
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
    };
    add(payload);
  };

  // Buy now
  const buyNowHandler = () => {
    if (!selectedColor) {
      setMissingField("color");
      return;
    }
    if (!selectedSize) {
      setMissingField("size");
      return;
    }
    setMissingField(null);
    add({
      productId: product._id || product.id,
      color: selectedColor,
      size: selectedSize,
      quantity,
    });
    navigate("/checkout");
  };

  // Recently viewed products
  const recentProducts = useMemo(() => {
    return recentViewIds
      .filter((id) => id !== routeId)
      .slice(0, 6)
      .map((id) => products?.find((p) => String(p._id || p.id) === String(id)))
      .filter(Boolean);
  }, [products, routeId, recentViewIds]);

  // Similar products
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return (
      products
        ?.filter((p) => {
          const isSameProduct = String(p._id || p.id) === String(routeId);
          const isSameCategory = p.category?.name === product.category?.name;
          const isSameSubcategory =
            p.subcategory?.name === product.subcategory?.name;
          return !isSameProduct && (isSameSubcategory || isSameCategory);
        })
        .slice(0, 8) || []
    );
  }, [products, product, routeId]);

  if (loading || !products) {
    return (
      <div className={s.fullscreenCenter}>
        <div className={s.loader}>Loading…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={s.fullscreenCenter}>
        <div className={s.notFound}>Product not found</div>
      </div>
    );
  }

  
  const mrp = product.price;
  const effectivePrice = product.discountPrice ?? mrp;
  const discountPct =
    mrp && mrp > effectivePrice
      ? Math.round(((mrp - effectivePrice) / mrp) * 100)
      : 0;

  
  const getAvail = (szObj) =>
    Math.max(0, Number(szObj?.totalQty || 0) - Number(szObj?.reservedQty || 0));

  const lowStockThreshold =
    product?.stock?.lowStockThreshold != null
      ? Number(product.stock.lowStockThreshold)
      : 2;

  const dynamicTitle = useMemo(() => {
    if (!product || !product.title || variants.length === 0) {
      return "Product Title"; 
    }

    const baseTitle = product.title; 
    const defaultColor = variants[0]?.color; 
    if (!selectedColor || !defaultColor || selectedColor === defaultColor) {
      return baseTitle; 
    }

    
    const regex = new RegExp(defaultColor, "i");

    if (regex.test(baseTitle)) {
      return baseTitle.replace(regex, selectedColor);
    }

    return `${selectedColor} ${baseTitle}`;
  }, [product, variants, selectedColor]);

  return (
    <div className={s.page}>
      <div className={s.breadcrumb}>
        Home / {product.category?.name ?? "Category"} / {product.title}
      </div>

      {/* Top Section */}
      <div className={s.grid}>
        <div className={s.galleryFlex}>
          <div className={s.thumbnailList}>
            {productImages.map((imgUrl, i) => (
              <button
                key={`thumb-${i}`}
                className={`${s.thumbBtn} ${
                  i === selectedImage ? s.thumbBtnActive : ""
                }`}
                onClick={() => handleIndicatorClick(i)}
                aria-label={`View image ${i + 1}`}
              >
                <img src={imgUrl} alt={`thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>

          <div
            className={s.mainImageFlex}
            ref={scrollContainerRef}
            onScroll={handleScroll} 
          >
            {productImages.length ? (
              productImages.map((imgSrc, i) => (
                <div className={s.mainImageSlide} key={`slide-${i}`}>
                  <img
                    src={imgSrc}
                    alt={`${product.title} ${i + 1}`}
                    className={s.mainImgEl}
                  />
                </div>
              ))
            ) : (
              <div className={s.noImage}>No Image</div>
            )}
          </div>

          <div className={s.purchased}>
            <img width="20" height="20" src="/fire.svg" />
            <p>
              <span> Limited Edition: Own Before They're Gone!</span>
            </p>
          </div>

          <div className={s.dotIndicators}>
            {productImages.map((img, i) => (
              <button
                key={`dot-${i}`}
                className={`${s.dot} ${i === selectedImage ? s.dotActive : ""}`}
                onClick={() => handleIndicatorClick(i)}
                aria-label={`View image ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right Info */}
        <div className={s.infoColSticky}>
          <div className={s.infoCol}>
            {/* <h1 className={s.title}>{product.title}</h1> */}
            <h1 className={s.title}>{dynamicTitle}</h1>
            <div className={s.priceWrap}>
              <span className={s.price}>₹{effectivePrice}</span>
              {mrp > effectivePrice && (
                <>
                  <span className={s.mrp}>₹{mrp}</span>
                  <span className={s.off}>({discountPct}% OFF)</span>
                </>
              )}
            </div>

            <div className={s.block}>
              <div className={s.blockHead}>Color</div>
              <div className={s.swatchGrid}>
                {swatches.map((sw, idx) => (
                  <button
                    key={`${sw.color}-${idx}`}
                    className={`${s.swatch} ${
                      selectedColor === sw.color ? s.swatchActive : ""
                    }`}
                    onClick={() => {
                      setSelectedColor(sw.color);
                      setSelectedImage(0);
                      setSelectedSize("");
                      setMissingField(null);
                    }}
                  >
                    <img src={sw.img} alt={sw.color} className={s.swatchImg} />
                  </button>
                ))}
              </div>
            </div>

            {/* Size */}
            <div className={s.block}>
              <div className={s.blockHead}>Size</div>
              <div className={s.sizeGrid}>
                {normalizedSizes && normalizedSizes.length > 0
                  ? normalizedSizes.map((szObj, idx) => {
                      const avail = getAvail(szObj);
                      const isLowStock =
                        avail > 0 && avail <= lowStockThreshold;
                      const isOutOfStock = avail <= 0;

                      return (
                        <button
                          key={idx}
                          className={`${s.sizeBtn} ${
                            selectedSize === szObj.size ? s.sizeBtnActive : ""
                          } ${isOutOfStock ? s.sizeBtnDisabled : ""}`}
                          onClick={() => {
                            if (!isOutOfStock) {
                              setSelectedSize(szObj.size);
                              setMissingField(null);
                            }
                          }}
                          disabled={isOutOfStock}
                        >
                          <div className={s.sizeTextWrapper}>
                            <div>{szObj.size}</div>
                            {isLowStock && (
                              <div className={`${s.lowStockText} ${s.blink}`}>
                                {avail} left
                              </div>
                            )}
                            {isOutOfStock && (
                              <div className={s.outOfStockText}>Out</div>
                            )}
                          </div>

                          {isOutOfStock && (
                            <span className={s.outOfStockBadge}>Out</span>
                          )}
                        </button>
                      );
                    })
                  : fallbackSizes.map((sz, idx) => (
                      <button
                        key={idx}
                        className={`${s.sizeBtn} ${
                          selectedSize === sz ? s.sizeBtnActive : ""
                        }`}
                        onClick={() => {
                          setSelectedSize(sz);
                          setMissingField(null);
                        }}
                      >
                        {sz}
                      </button>
                    ))}
              </div>
            </div>

            {/* CTA */}
            <div className={s.ctaRow}>
              <button
                className={s.addToCart}
                onClick={addToCartHandler}
                type="button"
              >
                Add to Cart
              </button>
              <button
                className={s.buyNow}
                onClick={buyNowHandler}
                type="button"
              >
                Buy Now
              </button>
            </div>

            {/* Delivery */}
            <div className={s.card}>
              <div className={s.blockHead}>Check Delivery</div>
              <div className={s.pinRow}>
                <input
                  className={s.pinInput}
                  placeholder="Enter Pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  maxLength={6}
                />
                <button
                  className={s.pinBtn}
                  type="button"
                  onClick={handleCheckDelivery}
                  disabled={deliveryLoading}
                >
                  {deliveryLoading ? "Checking..." : "Check"}
                </button>
              </div>

              {deliveryInfo && (
                <p
                  style={{
                    marginTop: "8px",
                    fontWeight: "bold",
                    color:
                      deliveryInfo.status === "unavailable" ? "red" : "black",
                  }}
                  dangerouslySetInnerHTML={{ __html: deliveryInfo.message }}
                />
              )}

              <ul className={s.metaList}>
                <li className={s.deliveryInfo}>
                  <img src="/Delevery icon/free-shippin.svg" alt="" /> Free
                  Delivery on All Orders
                </li>
                <li className={s.deliveryInfo}>
                  <img src="/Delevery icon/cod-pincode.svg" alt="" /> Cash on
                  Delivery Available
                </li>
              </ul>
            </div>
            <div className={s.strip}>
              <img src="/PDP-Strip-navratri-theme.jpg" alt="offer strip" />
            </div>

            <div className={s.saveExtra}>
              <SaveExtraOffer price={effectivePrice} />
            </div>

            {/* Accordions */}
            <div className={s.accordion}>
              <div className={s.accItem}>
                <button
                  className={s.accHead}
                  onClick={() =>
                    setOpenAccordion(openAccordion === "specs" ? "" : "specs")
                  }
                  type="button"
                >
                  Specifications
                </button>
                {openAccordion === "specs" && (
                  <div className={s.accBody}>
                    <div className={s.specGrid}>
                      <div>
                        <div className={s.specLabel}>Fabric</div>
                        <div className={s.specValue}>
                          {product.details?.fabric ?? "100% Cotton"}
                        </div>
                      </div>
                      <div>
                        <div className={s.specLabel}>Fit</div>
                        <div className={s.specValue}>
                          {product.details?.fit ?? "Regular"}
                        </div>
                      </div>
                      <div>
                        <div className={s.specLabel}>Neck</div>
                        <div className={s.specValue}>
                          {product.details?.neck ?? "Round Neck"}
                        </div>
                      </div>
                      <div>
                        <div className={s.specLabel}>Sleeves</div>
                        <div className={s.specValue}>
                          {product.details?.sleeves ?? "Half Sleeves"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className={s.accItem}>
                <button
                  className={s.accHead}
                  onClick={() =>
                    setOpenAccordion(openAccordion === "desc" ? "" : "desc")
                  }
                  type="button"
                >
                  Description
                </button>
                {openAccordion === "desc" && (
                  <div className={s.accBody}>
                    <p className={s.p}>{product.description}</p>
                  </div>
                )}
              </div>

              <div className={s.accItem}>
                <button
                  className={s.accHead}
                  onClick={() =>
                    setOpenAccordion(
                      openAccordion === "returns" ? "" : "returns"
                    )
                  }
                  type="button"
                >
                  Returns, Exchange & Refund Policy
                </button>
                {openAccordion === "returns" && (
                  <div className={s.accBody}>
                    <ul>
                      <li>7 days easy return & exchange.</li>
                      <li>Free shipping on all orders.</li>
                      <li>Refunds processed to original method or wallet.</li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <TrustBadges />
      <ProductGrid products={recentProducts} title="Recently Viewed Products" />
      <ProductGrid products={similarProducts} title="Similar Products" />
    </div>
  );
};

export default ProductDetails;
