import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../contexts/UserContext';
import LeaveRequestForm from './components/LeaveRequestForm';
import useLeaveRequest from './useLeaveRequest';
import './CreateLeaveRequest.css';

const CreateLeaveRequest = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useUser();
    const {
        leaveRequestData,
        loading,
        error,
        success,
        handleInputChange,
        createLeaveRequest,
        reset
    } = useLeaveRequest();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    const handleCreateLeaveRequest = async () => {
        await createLeaveRequest();
    };

    // If user is not authenticated, show loading or redirect
    if (!isAuthenticated || !user) {
        return (
            <div className="loading-overlay">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    return (
        <div className="create-leave-request">
            <div className="create-leave-request-container">
                <LeaveRequestForm
                    leaveRequestData={leaveRequestData}
                    loading={loading}
                    error={error}
                    success={success}
                    onInputChange={handleInputChange}
                    onSubmit={handleCreateLeaveRequest}
                    onReset={reset}
                />
            </div>
        </div>
    );
};

export default CreateLeaveRequest;