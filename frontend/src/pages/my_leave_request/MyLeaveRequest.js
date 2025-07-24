import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../contexts/UserContext";
import useMyLeaveRequest from "./useMyLeaveRequest";
import MyLeaveRequestTable from "./components/MyLeaveRequestTable";
import EditModal from "./components/EditModal";
import './MyLeaveRequest.css';

const MyLeaveRequest = () => {
    const navigate = useNavigate();
    const { isAuthenticated, user } = useUser();
    
    const {
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
        clearError
    } = useMyLeaveRequest();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated || !user) {
            navigate('/login');
        }
    }, [isAuthenticated, user, navigate]);

    // If user is not authenticated, show loading or redirect
    if (!isAuthenticated || !user) {
        return (
            <div className="my-leave-request">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="my-leave-request">
            <div className="my-leave-request-container">
                <div className="my-leave-request-header">
                    <h1>Đơn Nghỉ Phép Của Tôi</h1>
                    <p>Quản lý và theo dõi các đơn nghỉ phép của bạn</p>
                </div>

                <div className="requests-table-container">
                    {error && (
                        <div className="error-message">
                            {error}
                            <button 
                                className="btn btn-cancel"
                                onClick={clearError}
                                style={{marginLeft: '10px'}}
                            >
                                Đóng
                            </button>
                        </div>
                    )}

                    <MyLeaveRequestTable
                        requests={requests}
                        loading={loading}
                        editing={editing}
                        editForm={editForm}
                        editLoading={editLoading}
                        deleteLoading={deleteLoading}
                        onStartEdit={startEdit}
                        onCancelEdit={cancelEdit}
                        onEditChange={handleEditChange}
                        onUpdateRequest={updateRequest}
                        onDeleteRequest={deleteRequest}
                    />
                </div>

                <EditModal
                    editing={editing}
                    editForm={editForm}
                    editLoading={editLoading}
                    error={error}
                    onEditChange={handleEditChange}
                    onUpdateRequest={updateRequest}
                    onCancelEdit={cancelEdit}
                />
            </div>
        </div>
    );
};

export default MyLeaveRequest;
