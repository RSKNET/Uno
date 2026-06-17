import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

// Helper functions for safe localstorage operations
const getCache = (key) => {
  try {
    const cached = localStorage.getItem(key);
    if (cached) return JSON.parse(cached);
  } catch (e) {
    return null;
  }
  return null;
};

const setCache = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {}
};

const clearCache = (key) => {
  try {
    localStorage.removeItem(key);
  } catch (e) {}
};

export const useApi = () => {
  const { apiCall } = useAuth();

  const createApiMethod = useCallback(
    (method = "GET") =>
      async (endpoint, data = null, params = {}) => {
        const queryString = Object.keys(params).length
          ? `?${new URLSearchParams(params).toString()}`
          : "";

        const config =
          method !== "GET" && data
            ? { method, body: JSON.stringify(data) }
            : { method };

        const response = await apiCall(`${endpoint}${queryString}`, config);
        return response.json();
      },
    [apiCall]
  );

  const apiGet = createApiMethod("GET");
  const apiPost = createApiMethod("POST");
  const apiPut = createApiMethod("PUT");
  const apiDelete = createApiMethod("DELETE");

  const fetchPlayers = useCallback(
    async (search = "", id = "") => {
      const isCacheable = !search && !id;
      const CACHE_KEY = "admin_cache_players";

      if (isCacheable) {
        const cachedData = getCache(CACHE_KEY);
        if (cachedData) return cachedData;
      }

      const params = {};
      if (search) params.search = search;
      if (id) params.id = id;
      
      const response = await apiGet("/api/admin/players", null, params);
      
      if (isCacheable && response?.success) {
        setCache(CACHE_KEY, response);
      }
      return response;
    },
    [apiGet]
  );

  const createPlayer = useCallback(
    async (playerData) => {
      const response = await apiPost("/api/admin/players", playerData);
      if (response?.success) clearCache("admin_cache_players");
      return response;
    },
    [apiPost]
  );

  const updatePlayer = useCallback(
    async (playerData) => {
      const response = await apiPut("/api/admin/players", playerData);
      if (response?.success) clearCache("admin_cache_players");
      return response;
    },
    [apiPut]
  );

  const deletePlayer = useCallback(
    async (playerId) => {
      const response = await apiDelete("/api/admin/players", null, { id: playerId });
      if (response?.success) clearCache("admin_cache_players");
      return response;
    },
    [apiDelete]
  );

  const fetchReports = useCallback(
    async () => {
      const CACHE_KEY = "admin_cache_reports";
      const cachedData = getCache(CACHE_KEY);
      if (cachedData) return cachedData;

      const response = await apiGet("/api/admin/report");
      if (response?.success) setCache(CACHE_KEY, response);
      return response;
    },
    [apiGet]
  );

  const fetchSettings = useCallback(
    async () => {
      const CACHE_KEY = "admin_cache_settings";
      const cachedData = getCache(CACHE_KEY);
      if (cachedData) return cachedData;

      const response = await apiGet("/api/admin/settings");
      if (response?.success) setCache(CACHE_KEY, response);
      return response;
    },
    [apiGet]
  );

  const updateSettings = useCallback(
    async (settingsData) => {
      const response = await apiPut("/api/admin/settings", settingsData);
      if (response?.success) clearCache("admin_cache_settings");
      return response;
    },
    [apiPut]
  );

  return {
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    fetchReports,
    fetchSettings,
    updateSettings,
  };
};

export default useApi;
