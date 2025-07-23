import { useState, useCallback } from 'react';
import apiService from '../../services/api';

const useLeaveRequest = () => {
    const [leaveRequestData, setLeaveRequestData] = useState({
        fromDate: '',
        toDate: '',
        reason: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setLeaveRequestData(prev => ({
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
        if (!leaveRequestData.fromDate.trim()) {
            return 'Ngày bắt đầu không được để trống';
        }
        
        if (!leaveRequestData.toDate.trim()) {
            return 'Ngày kết thúc không được để trống';
        }
        
        if (!leaveRequestData.reason.trim()) {
            return 'Lý do nghỉ phép không được để trống';
        }

        // Validate date range
        const fromDate = new Date(leaveRequestData.fromDate);
        const toDate = new Date(leaveRequestData.toDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (fromDate < today) {
            return 'Ngày bắt đầu không thể là ngày trong quá khứ';
        }

        if (toDate < fromDate) {
            return 'Ngày kết thúc phải sau ngày bắt đầu';
        }

        if (leaveRequestData.reason.length < 10) {
            return 'Lý do nghỉ phép phải có ít nhất 10 ký tự';
        }

        return null;
    };

    const createLeaveRequest = async () => {
        try {
            setLoading(true);
            setError('');

            // Validate form
            const validationError = validateForm();
            if (validationError) {
                setError(validationError);
                return;
            }

            // Get current user from localStorage
            const userStr = localStorage.getItem('user');
            if (!userStr) {
                setError('Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.');
                return;
            }

            const user = JSON.parse(userStr);
            if (!user.UserID) {
                setError('Không tìm thấy ID người dùng. Vui lòng đăng nhập lại.');
                return;
            }

            // Prepare request data
            const requestData = {
                UserID: user.UserID,
                FromDate: leaveRequestData.fromDate,
                ToDate: leaveRequestData.toDate,
                Reason: leaveRequestData.reason.trim(),
                StatusID: 3, // Pending status
                // ApprovedBy sẽ được để null cho đến khi được duyệt
            };

            console.log('Creating leave request with data:', requestData);

            // Call API to create leave request
            const response = await apiService.createLeaveRequest(requestData);
            
            console.log('Leave request created successfully:', response);
            setSuccess(true);

        } catch (err) {
            console.error('Error creating leave request:', err);
            
            if (err.response?.data?.error) {
                const errorMsg = err.response.data.error;
                const errorDetails = err.response.data.details;
                
                if (errorDetails) {
                    setError(`${errorMsg}: ${errorDetails}`);
                } else {
                    setError(errorMsg);
                }
            } else if (err.message) {
                setError(err.message);
            } else {
                setError('Có lỗi xảy ra khi tạo đơn xin nghỉ phép. Vui lòng thử lại.');
            }
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setLeaveRequestData({
            fromDate: '',
            toDate: '',
            reason: ''
        });
        setLoading(false);
        setError('');
        setSuccess(false);
    };

    return {
        leaveRequestData,
        loading,
        error,
        success,
        handleInputChange,
        createLeaveRequest,
        reset
    };
};

export default useLeaveRequest;
