"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background:
              "linear-gradient(135deg, #fff5f0 0%, #ffffff 50%, #fff5f0 100%)",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{ textAlign: "center", maxWidth: "600px", padding: "20px" }}
          >
            <h1
              style={{
                fontSize: "96px",
                fontWeight: "900",
                background: "linear-gradient(135deg, #ff8c00 0%, #ff6600 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "24px",
              }}
            >
              500
            </h1>
            <h2
              style={{
                fontSize: "32px",
                fontWeight: "700",
                color: "#1a1a1a",
                marginBottom: "16px",
              }}
            >
              Critical Error
            </h2>
            <p
              style={{
                fontSize: "18px",
                color: "#666",
                marginBottom: "32px",
              }}
            >
              A critical error occurred. Please refresh the page or contact
              support if the problem persists.
            </p>
            <button
              onClick={reset}
              style={{
                padding: "12px 32px",
                backgroundColor: "#ff8c00",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.backgroundColor = "#ff6600")}
              onMouseOut={(e) => (e.target.style.backgroundColor = "#ff8c00")}
            >
              Try Again
            </button>
            <div style={{ marginTop: "48px" }}>
              <span
                style={{
                  fontSize: "24px",
                  fontWeight: "700",
                  color: "#1a1a1a",
                }}
              >
                INVEX<span style={{ color: "#ff8c00" }}>iS</span>
              </span>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
