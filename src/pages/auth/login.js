import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import Notification from "@/components/ui/Notification";
import Loading from "@/components/ui/Loading";
import styles from "@/styles/pages/auth/LoginPage.module.css";

const IconUser = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconLock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const IconEye = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const IconEyeOff = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const LoginPage = () => {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  const showNotification = useCallback((message, type = "success") => {
    setNotification({ message, type });
  }, []);

  const closeNotification = useCallback(() => {
    setNotification(null);
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData;

    if (!username?.trim() || !password?.trim()) {
      showNotification("Username dan password wajib diisi!", "error");
      return;
    }

    setIsLoading(true);

    try {
      const result = await login({
        username: username.trim(),
        password,
      });

      if (result.success) {
        showNotification("Login berhasil!", "success");
        router.push("/admin");
      } else {
        showNotification(result.error || "Login gagal!", "error");
      }
    } catch (error) {
      showNotification("Terjadi kesalahan. Silakan coba lagi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <main className={styles.container}>
      <div className={styles.glowOrb}></div>
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
          <div className={`${styles.loginWrapper} double-bezel`}>
            <div className={`${styles.loginCard} double-bezel-inner`}>
              <div className={styles.loginHeader}>
                <h1>Admin Login</h1>
                <p>Panel manajemen turnamen UNO</p>
              </div>

              <form onSubmit={handleSubmit} className={styles.loginForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="username">Username</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <IconUser />
                    </span>
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
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="password">Password</label>
                  <div className={styles.inputWrapper}>
                    <span className={styles.inputIcon}>
                      <IconLock />
                    </span>
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
                    <button
                      type="button"
                      className={styles.togglePassword}
                      onClick={togglePasswordVisibility}
                      disabled={isLoading}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <IconEyeOff /> : <IconEye />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className={styles.loginButton}
                  disabled={isLoading}
                >
                  <span>{isLoading ? "Masuk..." : "Masuk"}</span>
                  <div className={styles.loginButtonIcon}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path>
                      <polyline points="10 17 15 12 10 7"></polyline>
                      <line x1="15" y1="12" x2="3" y2="12"></line>
                    </svg>
                  </div>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default LoginPage;
