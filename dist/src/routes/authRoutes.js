"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const authRoutes = (0, express_1.Router)();
// signup
authRoutes.post("/sign-up", authController_1.signup);
// signin
authRoutes.post("/sign-in", authController_1.signin);
// refresh-token
authRoutes.post("/refresh-token", authController_1.refreshToken);
// forgot-password
authRoutes.post("/forgot-password", authController_1.forgotPassword);
// set-password
authRoutes.put("/set-password", authController_1.setPassword);
exports.default = authRoutes;
