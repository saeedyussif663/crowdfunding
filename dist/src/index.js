"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_connection_1 = require("./lib/db-connection");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const isAuthenticated_1 = __importDefault(require("./middleware/isAuthenticated"));
const usersModel_1 = require("./models/usersModel");
const campaignRoutes_1 = __importDefault(require("./routes/campaignRoutes"));
const payment_1 = __importDefault(require("./lib/payment"));
const cors_1 = __importDefault(require("cors"));
const express_fileupload_1 = __importDefault(require("express-fileupload"));
const upload_1 = __importDefault(require("./lib/upload"));
const webhook_1 = require("./lib/webhook");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use((0, express_fileupload_1.default)());
app.get("/", (req, res) => {
    res.send("Welcome to the crowdfunding api");
});
// auth routes
app.use("/api/auth/", authRoutes_1.default);
// campaigns route
app.use("/api/campaign/", campaignRoutes_1.default);
// upload image
app.post("/api/upload", upload_1.default);
// get user - protected
app.get("/api/user/me", isAuthenticated_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const Id = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
    const user = yield usersModel_1.User.findOne({ _id: Id });
    res.status(200).json({
        user: { email: user === null || user === void 0 ? void 0 : user.email, name: user === null || user === void 0 ? void 0 : user.name },
    });
    return;
}));
// make payments
app.post("/api/donate/:id", isAuthenticated_1.default, payment_1.default);
// payment success webhook
app.post("/webhook", webhook_1.paymentWebook);
app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
    (0, db_connection_1.DBconnect)();
});
