import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import os from 'os';

// --- HELPER: Smartly Find Local Wi-Fi IP ---
function getLocalIP() {
  const interfaces = os.networkInterfaces();
  let bestMatch = 'localhost';

  for (const name of Object.keys(interfaces)) {
    const lowerName = name.toLowerCase();

    // 1. Ignore common virtual/internal adapters
    if (lowerName.includes('virtual') || lowerName.includes('vmware') || lowerName.includes('vethernet') || lowerName.includes('wsl')) {
      continue;
    }

    for (const iface of interfaces[name]) {
      // Only check IPv4 and non-internal IPs
      if (iface.family === 'IPv4' && !iface.internal) {
        
        // 2. If the interface name says "Wi-Fi", THIS IS THE ONE!
        if (lowerName.includes('wi-fi')) {
          return iface.address;
        }

        // 3. Keep the last valid one found as a backup (in case "Wi-Fi" isn't in the name)
        bestMatch = iface.address;
      }
    }
  }
  return bestMatch;
}

const localIP = getLocalIP();
console.log(`\n🚀 App configured with Smart IP Selection: ${localIP}\n`);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expose to all network interfaces
    port: 5173
  },
  define: {
    'import.meta.env.VITE_LOCAL_IP': JSON.stringify(localIP), 
  }
});