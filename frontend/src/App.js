import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './UI_components/ErrorBoundary';
import Navbar from './UI_components/navbar/Navbar';
import Footer from './UI_components/footer/Footer';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Dashboard from './pages/dashboard/Dashboard';
import LeaveRequest from './pages/create_leave_request/CreateLeaveRequest';
import './App.css';

function App() {
  return (
    <UserProvider>
      <ErrorBoundary>
        <Router>
          <div className="App">
            <ErrorBoundary>
              <Navbar />
            </ErrorBoundary>
            <main className="main-content">
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/leave-request-create" element={<LeaveRequest />} />
                <Route path="/my-leave-request" element={<MyLeaveRequest />} />
                <Route path="/" element={<Navigate to="/login" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </ErrorBoundary>
    </UserProvider>
  );
}

export default App;
