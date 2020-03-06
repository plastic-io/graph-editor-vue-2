import {UIVector, ChangeEvent, newId} from "./mutations"; // eslint-disable-line
import {diff} from "deep-diff";
const artifactPrefix = "artifacts/";
const eventsPrefix = "events/";
export default {
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
        const vector = context.state.graph.vectors.find((v: UIVector) => v.id === vectorId);
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
            if (/Resource not found/.test(err.toString())) {
                console.warn("No preferences found, writing defaults.");
                await context.state.dataProviders.publish.set("preferences", {
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
    setLoadingStatus(context: any, e: {
        [key: string]: boolean;
    }) {
        context.commit("setLoadingStatus", e);
    },
    setDataProviders(context: any, e: {
        [key: string]: any;
    }) {
        context.commit("setDataProviders", e);
    },
    clearError(context: any, e: Error) {
        context.commit("clearError", e);
    },
    raiseError(context: any, e: Error) {
        context.commit("raiseError", e);
    },
    async remoteEvent(context: any, e: any) {
        console.log("remoteEvent", context, e);
    },
    create(context: any) {
        console.log("create");
        const e = {
            id: newId(),
            version: 0,
            vectors: [],
            properties: {
                name: "",
                description: "",
                createdBy: "",
                tags: [],
                createdOn: Date.now(),
                lastUpdate: Date.now(),
                height: 150,
                width: 300
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
        await context.state.dataProviders.graph.delete(artifactPrefix + item.id + "." + item.version);
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
        console.log("savePreferences", context.state.preferences);
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
        console.info("saving");
        if (!context.state.dataProviders.asyncUpdate) {
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
    async open(context: any, e: {graphId: string, vectorUrl: string}) {
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
    },
    async addItem(context: any, e: any) {
        let item, er;
        try {
            console.log(artifactPrefix + e.id + "." + e.version);
            item = await context.state.dataProviders.publish.get(artifactPrefix + e.id + "." + e.version);
        } catch (err) {
            er = err;
        }
        if (!item) {
            context.commit("raiseError", new Error("Cannot open item. " + er));
        } else {
            e.item = item;
            context.commit(e.type === "publishedVector" ? "addVectorItem" : "addGraphItem", e);
            context.dispatch("save");
        }
    },
    changeConnectorOrder(context: any, e: {vectorId: string, connectorId: string, direction: string}) {
        context.commit("changeConnectorOrder", e);
        context.dispatch("save");
    },
    deleteConnector(context: any, e: {id: string}) {
        context.commit("deleteConnector", e);
        context.dispatch("save");
    },
    updateVectorFields(context: any, e: UIVector) {
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
    pasteVectors(context: any, e: UIVector[]) {
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
