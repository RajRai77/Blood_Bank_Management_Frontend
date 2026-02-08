import { Outlet } from "react-router-dom";
import Sidebar from "./sidebar";
import { theme } from "../../styles/theme";
import React from "react"; // <--- THIS WAS MISSING

const Layout = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: theme.colors.background }}>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Scrollable Content Area */}
      <div style={{ 
        flex: 1, 
        marginLeft: "260px", // Same width as sidebar
        padding: "32px",
        overflowY: "auto" // Allows content to scroll while sidebar stays
      }}>
        {/* <Outlet /> renders the specific page based on the URL */}
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;