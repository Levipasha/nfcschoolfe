import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentProfile from './pages/StudentProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SchoolManagement from './pages/SchoolManagement';
import SchoolDetails from './pages/SchoolDetails';
import './index.css';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public Route - Student Profile */}
                <Route path="/student" element={<StudentProfile />} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/schools" element={<SchoolManagement />} />
                <Route path="/admin/schools/:id" element={<SchoolDetails />} />

                {/* Default Route */}
                <Route path="/" element={<Navigate to="/admin/login" replace />} />

                {/* 404 Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
