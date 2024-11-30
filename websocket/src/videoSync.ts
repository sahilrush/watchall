import { PubSubManager } from "./PubSubManager";
import { WebSocketManager } from "./WebsocketManager";

interface TimestampPayload {
  timestamp: number;
  user_id: string;
  video_id: string;
}

export class VideoSyncService {
  private pubSub: PubSubManager;
  private wsManager: WebSocketManager;

  constructor() {
    this.pubSub = PubSubManager.getInstance();
    this.wsManager = WebSocketManager.getInstance();

    // Subscribe to timestamp updates
    this.pubSub.subscribe<TimestampPayload>('video:timestamp_updated', this.handleTimestampUpdate);
  }

  private handleTimestampUpdate = (data: TimestampPayload) => {
    // Synchronize video timestamp across clients
    this.updateLocalVideoTimestamp(data);
  }

  private updateLocalVideoTimestamp(payload: TimestampPayload) {
    // Example: Update video player timestamp
    const videoElement = document.getElementById(payload.video_id) as HTMLVideoElement;
    if (videoElement) {
      videoElement.currentTime = payload.timestamp;
    }
  }

  // Method to broadcast current timestamp
  broadcastTimestamp(videoId: string, timestamp: number) {
    this.wsManager.sendMessage({
      type: 'video:timestamp_updated',
      video_id: videoId,
      timestamp: timestamp
    });
  }

  // Subscribe to a specific video
  subscribeToVideo(videoId: string) {
    this.wsManager.sendMessage({
      type: 'video:subscribe',
      video_id: videoId
    });
  }
}