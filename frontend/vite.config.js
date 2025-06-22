import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  // Load env from parent directory
  const env = loadEnv(mode, '../', 'VITE_')
  
  return {
    // Tell Vite to look for .env files in parent directory
    envDir: '../',
    
    server: {
      port: 5173, // ✅ Moved inside server object
      host: '0.0.0.0', // Allow external connections
      
      hmr: process.env.NODE_ENV === "production"
        ? false
        : {
            host: "qlue.in",
            protocol: "wss",
            clientPort: 443,
            secure: true,
          },
      
      allowedHosts: ['qlue.in', 'www.qlue.in', '0.0.0.0'], // ✅ From search result [2]
      
      // ✅ Moved proxy inside server object (from search result [1])
      proxy: {
        '/api': {
          target: 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        }
      },
    },

    plugins: [react()],
    
    // Make environment variables available
    define: {
      'process.env': JSON.stringify(env)
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
  }
});
