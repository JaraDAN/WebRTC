"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const dotenv_1 = __importDefault(require("dotenv"));
const Config_1 = require("./config/Config");
dotenv_1.default.config();
app_1.app.listen(Config_1.PORT, () => {
    console.log(`Server running ${Config_1.PORT}`);
});
//# sourceMappingURL=index.js.map