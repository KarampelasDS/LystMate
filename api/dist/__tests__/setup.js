"use strict";
jest.mock("../middleware/rateLimit", () => {
    const noOp = (_req, _res, next) => next();
    return {
        globalLimiter: noOp,
        authLimiter: noOp,
        inviteLimiter: noOp,
        userLimiter: noOp,
    };
});
//# sourceMappingURL=setup.js.map