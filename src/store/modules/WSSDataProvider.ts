import {newId} from "../mutations"; // eslint-disable-line
export default class WSSDataProvider {
    asyncUpdate: boolean;
    url: string;
    keepOpen: boolean;
    webSocket: WebSocket;
    state: string;
    message: () => void;
    open: () => void;
    close: () => void;
    events: {
        [key: string]: Function[]; // tslint:disable-line
    };
    subscriptions: string[];
    constructor(url: string, message: () => void, open: () => void, close: () => void) {
        if (!url) {
            throw new Error("No url was passed to WSSDataProvider");
        }
        this.asyncUpdate = true;
        this.events = {};
        this.messages = [];
        this.keepOpen = true;
        this.url = url;
        this.message = message;
        this.open = open;
        this.close = close;
        this.subscriptions = [];
        this.connect();
    }
    send(message) {
        if (this.state !== "open") {
            return this.messages.push(message);
        }
        this.webSocket.send(JSON.stringify(message));
    }
    connect() {
        this.webSocket = new WebSocket(this.url);
        this.state = "connecting";
        this.keepOpen = true;
        this.webSocket.addEventListener("open", () => {
            this.state = "open";
            this.open();
            while (this.messages.length > 0) {
                this.send(this.messages.shift());
            }
            this.subscriptions.forEach((channelId) => {
                this.subscribe(channelId);
            });
        });
        this.webSocket.addEventListener("close", () => {
            this.state = "closed";
            this.close();
            if (this.keepOpen) {
                this.connect();
            }
        });
        this.webSocket.addEventListener("message", (e) => {
            const val = JSON.parse(e.data);
            this.messageHandler(val);
        });
    }
    messageHandler(e) {
        if (e.unsubscribed) {
            const idx = this.subscriptions.indexOf(e.unsubscribed);
            if (idx !== -1) {
                this.subscriptions.splice(idx, 1);
            }
        }
        if (e.requsetId && typeof this.events[e.requsetId] === "function") {
            this.events[e.requsetId](e.response);
        }
        if (e.subscribed && this.subscriptions.indexOf(e.subscribed) === -1) {
            this.subscriptions.push(e.subscribed);
        }
        this.message(e);
    }
    disconnect() {
        this.keepOpen = false;
        this.webSocket.close();
    }
    subscribe(channelId, listener) {
        if (!this.events[channelId]) {
            this.events[channelId] = [];
        }
        this.events[channelId].push(listener);
        this.send({
            action: "subscribe",
            channelId,
        });
    }
    unsubscribe(channelId, listener) {
        if (!this.events[channelId]) {
            return;
        }
        const idx = this.events[channelId].indexOf(listener);
        if (idx === -1) {
            return;
        }
        this.events[channelId].splice(idx, 1);
        this.send({
            action: "unsubscribe",
            channelId,
        });
    }
    listSubscribers(e, callback) {
        const value = {
            requestId: newId(),
            action: "listSubscribers",
            channelId: e,
        };
        this.send(value);
        this.events[value.requestId] = callback;
    }
    listSubscriptions(e, callback) {
        const value = {
            requestId: newId(),
            action: "listSubscriptions",
            connectionId: e,
        };
        this.send(value);
        this.events[value.requestId] = callback;
    }
    sendToAll(e) {
        this.send({
            action: "sendToAll",
            value: e,
        });
    }
    sendToChannel(channelId, e: {value: any, channelId: string}) {
        this.send({
            action: "sendToConnection",
            value: e.value,
            channelId: e.channelId,
        });
    }
    sendToConnection(connectionId, e: {value: any, connectionId: string}) {
        this.send({
            action: "sendToConnection",
            value: e.value,
            connectionId: e.connectionId,
        });
    }
    set(url: string, value: any) {
        console.log("set", url, value);
        // can be three things, changes, published graph, published vector
        if ("changes" in value) {
            this.send({
                action: "addEvent",
                event: value
            });
        } else if ("vector" in value) {
            this.send({
                action: "publishVector",
                artifact: value
            });
        } else if ("graph" in value) {
            this.send({
                action: "publishGraph",
                artifact: value
            });
        }
    }
    get(url: string) {
        console.log("connect", url);
    }
}
