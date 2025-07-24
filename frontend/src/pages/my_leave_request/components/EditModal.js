import React from 'react';

const EditModal = ({
    editing,
    editForm,
    editLoading,
    error,
    onEditChange,
    onUpdateRequest,
    onCancelEdit
}) => {
    if (!editing) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateRequest();
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3 className="modal-title">
                    Chỉnh Sửa Đơn Nghỉ Phép #{editing}
                </h3>
                
                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}
                
                <form className="edit-form" onSubmit={handleSubmit}>
                    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px'}}>
                        <div>
                            <label>Từ ngày:</label>
                            <input
                                type="date"
                                name="FromDate"
                                value={editForm.FromDate}
                                onChange={onEditChange}
                                required
                                disabled={editLoading}
                                min={new Date().toISOString().split('T')[0]} // Prevent past dates
                            />
                        </div>
                        <div>
                            <label>Đến ngày:</label>
                            <input
                                type="date"
                                name="ToDate"
                                value={editForm.ToDate}
                                onChange={onEditChange}
                                required
                                disabled={editLoading}
                                min={editForm.FromDate || new Date().toISOString().split('T')[0]} // Prevent dates before FromDate
                            />
                        </div>
                    </div>
                    <div>
                        <label>Lý do:</label>
                        <textarea
                            name="Reason"
                            value={editForm.Reason}
                            onChange={onEditChange}
                            required
                            rows={3}
                            placeholder="Nhập lý do nghỉ phép..."
                            disabled={editLoading}
                        />
                    </div>
                    <div className="modal-actions">
                        <button
                            type="button"
                            className="btn btn-cancel"
                            onClick={onCancelEdit}
                            disabled={editLoading}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            className="btn btn-save"
                            disabled={editLoading}
                        >
                            {editLoading ? 'Đang cập nhật...' : 'Cập nhật đơn'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditModal;
