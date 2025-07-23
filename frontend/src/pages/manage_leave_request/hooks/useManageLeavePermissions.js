import { useMemo } from 'react';
import { useUser } from '../../../contexts/UserContext';

const useManageLeavePermissions = () => {
    const { user, isAuthenticated, loading } = useUser();

    const permissions = useMemo(() => {
        if (!isAuthenticated || !user || !user.roles) {
            return {
                canManageLeave: false,
                isDirector: false,
                isDepartmentLeader: false,
                userDepartmentId: null,
                userRoles: [],
                roleIds: []
            };
        }

        // Lấy danh sách role từ user.roles array
        const userRoles = user.roles || [];
        const roleIds = userRoles.map(role => role.RoleID);

        // Kiểm tra từng role cụ thể theo RoleID
        // RoleID: 1 = Director, 2 = Department Leader, 4 = Employee
        const isDirector = roleIds.includes(1);
        const isDepartmentLeader = roleIds.includes(2);

        // Chỉ Director và Department Leader mới có thể quản lý đơn nghỉ phép
        const canManageLeave = isDirector || isDepartmentLeader;

        return {
            canManageLeave,
            isDirector,
            isDepartmentLeader,
            userDepartmentId: user.DepartmentID,
            userRoles,
            roleIds
        };
    }, [user, isAuthenticated]);

    return {
        ...permissions,
        loading,
        user
    };
};

export default useManageLeavePermissions;
