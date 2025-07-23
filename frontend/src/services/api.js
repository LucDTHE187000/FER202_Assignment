import axios from 'axios';

// Cấu hình base URL cho API
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Tạo axios instance với cấu hình mặc định
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor để thêm token vào header (nếu có)
apiClient.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor để xử lý response và lỗi
apiClient.interceptors.response.use(
    (response) => {
        return response.data;
    },
    (error) => {
        // Xử lý lỗi chung
        if (error.response) {
            // Server trả về lỗi
            const { status, data } = error.response;
            
            if (status === 401) {
                // Token hết hạn hoặc không hợp lệ
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
            }
            
            return Promise.reject({
                status,
                message: data.message || data.error || 'Có lỗi xảy ra',
                data: data
            });
        } else if (error.request) {
            // Không thể kết nối đến server
            return Promise.reject({
                status: 0,
                message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
                data: null
            });
        } else {
            // Lỗi khác
            return Promise.reject({
                status: 0,
                message: 'Có lỗi không xác định xảy ra',
                data: null
            });
        }
    }
);

// API Service class
class ApiService {
    // Auth APIs
    async login(credentials) {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            
            // Lưu token và user info vào localStorage
            if (response.success && response.data) {
                const { token, user } = response.data;
                if (token) {
                    localStorage.setItem('token', token);
                }
                if (user) {
                    localStorage.setItem('user', JSON.stringify(user));
                }
            }
            
            return response;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            // Ngay cả khi API logout lỗi, vẫn xóa token local
            console.warn('Logout API error:', error);
        } finally {
            // Luôn xóa token và user info khỏi localStorage
            this.clearAuthData();
        }
    }

    async refreshToken() {
        try {
            const response = await apiClient.post('/auth/refresh');
            if (response.success && response.data.token) {
                localStorage.setItem('token', response.data.token);
            }
            return response;
        } catch (error) {
            throw error;
        }
    }

    // User APIs
    async getCurrentUser() {
        try {
            return await apiClient.get('/auth/me');
        } catch (error) {
            throw error;
        }
    }

    async getAllUsers() {
        try {
            return await apiClient.get('/users');
        } catch (error) {
            throw error;
        }
    }

    async getUserById(id) {
        try {
            return await apiClient.get(`/users/${id}`);
        } catch (error) {
            throw error;
        }
    }

    async createUser(userData) {
        try {
            return await apiClient.post('/users', userData);
        } catch (error) {
            throw error;
        }
    }

    async updateUser(id, userData) {
        try {
            return await apiClient.put(`/users/${id}`, userData);
        } catch (error) {
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            return await apiClient.delete(`/users/${id}`);
        } catch (error) {
            throw error;
        }
    }

    // Leave Request APIs
    async getAllLeaveRequests() {
        try {
            return await apiClient.get('/leave');
        } catch (error) {
            throw error;
        }
    }

    async getLeaveRequestsByUserId(userId) {
        try {
            console.log('Calling endpoint:', `/leave/user/${userId}`);
            return await apiClient.get(`/leave/user/${userId}`);
        } catch (error) {
            throw error;
        }
    }

    async getLeaveRequestById(id) {
        try {
            return await apiClient.get(`/leave/${id}`);
        } catch (error) {
            throw error;
        }
    }

    async createLeaveRequest(requestData) {
        try {
            return await apiClient.post('/leave', requestData);
        } catch (error) {
            throw error;
        }
    }

    async updateLeaveRequest(id, requestData) {
        try {
            return await apiClient.put(`/leave/${id}`, requestData);
        } catch (error) {
            throw error;
        }
    }

    async deleteLeaveRequest(id) {
        try {
            return await apiClient.delete(`/leave/${id}`);
        } catch (error) {
            throw error;
        }
    }

    async getLeaveRequestsByUser(userId) {
        try {
            return await apiClient.get(`/leave/user/${userId}`);
        } catch (error) {
            throw error;
        }
    }

    async approveLeaveRequest(id, approvedBy) {
        try {
            return await apiClient.put(`/leave/${id}/approve`, { approvedBy });
        } catch (error) {
            throw error;
        }
    }

    async rejectLeaveRequest(id, rejectedBy) {
        try {
            return await apiClient.put(`/leave/${id}/reject`, { rejectedBy });
        } catch (error) {
            throw error;
        }
    }

    // Department APIs
    async getAllDepartments() {
        try {
            return await apiClient.get('/departments');
        } catch (error) {
            throw error;
        }
    }

    async getDepartmentById(id) {
        try {
            return await apiClient.get(`/departments/${id}`);
        } catch (error) {
            throw error;
        }
    }

    // Add getDepartments method alias for consistency
    async getDepartments() {
        return await this.getAllDepartments();
    }

    // Registration API
    async register(userData) {
        try {
            return await apiClient.post('/auth/register', userData);
        } catch (error) {
            throw error;
        }
    }

    // Dashboard APIs
    async getDashboardStats() {
        try {
            return await apiClient.get('/dashboard/stats');
        } catch (error) {
            throw error;
        }
    }

    async getRecentActivities() {
        try {
            return await apiClient.get('/dashboard/activities');
        } catch (error) {
            throw error;
        }
    }

    async getUserStats(userId) {
        try {
            return await apiClient.get(`/dashboard/user-stats/${userId}`);
        } catch (error) {
            throw error;
        }
    }

    // Utility methods
    isAuthenticated() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');
        return !!(token && user);
    }

    getAuthToken() {
        return localStorage.getItem('token');
    }

    getCurrentUserFromStorage() {
        try {
            const userStr = localStorage.getItem('user');
            if (!userStr || userStr === 'undefined' || userStr === 'null') {
                return null;
            }
            return JSON.parse(userStr);
        } catch (error) {
            console.error('Error parsing user data from storage:', error);
            // Xóa dữ liệu bị lỗi
            localStorage.removeItem('user');
            return null;
        }
    }

    clearAuthData() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

// Export instance của ApiService
const apiService = new ApiService();
export default apiService;
