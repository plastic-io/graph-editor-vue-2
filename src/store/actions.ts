import {newId} from "./mutations"; // eslint-disable-line
import {diff} from "deep-diff";
import Scheduler, {LoadEvent, Warning, Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
const artifactPrefix = "artifacts/";
const eventsPrefix = "events/";
export default {
    importItem(context: any, e: any) {
        console.log("importItem", e);
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
        scheduler.addEventListener("beginedge", (e) => {
            if ("field" in e) {
                context.commit("connectorActivity", {
                    key: e.graphId + e.vectorId + e.field,
                    start: Date.now(),
                    event: e,
                });
                if (context.state.preferences.debug) {
                    context.commit("setLoadingStatus", {
                        key: e.graphId + e.vectorId + e.field,
                        type: "edge",
                        loading: true,
                        event: e,
                    });
                    context.commit("addLogItem", {eventName: "edge", event: e});
                }
            }
        });
        scheduler.addEventListener("endedge", (e) => {
            if ("field" in e) {
                const now = Date.now();
                context.commit("connectorActivity", {
                    key: e.graphId + e.vectorId + e.field,
                    end: Date.now(),
                    duration: now - context.state.activityConnectors[e.graphId + e.vectorId + e.field].start,
                    event: e,
                });
                if (context.state.preferences.debug) {
                    context.commit("setLoadingStatus", {
                        key: e.graphId + e.vectorId + e.field,
                        type: "edge",
                        loading: false,
                    });
                    context.commit("addLogItem", {eventName: "edge", event: e});
                }
            }
        });
        scheduler.addEventListener("set", (e) => {
            if (context.state.preferences.debug) {
                context.commit("addLogItem", {eventName: "set", event: e});
            }
        });
        scheduler.addEventListener("error", (e) => {
            if ("err" in e && e.err) {
                context.commit("addSchedulerError", {key: e.vectorId, error: e.err});
                context.commit("addLogItem", {eventName: "error", event: e});
                context.commit("raiseError", new Error("Graph Scheduler Error: " + e.err!.message));
            }
        });
        scheduler.addEventListener("warning", (e) => {
            if ("message" in e) {
                context.commit("addLogItem", {eventName: "warning", event: e});
                context.commit("raiseError", new Error("Graph Scheduler Warning: " + e.message));
            }
        });
        scheduler.addEventListener("load", async (e): Promise<any> => {
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
                    preferences: context.state.preferences,
                });
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
            toc = await context.state.dataProviders.graph.get("toc.json");
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
        await context.state.dataProviders.graph.delete(eventsPrefix + graphId);
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
        const graph = e || context.state.graph;
        const changes = diff(context.state.remoteSnapshot, graph);
        if (!changes) {
            return;
        }
        context.commit("setLoadingStatus", {
            key: graph.id,
            type: "saveGraph",
            loading: true,
        });
        if (!context.state.dataProviders.graph.asyncUpdate) {
            if (context.state.graph) {
                changes.push({
                    kind: "E",
                    path: ["version"],
                    lhs: graph.version,
                    rhs: graph.version + 1,
                });
                context.commit("setGraphVersion", graph.version + 1);
            }
        }
        await context.state.dataProviders.graph.set(graph.id, {
            changes,
            id: newId(),
        });
        context.commit("setLoadingStatus", {
            key: graph.id,
            type: "saveGraph",
            loading: false,
        });
        context.dispatch("getToc");
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
            context.dispatch("save");
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