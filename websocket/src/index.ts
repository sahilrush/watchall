import WebSocket, { WebSocketServer } from 'ws';
import Redis from 'ioredis';

interface SubscribeMessage {
  type: 'video:subscribe' | 'video:unsubscribe';
  video_id: string;
}

interface TimestampMessage {
  type: 'video:timestamp_updated';
  timestamp: number;
  user_id: string;
  video_id: string;
}

type IncomingMessage = SubscribeMessage;

const wss = new WebSocketServer({ port: 8080 });

const redis = new Redis();

redis.subscribe('video:timestamp_updated');

wss.on('connection', (ws) => {
  console.log('New client connected');

  ws.on('message', (message: WebSocket.RawData) => {
    try {
      const data: IncomingMessage = JSON.parse(message.toString());

      if (data.type === 'video:subscribe') {
        console.log(`Client subscribed to video: ${data.video_id}`);
        redis.publish('video:subscribe', JSON.stringify(data)); 
      }

      else if (data.type === 'video:unsubscribe') {
        console.log(`Client unsubscribed from video: ${data.video_id}`);
        redis.publish('video:unsubscribe', JSON.stringify(data)); 
      }
    } catch (error) {
      console.error('Invalid message format:', error);
    }
  });

  redis.on('message', (channel: string, message: string) => {
    if (channel === 'video:timestamp_updated') {
      const data: TimestampMessage = JSON.parse(message);
      ws.send(JSON.stringify(data)); // Send timestamp update to client
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

console.log('WebSocket server running on ws://localhost:8080');
