import React from "react";
import styles from "@/styles/components/layout/Navbar.module.css";

const Navbar = () => {
  return (
    <nav className={styles.navigation}>
      <div className={styles.logo}>
        <h1>UNO Tournament</h1>
      </div>
    </nav>
  );
};

export default Navbar;
