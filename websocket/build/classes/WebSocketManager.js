"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
const ws_1 = __importDefault(require("ws"));
const PubSubManager_1 = require("./PubSubManager");
class WebSocketManager {
    constructor() {
        this.socket = null;
        this.pubSub = PubSubManager_1.PubSubManager.getInstance();
    }
    static getInstance() {
        if (!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }
    connect(url) {
        if (this.socket) {
            console.warn('WebSocket is already connected');
            return;
        }
        try {
            this.socket = new ws_1.default(url);
            this.socket.on('open', this.handleOpen.bind(this));
            this.socket.on('message', this.handleMessage.bind(this));
            this.socket.on('close', this.handleClose.bind(this));
            this.socket.on('error', this.handleError.bind(this));
        }
        catch (error) {
            console.error('Failed to establish WebSocket', error);
        }
    }
    handleOpen() {
        this.pubSub.publish('websocket:connected', null);
    }
    handleMessage(data) {
        try {
            const parsedData = JSON.parse(data.toString());
            this.pubSub.publish(parsedData.type, parsedData);
        }
        catch (error) {
            console.error('Error parsing the message', error);
            this.socket = null;
        }
    }
    handleClose(code, reason) {
        this.pubSub.publish('websocket:connection_disconnected', { code, reason });
    }
    handleError(error) {
        console.error('WebSocket error:', error);
        this.pubSub.publish('websocket:error', error);
    }
    sendMessage(payload) {
        if (!this.socket || this.socket.readyState !== ws_1.default.OPEN) {
            console.error("WebSocket is not open");
            return;
        }
        try {
            this.socket.send(JSON.stringify(payload));
        }
        catch (error) {
            console.error('Failed to send message', error);
        }
    }
    close() {
        if (this.socket) {
            this.socket.close();
            this.socket = null;
        }
    }
}
exports.WebSocketManager = WebSocketManager;
