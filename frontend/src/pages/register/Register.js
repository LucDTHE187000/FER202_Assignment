import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import useRegister from './useRegister';
import RegisterForm from './components/RegisterForm';


const Register = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useUser();
    const {
        registerData,
        loading,
        error,
        success,
        departments,
        departmentsLoading,
        handleInputChange,
        register,
        loadDepartments,
        reset
    } = useRegister();

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleRegister = async () => {
        const result = await register();
        
        if (result.success) {
            // Registration successful - RegisterForm will show success message
            console.log('Registration successful:', result.user);
        }
        // Error handling is done in useRegister hook
    };

    // If user is authenticated, show loading or redirect
    if (isAuthenticated && user) {
        return <div>Redirecting to dashboard...</div>;
    }

    return (
        <div className="register-page">
            <div className="register-container">
                <div className="register-header">
                    <h1>Đăng Ký Tài Khoản</h1>
                    <p>Tạo tài khoản mới để truy cập hệ thống</p>
                </div>
                
                <RegisterForm
                    registerData={registerData}
                    loading={loading}
                    error={error}
                    success={success}
                    departments={departments}
                    departmentsLoading={departmentsLoading}
                    onInputChange={handleInputChange}
                    onSubmit={handleRegister}
                    onLoadDepartments={loadDepartments}
                />
                
            </div>
        </div>
    );
};

export default Register;
