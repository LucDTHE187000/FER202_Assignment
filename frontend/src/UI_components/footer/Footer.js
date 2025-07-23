import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>Leave Management System</h3>
                        <p>Quản lý nghỉ phép hiệu quả cho doanh nghiệp</p>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Liên hệ</h4>
                        <p>Email: support@leavemgmt.com</p>
                        <p>Phone: (84) 123-456-789</p>
                    </div>
                    
                    <div className="footer-section">
                        <h4>Liên kết nhanh</h4>
                        <ul className="footer-links">
                            <li><a href="/help">Hướng dẫn</a></li>
                            <li><a href="/privacy">Chính sách bảo mật</a></li>
                            <li><a href="/terms">Điều khoản sử dụng</a></li>
                        </ul>
                    </div>
                </div>
                
                <div className="footer-bottom">
                    <p>&copy; {currentYear} Leave Management System. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
