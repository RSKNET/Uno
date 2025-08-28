import React, { useState } from "react";
import { useRouter } from "next/router";
import Navbar from "@/components/Navbar";
import Notification from "@/components/Notification";
import Loading from "@/components/Loading";
import styles from "@/styles/pages/LoginPage.module.css";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { username, password } = formData;

    if (!username?.trim() || !password?.trim()) {
      showNotification("Username dan password wajib diisi!", "error");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.token && result.user) {
        localStorage.setItem("token", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        showNotification("Login berhasil!", "success");
        await router.push("/admin");
      } else {
        showNotification(result.error || "Login gagal!", "error");
        setIsLoading(false);
      }
    } catch (error) {
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.body}>
        <Navbar />

        {notification && (
          <Notification
            message={notification.message}
            type={notification.type}
            onClose={closeNotification}
            duration={4000}
          />
        )}

        <Loading isVisible={isLoading} message="Sedang login..." />

        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <h1>🎮 Admin Login</h1>
              <p>Masuk untuk mengakses panel admin tournament UNO</p>
            </div>

            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <div className={styles.inputWrapper}>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    placeholder="Masukkan username"
                    value={formData.username}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <span className={styles.inputIcon}>👤</span>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Masukkan password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    required
                  />
                  <span className={styles.inputIcon}>🔒</span>
                  <button
                    type="button"
                    className={styles.togglePassword}
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? "Sedang masuk..." : "Masuk"}
              </button>
            </form>

            <div className={styles.loginFooter}>
              <p>
                Kembali ke{" "}
                <button
                  onClick={() => router.push("/")}
                  className={styles.linkButton}
                  disabled={isLoading}
                >
                  halaman utama
                </button>
              </p>
            </div>
          </div>

          <div className={styles.loginInfo}>
            <div className={styles.infoCard}>
              <h3>🔐 Info Login</h3>
              <div className={styles.infoContent}>
                <p>Panel admin untuk mengelola:</p>
                <ul>
                  <li>📊 Data Tournament</li>
                  <li>👥 Data Players</li>
                  <li>🏆 Hasil Pertandingan</li>
                  <li>📈 Statistik</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
