const jwt = require('jsonwebtoken');
const UserDBContext = require('../dal/UserDBContext');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];

        console.log('Auth middleware - Headers:', req.headers.authorization ? 'Present' : 'Missing');
        console.log('Auth middleware - Token:', token ? 'Present' : 'Missing');

        if (!token) {
            console.log('Auth middleware - No token provided');
            return res.status(401).json({
                success: false,
                error: 'Access token is required'
            });
        }

        const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
        
        jwt.verify(token, JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid or expired token'
                });
            }

            try {
                // Lấy thông tin user từ database
                const userDB = new UserDBContext();
                const user = await userDB.get(decoded.userId);

                if (!user) {
                    return res.status(401).json({
                        success: false,
                        error: 'User not found'
                    });
                }

                // Gán user vào request object
                req.user = user;
                next();
            } catch (error) {
                console.error('Error verifying user:', error);
                return res.status(500).json({
                    success: false,
                    error: 'Internal server error'
                });
            }
        });
    } catch (error) {
        console.error('Error in authenticateToken middleware:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
};

// Middleware kiểm tra role
const authorizeRole = (requiredRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }

            const userRoles = req.user.roles || [];
            const hasRequiredRole = requiredRoles.some(role => 
                userRoles.some(userRole => userRole.RoleID === role || userRole.RoleName === role)
            );

            if (!hasRequiredRole) {
                return res.status(403).json({
                    success: false,
                    error: 'Insufficient permissions'
                });
            }

            next();
        } catch (error) {
            console.error('Error in authorizeRole middleware:', error);
            return res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
};

module.exports = {
    authenticateToken,
    authorizeRole
};
