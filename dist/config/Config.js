"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PORT = exports.BW_VOICE_APPLICATION_ID = exports.USER_NUMBER = exports.BW_NUMBER = exports.BW_PASSWORD = exports.BW_USERNAME = exports.BW_ACCOUNT_ID = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.BW_ACCOUNT_ID = process.env["BW_ACCOUNT_ID"];
exports.BW_USERNAME = process.env["BW_USERNAME"];
exports.BW_PASSWORD = process.env["BW_PASSWORD"];
exports.BW_NUMBER = process.env["BW_NUMBER"];
exports.USER_NUMBER = process.env["USER_NUMBER"];
exports.BW_VOICE_APPLICATION_ID = process.env["BW_VOICE_APPLICATION_ID"];
exports.PORT = process.env["PORT"];
//# sourceMappingURL=Config.js.map