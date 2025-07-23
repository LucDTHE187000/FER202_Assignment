import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Cập nhật state để hiển thị UI lỗi
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // Có thể log lỗi ở đây
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // UI lỗi tùy chỉnh
            return (
                <div style={{ 
                    padding: '20px', 
                    margin: '20px', 
                    border: '1px solid #ff6b6b',
                    borderRadius: '5px',
                    backgroundColor: '#ffe0e0'
                }}>
                    <h2 style={{ color: '#d63031' }}>Đã xảy ra lỗi!</h2>
                    <details style={{ whiteSpace: 'pre-wrap' }}>
                        <summary>Chi tiết lỗi (click để xem)</summary>
                        {this.state.error && this.state.error.toString()}
                        <br />
                        {this.state.errorInfo && this.state.errorInfo.componentStack}
                    </details>
                    <button 
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '10px',
                            padding: '10px 20px',
                            backgroundColor: '#0984e3',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer'
                        }}
                    >
                        Tải lại trang
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
