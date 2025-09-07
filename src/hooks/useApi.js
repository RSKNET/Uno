import { useAuth } from "@/context/AuthContext";
import { useCallback } from "react";

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
      const params = {};
      if (search) params.search = search;
      if (id) params.id = id;
      return apiGet("/api/players", null, params);
    },
    [apiGet]
  );

  const createPlayer = useCallback(
    async (playerData) => apiPost("/api/players", playerData),
    [apiPost]
  );

  const updatePlayer = useCallback(
    async (playerData) => apiPut("/api/players", playerData),
    [apiPut]
  );

  const deletePlayer = useCallback(
    async (playerId) => apiDelete("/api/players", null, { id: playerId }),
    [apiDelete]
  );

  const fetchReports = useCallback(async () => apiGet("/api/report"), [apiGet]);

  const fetchSettings = useCallback(
    async () => apiGet("/api/settings"),
    [apiGet]
  );

  const updateSettings = useCallback(
    async (settingsData) => apiPut("/api/settings", settingsData),
    [apiPut]
  );

  const fetchSettingsStatus = useCallback(
    async () => apiGet("/api/settings-status"),
    [apiGet]
  );

  return {
    fetchPlayers,
    createPlayer,
    updatePlayer,
    deletePlayer,
    fetchReports,
    fetchSettings,
    updateSettings,
    fetchSettingsStatus,
  };
};

export default useApi;
