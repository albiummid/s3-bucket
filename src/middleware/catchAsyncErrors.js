module.exports = (func) => (_req, _res, _next) => {
    Promise.resolve(func(_req, _res, _next)).catch(_next);
};
