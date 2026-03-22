
import React, { useState, useEffect, useContext, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ComboContext } from "../Context/ComboContext.jsx";
import {
  formatDescription,
  getColorHex,
  normalizeColorToFamily,
} from "../utils/FormatHelpers.jsx";
import { toggleArrayValue } from "../utils/productHelpers.js";
import ComboCard from "./ComboCard.jsx";
import styles from "./ComboList.module.css";
import Select from "react-select";

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
  { value: "discount", label: "Discount" },
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

export default function ComboList() {
  const { combos, loading, error, fetchCombos } = useContext(ComboContext);
  const navigate = useNavigate();
  const [search, setSearch] = useSearchParams();

  const [filteredCombos, setFilteredCombos] = useState([]);
  const [showFilters, setShowFilters] = useState(true);
  const [openFilterGroup, setOpenFilterGroup] = useState("Types");
  const [sortBy, setSortBy] = useState("recommended");

  const [isMobile, setIsMobile] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const openBtnRef = useRef(null);
  const sheetRef = useRef(null);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selColors, setSelColors] = useState([]);
  const [selSizes, setSelSizes] = useState([]);
  const [selPatterns, setSelPatterns] = useState([]);
  const [selFabrics, setSelFabrics] = useState([]);
  const [selCategories, setSelCategories] = useState([]);
  const [priceBucket, setPriceBucket] = useState(null);
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

  // FACETS
  const comboTypes = useMemo(() => {
    const types = new Map();
    (combos || []).forEach((combo) => {
      const type = (combo.comboType || "Regular").trim();
      if (!types.has(type)) {
        types.set(type, { name: type, count: 1 });
      } else {
        types.get(type).count++;
      }
    });
    return Array.from(types.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [combos]);

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
    (combos || []).forEach((combo) => {
      const comboFamilies = new Set();
      combo.products?.forEach((p) => {
        p.variants?.forEach((v) => {
          if (v?.color) {
            const family = normalizeColorToFamily(v.color);
            if (family) comboFamilies.add(family);
          }
        });
      });
      comboFamilies.forEach((family) => {
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
    return Array.from(map.values()).sort((a, b) => {
      if (a.normName === "other") return 1;
      if (b.normName === "other") return -1;
      return a.name.localeCompare(b.name);
    });
  }, [combos]);

  const allSizes = useMemo(() => {
    const map = new Map();
    (combos || []).forEach((combo) => {
      const comboSizes = new Set();
      combo.products?.forEach((p) => {
        p.variants?.forEach((v) => {
          v?.sizes?.forEach((sz) => {
            const sizeName = (sz.size || sz)?.trim();
            if (sizeName) comboSizes.add(sizeName);
          });
        });
      });
      comboSizes.forEach((sizeName) => {
        if (!map.has(sizeName)) map.set(sizeName, { name: sizeName, count: 1 });
        else map.get(sizeName).count += 1;
      });
    });
    const order = ["S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];
    return Array.from(map.values()).sort(
      (a, b) => order.indexOf(a.name) - order.indexOf(b.name)
    );
  }, [combos]);

  const allCategories = useMemo(() => {
    const map = new Map();
    (combos || []).forEach((combo) => {
      const comboCats = new Set();
      combo.products?.forEach((p) => {
        if (p.category?.name) comboCats.add(p.category.name.trim());
      });
      comboCats.forEach((catName) => {
        if (!map.has(catName)) map.set(catName, { name: catName, count: 1 });
        else map.get(catName).count += 1;
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [combos]);

  const allPatterns = useMemo(() => {
    const map = new Map();
    (combos || []).forEach((combo) => {
      const comboPatterns = new Set();
      combo.products?.forEach((p) => {
        if (p?.details?.pattern) comboPatterns.add(p.details.pattern.trim());
      });
      comboPatterns.forEach((patternName) => {
        if (!map.has(patternName))
          map.set(patternName, { name: patternName, count: 1 });
        else map.get(patternName).count += 1;
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [combos]);

  const allFabrics = useMemo(() => {
    const map = new Map();
    (combos || []).forEach((combo) => {
      const comboFabrics = new Set();
      combo.products?.forEach((p) => {
        if (p?.details?.fabric) comboFabrics.add(p.details.fabric.trim());
      });
      comboFabrics.forEach((fabricName) => {
        if (!map.has(fabricName))
          map.set(fabricName, { name: fabricName, count: 1 });
        else map.get(fabricName).count += 1;
      });
    });
    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }, [combos]);

  const priceBucketsDefinition = [
    { name: "0-499", min: 0, max: 499 },
    { name: "500-799", min: 500, max: 799 },
    { name: "800-1199", min: 800, max: 1199 },
    { name: "1200+", min: 1200, max: Infinity },
  ];

  const allPriceBuckets = useMemo(() => {
    const buckets = priceBucketsDefinition.map((b) => ({ ...b, count: 0 }));
    (combos || []).forEach((combo) => {
      const price = combo.comboPrice || 0;
      const matchingBucket = buckets.find(
        (b) => price >= b.min && price <= b.max
      );
      if (matchingBucket) {
        matchingBucket.count += 1;
      }
    });
    return buckets.filter((b) => b.count > 0);
  }, [combos]);

  const toggle = toggleArrayValue;

  // Filtering + sorting -> update filteredCombos
  useEffect(() => {
    let filtered = Array.isArray(combos) ? [...combos] : [];
    if (searchQuery) {
      filtered = filtered.filter((combo) => {
        const searchLower = searchQuery.toLowerCase();
        const nameMatch = combo?.name?.toLowerCase().includes(searchLower);
        const descMatch = combo?.description
          ?.toLowerCase()
          .includes(searchLower);
        const productMatch = combo.products?.some(
          (p) =>
            p?.name?.toLowerCase().includes(searchLower) ||
            p?.description?.toLowerCase().includes(searchLower)
        );
        return nameMatch || descMatch || productMatch;
      });
    }

    if (selectedTypes.length) {
      filtered = filtered.filter((combo) =>
        selectedTypes.includes(combo.comboType || "Regular")
      );
    }

    if (selColors.length) {
      filtered = filtered.filter((combo) =>
        combo.products?.some((p) =>
          p.variants?.some((v) => {
            if (!v?.color) return false;
            const productFamily = normalizeColorToFamily(v.color);
            return selColors.includes(productFamily);
          })
        )
      );
    }

    if (selSizes.length) {
      filtered = filtered.filter((combo) =>
        combo.products?.some((p) =>
          p.variants?.some((v) =>
            v?.sizes?.some((sz) => selSizes.includes(sz.size || sz))
          )
        )
      );
    }

    if (selCategories.length) {
      filtered = filtered.filter((combo) =>
        combo.products?.some((p) => selCategories.includes(p.category?.name))
      );
    }

    if (selPatterns.length) {
      filtered = filtered.filter((combo) =>
        combo.products?.some((p) => selPatterns.includes(p?.details?.pattern))
      );
    }

    if (selFabrics.length) {
      filtered = filtered.filter((combo) =>
        combo.products?.some((p) => selFabrics.includes(p?.details?.fabric))
      );
    }

    if (priceBucket) {
      const bucket = priceBucketsDefinition.find((b) => b.name === priceBucket);
      if (bucket) {
        filtered = filtered.filter((combo) => {
          const price = combo.comboPrice || 0;
          return price >= bucket.min && price <= bucket.max;
        });
      }
    }

    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => (a.comboPrice || 0) - (b.comboPrice || 0));
        break;
      case "price-high":
        filtered.sort((a, b) => (b.comboPrice || 0) - (a.comboPrice || 0));
        break;
      case "discount":
        filtered.sort((a, b) => {
          const discA = a.originalPrice ? a.originalPrice - a.comboPrice : 0;
          const discB = b.originalPrice ? b.originalPrice - b.comboPrice : 0;
          return discB - discA;
        });
        break;
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    setFilteredCombos(filtered);
  }, [
    combos,
    searchQuery,
    selectedTypes,
    selColors,
    selSizes,
    selCategories,
    selPatterns,
    selFabrics,
    priceBucket,
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
          title="Types"
          groupKey="Types"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.checkboxList}>
            {comboTypes.map(({ name, count }) => (
              <label key={name} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={selectedTypes.includes(name)}
                  onChange={() => toggle(setSelectedTypes, selectedTypes, name)}
                />
                <span>
                  {name} ({count})
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Color"
          groupKey="Color"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.checkboxList}>
            {allColors.map(({ name, normName, count }) => (
              <label key={normName} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={selColors.includes(normName)}
                  onChange={() => toggle(setSelColors, selColors, normName)}
                />
                <span
                  style={{
                    display: "inline-block",
                    width: "16px",
                    height: "16px",
                    backgroundColor: getColorHex(normName),
                    marginRight: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "3px",
                    verticalAlign: "middle",
                  }}
                />
                <span>
                  {name} ({count})
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Size"
          groupKey="Size"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.checkboxList}>
            {allSizes.map(({ name, count }) => (
              <label key={name} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={selSizes.includes(name)}
                  onChange={() => toggle(setSelSizes, selSizes, name)}
                />
                <span>
                  {name} ({count})
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <FilterGroup
          title="Categories"
          groupKey="Categories"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.checkboxList}>
            {allCategories.map(({ name, count }) => (
              <label key={name} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={selCategories.includes(name)}
                  onChange={() => toggle(setSelCategories, selCategories, name)}
                />
                <span>
                  {name} ({count})
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        {allPatterns.length > 0 && (
          <FilterGroup
            title="Patterns"
            groupKey="Patterns"
            openGroup={openFilterGroup}
            setOpenGroup={setOpenFilterGroup}
          >
            <div className={styles.checkboxList}>
              {allPatterns.map(({ name, count }) => (
                <label key={name} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={selPatterns.includes(name)}
                    onChange={() => toggle(setSelPatterns, selPatterns, name)}
                  />
                  <span>
                    {name} ({count})
                  </span>
                </label>
              ))}
            </div>
          </FilterGroup>
        )}

        {allFabrics.length > 0 && (
          <FilterGroup
            title="Fabric"
            groupKey="Fabric"
            openGroup={openFilterGroup}
            setOpenGroup={setOpenFilterGroup}
          >
            <div className={styles.checkboxList}>
              {allFabrics.map(({ name, count }) => (
                <label key={name} className={styles.checkboxItem}>
                  <input
                    type="checkbox"
                    checked={selFabrics.includes(name)}
                    onChange={() => toggle(setSelFabrics, selFabrics, name)}
                  />
                  <span>
                    {name} ({count})
                  </span>
                </label>
              ))}
            </div>
          </FilterGroup>
        )}

        <FilterGroup
          title="Price Range"
          groupKey="PriceRange"
          openGroup={openFilterGroup}
          setOpenGroup={setOpenFilterGroup}
        >
          <div className={styles.checkboxList}>
            {allPriceBuckets.map(({ name, count }) => (
              <label key={name} className={styles.checkboxItem}>
                <input
                  type="checkbox"
                  checked={priceBucket === name}
                  onChange={() =>
                    setPriceBucket(priceBucket === name ? null : name)
                  }
                />
                <span>
                  ₹{name} ({count})
                </span>
              </label>
            ))}
          </div>
        </FilterGroup>

        <div className={styles.clearRow}>
          <button
            className={styles.clearBtn}
            onClick={() => {
              setSelectedTypes([]);
              setSelColors([]);
              setSelSizes([]);
              setSelCategories([]);
              setSelPatterns([]);
              setSelFabrics([]);
              setPriceBucket(null);
              setOpenFilterGroup("Types");
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
                  selectedTypes.length === 0 ? styles.pillActive : ""
                }`}
                onClick={() => setSelectedTypes([])}
              >
                View All
              </button>

              {[
                "T-shirts",
                "Shirts",
                "Polo",
                "Joggers",
                "Boxers",
                "Pyjamas",
              ].map((type) => (
                <button
                  key={type}
                  className={`${styles.pill} ${
                    selectedTypes.includes(type) ? styles.pillActive : ""
                  }`}
                  onClick={() => toggle(setSelectedTypes, selectedTypes, type)}
                >
                  {type}
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

          <div className={styles.descriptionBox}>
            <h1 className={styles.descriptionTitle}>COMBO PRODUCTS</h1>
            <p className={styles.descriptionText}>
              When in doubt, a combo for men is always a smart choice. Explore
              Kairoz's latest collection of combo clothes for men online. We
              offer you a quality combo offers, including t-shirts, shirts,
              joggers, polo t-shirts, pajamas, and boxers. The discounts are
              hard to resist. Pick any of the 2, 3, and 4 combos for men
              featuring shirts, t-shirts, boxers, joggers, and more. Shop now!
            </p>

            <div className={styles.sortRow}>
              <span className={styles.sortLabel}>Sort By</span>

              <Select
                className={styles.sortSelectContainer}
                classNamePrefix="sort-select"
                options={sortOptions}
                value={sortOptions.find((option) => option.value === sortBy)}
                onChange={(selectedOption) => setSortBy(selectedOption.value)}
                styles={customSortStyles}
                isSearchable={false}
                aria-label="Sort products"
              />
            </div>
          </div>

          {loading ? (
            <div className={styles.loadingBox}>Loading combo offers...</div>
          ) : filteredCombos.length > 0 ? (
            <div className={styles.grid}>
              {filteredCombos.map((combo) => (
                <ComboCard key={combo._id} combo={combo} />
              ))}
            </div>
          ) : (
            <div className={styles.noProducts}>
              There is no combo of this category.
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
                    setSelectedTypes([]);
                    setSelColors([]);
                    setSelSizes([]);
                    setSelCategories([]);
                    setSelPatterns([]);
                    setSelFabrics([]);
                    setPriceBucket(null);
                    setOpenFilterGroup("Types");
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
