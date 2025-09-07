import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/ui/Loading";
import { useRouter } from "next/router";
import { useEffect } from "react";

const ProtectedRoute = ({ children, requireAuth = true }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && requireAuth && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isLoading, isAuthenticated, requireAuth, router]);

  if (isLoading) {
    return <Loading isVisible={true} message="Memverifikasi autentikasi..." />;
  }

  if (requireAuth && !isAuthenticated) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
