const shiftKeyCode = 16;
const metaKeyCode = 91;
const ctrlKeyCode = 17;
const spaceKeyCode = 32;
import {Vector, linkInnerVectorEdges} from "@plastic-io/plastic-io"; // eslint-disable-line
import {applyGraphChanges, newId, updateBoundingRect, remapVectors} from "../mutations"; // eslint-disable-line
export default function mouse(state: any, mouse: {
        lmb: boolean,
        rmb: boolean,
        mmb: boolean,
        x: number,
        y: number,
        event: any
    }) {
    if (state.inRewindMode) {
        console.warn("No mouse based mutations during rewind mode");
        return;
    }
    const locked = state.presentation || state.locked;
    const ctrl = mouse.event.ctrlKey || mouse.event.metaKey;
    const shift = mouse.event.shiftKey;
    const gridSize = state.preferences.snapToGrid && !shift ? state.preferences.gridSize : 1;
    const addKey = shift || ctrl;
    const pastDeadZone = state.translating.mouse ? (Math.abs(mouse.x - state.translating.mouse.x) > 2
        || Math.abs(mouse.y - state.translating.mouse.y) > 2) : false;
    // TODO: This whole grouping thing seems suspect.
    // Might need to reimagine how it works.  Moving on.
    function expandGroupVectorArray(arr: any[]) {
        let addCount = 0;
        // gather items in related groups
        const groupIds: string[] = [];
        // HACK: sometimes this array is populated with an empty member, not sure why, needs a fix
        arr.filter(v => !!v).forEach((v: Vector) => {
            groupIds.push(...v.properties.groups);
        });
        state.graph.vectors.forEach((v: Vector) => {
            if (v.properties.groups.find((value: string) => groupIds.includes(value)) && arr.indexOf(v) === -1) {
                addCount += 1;
                arr.push(v);
            }
        });
        if (addCount > 0) {
            expandGroupVectorArray(arr);
        }
    }
    function remapHovered() {
        return state.graph.vectors.find((v: Vector) => {
            return state.hoveredVector.id === v.id;
        });
    }
    // check if the mouse is hovering over any connectors using LUTs generated by bezier.ts plugin
    let x = (mouse.x - state.view.x) / state.view.k;
    let y = (mouse.y - state.view.y) / state.view.k;
    let m = 5;
    // map LUTs for collions
    const luts = Object.keys(state.luts).map((connectorId: string) => {
        return {
            output: state.luts[connectorId].output,
            input: state.luts[connectorId].input,
            vector: state.luts[connectorId].vector,
            connector: state.luts[connectorId].connector,
            table: state.luts[connectorId].lut,
        };
    });
    // adding a connector
    if (state.hoveredPort && !state.mouse.lmb && mouse.lmb && !state.movingConnector && state.hoveredPort.type === "output" && !locked) {
        state.addingConnector = state.hoveredPort;
        state.addingConnector.connector = {
            id: newId(),
            vectorId: null,
            field: null,
            graphId: null,
            version: null,
        };
    }
    // moving a connector
    if (state.hoveredConnector && !state.mouse.lmb && mouse.lmb && pastDeadZone && !locked) {
        state.movingConnector = state.hoveredConnector;
    }
    // draw select box maybe
    if (state.selectionRect.visible ||
        (      !state.hoveredConnector
            && !state.movingConnector
            && pastDeadZone
            && !state.hoveredVector
            && !state.hoveredPort
            && !state.addingConnector
            && !state.keys[spaceKeyCode]
            && state.movingVectors.length === 0
        )) {
        if (mouse.lmb && state.translating.mouse && !state.translating.isMap) {
            state.selectionRect.visible = true;
            let x = state.translating.mouse.x - mouse.x;
            let y = state.translating.mouse.y - mouse.y;
            state.selectionRect.x =
                (Math.min(state.translating.mouse.x, state.translating.mouse.x - x) - state.view.x) / state.view.k;
            state.selectionRect.y =
                (Math.min(state.translating.mouse.y, state.translating.mouse.y - y) - state.view.y) / state.view.k;
            state.selectionRect.width = Math.abs(x) / state.view.k;
            state.selectionRect.height = Math.abs(y) / state.view.k;
            state.selectionRect.right = state.selectionRect.x + state.selectionRect.width;
            state.selectionRect.bottom = state.selectionRect.y + state.selectionRect.height;
        } else if (state.selectionRect.visible) {
            state.selectionRect = {visible: false, x: 0, y: 0, height: 0, width: 0, right: 0, bottom: 0};
        }
    }
    // selection box is moving around, clear out the selection every move unless addkey is held
    if (state.selectionRect.visible && !addKey && state.mouse.lmb) {
        state.selectedConnectors = [];
        state.selectedVectors = [];
    }
    state.connectorWarn = null;
    // check hits on the connector LUT to find connector selection and connection hovers
    state.hoveredConnector = null;
    for (let j = 0; j < luts.length; j += 1) {
        const t = luts[j].table;
        const connector = luts[j].connector;
        const vector = luts[j].vector;
        const input = luts[j].input;
        const output = luts[j].output;
        for (let i = 0; i < t.length; i += 1) {
            if ((t[i].x < x && t[i].x + m > x && t[i].y < y && t[i].y + m > y)
                || (t[i].x >= state.selectionRect.x && t[i].x <= state.selectionRect.x + state.selectionRect.width
                && t[i].y >= state.selectionRect.y && t[i].y <= state.selectionRect.y + state.selectionRect.height)) {
                // check if this connector should be selected as well as hovered
                if ((mouse.lmb && !state.mouse.lmb) || state.selectionRect.visible) {
                    // maybe remove the previous selection before adding this one
                    if (!(state.keys[shiftKeyCode] || state.keys[metaKeyCode] || state.keys[ctrlKeyCode])
                        && !state.selectionRect.visible) {
                        state.selectedConnectors = [];
                    }
                    if (state.selectedConnectors.indexOf(connector) === -1) {
                        state.selectedConnectors.push(connector);
                    }
                }
                // don't hover other connectors while moving a connector
                if (!state.movingConnector && !state.selectionRect.visible) {
                    state.hoveredConnector = {vector, connector, input, output};
                }
                break;
            }
        }
    }
    // trying to move a connector to this port
    if (state.hoveredPort && state.movingConnector && !state.addingConnector && state.hoveredPort.type === "input") {
        const vector = state.graphSnapshot.vectors.find((v: Vector) => v.id === state.movingConnector.output.vector.id);
        const edge = vector.edges.find((e: {field: string}) => e.field === state.movingConnector.output.field.name);
        const connector = edge.connectors.find((e: {id: string}) => e.id === state.movingConnector.connector.id);
        const typeA = state.movingConnector.field.type;
        const typeB = state.hoveredPort.field.type;
        const valid = typeA === typeB || (typeA === "Object" || typeB === "Object");
        const msg = "Cannot connect " + typeA + " to " + typeB;
        if (!valid) {
            state.connectorWarn = msg;
        }
        if (!mouse.lmb && state.mouse.lmb) {
            if (valid) {
                connector.vectorId = state.hoveredPort.vector.id;
                connector.field = state.hoveredPort.field.name;
                applyGraphChanges(state, "Move Connector");
                state.movingConnector = null;
            } else {
                state.showError = true;
                state.error = msg;
            }
        }
    }
    // add a new connector to a port
    if (state.hoveredPort && state.addingConnector && state.hoveredPort.type === "input") {
        const vector = state.graphSnapshot.vectors.find((v: Vector) => v.id === state.addingConnector.vector.id);
        const edge = vector.edges.find((e: {field: string}) => e.field === state.addingConnector.field.name);
        const connector = state.addingConnector.connector;
        const typeA = state.addingConnector.field.type;
        const typeB = state.hoveredPort.field.type;
        const valid = typeA === typeB || (typeA === "Object" || typeB === "Object");
        const msg = "Cannot connect " + typeA + " to " + typeB;
        if (!valid) {
            state.connectorWarn = msg;
        }
        if (!mouse.lmb && state.mouse.lmb) {
            if (valid) {
                connector.field = state.hoveredPort.field.name;
                connector.vectorId = state.hoveredPort.vector.id;
                connector.graphId = state.hoveredPort.vector.graphId;
                connector.version = state.hoveredPort.vector.version;
                edge.connectors.push(connector);
                if (vector.linkedGraph) {
                    linkInnerVectorEdges(vector, state.scheduler.instance);
                }
                applyGraphChanges(state, "Add Connector");
                state.addingConnector = null;
            } else {
                state.showError = true;
                state.error = "Cannot connect " + typeA + " to " + typeB;
            }
        }
    }
    // drop moving vectors and connectors
    if (!mouse.lmb && state.mouse.lmb) {
        state.movingVectors = [];
        applyGraphChanges(state, "Move Vectors");
        state.movingConnector = null;
        state.addingConnector = null;
        state.translating = {};
    }
    // mouse button was just released on nothing and no addKey was pressed
    if (!mouse.lmb && state.mouse.lmb && !state.hoveredVector
        && !pastDeadZone && !state.hoveredConnector && !addKey) {
        state.selectedConnectors = [];
        state.selectedVectors = [];
        state.primaryGroup = null;
        state.selectedVector = null;
    }
    // start moving vectors
    if (!state.mouse.lmb && mouse.lmb && state.hoveredVector && state.movingVectors.length === 0 && !locked) {
        const selected = remapVectors(state, state.selectedVectors);
        if (selected.find((v: Vector) => v.id === state.hoveredVector.id)) {
            state.movingVectors = [
                ...selected,
            ];
        } else {
            // vector being moved is not part of the selection, so move it solo
            state.movingVectors = [
                remapHovered(),
            ];
        }
        state.groupVectors = [
            ...state.movingVectors,
        ];
        expandGroupVectorArray(state.movingVectors);
    } else {
        // add to vector selection
        if (!mouse.lmb && state.mouse.lmb && !pastDeadZone && state.movingVectors.length === 0) {
            if (!addKey || !state.hoveredVector) {
                state.selectedVectors = [];
                state.selectedGroups = [];
            }
            if (state.hoveredVector) {
                const v = state.graph.vectors.find((v: Vector) => v.id === state.hoveredVector.id);
                if (state.selectedVectors.map((v: Vector) => v.id).indexOf(v.id) === -1) {
                    state.selectedVectors.push(v);
                }
                state.selectedVector = v;
            }
            if (state.selectedVectors.length > 0) {
                state.groupVectors = [
                    ...state.selectedVectors,
                ];
                expandGroupVectorArray(state.selectedVectors);
            }
        }
    }
    // when selectionRect is visible, add overlapping vectors to selection
    if (state.selectionRect.visible) {
        state.graph.vectors.forEach((v: Vector) => {
            const el = document.getElementById("vector-" + v.id);
            if (!el) {
                return;
            }
            const elRect = el.getBoundingClientRect();
            const rect = {
                x: (elRect.x - state.view.x) / state.view.k,
                y: (elRect.y - state.view.y) / state.view.k,
                bottom: ((elRect.y - state.view.y) / state.view.k) + (elRect.height / state.view.k),
                right: ((elRect.x - state.view.x) / state.view.k) + (elRect.width / state.view.k),
            };
            const sel = state.selectionRect;
            if (rect.x < sel.right
                && rect.right > sel.x
                && rect.y < sel.bottom
                && rect.bottom > sel.y) {
                if (state.selectedVectors.map((v: Vector) => v.id).indexOf(v.id) === -1) {
                    state.selectedVectors.push(v);
                }
                state.selectedVector = v;
            }
        });
        expandGroupVectorArray(state.selectedVectors);
    }
    // expand selected groups to include related groups, then add them to the selection
    if (state.groupVectors.length === 1) {
        expandGroupVectorArray(state.groupVectors);
        state.selectedGroups = state.groupVectors;
        if (state.groupVectors.length !== 1) {
            state.primaryGroup = state.groupVectors[0].properties.groups[0];
        }
    }
    // translate view
    if (((state.keys[spaceKeyCode] || state.translating.isMap) && mouse.lmb) || mouse.mmb) {
        mouse.event.preventDefault();
        const p = {
            x: state.translating.view.x + (mouse.x - state.translating.mouse.x),
            y: state.translating.view.y + (mouse.y - state.translating.mouse.y),
        };
        if (state.translating.isMap) {
            p.x = state.translating.view.x - ((mouse.x - state.translating.mouse.x) * state.mapScale * state.view.k);
            p.y = state.translating.view.y - ((mouse.y - state.translating.mouse.y) * state.mapScale * state.view.k);
        }
        state.view.x = p.x * 1;
        state.view.y = p.y * 1;
    }
    // move vectors
    if (state.movingVectors.length > 0 && !locked) {
        state.movingVectors.forEach((movingVector: any) => {
            const vector = state.graphSnapshot.vectors.find((v: Vector) => movingVector.id === v.id);
            const transVector = state.translating.vectors.find((v: any) => movingVector.id === v.id);
            const x = transVector.properties.x + ((mouse.x - state.translating.mouse.x) / state.view.k);
            const y = transVector.properties.y + ((mouse.y - state.translating.mouse.y) / state.view.k);
            vector.properties.x = Math.floor(x / gridSize) * gridSize;
            vector.properties.y = Math.floor(y / gridSize) * gridSize;
        });
    }
    updateBoundingRect(state);
    // set state last so we can check state.mouse/mouse diff
    state.mouse = mouse;
    state.mouseMovements.push({time: Date.now(), mouse});
}
