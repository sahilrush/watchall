import { PubSubManager } from "./PubSubManager";


export class WebSocketManager {
    private static instance : WebSocketManager;
    private socket:WebSocket | null = null;
    private pubSub:PubSubManager;

    private constructor() {
        this.pubSub = PubSubManager.getInstance();
    }

    public static getInstance(): WebSocketManager {
        if(!WebSocketManager.instance) {
            WebSocketManager.instance = new WebSocketManager();
        }
        return WebSocketManager.instance;
    }


    public connect(url:string):void{
        if(this.socket) {
            console.warn('weboscket is already connected guys')
            return
        }
        
        try{
            this.socket = new WebSocket(url);

            this.socket.addEventListener('open', this.handleOpen.bind(this));
            this.socket.addEventListener('message', this.handleMessage.bind(this));
            this.socket.addEventListener('close', this.handleClose.bind(this));

        }catch(error) {
            console.error('Failed to establish Websocket',error)
        }
    }

    private handleOpen(){
        this.pubSub.publish('websocket connected',null)
    }


    private handleMessage(event:MessageEvent) {
        try{
            const data = JSON.parse(event.data);

            this.pubSub.publish(data.type,data)
        }catch(error) {
            console.error('error parsing the messafe',error);
            this.socket = null;
        }
    }


    private handleClose(event:CloseEvent){
        this.pubSub.publish('websocket connection disconnedted', event)
    }




}