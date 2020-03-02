import {UIVector, ChangeEvent, newId} from "./mutations"; // eslint-disable-line
import {diff} from "deep-diff";
export default {
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
    async create(context: any) {
        const e = {
            id: newId(),
            version: 0,
            vectors: [],
            properties: {
                name: "",
                description: "",
                createdBy: "",
                createdOn: Date.now(),
                lastUpdate: Date.now(),
                exportable: true,
                height: 150,
                width: 300
            }
        };
        context.dispatch("save", e);
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
    async save(context: any, e?: any) {
        const graph = e || context.state.graph;
        context.commit("setLoadingStatus", {
            key: graph.id,
            type: "saveGraph",
            loading: true,
        });
        const changes = diff(context.state.remoteSnapshot, graph);
        if (changes) {
            await context.state.dataProviders.graph.set(graph.id, {
                changes,
                id: newId(),
            });
            if (!context.state.dataProviders.asyncUpdate) {
                context.commit("setRemoteSnapshot", JSON.parse(JSON.stringify(graph)));
            }
        }
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
    changeConnectorOrder(context: any, e: {vectorId: string, connectorId: string, direction: string}) {
        context.commit("changeConnectorOrder", e);
    },
    deleteConnector(context: any, e: {id: string}) {
        context.commit("deleteConnector", e);
    },
    updateVectorNames(context: any, e: UIVector) {
        context.commit("updateVectorNames", e);
    },
    createNewVector(context: any) {
        context.commit("createNewVector");
    },
    updateGraphProperties(context: any, e: any) {
        context.commit("updateGraphProperties", e);
    },
    updateVectorProperties(context: any, e: any) {
        context.commit("updateVectorProperties", e);
    },
    changeInputOrder(context: any, e: any) {
        context.commit("changeInputOrder", e);
    },
    changeOutputOrder(context: any, e: any) {
        context.commit("changeOutputOrder", e);
    },
    addInput(context: any, e: any) {
        context.commit("addInput", e);
    },
    addOutput(context: any, e: any) {
        context.commit("addOutput", e);
    },
    removeInput(context: any, e: any) {
        context.commit("removeInput", e);
    },
    removeOutput(context: any, e: any) {
        context.commit("removeOutput", e);
    },
    updateTemplate(context: any, e: {id: string, key: string, value: string}) {
        context.commit("updateTemplate", e);
    },
    undo(context: any) {
        context.commit("undo");
    },
    redo(context: any) {
        context.commit("redo");
    },
    moveHistoryPosition(context: any, index: number) {
        context.commit("moveHistoryPosition", index);
    },
    duplicateSelection(context: any) {
        context.commit("duplicateSelection");
    },
    pasteVectors(context: any, e: UIVector[]) {
        context.commit("pasteVectors", e);
    },
    bringForward(context: any) {
        context.commit("bringForward");
    },
    sendBackward(context: any) {
        context.commit("sendBackward");
    },
    bringToFront(context: any) {
        context.commit("bringToFront");
    },
    sendToBack(context: any) {
        context.commit("sendToBack");
    },
    groupSelected(context: any) {
        context.commit("groupSelected");
    },
    ungroupSelected(context: any) {
        context.commit("ungroupSelected");
    },
    deleteSelected(context: any) {
        context.commit("deleteSelected");
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
    },
    preferences(context: any, e: object) {
        context.commit("preferences", e);
    },
};
