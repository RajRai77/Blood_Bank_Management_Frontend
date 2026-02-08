export const theme = {
  colors: {
    // Brand Colors
    primary: "#E63946",    // The "Blood Red" used in buttons & logo
    primaryHover: "#D62828", 
    secondary: "#1D3557",  // Navy Blue (Sidebar text, Headings)
    accent: "#457B9D",     // Lighter Blue (Icons, Links)

    // Backgrounds
    background: "#F3F4F6", // Light Gray (Main App Background)
    surface: "#FFFFFF",    // White (Cards, Sidebar, Modals)
    input: "#F9FAFB",      // Very light gray (Form Inputs)

    // Text
    textPrimary: "#111827",   // Almost Black (Main Headings)
    textSecondary: "#6B7280", // Gray (Subtitles, Labels)
    textLight: "#FFFFFF",     // White text on Red buttons

    // Status Indicators (Critical for Blood Bank)
    status: {
      safe: "#10B981",    // Green (Safe Stock, Eligible)
      safeBg: "#D1FAE5",  // Light Green Background
      
      warning: "#F59E0B", // Orange (Low Stock, Deferred)
      warningBg: "#FEF3C7",

      critical: "#EF4444", // Red (Empty Stock, Discarded)
      criticalBg: "#FEE2E2",

      info: "#3B82F6",    // Blue (In Transit, Processing)
      infoBg: "#DBEAFE",
    },

    // Borders
    border: "#E5E7EB",
  },

  fonts: {
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    heading: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },

  shadows: {
    card: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
    hover: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    modal: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
  },

  borderRadius: {
    sm: "0.375rem", // 6px
    md: "0.5rem",   // 8px (Standard for cards)
    lg: "1rem",     // 16px (Modals)
    full: "9999px", // Rounded badges
  }
};