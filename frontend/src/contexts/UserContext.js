import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Tạo User Context
const UserContext = createContext();

// Custom hook để sử dụng User Context
export const useUser = () => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};

// User Provider Component
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Khôi phục thông tin user từ localStorage khi khởi động
    useEffect(() => {
        const initializeUser = () => {
            try {
                const token = localStorage.getItem('token');
                const userData = apiService.getCurrentUserFromStorage();
                
                if (token && userData) {
                    setUser(userData);
                    setIsAuthenticated(true);
                } else {
                    setUser(null);
                    setIsAuthenticated(false);
                }
            } catch (error) {
                console.error('Error initializing user:', error);
                setUser(null);
                setIsAuthenticated(false);
                // Xóa dữ liệu bị lỗi
                apiService.clearAuthData();
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, []);

    // Hàm login
    const login = async (credentials) => {
        try {
            setLoading(true);
            const response = await apiService.login(credentials);
            
            if (response && response.success) {
                const userData = apiService.getCurrentUserFromStorage();
                setUser(userData);
                setIsAuthenticated(true);
                return { success: true, user: userData };
            } else {
                throw new Error('Login failed');
            }
        } catch (error) {
            setUser(null);
            setIsAuthenticated(false);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Hàm logout
    const logout = async () => {
        try {
            setLoading(true);
            await apiService.logout();
            setUser(null);
            setIsAuthenticated(false);
            return { success: true, message: 'Đăng xuất thành công' };
        } catch (error) {
            // Vẫn clear local state ngay cả khi API lỗi
            setUser(null);
            setIsAuthenticated(false);
            apiService.clearAuthData();
            console.error('Logout error:', error);
            return { success: true, message: 'Đăng xuất thành công' };
        } finally {
            setLoading(false);
        }
    };

    // Hàm cập nhật thông tin user
    const updateUser = (newUserData) => {
        setUser(newUserData);
        localStorage.setItem('user', JSON.stringify(newUserData));
    };

    // Hàm refresh user data
    const refreshUser = async () => {
        try {
            setLoading(true);
            const userData = await apiService.getCurrentUser();
            if (userData) {
                setUser(userData);
                updateUser(userData);
            }
        } catch (error) {
            console.error('Error refreshing user:', error);
            // Nếu token hết hạn, logout user
            if (error.status === 401) {
                await logout();
            }
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        refreshUser
    };

    return (
        <UserContext.Provider value={value}>
            {children}
        </UserContext.Provider>
    );
};

export default UserContext;
