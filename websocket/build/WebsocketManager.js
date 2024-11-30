"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketManager = void 0;
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
            console.warn('weboscket is already connected guys');
            return;
        }
        try {
            this.socket = new WebSocket(url);
            this.socket.addEventListener('open', this.handleOpen.bind(this));
            this.socket.addEventListener('message', this.handleMessage.bind(this));
            this.socket.addEventListener('close', this.handleClose.bind(this));
        }
        catch (error) {
            console.error('Failed to establish Websocket', error);
        }
    }
    handleOpen() {
        this.pubSub.publish('websocket connected', null);
    }
    handleMessage(event) {
        try {
            const data = JSON.parse(event.data);
            this.pubSub.publish(data.type, data);
        }
        catch (error) {
            console.error('error parsing the messafe', error);
            this.socket = null;
        }
    }
    handleClose(event) {
        this.pubSub.publish('websocket connection disconnedted', event);
    }
    sendMessage(payload) {
        if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
            console.error("Websocket is not open");
            return;
        }
        try {
            this.socket.send(JSON.stringify(payload));
        }
        catch (error) {
            console.error('failed to send messafe', error);
        }
    }
}
exports.WebSocketManager = WebSocketManager;
// Example Usage
const wsManager = WebSocketManager.getInstance();
const pubSub = PubSubManager_1.PubSubManager.getInstance();
// Subscribe to video timestamp updates
const unsubscribeTimestamp = pubSub.subscribe('video:timestamp_updated', (data) => {
    console.log('Timestamp updated:', data);
    // Handle timestamp update logic
});
// Subscribe to WebSocket connection events
const unsubscribeConnected = pubSub.subscribe('websocket:connected', () => {
    console.log('WebSocket connected successfully');
});
// Connect to WebSocket
wsManager.connect('wss://your-websocket-server.com');
// Send a video subscription message
wsManager.sendMessage({
    type: 'video:subscribe',
    video_id: 'some-video-uuid'
});
