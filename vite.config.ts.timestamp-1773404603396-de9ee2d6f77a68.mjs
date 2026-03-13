// vite.config.ts
import { defineConfig } from "file:///D:/Projetos%20de%20websites/bochel/boch-lend-flow-ai/node_modules/vite/dist/node/index.js";
import react from "file:///D:/Projetos%20de%20websites/bochel/boch-lend-flow-ai/node_modules/@vitejs/plugin-react-swc/index.mjs";
import path from "path";
import { componentTagger } from "file:///D:/Projetos%20de%20websites/bochel/boch-lend-flow-ai/node_modules/lovable-tagger/dist/index.js";
var __vite_injected_original_dirname = "D:\\Projetos de websites\\bochel\\boch-lend-flow-ai";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    mode === "development" && componentTagger()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src")
    },
    dedupe: ["react", "react-dom"]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI components (Radix + Lucide)
          "vendor-ui": [
            "lucide-react",
            "@radix-ui/react-dialog",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover"
          ],
          // Charts — heavy, only loaded on dashboard
          "vendor-charts": ["recharts"],
          // PDF generation — very heavy, only loaded on specific actions
          "vendor-pdf": ["jspdf", "html2canvas", "pdf-lib"],
          // Animations
          "vendor-motion": ["framer-motion"],
          // Supabase
          "vendor-supabase": ["@supabase/supabase-js"]
        }
      }
    }
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQcm9qZXRvcyBkZSB3ZWJzaXRlc1xcXFxib2NoZWxcXFxcYm9jaC1sZW5kLWZsb3ctYWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkQ6XFxcXFByb2pldG9zIGRlIHdlYnNpdGVzXFxcXGJvY2hlbFxcXFxib2NoLWxlbmQtZmxvdy1haVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vRDovUHJvamV0b3MlMjBkZSUyMHdlYnNpdGVzL2JvY2hlbC9ib2NoLWxlbmQtZmxvdy1haS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XHJcbmltcG9ydCByZWFjdCBmcm9tIFwiQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djXCI7XHJcbmltcG9ydCBwYXRoIGZyb20gXCJwYXRoXCI7XHJcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xyXG5cclxuLy8gaHR0cHM6Ly92aXRlanMuZGV2L2NvbmZpZy9cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6IFwiOjpcIixcclxuICAgIHBvcnQ6IDgwODAsXHJcbiAgfSxcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgbW9kZSA9PT0gJ2RldmVsb3BtZW50JyAmJlxyXG4gICAgY29tcG9uZW50VGFnZ2VyKCksXHJcbiAgXS5maWx0ZXIoQm9vbGVhbiksXHJcbiAgcmVzb2x2ZToge1xyXG4gICAgYWxpYXM6IHtcclxuICAgICAgXCJAXCI6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsIFwiLi9zcmNcIiksXHJcbiAgICB9LFxyXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcclxuICB9LFxyXG4gIGJ1aWxkOiB7XHJcbiAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgIG91dHB1dDoge1xyXG4gICAgICAgIG1hbnVhbENodW5rczoge1xyXG4gICAgICAgICAgLy8gQ29yZSBSZWFjdFxyXG4gICAgICAgICAgJ3ZlbmRvci1yZWFjdCc6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ3JlYWN0LXJvdXRlci1kb20nXSxcclxuICAgICAgICAgIC8vIFVJIGNvbXBvbmVudHMgKFJhZGl4ICsgTHVjaWRlKVxyXG4gICAgICAgICAgJ3ZlbmRvci11aSc6IFsnbHVjaWRlLXJlYWN0JywgJ0ByYWRpeC11aS9yZWFjdC1kaWFsb2cnLCAnQHJhZGl4LXVpL3JlYWN0LXNlbGVjdCcsXHJcbiAgICAgICAgICAgICdAcmFkaXgtdWkvcmVhY3QtdGFicycsICdAcmFkaXgtdWkvcmVhY3QtZHJvcGRvd24tbWVudScsICdAcmFkaXgtdWkvcmVhY3QtcG9wb3ZlciddLFxyXG4gICAgICAgICAgLy8gQ2hhcnRzIFx1MjAxNCBoZWF2eSwgb25seSBsb2FkZWQgb24gZGFzaGJvYXJkXHJcbiAgICAgICAgICAndmVuZG9yLWNoYXJ0cyc6IFsncmVjaGFydHMnXSxcclxuICAgICAgICAgIC8vIFBERiBnZW5lcmF0aW9uIFx1MjAxNCB2ZXJ5IGhlYXZ5LCBvbmx5IGxvYWRlZCBvbiBzcGVjaWZpYyBhY3Rpb25zXHJcbiAgICAgICAgICAndmVuZG9yLXBkZic6IFsnanNwZGYnLCAnaHRtbDJjYW52YXMnLCAncGRmLWxpYiddLFxyXG4gICAgICAgICAgLy8gQW5pbWF0aW9uc1xyXG4gICAgICAgICAgJ3ZlbmRvci1tb3Rpb24nOiBbJ2ZyYW1lci1tb3Rpb24nXSxcclxuICAgICAgICAgIC8vIFN1cGFiYXNlXHJcbiAgICAgICAgICAndmVuZG9yLXN1cGFiYXNlJzogWydAc3VwYWJhc2Uvc3VwYWJhc2UtanMnXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICB9LFxyXG59KSk7XHJcblxyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQThVLFNBQVMsb0JBQW9CO0FBQzNXLE9BQU8sV0FBVztBQUNsQixPQUFPLFVBQVU7QUFDakIsU0FBUyx1QkFBdUI7QUFIaEMsSUFBTSxtQ0FBbUM7QUFNekMsSUFBTyxzQkFBUSxhQUFhLENBQUMsRUFBRSxLQUFLLE9BQU87QUFBQSxFQUN6QyxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixNQUFNO0FBQUEsRUFDUjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFDVCxnQkFBZ0I7QUFBQSxFQUNsQixFQUFFLE9BQU8sT0FBTztBQUFBLEVBQ2hCLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxJQUN0QztBQUFBLElBQ0EsUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLEVBQy9CO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxlQUFlO0FBQUEsTUFDYixRQUFRO0FBQUEsUUFDTixjQUFjO0FBQUE7QUFBQSxVQUVaLGdCQUFnQixDQUFDLFNBQVMsYUFBYSxrQkFBa0I7QUFBQTtBQUFBLFVBRXpELGFBQWE7QUFBQSxZQUFDO0FBQUEsWUFBZ0I7QUFBQSxZQUEwQjtBQUFBLFlBQ3REO0FBQUEsWUFBd0I7QUFBQSxZQUFpQztBQUFBLFVBQXlCO0FBQUE7QUFBQSxVQUVwRixpQkFBaUIsQ0FBQyxVQUFVO0FBQUE7QUFBQSxVQUU1QixjQUFjLENBQUMsU0FBUyxlQUFlLFNBQVM7QUFBQTtBQUFBLFVBRWhELGlCQUFpQixDQUFDLGVBQWU7QUFBQTtBQUFBLFVBRWpDLG1CQUFtQixDQUFDLHVCQUF1QjtBQUFBLFFBQzdDO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQ0YsRUFBRTsiLAogICJuYW1lcyI6IFtdCn0K
