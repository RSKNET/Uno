import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";

const useMaintenance = () => {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const previousMaintenanceRef = useRef(false);

  useEffect(() => {
    const checkMaintenanceStatus = async () => {
      try {
        const response = await fetch("/api/settings-status");
        const result = await response.json();

        if (result.success) {
          const maintenanceStatus = result.data.maintenance;
          const previousMaintenanceStatus = previousMaintenanceRef.current;

          setIsMaintenance(maintenanceStatus);
          previousMaintenanceRef.current = maintenanceStatus;

          if (maintenanceStatus && !previousMaintenanceStatus) {
            const currentPath = router.asPath;
            if (currentPath !== "/maintenance") {
              localStorage.setItem("lastAccessedPage", currentPath);
            }
            router.push("/maintenance");
          }

          if (!maintenanceStatus && previousMaintenanceStatus) {
            const lastPage = localStorage.getItem("lastAccessedPage");
            if (lastPage && lastPage !== "/maintenance") {
              localStorage.removeItem("lastAccessedPage");
              router.push(lastPage);
            } else {
              router.push("/");
            }
          }
        }
      } catch (error) {
      } finally {
        setIsLoading(false);
      }
    };

    checkMaintenanceStatus();

    const interval = setInterval(checkMaintenanceStatus, 1000);

    return () => clearInterval(interval);
  }, [router]);

  return {
    isMaintenance,
    isLoading,
  };
};

export default useMaintenance;
