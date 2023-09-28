const { configs } = require("../configs/app.config");
const ErrorHandler = require("../utils/errorHandler");

const ENV = configs.env;

module.exports = (_err, _req, _res, _next) => {
    _err.message = _err.message || "Internal Server Error";
    _err.statusCode = _err.statusCode || 500;

    // Handling mongoose CastError
    if (_err.name === "CastError") {
        message = `Resource not found. Invalid:${_err.path}`;
        new ErrorHandler(message, 400);
    }

    // Handling mongoose validation error
    if (_err.name === "ValidationError") {
        message = Object.values(_err.errors).map((value) => value.message);
        new ErrorHandler(message, 400);
    }

    // Wrong Mongodb Id error
    if (_err.name === "CastError") {
        const message = `Resource not found. Invalid: ${_err.path}`;
        new ErrorHandler(message, 400);
    }

    // Mongoose duplicate key error
    if (_err.code === 11000) {
        const message = `Duplicate ${Object.keys(_err.keyValue)} Entered`;
        new ErrorHandler(message, 400);
    }

    // Wrong JWT error
    if (_err.name === "JsonWebTokenError") {
        const message = `Json Web Token is invalid, Try again `;
        new ErrorHandler(message, 400);
    }

    // JWT EXPIRE error
    if (_err.name === "TokenExpiredError") {
        const message = `Json Web Token is Expired, Try again `;
        new ErrorHandler(message, 400);
    }

    _res.status(_err.statusCode).json({
        kind: "error",
        status: _err.statusCode,
        message: _err.message,
        data: {},
        error: {
            ..._err,
        },
        stack: ENV !== "development" && _err.stack,
    });
};
