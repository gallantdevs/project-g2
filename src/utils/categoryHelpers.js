
import { slugify } from "./productHelpers";


export const getDynamicCategoryContent = (category) => {
  if (!category) return null;

  let dynamicDescription = category.description || "";
  let displayTitle = category.name;
  const currentSlug = category.slug;

  // Dynamic Description Map
  const contentMap = {
    "plain-t-shirts": {
      title: "PLAIN T-SHIRTS FOR MEN",
      description: `Looking for good quality **plain t-shirts for men** that combine comfort, style, and value? Beyoung has you covered. Our collection of plain tees for men is perfect for effortless casual and semi-formal office outfits. They're designed for a great fit, lasting fabric, and fading-free colors. We ensure every t-shirt meets high standards of quality and comfort. Stop searching for different pieces; our collections are designed to get you ready in minutes, whether you're hitting the streets or heading to a meeting. Only Beyoung is your go-to destination for the best quality plain t-shirts for men at unbeatable prices.`,
    },
    "t-shirts": {
      title: "MEN'S T-SHIRTS COLLECTION",
      description: `Discover the ultimate collection of **Men's T-shirts**, including graphic, plain, printed, and oversized styles. Find your perfect fit for every occasion, from casual hangouts to a laid-back weekend. Our tees are made from premium, breathable fabrics to ensure maximum comfort and durability. Shop the best-selling, comfortable, and stylish tees right here.`,
    },
    "polo-t-shirts": {
      title: "POLO T-SHIRTS FOR MEN",
      description: `Explore our exclusive collection of **Polo T-shirts** for men. Perfect for a smart-casual look, our polos feature high-quality pique fabric, excellent fit, and a wide range of colors. Ideal for the office, a casual outing, or a relaxed weekend look. Our designs provide a structured, premium look without compromising on all-day comfort. Find your new favorite polo t-shirt today!`,
    },
    polos: {
      title: "POLO T-SHIRTS FOR MEN",
      description: `Explore our exclusive collection of **Polo T-shirts** for men. Perfect for a smart-casual look, our polos feature high-quality pique fabric, excellent fit, and a wide range of colors. Ideal for the office, a casual outing, or a relaxed weekend look. Our designs provide a structured, premium look without compromising on all-day comfort. Find your new favorite polo t-shirt today!`,
    },
    "full-sleeve-tshirts": {
      title: "FULL SLEEVE T-SHIRTS FOR MEN",
      description: `Shop the trendiest **Full Sleeve T-shirts** for men that offer the perfect blend of warmth and style. Ideal for transitional weather or a layered look, our long-sleeve tees come in various fits and colors. Upgrade your casual rotation with durable, comfortable, and fashionable full sleeve designs.`,
    },
    "printed-t-shirts": {
      title: "PRINTED T-SHIRTS FOR MEN",
      description: `Explore our vibrant collection of **Printed T-shirts** for men. Express your personality with bold graphics, unique designs, and eye-catching prints. Perfect for casual outings, weekend hangouts, or making a style statement. Our printed tees combine comfort with creativity.`,
    },
  };

  if (contentMap[currentSlug]) {
    displayTitle = contentMap[currentSlug].title;
    dynamicDescription = contentMap[currentSlug].description;
  }

  return {
    ...category,
    displayDescription: dynamicDescription,
    displayTitle: displayTitle || category.name,
  };
};

/**
 * Find active category from route parameters
 */
export const findActiveCategory = (allCategories, { slug, categoryName, categoryType }) => {
  if (!allCategories?.length) return null;

  let foundCat = null;

  if (slug) {
    foundCat = allCategories.find((cat) => slugify(cat.slug) === slugify(slug));
  }

  if (!foundCat && categoryName) {
    foundCat = allCategories.find((cat) => slugify(cat.slug) === slugify(categoryName));
  }

  if (!foundCat && categoryType) {
    foundCat = allCategories.find((cat) => slugify(cat.slug) === slugify(categoryType));
  }

  return foundCat;
};

/**
 * Get subcategory pills for a parent category
 */
export const getSubcategoryPills = (allCategories, activeCategory) => {
  if (!activeCategory || !allCategories?.length) return [];

  return allCategories
    .filter(
      (cat) =>
        String(cat.parentCategory) === String(activeCategory._id) &&
        cat.isActive
    )
    .map((cat) => ({
      name: cat.name,
      slug: cat.slug,
    }));
};