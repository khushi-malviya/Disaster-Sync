import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected dashboard route for all logged-in users */}
          <Route element={<ProtectedRoute roles={["admin", "volunteer", "public"]} />}>
            <Route path="/" element={<Dashboard />} />
          </Route>
          
          {/* Admin-only routes */}
          <Route element={<ProtectedRoute roles={["admin"]} />}>
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>
          
          {/* Volunteer-only routes (coming soon) */}
          {/* <Route element={<ProtectedRoute roles={["volunteer", "admin"]} />}>
            <Route path="/volunteer" element={<VolunteerPortal />} />
          </Route> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
