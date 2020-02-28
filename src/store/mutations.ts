import {diff, applyChange, revertChange} from "deep-diff";
import mouse from "./modules/mouse";
import {keyup, keydown} from "./modules/keys";
export interface UIVector {
    id: string;
    edges: any[],
    properties: {
        groups: string[];
        x: number;
        y: number;
        z: number;
    };
}
export function applyGraphChanges(state: any, name: string) {
    const changes = diff(state.graph, state.graphSnapshot);
    if (changes) {
        state.events.push({
            name,
            changes,
            time: Date.now(),
        });
        changes.forEach((change: any) => {
            applyChange(state.graph, true, change);
        });
        state.historyPosition += 1;
        state.graphSnapshot = JSON.parse(JSON.stringify(state.graph));
    }
}
/** Creates a new v4 UUID */
export function newId(): string {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        // tslint:disable-next-line
        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8); // eslint-disable-line 
        return v.toString(16);
    });
}
function nudge(state: any, x: number, y: number) {
    state.selectedVectors.forEach((selectedVector: any) => {
        const vector = state.graphSnapshot.vectors.find((v: UIVector) => selectedVector.id === v.id);
        vector.properties.x += x;
        vector.properties.y += y;
    });
    applyGraphChanges(state, "Nudge");
}
export function nudgeUp(state: any, offset: number) {
    nudge(state, 0, -offset);
}
export function nudgeDown(state: any, offset: number) {
    nudge(state, 0, offset);
}
export function nudgeLeft(state: any, offset: number) {
    nudge(state, -offset, 0);
}
export function nudgeRight(state: any, offset: number) {
    nudge(state, offset, 0);
}
export function zoom(state: any, kOffset: number) {
    state.view.k = Math.min(4, Math.max(state.view.k + kOffset, 0.1));
}
export function moveHistoryPosition(state: any, move: number) {
    const target = state.historyPosition + move;
    if (target > state.events.length || target < 0) {
        return;
    }
    while (state.historyPosition !== target) {
        if (state.historyPosition > target) {
            state.historyPosition -= 1;
            const changes = state.events[state.historyPosition].changes;
            changes.forEach((change: any) => {
                revertChange(state.graphSnapshot, true, change);
            });
        } else if (state.historyPosition < target) {
            const changes = state.events[state.historyPosition].changes;
            changes.forEach((change: any) => {
                applyChange(state.graphSnapshot, true, change);
            });
            state.historyPosition += 1;
        }
    }
    state.graph = state.graphSnapshot;
    state.graphSnapshot = JSON.parse(JSON.stringify(state.graph));
}
export function pasteVectors(state: any, vectors: UIVector[], name: string = "Paste") {
    const idMap:{
        [key: string]: string;
    } = {};
    // gather IDs for vectors, groups, and connectors
    vectors.forEach((v: UIVector) => {
        // vector.ids
        idMap[v.id] = idMap[v.id] || newId();
        v.id = idMap[v.id];
        for (let x = 0; x < v.properties.groups.length; x += 1) {
            const groupId = v.properties.groups[x];
            // group ids
            idMap[groupId] = idMap[groupId] || newId();
            v.properties.groups[x] = idMap[groupId];
        }
        v.edges.forEach((edge: any) => {
            edge.connectors.forEach((c: any) => {
                // connector ids
                idMap[c.id] = idMap[c.id] || newId();
                c.id = idMap[c.id];
                // connected vectors
                idMap[c.vectorId] = idMap[c.vectorId] || newId();
                c.vectorId = idMap[c.vectorId];
            });
        });
    });
    state.graphSnapshot.vectors = [
        ...state.graphSnapshot.vectors,
        ...vectors,
    ];
    state.selectedVectors = vectors;
    applyGraphChanges(state, name);
}
export function undo(state: any) {
    moveHistoryPosition(state, -1);
}
export function redo(state: any) {
    moveHistoryPosition(state, 1);
}
export function duplicateSelection(state: any) {
    if (state.selectedVectors.length > 0) {
        pasteVectors(state, JSON.parse(JSON.stringify(state.selectedVectors)), "Duplicate");
    }
}
function setSelRelPropZ(num: number, state: any, name: string) {
    const selectedVectorIds = state.selectedVectors.map((v: UIVector) => v.id);
    state.graphSnapshot.vectors.forEach((v: UIVector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            v.properties.z += num;
        }
    });
    applyGraphChanges(state, name);
}
export function bringForward(state: any) {
    setSelRelPropZ(1, state, "Send Forward");
}
export function sendBackward(state: any) {
    setSelRelPropZ(-1, state, "Send Backward");
}
export function bringToFront(state: any) {
    const maxVectorZ = Math.max.apply(null, state.graph.vectors.map((v: UIVector) => v.properties.z));
    const selectedVectorIds = state.selectedVectors.map((v: UIVector) => v.id);
    state.graphSnapshot.vectors.forEach((v: UIVector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            v.properties.z = maxVectorZ + 1;
        }
    });
    applyGraphChanges(state, "Bring to Front");
}
export function sendToBack(state: any) {
    const minVectorZ = Math.min.apply(null, state.graph.vectors.map((v: UIVector) => v.properties.z));
    const selectedVectorIds = state.selectedVectors.map((v: UIVector) => v.id);
    state.graphSnapshot.vectors.forEach((v: UIVector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            v.properties.z = minVectorZ - 1;
        }
    });
    applyGraphChanges(state, "Send to Back");
}
export function groupSelected(state: any) {
    const newGroupID = newId();
    const selectedVectorIds = state.selectedVectors.map((v: UIVector) => v.id);
    state.graphSnapshot.vectors.forEach((v: UIVector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            if (v.properties.groups.indexOf(newGroupID) === -1) {
                v.properties.groups.push(newGroupID);
            }
        }
    });
    applyGraphChanges(state, "Group");
}
export function ungroupSelected(state: any) {
    const selectedVectorIds = state.selectedVectors.map((v: UIVector) => v.id);
    state.graphSnapshot.vectors.forEach((v: UIVector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            v.properties.groups.splice(v.properties.groups.indexOf(state.primaryGroup), 1);
        }
    });
    applyGraphChanges(state, "Ungroup");
}
export function deleteSelected(state: any) {
    const selectedVectorIds = state.selectedVectors.map((v: UIVector) => v.id);
    const selectedConnectorIds = state.selectedConnectors.map((v: {id: string}) => v.id);
    function deleteVectorById(id: string): void {
        state.graphSnapshot.vectors.forEach((v: UIVector) => {
            // surely if you delete a vector, you must delete any connectors that are going to it as well
            v.edges.forEach((edge: {connectors: any[]}) => {
                edge.connectors.forEach((connector: {vectorId: string}, index) => {
                    if (connector.vectorId === id) {
                        edge.connectors.splice(index, 1);
                    }
                });
            });
        });
        // trying to do this in the previous loop causes things to go wrong.  Getter/setters?
        state.graphSnapshot.vectors.forEach((v: UIVector, index: number) => {
            if (id === v.id) {
                state.graphSnapshot.vectors.splice(index, 1);
            }
        });
    }
    function deleteConnectorById(id: string): void {
        state.graphSnapshot.vectors.forEach((v: UIVector) => {
            v.edges.forEach((edge: {connectors: any[]}) => {
                edge.connectors.forEach((connector: {id: string}, index) => {
                    if (id === connector.id) {
                        edge.connectors.splice(index, 1);
                    }
                });
            });
        });
    }
    state.selectedVectors = [];
    state.selectedConnectors = [];
    state.selectedGroups = [];
    state.groupVectors = [];
    state.hoveredConnector = null;
    state.hoveredVector = null;
    selectedVectorIds.forEach(deleteVectorById);
    selectedConnectorIds.forEach(deleteConnectorById);
    applyGraphChanges(state, "Delete");
}
export function preferences(state: any, e: object) {
    state.preferences = e;
}
export function hoveredConnector(state: any, e: object) {
    state.hoveredConnector = e;
}
export function hoveredVector(state: any, e: object) {
    if (state.movingVectors.length > 0) {
        return;
    }
    state.hoveredVector = e;
}
export function hoveredPort(state: any, e: object) {
    state.hoveredPort = e;
}
export function graph(state: any, e: object) {
    state.graphSnapshot = e;
    applyGraphChanges(state, "Write to Graph");
}
export function lut(state: any, e: {lut: any[], connector: {id: string}}) {
    state.luts[e.connector.id] = {
        ...e,
    };
}
export function view(state: any, e: object) {
    state.view = e;
}
export function translating(state: any, e: object) {
    state.translating = e;
}
export function error(state: any, e: Error) {
    state.error = e;
    state.showError = true;
}
export function updateTemplate(state: any, e: {id: string, key: string, value: string}) {
    const vector = state.graphSnapshot.vectors.find((v: UIVector) => {
        return v.id === e.id;
    });
    if (!vector) {
        throw new Error("Cannot find vector to write to.");
    }
    vector.template[e.key] = e.value;
}
export function changeInputOrder(state: any, e: {
    vectorId: string,
    name: string,
    direction: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:UIVector) => v.id === e.vectorId);
    if (!vector) {
        throw new Error("Cannot find vector to update.");
    }
    const prop = vector.properties.inputs.find(o => o.name === e.name);
    const propIndex = vector.properties.inputs.indexOf(prop);
    vector.properties.inputs.splice(propIndex, 1);
    vector.properties.inputs.splice(propIndex + (direction === "down" ? 1 : -1), 0, prop);
    applyGraphChanges(state, "Change Input Order");
}
export function changeOutputOrder(state: any, e: {
    vectorId: string,
    name: string,
    direction: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:UIVector) => v.id === e.vectorId);
    if (!vector) {
        throw new Error("Cannot find vector to update.");
    }
    const prop = vector.properties.outputs.find(o => o.name === e.name);
    const propIndex = vector.properties.outputs.indexOf(prop);
    const edge = vector.edges.find(o => o.field === e.name);
    const edgeIndex = vector.edges.indexOf(edge);
    vector.properties.outputs.splice(propIndex, 1);
    vector.properties.outputs.splice(propIndex + (direction === "down" ? 1 : -1), 0, prop);
    vector.edges.splice(edgeIndex, 1);
    vector.edges.splice(edgeIndex + (direction === "down" ? 1 : -1), 0, edge);
    applyGraphChanges(state, "Change Output Order");
}
export function addInput(state: any, e: {
    vectorId: string,
    name: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:UIVector) => v.id === e.vectorId);
    if (!vector) {
        throw new Error("Cannot find vector to update.");
    }
    vector.properties.inputs.push({
        name: e.name,
    });
    applyGraphChanges(state, "Add Input");
}
export function addOutput(state: any, e: {
    vectorId: string,
    name: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:UIVector) => v.id === e.vectorId);
    if (!vector) {
        throw new Error("Cannot find vector to update.");
    }
    vector.properties.inputs.push({
        name,
    });
    vector.properties.edges.push({
        field: name,
        connectors: [],
    });
    applyGraphChanges(state, "Add Output");
}
export function removeInput(state: any, e: {
    vectorId: string,
    name: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:UIVector) => v.id === e.vectorId);
    if (!vector) {
        throw new Error("Cannot find vector to update.");
    }
    const prop = vector.properties.inputs.find(o => o.name === e.name);
    vector.properties.inputs.splice(vector.properties.inputs.indexOf(prop), 1);
    applyGraphChanges(state, "Remove Input");
}
export function removeOutput(state: any, e: {
    vectorId: string,
    name: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:UIVector) => v.id === e.vectorId);
    if (!vector) {
        throw new Error("Cannot find vector to update.");
    }
    const prop = vector.properties.outputs.find(o => o.name === e.name);
    const edge = vector.edges.find(o => o.field === e.name);
    vector.edges.splice(vector.edges.indexOf(edge), 1);
    vector.properties.outputs.splice(vector.properties.outputs.indexOf(prop), 1);
    applyGraphChanges(state, "Remove Output");
}
export function updateVectorProperties(state: any, e: {
    vectorId: string,
    properties: any,
}) {
    const vector = state.graphSnapshot.vectors.find((v:UIVector) => v.id === e.vectorId);
    if (!vector) {
        throw new Error("Cannot find vector to update.");
    }
    vector.properties = e.properties;
    applyGraphChanges(state, "Update Vector Properties");
}
export function updateGraphProperties(state: any, e: any) {
    state.graphSnapshot.properties = e;
    applyGraphChanges(state, "Update Graph Properties");
}
export function createNewVector(state: any) {
    state.graphSnapshot.vectors.push({
        id: newId(),
        edges: [],
        version: state.graphSnapshot.version,
        graphId: state.graphSnapshot.id,
        url: "",
        data: "",
        properties: {
            x: state.view.x + state.preferences.newVectorOffset.x,
            y: state.view.y + state.preferences.newVectorOffset.y,
            z: 0 + state.preferences.newVectorOffset.z,
            presentation: {
                x: state.view.x + state.preferences.newVectorOffset.x,
                y: state.view.y + state.preferences.newVectorOffset.y,
                z: 0 + state.preferences.newVectorOffset.z,
            },
        },
    });
    applyGraphChanges(state, "Create New Vector");
}
export default {
    createNewVector,
    updateGraphProperties,
    updateVectorProperties,
    changeInputOrder,
    changeOutputOrder,
    addInput,
    addOutput,
    removeInput,
    removeOutput,
    updateTemplate,
    error,
    undo,
    redo,
    moveHistoryPosition,
    duplicateSelection,
    pasteVectors,
    bringForward,
    sendBackward,
    bringToFront,
    sendToBack,
    groupSelected,
    ungroupSelected,
    deleteSelected,
    preferences,
    hoveredConnector,
    hoveredVector,
    hoveredPort,
    mouse,
    graph,
    lut,
    view,
    keyup,
    keydown,
    translating,
};
