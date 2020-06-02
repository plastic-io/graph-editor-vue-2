import {diff, applyChange, revertChange, observableDiff} from "deep-diff";
import mouse from "./modules/mouse";
import {keyup, keydown} from "./modules/keys";
import helpTemplate from "./newVectorHelpTemplate";
import Vue from "vue";
import Scheduler, {Vector, Edge, Connector, FieldMap} from "@plastic-io/plastic-io"; // eslint-disable-line
const originalLog = console.log;
export interface ChangeEvent {
    id: string,
    date: number,
    changes: any[],
}
function updateGraphPresentationTemplate(state: any, e: {value: string}) {
    state.graph.properties.presentationTemplate = e.value;
}
function commitToRewindVersion(state: any) {
    state.rewindTarget = JSON.parse(JSON.stringify(state.graphSnapshot));
    state.rewindVisible = false;
}
function setRewindVersion(state: any, graph: any) {
    state.graphSnapshot = graph;
    state.graph = graph;
    state.remoteSnapshot = graph;
}
function rewindEnabled(state: any) {
    state.inRewindMode = true;
}
function rewindDisabled(state: any) {
    state.inRewindMode = false;
    state.rewindVisible = false;
}
function showRewind(state: any) {
    if (!state.dataProviders.graph.asyncUpdate) {
        raiseError(state, new Error("Cannot use rewind with local storage."));
        return;
    }
    state.rewindVisible = true;
}
function addTestOutput(state: any, item: any) {
    console.info("state.testOutput.push(item);", item);
    state.testOutput.push(item);
    state.testOutputVersion += 1;
}
function showTests(state: any) {
    state.testsVisible = true;
}
function hideTests(state: any) {
    state.testsVisible = false;
    state.testOutput = [];
    console.log = originalLog;
}
function clearResync(state: any) {
    state.resyncRequired = false;
}
function dequeueEvent(state: any) {
    state.queuedEvent = null;
}
function queueEvent(state: any, event: any) {
    state.eventQueue.push(event);
}
function clearPendingMessage(state: any, e: any) {
    if (e && e.error && e.response.err) {
        if (/CRC/.test(e.response.err)) {
            state.resyncRequired = true;
            // try sending the changes again
            state.queuedEvent = state.pendingEvents[e.response.eventId];
            if (!state.queuedEvent) {
                raiseError(state, new Error("Out of sync with server.  Last event could not be replayed.  Try refreshing your browser."));
            }
            Vue.delete(state.pendingEvents, state.pendingEvents);
            console.warn("CRC error applying local to remote.  Resync from origin.");
        } else {
            raiseError(state, e.response.err);
        }
    } else if (e && e.response && e.response.event) {
        const ev = state.pendingEvents[e.response.event.id];
        ev.changes.forEach((change: any) => {
            applyChange(state.remoteSnapshot, true, change);
        });
        Vue.delete(state.pendingEvents, e.response.event.id);
    }
    if (Object.keys(state.pendingEvents).length === 0 && state.eventQueue.length > 0) {
        state.queuedEvent = state.eventQueue.shift();
    }
}
function setPendingEvent(state: any, event: any) {
    state.ownEvents.push(event);
    Vue.set(state.pendingEvents, event.id, event);
}
function updateGraphMouse(state: any, ev: any) {
    const start = ev.movements[0].time;
    ev.movements.forEach((movement: any) => {
        setTimeout(() => {
            Vue.set(state.graphUserMouse, ev.workstationId, {
                workstationId: ev.workstationId,
                avatar: ev.avatar,
                userName: ev.userName,
                ...movement,
            });
        }, movement.time - start);
    });
}
function resetMouseTelemetry(state: any) {
    Vue.set(state, "mouseMovements", []);
}
function updateGraphUsers(state: any, event: any) {
    if (state.graphUsers[event.workstationId] && state.graphUsers[event.workstationId].timeout) {
        clearTimeout(state.graphUsers[event.workstationId].timeout);
    }
    Vue.set(state.graphUsers, event.workstationId, event);
    state.graphUsers[event.workstationId].timeout = setTimeout(() => {
        Vue.delete(state.graphUsers, event.workstationId);
    }, state.heartBeatInterval + 1000);
}
function remoteChangeEvents(state: any, event: any) {
    if (state.inRewindMode) {
        console.warn("No remote mutations allowed during rewind mode.");
        return;
    }
    const ownKeys: string[] = state.ownEvents.map((e: {id: string}) => e.id); 
    const remoteEventKeys: string[] = state.remoteEvents.map((e: {id: string}) => e.id);
    const preApplySnapshot: any = JSON.parse(JSON.stringify(state.graph));
    // don't apply events we created, don't apply events we've already recieved
    if (ownKeys.indexOf(event.id) === -1
        && remoteEventKeys.indexOf(event.id) === -1) {
        event.changes.forEach((change: any) => {
            applyChange(preApplySnapshot, true, change);
        });
    }
    const changes = diff(state.graph, preApplySnapshot);
    if (changes) {
        state.remoteEvents.push(event);
        event.changes.forEach((change: any) => {
            applyChange(state.graph, true, change);
            applyChange(state.remoteSnapshot, true, change);
        });
        state.graphSnapshot = JSON.parse(JSON.stringify(state.graph));
    }
}
export function replacer(key: any, value: any) {
    if (key === "__contextId") {
        return undefined;
    }
    return value;
}
export function applyGraphChanges(state: any, name: string) {
    if (state.inRewindMode) {
        console.warn("You cannot make changes while in rewind mode");
        return;
    }
    if (state.events.length !== state.historyPosition) {
        state.events.splice(state.historyPosition, state.events.length - state.historyPosition);
    }
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
export function newId() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        var r = Math.random() * 16 | 0, v = c == "x" ? r : (r & 0x3 | 0x8); // eslint-disable-line 
        return v.toString(16);
    });
}
function nudge(state: any, x: number, y: number) {
    state.selectedVectors.forEach((selectedVector: any) => {
        const vector = state.graphSnapshot.vectors.find((v: Vector) => selectedVector.id === v.id);
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
export function pasteVectors(state: any, vectors: Vector[], name: string = "Paste") {
    const idMap:{
        [key: string]: string;
    } = {};
    // gather IDs for vectors, groups, and connectors
    vectors.forEach((v: Vector) => {
        // vector.ids
        idMap[v.id] = idMap[v.id] || newId();
        if (v.id === v.url) {
            v.id = idMap[v.id];
            v.url = v.id;
        } else {
            v.id = idMap[v.id];
        }
        v.graphId = state.graph.id;
        v.version = state.graph.version;
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
                c.graphId = state.graph.id;
                c.version = state.graph.version;
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
export function selectVector(state: any, vectorId: string) {
    state.selectedVectors = [state.graph.vectors.find((v: Vector) => v.id === vectorId)];
    state.selectedVector = state.selectedVectors[0];
    updateBoundingRect(state);
}
export function selectVectors(state: any, vectorIds: string[]) {
    state.selectedVectors = state.graph.vectors.filter((v: Vector) => vectorIds.indexOf(v.id) !== -1);
    state.selectedVector = state.selectedVectors[0];
    updateBoundingRect(state);
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
    const selectedVectorIds = state.selectedVectors.map((v: Vector) => v.id);
    state.graphSnapshot.vectors.forEach((v: Vector) => {
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
    const maxVectorZ = Math.max.apply(null, state.graph.vectors.map((v: Vector) => v.properties.z));
    const selectedVectorIds = state.selectedVectors.map((v: Vector) => v.id);
    state.graphSnapshot.vectors.forEach((v: Vector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            v.properties.z = maxVectorZ + 1;
        }
    });
    applyGraphChanges(state, "Bring to Front");
}
export function sendToBack(state: any) {
    const minVectorZ = Math.min.apply(null, state.graph.vectors.map((v: Vector) => v.properties.z));
    const selectedVectorIds = state.selectedVectors.map((v: Vector) => v.id);
    state.graphSnapshot.vectors.forEach((v: Vector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            v.properties.z = minVectorZ - 1;
        }
    });
    applyGraphChanges(state, "Send to Back");
}
export function addGraphItem(state: any, e: any) {
    const pos = {
        x: (e.x - state.view.x) / state.view.k,
        y: (e.y - state.view.y) / state.view.k,
    };
    pos.x = Math.floor(pos.x / 10) * 10;
    pos.y = Math.floor(pos.y / 10) * 10;
    const linkedGraphInputs: {[key: string]: any} = {};
    const linkedGraphOutputs: {[key: string]: any} = {};
    const graph = e.item;
    graph.vectors.forEach((v: Vector) => {
        v.properties.inputs.forEach((i: any) => {
            if (i.external) {
                linkedGraphInputs[i.name] = {
                    id: v.id,
                    field: i.name,
                    type: i.type,
                    external: false,
                } as any;
            }
        });
        v.properties.outputs.forEach((i: any) => {
            if (i.external) {
                linkedGraphOutputs[i.name] = {
                    id: v.id,
                    field: i.name,
                    type: i.type,
                    external: false,
                } as any;
            }
        });
    });
    // create IOs (inputs, outputs/edges) on outter vector to support IO of graphs's externals
    const id = newId();
    const vector = {
        id,
        __contextId: null,
        edges: [],
        version: state.graphSnapshot.version,
        graphId: state.graphSnapshot.id,
        artifact: e.url || ("artifacts/" + e.id + "." + e.version),
        url: id,
        data: null,
        linkedGraph: {
            id: e.id,
            version: e.version,
            data: {},
            loaded: true,
            graph,
            properties: {},
            fields: {
                inputs: linkedGraphInputs,
                outputs: linkedGraphOutputs
            }
        },
        properties: {
            inputs: [],
            outputs: [],
            groups: [],
            name: e.name,
            description: e.description,
            tags: [],
            icon: "mdi-lan",
            positionAbsolute: false,
            appearsInPresentation: false,
            appearsInExport: false,
            x: pos.x,
            y: pos.y,
            z: 0 + state.preferences.newVectorOffset.z,
            presentation: {
                x: pos.x,
                y: pos.y,
                z: 0 + state.preferences.newVectorOffset.z,
            },
        },
        template: {
            // url: string, value: any, field: string, currentVector: Vector, graph?: Graph
            set: `const hostVector = value.context.getters.getVectorById(value.hostVector.id);
const vect = hostVector.linkedGraph.graph.vectors.find(v => v.id === value.vector.id);
scheduler.url.call(scheduler,
    vect.url,
    value.event,
    '$url',
    hostVector,
    hostVector.linkedGraph.graph);`,
            vue: "",
        },
    } as Vector;
    Object.keys(linkedGraphInputs).forEach((ioKey) => {
        const io: any = linkedGraphInputs[ioKey];
        vector.properties.inputs.push({
            name: io.field,
            external: false,
            type: io.type,
        });
    });
    Object.keys(linkedGraphOutputs).forEach((ioKey) => {
        const io: any = linkedGraphOutputs[ioKey];
        vector.properties.outputs.push({
            name: io.field,
            external: false
        });
        vector.edges.push({
            field: io.field,
            connectors: [],
            type: io.type,
        } as Edge);
    });
    state.graphSnapshot.vectors.push(vector);
    applyGraphChanges(state, "Import New Graph");
}
export function addDroppedItem(state: any, e: any) {
    const pos = {
        x: (e.x - state.view.x) / state.view.k,
        y: (e.y - state.view.y) / state.view.k,
    };
    pos.x = Math.floor(pos.x / 10) * 10;
    pos.y = Math.floor(pos.y / 10) * 10;
    const id = newId();
    e.item.id = id;
    e.item.url = id;
    e.item.version = state.graphSnapshot.version;
    e.item.graphId = state.graphSnapshot.id;
    e.item.properties.x = pos.x;
    e.item.properties.y = pos.y;
    e.item.properties.z = 0 + state.preferences.newVectorOffset.z;
    // ensure connectors are not imported
    e.item.edges.forEach((edge: Edge) => {
        edge.connectors = [];
    });
    state.graphSnapshot.vectors.push(e.item);
    applyGraphChanges(state, "Drop New Item");
}
export function addVectorItem(state: any, e: any) {
    const pos = {
        x: (e.x - state.view.x) / state.view.k,
        y: (e.y - state.view.y) / state.view.k,
    };
    pos.x = Math.floor(pos.x / 10) * 10;
    pos.y = Math.floor(pos.y / 10) * 10;
    const id = newId();
    e.item.loaded = true;
    // ensure connectors are not imported
    e.item.edges.forEach((edge: Edge) => {
        edge.connectors = [];
    });
    const vector = {
        id: id,
        linkedVector: e.item,
        edges: e.item.edges,
        version: state.graphSnapshot.version,
        graphId: state.graphSnapshot.id,
        artifact: e.url || ("artifacts/" + e.id + "." + e.version),
        url: id,
        data: e.item.data,
        properties: {
            inputs: e.item.properties.inputs,
            outputs: e.item.properties.outputs,
            groups: [],
            name: e.name,
            description: e.description,
            tags: e.item.properties.tags,
            icon: e.item.properties.icon,
            positionAbsolute: false,
            appearsInPresentation: false,
            appearsInExport: false,
            x: pos.x,
            y: pos.y,
            z: 0 + state.preferences.newVectorOffset.z,
            presentation: {
                x: pos.x,
                y: pos.y,
                z: 0 + state.preferences.newVectorOffset.z,
            },
        },
        template: {
            set: e.item.template.set,
            vue: e.item.template.vue,
        },
    };
    state.graphSnapshot.vectors.push(vector);
    applyGraphChanges(state, "Import New Vector");
}
export function groupSelected(state: any) {
    const newGroupID = newId();
    const selectedVectorIds = state.selectedVectors.map((v: Vector) => v.id);
    state.graphSnapshot.vectors.forEach((v: Vector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            if (v.properties.groups.indexOf(newGroupID) === -1) {
                v.properties.groups.push(newGroupID);
            }
        }
    });
    applyGraphChanges(state, "Group");
}
export function ungroupSelected(state: any) {
    const selectedVectorIds = state.selectedVectors.map((v: Vector) => v.id);
    state.graphSnapshot.vectors.forEach((v: Vector) => {
        if (selectedVectorIds.indexOf(v.id) !== -1) {
            v.properties.groups.splice(v.properties.groups.indexOf(state.primaryGroup), 1);
        }
    });
    applyGraphChanges(state, "Ungroup");
}
function deleteVectorById(state: any): (id: string) => void {
    return (id: string): void => {
        state.graphSnapshot.vectors.forEach((v: Vector) => {
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
        state.graphSnapshot.vectors.forEach((v: Vector, index: number) => {
            if (id === v.id) {
                state.graphSnapshot.vectors.splice(index, 1);
            }
        });
    };
}
function deleteConnectorById(state: any): (id: string) => void {
    let targetVector: Vector;
    return (id: string): void => {
        state.graphSnapshot.vectors.forEach((v: Vector) => {
            v.edges.forEach((edge: {connectors: any[]}) => {
                edge.connectors.forEach((connector: {id: string}, index) => {
                    if (id === connector.id) {
                        edge.connectors.splice(index, 1);
                        targetVector = v;
                    }
                });
            });
            // remove top level connectors that match
            if (targetVector && v.linkedGraph && targetVector.id === v.id && v.linkedGraph.graph) {
                v.linkedGraph.graph.vectors.forEach((v: Vector) => {
                    v.edges.forEach((edge: {connectors: any[]}) => {
                        edge.connectors.forEach((connector: {id: string}, index) => {
                            if (id === connector.id) {
                                edge.connectors.splice(index, 1);
                            }
                        });
                    });
                });
            }
        });
    };
}
export function deleteSelected(state: any) {
    const selectedVectorIds = state.selectedVectors.map((v: Vector) => v.id);
    const selectedConnectorIds = state.selectedConnectors.map((v: {id: string}) => v.id);
    state.selectedVectors = [];
    state.selectedConnectors = [];
    state.selectedGroups = [];
    state.groupVectors = [];
    state.hoveredConnector = null;
    state.hoveredVector = null;
    selectedVectorIds.forEach(deleteVectorById(state));
    selectedConnectorIds.forEach(deleteConnectorById(state));
    applyGraphChanges(state, "Delete");
}
export function preferences(state: any, e: object) {
    state.preferences = e;
}
export function hoveredConnector(state: any, e: object) {
    state.hoveredConnector = e;
}
export function selectConnector(state: any, e: {id: string}) {
    if (state.keys.event && (state.keys.event.shiftKey || state.keys.event.ctrlKey || state.keys.event.metaKey)) {
        if (state.selectedConnectors.map((c: {id: string}) => c.id).indexOf(e.id) === -1) {
            state.selectedConnectors.push(e);
        }
        return;
    }
    state.selectedConnectors = [e];
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
export function clearError(state: any) {
    state.error = null;
    state.showError = false;
}
export function clearInfo(state: any) {
    state.infoMessage = "";
    state.showInfo = false;
}
export function showInfoDialog(state: any, e: Error) {
    console.info(e);
    state.infoMessage = e;
    state.showInfo = true;
}
export function raiseError(state: any, e: Error) {
    console.error(e);
    state.error = e;
    state.showError = true;
}
export function updateTemplate(state: any, e: {id: string, key: string, value: string}) {
    const vector = state.graphSnapshot.vectors.find((v: Vector) => {
        return v.id === e.id;
    });
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to write to."));
    }
    vector.template[e.key] = e.value;
    applyGraphChanges(state, "Update Template");
}
export function changeInputOrder(state: any, e: {
    vectorId: string,
    name: string,
    direction: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vectorId);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    const prop = vector.properties.inputs.find((o: {name: string}) => o.name === e.name);
    if (!prop) {
        return raiseError(state, new Error("Cannot find a property to update."));
    }
    const propIndex = vector.properties.inputs.indexOf(prop);
    vector.properties.inputs.splice(propIndex, 1);
    vector.properties.inputs.splice(propIndex + (e.direction === "down" ? 1 : -1), 0, prop);
    applyGraphChanges(state, "Change Input Order");
}
export function changeOutputOrder(state: any, e: {
    vectorId: string,
    name: string,
    direction: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vectorId);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    const prop = vector.properties.outputs.find((o: {name: string}) => o.name === e.name);
    if (!prop) {
        return raiseError(state, new Error("Cannot find a property to update."));
    }
    const propIndex = vector.properties.outputs.indexOf(prop);
    const edge = vector.edges.find((o: {field: string}) => o.field === e.name);
    const edgeIndex = vector.edges.indexOf(edge);
    vector.properties.outputs.splice(propIndex, 1);
    vector.properties.outputs.splice(propIndex + (e.direction === "down" ? 1 : -1), 0, prop);
    vector.edges.splice(edgeIndex, 1);
    vector.edges.splice(edgeIndex + (e.direction === "down" ? 1 : -1), 0, edge);
    applyGraphChanges(state, "Change Output Order");
}
export function addInput(state: any, e: {
    vectorId: string,
    name: string,
    type: string,
    external: boolean,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vectorId);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    vector.properties.inputs.push({
        name: e.name,
        type: e.type || "Object",
        external: e.external === undefined ? false : e.external,
    });
    applyGraphChanges(state, "Add Input");
}
export function addOutput(state: any, e: {
    vectorId: string,
    name: string,
    type: string,
    external: boolean,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vectorId);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    vector.properties.outputs.push({
        name: e.name,
        type: e.type || "Object",
        external: e.external === undefined ? false : e.external,
    });
    vector.edges.push({
        field: e.name,
        connectors: [],
    });
    applyGraphChanges(state, "Add Output");
}
export function removeInput(state: any, e: {
    vectorId: string,
    name: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vectorId);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    const prop = vector.properties.inputs.find((o: {name: string}) => o.name === e.name);
    vector.properties.inputs.splice(vector.properties.inputs.indexOf(prop), 1);
    // remove any connectors that refrenced this input
    state.graphSnapshot.vectors.forEach((v:Vector) => {
        v.edges.forEach((edge: {field: string, connectors: any[]}) => {
            const rmConnectors = edge.connectors.filter((connector) => {
                return connector.vectorId === e.vectorId && connector.field === e.name;
            });
            if (rmConnectors.length > 0) {
                rmConnectors.forEach((c: any) => {
                    edge.connectors.splice(edge.connectors.indexOf(c), 1);
                });
            }
        });
    });
    applyGraphChanges(state, "Remove Input");
}
export function removeOutput(state: any, e: {
    vectorId: string,
    name: string,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vectorId);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    const prop = vector.properties.outputs.find((o: {name: string}) => o.name === e.name);
    const edge = vector.edges.find((o: {field: string}) => o.field === e.name);
    vector.edges.splice(vector.edges.indexOf(edge), 1);
    vector.properties.outputs.splice(vector.properties.outputs.indexOf(prop), 1);
    applyGraphChanges(state, "Remove Output");
}
export function updateVectorProperties(state: any, e: {
    vectorId: string,
    properties: any,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vectorId);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    vector.properties = e.properties;
    applyGraphChanges(state, "Update Vector Properties");
}
export function updateGraphProperties(state: any, e: any) {
    state.graphSnapshot.properties = e;
    applyGraphChanges(state, "Update Graph Properties");
}
export function createNewVector(state: any, e: any) {
    const pos = {
        x: (e.x - state.view.x) / state.view.k,
        y: (e.y - state.view.y) / state.view.k,
    };
    pos.x = Math.floor(pos.x / 10) * 10;
    pos.y = Math.floor(pos.y / 10) * 10;
    const id = newId();
    const vector = {
        id,
        edges: [],
        version: state.graphSnapshot.version,
        graphId: state.graphSnapshot.id,
        artifact: null,
        url: id,
        data: null,
        properties: {
            inputs: [],
            outputs: [],
            groups: [],
            name: "",
            description: "",
            tags: [],
            icon: "mdi-vector-rectangle",
            positionAbsolute: false,
            appearsInPresentation: false,
            appearsInExport: false,
            x: pos.x,
            y: pos.y,
            z: 0 + state.preferences.newVectorOffset.z,
            presentation: {
                x: pos.x,
                y: pos.y,
                z: 0 + state.preferences.newVectorOffset.z,
            },
        },
        template: {
            set: state.preferences.newVectorHelp ? helpTemplate.set : state.preferences.defaultNewSetTemplate,
            vue: state.preferences.newVectorHelp ? helpTemplate.template : state.preferences.defaultNewVueTemplate,
        },
    };
    state.graphSnapshot.vectors.push(vector);
    applyGraphChanges(state, "Create New Vector");
}
export function updateVectorFields(state: any, e: {
    vector: Vector,
}) {
    const vector = state.graphSnapshot.vectors.find((v:Vector) => v.id === e.vector.id);
    if (!vector) {
        return raiseError(state, new Error("Cannot find vector to update."));
    }
    observableDiff(vector, e.vector, (d: any) => {
        // output changes
        if (d.path[0] === "properties" && d.path[1] === "outputs"
                && !isNaN(d.path[2]) && (d.path[3] === "name" || d.path[3] === "external" || d.path[3] === "type")) {
            applyChange(vector, e.vector, d);
            if (d.path[3] === "name") {
                // also apply the change to local edge names
                const edge = vector.edges.find((ed: {field: string}) => {
                    return ed.field === d.lhs;
                });
                edge.field = d.rhs;
            }
        }
        // input changes
        if (d.path[0] === "properties" && d.path[1] === "inputs"
                && !isNaN(d.path[2]) && (d.path[3] === "name" || d.path[3] === "external" || d.path[3] === "type")) {
            applyChange(vector, e.vector, d);
            if (d.path[3] === "name") {
                // also apply the change to the edge connectors that interact with it
                state.graphSnapshot.vectors.forEach((v: Vector) => {
                    v.edges.forEach((edge: Edge) => {
                        edge.connectors.forEach((con: {vectorId: string, field: string}) => {
                            if (con.field === d.lhs && con.vectorId === e.vector.id) {
                                con.field = d.rhs;
                            }
                        });
                    });
                });
            }
        }
    });
    applyGraphChanges(state, "Rename IO");
}
function deleteConnector(state: any, e: {id: string}): void {
    state.graphSnapshot.vectors.forEach((v: Vector) => {
        v.edges.forEach((edge: {connectors: any[]}) => {
            edge.connectors.forEach((connector: {id: string}, index) => {
                if (e.id === connector.id) {
                    edge.connectors.splice(index, 1);
                }
            });
        });
    });
    applyGraphChanges(state, "Delete Connector");
}
function changeConnectorOrder(state: any, e: {vectorId: string, connectorId: string, direction: string}) {
    state.graphSnapshot.vectors.forEach((v: Vector) => {
        v.edges.forEach((edge: {connectors: any[]}) => {
            edge.connectors.forEach((connector: {id: string}, index) => {
                if (e.connectorId === connector.id && v.id === e.vectorId) {
                    edge.connectors.splice(index, 1);
                    edge.connectors.splice(index + (e.direction === "down" ? 1 : -1), 0, connector);
                }
            });
        });
    });
    applyGraphChanges(state, "Reorder Connectors");
}
async function open(state: any, e: any) {
    state.graph = e;
    function setVectorsContext(vectors: Vector[]) {
        vectors.forEach((v: Vector) => {
            v.__contextId = newId();
            if (v.linkedGraph) {
                setVectorsContext(v.linkedGraph.graph.vectors);
            }
        });
    }
    setVectorsContext(state.graph.vectors);
    state.graphSnapshot = JSON.parse(JSON.stringify(e));
    state.remoteSnapshot = JSON.parse(JSON.stringify(e));
    if (state.rewindTarget) {
        state.graphSnapshot = state.rewindTarget;
        // if you don't set this, the version
        // number can be overwritten truncating the state
        state.graphSnapshot.version = state.graph.version;
        state.inRewindMode = false;
        applyGraphChanges(state, "Rewind");
    }
}
function setDataProviders(state: any, e: {
        [key: string]: any;
    }) {
    Object.keys(e).forEach((type) => {
        Vue.set(state.dataProviders, type, e[type]);
    });
}
function setLoadingStatus(state: any, e: {key: string, type: string, loading: boolean, event: any}) {
    Vue.set(state.loading, e.type, state.loading[e.type] || {});
    Vue.set(state.loading[e.type], e.key, state.loading[e.type][e.key] || []);
    state.loading[e.type][e.key].push({
        loading: e.loading,
        event: e.event,
        time: Date.now(),
    });
}
function addLogItem(state: any, e: any) {
    state.log.push({_t: Date.now(), ...e});
}
function setPreferences(state: any, e: any) {
    state.preferences = e;
}
function setGraphVersion(state: any, e: number) {
    if (!state.dataProviders.graph.asyncUpdate) {
        state.graph.version = e;
        state.graph.vectors.forEach((v: Vector) => {
            v.version = e;
            v.edges.forEach((edge: Edge) => {
                edge.connectors.forEach((connector: Connector) => {
                    connector.version = e;
                });
            });
        });
    }
    state.graphSnapshot = JSON.parse(JSON.stringify(state.graph));
}
function setToc(state: any, e: any) {
    state.toc = e;
}
function setPresentation(state: any, e: any) {
    state.presentation = e;
}
function setLock(state: any, e: any) {
    state.locked = e;
}
function updateVectorUrl(state: any, e: {vectorId: string, url: string}) {
    const vector = state.graphSnapshot.vectors.find((v: Vector) => v.id === e.vectorId);
    vector.url = e.url;
    applyGraphChanges(state, "Change Vector URL");
}
function clearLog(state: any, e: any) {
    state.log = state.log.filter((item: any) => {
        return item.eventName !== e;
    });
}
function connectorActivity(state: any, e: any) {
    Vue.set(state.activityConnectors, e.key, state.activityConnectors[e.key] || []);
    state.activityConnectors[e.key].push(e);
    while (state.preferences.maxConnectorActivity > state.activityConnectors[e.key].length) {
        state.activityConnectors[e.key].shift();
    }
}
function clearSchedulerErrorItem(state: any, e: any) {
    state.scheduler.errors[e.key] = state.scheduler.errors[e.key].filter((i: any) => {
        return i !== e.item;
    });
}
function clearSchedulerError(state: any, e: any) {
    Vue.set(state.scheduler.errors, e.key, []);
}
function addSchedulerError(state: any, e: any) {
    Vue.set(state.scheduler.errors, e.key, state.scheduler.errors[e.key] || []);
    state.scheduler.errors[e.key].push(e.error);
}
export function togglePresentation(state: any) {
    state.presentation = !state.presentation;
}
function setScheduler(state: any, e: any) {
    state.scheduler.instance = e;
}
function setArtifact(state: any, e: any) {
    state.artifacts[e.key] = e.value;
}
function updateVectorData(state: any, e: any) {
    const vector = state.graphSnapshot.vectors.find((v: Vector) => v.id === e.vectorId);
    vector.data = e.data;
    applyGraphChanges(state, "Update Vector Data");
}
function setRegistryItem(state: any, e: any) {
    const parent = e.parent;
    delete e.parent;
    Vue.set(parent, "_item", e);
}
function setRegistry(state: any, e: any) {
    Vue.set(state.registry, e.url, e);
}
export function togglePanelVisibility(state: any) {
    state.panelVisibility = !state.panelVisibility;
}
function setSchedulerState(state: any, e: any) {
    state.scheduler.state = e;
}
function toggleLabels(state: any) {
    state.preferences.showLabels = !state.preferences.showLabels;
    setPreferences(state, state.preferences);
}
function toggleHelp(state: any) {
    state.showHelp = !state.showHelp;
}
function addHelpTopic(state: any, e: any) {
    state.helpTopics[e.topic] = e;
}
export function toggleSelectedVectorPresentationMode(state: any) {
    state.selectedVectors.forEach((selectedVector: any) => {
        const vector = state.graphSnapshot.vectors.find((v: Vector) => selectedVector.id === v.id);
        vector.properties.appearsInPresentation = !vector.properties.appearsInPresentation;
    });
    applyGraphChanges(state, "Toggle Vector Presentation");
}
// this is for creating a new graph
export function resetLoadedState(state: any, e: any) {
    state.graph = e;
    state.createdGraphId = e.id;
    state.remoteSnapshot = {};
    state.graphSnapshot = null;
}
export function setGraphReferences(state: any, refs: any) {
    state.graphReferences = {
        ...state.graphReferences,
        ...refs,
    };
}
export function setConnectionState(state: any, e: any) {
    state.connectionState = e;
}
// remapping needs to be done so we don't use previous versions of the
// vectors that were stored in various selection arrays this can probably be
// improved by makign the selection arrays ID based
export function remapVectors(state: any, arr: any) {
    return state.graph.vectors.filter((v: Vector) => {
        return arr.find((vi: any) => v.id === vi.id);
    });
}
export function updateBoundingRect(state: any) {
    // calculate bounding box
    // this probably doesn't have to run as frequently as it does, lots of calls to getElementById here, might be slow
    if (state.selectedVectors.length > 0) {
        /// map to updated graph, but filter for bound vectors
        const bound = remapVectors(state, state.selectedVectors);
        const minX = Math.min.apply(null, bound
            .map((v: Vector) => v.properties.x));
        const maxX = Math.max.apply(null, bound
            .map((v: Vector) => {
                const el = document.getElementById("vector-" + v.id);
                if (!el) {
                    return v.properties.x;
                }
                return v.properties.x + el.offsetWidth;
            }));
        const minY = Math.min.apply(null, bound
            .map((v: Vector) => v.properties.y));
        const maxY = Math.max.apply(null, bound
            .map((v: Vector) => {
                const el = document.getElementById("vector-" + v.id);
                if (!el) {
                    return v.properties.y;
                }
                return v.properties.y + el.offsetHeight;
            }));
        state.groupBounds = {
            minX,
            maxX,
            minY,
            maxY,
        };
        // update bounding box
        state.boundingRect = {
            x: state.groupBounds.minX,
            y: state.groupBounds.minY,
            width: state.groupBounds.maxX - state.groupBounds.minX,
            height: state.groupBounds.maxY - state.groupBounds.minY,
            right: state.groupBounds.minX + state.groupBounds.maxX - state.groupBounds.minX,
            bottom: state.groupBounds.minY + state.groupBounds.maxY - state.groupBounds.minY,
        };
    } else {
        state.boundingRect = {x: 0, y: 0, height: 0, width: 0, bottom: 0, right: 0, visible: false};
    }
}
export default {
    updateGraphPresentationTemplate,
    commitToRewindVersion,
    setRewindVersion,
    rewindEnabled,
    rewindDisabled,
    showRewind,
    showInfoDialog,
    clearInfo,
    updateBoundingRect,
    addTestOutput,
    hideTests,
    showTests,
    clearResync,
    dequeueEvent,
    queueEvent,
    clearPendingMessage,
    setPendingEvent,
    updateGraphMouse,
    resetMouseTelemetry,
    updateGraphUsers,
    newId,
    setConnectionState,
    resetLoadedState,
    addDroppedItem,
    setGraphReferences,
    remoteChangeEvents,
    addHelpTopic,
    toggleHelp,
    toggleLabels,
    togglePanelVisibility,
    setRegistryItem,
    setRegistry,
    setSchedulerState,
    updateVectorData,
    setArtifact,
    togglePresentation,
    selectVectors,
    selectVector,
    addSchedulerError,
    clearSchedulerErrorItem,
    clearSchedulerError,
    connectorActivity,
    clearLog,
    setScheduler,
    addLogItem,
    updateVectorUrl,
    setLock,
    setPresentation,
    addGraphItem,
    setGraphVersion,
    addVectorItem,
    setPreferences,
    setToc,
    setLoadingStatus,
    open,
    setDataProviders,
    changeConnectorOrder,
    deleteConnector,
    selectConnector,
    updateVectorFields,
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
    clearError,
    raiseError,
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
