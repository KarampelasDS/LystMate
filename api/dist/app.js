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
const helmet_1 = __importDefault(require("helmet"));
const app = (0, express_1.default)();
if (process.env.NODE_ENV === "production")
    app.set("trust proxy", 1);
const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
if (process.env.FRONTEND_URL) {
    const url = process.env.FRONTEND_URL.replace(/\/$/, "");
    allowedOrigins.push(url);
    if (url.includes("://www."))
        allowedOrigins.push(url.replace("://www.", "://"));
    else
        allowedOrigins.push(url.replace("://", "://www."));
}
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin || allowedOrigins.includes(origin))
            return cb(null, true);
        console.log("CORS blocked origin:", origin, "allowed:", allowedOrigins);
        cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE"],
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json({ limit: "10kb" }));
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
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});
exports.default = app;
//# sourceMappingURL=app.js.map