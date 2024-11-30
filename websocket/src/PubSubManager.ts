type Subscriber<T> = (data: T) => void;

export class PubSubManager {
  private static instance: PubSubManager;
  private subscribers: Map<string, Set<Subscriber<any>>> = new Map();

  private constructor() {}

  public static getInstance(): PubSubManager {
    if (!PubSubManager.instance) {
      PubSubManager.instance = new PubSubManager();
    }
    return PubSubManager.instance;
  }

  // Subscribe to a specific event topic
  public subscribe<T>(topic: string, callback: Subscriber<T>): () => void {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    
    const topicSubscribers = this.subscribers.get(topic)!;
    topicSubscribers.add(callback);

    // Return an unsubscribe function
    return () => {
      topicSubscribers.delete(callback);
    
        
      if(topicSubscribers.size === 0) {
        this.subscribers.delete(topic);
      }
    
    }
  }

  public publish<T>(topic:string, data:T): void {
    const topicSubscribers = this.subscribers.get(topic);

    if(topicSubscribers) {
        topicSubscribers.forEach(subscriber => {
            try{
                subscriber(data);
            }catch(error){
                console.error(`Error in subscriber for logic ${topic}:`, error)
            }
        })
    }
  }

  }