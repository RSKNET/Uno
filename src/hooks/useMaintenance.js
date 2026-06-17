import { useState, useEffect, useRef } from "react";
import supabaseClient from "@/utils/supabaseClient";

const useMaintenance = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previousMaintenanceRef = useRef(false);

  const checkMaintenanceStatus = async () => {
    try {
      const response = await fetch("/api/player/settings-status", {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data) {
        const maintenanceStatus = Boolean(result.data.maintenance);
        setIsMaintenance(maintenanceStatus);
        previousMaintenanceRef.current = maintenanceStatus;
      } else {
        setIsMaintenance(false);
      }
    } catch (error) {
      setIsMaintenance(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // 1. Initial Check
    checkMaintenanceStatus();

    // 2. Setup Realtime Subscription
    const channel = supabaseClient
      .channel("public:settings")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "settings" },
        (payload) => {
          if (payload.new && "maintenance_id" in payload.new) {
            // maintenance_id 2 means TRUE, 1 means FALSE
            const maintenanceStatus = payload.new.maintenance_id === 2;
            setIsMaintenance(maintenanceStatus);
            previousMaintenanceRef.current = maintenanceStatus;
          } else {
            // Fallback just in case
            checkMaintenanceStatus();
          }
        }
      )
      .subscribe();

    // 3. Cleanup on unmount
    return () => {
      supabaseClient.removeChannel(channel);
    };
  }, []);

  return {
    isMaintenance,
    isLoading,
  };
};

export default useMaintenance;
