const isAdmin = (req, res, next) => {
    if (req.role !== "admin") {
        return res.status(403).json("Access denied, admin only");
    }
    next();
};

module.exports = isAdmin;