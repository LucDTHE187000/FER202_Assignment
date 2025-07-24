import { useMemo } from 'react';
import { useUser } from '../../../contexts/UserContext';

const useLeaveReportPermissions = () => {
    const { user, isAuthenticated, loading } = useUser();

    const permissions = useMemo(() => {
        if (!isAuthenticated || !user || !user.roles) {
            return {
                canViewReports: false,
                isDirector: false,
                loading: true
            };
        }

        // Lấy danh sách role từ user.roles array
        const userRoles = user.roles || [];
        const roleIds = userRoles.map(role => role.RoleID);

        // Kiểm tra nếu user có role Director (RoleID = 1)
        const isDirector = roleIds.includes(1);

        // Chỉ Director mới có thể xem báo cáo nghỉ phép
        const canViewReports = isDirector;

        return {
            canViewReports,
            isDirector,
            loading: false
        };
    }, [user, isAuthenticated]);

    return {
        ...permissions,
        loading: loading || permissions.loading,
        user
    };
};

export default useLeaveReportPermissions;
