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
exports.webrtc = void 0;
const Config_1 = require("../config/Config");
const webrtc_1 = require("@bandwidth/webrtc");
const voice_1 = require("@bandwidth/voice");
const accountId = Config_1.BW_ACCOUNT_ID;
const username = Config_1.BW_USERNAME;
const password = Config_1.BW_PASSWORD;
const voiceApplicationPhoneNumber = Config_1.BW_NUMBER;
const voiceApplicationId = Config_1.BW_VOICE_APPLICATION_ID;
const outboundPhoneNumber = Config_1.USER_NUMBER;
const webRTCClient = new webrtc_1.Client({
    basicAuthUserName: username,
    basicAuthPassword: password
});
const webRTCController = new webrtc_1.ApiController(webRTCClient);
const voiceClient = new voice_1.Client({
    basicAuthUserName: username,
    basicAuthPassword: password
});
const voiceController = new voice_1.ApiController(voiceClient);
let sessionId;
let calls = new Map(); // Call IDs to ParticipantInfos
class Webrtc {
    connectionInfo(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const { id, token } = yield createParticipant("hello-world-ts-phone");
            res.send({
                id,
                token,
                voiceApplicationPhoneNumber: voiceApplicationPhoneNumber,
                outboundPhoneNumber: outboundPhoneNumber,
            });
        });
    }
    ;
    callPhone(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Config_1.BW_VOICE_APPLICATION_ID) {
                console.log("no outbound phone number has been set");
                res.status(400).send();
            }
            const participant = yield createParticipant("hello-world-ts-phone");
            yield callPhone(voiceApplicationPhoneNumber, participant);
            res.status(204).send();
        });
    }
    incomingCall(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!voiceApplicationId) {
                console.log("no outbound phone number has been set");
                return res.status(400).send();
            }
            const participant = yield createParticipant("hello-world-ts-phone");
            yield callPhone(voiceApplicationId, participant);
            res.status(204).send();
        });
    }
    callAnswered(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            const callId = req.body.callId;
            console.log(`received answered callback for call ${callId} tp ${req.body.to}`);
            const participant = calls.get(callId);
            if (!participant) {
                console.log(`no participant found for ${callId}!`);
                res.status(400).send();
                return;
            }
            // This is the response payload that we will send back to the Voice API to transfer the call into the WebRTC session
            const bxml = `<?xml version="1.0" encoding="UTF-8" ?>
      <Response>
          <SpeakSentence voice="julie"> Hello, welcome to Bandwidth WebRTC, my name is not Julia, my lastname is Celada </SpeakSentence>
          ${webrtc_1.ApiController.generateTransferBxmlVerb(participant.token, callId)}
      </Response>`;
            // Send the payload back to the Voice API
            res.contentType("application/xml").send(bxml);
            console.log(`transferring call ${callId} to session ${sessionId} as participant ${participant.id}`);
        });
    }
    callStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            res.status(200).send();
            if (req.body.eventType === "disconnect") {
                // Do some cleanup
                const callId = req.body.callId;
                console.log(`received disconnect event for call ${callId}`);
                const participant = calls.get(callId);
                if (participant) {
                    deleteParticipant(participant.id);
                    calls.delete(callId);
                }
                else {
                    console.log("no participant associated with event", req.body);
                }
            }
            else {
                console.log("received unexpected status update", req.body);
            }
        });
    }
}
;
const getSessionId = () => __awaiter(void 0, void 0, void 0, function* () {
    // If we already have a valid session going, just re-use that one
    if (sessionId) {
        try {
            let getSessionResponse = yield webRTCController.getSession(accountId, sessionId);
            const existingSession = getSessionResponse.result;
            console.log(`using session ${existingSession.id}`);
            if (!existingSession.id) {
                throw Error('No session ID in result');
            }
            return existingSession.id;
        }
        catch (e) {
            console.log(`session ${sessionId} is invalid, creating a new session`);
        }
    }
    // Otherwise start a new one and return the ID
    const createSessionBody = {
        tag: "hello-world"
    };
    let response = yield webRTCController.createSession(accountId, createSessionBody);
    if (!response.result.id) {
        throw Error('No Session ID in Create Session Response');
    }
    sessionId = response.result.id;
    console.log(`created new session ${sessionId}`);
    return sessionId;
});
/**
 * Create a new participant and save their ID to our app's state map
 */
const createParticipant = (tag) => __awaiter(void 0, void 0, void 0, function* () {
    // Create a new participant
    const participantBody = {
        tag: tag,
        publishPermissions: [webrtc_1.PublishPermissionEnum.AUDIO],
        deviceApiVersion: webrtc_1.DeviceApiVersionEnum.V3
    };
    let createParticipantResponse = yield webRTCController.createParticipant(accountId, participantBody);
    const participant = createParticipantResponse.result.participant;
    if (!createParticipantResponse.result.token) {
        throw Error('No token in Create Participant Response');
    }
    const token = createParticipantResponse.result.token;
    if (!(participant === null || participant === void 0 ? void 0 : participant.id)) {
        throw Error('No participant ID in Create Participant Response');
    }
    const participantId = participant === null || participant === void 0 ? void 0 : participant.id;
    console.log(`Created new participant ${participantId}`);
    // Add participant to session
    const sessionId = yield getSessionId();
    const subscriptions = {
        sessionId: sessionId
    };
    yield webRTCController.addParticipantToSession(accountId, sessionId, participantId, subscriptions);
    return {
        id: participantId,
        token: token,
    };
});
/**
 * Delete a participant
 */
const deleteParticipant = (participantId) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`deleting participant ${participantId}`);
    yield webRTCController.deleteParticipant(accountId, participantId);
});
/**
 * Ask Bandwidth's Voice API to call the outbound phone number, with an answer callback url that
 * includes the participant ID
 */
const callPhone = (phoneNumber, participant) => __awaiter(void 0, void 0, void 0, function* () {
    const createCallRequest = {
        from: voiceApplicationPhoneNumber,
        to: phoneNumber,
        answerUrl: `http://192.168.1.33:4000/callAnswered`,
        disconnectUrl: `http://192.168.1.33:4000/callStatus`,
        applicationId: voiceApplicationId,
        callTimeout: 30,
    };
    try {
        let response = yield voiceController.createCall(accountId, createCallRequest);
        const callId = response.result.callId;
        calls.set(callId, participant);
        console.log(`initiated call ${callId} to ${outboundPhoneNumber}...`);
    }
    catch (e) {
        console.log(`error calling ${outboundPhoneNumber}: ${e}`);
    }
});
exports.webrtc = new Webrtc();
//# sourceMappingURL=WebRTc.js.map