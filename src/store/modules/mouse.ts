const shiftKeyCode = 16;
const metaKeyCode = 91;
const ctrlKeyCode = 17;
const spaceKeyCode = 32;
import {UIVector, applyGraphChanges, newId} from "../mutations"; // eslint-disable-line
export default function mouse(state: any, mouse: {
        lmb: boolean,
        rmb: boolean,
        mmb: boolean,
        x: number,
        y: number
    }) {
    const shift = state.keys[ctrlKeyCode];
    const ctrl = state.keys[shiftKeyCode] || state.keys[metaKeyCode];
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
        arr.filter(v => !!v).forEach((v: UIVector) => {
            groupIds.push(...v.properties.groups);
        });
        state.graph.vectors.forEach((v: UIVector) => {
            if (v.properties.groups.find((value: string) => groupIds.includes(value)) && arr.indexOf(v) === -1) {
                addCount += 1;
                arr.push(v);
            }
        });
        if (addCount > 0) {
            expandGroupVectorArray(arr);
        }
    }
    // remapping needs to be done so we don't use previous versions of the
    // vectors that were stored in various selection arrays this can probably be
    // improved by makign the selection arrays ID based
    function remapVectors(arr: any) {
        return state.graph.vectors.filter((v: UIVector) => {
            return arr.find((vi: any) => v.id === vi.id);
        });
    }
    function remapHovered() {
        return state.graph.vectors.find((v: UIVector) => {
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
    if (state.hoveredPort && !state.mouse.lmb && mouse.lmb && !state.movingConnector && state.hoveredPort.type === "output" && !state.locked) {
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
    if (state.hoveredConnector && !state.mouse.lmb && mouse.lmb && pastDeadZone && !state.locked) {
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
        if (mouse.lmb && state.translating.mouse) {
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
    if (!mouse.lmb && state.mouse.lmb && state.hoveredPort && state.movingConnector && !state.addingConnector) {
        const vector = state.graphSnapshot.vectors.find((v: UIVector) => v.id === state.movingConnector.output.vector.id);
        const edge = vector.edges.find((e: {field: string}) => e.field === state.movingConnector.output.field.name);
        const connector = edge.connectors.find((e: {id: string}) => e.id === state.movingConnector.connector.id);
        connector.vectorId = state.hoveredPort.vector.id;
        connector.field = state.hoveredPort.field.name;
        applyGraphChanges(state, "Move Connector");
        state.movingConnector = null;
    }
    // add a new connector to a port
    if (!mouse.lmb && state.mouse.lmb && state.hoveredPort && state.addingConnector) {
        const vector = state.graphSnapshot.vectors.find((v: UIVector) => v.id === state.addingConnector.vector.id);
        const edge = vector.edges.find((e: {field: string}) => e.field === state.addingConnector.field.name);
        const connector = state.addingConnector.connector;
        connector.field = state.hoveredPort.field.name;
        connector.vectorId = state.hoveredPort.vector.id;
        connector.graphId = state.hoveredPort.vector.graphId;
        connector.version = state.hoveredPort.vector.version;
        edge.connectors.push(connector);
        applyGraphChanges(state, "Add Connector");
        state.addingConnector = null;
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
    if (!state.mouse.lmb && mouse.lmb && state.hoveredVector && state.movingVectors.length === 0 && !state.locked) {
        const selected = remapVectors(state.selectedVectors);
        if (selected.find((v: UIVector) => v.id === state.hoveredVector.id)) {
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
                const v = state.graph.vectors.find((v: UIVector) => v.id === state.hoveredVector.id);
                if (state.selectedVectors.map((v) => v.id).indexOf(v.id) === -1) {
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
        state.graph.vectors.forEach((v: UIVector) => {
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
                if (state.selectedVectors.map((v) => v.id).indexOf(v.id) === -1) {
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
    if ((state.keys[spaceKeyCode] && mouse.lmb) || mouse.mmb) {
        state.view.x = state.translating.view.x + (mouse.x - state.translating.mouse.x);
        state.view.y = state.translating.view.y + (mouse.y - state.translating.mouse.y);
    }
    // move vectors
    if (state.movingVectors.length > 0 && !state.locked) {
        state.movingVectors.forEach((movingVector: any) => {
            const vector = state.graphSnapshot.vectors.find((v: UIVector) => movingVector.id === v.id);
            const transVector = state.translating.vectors.find((v: any) => movingVector.id === v.id);
            const x = transVector.properties.x + ((mouse.x - state.translating.mouse.x) / state.view.k);
            const y = transVector.properties.y + ((mouse.y - state.translating.mouse.y) / state.view.k);
            vector.properties.x = Math.floor(x / 10) * 10;
            vector.properties.y = Math.floor(y / 10) * 10;
        });
    }
    // calculate bounding box
    // this probably doesn't have to run as frequently as it does, lots of calls to getElementById here, might be slow
    if (state.selectedVectors.length > 0) {
        /// map to updated graph, but filter for bound vectors
        const bound = remapVectors(state.selectedVectors);
        const minX = Math.min.apply(null, bound
            .map((v: UIVector) => v.properties.x));
        const maxX = Math.max.apply(null, bound
            .map((v: UIVector) => {
                const el = document.getElementById("vector-" + v.id);
                if (!el) {
                    return v.properties.x;
                }
                return v.properties.x + el.offsetWidth;
            }));
        const minY = Math.min.apply(null, bound
            .map((v: UIVector) => v.properties.y));
        const maxY = Math.max.apply(null, bound
            .map((v: UIVector) => {
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
    }
    // update bounding box
    state.boundingRect = {
        x: state.groupBounds.minX,
        y: state.groupBounds.minY,
        width: state.groupBounds.maxX - state.groupBounds.minX,
        height: state.groupBounds.maxY - state.groupBounds.minY,
        right: state.groupBounds.minX + state.groupBounds.maxX - state.groupBounds.minX,
        bottom: state.groupBounds.minY + state.groupBounds.maxY - state.groupBounds.minY,
    };
    // set state last so we can check state.mouse/mouse diff
    state.mouse = mouse;
}
