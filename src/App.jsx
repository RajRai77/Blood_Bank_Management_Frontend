import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layouts & Pages
import Layout from "./components/layout/Layout";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register"; // <--- 1. IMPORT THIS
import Dashboard from "./pages/dashboard/Dashboard";
import Inventory from "./pages/inventory/Inventory";
import DonorList from "./pages/donors/DonorList";
import RequestList from "./pages/requests/RequestList";
import Lab from "./pages/lab/Lab";

// Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
};

// Public Guard (Prevent logged-in users from seeing Login/Register)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? <Navigate to="/" replace /> : children;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      <Routes>
        {/* --- PUBLIC ROUTES --- */}
        <Route 
          path="/login" 
          element={<PublicRoute><Login /></PublicRoute>} 
        />
        
        {/* <--- 2. ADD THIS REGISTER ROUTE --- */}
        <Route 
          path="/register" 
          element={<PublicRoute><Register /></PublicRoute>} 
        />

        {/* --- PROTECTED ROUTES --- */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/donors" element={<DonorList />} />
            <Route path="/requests" element={<RequestList />} />
            <Route path="/lab" element={<Lab />} />
        </Route>

        {/* Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;