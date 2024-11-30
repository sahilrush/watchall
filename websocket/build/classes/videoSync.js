"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VideoSyncService = void 0;
const PubSubManager_1 = require("./PubSubManager");
const WebSocketManager_1 = require("./WebSocketManager");
class VideoSyncService {
    constructor() {
        this.handleTimestampUpdate = (data) => {
            // Synchronize video timestamp across clients
            this.updateLocalVideoTimestamp(data);
        };
        this.pubSub = PubSubManager_1.PubSubManager.getInstance();
        this.wsManager = WebSocketManager_1.WebSocketManager.getInstance();
        // Subscribe to timestamp updates
        this.pubSub.subscribe('video:timestamp_updated', this.handleTimestampUpdate);
    }
    updateLocalVideoTimestamp(payload) {
        // Example: Update video player timestamp
        const videoElement = document.getElementById(payload.video_id);
        if (videoElement) {
            videoElement.currentTime = payload.timestamp;
        }
    }
    // Method to broadcast current timestamp
    broadcastTimestamp(videoId, timestamp) {
        this.wsManager.sendMessage({
            type: 'video:timestamp_updated',
            video_id: videoId,
            timestamp: timestamp
        });
    }
    // Subscribe to a specific video
    subscribeToVideo(videoId) {
        this.wsManager.sendMessage({
            type: 'video:subscribe',
            video_id: videoId
        });
    }
}
exports.VideoSyncService = VideoSyncService;
