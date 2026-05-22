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
    // Force Vite to prebundle the JSX runtimes alongside React so they
    // share a single ReactSharedInternals instance. Without this they
    // ended up in a separate chunk that bypassed federation sharing,
    // splitting ReactSharedInternals.A from the one react-dom-client
    // writes to and crashing with "dispatcher.getOwner is not a function"
    // the moment any component used jsx-runtime under StrictMode/Redux.
    include: ["react/jsx-runtime", "react/jsx-dev-runtime"],
  },
  build: {
    target: "esnext",
  },
});
