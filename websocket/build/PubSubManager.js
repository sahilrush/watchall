"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PubSubManager = void 0;
class PubSubManager {
    constructor() {
        this.subscribers = new Map();
    }
    static getInstance() {
        if (!PubSubManager.instance) {
            PubSubManager.instance = new PubSubManager();
        }
        return PubSubManager.instance;
    }
    // Subscribe to a specific event topic
    subscribe(topic, callback) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, new Set());
        }
        const topicSubscribers = this.subscribers.get(topic);
        topicSubscribers.add(callback);
        // Return an unsubscribe function
        return () => {
            topicSubscribers.delete(callback);
            if (topicSubscribers.size === 0) {
                this.subscribers.delete(topic);
            }
        };
    }
    publish(topic, data) {
        const topicSubscribers = this.subscribers.get(topic);
        if (topicSubscribers) {
            topicSubscribers.forEach(subscriber => {
                try {
                    subscriber(data);
                }
                catch (error) {
                    console.error(`Error in subscriber for logic ${topic}:`, error);
                }
            });
        }
    }
}
exports.PubSubManager = PubSubManager;
