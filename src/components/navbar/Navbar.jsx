import React, {
  useState,
  useEffect,
  useContext,
  useMemo,
  useCallback,
} from "react";
import styles from "./Navbar.module.css";
import { IoSearchOutline, IoCartOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { ProductContext } from "../../Context/ProductContext";
import { CartContext } from "../../Context/CartContext";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { cart } = useContext(CartContext) || {};
  const cartCount = cart?.items?.reduce((s, i) => s + i.quantity, 0) || 0;

  const { categories = [], categoryTree = [] } = useContext(ProductContext);

  const slugify = (str = "") =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const slug = slugify(searchQuery.trim());
      navigate(`/products/general/${slug}`);
      setShowSearch(false);
      setSearchQuery("");
    }
  };

  const handleTrendingClick = (term) => {
    navigate(`/products/general/${slugify(term)}`);
    setShowSearch(false);
  };

  const getSubMenu = (children) =>
    children?.length ? children.map((c) => c.name) : undefined;

  const groupTopwearColumns = (children = []) => {
    const names = children.map((c) => c.name || "");
    const tshirts = names.filter((n) => /t-?\s*shirts?/i.test(n));
    const shirts = names.filter(
      (n) => /shirts?/i.test(n) && !/t-?\s*shirt/i.test(n)
    );
    return {
      "T-shirts": tshirts.length ? tshirts : ["View All"],
      Shirts: shirts.length ? shirts : ["View All"],
      Polos: ["View All"],
      // Winterwear: ["Sweatshirts", "Hoodies", "Jackets"],
      "Shop For Women": ["Topwear", "Bottomwear", "View All"],
    };
  };

  // Filter active categories only - FIXED RECURSIVE LOGIC
  const activeCategoryTree = useMemo(() => {
    const filterActiveCategories = (categories) => {
      if (!categories || !Array.isArray(categories)) return [];

      return categories
        .map((cat) => {
          // Skip if explicitly inactive
          if (cat.isActive === false) return null;

          // Recursively filter children
          let activeChildren = [];
          if (cat.children && Array.isArray(cat.children)) {
            activeChildren = filterActiveCategories(cat.children);
          }

          // Return category if it has active children OR no children check needed
          return {
            ...cat,
            children: activeChildren.length > 0 ? activeChildren : undefined,
          };
        })
        .filter(Boolean); // Remove null entries
    };

    return filterActiveCategories(categoryTree);
  }, [categoryTree]);

  // Active flat categories for navigation
  const activeCategories = useMemo(
    () => categories.filter((c) => c.isActive !== false),
    [categories]
  );

  const sidebarMenuItems = useMemo(() => {
    const dynamicItems = activeCategoryTree.map((parent) => {
      let subMenu;
      if (/(top\s*wear|topwear)/i.test(parent.name)) {
        subMenu = parent.children?.length
          ? groupTopwearColumns(parent.children)
          : undefined;
      } else if (
        /(bottom\s*wear|bottomwear)/i.test(parent.name) &&
        parent.children?.length
      ) {
        subMenu = getSubMenu(parent.children)?.concat(["View All"]);
      } else if (parent.children?.length) {
        subMenu = getSubMenu(parent.children);
      }
      return { title: parent.name, subMenu };
    });

    const staticItems = [
      !dynamicItems.some((i) => i.title === "Festive Fashion Sale") && {
        title: "Festive Fashion Sale",
      },
      !dynamicItems.some((i) => i.title === "Winterwear") && {
        title: "Winterwear",
      },
      !dynamicItems.some((i) => i.title === "Sunglasses") && {
        title: "Sunglasses",
      },
      {
        title: "Shop For Women",
        subMenu: ["Topwear", "Bottomwear", "View All"],
      },
      { title: "Offers & Deals" },
      { title: "More" },
    ].filter(Boolean);

    return [...dynamicItems, ...staticItems].map((item) => ({
      ...item,
      subMenu:
        Array.isArray(item.subMenu) && item.subMenu.length === 0
          ? undefined
          : typeof item.subMenu === "object" &&
            item.subMenu !== null &&
            Object.keys(item.subMenu).length === 0
          ? undefined
          : item.subMenu,
    }));
  }, [activeCategoryTree]);

  const desktopOrder = useMemo(() => {
    const dynamicTitles = sidebarMenuItems
      .filter((item) =>
        activeCategoryTree.some((cat) => cat.name === item.title)
      )
      .slice(0, 10)
      .map((item) => item.title);
    return dynamicTitles;
  }, [sidebarMenuItems, activeCategoryTree]);

  // FIXED: useCallback to prevent recreation on every render
  const handleCategoryClick = useCallback(
    (link, parentCategory = null) => {
      if (!link) return;

      let target = link.toLowerCase().trim();
      const parent = parentCategory?.toLowerCase().trim() || null;

      console.log("Navigating to:", target, "Parent:", parent); // DEBUG

      const categoryTypes = {
        socks: "main",
        "top wear": "main",
        "bottom wear": "main",
        "new arrival": "main",
      };

      if (target === "combos") {
        navigate("/combo-products");
        closeMobileMenu();
        return;
      }
      if (["offers & deals", "offers", "deals"].includes(target)) {
        navigate("/products/general/offers");
        closeMobileMenu();
        return;
      }
      if (target === "winterwear") {
        navigate("/products/tag/winterwear");
        closeMobileMenu();
        return;
      }
      if (target === "shop for women" || target === "women") {
        navigate("/products/general/women");
        closeMobileMenu();
        return;
      }
      if (target === "view all" && parent) target = parent;

      // Search in active categories OR activeCategoryTree
      const catObj =
        activeCategories.find(
          (c) =>
            c.name?.toLowerCase() === target || c.slug?.toLowerCase() === target
        ) ||
        activeCategoryTree.find(
          (c) =>
            c.name?.toLowerCase() === target || c.slug?.toLowerCase() === target
        );

      console.log("Found category:", catObj); // DEBUG

      if (catObj) {
        const catSlug = slugify(catObj.slug || catObj.name);
        const catType = catObj.categoryType || categoryTypes[target] || "main";
        console.log("Navigating to:", `/products/${catType}/${catSlug}`);
        navigate(`/products/${catType}/${catSlug}`);
      } else {
        console.log(
          "Fallback navigation:",
          `/products/general/${slugify(target)}`
        );
        navigate(`/products/general/${slugify(target)}`);
      }
      closeMobileMenu();
    },
    [navigate, activeCategories, activeCategoryTree]
  );

  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth <= 768);
    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const toggleMenu = (idx) =>
    setActiveMenu((prev) => (prev === idx ? null : idx));
  const toggleMobileMenu = () => {
    setIsOpen((v) => !v);
    setActiveMenu(null);
  };
  const closeMobileMenu = () => {
    setIsOpen(false);
    setActiveMenu(null);
  };

  const navbarImg = [
    "./navbar1.1.png",
    "./navbar1.2.png",
    "./navbar1.3.png",
    "./navbar1.4.png",
    "./navbar1.5.png",
    "./navbar1.7.jpg",
    "./navbar1.6.png",
    "./navbar1.8.png",
    "./navbar1.9.png",
  ];

  const isSecureCheckoutView = useMemo(() => {
    const p = location.pathname.toLowerCase();
    return p.startsWith("/checkout") || p.startsWith("/cart");
  }, [location.pathname]);

  const secureViewClass = isSecureCheckoutView ? styles.secureOnly : "";

  return (
    <>
      <nav className={`${styles.navbar} ${secureViewClass}`}>
        <div className={`${styles.navbarContainer} ${secureViewClass}`}>
          <div
            className={`${styles.hamburger} ${isOpen ? styles.active : ""}`}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </div>

          <div className={styles.navbarLogo}>
            <a href="/">
              <img src="/Logo.svg" alt="Logo" />
            </a>
          </div>

          <ul className={`${styles.navbarMenu} ${secureViewClass}`}>
            {desktopOrder.map((title) => {
              const item = sidebarMenuItems.find((i) => i.title === title);
              const index = sidebarMenuItems.findIndex(
                (i) => i.title === title
              );
              if (!item) return null;
              return (
                <li
                  key={title}
                  className={`${styles.menuItemWrapper} ${
                    activeMenu === index ? styles.active : ""
                  }`}
                  onMouseEnter={() => !isMobile && setActiveMenu(index)}
                  onMouseLeave={() => !isMobile && setActiveMenu(null)}
                >
                  <div
                    className={styles.menuItem}
                    onClick={() => handleCategoryClick(item.title)}
                    style={{ cursor: "pointer" }}
                  >
                    <strong>{item.title}</strong>
                    {item.subMenu && (
                      <span
                        className={`${styles.arrow} ${
                          activeMenu === index ? styles.rotated : ""
                        }`}
                      >
                        <MdKeyboardArrowDown />
                      </span>
                    )}
                  </div>

                  {item.subMenu && (
                    <div className={styles.dropdown}>
                      <div className={styles.dropdownGrid}>
                        {Array.isArray(item.subMenu) ? (
                          <div className={styles.dropdownColumn}>
                            {item.subMenu.map((link, i) => (
                              <a
                                key={i}
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleCategoryClick(link, item.title);
                                }}
                              >
                                {link}
                              </a>
                            ))}
                          </div>
                        ) : (
                          Object.entries(item.subMenu).map(
                            ([heading, links]) => (
                              <div
                                key={heading}
                                className={styles.dropdownColumn}
                              >
                                <h4>{heading}</h4>
                                {links.map((link, i) => (
                                  <a
                                    key={i}
                                    href="#"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      handleCategoryClick(link, item.title);
                                    }}
                                  >
                                    {link}
                                  </a>
                                ))}
                              </div>
                            )
                          )
                        )}
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <div className={`${styles.navbarIcons} ${secureViewClass}`}>
            <button
              className={`${styles.icon} ${styles.iconSearch} ${secureViewClass}`}
              onClick={() => setShowSearch((s) => !s)}
              aria-label="Toggle search"
            >
              <IoSearchOutline />
            </button>

            {isSecureCheckoutView && (
              <div
                className={styles.secureChip}
                aria-label="100% Secure Payment"
              >
                <span className={styles.secureIcon}>🔒</span>
                <span className={styles.secureText}>100% SECURE PAYMENT</span>
              </div>
            )}

            <button
              className={`${styles.icon} ${styles.cart} ${secureViewClass}`}
              onClick={() => navigate("/cart")}
              aria-label="Cart"
            >
              <IoCartOutline />
              {cartCount > 0 && (
                <span className={styles.cartBadge}>{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {isOpen && (
        <div
          className={`${styles.overlay} ${secureViewClass}`}
          onClick={closeMobileMenu}
        ></div>
      )}

      <div
        className={`${styles.sidebar} ${
          isOpen ? styles.sidebarOpen : ""
        } ${secureViewClass}`}
      >
        <div className={styles.sidebarTopBanner}>
          <img src="/login-sign-up.jpg" alt="Login Banner" />
        </div>
        <div className={styles.sidebarContent}>
          {sidebarMenuItems.map((item, index) => (
            <div key={index} className={styles.sidebarItemWrapper}>
              <div
                className={styles.sidebarItem}
                onClick={() => {
                  if (item.subMenu)
                    setActiveMenu((p) => (p === index ? null : index));
                  else {
                    handleCategoryClick(item.title);
                    closeMobileMenu();
                  }
                }}
              >
                {navbarImg[index] && (
                  <img
                    src={navbarImg[index]}
                    alt={item.title}
                    className={styles.sidebarImg}
                  />
                )}
                <span>{item.title}</span>
                {item.subMenu && (
                  <span
                    className={`${styles.sidebarArrow} ${
                      activeMenu === index ? styles.rotated : ""
                    }`}
                  >
                    <MdKeyboardArrowDown />
                  </span>
                )}
              </div>

              {item.subMenu && (
                <div
                  className={`${styles.sidebarSubmenu} ${
                    activeMenu === index ? styles.expanded : ""
                  }`}
                >
                  {Array.isArray(item.subMenu)
                    ? item.subMenu.map((link, i) => (
                        <div key={i} className={styles.sidebarSubmenuItem}>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleCategoryClick(link, item.title);
                              closeMobileMenu();
                            }}
                          >
                            {link}
                          </a>
                        </div>
                      ))
                    : Object.entries(item.subMenu).map(([heading, links]) => (
                        <div
                          key={heading}
                          className={styles.sidebarSubmenuGroup}
                        >
                          <h4>{heading}</h4>
                          {links.map((link, i) => (
                            <a
                              key={i}
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleCategoryClick(link, item.title);
                                closeMobileMenu();
                              }}
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {showSearch && (
        <div className={styles.searchOverlay}>
          <form className={styles.searchBox} onSubmit={handleSearch}>
            <input
              placeholder="Search products"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              autoFocus
            />
            <button
              type="submit"
              className={styles.searchBtn}
              disabled={!searchQuery.trim()}
              aria-label="Search"
            >
              <IoSearchOutline />
            </button>
            <button
              type="button"
              className={styles.closeBtn}
              onClick={() => {
                setShowSearch(false);
                setSearchQuery("");
              }}
            >
              ×
            </button>
          </form>
          <div className={styles.trending}>
            <h4>Trending Searches</h4>
            <ul>
              <li onClick={() => handleTrendingClick("T-Shirts")}>T-Shirts</li>
              <li onClick={() => handleTrendingClick("Shirts")}>Shirts</li>
              <li onClick={() => handleTrendingClick("Winterwear")}>
                Winterwear
              </li>
              <li onClick={() => handleTrendingClick("Denims")}>Denims</li>
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
