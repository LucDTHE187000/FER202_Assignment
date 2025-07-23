import React from 'react';
import { Link } from 'react-router-dom';
import './LeaveRequestForm.css';

const LeaveRequestForm = ({ 
    leaveRequestData, 
    loading, 
    error, 
    success,
    onInputChange, 
    onSubmit,
    onReset
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    if (success) {
        return (
            <div className="leave-request-form-container">
                <div className="leave-request-form-card">
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h2>Đơn xin nghỉ phép đã được tạo thành công!</h2>
                        <p>
                            Đơn xin nghỉ phép của bạn đã được gửi và đang chờ xét duyệt. 
                            Bạn sẽ nhận được thông báo khi đơn được xử lý.
                        </p>
                        <div>
                            <Link to="/dashboard" className="dashboard-redirect-btn">
                                Về Dashboard
                            </Link>
                            <button 
                                onClick={onReset} 
                                className="create-another-btn"
                            >
                                Tạo đơn khác
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="leave-request-form-container">
            <div className="leave-request-form-card">
                <div className="leave-request-header">
                    <h2>Tạo đơn xin nghỉ phép</h2>
                    <p>Điền thông tin để tạo đơn xin nghỉ phép mới</p>
                </div>

                <form onSubmit={handleSubmit} className="leave-request-form">
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="fromDate">Ngày bắt đầu *</label>
                            <input
                                type="date"
                                id="fromDate"
                                name="fromDate"
                                value={leaveRequestData.fromDate}
                                onChange={onInputChange}
                                disabled={loading}
                                required
                                min={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="toDate">Ngày kết thúc *</label>
                            <input
                                type="date"
                                id="toDate"
                                name="toDate"
                                value={leaveRequestData.toDate}
                                onChange={onInputChange}
                                disabled={loading}
                                required
                                min={leaveRequestData.fromDate || new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="reason">Lý do nghỉ phép *</label>
                        <textarea
                            id="reason"
                            name="reason"
                            value={leaveRequestData.reason}
                            onChange={onInputChange}
                            disabled={loading}
                            required
                            placeholder="Nhập lý do nghỉ phép (ít nhất 10 ký tự)..."
                            rows="4"
                        />
                        <small style={{ color: '#7f8c8d', fontSize: '0.8rem', marginTop: '5px' }}>
                            {leaveRequestData.reason.length}/500 ký tự
                        </small>
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className={`create-leave-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? '' : 'Tạo đơn xin nghỉ phép'}
                    </button>
                </form>

                <div className="leave-request-footer">
                    <p>Cần trợ giúp?</p>
                    <Link to="/dashboard" className="dashboard-link">
                        Quay về Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LeaveRequestForm;
