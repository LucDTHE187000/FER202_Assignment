import React, { useEffect } from 'react';
import './RegisterForm.css';

const RegisterForm = ({ 
    registerData, 
    loading, 
    error, 
    success,
    departments,
    departmentsLoading,
    onInputChange, 
    onSubmit,
    onLoadDepartments
}) => {
    useEffect(() => {
        onLoadDepartments();
    }, [onLoadDepartments]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    if (success) {
        return (
            <div className="register-form-container">
                <div className="register-form-card">
                    <div className="success-message">
                        <div className="success-icon">✅</div>
                        <h2>Đăng ký thành công!</h2>
                        <p>Tài khoản của bạn đã được tạo thành công.</p>
                        <p>Vui lòng đăng nhập để tiếp tục.</p>
                        <button 
                            className="login-redirect-btn"
                            onClick={() => window.location.href = '/login'}
                        >
                            Đi đến trang đăng nhập
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="register-form-container">
            <div className="register-form-card">
                <div className="register-header">
                    <h2>Đăng ký tài khoản</h2>
                    <p>Tạo tài khoản mới để sử dụng hệ thống</p>
                </div>
                
                <form className="register-form" onSubmit={handleSubmit}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="username">Tên đăng nhập *</label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={registerData.username}
                                onChange={onInputChange}
                                disabled={loading}
                                placeholder="Nhập tên đăng nhập"
                                autoComplete="username"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="fullName">Họ và tên *</label>
                            <input
                                type="text"
                                id="fullName"
                                name="fullName"
                                value={registerData.fullName}
                                onChange={onInputChange}
                                disabled={loading}
                                placeholder="Nhập họ và tên"
                                autoComplete="name"
                            />
                        </div>
                    </div>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu *</label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={registerData.password}
                                onChange={onInputChange}
                                disabled={loading}
                                placeholder="Nhập mật khẩu"
                                autoComplete="new-password"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="confirmPassword">Xác nhận mật khẩu *</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={registerData.confirmPassword}
                                onChange={onInputChange}
                                disabled={loading}
                                placeholder="Nhập lại mật khẩu"
                                autoComplete="new-password"
                            />
                        </div>
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="departmentId">Phòng ban *</label>
                        <select
                            id="departmentId"
                            name="departmentId"
                            value={registerData.departmentId}
                            onChange={onInputChange}
                            disabled={loading || departmentsLoading}
                        >
                            <option value="">
                                {departmentsLoading ? 'Đang tải...' : 'Chọn phòng ban'}
                            </option>
                            {departments.map(dept => (
                                <option key={dept.DepartmentID} value={dept.DepartmentID}>
                                    {dept.DepartmentName}
                                </option>
                            ))}
                        </select>
                        {departmentsLoading && (
                            <div className="loading-departments">
                                <span className="spinner"></span>
                                Đang tải danh sách phòng ban...
                            </div>
                        )}
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={`register-btn ${loading ? 'loading' : ''}`}
                        disabled={loading || departmentsLoading}
                    >
                        {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                    </button>
                </form>
                
                <div className="register-footer">
                    <p>
                        Đã có tài khoản? 
                        <a href="/login" className="login-link"> Đăng nhập ngay</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterForm;
