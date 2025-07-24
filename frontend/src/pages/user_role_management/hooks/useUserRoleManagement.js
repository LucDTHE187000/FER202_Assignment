import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/api';
import useUserRolePermissions from './useUserRolePermissions';

const useUserRoleManagement = () => {
    const [users, setUsers] = useState([]);
    const [availableRoles, setAvailableRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingUserIds, setProcessingUserIds] = useState(new Set());

    const { 
        canManageUserRoles, 
        isDirector, 
        user: currentUser 
    } = useUserRolePermissions();

    // Lấy danh sách users với roles
    const fetchUsers = useCallback(async () => {
        if (!canManageUserRoles) return;

        try {
            setLoading(true);
            setError('');
            
            console.log('Fetching users with roles...');
            const response = await apiService.getUsersWithRoles();
            
            if (response.success) {
                // Lọc ra user hiện tại (Director không thể tự quản lý mình)
                const filteredUsers = response.data.filter(user => 
                    user.UserID !== currentUser?.UserID
                );
                setUsers(filteredUsers);
                console.log(`Loaded ${filteredUsers.length} users (excluding current user)`);
            } else {
                throw new Error(response.message || 'Không thể tải danh sách người dùng');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            setError(error.message || 'Có lỗi xảy ra khi tải danh sách người dùng');
        } finally {
            setLoading(false);
        }
    }, [canManageUserRoles, currentUser?.UserID]);

    // Lấy danh sách roles có sẵn
    const fetchAvailableRoles = useCallback(async () => {
        try {
            console.log('Fetching available roles...');
            const response = await apiService.getAvailableRoles();
            
            if (response.success) {
                setAvailableRoles(response.data);
                console.log(`Loaded ${response.data.length} available roles`);
            } else {
                throw new Error(response.message || 'Không thể tải danh sách vai trò');
            }
        } catch (error) {
            console.error('Error fetching roles:', error);
            // Không cần set error cho việc tải roles vì không critical
        }
    }, []);

    // Gán role cho user
    const assignRole = async (userId, roleId) => {
        try {
            setProcessingUserIds(prev => new Set([...prev, userId]));
            
            console.log(`Assigning role ${roleId} to user ${userId}`);
            const response = await apiService.assignUserRole(userId, roleId);
            
            if (response.success) {
                // Refresh danh sách users
                await fetchUsers();
                return { success: true };
            } else {
                throw new Error(response.message || 'Không thể gán vai trò');
            }
        } catch (error) {
            console.error('Error assigning role:', error);
            return { 
                success: false, 
                message: error.message || 'Có lỗi xảy ra khi gán vai trò' 
            };
        } finally {
            setProcessingUserIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Xóa role của user
    const removeRole = async (userId, roleId) => {
        try {
            setProcessingUserIds(prev => new Set([...prev, userId]));
            
            console.log(`Removing role ${roleId} from user ${userId}`);
            const response = await apiService.removeUserRole(userId, roleId);
            
            if (response.success) {
                // Refresh danh sách users
                await fetchUsers();
                return { success: true };
            } else {
                throw new Error(response.message || 'Không thể xóa vai trò');
            }
        } catch (error) {
            console.error('Error removing role:', error);
            return { 
                success: false, 
                message: error.message || 'Có lỗi xảy ra khi xóa vai trò' 
            };
        } finally {
            setProcessingUserIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
        }
    };

    // Load data khi component mount
    useEffect(() => {
        if (canManageUserRoles) {
            fetchUsers();
            fetchAvailableRoles();
        }
    }, [fetchUsers, fetchAvailableRoles, canManageUserRoles]);

    // Refresh function
    const refresh = () => {
        if (canManageUserRoles) {
            fetchUsers();
            fetchAvailableRoles();
        }
    };

    return {
        users,
        availableRoles,
        loading,
        error,
        processingUserIds,
        canManageUserRoles,
        isDirector,
        currentUserId: currentUser?.UserID,
        assignRole,
        removeRole,
        refresh
    };
};

export default useUserRoleManagement;
