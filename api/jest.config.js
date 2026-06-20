"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    preset: "ts-jest",
    testEnvironment: "node",
    testMatch: ["**/__tests__/**/*.test.ts"],
    clearMocks: true,
    setupFiles: ["<rootDir>/src/__tests__/env.setup.ts"],
    setupFilesAfterEnv: ["<rootDir>/src/__tests__/setup.ts"],
    transform: {
        "^.+\\.tsx?$": ["ts-jest", { tsconfig: { types: ["jest", "node"] } }],
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map