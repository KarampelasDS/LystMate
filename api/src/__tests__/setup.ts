jest.mock("../middleware/rateLimit", () => {
  const noOp = (_req: unknown, _res: unknown, next: () => void) => next();
  return {
    globalLimiter: noOp,
    authLimiter: noOp,
    inviteLimiter: noOp,
    userLimiter: noOp,
  };
});
