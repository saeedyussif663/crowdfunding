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
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = sendEmail;
const courier_1 = require("@trycourier/courier");
function sendEmail(name, email) {
    return __awaiter(this, void 0, void 0, function* () {
        const courier = new courier_1.CourierClient({
            authorizationToken: process.env.EMAIL_SECRET,
        });
        const { requestId } = yield courier.send({
            message: {
                to: {
                    email: email,
                },
                template: "478JWZG11AMHE1JH6NVM8QB0YGB1",
                data: {
                    recipientName: name,
                },
            },
        });
    });
}
