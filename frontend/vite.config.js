import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  server: {
    hmr:
      process.env.NODE_ENV === "production"
        ? false
        : {
            host: "qlue.in",
            protocol: "wss",
            clientPort: 443,
            secure: true,
          },
	allowedHosts:['qlue.in','www.qlue.in','0.0.0.0']
  },
  plugins: [react()],
  port: 5173,
  proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      }
  },

   build: {
    // Minify and obfuscate code
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,    // Remove console.log
        drop_debugger: true,   // Remove debugger statements
      },
      mangle: {
        toplevel: true,        // Obfuscate top-level names
      },
      format: {
        comments: false,       // Remove comments
      }
    },
    // Disable source maps in production
    sourcemap: false,
    rollupOptions: {
      output: {
        // Obfuscate chunk names
        manualChunks: undefined,
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]'
      }
    }
  }
});
