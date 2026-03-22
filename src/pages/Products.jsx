import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { ProductContext } from "../Context/ProductContext.jsx";
import ProductCard from "../components/ProductCard/ProductCard.jsx";
import styles from "./Product.module.css";
import Select from "react-select";

import {
  slugify,
  catSlugOf,
  catTypeOf,
  catNameOf,
  facetByRoute,
  inPriceBucket,
  toggleArrayValue,
} from "../utils/productHelpers.js";
import {
  findActiveCategory,
  getSubcategoryPills,
  getDynamicCategoryContent,
} from "../utils/categoryHelpers.js";
import {
  formatDescription,
  getColorHex,
  normalizeColorToFamily,
} from "../utils/FormatHelpers.jsx";

const FilterGroup = ({
  title,
  children,
  groupKey,
  openGroup,
  setOpenGroup,
}) => {
  const isOpen = openGroup === groupKey;
  return (
    <div className={styles.group}>
      <button
        className={styles.groupTitleBtn}
        onClick={() => setOpenGroup(isOpen ? null : groupKey)}
        aria-expanded={isOpen}
      >
        <span className={styles.groupTitle}>{title}</span>
        <span className={isOpen ? styles.chevUp : styles.chevDown}>▾</span>
      </button>
      <div
        className={`${styles.groupBody} ${
          isOpen ? styles.open : styles.closed
        }`}
      >
        {children}
      </div>
    </div>
  );
};

const sortOptions = [
  { value: "recommended", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
];

const customSortStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "var(--cl-bg-card, #ffffff)",
    borderColor: "#ccc",
    color: "var(--cl-text-primary, #333)",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "0.8rem",
    minHeight: "30px",
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "var(--cl-bg-card, #ffffff)",
    borderRadius: "4px",
    zIndex: 20,
    color: "var(--cl-text-primary, #333)",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#e0e8f5"
      : state.isFocused
      ? "#f0f0f0"
      : "var(--cl-bg-card, #ffffff)",
    color: "var(--cl-text-primary, #333)",
    fontSize: "0.8rem",
    cursor: "pointer",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "var(--cl-text-primary, #333)",
  }),
};

