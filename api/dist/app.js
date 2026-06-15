"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const lists_1 = __importDefault(require("./routes/lists"));
const items_1 = __importDefault(require("./routes/items"));
const invites_1 = __importDefault(require("./routes/invites"));
const users_1 = __importDefault(require("./routes/users"));
const rateLimit_1 = require("./middleware/rateLimit");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use(rateLimit_1.globalLimiter);
app.use("/auth", auth_1.default);
app.use("/lists", lists_1.default);
app.use("/lists/:listId/items", items_1.default);
app.use("/invites", invites_1.default);
app.use("/users", users_1.default);
app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
});
app.use((err, _req, res, _next) => {
    res.status(500).json({ error: "Internal server error" });
});
exports.default = app;
//# sourceMappingURL=app.js.map