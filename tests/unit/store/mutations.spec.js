import mutations, {applyGraphChanges, newId, addVectorItem,
    nudgeUp, nudgeDown, nudgeLeft, nudgeRight, addGraphItem} from "@/store/mutations";
import graph from "../../stubs/graph.json";
import graphArtifact from "../../stubs/graphArtifact.json";
import vectorArtifact from "../../stubs/vectorArtifact.json";
let time = 0;
let state;
global.Date = {
    now: () => {
        // increment after return
        return time++;
    },
};
describe("Mutation ethods", () => {
    beforeEach(() => {
        time = 0;
        state = {
            dataProviders: {
                graph: {
                    asyncUpdate: false,
                },
            },
            selectedConnectors: [],
            selectedVector: null,
            historyPosition: 0,
            events: [],
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
    it("Should use deep-diff to apply graph changes and create events from the changes.", () => {
        state = {
            historyPosition: 0,
            events: [],
            graph: {},
            graphSnapshot: {foo: "bar"},
        };
        state.graphSnapshot = {foo: "bar"};
        state.graph = {};
        applyGraphChanges(state, "event name");
        expect(state).toEqual({"events": [{"changes": [{"kind": "N", "path": ["foo"], "rhs": "bar"}], "name": "event name", "time": 0}], "graph": {"foo": "bar"}, "graphSnapshot": {"foo": "bar"}, "historyPosition": 1});
    });
    it("Should produce a valid UUIDv4.", () => {
        expect(newId()).toMatch(/........-....-4...-....-............/);
    });
    it("Should nudgeUp selectedVectors", () => {
        state.selectedVectors = [state.graph.vectors[0]];
        expect(state.graph.vectors[0].properties.y).toEqual(250);
        nudgeUp(state, 1);
        expect(state.graph.vectors[0].properties.y).toEqual(249);
    });
    it("Should nudgeDown selectedVectors", () => {
        state.selectedVectors = [state.graph.vectors[0]];
        expect(state.graph.vectors[0].properties.y).toEqual(250);
        nudgeDown(state, 1);
        expect(state.graph.vectors[0].properties.y).toEqual(251);
    });
    it("Should nudgeLeft selectedVectors", () => {
        state.selectedVectors = [state.graph.vectors[0]];
        expect(state.graph.vectors[0].properties.x).toEqual(1750);
        nudgeLeft(state, 1);
        expect(state.graph.vectors[0].properties.x).toEqual(1749);
    });
    it("Should nudgeRight selectedVectors", () => {
        state.selectedVectors = [state.graph.vectors[0]];
        expect(state.graph.vectors[0].properties.x).toEqual(1750);
        nudgeRight(state, 1);
        expect(state.graph.vectors[0].properties.x).toEqual(1751);
    });
    it("Should moveHistoryPosition", () => {
        state.selectedVectors = [state.graph.vectors[0]];
        expect(state.graph.vectors[0].properties.x).toEqual(1750);
        // apply two events
        nudgeRight(state, 1);
        nudgeRight(state, 1);
        // move back two events
        mutations.moveHistoryPosition(state, -2);
        expect(state.graph.vectors[0].properties.x).toEqual(1750);
        // move forward 1 event
        mutations.moveHistoryPosition(state, 1);
        expect(state.graph.vectors[0].properties.x).toEqual(1751);
        // move forward 1 event
        mutations.moveHistoryPosition(state, 1);
        expect(state.graph.vectors[0].properties.x).toEqual(1752);
    });
    it("Should paste copies of passed vectors with new IDs to avoid conflicts with existing vectors, then select pasted vectors.", () => {
        state.selectedVectors = [];
        mutations.pasteVectors(state, JSON.parse(JSON.stringify([state.graph.vectors[0]])));
        expect(state.selectedVectors.length).toEqual(1);
        Object.keys(state.graph.vectors[0].properties).forEach((key) => {
            expect(state.selectedVectors[0].properties[key]).toEqual(state.graph.vectors[0].properties[key]);
        });
        expect(state.selectedVectors[0].template.vue).toEqual(state.graph.vectors[0].template.vue);
        expect(state.selectedVectors[0].id).not.toEqual(state.graph.vectors[0].id);
        expect(state.selectedVectors[0].url).not.toEqual(state.graph.vectors[0].url);
    });
    it("Should select a vector by Id", () => {
        state.selectedVectors = [];
        mutations.selectVector(state, state.graph.vectors[0].id);
        expect(state.selectedVectors[0].id).toEqual(state.graph.vectors[0].id);
    });
    it("Should undo and redo", () => {
        state.selectedVectors = [state.graph.vectors[0]];
        expect(state.graph.vectors[0].properties.x).toEqual(1750);
        nudgeRight(state, 1);
        nudgeRight(state, 1);
        mutations.undo(state);
        mutations.undo(state);
        expect(state.graph.vectors[0].properties.x).toEqual(1750);
        mutations.redo(state);
        expect(state.graph.vectors[0].properties.x).toEqual(1751);
        mutations.redo(state);
        expect(state.graph.vectors[0].properties.x).toEqual(1752);
    });
    it("Should duplicate selected vectors with new IDs to avoid conflicts with existing vectors, then select pasted vectors.", () => {
        state.selectedVectors = [state.graph.vectors[0]];
        mutations.duplicateSelection(state);
        expect(state.selectedVectors.length).toEqual(1);
        Object.keys(state.graph.vectors[0].properties).forEach((key) => {
            expect(state.selectedVectors[0].properties[key]).toEqual(state.graph.vectors[0].properties[key]);
        });
        expect(state.selectedVectors[0].template.vue).toEqual(state.graph.vectors[0].template.vue);
        expect(state.selectedVectors[0].id).not.toEqual(state.graph.vectors[0].id);
        expect(state.selectedVectors[0].url).not.toEqual(state.graph.vectors[0].url);
    });
    it("Should bringForward selected vectors", () => {
        state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
        mutations.bringForward(state);
        expect(state.selectedVectors[0].properties.z).toEqual(1);
        expect(state.selectedVectors[1].properties.z).toEqual(1);
        expect(state.graph.vectors[2].properties.z).toEqual(0);
    });
    it("Should sendBackward selected vectors", () => {
        state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
        mutations.sendBackward(state);
        expect(state.selectedVectors[0].properties.z).toEqual(-1);
        expect(state.selectedVectors[1].properties.z).toEqual(-1);
        expect(state.graph.vectors[2].properties.z).toEqual(0);
    });
    it("Should bringToFront selected vectors", () => {
        state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
        mutations.bringForward(state);
        expect(state.selectedVectors[0].properties.z).toEqual(1);
        expect(state.selectedVectors[1].properties.z).toEqual(1);
        expect(state.graph.vectors[2].properties.z).toEqual(0);
        state.selectedVectors = [state.graph.vectors[2]];
        mutations.bringToFront(state);
        expect(state.graph.vectors[2].properties.z).toEqual(2);
        expect(state.graph.vectors[3].properties.z).toEqual(0);
    });
    it("Should sendToBack selected vectors", () => {
        state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
        mutations.sendBackward(state);
        expect(state.selectedVectors[0].properties.z).toEqual(-1);
        expect(state.selectedVectors[1].properties.z).toEqual(-1);
        expect(state.graph.vectors[2].properties.z).toEqual(0);
        state.selectedVectors = [state.graph.vectors[2]];
        mutations.sendToBack(state);
        expect(state.graph.vectors[2].properties.z).toEqual(-2);
        expect(state.graph.vectors[3].properties.z).toEqual(0);
    });
    it("Should add a linked graph vector to the graph when addGraphItem is called", () => {
        state.graph.vectors = [];
        state.graphSnapshot.vectors = [];
        addGraphItem(state, JSON.parse(JSON.stringify({
            x: 10,
            y: 10,
            id: graphArtifact.id,
            version: 0,
            item: graphArtifact,
        })));
        expect(state.graph.vectors.length).toEqual(1);
        expect(state.graph.vectors[0].linkedGraph.id).toEqual(graphArtifact.id);
        expect(state.graph.vectors[0].edges.length).toEqual(1);
        expect(state.graph.vectors[0].edges[0].field).toEqual("output");
    });
    it("Should add a linked vector to the graph when addVectorItem is called", () => {
        state.graph.vectors = [];
        state.graphSnapshot.vectors = [];
        addVectorItem(state, JSON.parse(JSON.stringify({
            x: 10,
            y: 10,
            id: vectorArtifact.id,
            version: 0,
            item: vectorArtifact,
        })));
        expect(state.graph.vectors.length).toEqual(1);
        expect(state.graph.vectors[0].linkedVector.id).toEqual(vectorArtifact.id);
        expect(state.graph.vectors[0].linkedVector.edges.length).toEqual(1);
        expect(state.graph.vectors[0].edges.length).toEqual(1);
        expect(state.graph.vectors[0].edges[0].field).toEqual(vectorArtifact.edges[0].field);
    });
    it("Should group selected vectors when groupSelected is called", () => {
        state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
        mutations.groupSelected(state);
        expect(state.graph.vectors[0].properties.groups[0]).toEqual(state.graph.vectors[1].properties.groups[0]);
    });
    it("Should group ungroupSelected vectors when groupSelected is called", () => {
        state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
        mutations.groupSelected(state);
        expect(state.graph.vectors[0].properties.groups[0]).toEqual(state.graph.vectors[1].properties.groups[0]);
        state.primaryGroup = state.graph.vectors[0].properties.groups[0];
        mutations.ungroupSelected(state);
        expect(state.graph.vectors[0].properties.groups[0]).toEqual(state.graph.vectors[1].properties.groups[0]);
    });
    it("Should group delete selected vectors, connectors and connectors connected to deleted vectors when deleteSelected is called", () => {
        state.selectedVectors = [state.graph.vectors[0], state.graph.vectors[1]];
        const id1 = state.graph.vectors[0].id;
        const id2 = state.graph.vectors[0].id;
        function findVectorByConnectingVectorId(id) {
            return state.graph.vectors.find((v) => {
                return v.edges.find((e) => {
                    return e.connectors.find((c) => {
                        return c.vectorId === id;
                    });
                });
            });
        }
        expect(findVectorByConnectingVectorId(id1)).not.toEqual(undefined);
        expect(state.graph.vectors.length).toEqual(8);
        mutations.deleteSelected(state);
        expect(state.graph.vectors.length).toEqual(6);
        expect(state.graph.vectors.find(v => v.id === id1 || v.id === id2)).toEqual(undefined);
        expect(findVectorByConnectingVectorId(id1)).toEqual(undefined);
    });
    it("Should set preferences when preferences is called", () => {
        state.preferences = undefined;
        mutations.preferences(state, "foo");
        expect(state.preferences).toEqual("foo");
    });
    it("Should set view when view is called", () => {
        state.view = undefined;
        mutations.view(state, "foo");
        expect(state.view).toEqual("foo");
    });
    it("Should set translating when translating is called", () => {
        state.translating = undefined;
        mutations.translating(state, "foo");
        expect(state.translating).toEqual("foo");
    });
    it("Should set hoveredConnector when hoveredConnector is called", () => {
        state.hoveredConnector = undefined;
        mutations.hoveredConnector(state, "foo");
        expect(state.hoveredConnector).toEqual("foo");
    });
    it("Should set hoveredVector when hoveredVector is called and state.movingVectors.length <= 0", () => {
        state.movingVectors = [];
        state.hoveredVector = undefined;
        mutations.hoveredVector(state, "foo");
        expect(state.hoveredVector).toEqual("foo");
    });
    it("Should not set hoveredVector when hoveredVector is called and state.movingVectors.length > 0", () => {
        state.movingVectors = ["bar"];
        state.hoveredVector = undefined;
        mutations.hoveredVector(state, "foo");
        expect(state.hoveredVector).toEqual(undefined);
    });
    it("Should set hoveredPort when hoveredPort is called", () => {
        state.hoveredPort = undefined;
        mutations.hoveredPort(state, "foo");
        expect(state.hoveredPort).toEqual("foo");
    });
    it("Should update the graph via difffing", () => {
        state.graph = {};
        mutations.graph(state, {foo: "bar"});
        expect(state.graph).toEqual({foo: "bar"});
    });
    it("Should set look up table item", () => {
        state.luts = {};
        mutations.lut(state, {
            connector: {
                id: 1234,
            },
            lut: [
                {x: 1, y: 1, height: 10, width: 10},
                {x: 2, y: 4, height: 10, width: 10},
                {x: 5, y: 6, height: 10, width: 10},
            ]
        });
        expect(state.luts).toEqual({"1234": {"connector": {"id": 1234}, "lut": [{"height": 10, "width": 10, "x": 1, "y": 1}, {"height": 10, "width": 10, "x": 2, "y": 4}, {"height": 10, "width": 10, "x": 5, "y": 6}]}});
    });
    it("Should clear error and showError when clearError is called", () => {
        state.error = new Error("notanerror");
        state.showError = true;
        mutations.clearError(state);
        expect(state.error).toEqual(null);
        expect(state.showError).toEqual(false);
    });
    it("Should set error to e and set showError = true when raiseError is called", () => {
        global.console.error = jest.fn();
        const e = new Error("notanerror");
        mutations.raiseError(state, e);
        expect(state.error).toEqual(e);
        expect(state.showError).toEqual(true);
        expect(global.console.error).toHaveBeenCalledWith(e);
    });
    it("Should update a keyed template on a vector when calling updateTemplate", () => {
        mutations.updateTemplate(state, {
            id: graph.vectors[0].id,
            key: "set",
            value: "foo"
        });
        expect(state.graph.vectors[0].template.set).toEqual("foo");
    });
    it("Should throw an error when calling updateTemplate on a vector that does not exist", () => {
        mutations.updateTemplate(state, {
            id: "notgonnawork",
            key: "set",
            value: "foo"
        });
        expect(state.showError).toEqual(true);
        expect(state.error.toString()).toEqual("Error: Cannot find vector to write to.");
    });
    it("Should change the order of input properties on a vector when calling changeInputOrder", () => {
        mutations.changeInputOrder(state, {
            vectorId: state.graph.vectors[0].id,
            name: "B",
            direction: "up",
        });
        expect(state.graph.vectors[0].properties.inputs[0].name).toEqual("B");
        mutations.changeInputOrder(state, {
            vectorId: state.graph.vectors[0].id,
            name: "B",
            direction: "down",
        });
        expect(state.graph.vectors[0].properties.inputs[0].name).toEqual("A");
    });
    it("Should change the order of input properties on a vector when calling changeInputOrder", () => {
        mutations.changeOutputOrder(state, {
            vectorId: state.graph.vectors[0].id,
            name: "a",
            direction: "down",
        });
        expect(state.graph.vectors[0].properties.outputs[0].name).toEqual("new output");
        expect(state.graph.vectors[0].edges[0].field).toEqual("new output");
        mutations.changeOutputOrder(state, {
            vectorId: state.graph.vectors[0].id,
            name: "a",
            direction: "up",
        });
        expect(state.graph.vectors[0].properties.outputs[0].name).toEqual("a");
        expect(state.graph.vectors[0].edges[0].field).toEqual("a");
    });
    it("Should set add an input property when addInput is called", () => {
        mutations.addInput(state, {
            vectorId: state.graph.vectors[0].id,
            name: "foo",
        });
        expect(state.graph.vectors[0].properties.inputs[2].name).toEqual("foo");
    });
    it("Should set add an output property when addOutput is called", () => {
        mutations.addOutput(state, {
            vectorId: state.graph.vectors[0].id,
            name: "foo",
        });
        expect(state.graph.vectors[0].properties.outputs[2].name).toEqual("foo");
        expect(state.graph.vectors[0].edges[2].field).toEqual("foo");
    });
    it("Should set remove an output property when removeOutput is called", () => {
        mutations.addOutput(state, {
            vectorId: state.graph.vectors[0].id,
            name: "foo",
        });
        expect(state.graph.vectors[0].properties.outputs[2].name).toEqual("foo");
        expect(state.graph.vectors[0].edges[2].field).toEqual("foo");
        mutations.removeOutput(state, {
            vectorId: state.graph.vectors[0].id,
            name: "foo",
        });
        expect(state.graph.vectors[0].properties.outputs[2]).toEqual(undefined);
        expect(state.graph.vectors[0].edges[2]).toEqual(undefined);
    });
    it("Should set remove an input property when removeInput is called", () => {
        mutations.addInput(state, {
            vectorId: state.graph.vectors[0].id,
            name: "foo",
        });
        expect(state.graph.vectors[0].properties.inputs[2].name).toEqual("foo");
        mutations.removeInput(state, {
            vectorId: state.graph.vectors[0].id,
            name: "foo",
        });
        expect(state.graph.vectors[0].properties.inputs[2]).toEqual(undefined);
    });
    it("Should update vector properties when updateVectorProperties", () => {
        mutations.updateVectorProperties(state, {
            vectorId: state.graph.vectors[0].id,
            properties: "foo",
        });
        expect(state.graph.vectors[0].properties).toEqual("foo");
    });
    it("Should update graph properties when updateGraphProperties", () => {
        mutations.updateGraphProperties(state, "foo");
        expect(state.graph.properties).toEqual("foo");
    });
    it("Should create a new vector when createNewVector is called", () => {
        expect(state.graph.vectors.length).toEqual(8);
        mutations.createNewVector(state, {
            x: 100,
            y: 110,
        });
        expect(state.graph.vectors.length).toEqual(9);
        expect(state.graph.vectors[state.graph.vectors.length - 1].properties.x).toEqual(100);
        expect(state.graph.vectors[state.graph.vectors.length - 1].properties.y).toEqual(110);
    });
    it("Should update name, external or type of an input or output, updating related edges", () => {
        ["inputs", "outputs"].forEach((ioKey) => {
            ["name", "external", "type"].forEach((key) => {
                const vector = JSON.parse(JSON.stringify(state.graph.vectors[0]));
                vector.properties[ioKey][0][key] = "foo";
                mutations.updateVectorFields(state, {
                    vector,
                });
                expect(state.graph.vectors[0].properties[ioKey][0][key]).toEqual("foo");
                if (ioKey === "outputs" && key === "field") {
                    expect(state.graph.vectors[0].edges[0].field).toEqual("foo");
                }
                if (ioKey === "inputs") {
                    expect(state.graph.vectors.find(v => v.id === "38834926-c400-4afb-bd4c-9581da0e0888")
                        .edges[0].connectors[0].field).toEqual("foo");
                }
            });
        });
    });
    it("Should delete a connector when deleteConnector is called.", () => {
        expect(state.graph.vectors[0].edges[0].connectors[0]).not.toEqual(undefined);
        mutations.deleteConnector(state, {
            id: state.graph.vectors[0].edges[0].connectors[0].id,
        });
        expect(state.graph.vectors[0].edges[0].connectors[0]).toEqual(undefined);
    });
    it("Should change connector order when changeConnectorOrder is called", () => {
        const cId = state.graph.vectors[0].edges[1].connectors[0].id;
        mutations.changeConnectorOrder(state, {
            vectorId: state.graph.vectors[0].id,
            connectorId: state.graph.vectors[0].edges[1].connectors[0].id,
            direction: "down"
        });
        expect(state.graph.vectors[0].edges[1].connectors[1].id).toEqual(cId);
        mutations.changeConnectorOrder(state, {
            vectorId: state.graph.vectors[0].id,
            connectorId: state.graph.vectors[0].edges[1].connectors[1].id,
            direction: "up"
        });
        expect(state.graph.vectors[0].edges[1].connectors[0].id).toEqual(cId);
    });
    it("Should set graph states when open is called", () => {
        state.graph = null;
        state.graphSnapshot = null;
        state.remoteSnapshot = null;
        mutations.open(state, {vectors: []});
        expect(state.graph).toEqual({vectors: []});
        expect(state.graphSnapshot).toEqual({vectors: []});
        expect(state.remoteSnapshot).toEqual({vectors: []});
    });
    it("Should set data providers by key when calling setDataProviders", () => {
        state.dataProviders = {};
        mutations.setDataProviders(state, {
            foo: "bar",
        });
        expect(state.dataProviders.foo).toEqual("bar");
    });
    it("Should add an item to the log when calling addLogItem", () => {
        state.log = [];
        mutations.addLogItem(state, {
            eventName: "bar",
        });
        expect(state.log[0]).toEqual({"_t": 0, "eventName": "bar"});
    });
    it("Should set loading status by key when calling setLoadingStatus", () => {
        state.loading = {};
        mutations.setLoadingStatus(state, {
            key: "foo",
            type: "bar",
            loading: true,
            event: "baz",
        });
        expect(state.loading.bar.foo[0]).toEqual({"event": "baz", "loading": true, "time": 0});
    });
    it("Should set preferences when setPreferences is called", () => {
        state.preferences = undefined;
        mutations.setPreferences(state, "foo");
        expect(state.preferences).toEqual("foo");
    });
    it("Should set graph version on the graph, vectors and connectors on the graph that are not remote to the graph", () => {
        mutations.setGraphVersion(state, 999);
        expect(state.graph.version).toEqual(999);
        expect(state.graph.vectors[0].version).toEqual(999);
        expect(state.graph.vectors[0].edges[0].connectors[0].version).toEqual(999);
    });
    it("Should set the toc when calling setToc", () => {
        state.toc = undefined;
        mutations.setToc(state, "foo");
        expect(state.toc).toEqual("foo");
    });
    it("Should set the presentation when calling setPresentation", () => {
        state.presentation = undefined;
        mutations.setPresentation(state, "foo");
        expect(state.presentation).toEqual("foo");
    });
    it("Should set locked when calling setLock", () => {
        state.locked = undefined;
        mutations.setLock(state, "foo");
        expect(state.locked).toEqual("foo");
    });
    it("Should update a vector's URL when calling updateVectorUrl", () => {
        mutations.updateVectorUrl(state, {
            vectorId: state.graph.vectors[0].id,
            url: "foo"
        });
        expect(state.graph.vectors[0].url).toEqual("foo");
    });
    it("Should clear the log of a given key when calling clearLog", () => {
        state.log = [];
        mutations.addLogItem(state, {
            eventName: "bar",
        });
        expect(state.log[0]).toEqual({"_t": 0, "eventName": "bar"});
        mutations.clearLog(state, "bar");
        expect(state.log.length).toEqual(0);
    });
    it("Should set connector activity by key", () => {
        state.activityConnectors = {};
        mutations.connectorActivity(state, {
            key: "foo",
        });
        expect(state.activityConnectors).toEqual({"foo": {"key": "foo"}});
    });
    it("Should add a keyed scheduler error whne calling addSchedulerError", () => {
        state.scheduler = {
            errors: {},
        };
        mutations.addSchedulerError(state, {
            key: "foo",
            error: "bar",
        });
        expect(state.scheduler.errors.foo[0]).toEqual("bar");
    });
    it("Should remove a single item from a keyed list when calling clearSchedulerErrorItem", () => {
        state.scheduler = {
            errors: {},
        };
        mutations.addSchedulerError(state, {
            key: "foo",
            error: "bar",
        });
        expect(state.scheduler.errors.foo[0]).toEqual("bar");
        mutations.clearSchedulerErrorItem(state, {
            key: "foo",
            item: "bar",
        });
        expect(state.scheduler.errors.foo[0]).toEqual(undefined);
    });
    it("Should clear a keyed list when calling clearSchedulerError", () => {
        state.scheduler = {
            errors: {},
        };
        mutations.addSchedulerError(state, {
            key: "foo",
            error: "bar",
        });
        mutations.addSchedulerError(state, {
            key: "foo",
            error: "bar",
        });
        expect(state.scheduler.errors.foo.length).toEqual(2);
        mutations.clearSchedulerError(state, {
            key: "foo",
        });
        expect(state.scheduler.errors.foo.length).toEqual(0);
    });
    it("Should toggle presentation when togglePresentation is called", () => {
        state.presentation = false;
        mutations.togglePresentation(state);
        expect(state.presentation).toEqual(true);
        mutations.togglePresentation(state);
        expect(state.presentation).toEqual(false);
    });
    it("Should set scheduler instance when setScheduler is called", () => {
        state.scheduler = {
            instance: null,
        };
        mutations.setScheduler(state, "foo");
        expect(state.scheduler.instance).toEqual("foo");
    });
    it("Should set a keyed artifact when setArtifact is called", () => {
        state.artifacts = {};
        mutations.setArtifact(state, {
            key: "foo",
            value: "bar",
        });
        expect(state.artifacts.foo).toEqual("bar");
    });
    it("Should update a vector's data when calling updateVectorData", () => {
        mutations.updateVectorData(state, {
            vectorId: state.graph.vectors[0].id,
            data: "foo"
        });
        expect(state.graph.vectors[0].data).toEqual("foo");
    });
    it("Should set the root registry item when calling setRegistry.", () => {
        state.registry = {};
        mutations.setRegistry(state, {
            url: "foo",
            bar: "baz",
        });
        expect(state.registry).toEqual({"foo": {"bar": "baz", "url": "foo"}});
    });
    it("Should set the parent item's _item property with a registry item and remove e.parent from e when calling setRegistryItem.", () => {
        const parent = {};
        const e = {
            parent,
            foo: "bar",
        };
        mutations.setRegistryItem(state, e);
        expect(parent).toEqual({"_item": {"foo": "bar"}});
    });
    it("Should toggle panelVisibility when togglePanelVisibility is called", () => {
        state.panelVisibility = false;
        mutations.togglePanelVisibility(state);
        expect(state.panelVisibility).toEqual(true);
        mutations.togglePanelVisibility(state);
        expect(state.panelVisibility).toEqual(false);
    });
    it("Should set scheduler state when setSchedulerState is called", () => {
        state.scheduler = {
            state: null,
        };
        mutations.setSchedulerState(state, "foo");
        expect(state.scheduler.state).toEqual("foo");
    });
    it("Should toggle showLabels when toggleLabels is called", () => {
        state.preferences = {
            showLabels: false,
        };
        mutations.toggleLabels(state);
        expect(state.preferences.showLabels).toEqual(true);
        mutations.toggleLabels(state);
        expect(state.preferences.showLabels).toEqual(false);
    });
    it("Should toggle showHelp when toggleHelp is called", () => {
        state.showHelp = false;
        mutations.toggleHelp(state);
        expect(state.showHelp).toEqual(true);
        mutations.toggleHelp(state);
        expect(state.showHelp).toEqual(false);
    });
    it("Should toggle showHelp when toggleHelp is called", () => {
        state.helpTopics = {};
        mutations.addHelpTopic(state, {
            topic: "foo",
            value: "bar",
        });
        expect(state.helpTopics).toEqual({"foo": {"topic": "foo", "value": "bar"}});
    });
});