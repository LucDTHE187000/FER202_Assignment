const DepartmentDBContext = require('../dal/DepartmentDBContext');
const Department = require('../model/Department');

class DepartmentController {
    constructor() {
        this.departmentDB = new DepartmentDBContext();
    }

    // GET /api/departments
    async getAllDepartments(req, res) {
        try {
            const departments = await this.departmentDB.list();
            
            res.json({
                success: true,
                data: departments.map(dept => dept.toJSON())
            });
        } catch (error) {
            console.error('Error fetching departments:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy danh sách phòng ban'
            });
        }
    }

    // GET /api/departments/:id
    async getDepartmentById(req, res) {
        try {
            const departmentId = parseInt(req.params.id);
            
            if (isNaN(departmentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID phòng ban không hợp lệ'
                });
            }

            const department = await this.departmentDB.get(departmentId);
            
            if (!department) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy phòng ban'
                });
            }

            res.json({
                success: true,
                data: department.toJSON()
            });
        } catch (error) {
            console.error('Error fetching department:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi lấy thông tin phòng ban'
            });
        }
    }

    // POST /api/departments
    async createDepartment(req, res) {
        try {
            const departmentData = req.body;
            const department = new Department(departmentData);
            
            const validation = department.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: validation.errors
                });
            }

            const savedDepartment = await this.departmentDB.insert(department);
            
            res.status(201).json({
                success: true,
                data: savedDepartment.toJSON(),
                message: 'Tạo phòng ban thành công'
            });
        } catch (error) {
            console.error('Error creating department:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi tạo phòng ban'
            });
        }
    }

    // PUT /api/departments/:id
    async updateDepartment(req, res) {
        try {
            const departmentId = parseInt(req.params.id);
            const departmentData = req.body;
            
            if (isNaN(departmentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID phòng ban không hợp lệ'
                });
            }

            departmentData.DepartmentID = departmentId;
            const department = new Department(departmentData);
            
            const validation = department.validate();
            if (!validation.isValid) {
                return res.status(400).json({
                    success: false,
                    error: 'Dữ liệu không hợp lệ',
                    details: validation.errors
                });
            }

            const updatedDepartment = await this.departmentDB.update(department);
            
            res.json({
                success: true,
                data: updatedDepartment.toJSON(),
                message: 'Cập nhật phòng ban thành công'
            });
        } catch (error) {
            console.error('Error updating department:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi cập nhật phòng ban'
            });
        }
    }

    // DELETE /api/departments/:id
    async deleteDepartment(req, res) {
        try {
            const departmentId = parseInt(req.params.id);
            
            if (isNaN(departmentId)) {
                return res.status(400).json({
                    success: false,
                    error: 'ID phòng ban không hợp lệ'
                });
            }

            const department = await this.departmentDB.get(departmentId);
            if (!department) {
                return res.status(404).json({
                    success: false,
                    error: 'Không tìm thấy phòng ban'
                });
            }

            await this.departmentDB.delete(department);
            
            res.json({
                success: true,
                message: 'Xóa phòng ban thành công'
            });
        } catch (error) {
            console.error('Error deleting department:', error);
            res.status(500).json({
                success: false,
                error: 'Lỗi server khi xóa phòng ban'
            });
        }
    }
}

module.exports = DepartmentController;
