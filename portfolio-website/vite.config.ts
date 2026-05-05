import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { federation } from "@module-federation/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: "configure-response-headers",
      configureServer: (server) => {
        server.middlewares.use((_req, res, next) => {
          res.setHeader("Cross-Origin-Embedder-Policy", "credentialless");
          res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
          next();
        });
      },
    },
    federation({
      name: "portfolio-shell",
      remotes: {
        calculators: {
          type: "module",
          name: "calculators",
          entry: "https://calculators-two-alpha.vercel.app/remoteEntry.js",
        },
      },
      shared: {
        react: { singleton: true, requiredVersion: "^19.0.0" },
        "react/": { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom": { singleton: true, requiredVersion: "^19.0.0" },
        "react-dom/": { singleton: true, requiredVersion: "^19.0.0" },
      },
      // The @module-federation/dts-plugin spawns a child process that
      // crashes intermittently on Node 23 with "Channel closed" / EPIPE.
      // We don't need live remote-type extraction at dev time —
      // src/remotes.d.ts already declares the consumed module shapes.
      dts: false,
    }),
  ],
  optimizeDeps: {
    // Workaround for an esbuild "could not resolve" error during dep
    // optimization when @module-federation/vite generates load-share
    // virtual modules for these subpaths. Excluding them lets the
    // federation runtime handle them at module-evaluation time instead.
    exclude: ["react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    target: "esnext",
  },
});
