"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendEmail = void 0;
const resend_1 = require("resend");
const resend = new resend_1.Resend(process.env.RESEND_API_KEY);
const from = process.env.RESEND_FROM;
if (!from)
    throw new Error("RESEND_FROM env var must be set");
const sendEmail = async (to, subject, html) => {
    try {
        const response = await resend.emails.send({
            from: from,
            to: to,
            subject: subject,
            html: html,
        });
        return response;
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};
exports.sendEmail = sendEmail;
//# sourceMappingURL=email.service.js.map