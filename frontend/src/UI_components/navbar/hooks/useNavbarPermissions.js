import { useMemo } from 'react';
import { useUser } from '../../../contexts/UserContext';

const useNavbarPermissions = () => {
    const { user, isAuthenticated, loading } = useUser();

    const permissions = useMemo(() => {
        if (!isAuthenticated || !user || !user.roles) {
            return {
                isDirector: false,
                isDepartmentLeader: false,
                isEmployee: false,
                userRoles: [],
                roleNames: [],
                roleIds: [],
                hasAnyRole: false
            };
        }

        // Lấy danh sách role từ user.roles array
        const userRoles = user.roles || [];
        const roleNames = userRoles.map(role => role.RoleName);
        const roleIds = userRoles.map(role => role.RoleID);

        // Kiểm tra từng role cụ thể theo RoleID
        // RoleID: 1 = Director, 2 = Department Leader, 4 = Employee
        const isDirector = roleIds.includes(1);
        const isDepartmentLeader = roleIds.includes(2);
        const isEmployee = roleIds.includes(4);

        return {
            isDirector,
            isDepartmentLeader,
            isEmployee,
            userRoles,
            roleNames,
            roleIds,
            hasAnyRole: userRoles.length > 0
        };
    }, [user, isAuthenticated]);

    return {
        ...permissions,
        loading,
        user
    };
};

export default useNavbarPermissions;
