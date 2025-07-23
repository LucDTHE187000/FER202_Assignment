import { useState, useEffect, useCallback } from 'react';
import apiService from '../../../services/api';
import useManageLeavePermissions from './useManageLeavePermissions';

const useManageLeaveRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [processingIds, setProcessingIds] = useState(new Set());

    const { 
        canManageLeave, 
        isDirector, 
        isDepartmentLeader, 
        userDepartmentId,
        user 
    } = useManageLeavePermissions();

    // Lấy danh sách leave requests
    const fetchLeaveRequests = useCallback(async () => {
        if (!canManageLeave) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError('');

            let response;

            // Nếu là Department Leader (không phải Director), gọi API department-specific
            if (isDepartmentLeader && !isDirector && userDepartmentId) {
                response = await apiService.getLeaveRequestsByDepartment(userDepartmentId);
            } else {
                // Director hoặc role khác: lấy tất cả requests
                response = await apiService.getAllLeaveRequests();
            }
            
            if (response.success && response.data) {
                // Hiển thị tất cả đơn nghỉ phép (không filter theo status)
                setRequests(response.data);
            }
        } catch (err) {
            console.error('Error fetching leave requests:', err);
            setError(err.message || 'Không thể tải danh sách đơn nghỉ phép');
        } finally {
            setLoading(false);
        }
    }, [canManageLeave, isDirector, isDepartmentLeader, userDepartmentId]);

    // Duyệt đơn (approve)
    const approveRequest = async (requestId) => {
        if (!user || processingIds.has(requestId)) return;

        try {
            setProcessingIds(prev => new Set(prev).add(requestId));
            
            const response = await apiService.approveLeaveRequest(requestId, user.UserID);
            
            if (response.success) {
                // Cập nhật danh sách local
                setRequests(prev => prev.filter(req => req.RequestID !== requestId));
                
                // Hiển thị thông báo thành công
                alert('Đã duyệt đơn nghỉ phép thành công!');
            }
        } catch (err) {
            console.error('Error approving request:', err);
            setError(err.message || 'Không thể duyệt đơn nghỉ phép');
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    // Từ chối đơn (reject) 
    const rejectRequest = async (requestId) => {
        if (!user || processingIds.has(requestId)) return;

        try {
            setProcessingIds(prev => new Set(prev).add(requestId));
            
            const response = await apiService.rejectLeaveRequest(requestId, user.UserID);
            
            if (response.success) {
                // Cập nhật danh sách local
                setRequests(prev => prev.filter(req => req.RequestID !== requestId));
                
                // Hiển thị thông báo thành công
                alert('Đã từ chối đơn nghỉ phép!');
            }
        } catch (err) {
            console.error('Error rejecting request:', err);
            setError(err.message || 'Không thể từ chối đơn nghỉ phép');
        } finally {
            setProcessingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(requestId);
                return newSet;
            });
        }
    };

    // Load data khi component mount
    useEffect(() => {
        fetchLeaveRequests();
    }, [fetchLeaveRequests]);

    const refresh = () => {
        fetchLeaveRequests();
    };

    return {
        requests,
        loading,
        error,
        processingIds,
        canManageLeave,
        isDirector,
        isDepartmentLeader,
        currentUserId: user?.UserID,
        approveRequest,
        rejectRequest,
        refresh
    };
};

export default useManageLeaveRequest;
