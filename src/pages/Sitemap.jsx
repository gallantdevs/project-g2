import React from 'react';
import styles from './Sitemap.module.css';

const Sitemap = () => {

  // Nested Data Structure Example
  const sitemapData = [
    { 
      title: "Topwear", 
      link: "#",
      children: [
        { title: "Printed T-shirts", link: "#" },
        { title: "Oversize T-shirts", link: "#" },
        { title: "Plain T-shirts", link: "#" },
        { title: "Shirts", link: "#" },
        { title: "Polo T-shirts", link: "#" }
      ]
    },
    { 
      title: "Bottomwear", 
      link: "#",
      children: [
        { title: "Joggers", link: "#" },
        { title: "Chinos", link: "#" },
        { title: "Jeans", link: "#" }
      ]
    },
    { title: "70 Minute Deals", link: "#" },
    { title: "App Exclusive", link: "#" },
    { title: "Back To College", link: "#" },
    { title: "Bestseller under 999", link: "#" },
    { title: "Black Friday Sale", link: "#" },
    { title: "Deal Of the Day", link: "#" },
    { title: "Drop Shoulder T-shirts for Men", link: "#" },
    { title: "Festive Fashion Sale", link: "#" },
    { title: "GOAT Sale on Shirts", link: "#" },
    { title: "Half Price Store", link: "#" },
    { title: "New Core Similar Products", link: "#" },
    { title: "Pre-Fall Collection", link: "#" },
    { title: "Pyjamas Combo", link: "#" }
  ];

  const renderTree = (nodes, isSubTree = false) => {
    return (
      <ul className={isSubTree ? styles.subTree : styles.tree}>
        {nodes.map((node, index) => (
          <li key={index} className={styles.treeItem}>
            <a href={node.link} className={`${styles.link} ${node.children ? styles.hasChildren : ''}`}>
              {node.title}
            </a>
            
            {node.children && node.children.length > 0 && (
              renderTree(node.children, true)
            )}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.mainHeading}>Sitemap</h1>
      {renderTree(sitemapData)}
    </div>
  );
}

export default Sitemap;