import {newId} from "../../store/mutations"; // eslint-disable-line
import {diff, applyChange} from "deep-diff";
import * as Automerge from "automerge";
import HTTPDataProvider from "./HTTPDataProvider";
const CHUNK_SIZE = 35000;
interface GraphDiff {
    userId: string,
    workstationId: string,
    changes: any
}
export default class WSSDataProvider {
    asyncUpdate: boolean;
    httpUrl: string;
    wssUrl: string;
    keepOpen: boolean;
    remoteDocument: any;
    currentDocument: any;
    chunks: any;
    httpDataProvider: HTTPDataProvider;
    webSocket: WebSocket;
    token = "";
    userId = newId();
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
        this.currentDocument = null;
        this.remoteDocument = null;
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
    setUserId(userId: string) {
        this.userId = userId;
    }
    setToken(token: string) {
        this.token = token;
        this.httpDataProvider.setToken(token);
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
                    if (/graph-event-/.test(e.channelId)) {
                        console.log("receiving automerge changes");
                        // translate Automerge CRDT messages into deep-diff changes
                        const newDoc = Automerge.applyChanges(this.remoteDocument, e.response[0].changes);
                        e.response[0].changes = diff(this.remoteDocument, newDoc);
                        this.remoteDocument = newDoc;
                    }
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
    async deploy(args: any) {
        return new Promise((success) => {
            const value = {
                messageId: newId(),
                action: "deploy",
                env: args.env,
                version: args.version,
                id: args.id,
            };
            this.send(value);
            this.events[value.messageId] = success;
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
                if (version === "latest") {
                    console.log("loading automerge document");
                    // autodetect and instantiate an automerge instance on document open
                    // HACK: must re-stringify this message to avoid complexity in outer handler for now
                    this.remoteDocument = Automerge.load(e, {freeze: true});
                    this.currentDocument = this.remoteDocument;
                    e = JSON.parse(JSON.stringify(this.remoteDocument));
                }
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
    async setChanges(value: GraphDiff) {
        console.log("setting graph changes");
        const isNewDocument = !this.remoteDocument;
        // # transform local deep-diff OT changes into Automerge CRDT changes
        if (isNewDocument) {
            console.log("new document");
            // if this is a new document, instantiate it now and send up the save body
            this.remoteDocument = Automerge.init(value.workstationId);
        }
        // send up changes
        console.log("change doc", this.remoteDocument);
        const newDoc = Automerge.change(this.remoteDocument, "change", (doc: any) => {
            console.log("in change doc", doc);
            value.changes.forEach((change: any) => {
                applyChange(doc, true, change);
            });
        });
        const docChanges = Automerge.getChanges(this.remoteDocument, newDoc);
        this.currentDocument = newDoc;
        value.changes = isNewDocument ? Automerge.save(this.remoteDocument) : docChanges;
        // check length for transport selection (https/wss)
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
    }
    async set(url: string, value: any) {
        // can be three things, changes, published graph, published vector
        if ("changes" in value) {
            await this.setChanges(value);
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
