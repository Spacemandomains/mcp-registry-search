import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* MCP text */}
        <span
          style={{
            color: "#e2e8f0",
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: -0.5,
            lineHeight: 1,
            marginBottom: 2,
          }}
        >
          MCP
        </span>
        {/* Magnifying glass dot indicator */}
        <div
          style={{
            position: "absolute",
            bottom: 5,
            right: 5,
            width: 8,
            height: 8,
            borderRadius: "50%",
            border: "1.5px solid #6366f1",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 2,
              height: 4,
              background: "#6366f1",
              borderRadius: 1,
              transform: "rotate(45deg) translateY(1px)",
            }}
          />
        </div>
      </div>
    ),
    { ...size }
  );
}
