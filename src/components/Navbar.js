import React from "react";
import styles from "@/styles/components/Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navigation}>
      <div className={styles.logo}>
        <h1>
          <span>🎮</span>
          <span>UNO Tournament</span>
        </h1>
      </div>
    </nav>
  );
};

export default Navbar;
