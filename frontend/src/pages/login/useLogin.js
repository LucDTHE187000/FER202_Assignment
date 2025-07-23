import { useState } from 'react';
import apiService from '../../services/api';

const useLogin = () => {
    const [loginData, setLoginData] = useState({
        username: '',
        password: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

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
            setError('Vui lòng nhập tên đăng nhập');
            return false;
        }
        if (!loginData.password.trim()) {
            setError('Vui lòng nhập mật khẩu');
            return false;
        }
        if (loginData.username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự');
            return false;
        }
        return true;
    };

    const login = async () => {
        if (!validateForm()) return false;

        setLoading(true);
        setError('');

        try {
            // Gọi API login thực tế thay vì mock data
            const response = await apiService.login({
                username: loginData.username,
                password: loginData.password
            });

            if (response.success) {
                setSuccess(true);
                return true;
            } else {
                setError(response.error || 'Đăng nhập thất bại');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            // Xử lý các loại lỗi khác nhau
            if (error.status === 401) {
                setError('Tên đăng nhập hoặc mật khẩu không chính xác');
            } else if (error.status === 0) {
                setError('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                setError(error.message || 'Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
            }
            return false;
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setLoginData({
            username: '',
            password: ''
        });
        setError('');
        setSuccess(false);
        setLoading(false);
    };

    return {
        loginData,
        loading,
        error,
        success,
        handleInputChange,
        login,
        reset
    };
};

export default useLogin;
