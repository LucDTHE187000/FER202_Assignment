import { useState, useCallback } from 'react';

const useRegister = () => {
    const [registerData, setRegisterData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        departmentId: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [departments, setDepartments] = useState([]);
    const [departmentsLoading, setDepartmentsLoading] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    };

    const validateForm = () => {
        // Validate required fields
        if (!registerData.username.trim()) {
            setError('Tên đăng nhập là bắt buộc');
            return false;
        }
        
        if (!registerData.password.trim()) {
            setError('Mật khẩu là bắt buộc');
            return false;
        }
        
        if (!registerData.confirmPassword.trim()) {
            setError('Xác nhận mật khẩu là bắt buộc');
            return false;
        }
        
        if (!registerData.fullName.trim()) {
            setError('Họ và tên là bắt buộc');
            return false;
        }
        
        if (!registerData.departmentId) {
            setError('Phòng ban là bắt buộc');
            return false;
        }

        // Validate username length
        if (registerData.username.length < 3) {
            setError('Tên đăng nhập phải có ít nhất 3 ký tự');
            return false;
        }

        // Validate password length
        if (registerData.password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return false;
        }

        // Validate password match
        if (registerData.password !== registerData.confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return false;
        }

        // Validate full name length
        if (registerData.fullName.length < 2) {
            setError('Họ và tên phải có ít nhất 2 ký tự');
            return false;
        }

        return true;
    };

    const register = async () => {
        if (!validateForm()) {
            return { success: false };
        }

        setLoading(true);
        setError('');

        try {
            const apiService = (await import('../../services/api')).default;
            const response = await apiService.register(registerData);
            
            if (response.success) {
                setSuccess(true);
                return { 
                    success: true, 
                    user: response.data.user,
                    message: response.message 
                };
            } else {
                setError(response.error || 'Đăng ký thất bại');
                return { success: false };
            }
        } catch (error) {
            console.error('Register error:', error);
            const errorMessage = error.response?.data?.error || error.message || 'Đăng ký thất bại';
            setError(errorMessage);
            return { success: false };
        } finally {
            setLoading(false);
        }
    };

    const loadDepartments = useCallback(async () => {
        setDepartmentsLoading(true);
        try {
            const apiService = (await import('../../services/api')).default;
            const response = await apiService.getDepartments();
            
            if (response.success) {
                setDepartments(response.data);
            } else {
                setError('Không thể tải danh sách phòng ban');
            }
        } catch (error) {
            console.error('Load departments error:', error);
            setError('Không thể tải danh sách phòng ban');
        } finally {
            setDepartmentsLoading(false);
        }
    }, []);

    const reset = () => {
        setRegisterData({
            username: '',
            password: '',
            confirmPassword: '',
            fullName: '',
            departmentId: ''
        });
        setLoading(false);
        setError('');
        setSuccess(false);
    };

    return {
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
    };
};

export default useRegister;
