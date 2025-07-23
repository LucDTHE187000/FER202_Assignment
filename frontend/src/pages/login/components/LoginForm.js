import React from 'react';
import './LoginForm.css';

const LoginForm = ({ 
    loginData, 
    loading, 
    error, 
    onInputChange, 
    onSubmit 
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit();
    };

    return (
        <div className="login-form-container">
            <div className="login-form-card">
                <div className="login-header">
                    <h2>Đăng nhập</h2>
                    <p>Vui lòng đăng nhập để sử dụng hệ thống</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Tên đăng nhập</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={loginData.username}
                            onChange={onInputChange}
                            placeholder="Nhập tên đăng nhập"
                            disabled={loading}
                            autoComplete="username"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Mật khẩu</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={loginData.password}
                            onChange={onInputChange}
                            placeholder="Nhập mật khẩu"
                            disabled={loading}
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        className={`login-btn ${loading ? 'loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>
                
                <div className="login-footer">
                    <p>
                        Chưa có tài khoản? 
                        <a href="/register" className="register-link"> Đăng ký ngay</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginForm;
