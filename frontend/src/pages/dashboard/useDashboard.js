import { useState, useEffect } from 'react';
import apiService from '../../services/api';

const useDashboard = () => {
    const [user, setUser] = useState(null);
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalLeaveRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        totalDepartments: 0,
        thisMonthRequests: 0
    });
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Lấy thông tin user từ localStorage hoặc API
    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
    }, []);

    // Lấy dashboard data từ API
    const fetchDashboardData = async () => {
        setLoading(true);
        setError('');

        try {
            // Gọi API để lấy stats và activities song song
            const [statsResponse, activitiesResponse] = await Promise.all([
                apiService.getDashboardStats().catch(() => ({ success: false, error: 'Stats API error' })),
                apiService.getRecentActivities().catch(() => ({ success: false, error: 'Activities API error' }))
            ]);

            if (statsResponse.success) {
                setStats({
                    totalUsers: statsResponse.data.totalUsers || 0,
                    totalLeaveRequests: statsResponse.data.totalLeaveRequests || 0,
                    pendingRequests: statsResponse.data.pendingRequests || 0,
                    approvedRequests: statsResponse.data.approvedRequests || 0,
                    totalDepartments: statsResponse.data.totalDepartments || 0,
                    thisMonthRequests: statsResponse.data.thisMonthRequests || 0
                });
            } else {
                // Fallback với mock data khi API không khả dụng
                console.warn('API không khả dụng, sử dụng mock data');
                setStats({
                    totalUsers: 25,
                    totalLeaveRequests: 48,
                    pendingRequests: 12,
                    approvedRequests: 28,
                    totalDepartments: 5,
                    thisMonthRequests: 8
                });
            }

            if (activitiesResponse.success) {
                setActivities(activitiesResponse.data || []);
            } else {
                setActivities([]);
            }

        } catch (err) {
            console.error('Error fetching dashboard data:', err);
            
            // Xử lý lỗi theo loại
            if (err.status === 401) {
                setError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
                apiService.clearAuthData();
            } else {
                setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu dashboard');
                // Sử dụng dữ liệu mặc định
                setStats({
                    totalUsers: 0,
                    totalLeaveRequests: 0,
                    pendingRequests: 0,
                    approvedRequests: 0,
                    totalDepartments: 0,
                    thisMonthRequests: 0
                });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const refreshData = () => {
        fetchDashboardData();
    };

    return {
        user,
        stats,
        activities,
        loading,
        error,
        refreshData
    };
};

export default useDashboard;
