import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider } from './contexts/UserContext';
import ErrorBoundary from './UI_components/ErrorBoundary';
import Navbar from './UI_components/navbar/Navbar';
import Footer from './UI_components/footer/Footer';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import About from './pages/about/About';
import LeaveRequest from './pages/create_leave_request/CreateLeaveRequest';
import MyLeaveRequest from './pages/my_leave_request/MyLeaveRequest';
import ManageLeaveRequest from './pages/manage_leave_request/ManageLeaveRequest';
import UserRoleManagement from './pages/user_role_management/UserRoleManagement';
import LeaveRequestReport from './pages/leave_request_report/LeaveRequestReport';
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
                <Route path="/about" element={<About />} />
                <Route path="/leave-request-create" element={<LeaveRequest />} />
                <Route path="/my-leave-request" element={<MyLeaveRequest />} />
                <Route path="/leave-manage" element={<ManageLeaveRequest />} />
                <Route path="/user-role-management" element={<UserRoleManagement />} />
                <Route path="/leave-report" element={<LeaveRequestReport />} />
                <Route path="/" element={<Navigate to="/about" replace />} />
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
