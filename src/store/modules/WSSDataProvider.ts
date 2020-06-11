import {newId} from "../mutations"; // eslint-disable-line
import HTTPDataProvider from "./HTTPDataProvider";
const CHUNK_SIZE = 35000;
export default class WSSDataProvider {
    asyncUpdate: boolean;
    httpUrl: string;
    wssUrl: string;
    keepOpen: boolean;
    chunks: any;
    httpDataProvider: HTTPDataProvider;
    webSocket: WebSocket;
    state: string;
    messages: any[];
    message: (e: any) => void;
    open: () => void;
    close: () => void;
    events: any;
    subscriptions: string[];
    constructor(wssUrl: string, httpUrl: string, message: (e: any) => void, open: () => void, close: () => void) {
        if (!wssUrl) {
            throw new Error("No wssUrl was passed to WSSDataProvider");
        }
        if (!httpUrl) {
            throw new Error("No httpUrl was passed to WSSDataProvider");
        }
        this.asyncUpdate = true;
        this.events = {};
        this.chunks = {};
        this.messages = [];
        this.keepOpen = true;
        this.wssUrl = wssUrl;
        this.httpUrl = httpUrl;
        this.message = message;
        this.open = open;
        this.close = close;
        this.subscriptions = [];
        this.state = "connecting";
        this.keepOpen = true;
        this.httpDataProvider = new HTTPDataProvider(this.httpUrl);
        this.webSocket = new WebSocket(this.wssUrl);
        this.connect();
    }
    send(e: any) {
        if (this.state !== "open") {
            return this.messages.push(e);
        }
        const value = JSON.stringify(e);
        this.webSocket.send(value);
    }
    connect() {
        if (this.state === "closed") {
            this.state = "connecting";
            this.webSocket = new WebSocket(this.wssUrl);
        }
        this.webSocket.addEventListener("open", () => {
            this.state = "open";
            this.open();
            while (this.messages.length > 0) {
                this.send(this.messages.shift());
            }
            this.subscriptions.forEach((channelId) => {
                this.subscribe(channelId, null);
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
    messageHandler(e: any) {
        if (e.chunkCollectionId) {
            this.chunks[e.chunkCollectionId] = this.chunks[e.chunkCollectionId] || [];
            this.chunks[e.chunkCollectionId].push(e);
            if (this.chunks[e.chunkCollectionId].length === e.parts) {
                const msg: any[] = [];
                this.chunks[e.chunkCollectionId].sort((a: any, b: any) => {
                    return a.part - b.part;
                }).forEach((chunk: any) => {
                    msg.push(chunk.value);
                });
                this.messageHandler(JSON.parse(msg.join("")));
            }
            return;
        }
        if (e.unsubscribed) {
            const idx = this.subscriptions.indexOf(e.unsubscribed);
            if (idx !== -1) {
                this.subscriptions.splice(idx, 1);
            }
        }
        if (e.messageId && typeof this.events[e.messageId] === "function") {
            this.events[e.messageId](e.response);
        }
        if (e.subscribed && this.subscriptions.indexOf(e.subscribed) === -1) {
            this.subscriptions.push(e.subscribed);
        }
        if (e.channelId) {
            if (this.events[e.channelId]) {
                this.events[e.channelId].forEach((listener: any) => {
                    listener(e.response);
                });
            }
        }
        this.message(e);
    }
    disconnect() {
        this.keepOpen = false;
        this.webSocket.close();
    }
    subscribe(channelId: string, listener: ((e: any) => void) | null) {
        if (listener) {
            if (!this.events[channelId]) {
                this.events[channelId] = [];
            }
            this.events[channelId].push(listener);
        }
        this.send({
            action: "subscribe",
            channelId,
        });
    }
    unsubscribe(channelId: string, listener: (e: any) => void) {
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
    async listSubscribers(channelId: string) {
        return new Promise((success) => {
            const value = {
                messageId: newId(),
                action: "listSubscribers",
                channelId,
            };
            this.send(value);
            this.events[value.messageId] = success;
        });
    }
    async listSubscriptions(connectionId: string) {
        return new Promise((success) => {
            const value = {
                messageId: newId(),
                action: "listSubscriptions",
                connectionId,
            };
            this.send(value);
            this.events[value.messageId] = success;
        });
    }
    sendToAll(value: any) {
        this.send({
            action: "sendToAll",
            value,
        });
    }
    sendToChannel(channelId: string, e: {value: any, channelId: string}) {
        this.send({
            action: "sendToChannel",
            value: e.value,
            channelId: e.channelId,
        });
    }
    sendToConnection(connectionId: string, e: {value: any, connectionId: string}) {
        this.send({
            action: "sendToConnection",
            value: e.value,
            connectionId: e.connectionId,
        });
    }
    get(url: string) {
        return new Promise((success) => {
            let version = "latest";
            const projectionReg = /graphs\/([^/]+)\/projections\/[^.]+\.(\d+)/;
            if (projectionReg.test(url)) {
                version = url.replace(projectionReg, "$2");
                url = url.replace(projectionReg, "$1");
            }
            const value = {
                action: "getGraph",
                id: url,
                version,
                messageId: newId(),
            };
            this.send(value);
            this.events[value.messageId] = (e: any) => {
                success(e);
            };
        });
    }
    delete(url: string) {
        this.send({
            action: "deleteGraph",
            id: url,
        });
    }
    async set(url: string, value: any) {
        // can be three things, changes, published graph, published vector
        if ("changes" in value) {
            const valueLen = JSON.stringify(value).length;
            if (valueLen > CHUNK_SIZE) {
                try {
                    const response = await this.httpDataProvider.set("addEvent", JSON.stringify({
                        action: "addEvent",
                        event: value,
                    }));
                    this.messageHandler(response);
                } catch (err) {
                    throw new Error("Cannot write event via HTTP POST: " + err);
                }
                return;
            }
            this.send({
                action: "addEvent",
                event: value
            });
        } else if ("vector" in value) {
            this.send({
                action: "publishVector",
                graphId: value.vector.graphId,
                vectorId: value.vector.id,
                version: value.vector.version,
                messageId: newId(),
            });
        } else if ("graph" in value) {
            this.send({
                action: "publishGraph",
                id: value.graph.id,
                version: value.graph.version,
                messageId: newId(),
            });
        }
    }
}
