import actions from "./actions";
import mutations from "./mutations";
import acidGraph from "../../graphs/acid.json";
// import simpleGraph from "../graphs/simple.json";
import toc from "../../tests/stubs/toc.json";
const graph = acidGraph;
export default function () {
    return {
        strict: true,
        state: {
            historyPosition: 0,
            graphSnapshot: JSON.parse(JSON.stringify(graph)),
            vectorZCounter: 0,
            selectedGroups: [],
            boundingRect: {
                visible: false,
                x: 0,
                y: 0,
                height: 0,
                width: 0
            },
            selectionRect: {
                visible: false,
                x: 0,
                y: 0,
                height: 0,
                width: 0
            },
            groupBounds: {
                minX: 0,
                minY: 0,
                maxX: 0,
                maxY: 0,
            },
            addingConnector: null,
            movingConnector: null,
            primaryGroup: null,
            movingVectors: [],
            selectedConnectors: [],
            groupVectors: [],
            selectedVectors: [],
            errorConnectors: [],
            watchConnectors: [],
            activityConnectors: [],
            hoveredConnector: null,
            hoveredVector: null,
            hoveredPort: null,
            graph: graph,
            mouse: {
                lmb: false,
                rmb: false,
                mmb: false,
                x: 0,
                y: 0
            },
            luts: {},
            translating: {},
            keys: {},
            view: {
                x: 0,
                y: 0,
                k: 1
            },
            toc: toc.TOC,
            events: [],
            preferences: {
                snapToGrid: true,
                gridSize: 10, // cannot be changed for now
                appearance: {
                    showGrid: true,
                    connectors: {
                        dragDeadZone: 10,
                        controlFillStyle: "green",
                        strokeStyle: "blue",
                        selectedStrokeStyle: "yellow",
                        hoverStrokeStyle: "white",
                        watchStrokeStyle: "orange",
                        activityStrokeStyle: "magenta",
                        errorStrokeStyle: "red",
                        lineWidth: 2,
                    }
                }
            }
        },
        actions,
        mutations,
    };
}
