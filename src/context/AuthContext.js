import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/router";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  });
  const updateAuthState = (updates) => {
    setAuthState((prev) => ({ ...prev, ...updates }));
  };

  const clearAuthState = () => {
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  const router = useRouter();

  useEffect(() => {
    checkAuthentication();
  }, []);

  const checkAuthentication = async () => {
    try {
      const storedToken = localStorage.getItem("token");
      const storedUser = localStorage.getItem("user");

      if (!storedToken || !storedUser) {
        updateAuthState({ isLoading: false });
        return;
      }

      const response = await fetch("/api/verify-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${storedToken}`,
        },
      });

      const result = await response.json();

      if (result.success) {
        updateAuthState({
          token: storedToken,
          user: JSON.parse(storedUser),
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        logout();
      }
    } catch {
      logout();
    }
  };

  const login = async (credentials) => {
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (result.success) {
        const { token: newToken, user: userData } = result;

        localStorage.setItem("token", newToken);
        localStorage.setItem("user", JSON.stringify(userData));

        updateAuthState({
          token: newToken,
          user: userData,
          isAuthenticated: true,
        });

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch {
      return { success: false, error: "Terjadi kesalahan saat login" };
    }
  };

  const logout = async () => {
    try {
      if (authState.token) {
        await fetch("/api/admin/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authState.token}`,
          },
        });
      }
    } catch {
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Clear admin data caches
      localStorage.removeItem("admin_cache_players");
      localStorage.removeItem("admin_cache_settings");
      localStorage.removeItem("admin_cache_reports");
      clearAuthState();
      router.push("/auth/login");
    }
  };

  const apiCall = async (url, options = {}) => {
    const defaultHeaders = {
      "Content-Type": "application/json",
      ...(authState.token && { Authorization: `Bearer ${authState.token}` }),
    };

    const config = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        logout();
        throw new Error("Unauthorized");
      }

      return response;
    } catch (error) {
      if (error.message === "Unauthorized") {
        throw error;
      }
      throw new Error("Network error");
    }
  };

  const value = {
    user: authState.user,
    token: authState.token,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    login,
    logout,
    apiCall,
    checkAuthentication,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
