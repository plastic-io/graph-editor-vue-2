import {newId, replacer} from "./mutations"; // eslint-disable-line
import {diff} from "deep-diff";
import Hashes from "jshashes";
import Scheduler, {ConnectorEvent, LoadEvent, Warning, Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
const artifactPrefix = "artifacts/";
export default {
    subscribeToGraphEvents(context: any, e: any) {
        const chGraphEvents = "graph-event-" + e.graphId;
        const chGraphUsers = "graph-users-" + e.graphId;
        const chGraphMouse = "graph-mouse-" + e.graphId;
        const chGraphChat = "graph-chat-" + e.graphId;
        context.state.dataProviders.graph.subscribe(chGraphEvents, (ev: any) => {
            ev.forEach((event: any) => {
                context.commit("remoteChangeEvents", event);
            });
        });
        context.state.dataProviders.graph.subscribe(chGraphUsers, (ev: any) => {
            context.commit("updateGraphUsers", ev);
        });
        context.state.dataProviders.graph.subscribe(chGraphMouse, (ev: any) => {
            context.commit("updateGraphMouse", ev);
        });
        context.state.dataProviders.graph.subscribe(chGraphChat, (ev: any) => {
            context.commit("updateGraphChat", ev);
        });
        const sendMouseTelemetry = () => {
            setTimeout(sendMouseTelemetry, context.state.mouseTransmitInterval);
            if (context.state.mouseMovements.length === 0) {
                return;
            }
            const data = {
                channelId: chGraphMouse,
                value: {
                    workstationId: context.state.preferences.workstationId,
                    userName: context.state.preferences.userName,
                    avatar: context.state.preferences.avatar,
                    movements: context.state.mouseMovements,
                }
            };
            context.state.dataProviders.graph.sendToChannel(chGraphMouse, data);
            context.commit("resetMouseTelemetry");
        };
        setTimeout(sendMouseTelemetry, context.state.mouseTransmitInterval);
        // send a heartbeat to the other users
        setTimeout(() => {
            const heartBeat = () => {
                const data = {
                    channelId: chGraphUsers,
                    value: {
                        workstationId: context.state.preferences.workstationId,
                        userName: context.state.preferences.userName,
                        avatar: context.state.preferences.avatar,
                    }
                };
                context.state.dataProviders.graph.sendToChannel(chGraphUsers, data);
                setTimeout(heartBeat, context.state.heartBeatInterval);
            };
            heartBeat();
        }, 500);
    },
    setConnectionState(context: any, e: any) {
        context.commit("setConnectionState", e.state);
    },
    async setGraphVector(context: any, o: any) {
        const vector = context.state.graphReferences[o.vectorRef];
        const hostVector = context.state.graphReferences[o.hostVectorRef];
        const e = {
            event: o.event,
            vector,
            hostVector,
            context,
        };
        context.state.scheduler.instance.url(hostVector.url, e, "$url", null);
    },
    async subscribePreferences(context: any) {
        await context.state.dataProviders.preferences.subscribe("preferences", (e: any) => {
            if (e.type === "preferences") {
                context.commit("setPreferences", e.preferences);
            }
        });
    },
    async subscribeToc(context: any) {
        await context.state.dataProviders.notification.subscribe("toc.json", (e: any) => {
            if (e.type === "toc") {
                context.commit("setToc", e.toc);
            }
        });
    },
    async subscribe(context: any, e: {channelId: string, callback: (err: any, data: any) => void}) {
        await context.state.dataProviders.notification.subscribe(e.channelId, (ev: any) => {
            e.callback(null, ev);
        });
    },
    async getPublicRegistry(context: any, e: any) {
        const relPath = /^\.\//;
        let url = e.url;
        if (e.parent.url && relPath.test(e.url)) {
            url = e.url.replace(relPath, e.parent.url + "/");
        }
        const data = await fetch(url);
        const responseJson = await data.json();
        if (responseJson.items) {
            responseJson.url = url;
            context.commit("setRegistry", {
                parent: e.parent,
                toc: responseJson,
                url: e.url,
            });
            responseJson.items.forEach((item: any) => {
                if (item.type === "toc") {
                    item.url = url;
                    context.dispatch("getPublicRegistry", {
                        url: item.artifact,
                        parent: item,
                    });
                }
                if (item.items) {
                    item.items.forEach((subItem: any) => {
                        if (subItem.type === "publishedVector" || subItem.type === "publishedGraph") {
                            if (url && relPath.test(subItem.artifact)) {
                                subItem.url = subItem.artifact.replace(relPath, url.substring(0, url.lastIndexOf("/")) + "/");
                            }
                        }
                    });
                }
            });
        }
    },
    async download(context: any, e: any) {
        let item;
        try {
            if (e.type === "graph") {
                item = await context.state.dataProviders.graph.get(e.id);
            } else {
                item = await context.state.dataProviders.publish.get(artifactPrefix + e.id + "." + e.version);
            }
        } catch (er) {
            context.commit("raiseError", new Error("Cannot open item to download." + er));
            return;
        }
        const a = document.createElement("a");
        const name = e.name || "Untitled";
        const dataPrefix = `data:${context.state.jsonMimeType};charset=utf-8,`;
        a.setAttribute("href", dataPrefix + encodeURIComponent(JSON.stringify(item)));
        a.setAttribute("download", `${name}_${e.id}_${e.version}_${e.type}.json`);
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    },
    instantiateGraph(context: any) {
        const logger = {
            log: (e: any) => {
                context.commit("addLogItem", {eventName: "log", event: e});
            },
            info: (e: any) => {
                if (/Executing vector at URL/.test(e.toString()) && !context.state.preferences.debug) {
                    return;
                }
                context.commit("addLogItem", {eventName: "info", event: e});
            },
            debug: (e: any) => {
                if (context.state.preferences.debug) {
                    context.commit("addLogItem", {eventName: "debug", event: e});
                }
            },
            error: (e: any) => {
                context.commit("addLogItem", {eventName: "logError", event: e});
            },
            warn: (e: any) => {
                context.commit("addLogItem", {eventName: "warn", event: e});
            },
        };
        const scheduler = new Scheduler(context.state.graph, context, context.state.scheduler.state, logger);
        const instanceId = newId();
        scheduler.addEventListener("beginconnector", (e: any) => {
            context.commit("connectorActivity", {
                key: e.connector.id,
                start: Date.now(),
                event: e,
            });
            if (context.state.preferences.debug) {
                context.commit("setLoadingStatus", {
                    key: e.connector.id,
                    type: "connector",
                    loading: true,
                    event: e,
                });
                context.commit("addLogItem", {eventName: "connector", event: e});
            }
        });
        scheduler.addEventListener("endconnector", (e: any) => {
            const now = Date.now();
            const startConnector = context.state.activityConnectors[e.connector.id];
            const duration = startConnector ? now - startConnector.start : "";
            context.commit("connectorActivity", {
                key: e.connector.id,
                end: Date.now(),
                duration,
                event: e,
            });
            if (context.state.preferences.debug) {
                context.commit("setLoadingStatus", {
                    key: e.connector.id,
                    type: "connector",
                    loading: false,
                });
                context.commit("addLogItem", {eventName: "connector", event: e});
            }
        });
        scheduler.addEventListener("set", (e: any) => {
            const comp = context.getters.getGraphReference(e.vectorInterface.vector.__contextId);
            e.setContext({
                props: comp.vectorProps[comp.vector.__contextId],
                component: comp,
            });
        });
        scheduler.addEventListener("afterSet", (e: any) => {
            if (context.state.preferences.debug) {
                context.commit("addLogItem", {eventName: "set", event: e});
            }
        });
        scheduler.addEventListener("error", (e: any) => {
            if ("err" in e && e.err) {
                context.commit("addSchedulerError", {key: e.vectorId, error: e.err});
                context.commit("addLogItem", {eventName: "error", event: e});
                context.commit("raiseError", new Error("Graph Scheduler Error: " + e.err!.message));
            }
        });
        scheduler.addEventListener("warning", (e: any) => {
            if ("message" in e) {
                context.commit("addLogItem", {eventName: "warning", event: e});
                context.commit("raiseError", new Error("Graph Scheduler Warning: " + e.message));
            }
        });
        scheduler.addEventListener("load", async (e: any): Promise<any> => {
            if ("setValue" in e) {
                const pathParts = e.url.split("/");
                const itemId = pathParts[2].split(".")[0];
                const itemVersion = pathParts[2].split(".")[1];
                const itemType = pathParts[1];
                context.commit("addLogItem", {eventName: "load", event: e});
                if (itemType === "graph" && itemId === context.state.graph.id) {
                    return e.setValue(context.state.graph);
                }
                const item = await context.state.dataProviders.publish.get(artifactPrefix + itemId + "." + itemVersion);
                e.setValue(item);
            }
        });
        scheduler.addEventListener("begin", (e) => {
            context.commit("setLoadingStatus", {
                key: context.state.graph.id + instanceId,
                type: "graphUrl",
                loading: true,
            });
            context.commit("addLogItem", {eventName: "begin", event: e});
        });
        scheduler.addEventListener("end", (e) => {
            context.commit("setLoadingStatus", {
                key: context.state.graph.id + instanceId,
                type: "graphUrl",
                loading: false,
            });
            context.commit("addLogItem", {eventName: "end", event: e});
        });
        context.commit("setScheduler", scheduler);
    },
    async graphUrl(context: any, url: string) {
        context.state.scheduler.instance.url(url);
    },
    async publishGraph(context: any) {
        const graph = context.state.graph;
        context.commit("setLoadingStatus", {
            key: graph.id,
            type: "publishGraph",
            loading: true,
        });
        await context.state.dataProviders.publish.set(graph.id, {
            graph,
            id: newId(),
        });
        context.commit("setLoadingStatus", {
            key: graph.id,
            type: "publishGraph",
            loading: false,
        });
        context.dispatch("getToc");
    },
    async publishVector(context: any, vectorId: string) {
        const vector = context.state.graph.vectors.find((v: Vector) => v.id === vectorId);
        context.commit("setLoadingStatus", {
            key: vector.id,
            type: "publishVector",
            loading: true,
        });
        await context.state.dataProviders.publish.set(vector.id, {
            vector: {
                ...vector,
                version: context.state.graph.version,
            },
            id: newId(),
        });
        context.commit("setLoadingStatus", {
            key: vector.id,
            type: "publishVector",
            loading: false,
        });
        context.dispatch("getToc");
    },
    async getPreferences(context: any) {
        let preferences;
        try {
            preferences = await context.state.dataProviders.preferences.get("preferences");
        } catch (err) {
            if (/not found/.test(err.toString())) {
                console.warn("No preferences found, writing defaults.");
                await context.state.dataProviders.preferences.set("preferences", {
                    preferences: context.state.originalPreferences,
                });
                context.commit("setPreferences", context.state.originalPreferences);
                return;
            }
        }
        context.commit("setPreferences", preferences);
    },
    async getToc(context: any) {
        let toc, er;
        context.commit("setLoadingStatus", {
            key: "toc",
            type: "toc",
            loading: true,
        });
        try {
            toc = await context.state.dataProviders.publish.get("toc.json");
        } catch (err) {
            er = err;
            if (/not found/.test(er.toString())) {
                console.warn("No TOC file found.  Creating empty TOC file.");
                toc = {};
                er = null;
            }
        }
        if (!toc) {
            context.commit("raiseError", new Error("Cannot open toc. " + er));
        }
        context.commit("setLoadingStatus", {
            key: "toc",
            type: "toc",
            loading: false,
        });
        context.commit("setToc", toc);
    },
    create(context: any) {
        const e = {
            id: newId(),
            version: 0,
            vectors: [],
            properties: {
                name: "",
                description: "",
                icon: "mdi-graph",
                createdBy: "",
                tags: [],
                createdOn: Date.now(),
                lastUpdate: Date.now(),
                height: 150,
                width: 300,
                startInPresentationMode: false,
            }
        };
        context.dispatch("save", e);
    },
    async removeArtifact(context: any, item: any) {
        context.commit("setLoadingStatus", {
            key: item.id,
            type: "removeItem",
            loading: true,
        });
        await context.state.dataProviders.publish.delete(artifactPrefix + item.id + "." + item.version);
        context.commit("setLoadingStatus", {
            key: item.id,
            type: "removeItem",
            loading: false,
        });
        context.dispatch("getToc");
    },
    async remove(context: any, graphId: any) {
        context.commit("setLoadingStatus", {
            key: graphId,
            type: "removeGraph",
            loading: true,
        });
        await context.state.dataProviders.graph.delete(graphId);
        context.commit("setLoadingStatus", {
            key: graphId,
            type: "removeGraph",
            loading: false,
        });
        context.dispatch("getToc");
    },
    async savePreferences(context: any) {
        context.commit("setLoadingStatus", {
            key: 0,
            type: "savePreferences",
            loading: true,
        });
        await context.state.dataProviders.preferences.set("preferences", {preferences: context.state.preferences});
        context.commit("setLoadingStatus", {
            key: 0,
            type: "savePreferences",
            loading: true,
        });
    },
    async save(context: any, e?: any) {
        if (e !== undefined) {
            context.commit("resetLoadedState", e);
        }
        const changes = diff(JSON.parse(JSON.stringify(context.state.remoteSnapshot, replacer)), JSON.parse(JSON.stringify(context.state.graph, replacer)));
        if (!changes) {
            return;
        }
        context.commit("setLoadingStatus", {
            key: context.state.graph.id,
            type: "saveGraph",
            loading: true,
        });
        // in a server data provider, the server would increment the version
        // and transmit that result back to us via subscribe callback
        // but on local host (!asyncUpdate) the localStore will not emit
        // the localStore observer if you are the writer, unlike a server
        // so to simulate a server, this block is here incrementing the version
        // on the client as if it was the server to get around the lack of a
        // round trip with a new version number.
        if (!context.state.dataProviders.graph.asyncUpdate) {
            const preVersionSnapshot = JSON.parse(JSON.stringify(context.state.graph, replacer));
            context.commit("setGraphVersion", context.state.graph.version + 1);
            const versionChanges = diff(preVersionSnapshot, JSON.parse(JSON.stringify(context.state.graph, replacer)));
            Array.prototype.push.apply(changes, versionChanges as any[]);
        }
        // calculate CRC
        const calcState = JSON.stringify(context.state.graph, replacer);
        const crc = Hashes.CRC32(calcState);
        await context.state.dataProviders.graph.set(context.state.graph.id, {
            graphId: context.state.graph.id,
            crc,
            changes,
            graph: context.state.graph,
            id: newId(),
        });
        // when using a async data source (server), apply changes to the remote locally to prevent re-save
        if (context.state.dataProviders.graph.asyncUpdate) {
            context.commit("setGraphVersion", context.state.graph.version);
        }
        context.commit("setLoadingStatus", {
            key: context.state.graph.id,
            type: "saveGraph",
            loading: false,
        });
    },
    async open(context: any, e: {graphId: string}) {
        let graph, er;
        context.commit("setLoadingStatus", {
            key: e.graphId,
            type: "graph",
            loading: true,
        });
        try {
            graph = await context.state.dataProviders.graph.get(e.graphId);
        } catch (err) {
            er = err;
        }
        if (!graph) {
            context.commit("raiseError", new Error("Cannot open graph. " + er));
        }
        context.commit("setLoadingStatus", {
            key: e.graphId,
            type: "graph",
            loading: false,
        });
        if (context.state.dataProviders.graph.asyncUpdate) {
            context.dispatch("subscribeToGraphEvents", e);
        }
        context.commit("open", graph);
        context.dispatch("instantiateGraph");
    },
    async addItem(context: any, e: any) {
        let item, er;
        if (e.url) {
            try {
                item = await fetch(e.url);
                item = await item.json();
            } catch (err) {
                er = err;
            }
        } else {
            try {
                item = await context.state.dataProviders.publish.get(artifactPrefix + e.id + "." + e.version);
            } catch (err) {
                er = err;
            }
        }
        if (!item || er) {
            context.commit("raiseError", new Error("Cannot open item. " + er));
        } else {
            e.item = item;
            context.commit(e.type === "publishedVector" ? "addVectorItem" : "addGraphItem", e);
        }
    },
    // simple actions with multiple commits or dispatches (or plans for such)
    setLoadingStatus(context: any, e: {
        [key: string]: boolean;
    }) {
        context.commit("setLoadingStatus", e);
        // dispatch loading status remotely
    },
    setDataProviders(context: any, e: {
        [key: string]: any;
    }) {
        context.commit("setDataProviders", e);
        // allow global data provider hook
    },
    clearError(context: any, e: Error) {
        context.commit("clearError", e);
        // dispatch clear error status remotely
    },
    raiseError(context: any, e: Error) {
        context.commit("raiseError", e);
        // dispatch raise error remotely
    },
    changeConnectorOrder(context: any, e: {vectorId: string, connectorId: string, direction: string}) {
        context.commit("changeConnectorOrder", e);
        context.dispatch("save");
    },
    deleteConnector(context: any, e: {id: string}) {
        context.commit("deleteConnector", e);
        context.dispatch("save");
    },
    updateVectorFields(context: any, e: Vector) {
        context.commit("updateVectorFields", e);
        context.dispatch("save");
    },
    createNewVector(context: any, e: any) {
        context.commit("createNewVector", e);
        context.dispatch("save");
    },
    updateGraphProperties(context: any, e: any) {
        context.commit("updateGraphProperties", e);
        context.dispatch("save");
    },
    updateVectorProperties(context: any, e: any) {
        context.commit("updateVectorProperties", e);
        context.dispatch("save");
    },
    changeInputOrder(context: any, e: any) {
        context.commit("changeInputOrder", e);
        context.dispatch("save");
    },
    changeOutputOrder(context: any, e: any) {
        context.commit("changeOutputOrder", e);
        context.dispatch("save");
    },
    addInput(context: any, e: any) {
        context.commit("addInput", e);
        context.dispatch("save");
    },
    addOutput(context: any, e: any) {
        context.commit("addOutput", e);
        context.dispatch("save");
    },
    removeInput(context: any, e: any) {
        context.commit("removeInput", e);
        context.dispatch("save");
    },
    removeOutput(context: any, e: any) {
        context.commit("removeOutput", e);
        context.dispatch("save");
    },
    updateTemplate(context: any, e: {id: string, key: string, value: string}) {
        context.commit("updateTemplate", e);
        context.dispatch("save");
    },
    undo(context: any) {
        context.commit("undo");
        context.dispatch("save");
    },
    redo(context: any) {
        context.commit("redo");
        context.dispatch("save");
    },
    moveHistoryPosition(context: any, index: number) {
        context.commit("moveHistoryPosition", index);
        context.dispatch("save");
    },
    duplicateSelection(context: any) {
        context.commit("duplicateSelection");
        context.dispatch("save");
    },
    pasteVectors(context: any, e: Vector[]) {
        context.commit("pasteVectors", e);
        context.dispatch("save");
    },
    bringForward(context: any) {
        context.commit("bringForward");
        context.dispatch("save");
    },
    sendBackward(context: any) {
        context.commit("sendBackward");
        context.dispatch("save");
    },
    bringToFront(context: any) {
        context.commit("bringToFront");
        context.dispatch("save");
    },
    sendToBack(context: any) {
        context.commit("sendToBack");
        context.dispatch("save");
    },
    groupSelected(context: any) {
        context.commit("groupSelected");
        context.dispatch("save");
    },
    ungroupSelected(context: any) {
        context.commit("ungroupSelected");
        context.dispatch("save");
    },
    deleteSelected(context: any) {
        context.commit("deleteSelected");
        context.dispatch("save");
    },
    hoveredPort(context: any, e: object) {
        context.commit("hoveredPort", e);
    },
    hoveredVector(context: any, e: object) {
        context.commit("hoveredVector", e);
    },
    selectConnector(context: any, e: object) {
        context.commit("selectConnector", e);
    },
    togglePresentation(context: any) {
        context.commit("setPresentation", !context.state.presentation);
    },
    toggleLock(context: any) {
        context.commit("setLock", !context.state.locked);
    },
    hoveredConnector(context: any, e: object) {
        context.commit("hoveredConnector", e);
    },
    translating(context: any, e: object) {
        context.commit("translating", e);
    },
    keyup(context: any, e: Event) {
        context.commit("keyup", e);
    },
    keydown(context: any, e: Event) {
        context.commit("keydown", e);
    },
    view(context: any, e: object) {
        context.commit("view", e);
    },
    mouse(context: any, e: object) {
        context.commit("mouse", e);
    },
    lut(context: any, e: object) {
        context.commit("lut", e);
    },
    graph(context: any, e: object) {
        context.commit("graph", e);
        context.dispatch("save");
    },
    preferences(context: any, e: object) {
        context.commit("setPreferences", e);
        context.dispatch("savePreferences");
    },
};
