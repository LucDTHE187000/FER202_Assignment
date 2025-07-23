import { useState, useEffect, useCallback } from 'react';
import { useUser } from '../../contexts/UserContext';
import apiService from '../../services/api';

const useMyLeaveRequest = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({
        FromDate: '',
        ToDate: '',
        Reason: '',
        StatusID: 3
    });
    const [editLoading, setEditLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const { user } = useUser();

    // Load user's leave requests
    const loadRequests = useCallback(async () => {
        if (!user?.UserID) return;
        
        setLoading(true);
        setError('');
        
        try {
            // Sử dụng route mới với userId của user đang đăng nhập
            const response = await apiService.getLeaveRequestsByUserId(user.UserID);
            if (response.success) {
                setRequests(response.data || []);
            } else {
                setError(response.error || 'Không thể tải danh sách đơn nghỉ phép');
            }
        } catch (err) {
            console.error('Error loading leave requests:', err);
            setError('Đã xảy ra lỗi khi tải danh sách đơn nghỉ phép');
        } finally {
            setLoading(false);
        }
    }, [user?.UserID]);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    // Start editing a request
    const startEdit = useCallback((request) => {
        // Only allow editing if status is not approved (StatusID !== 2)
        if (request.StatusID === 2 || request.StatusID === 1) {
            setError('Không thể chỉnh sửa đơn đã được duyệt');
            return;
        }

        setEditing(request.RequestID);
        setEditForm({
            FromDate: request.FromDate ? new Date(request.FromDate).toISOString().split('T')[0] : '',
            ToDate: request.ToDate ? new Date(request.ToDate).toISOString().split('T')[0] : '',
            Reason: request.Reason || '',
            StatusID: request.StatusID
        });
        setError('');
    }, []);

    // Cancel editing
    const cancelEdit = useCallback(() => {
        setEditing(null);
        setEditForm({
            FromDate: '',
            ToDate: '',
            Reason: '',
            StatusID: 3
        });
        setError('');
    }, []);

    // Handle form input change
    const handleEditChange = useCallback((e) => {
        const { name, value } = e.target;
        setEditForm(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when user starts typing
        if (error) {
            setError('');
        }
    }, [error]);

    // Validate edit form
    const validateEditForm = useCallback(() => {
        if (!editForm.FromDate.trim()) {
            setError('Vui lòng chọn ngày bắt đầu');
            return false;
        }
        
        if (!editForm.ToDate.trim()) {
            setError('Vui lòng chọn ngày kết thúc');
            return false;
        }
        
        if (!editForm.Reason.trim()) {
            setError('Vui lòng nhập lý do nghỉ phép');
            return false;
        }

        const fromDate = new Date(editForm.FromDate);
        const toDate = new Date(editForm.ToDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if dates are in the past
        if (fromDate < today) {
            setError('Ngày bắt đầu không thể là ngày trong quá khứ');
            return false;
        }

        if (toDate < today) {
            setError('Ngày kết thúc không thể là ngày trong quá khứ');
            return false;
        }

        if (fromDate > toDate) {
            setError('Ngày bắt đầu không thể sau ngày kết thúc');
            return false;
        }

        return true;
    }, [editForm]);

    // Update leave request
    const updateRequest = useCallback(async () => {
        if (!validateEditForm()) return;
        
        setEditLoading(true);
        setError('');
        
        try {
            const updateData = {
                UserID: user.UserID,
                FromDate: editForm.FromDate,
                ToDate: editForm.ToDate,
                Reason: editForm.Reason,
                StatusID: editForm.StatusID
            };

            const response = await apiService.updateLeaveRequest(editing, updateData);
            
            if (response.success) {
                // Update the request in the list
                setRequests(prev => prev.map(req => 
                    req.RequestID === editing ? response.data : req
                ));
                
                cancelEdit();
                // Show success message briefly
                setError('');
            } else {
                setError(response.error || response.details || 'Không thể cập nhật đơn nghỉ phép');
            }
        } catch (err) {
            console.error('Error updating leave request:', err);
            setError('Đã xảy ra lỗi khi cập nhật đơn nghỉ phép');
        } finally {
            setEditLoading(false);
        }
    }, [editing, editForm, user.UserID, validateEditForm, cancelEdit]);

    // Delete leave request
    const deleteRequest = useCallback(async (requestId) => {
        const request = requests.find(r => r.RequestID === requestId);
        
        // Only allow deleting if status is not approved (StatusID !== 2)
        if (request?.StatusID === 2) {
            setError('Không thể xóa đơn đã được duyệt');
            return;
        }

        const confirmDelete = window.confirm('Bạn có chắc muốn xóa đơn nghỉ phép này?');
        if (!confirmDelete) return;
        
        setDeleteLoading(true);
        setError('');
        
        try {
            const response = await apiService.deleteLeaveRequest(requestId);
            
            if (response.success) {
                setRequests(prev => prev.filter(req => req.RequestID !== requestId));
            } else {
                setError(response.error || 'Không thể xóa đơn nghỉ phép');
            }
        } catch (err) {
            console.error('Error deleting leave request:', err);
            setError('Đã xảy ra lỗi khi xóa đơn nghỉ phép');
        } finally {
            setDeleteLoading(false);
        }
    }, [requests]);

    // Refresh data
    const refreshData = useCallback(() => {
        loadRequests();
    }, [loadRequests]);

    return {
        // Data
        requests,
        loading,
        error,
        
        // Edit state
        editing,
        editForm,
        editLoading,
        deleteLoading,
        
        // Actions
        startEdit,
        cancelEdit,
        handleEditChange,
        updateRequest,
        deleteRequest,
        refreshData,
        
        // Clear error
        clearError: () => setError('')
    };
};

export default useMyLeaveRequest;
