import React from "react"; // <--- THIS WAS MISSING
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Layout
// Make sure this matches your filename exactly (Capital 'L')
import Layout from "./components/layout/Layout"; 
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";

// Placeholder Pages

const Inventory = () => <h1>Inventory List</h1>;
const Lab = () => <h1>Lab Console</h1>;

// Auth Guard
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("accessToken");
  return token ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/lab" element={<Lab />} />
        </Route>

        {/* 404 Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;