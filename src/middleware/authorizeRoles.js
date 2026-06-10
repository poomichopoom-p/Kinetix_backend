const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        // Assuming req.user is populated by authUser middleware and contains a 'role' property
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Forbidden: You do not have permission to access this resource.' });
        }
        next();
    };
};

export default authorizeRoles;