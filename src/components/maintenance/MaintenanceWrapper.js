import React from "react";
import { useRouter } from "next/router";
import MaintenancePage from "@/components/maintenance/MaintenancePage";
import Loading from "@/components/ui/Loading";
import useMaintenance from "@/hooks/useMaintenance";

const MAINTENANCE_PROTECTED_ROUTES = ["/", "/game"];

const MaintenanceWrapper = ({ children }) => {
  const router = useRouter();
  const { isLoading: isMaintenanceLoading, isMaintenance } = useMaintenance();

  const shouldCheckMaintenance = MAINTENANCE_PROTECTED_ROUTES.includes(
    router.pathname
  );

  if (!shouldCheckMaintenance) {
    return children;
  }

  if (isMaintenanceLoading) {
    return <Loading isVisible={true} message="Memeriksa status sistem..." />;
  }

  if (isMaintenance) {
    return <MaintenancePage />;
  }

  return children;
};

export default MaintenanceWrapper;
