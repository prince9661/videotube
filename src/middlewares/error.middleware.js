const errorHandler = (err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    return res.status(statusCode).json({
        statusCode: statusCode,
        data: err.data || null,
        message: err.message || "Internal Server Error",
        success: false,
        errors: err.errors || []
    });
};

export { errorHandler };