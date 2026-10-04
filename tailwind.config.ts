import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1e2640",
        panel: "#273250",
        panelSoft: "#33405f",
        gold: "#d8a45d",
        goldSoft: "#f4d29b",
        milk: "#f7ead2",
        danger: "#ffb1b1"
      },
      boxShadow: {
        glow: "0 18px 38px rgba(216,164,93,0.35)",
        card: "0 22px 55px rgba(0,0,0,0.25)"
      },
      borderRadius: {
        phone: "2rem"
      }
    }
  },
  plugins: []
};

export default config;
