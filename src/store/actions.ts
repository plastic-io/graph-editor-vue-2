import {UIVector} from "./mutations"; // eslint-disable-line
export default {
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
