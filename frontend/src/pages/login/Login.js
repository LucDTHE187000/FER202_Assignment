import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import LoginForm from './components/LoginForm';

const Login = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated, login: userLogin } = useUser();
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Redirect if already logged in
    useEffect(() => {
        if (isAuthenticated && user) {
            navigate('/dashboard');
        }
    }, [isAuthenticated, user, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (error) setError('');
    };

    const validateForm = () => {
        if (!loginData.username.trim()) {
            setError('Tên đăng nhập không được để trống');
            return false;
        }
        if (!loginData.password.trim()) {
            setError('Mật khẩu không được để trống');
            return false;
        }
        if (loginData.username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự');
            return false;
        }
        return true;
    };

    const handleLogin = async () => {
        if (!validateForm()) return;

        setLoading(true);
        setError('');

        try {
            const result = await userLogin({
                username: loginData.username,
                password: loginData.password
            });

            if (result && result.success) {
                console.log('Login successful');
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <LoginForm
            loginData={loginData}
            loading={loading}
            error={error}
            onInputChange={handleInputChange}
            onSubmit={handleLogin}
        />
    );
};

export default Login;
