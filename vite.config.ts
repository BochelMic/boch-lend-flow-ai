import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import legacy from "@vitejs/plugin-legacy";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    legacy({
      targets: ['chrome >= 60', 'safari >= 11', 'ios >= 11', 'edge >= 18'],
      additionalLegacyPolyfills: ['regenerator-runtime/runtime']
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    // Evita múltiplas instâncias do React (corrige erros de hooks como "useState" nulo)
    dedupe: ["react", "react-dom"],
  },
}));