export default function Products() {
  const { categoryType, categoryName, tagName, subSlug, categorySlug } =
    useParams();

  const { products, categories, loading } = useContext(ProductContext) || {};
  const [search, setSearch] = useSearchParams();

  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("View All");
  const [filterType, setFilterType] = useState(null);
  const [selectedCategoryChip, setSelectedCategoryChip] = useState("View All");
  const [isFilterBarUsed, setIsFilterBarUsed] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const [openFilterGroup, setOpenFilterGroup] = useState("Color");
  const [sortBy, setSortBy] = useState("recommended");

  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const openBtnRef = useRef(null);
  const sheetRef = useRef(null);
  const searchQuery = search.get("search");

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 960px)");
    const onChange = (e) => {
      setIsMobile(e.matches);
      setShowFilters(!e.matches);
      if (!e.matches) setIsSheetOpen(false);
    };
    onChange(mq);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    if (!isSheetOpen) return;
    const onKey = (e) => e.key === "Escape" && setIsSheetOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isSheetOpen]);

  useEffect(() => {
    if (isSheetOpen && sheetRef.current) {
      const first = sheetRef.current.querySelector(
        "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
      );
      first?.focus();
    } else {
      openBtnRef.current?.focus();
    }
  }, [isSheetOpen]);

  const [selColors, setSelColors] = useState([]);
  const [selSizes, setSelSizes] = useState([]);
  const [selPatterns, setSelPatterns] = useState([]);
  const [selFabrics, setSelFabrics] = useState([]);
  const [selNeckCollars, setSelNeckCollars] = useState([]);
  const [selSleeves, setSelSleeves] = useState([]);
  const [selFits, setSelFits] = useState([]);
  const [selOccasions, setSelOccasions] = useState([]);
  const [selCombos, setSelCombos] = useState([]);
  const [priceBucket, setPriceBucket] = useState(null);

  const allCategories = Array.isArray(categories) ? categories : [];
  const allProducts = Array.isArray(products) ? products : [];

  const activeCategory = useMemo(() => {
    const foundCat = findActiveCategory(allCategories, {
      slug: subSlug || categoryName,
      categoryType,
    });
    return foundCat ? getDynamicCategoryContent(foundCat) : null;
  }, [allCategories, subSlug, categoryName, categoryType]);

  const baseProducts = useMemo(() => {
    let scoped = allProducts;

    const normalize = (value) => {
      if (!value) return "";
      return value
        .toString()
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "")
        .replace(/(es|s)$/, "");
    };

    const normalizedCategoryType = normalize(categoryType);
    const normalizedCategoryName = normalize(categoryName);
    const normalizedSubSlug = normalize(subSlug);
    const normalizedTagName = normalize(tagName);
    const normalizedCategorySlug = normalize(categorySlug);

    if (normalizedCategoryType === "main" && normalizedCategoryName) {
      const mainCategory = allCategories.find(
        (cat) =>
          normalize(cat.slug) === normalizedCategoryName &&
          cat.categoryType === "main"
      );

      if (mainCategory) {
        const mainCatSlug = normalize(mainCategory.slug);
        scoped = allProducts.filter((p) => {
          const catSlug = normalize(p.category?.slug);
          const parentCatSlug = normalize(p.parentCategory?.slug);
          const tags = (p.tags || []).map((t) => normalize(t));
          return (
            catSlug === mainCatSlug ||
            parentCatSlug === mainCatSlug ||
            tags.includes(mainCatSlug)
          );
        });
      } else {
        scoped = allProducts.filter((p) => {
          const titleSlug = normalize(p.title);
          const tags = (p.tags || []).map((t) => normalize(t));
          const catSlug = normalize(p.category?.slug);
          const parentSlug = normalize(p.parentCategory?.slug);

          return (
            tags.includes(normalizedCategoryName) ||
            catSlug.includes(normalizedCategoryName) ||
            parentSlug.includes(normalizedCategoryName) ||
            titleSlug.includes(normalizedCategoryName)
          );
        });
      }
    } else if (normalizedSubSlug) {
      const subCategory = allCategories.find(
        (c) =>
          normalize(c.slug) === normalizedSubSlug &&
          c.categoryType === "subcategory"
      );
      if (subCategory) {
        const subCatSlug = normalize(subCategory.slug);
        scoped = allProducts.filter((p) => {
          const catSlug = normalize(p.category?.slug);
          const parentSlug = normalize(p.parentCategory?.slug);
          const tags = (p.tags || []).map((t) => normalize(t));
          return (
            catSlug === subCatSlug ||
            parentSlug === subCatSlug ||
            tags.includes(subCatSlug)
          );
        });
      } else {
        scoped = allProducts.filter((p) =>
          (p.tags || []).some((t) => normalize(t) === normalizedSubSlug)
        );
      }
    } else if (normalizedTagName) {
      scoped = allProducts.filter((p) =>
        (p.tags || []).some((t) => normalize(t) === normalizedTagName)
      );
    } else if (normalizedCategorySlug || normalizedCategoryName) {
      const searchSlug = normalizedCategorySlug || normalizedCategoryName;
      scoped = allProducts.filter((p) => {
        const catSlug = normalize(p.category?.slug);
        const parentSlug = normalize(p.parentCategory?.slug);
        const titleSlug = normalize(p.title);
        const tags = (p.tags || []).map((t) => normalize(t));

        const match = (slug) =>
          slug === searchSlug ||
          slug.includes(searchSlug) ||
          searchSlug.includes(slug);

        return (
          match(catSlug) ||
          match(parentSlug) ||
          match(titleSlug) ||
          tags.some(match)
        );
      });
    }

    return scoped;
  }, [
    allProducts,
    subSlug,
    tagName,
    categoryType,
    categoryName,
    categorySlug,
    allCategories,
  ]);

  const subcategoryPills = useMemo(
    () => getSubcategoryPills(allCategories, activeCategory),
    [allCategories, activeCategory]
  );

  const generateDetailFacets = (products, detailKey) => {
    const map = new Map();
    products.forEach((p) => {
      const value = p?.details?.[detailKey];
      if (value) {
        const name = value.toString().trim();
        const normName = name.toLowerCase();
        if (!map.has(normName)) {
          map.set(normName, { name: name, normName, count: 1 });
        } else {
          map.get(normName).count += 1;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  };

  const allColors = useMemo(() => {
    const map = new Map();
    const familyDisplayNames = {
      blue: "Blue",
      green: "Green",
      red: "Red",
      black: "Black",
      grey: "Grey",
      white: "White",
      beige: "Beige",
      brown: "Brown",
      yellow: "Yellow",
      purple: "Purple",
      pink: "Pink",
      orange: "Orange",
      silver: "Silver",
      gold: "Gold",
      other: "Other",
    };

    baseProducts.forEach((p) => {
      const productFamilies = new Set();
      p?.variants?.forEach((v) => {
        if (v?.color) {
          const family = normalizeColorToFamily(v.color);
          if (family) productFamilies.add(family);
        }
      });

      productFamilies.forEach((family) => {
        if (!map.has(family)) {
          map.set(family, {
            name: familyDisplayNames[family] || family,
            normName: family,
            count: 1,
          });
        } else {
          map.get(family).count += 1;
        }
      });
    });

    const sortedFamilies = Array.from(map.values()).sort((a, b) => {
      if (a.normName === "other") return 1;
      if (b.normName === "other") return -1;
      return a.name.localeCompare(b.name);
    });

    return sortedFamilies;
  }, [baseProducts]);

  const allSizes = useMemo(() => {
    const map = new Map();
    baseProducts.forEach((p) => {
      const productSizes = new Set();
      p?.variants?.forEach((v) =>
        v?.sizes?.forEach((sz) => {
          const sizeName = sz.size || sz;
          if (sizeName) productSizes.add(sizeName.trim());
        })
      );
      productSizes.forEach((sizeName) => {
        if (!map.has(sizeName)) map.set(sizeName, { name: sizeName, count: 1 });
        else map.get(sizeName).count += 1;
      });
    });
    const order = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
    return Array.from(map.values()).sort(
      (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
    );
  }, [baseProducts]);

  const allPatterns = useMemo(
    () => generateDetailFacets(baseProducts, "pattern"),
    [baseProducts]
  );
  const allFabrics = useMemo(
    () => generateDetailFacets(baseProducts, "fabric"),
    [baseProducts]
  );

  const allNeckCollars = useMemo(() => {
    const map = new Map();
    baseProducts.forEach((p) => {
      const value = p?.details?.neck || p?.details?.collar;
      if (value) {
        const name = value.toString().trim();
        const normName = name.toLowerCase();
        if (!map.has(normName)) {
          map.set(normName, { name: name, normName, count: 1 });
        } else {
          map.get(normName).count += 1;
        }
      }
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [baseProducts]);

  const allSleeves = useMemo(
    () => generateDetailFacets(baseProducts, "sleeves"),
    [baseProducts]
  );
  const allFits = useMemo(
    () => generateDetailFacets(baseProducts, "fit"),
    [baseProducts]
  );
  const allOccasions = useMemo(
    () => generateDetailFacets(baseProducts, "occasion"),
    [baseProducts]
  );

  const allCombos = useMemo(() => {
    const map = new Map();
    baseProducts.forEach((p) => {
      const addedForProduct = new Set();

      if (Array.isArray(p?.tags)) {
        p.tags.forEach((t) => {
          if (/combo/i.test(t) || /pick-any/i.test(t)) {
            const name = t.trim();
            const normName = name.toLowerCase();
            if (!map.has(normName))
              map.set(normName, { name, normName, count: 0 });
            addedForProduct.add(normName);
          }
        });
      }
      if (p?.details?.combo) {
        const name = p.details.combo.toString().trim();
        const normName = name.toLowerCase();
        if (!map.has(normName)) map.set(normName, { name, normName, count: 0 });
        addedForProduct.add(normName);
      }
      addedForProduct.forEach((normName) => {
        if (map.has(normName)) map.get(normName).count += 1;
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [baseProducts]);

  const priceBucketsDefinition = [
    { name: "0-499", min: 0, max: 499 },
    { name: "500-799", min: 500, max: 799 },
    { name: "800-1199", min: 800, max: 1199 },
    { name: "1200+", min: 1200, max: Infinity },
  ];

  const allPriceBuckets = useMemo(() => {
    const buckets = priceBucketsDefinition.map((b) => ({ ...b, count: 0 }));
    baseProducts.forEach((p) => {
      const displayPrice =
        (typeof p.discountPrice === "number" ? p.discountPrice : p.price) || 0;
      const matchingBucket = buckets.find(
        (b) => displayPrice >= b.min && displayPrice <= b.max
      );
      if (matchingBucket) {
        matchingBucket.count += 1;
      }
    });
    return buckets.filter((b) => b.count > 0);
  }, [baseProducts]);

  const toggle = toggleArrayValue;

  const pillFacet = useMemo(
    () => facetByRoute(subSlug, categoryName),
    [subSlug, categoryName]
  );

  const pillValues = useMemo(() => {
    if (!pillFacet) return [];
    const setVals = new Set();
    baseProducts.forEach((p) => {
      const val = p?.details?.[pillFacet];
      if (val) setVals.add(val);
    });
    return Array.from(setVals).sort();
  }, [baseProducts, pillFacet]);

  const selectedPill = useMemo(() => {
    if (!pillFacet) return null;
    const v = search.get(pillFacet);
    return v ? v : null;
  }, [search, pillFacet]);

  const setPill = (val) => {
    if (!pillFacet) return;
    const next = new URLSearchParams(search);
    if (!val || slugify(val) === slugify("View All")) next.delete(pillFacet);
    else next.set(pillFacet, val);
    setSearch(next, { replace: true });
  };

  useEffect(() => {
    let filtered = baseProducts;

    if (searchQuery) {
      filtered = filtered.filter((p) => {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = p?.title?.toLowerCase().includes(searchLower);
        const descMatch = p?.description?.toLowerCase().includes(searchLower);
        const tagsMatch = p?.tags?.some((t) =>
          t.toLowerCase().includes(searchLower)
        );
        const patternMatch = p?.details?.pattern
          ?.toLowerCase()
          .includes(searchLower);
        const fabricMatch = p?.details?.fabric
          ?.toLowerCase()
          .includes(searchLower);

        return (
          nameMatch || descMatch || tagsMatch || patternMatch || fabricMatch
        );
      });
      setSelectedFilter(`Search: ${searchQuery}`);
      setFilterType("search");
    } else if (categoryType === "main" && categoryName) {
      setSelectedFilter(categoryName);
      setFilterType("main-category");
    } else if (subSlug) {
      setSelectedFilter(subSlug);
      setFilterType("subcategory");
    } else if (tagName) {
      setSelectedFilter(tagName);
      setFilterType("tag");
    } else if (categoryType && categoryName) {
      setSelectedFilter(categoryName);
      setFilterType("category");
    } else if (!categoryType && !categoryName && !tagName && !subSlug) {
      setSelectedFilter("View All");
      setFilterType(null);
    }

    if (selColors.length) {
      filtered = filtered.filter((p) =>
        p?.variants?.some((v) => {
          if (!v?.color) return false;
          const productFamily = normalizeColorToFamily(v.color);
          return selColors.includes(productFamily);
        })
      );
    }
    if (pillFacet) {
      const qVal = search.get(pillFacet);
      if (qVal) {
        filtered = filtered.filter(
          (p) => slugify(p?.details?.[pillFacet]) === slugify(qVal)
        );
        setSelectedFilter(qVal);
        setFilterType(`pill:${pillFacet}`);
      }
    }

    if (
      isFilterBarUsed &&
      selectedCategoryChip &&
      selectedCategoryChip !== "View All"
    ) {
      filtered = filtered.filter(
        (p) => catNameOf(p).toLowerCase() === selectedCategoryChip.toLowerCase()
      );
      setSelectedFilter(selectedCategoryChip);
      setFilterType("categoryFilterBar");
    }

    if (selColors.length) {
      filtered = filtered.filter((p) =>
        p?.variants?.some((v) => {
          if (!v?.color) return false;
          const productFamily = normalizeColorToFamily(v.color);
          return selColors.includes(productFamily);
        })
      );
    }
    if (selSizes.length) {
      filtered = filtered.filter((p) =>
        p?.variants?.some((v) =>
          v?.sizes?.some((sz) => selSizes.includes(sz.size || sz))
        )
      );
    }
    if (selPatterns.length) {
      filtered = filtered.filter((p) =>
        selPatterns.includes(p?.details?.pattern)
      );
    }
    if (selFabrics.length) {
      filtered = filtered.filter((p) =>
        selFabrics.includes(p?.details?.fabric)
      );
    }
    if (selNeckCollars.length) {
      filtered = filtered.filter((p) => {
        const val = p?.details?.neck || p?.details?.collar;
        return selNeckCollars.includes(val);
      });
    }
    if (selSleeves.length) {
      filtered = filtered.filter((p) =>
        selSleeves.includes(p?.details?.sleeves)
      );
    }
    if (selFits.length) {
      filtered = filtered.filter((p) => selFits.includes(p?.details?.fit));
    }
    if (selOccasions.length) {
      filtered = filtered.filter((p) =>
        selOccasions.includes(p?.details?.occasion)
      );
    }
    if (selCombos.length) {
      filtered = filtered.filter((p) => {
        const hasTag = p?.tags?.some((t) => selCombos.includes(t));
        const inDetails = selCombos.includes(p?.details?.combo);
        return hasTag || inDetails;
      });
    }
    if (priceBucket) {
      filtered = filtered.filter((p) => {
        const displayPrice =
          (typeof p.discountPrice === "number" ? p.discountPrice : p.price) ||
          0;
        return inPriceBucket(displayPrice, priceBucket);
      });
    }

    const getPrice = (p) =>
      (typeof p.discountPrice === "number" ? p.discountPrice : p.price) || 0;

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case "price-high":
        filtered.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredProducts(filtered);
    console.log("filteredProducts", filteredProducts);
  }, [
    baseProducts,
    searchQuery,
    pillFacet,
    search.toString(),
    isFilterBarUsed,
    selectedCategoryChip,
    selColors,
    selSizes,
    selPatterns,
    selFabrics,
    selNeckCollars,
    selSleeves,
    selFits,
    selOccasions,
    selCombos,
    priceBucket,
    categoryType,
    categoryName,
    tagName,
    subSlug,
    sortBy,
  ]);

  const FilterPanel = (
    <>
      <button
        className={styles.filterHeaderBtn}
        onClick={() =>
          isMobile ? setIsSheetOpen(false) : setShowFilters((v) => !v)
        }
        aria-expanded={isMobile ? true : showFilters}
      >
        <span>Filter</span>
        <span className={showFilters ? styles.chevUp : styles.chevDown}>▾</span>
      </button>

      <div
        className={`${styles.filterBody} ${
          isMobile ? styles.open : showFilters ? styles.open : styles.closed
        }`}
      >
        <FilterGroup
          title="Color"
          groupKey="Color"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allColors.map(({ name, normName, count }) => {
              const swatchColor = getColorHex(normName);
              const isChecked = selColors.includes(normName);
              return (
                <label
                  key={normName}
                  htmlFor={`color-${normName}`}
                  className={styles.colorOptionItem}
                >
                  <div className={styles.colorLeft}>
                    <input
                      type="checkbox"
                      id={`color-${normName}`}
                      name="color-filter"
                      value={normName}
                      checked={isChecked}
                      onChange={() => toggle(setSelColors, selColors, normName)}
                      className={styles.colorCheckbox}
                    />
                    <span
                      className={styles.swatch}
                      style={{ backgroundColor: swatchColor }}
                      title={name}
                    />
                    <span className={styles.colorName}>{name}</span>
                  </div>
                  <span className={styles.colorCount}>({count})</span>
                </label>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Size"
          groupKey="Size"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allSizes.map(({ name, count }) => {
              const isChecked = selSizes.includes(name);
              return (
                <label
                  key={name}
                  htmlFor={`size-${name}`}
                  className={styles.colorOptionItem}
                >
                  <div className={styles.colorLeft}>
                    <input
                      type="checkbox"
                      id={`size-${name}`}
                      name="size-filter"
                      value={name}
                      checked={isChecked}
                      onChange={() => toggle(setSelSizes, selSizes, name)}
                      className={styles.colorCheckbox}
                    />
                    <span className={styles.colorName}>{name}</span>
                  </div>
                  <span className={styles.colorCount}>({count})</span>
                </label>
              );
            })}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Patterns"
          groupKey="Patterns"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allPatterns.map(({ name, normName, count }) => (
              <label
                key={normName}
                htmlFor={`pattern-${normName}`}
                className={styles.colorOptionItem}
              >
                <div className={styles.colorLeft}>
                  <input
                    type="checkbox"
                    id={`pattern-${normName}`}
                    name="pattern-filter"
                    value={name}
                    checked={selPatterns.includes(name)}
                    onChange={() => toggle(setSelPatterns, selPatterns, name)}
                    className={styles.colorCheckbox}
                  />
                  <span className={styles.colorName}>{name}</span>
                </div>
                <span className={styles.colorCount}>({count})</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Fabric"
          groupKey="Fabric"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allFabrics.map(({ name, normName, count }) => (
              <label
                key={normName}
                htmlFor={`fabric-${normName}`}
                className={styles.colorOptionItem}
              >
                <div className={styles.colorLeft}>
                  <input
                    type="checkbox"
                    id={`fabric-${normName}`}
                    name="fabric-filter"
                    value={name}
                    checked={selFabrics.includes(name)}
                    onChange={() => toggle(setSelFabrics, selFabrics, name)}
                    className={styles.colorCheckbox}
                  />
                  <span className={styles.colorName}>{name}</span>
                </div>
                <span className={styles.colorCount}>({count})</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Neck/Collar"
          groupKey="NeckCollar"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allNeckCollars.map(({ name, normName, count }) => (
              <label
                key={normName}
                htmlFor={`neck-${normName}`}
                className={styles.colorOptionItem}
              >
                <div className={styles.colorLeft}>
                  <input
                    type="checkbox"
                    id={`neck-${normName}`}
                    name="neck-filter"
                    value={name}
                    checked={selNeckCollars.includes(name)}
                    onChange={() =>
                      toggle(setSelNeckCollars, selNeckCollars, name)
                    }
                    className={styles.colorCheckbox}
                  />
                  <span className={styles.colorName}>{name}</span>
                </div>
                <span className={styles.colorCount}>({count})</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Sleeves"
          groupKey="Sleeves"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allSleeves.map(({ name, normName, count }) => (
              <label
                key={normName}
                htmlFor={`sleeve-${normName}`}
                className={styles.colorOptionItem}
              >
                <div className={styles.colorLeft}>
                  <input
                    type="checkbox"
                    id={`sleeve-${normName}`}
                    name="sleeve-filter"
                    value={name}
                    checked={selSleeves.includes(name)}
                    onChange={() => toggle(setSelSleeves, selSleeves, name)}
                    className={styles.colorCheckbox}
                  />
                  <span className={styles.colorName}>{name}</span>
                </div>
                <span className={styles.colorCount}>({count})</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Fit"
          groupKey="Fit"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allFits.map(({ name, normName, count }) => (
              <label
                key={normName}
                htmlFor={`fit-${normName}`}
                className={styles.colorOptionItem}
              >
                <div className={styles.colorLeft}>
                  <input
                    type="checkbox"
                    id={`fit-${normName}`}
                    name="fit-filter"
                    value={name}
                    checked={selFits.includes(name)}
                    onChange={() => toggle(setSelFits, selFits, name)}
                    className={styles.colorCheckbox}
                  />
                  <span className={styles.colorName}>{name}</span>
                </div>
                <span className={styles.colorCount}>({count})</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Occasions"
          groupKey="Occasions"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allOccasions.map(({ name, normName, count }) => (
              <label
                key={normName}
                htmlFor={`occasion-${normName}`}
                className={styles.colorOptionItem}
              >
                <div className={styles.colorLeft}>
                  <input
                    type="checkbox"
                    id={`occasion-${normName}`}
                    name="occasion-filter"
                    value={name}
                    checked={selOccasions.includes(name)}
                    onChange={() => toggle(setSelOccasions, selOccasions, name)}
                    className={styles.colorCheckbox}
                  />
                  <span className={styles.colorName}>{name}</span>
                </div>
                <span className={styles.colorCount}>({count})</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Price Range"
          groupKey="PriceRange"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.colorOptionsContainer}>
            {allPriceBuckets.map(({ name, count }) => (
              <label
                key={name}
                htmlFor={`price-${name}`}
                className={styles.colorOptionItem}
              >
                <div className={styles.colorLeft}>
                  <input
                    type="checkbox"
                    id={`price-${name}`}
                    name="price-filter"
                    value={name}
                    checked={priceBucket === name}
                    onChange={() =>
                      setPriceBucket(priceBucket === name ? null : name)
                    }
                    className={styles.colorCheckbox}
                  />
                  <span className={styles.colorName}>{name}</span>
                </div>
                <span className={styles.colorCount}>({count})</span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <div className={styles.clearRow}>
          <button
            className={styles.clearBtn}
            onClick={() => {
              setSelColors([]);
              setSelSizes([]);
              setSelPatterns([]);
              setSelFabrics([]);
              setSelNeckCollars([]);
              setSelSleeves([]);
              setSelFits([]);
              setSelOccasions([]);
              setPriceBucket(null);
              setOpenFilterGroup("Color");
            }}
          >
            Clear All
          </button>
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className={styles.pageWrap}>
        {!isMobile && (
          <aside
            className={`${styles.sidebar} ${
              showFilters ? "" : styles.sidebarCollapsed
            }`}
          >
            {FilterPanel}
          </aside>
        )}

        <main className={styles.main}>
          <div className={styles.pillsToolbar}>
            <div className={styles.pillsRow}>
              <button
                className={`${styles.pill} ${styles.pillPrimary} ${
                  !selectedPill && !isFilterBarUsed ? styles.pillActive : ""
                }`}
                onClick={() => {
                  setSelectedFilter("View All");
                  setIsFilterBarUsed(false);
                  setPill(null);
                }}
              >
                View All
              </button>

              {subcategoryPills.map((sub) => (
                <button
                  key={sub.slug}
                  className={`${styles.pill} ${
                    slugify(selectedFilter) === slugify(sub.name)
                      ? styles.pillActive
                      : ""
                  }`}
                  onClick={() => {
                    setSelectedFilter(sub.name);
                    setIsFilterBarUsed(true);
                    setPill(sub.slug);
                  }}
                >
                  {sub.name}
                </button>
              ))}

              {pillFacet &&
                pillValues.map((v) => (
                  <button
                    key={v}
                    className={`${styles.pill} ${
                      selectedPill && slugify(selectedPill) === slugify(v)
                        ? styles.pillActive
                        : ""
                    }`}
                    onClick={() => setPill(v)}
                  >
                    {v}
                  </button>
                ))}
            </div>

            {isMobile && (
              <button
                ref={openBtnRef}
                className={styles.mobileFilterBtn}
                onClick={() => setIsSheetOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={isSheetOpen}
                aria-controls="mobileFilterSheet"
              >
                Filter
              </button>
            )}
          </div>

          {activeCategory && activeCategory.displayDescription && (
            <div className={styles.descriptionBox}>
              <h1 className={styles.descriptionTitle}>
                {activeCategory.displayTitle}
              </h1>
              <p className={styles.descriptionText}>
                {formatDescription(activeCategory.displayDescription)}
              </p>
              <div className={styles.sortRow}>
                <span className={styles.sortLabel}>Sort By</span>
                <Select
                  className={styles.sortSelect}
                  options={sortOptions}
                  value={sortOptions.find((option) => option.value === sortBy)}
                  onChange={(selectedOption) => setSortBy(selectedOption.value)}
                  styles={customSortStyles}
                  isSearchable={false}
                  aria-label="Sort products"
                />
              </div>
            </div>
          )}

          {loading ? (
            <div className={styles.loadingBox}>Loading products...</div>
          ) : filteredProducts.length > 0 ? (
            <div className={styles.grid}>
              {filteredProducts.map((p) => (
                <ProductCard
                  key={p._id || p.id}
                  product={p}
                  onCategoryClick={() => {
                    setSelectedCategoryChip(p.category?.name || "View All");
                    setIsFilterBarUsed(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className={styles.noProducts}>
              No products found for "{selectedFilter}"
            </div>
          )}
        </main>
      </div>

      {isMobile && (
        <>
          <div
            className={`${styles.sheetBackdrop} ${
              isSheetOpen ? styles.show : ""
            }`}
            onClick={() => setIsSheetOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobileFilterSheet"
            ref={sheetRef}
            className={`${styles.filterSheet} ${
              isSheetOpen ? styles.open : ""
            }`}
            role="dialog"
            aria-modal="true"
            aria-label="Filter products"
          >
            <div className={styles.sheetHeader}>
              <span>Filter</span>
              <div className={styles.sheetActions}>
                <button
                  className={styles.sheetClear}
                  onClick={() => {
                    setSelColors([]);
                    setSelSizes([]);
                    setSelPatterns([]);
                    setSelFabrics([]);
                    setSelNeckCollars([]);
                    setSelSleeves([]);
                    setSelFits([]);
                    setSelOccasions([]);
                    setPriceBucket(null);
                    setOpenFilterGroup("Color");
                  }}
                >
                  Clear
                </button>
                <button
                  className={styles.sheetClose}
                  onClick={() => setIsSheetOpen(false)}
                >
                  Apply
                </button>
              </div>
            </div>
            <div className={styles.sheetBody}>{FilterPanel}</div>
          </div>
        </>
      )}
    </>
  );
}
