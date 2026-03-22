import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import styles from "./Home.module.css";
import ProductCard from "../components/ProductCard/ProductCard.jsx";
import { ProductContext } from "../Context/ProductContext.jsx";
import { PosterContext } from "../Context/PosterContext.jsx";
import { SectionContext } from "../Context/SectionContext.jsx";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();

  // Contexts
  const {
    products,
    categories,
    loading: productsLoading,
  } = useContext(ProductContext);

  const {
    poster: posters,
    loading: postersLoading,
    error: postersError,
    fetchPoster,
  } = useContext(PosterContext);

  const {
    sections,
    loading: sectionsLoading,
    error: sectionsError,
    fetchSections,
  } = useContext(SectionContext);

  // Local State
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("View All");

  // Refs
  const progressRef = useRef();
  const sectionRefs = useRef({});
  const reviewScrollRef = useRef(null);

  // Helper function to normalize strings for comparison (e.g., "T-shirts" -> "t-shirts")
  const normalize = (s) =>
    (s || "").toString().trim().toLowerCase().replace(/\s+/g, "-");

  // Allowed Categories for New Arrivals section
  const allowedNewArrivalNames = [
    "Shirts",
    "Gurkha Pants",
    "T-shirts",
    "Polo T-shirts",
    "Jeans",
    "Cargo Trousers",
  ];

  const allowedOrderMap = new Map(
    allowedNewArrivalNames.map((n, i) => [normalize(n), i])
  );
  const isAllowedNewArrival = (c) => {
    const nm = normalize(c?.name);
    const sg = normalize(c?.slug);
    return allowedOrderMap.has(nm) || allowedOrderMap.has(sg);
  };

  // --- START: New Arrival Products Filtering Logic ---
  const newArrivalProducts = useMemo(() => {
    const normalizedNewArrivalTag = normalize("New Arrival");

    return Array.isArray(products)
      ? products.filter(
          (p) =>
            Array.isArray(p.tags) &&
            p.tags.map((t) => normalize(t)).includes(normalizedNewArrivalTag)
        )
      : [];
  }, [products, normalize]);

  // STEP 2: Category/Tag Filter ke base per New Arrivals ko filter karna
  const filteredProducts = useMemo(() => {
    let productsToFilter = newArrivalProducts;

    if (selectedCategory === "View All") {
      return productsToFilter;
    }
    const normalizedSelectedCategory = normalize(selectedCategory);
    return productsToFilter.filter((p) => {
      const productTags = Array.isArray(p.tags)
        ? p.tags.map((t) => normalize(t))
        : [];

      return productTags.includes(normalizedSelectedCategory);
    });
  }, [newArrivalProducts, selectedCategory, normalize]);

  // --- END: New Arrival Products Filtering Logic ---
  // console.log("filteredProducts", filteredProducts);
  useEffect(() => {
    const safeSections = Array.isArray(sections) ? sections : [];
    safeSections.forEach((s) => {
      if (
        s.componentType === "scrollable" &&
        !sectionRefs.current[s.identifier]
      ) {
        sectionRefs.current[s.identifier] = React.createRef();
      }
    });
  }, [sections]);

  // Parse tags helper
  const parseTagsFromSection = (tags) => {
    if (!Array.isArray(tags)) return [];
    let parsedTags = [];
    tags.forEach((tag) => {
      if (typeof tag === "string") {
        if (tag.includes(",") || tag.includes('"')) {
          const cleanTag = tag.replace(/"/g, "").trim();
          const splitTags = cleanTag
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t.length > 0);
          parsedTags.push(...splitTags);
        } else {
          parsedTags.push(tag.trim());
        }
      }
    });
    return [...new Set(parsedTags.filter((tag) => tag && tag.length > 0))];
  };

  // Get filtered posters by tag
  const getFilteredPosters = (tag) => {
    const safePosters = Array.isArray(posters) ? posters : [];
    const filtered = safePosters.filter((p) => {
      const isActive = p.isActive;
      const cleanPosterTag = p.tag?.replace(/"/g, "").trim().toLowerCase();
      const cleanSearchTag = tag?.replace(/"/g, "").trim().toLowerCase();
      return isActive && cleanPosterTag === cleanSearchTag;
    });
    return filtered;
  };

  // Get posters matching any tags
  const getPostersForTags = (tags, sectionIdentifier) => {
    const parsedTags = parseTagsFromSection(tags);
    const allMatchingPosters = [];
    parsedTags.forEach((tag) => {
      const matchingPosters = getFilteredPosters(tag);
      allMatchingPosters.push(...matchingPosters);
    });
    const uniquePosters = allMatchingPosters.filter(
      (poster, index, array) =>
        array.findIndex((p) => p._id === poster._id) === index
    );
    return uniquePosters;
  };

  // Safe sections compute
  const safeSections = Array.isArray(sections) ? sections : [];

  const activeSectionsWithPosters = safeSections
    .filter((s) => s.isActive)
    .map((s) => {
      const sectionPosters = getPostersForTags(s.tags, s.identifier);
      return {
        ...s,
        posters: Array.isArray(sectionPosters) ? sectionPosters : [],
        parsedTags: parseTagsFromSection(s.tags),
      };
    })
    .filter(
      (s) => s.posters.length > 0 || s.componentType === "discount" // ✅ allow discount even if no posters
    );

  const handlePosterClick = (
    poster,
    isGridType = false,
    selectedTag = null
  ) => {
    let tagSlug = selectedTag || poster?.tag || "";

    if (tagSlug) {
      tagSlug = tagSlug.replace(/\s+/g, "-").toLowerCase();

      // 🧠 Combo tag detect karna aur detail page par bhejna
      if (tagSlug.includes("combo") || tagSlug.includes("pick-any")) {
        navigate(`/combo/${tagSlug}`);
        return;
      }

      // 🔸 Normal tag poster → product listing page
      navigate(`/products/tag/${tagSlug}`);
      return;
    }

    // 🟢 Category-based poster → go to category
    if (poster?.category) {
      const categoryType = poster.category.categoryType || "general";
      const categorySlug =
        poster.category.slug ||
        poster.category.name.replace(/\s+/g, "-").toLowerCase();
      navigate(`/products/${categoryType}/${categorySlug}`);
      return;
    }

    // 🟢 Redirect URL (internal/external)
    if (poster?.redirectUrl) {
      if (poster.redirectUrl.startsWith("/")) {
        navigate(poster.redirectUrl);
      } else {
        window.open(poster.redirectUrl, "_blank");
      }
      return;
    }

    // 🟢 Default fallback
    navigate("/products");
  };

  // Derive main carousel posters safely
  const mainCarousel = activeSectionsWithPosters.find(
    (s) => s.componentType === "carousel"
  );
  const mainCarouselPosters = Array.isArray(mainCarousel?.posters)
    ? mainCarousel.posters
    : [];
  const mainCarouselLength = mainCarouselPosters.length;

  // Carousel progress effect
  useEffect(() => {
    if (mainCarouselLength === 0) return;
    setProgress(0);
    progressRef.current = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 100 / (3000 / 50) : 100));
    }, 50);
    const timer = setTimeout(() => {
      setCurrent((prev) => (prev + 1) % mainCarouselLength);
    }, 3000);
    return () => {
      clearInterval(progressRef.current);
      clearTimeout(timer);
    };
  }, [current, mainCarouselLength]);

  // const CouponScroll = () => {
  //   const scrollRef = useRef(null);

  //   // 🔥 Double the coupons for seamless infinite scroll
  //   const coupons = [...Array(18)].map((_, i) => ({
  //     img: `/poster6.${(i % 9) + 1}${(i % 9) === 2 ? ".jpg" : ".png"}`,
  //   }));

  //   useEffect(() => {
  //     const container = scrollRef.current;
  //     if (!container) return;

  //     let isHovered = false;
  //     const enter = () => (isHovered = true);
  //     const leave = () => (isHovered = false);

  //     container.addEventListener("mouseenter", enter);
  //     container.addEventListener("mouseleave", leave);

  //     const timer = setInterval(() => {
  //       if (!isHovered && container) {
  //         container.scrollLeft += 2; // Smooth scroll speed

  //         // Reset to start for infinite loop
  //         if (container.scrollLeft >= container.scrollWidth / 2) {
  //           container.scrollLeft = 0;
  //         }
  //       }
  //     }, 20);

  //     return () => {
  //       clearInterval(timer);
  //       container.removeEventListener("mouseenter", enter);
  //       container.removeEventListener("mouseleave", leave);
  //     };
  //   }, []);

  //   return (
  //     <div className={styles.couponBarWrapper}>
  //       <div className={styles.couponLabel}>
  //         <span>🔥 COUPONS</span>
  //         <span>SAVE NOW</span>
  //       </div>
  //       <div className={styles.couponBar} ref={scrollRef}>
  //         {coupons.map((c, i) => (
  //           <img
  //             key={i}
  //             src={c.img}
  //             alt={`Coupon ${i}`}
  //             className={styles.couponImg}
  //           />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  const scroll = (ref, dir) => {
    const width = window.innerWidth < 700 ? 170 : 250;
    ref?.current?.scrollBy({
      left: dir === "left" ? -width : width,
      behavior: "smooth",
    });
  };

  const renderSection = (section) => {
    const { componentType, posters, title, subtitle, identifier } = section;
    // console.log("Poster", posters)
    switch (componentType) {
      case "CategoryCirlce":
        return (
          <div className={styles.categorySection}>
            {section.title && <h3 className={styles.title}>{section.title}</h3>}
            <div className={styles.scrollContainer}>
              {(() => {
                const defaultImages = [
                  "/images/shirt.png",
                  "/images/trouser.png",
                  "/images/combos.png",
                  "/images/tshirt.png",
                  "/images/jeans.png",
                  "/images/polos.png",
                ];

                const items = section.posters?.length
                  ? section.posters.map((p, i) => ({
                      image: p.image,
                      title: p.tag || section.tags?.[i] || "Category",
                      category: p.category,
                      subcategory: p.subcategory,
                      redirectUrl: p.redirectUrl,
                    }))
                  : (section.tags || []).map((tag, i) => ({
                      image: defaultImages[i % defaultImages.length],
                      title: tag,
                    }));

                const handleCircleClick = (item) => {
                  if (!item) return;
                  const title = item.title?.toLowerCase() || "";
                  // 🟡 Combo circle click → redirect to combo list page
                  if (title.includes("combo")) {
                    navigate("/combo-products");
                    return;
                  }
                  // 🟢 If subcategory exists → open subcategory products
                  if (item?.subcategory?._id || item?.subcategory?.slug) {
                    const subSlug =
                      item.subcategory.slug ||
                      item.subcategory.name?.toLowerCase().replace(/\s+/g, "-");
                    navigate(`/products/subcategory/${subSlug}`);
                    return;
                  }

                  // 🟢 If category exists → open category products
                  if (item?.category?._id || item?.category?.slug) {
                    const categoryType =
                      item.category.categoryType?.toLowerCase() || "main";
                    const categorySlug =
                      item.category.slug ||
                      item.category.name?.toLowerCase().replace(/\s+/g, "-");
                    navigate(`/products/${categoryType}/${categorySlug}`);
                    return;
                  }

                  // 🟢 If redirect URL available → open that
                  if (item?.redirectUrl) {
                    if (item.redirectUrl.startsWith("/")) {
                      navigate(item.redirectUrl);
                    } else {
                      window.open(item.redirectUrl, "_blank");
                    }
                    return;
                  }

                  navigate("/products");
                };

                return items.map((item, i) => (
                  <div
                    key={i}
                    className={styles.circleCard}
                    onClick={() => handleCircleClick(item)}
                  >
                    <div className={styles.circleImage}>
                      <img src={item.image} alt={item.title} />
                    </div>
                    {/* <p className={styles.circleLabel}>{item.title}</p> */}
                  </div>
                ));
              })()}
            </div>
          </div>
        );

      case "carousel":
        return (
          <div className={styles.carousel}>
            <img
              src={posters?.[current]?.image}
              alt={posters?.[current]?.title || title}
              className={styles.img}
              onClick={() => handlePosterClick(posters?.[current])}
              style={{ cursor: "pointer" }}
            />
            <div className={styles.dots}>
              {Array.isArray(posters) &&
                posters.map((_, idx) => (
                  <div
                    key={idx}
                    className={styles.progressDot}
                    onClick={() => setCurrent(idx)}
                  >
                    <div
                      className={styles.progressFill}
                      style={{
                        width:
                          idx === current
                            ? `${progress}%`
                            : idx < current
                            ? "100%"
                            : "0%",
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        );

      case "discount":
        return (
          <div className={styles.discountMarqueeContainer}>
            <div className={styles.discountMarqueeSection}>
              {[...Array(6)].map((_, i) => (
                <div key={i} className={styles.discountMarqueeText}>
                  {title || "10% off on ₹1999 | 15% off on ₹2999"}
                </div>
              ))}
            </div>
          </div>
        );

      case "scrollable":
        return (
          <>
            <div className={styles.headingCombo}>
              <h3>{title}</h3>
              {subtitle && <h5>{subtitle}</h5>}
            </div>
            <div className={styles.comboScrollWrapper}>
              <button
                className={styles.scrollBtnLeft}
                onClick={() => scroll(sectionRefs.current[identifier], "left")}
              >
                &#8592;
              </button>
              <div
                className={styles.comboScroll}
                ref={sectionRefs.current[identifier]}
              >
                {Array.isArray(posters) &&
                  posters.map((p, i) => (
                    <div
                      key={`${identifier}-${i}`}
                      className={styles.comboCard}
                      onClick={() => handlePosterClick(p)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={p.image}
                        alt={p.title || title}
                        className={styles.cardImg}
                      />
                    </div>
                  ))}
              </div>
              <button
                className={styles.scrollBtnRight}
                onClick={() => scroll(sectionRefs.current[identifier], "right")}
              >
                &#8594;
              </button>
            </div>
          </>
        );

      case "grid":
        return (
          <>
            <div className={styles.mostwantedCategory}>
              <h2>{title}</h2>
              {subtitle && <h5>{subtitle}</h5>}
            </div>
            <div className="d-flex justify-content-center gap-5 align-items-center flex-wrap margin-auto">
              {Array.isArray(posters) &&
                posters.map((p, i) => (
                  <div key={i} className={styles.gridContainer}>
                    <div
                      className={styles.comboCard}
                      onClick={() => handlePosterClick(p, true)}
                      style={{ cursor: "pointer" }}
                    >
                      <img
                        src={p.image}
                        alt={p.title || title}
                        style={{
                          width: "240px",
                          height: "320px",
                          borderRadius: "9px",
                        }}
                      />
                    </div>
                  </div>
                ))}
            </div>
          </>
        );

      case "banner":
        return (
          <div className={styles.bannerSection}>
            {title && (
              <div className={styles.headingCombo}>
                <h3>{title}</h3>
                {subtitle && <h5>{subtitle}</h5>}
              </div>
            )}
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              {Array.isArray(posters) &&
                posters.map((p, i) => (
                  <div
                    key={i}
                    onClick={() => handlePosterClick(p)}
                    style={{ cursor: "pointer" }}
                  >
                    <img
                      src={p.image}
                      alt={p.title || title}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: "8px",
                      }}
                    />
                  </div>
                ))}
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (productsLoading || postersLoading || sectionsLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
          fontSize: "18px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <>
      {Array.isArray(activeSectionsWithPosters) &&
        activeSectionsWithPosters.map((s) => (
          <div key={s._id || s.identifier}>{renderSection(s)}</div>
        ))}

      <div className="d-flex justify-content-center">
        <p>NO COST | 3 EASY EMIs – Activate at Checkout</p>
      </div>

      <div className="d-flex justify-content-evenly gap-5 align-items-center flex-wrap w mt-5 mb-5 w-100">
        {[1, 2, 3].map((i) => (
          <img
            key={i}
            src={`/poster3.${i}.jpg`}
            alt=""
            style={{ width: 260, height: 200 }}
          />
        ))}
      </div>

      {/* <CouponScroll /> */}

      <div className={styles.scrollingtextcontainer}>
        <div className={styles.scrollingsection}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className={styles.scrollingtext}>
              Making <span>Global Fashion </span> Accessible
            </div>
          ))}
        </div>
      </div>

      <div className={styles.headingCombo}>
        <h3>KAIROZIAN APPROVED</h3>
        <h5>Real reviews from real people</h5>
      </div>

      <div className={styles.comboScrollWrapper}>
        <button
          className={styles.scrollBtnLeft}
          onClick={() => scroll(reviewScrollRef, "left")}
        >
          &#8592;
        </button>
        <div className={styles.comboScroll} ref={reviewScrollRef}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.comboCard}>
              <img
                src={`/poster7.${i + 1}.png`}
                alt=""
                className={styles.cardImg}
              />
            </div>
          ))}
        </div>
        <button
          className={styles.scrollBtnRight}
          onClick={() => scroll(reviewScrollRef, "right")}
        >
          &#8594;
        </button>
      </div>

      <div className={`${styles.scrollingtextcontainer} ${styles.featured}`}>
        <h1>FEATURED</h1>
        <div className={styles.scrollingsection}>
          {[...Array(8)].map((_, i) => (
            <div key={i} className={styles.scrollingtext1}>
              <img
                src={`/poster8.${i + 1}.png`}
                alt=""
                width={300}
                height={40}
              />
            </div>
          ))}
        </div>
      </div>

      <div className={styles.container}>
        <div className={styles.headingCombo}>
          <h3>NEW ARRIVALS</h3>
          <h5>Get them before everyone else does</h5>
        </div>

        <div className={styles.filterBar}>
          <button
            onClick={() => setSelectedCategory("View All")}
            className={`${styles.filterBtn} ${
              selectedCategory === "View All" ? styles.active : ""
            }`}
          >
            View All
          </button>

          {Array.isArray(categories) &&
            categories
              .filter(isAllowedNewArrival)
              .sort((a, b) => {
                const na = allowedOrderMap.get(normalize(a.name)) ?? 999;
                const nb = allowedOrderMap.get(normalize(b.name)) ?? 999;
                return na - nb;
              })
              .map((c) => (
                <button
                  key={c._id}
                  onClick={() => setSelectedCategory(c.name)}
                  className={`${styles.filterBtn} ${
                    selectedCategory === c.name ? styles.active : ""
                  }`}
                >
                  {c.name}
                </button>
              ))}
        </div>

        {filteredProducts.length > 0 ? (
          <div className={styles.newArrivalsGrid || styles.grid}>
            {filteredProducts.map((p) => (
              <ProductCard
                key={p._id}
                product={p}
                onCategoryClick={() =>
                  navigate(
                    `/products/subcategory/${normalize(p.category?.name)}`
                  )
                }
              />
            ))}
          </div>
        ) : (
          <div className={styles.noProducts}>
            No New Arrivals found in this category.
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
