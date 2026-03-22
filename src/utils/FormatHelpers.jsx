import React from "react";

export const formatDescription = (text) => {
  if (!text) return null;

  return text.split("**").map((segment, index) => {
    if (index % 2 === 1) {
      return <b key={index}>{segment}</b>;
    }
    return <span key={index}>{segment}</span>;
  });
};

/**
 * Color hex code mapping
 */
export const COLOR_MAP = {
  black: "#000000",
  white: "#FFFFFF",
  brown: "#8B4513",
  beige: "#F5F5DC",
  camel: "#C19A6B",
  caramel: "#A0522D",
  green: "#008000",
  "army green": "#4B5320",
  "bottle green": "#006A4E",
  blue: "#0000FF",
  "sky blue": "#87CEEB",
  red: "#FF0000",
  maroon: "#800000",
  grey: "#808080",
  gray: "#808080",
  yellow: "#FFFF00",
  pink: "#FFC0CB",
  orange: "#FFA500",
  purple: "#800080",
  navy: "#000080",
  olive: "#808000",
  teal: "#008080",
};


export function normalizeColorToFamily(colorName) {
  if (!colorName) return "other";

  const name = colorName.toLowerCase().trim();

  if (name.includes("blue")) return "blue";
  if (name.includes("green")) return "green";
  if (
    name.includes("red") ||
    name.includes("maroon") ||
    name.includes("burgundy")
  )
    return "red";
  if (name.includes("black") || name.includes("charcoal")) return "black";
  if (name.includes("grey") || name.includes("gray")) return "grey";
  if (name.includes("white") || name.includes("off-white")) return "white";
  if (name.includes("beige") || name.includes("cream")) return "beige";
  if (name.includes("brown") || name.includes("chocolate")) return "brown";
  if (name.includes("yellow") || name.includes("mustard")) return "yellow";
if (name.includes("purple") || name.includes("violet") || name.includes("lavender") || name.includes("lilac")) return "purple";
  if (name.includes("pink")) return "pink";
  if (name.includes("orange")) return "orange";
  if (name.includes("silver")) return "silver";
  if (name.includes("gold")) return "gold";
  return "other";
}


export function getColorHex(colorFamily) {
  const normalizedColor = colorFamily.toLowerCase().trim();
  switch (normalizedColor) {
    case "black":
      return "#000000";
    case "blue":
      return "#0000FF";
    case "red":
      return "#FF0000";
    case "beige":
      return "#F5F5DC";
    case "white":
      return "#FFFFFF";
    case "brown":
      return "#A52A2A";
    case "green":
      return "#008000";
    case "grey":
      return "#808080";
    case "yellow":
      return "#FFFF00";
    case "purple":
      return "#800080";
    case "pink":
      return "#FFC0CB";
    case "orange":
      return "#FFA500";
    case "silver":
      return "#C0C0C0";
    case "gold":
      return "#FFD700";

    default:
      return "#cccccc"; // Fallback color
  }
}
