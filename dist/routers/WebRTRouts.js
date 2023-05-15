"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.routerRtc = void 0;
const express_1 = require("express");
const WebRTc_1 = require("../controllers/WebRTc");
exports.routerRtc = (0, express_1.Router)();
exports.routerRtc === null || exports.routerRtc === void 0 ? void 0 : exports.routerRtc.get('/connectionInfo', WebRTc_1.webrtc.connectionInfo);
exports.routerRtc === null || exports.routerRtc === void 0 ? void 0 : exports.routerRtc.get('/callPhone', WebRTc_1.webrtc.callPhone);
exports.routerRtc === null || exports.routerRtc === void 0 ? void 0 : exports.routerRtc.post('/incomingCall', WebRTc_1.webrtc.incomingCall);
exports.routerRtc === null || exports.routerRtc === void 0 ? void 0 : exports.routerRtc.post('/callAnswered', WebRTc_1.webrtc.callAnswered);
exports.routerRtc === null || exports.routerRtc === void 0 ? void 0 : exports.routerRtc.post('/callStatus', WebRTc_1.webrtc.callStatus);
//# sourceMappingURL=WebRTRouts.js.map