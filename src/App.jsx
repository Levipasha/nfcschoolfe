import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import StudentProfile from './pages/StudentProfile';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import SchoolManagement from './pages/SchoolManagement';
import SchoolDetails from './pages/SchoolDetails';
import ArtistLogin from './pages/ArtistLogin';
import ArtistDashboard from './pages/ArtistDashboard';
import ArtistProfile from './pages/ArtistProfile';
import ProfileView from './pages/ProfileView';
import './index.css';

function App() {
    return (
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <Routes>
                {/* Public Route - Secure Unified Profile */}
                <Route path="/p/:token" element={<ProfileView />} />

                {/* Public Route - Student Profile (Legacy/Direct) */}
                <Route path="/student" element={<StudentProfile />} />

                {/* Artist Routes */}
                <Route path="/artist" element={<ArtistProfile />} />
                <Route path="/artist/:token" element={<ArtistProfile />} />
                <Route path="/artist/login" element={<ArtistLogin />} />
                <Route path="/artist/dashboard" element={<ArtistDashboard />} />

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
