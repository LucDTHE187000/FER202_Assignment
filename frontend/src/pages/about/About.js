import React from 'react';
import './About.css';

const About = () => {
    return (
        <div className="about-page">
            <div className="about-container">
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-content">
                        <h1 className="hero-title">Hệ thống Quản lý Nghỉ phép</h1>
                        <p className="hero-subtitle">
                            Giải pháp toàn diện cho việc quản lý đơn nghỉ phép trong doanh nghiệp
                        </p>
                        <div className="hero-features">
                            <div className="feature-item">
                                <span className="feature-icon">📝</span>
                                <span>Tạo đơn nghỉ phép</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">✅</span>
                                <span>Duyệt đơn tự động</span>
                            </div>
                            <div className="feature-item">
                                <span className="feature-icon">📊</span>
                                <span>Báo cáo chi tiết</span>
                            </div>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="hero-graphic">
                            <div className="graphic-element">
                                <span className="graphic-icon">💼</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="section-header">
                        <h2>Tính năng nổi bật</h2>
                        <p>Hệ thống cung cấp đầy đủ các tính năng cần thiết để quản lý nghỉ phép hiệu quả</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-card-icon">📋</div>
                            <h3>Quản lý đơn nghỉ phép</h3>
                            <p>Tạo, chỉnh sửa và theo dõi trạng thái các đơn nghỉ phép một cách dễ dàng</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">👥</div>
                            <h3>Phân quyền người dùng</h3>
                            <p>Hệ thống phân quyền linh hoạt cho Director, Department Leader và Employee</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">📈</div>
                            <h3>Báo cáo thống kê</h3>
                            <p>Tạo báo cáo chi tiết với biểu đồ trực quan và khả năng xuất Excel</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-card-icon">⚡</div>
                            <h3>Xử lý nhanh chóng</h3>
                            <p>Giao diện thân thiện, xử lý nhanh với thông báo realtime</p>
                        </div>
                    </div>
                </section>

                {/* How it works Section */}
                <section className="how-it-works-section">
                    <div className="section-header">
                        <h2>Cách thức hoạt động</h2>
                        <p>Quy trình đơn giản và hiệu quả</p>
                    </div>
                    <div className="steps-container">
                        <div className="step-item">
                            <div className="step-number">1</div>
                            <div className="step-content">
                                <h4>Tạo đơn nghỉ phép</h4>
                                <p>Nhân viên tạo đơn nghỉ phép với thông tin chi tiết</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">2</div>
                            <div className="step-content">
                                <h4>Phê duyệt</h4>
                                <p>Department Leader hoặc Director xem xét và phê duyệt</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">3</div>
                            <div className="step-content">
                                <h4>Theo dõi</h4>
                                <p>Nhân viên theo dõi trạng thái và lịch sử đơn nghỉ phép</p>
                            </div>
                        </div>
                        <div className="step-item">
                            <div className="step-number">4</div>
                            <div className="step-content">
                                <h4>Báo cáo</h4>
                                <p>Tạo báo cáo thống kê chi tiết theo nhiều tiêu chí</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Technology Section */}
                <section className="technology-section">
                    <div className="section-header">
                        <h2>Công nghệ sử dụng</h2>
                        <p>Được xây dựng trên nền tảng công nghệ hiện đại</p>
                    </div>
                    <div className="tech-grid">
                        <div className="tech-item">
                            <div className="tech-icon">⚛️</div>
                            <span>React.js</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">🟢</div>
                            <span>Node.js</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">🗄️</div>
                            <span>SQL Server</span>
                        </div>
                        <div className="tech-item">
                            <div className="tech-icon">🔐</div>
                            <span>JWT Security</span>
                        </div>
                    </div>
                </section>

                {/* Footer Section */}
                <section className="about-footer">
                    <div className="footer-content">
                        <h3>Bắt đầu sử dụng ngay hôm nay</h3>
                        <p>Hệ thống quản lý nghỉ phép hiện đại, đơn giản và hiệu quả</p>
                        <div className="footer-info">
                            <div className="info-item">
                                <strong>Phiên bản:</strong> 1.0.0
                            </div>
                            <div className="info-item">
                                <strong>Cập nhật:</strong> Tháng 7, 2025
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default About;
