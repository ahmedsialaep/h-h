import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        heading: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        /* ── ShadCN semantic tokens ── */
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        "surface-elevated": "hsl(var(--surface-elevated))",
        "text-dim": "hsl(var(--text-dim))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        /* ── SneakPeak brand palette (use as bg-sp-orange, text-sp-black, etc.) ── */
        "sp-black": {
          DEFAULT: "#0a0a0a",
          soft: "#111111",
          light: "#1a1a1a",
        },
        "sp-white": {
          DEFAULT: "#ffffff",
          soft: "#f4f4f5",
          muted: "#a3a3a3",
        },
        "sp-orange": {
          DEFAULT: "#ff5c00",
          bright: "#ff7a2e",
          dim: "#cc4a00",
        },
        "sp-gray": {
          DEFAULT: "#2d2d2d",
          light: "#525252",
        },
        "sp-success": "#22c55e",
        "sp-warning": "#eab308",
        "sp-error": "#ef4444",
        "sp-info": "#3b82f6",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    plugin(function ({ addBase }) {
      addBase({
        ":root": {
          /* ── Light theme ── */
          "--background": "0 0% 100%",
          "--foreground": "0 0% 8%",

          "--card": "0 0% 98%",
          "--card-foreground": "0 0% 8%",

          "--popover": "0 0% 100%",
          "--popover-foreground": "0 0% 8%",

          "--primary": "22 100% 50%",
          "--primary-foreground": "0 0% 100%",

          "--secondary": "0 0% 96%",
          "--secondary-foreground": "0 0% 8%",

          "--muted": "0 0% 94%",
          "--muted-foreground": "0 0% 40%",

          "--accent": "22 100% 50%",
          "--accent-foreground": "0 0% 100%",

          "--destructive": "0 84% 55%",
          "--destructive-foreground": "0 0% 100%",

          "--border": "0 0% 88%",
          "--input": "0 0% 88%",
          "--ring": "22 100% 50%",

          "--radius": "0.5rem",

          "--sidebar-background": "0 0% 98%",
          "--sidebar-foreground": "0 0% 20%",
          "--sidebar-primary": "22 100% 50%",
          "--sidebar-primary-foreground": "0 0% 100%",
          "--sidebar-accent": "0 0% 94%",
          "--sidebar-accent-foreground": "0 0% 20%",
          "--sidebar-border": "0 0% 88%",
          "--sidebar-ring": "22 100% 50%",

          "--surface-elevated": "0 0% 96%",
          "--text-dim": "0 0% 50%",
        },
        ".dark": {
          /* ── Dark theme ── */
          "--background": "0 0% 4%",
          "--foreground": "0 0% 100%",

          "--card": "0 0% 10%",
          "--card-foreground": "0 0% 100%",

          "--popover": "0 0% 10%",
          "--popover-foreground": "0 0% 100%",

          "--primary": "22 100% 50%",
          "--primary-foreground": "0 0% 100%",

          "--secondary": "0 0% 10%",
          "--secondary-foreground": "0 0% 100%",

          "--muted": "0 0% 15%",
          "--muted-foreground": "0 0% 53%",

          "--accent": "22 100% 50%",
          "--accent-foreground": "0 0% 100%",

          "--destructive": "0 84% 60%",
          "--destructive-foreground": "0 0% 100%",

          "--border": "0 0% 18%",
          "--input": "0 0% 18%",
          "--ring": "22 100% 50%",

          "--sidebar-background": "0 0% 6%",
          "--sidebar-foreground": "0 0% 90%",
          "--sidebar-primary": "22 100% 50%",
          "--sidebar-primary-foreground": "0 0% 100%",
          "--sidebar-accent": "0 0% 12%",
          "--sidebar-accent-foreground": "0 0% 90%",
          "--sidebar-border": "0 0% 18%",
          "--sidebar-ring": "22 100% 50%",

          "--surface-elevated": "0 0% 8%",
          "--text-dim": "0 0% 40%",
        },
      });
    }),
  ],
} satisfies Config;
