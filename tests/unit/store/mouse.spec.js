import mouse from "@/store/modules/mouse.ts";
import graph from "../../stubs/graph.json";
import luts from "../../stubs/luts.json";
const shiftKeyCode = 16;
const metaKeyCode = 91;
const ctrlKeyCode = 17;
const spaceKeyCode = 32;
describe("Mouse mutations", () => {
    let time;
    let state;
    beforeEach(() => {
        global.document.getElementById = () => {
            return {
                offsetHeight: 100,
                offsetWidth: 100,
                getBoundingClientRect() {
                    return {
                        x: 10,
                        y: 10,
                        height: 100,
                        width: 100,
                        bottom: 110,
                        right: 110,
                    };
                },
            };
        };
        time = 0;
        state = {
            mouse: {
                lmb: false,
                rmb: false,
                mmb: false,
                x: 0,
                y: 0,
            },
            selectedGroups: [],
            groupVectors: [],
            selectedConnectors: [],
            locked: null,
            groupBounds: null,
            boundingRect: null,
            primaryGroup: null,
            connectorWarn: null,
            selectedVector: null,
            historyPosition: 0,
            keys: {},
            luts: {},
            hoveredVector: null,
            hoveredPort: null,
            selectionRect: {visible: false},
            hoveredConnector: null,
            movingConnector: null,
            addingConnector: null,
            movingVectors: [],
            selectedVectors: [],
            events: [],
            translating: {},
            view: {
                x: 0,
                y: 0,
                k: 1,
            },
            preferences: {
                newVectorOffset: {
                    z: 0,
                },
            },
            graph: JSON.parse(JSON.stringify(graph)),
            graphSnapshot: JSON.parse(JSON.stringify(graph)),
        };
    });
    describe("Mouse states", () => {
        it("x", () => {
            mouse(state, {
                ...state.mouse,
                x: 100,
            });
            expect(state.mouse.x).toEqual(100);
            expect(state.mouse.y).toEqual(0);
        });
        it("y", () => {
            mouse(state, {
                ...state.mouse,
                y: 100,
            });
            expect(state.mouse.y).toEqual(100);
            expect(state.mouse.x).toEqual(0);
        });
        it("lmb", () => {
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(state.mouse.lmb).toEqual(true);
            expect(state.mouse.rmb).toEqual(false);
            expect(state.mouse.mmb).toEqual(false);
        });
        it("rmb", () => {
            mouse(state, {
                ...state.mouse,
                rmb: true,
            });
            expect(state.mouse.rmb).toEqual(true);
            expect(state.mouse.lmb).toEqual(false);
            expect(state.mouse.mmb).toEqual(false);
        });
        it("mmb", () => {
            state.translating.view = state.view;
            state.translating.mouse = state.mouse;
            mouse(state, {
                ...state.mouse,
                mmb: true,
            });
            expect(state.mouse.mmb).toEqual(true);
            expect(state.mouse.lmb).toEqual(false);
            expect(state.mouse.rmb).toEqual(false);
        });
    });
    describe("Mouse movement and interactions", () => {
        it("Start adding a connector", () => {
            state.hoveredPort = {
                type: "output",
            };
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(state.addingConnector.connector.id).not.toEqual(undefined);
        });
        it("Start moving a connector", () => {
            state.translating.view = state.view;
            state.translating.mouse = {
                ...state.mouse,
                x: 100,
                y: 100,
            };
            state.hoveredConnector = "foo";
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(state.movingConnector).toEqual("foo");
        });
        it("Start drawing a select rect", () => {
            state.selectionRect.visible = true;
            state.translating.view = state.view;
            state.translating.mouse = {
                ...state.mouse,
                x: 100,
                y: 100,
                lmb: true,
            };
            state.hoveredConnector = "foo";
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(state.selectionRect.height).toEqual(100);
            expect(state.selectionRect.width).toEqual(100);
            expect(state.selectionRect.x).toEqual(0);
            expect(state.selectionRect.y).toEqual(0);
        });
        it("Select rect should clear selectedConnectors and selectedVectors if no overlap occurs", () => {
            state.selectedConnectors = [{id: 123}, {id: 124}];
            state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
            state.selectionRect.visible = true;
            state.translating.view = state.view;
            state.mouse.lmb = true;
            state.translating.mouse = {
                ...state.mouse,
                x: 1,
                y: 1,
                lmb: true,
            };
            state.hoveredConnector = "foo";
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(state.selectedConnectors).toEqual([]);
            expect(state.selectedVectors).toEqual([]);
        });
        it("Should check for hits on the bezier LUT collection", () => {
            state.luts = luts;
            state.translating.mouse = {
                ...state.mouse,
                x: 0,
                y: 0,
                lmb: true,
            };
            state.selectionRect = {visible: true};
            state.mouse.lmb = true;
            state.mouse.x = 1000;
            state.mouse.y = 1000;
            mouse(state, state.mouse);
            expect(state.selectedConnectors).toEqual([{"field": "A", "graphId": "4a477b3e-2ff6-411b-abb2-b7055b0b769b", "id": "0415b7ed-db68-4849-b535-27c51fe7dd00", "vectorId": "861f0b62-c174-4bb6-b20b-1262dc07b61f", "version": 526}]);
        });
        it("Move a connector", () => {
            state.hoveredPort = {
                type: "input",
                field: {
                    type: "Object",
                    name: "bar",
                },
                vector: {
                    id: "foo",
                },
            };
            state.movingConnector = {
                connector: {
                    id: "e4d21455-b3fb-4a3d-84cd-0b936d26e913",
                },
                field: {
                    name: "new output",
                    type: "Object",
                },
                output: {
                    vector: {
                        id: "8a50a102-c5ac-4b27-bec9-d70b79b80cff",
                    },
                    field: {
                        name: "new output",
                        type: "Object",
                    },
                },
            };
            state.mouse.lmb = true;
            mouse(state, {
                ...state.mouse,
                lmb: false,
            });
            expect(state.graph.vectors[0].edges[1].connectors[0].field).toEqual("bar");
            expect(state.movingConnector).toEqual(null);
        });
        it("Move a connector, but type mismatch error instead", () => {
            state.hoveredPort = {
                type: "input",
                field: {
                    type: "String",
                    name: "bar",
                },
                vector: {
                    id: "foo",
                },
            };
            state.movingConnector = {
                connector: {
                    id: "e4d21455-b3fb-4a3d-84cd-0b936d26e913",
                },
                field: {
                    name: "new output",
                    type: "Number",
                },
                output: {
                    vector: {
                        id: "8a50a102-c5ac-4b27-bec9-d70b79b80cff",
                    },
                    field: {
                        name: "new output",
                        type: "Number",
                    },
                },
            };
            state.mouse.lmb = true;
            mouse(state, {
                ...state.mouse,
                lmb: false,
            });
            expect(state.connectorWarn).toEqual("Cannot connect Number to String");
        });
        it("Add a connector", () => {
            state.hoveredPort = {
                type: "input",
                field: {
                    type: "Object",
                    name: "bar",
                },
                vector: {
                    id: "foo",
                },
            };
            state.addingConnector = {
                connector: {
                    id: "e4d21455-b3fb-4a3d-84cd-0b936d26e913",
                },
                field: {
                    name: "new output",
                    type: "Object",
                },
                vector: {
                    id: "8a50a102-c5ac-4b27-bec9-d70b79b80cff",
                },
            };
            state.mouse.lmb = true;
            mouse(state, {
                ...state.mouse,
                lmb: false,
            });
            expect(state.graph.vectors[0].edges[1].connectors[2].field).toEqual("bar");
            expect(state.addingConnector).toEqual(null);
        });
        it("Should drop any moving vectors or connectors and reset translating state", () => {
            state.mouse.lmb = true;
            state.selectedConnectors = [{
                id: "e4d21455-b3fb-4a3d-84cd-0b936d26e913",
            }];
            state.selectedVectors = [state.graph.vectors[0]];
            state.movingVectors = [state.graph.vectors[0]];
            state.primaryGroup = state.graph.vectors[0].properties.groups[0];
            state.selectedVector = state.graph.vectors[0];
            mouse(state, {
                ...state.mouse,
                lmb: false,
            });
            expect(state.movingVectors).toEqual([]);
            expect(state.selectedConnectors).toEqual([]);
            expect(state.selectedVectors).toEqual([]);
            expect(state.primaryGroup).toEqual(null);
            expect(state.selectedVector).toEqual(null);
        });
        it("Start moving a vector solo (not part of the selection)", () => {
            state.hoveredVector = state.graph.vectors[0];
            state.translating = {
                view: state.view,
                mouse: state.mouse,
                vectors: state.graph.vectors,
            };
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(state.movingVectors).toEqual([state.graph.vectors[0]]);
        });
        it("Start moving a vector when it is part of a selection, should expand movement to selection", () => {
            state.hoveredVector = state.graph.vectors[0];
            state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
            state.translating = {
                view: state.view,
                mouse: state.mouse,
                vectors: state.graph.vectors,
            };
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(state.movingVectors).toEqual([state.graph.vectors[0], state.graph.vectors[1]]);
        });
        it("Select a vector", () => {
            state.hoveredVector = state.graph.vectors[0];
            state.translating = {
                view: state.view,
                mouse: state.mouse,
                vectors: state.graph.vectors,
            };
            state.mouse.lmb = true;
            mouse(state, {
                ...state.mouse,
                lmb: false,
            });
            expect(state.selectedVectors).toEqual([state.graph.vectors[0]]);
        });
        it("Add vector to the selection", () => {
            state.hoveredVector = state.graph.vectors[0];
            state.selectedVectors = [state.graph.vectors[1]];
            state.translating = {
                view: state.view,
                mouse: state.mouse,
                vectors: state.graph.vectors,
            };
            state.mouse.lmb = true;
            state.keys[shiftKeyCode] = true;
            mouse(state, {
                ...state.mouse,
                lmb: false,
            });
            expect(JSON.stringify(state.selectedVectors)).toMatch(/93782913-4009-4a1d-a088-ace304f5dcbc/);
            expect(JSON.stringify(state.selectedVectors)).toMatch(/4a477b3e-2ff6-411b-abb2-b7055b0b769b/);
        });
        it("Select vectors in the selection rect, check bounding box size", () => {
            state.selectionRect.visible = true;
            state.translating.view = state.view;
            state.translating.mouse = {
                ...state.mouse,
                x: 100,
                y: 100,
                lmb: true,
            };
            state.hoveredConnector = "foo";
            mouse(state, {
                ...state.mouse,
                lmb: true,
            });
            expect(JSON.stringify(state.selectedVectors)).toMatch(/93782913-4009-4a1d-a088-ace304f5dcbc/);
            expect(JSON.stringify(state.selectedVectors)).toMatch(/4a477b3e-2ff6-411b-abb2-b7055b0b769b/);
            expect(state.boundingRect).toEqual({"bottom": 740, "height": 890, "right": 2560, "width": 940, "x": 1620, "y": -150});
        });
        it("Select a vector, expect group to expand", () => {
            const groupId = "6a477b3e-2ff6-411b-abb2-b7055b0b7633";
            state.graphSnapshot.vectors[0].properties.groups = [groupId];
            state.graphSnapshot.vectors[1].properties.groups = [groupId];
            state.hoveredVector = state.graphSnapshot.vectors[0];
            state.translating = {
                view: state.view,
                mouse: state.mouse,
                vectors: state.graphSnapshot.vectors,
            };
            state.mouse.lmb = true;
            mouse(state, {
                ...state.mouse,
                lmb: false,
            });
            expect(JSON.stringify(state.selectedVectors)).toMatch(/8a50a102-c5ac-4b27-bec9-d70b79b80cff/);
            expect(JSON.stringify(state.selectedVectors)).toMatch(/a1a300c0-d282-49bf-9774-f15cc4ff10e7/);
        });
        it("Should translate the view", () => {
            state.selectionRect.visible = true;
            state.translating.view = state.view;
            state.translating.mouse = {
                ...state.mouse,
                x: 100,
                y: 100,
                mmb: true,
            };
            mouse(state, {
                ...state.mouse,
                mmb: true,
            });
            expect(state.view).toEqual({"k": 1, "x": -100, "y": -100});
        });
    });
});