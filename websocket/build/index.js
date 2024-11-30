"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const ioredis_1 = __importDefault(require("ioredis"));
// Set up WebSocket server
const wss = new ws_1.WebSocketServer({ port: 8080 });
// Set up Redis connection
const redis = new ioredis_1.default();
// Subscribe to Redis channels
redis.subscribe('video:timestamp_updated');
// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New client connected');
    // Listen for messages from the client
    ws.on('message', (message) => {
        try {
            // Convert RawData to string and parse it
            const data = JSON.parse(message.toString());
            // Handle video subscription
            if (data.type === 'video:subscribe') {
                console.log(`Client subscribed to video: ${data.video_id}`);
                redis.publish('video:subscribe', JSON.stringify(data)); // Publish to Redis
            }
            // Handle video unsubscription
            else if (data.type === 'video:unsubscribe') {
                console.log(`Client unsubscribed from video: ${data.video_id}`);
                redis.publish('video:unsubscribe', JSON.stringify(data)); // Publish to Redis
            }
        }
        catch (error) {
            console.error('Invalid message format:', error);
        }
    });
    // Listen for timestamp updates from Redis and send to clients
    redis.on('message', (channel, message) => {
        if (channel === 'video:timestamp_updated') {
            const data = JSON.parse(message);
            ws.send(JSON.stringify(data)); // Send timestamp update to client
        }
    });
    // Handle client disconnection
    ws.on('close', () => {
        console.log('Client disconnected');
    });
});
console.log('WebSocket server running on ws://localhost:8080');
