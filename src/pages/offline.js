import { useRouter } from "next/router";
import { useEffect, useState } from "react";

export default function OfflinePage() {
  const router = useRouter();
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      router.push("/login");
    }
  }, [isOnline, router]);

  if (isOnline) {
    return null;
  }

  return (
    <div
      style={{
        background:
          "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        textAlign: "center",
        fontFamily: '"Roboto Condensed", "Arial", sans-serif',
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          background: "rgba(20, 20, 40, 0.95)",
          backdropFilter: "blur(10px)",
          border: "2px solid #0f3460",
          borderRadius: "20px",
          padding: "40px",
          boxShadow: "0 20px 40px rgba(0, 0, 0, 0.3)",
          maxWidth: "500px",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            width: "80px",
            height: "80px",
            margin: "0 auto 20px",
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 20px rgba(26, 26, 46, 0.5)",
            border: "2px solid rgba(26, 26, 46, 0.3)",
          }}
        >
          <span
            style={{
              color: "white",
              fontSize: "24px",
              fontWeight: "bold",
              fontFamily: '"PirataOne", cursive',
              textShadow: "0 2px 10px rgba(26, 26, 46, 0.5)",
            }}
          >
            UNO
          </span>
        </div>

        <h1
          style={{
            background:
              "linear-gradient(135deg, #000000 0%, #1a1a2e 50%, #16213e 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            fontSize: "2rem",
            fontWeight: "bold",
            marginBottom: "16px",
            textShadow: "0 2px 10px rgba(26, 26, 46, 0.3)",
          }}
        >
          Tidak Ada Koneksi
        </h1>

        <p
          style={{
            color: "#8a9ba8",
            fontSize: "1.1rem",
            marginBottom: "30px",
            lineHeight: "1.5",
          }}
        >
          Anda sedang offline. Aplikasi akan otomatis terhubung kembali ketika
          koneksi tersedia.
        </p>

        <div
          style={{
            width: "50px",
            height: "50px",
            border: "4px solid rgba(26, 26, 46, 0.3)",
            borderTop: "4px solid #1a1a2e",
            borderRadius: "50%",
            animation: "spin 2s linear infinite",
            margin: "0 auto",
          }}
        />

        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
