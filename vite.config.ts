import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      "@/": path.resolve(__dirname, "src"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/pages": path.resolve(__dirname, "src/pages"),
      "@/consts": path.resolve(__dirname, "src/consts"),
      "@/libs": path.resolve(__dirname, "src/libs"),
      "@/hooks": path.resolve(__dirname, "src/hooks"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Create separate chunks for React components
          if (
            id.includes("node_modules/react") ||
            id.includes("node_modules/react-dom") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler")
          ) {
            return "react";
          }

          // UI libraries
          if (
            id.includes("node_modules/tailwindcss") ||
            id.includes("node_modules/@headlessui") ||
            id.includes("node_modules/framer-motion")
          ) {
            return "ui";
          }

          // Nostr tools
          if (id.includes("node_modules/nostr-tools")) {
            return "nostr-tools";
          }

          // Capacitor and device features
          if (
            id.includes("node_modules/@capacitor") ||
            id.includes("node_modules/capacitor")
          ) {
            return "capacitor";
          }

          // Crypto-specific tools
          if (id.includes("node_modules/@noble/secp256k1")) {
            return "noble-secp256k1";
          }

          // Seedphrase handling
          if (id.includes("node_modules/nostr-nsec-seedphrase")) {
            return "seedphrase";
          }

          // Nostr NDK libraries
          if (
            id.includes("node_modules/@nostr-dev-kit") ||
            (id.includes("node_modules/nostr") &&
              !id.includes("node_modules/nostr-tools") &&
              !id.includes("node_modules/nostr-nsec-seedphrase"))
          ) {
            return "nostr";
          }

          // Database/storage libraries
          if (
            id.includes("node_modules/dexie") ||
            id.includes("node_modules/idb") ||
            id.includes("node_modules/localforage")
          ) {
            return "storage";
          }

          // Crypto and encoding libraries
          if (
            id.includes("node_modules/crypto") ||
            (id.includes("node_modules/noble") &&
              !id.includes("node_modules/@noble/secp256k1")) ||
            id.includes("node_modules/secp256k1") ||
            id.includes("node_modules/bech32") ||
            id.includes("node_modules/bitcoinjs") ||
            id.includes("node_modules/bs58") ||
            id.includes("node_modules/buffer")
          ) {
            return "crypto";
          }

          // Utility libraries
          if (
            id.includes("node_modules/clsx") ||
            id.includes("node_modules/classnames") ||
            id.includes("node_modules/lodash")
          ) {
            return "utils";
          }

          // Data utilities
          if (
            id.includes("node_modules/date-fns") ||
            id.includes("node_modules/moment") ||
            id.includes("node_modules/dayjs") ||
            id.includes("node_modules/luxon")
          ) {
            return "date-utils";
          }

          // Form and validation
          if (
            id.includes("node_modules/formik") ||
            id.includes("node_modules/yup") ||
            id.includes("node_modules/react-hook-form") ||
            id.includes("node_modules/validator")
          ) {
            return "forms";
          }

          // State management
          if (
            id.includes("node_modules/redux") ||
            id.includes("node_modules/recoil") ||
            id.includes("node_modules/zustand") ||
            id.includes("node_modules/jotai") ||
            id.includes("node_modules/mobx")
          ) {
            return "state";
          }

          // PWA related
          if (
            id.includes("node_modules/vite-plugin-pwa") ||
            id.includes("node_modules/workbox")
          ) {
            return "pwa";
          }

          // Other third-party packages
          if (id.includes("node_modules")) {
            return "vendor";
          }

          // Keep application code in separate chunk
          return "app";
        },
      },
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "NostrChat PWA",
        short_name: "NostrChat",
        description: "NostrChat Progressive Web App",
        theme_color: "#ffffff",
        icons: [
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
    }),
  ],
});
