import actions from "@/store/actions";
import graph from "../../stubs/graph.json";
describe("Bummer in the summer", () => {
    let context;
    beforeEach(() => {
        context = {
            state: {
                jsonMimeType: "application/json",
                graph: JSON.parse(JSON.stringify(graph)),
                dataProviders: {
                    preferences: {
                        asyncUpdate: false,
                        get() {
                            return context.dataProvidersResponse.preferences.get;
                        },
                        set: jest.fn(),
                        subscribe: jest.fn(),
                    },
                    graph: {
                        asyncUpdate: false,
                        get() {
                            return context.dataProvidersResponse.graph.get;
                        },
                        set: jest.fn(),
                        delete: jest.fn(),
                        subscribe: jest.fn(),
                    },
                    artifact: {
                        asyncUpdate: false,
                        get() {
                            return context.dataProvidersResponse.graph.get;
                        },
                        set: jest.fn(),
                        delete: jest.fn(),
                        subscribe: jest.fn(),
                    },
                    publish: {
                        asyncUpdate: false,
                        get() {
                            return context.dataProvidersResponse.publish.get;
                        },
                        set: jest.fn(),
                        delete: jest.fn(),
                        subscribe: jest.fn(),
                    },
                    toc: {
                        asyncUpdate: false,
                        get() {
                            return context.dataProvidersResponse.publish.get;
                        },
                        set: jest.fn(),
                        delete: jest.fn(),
                        subscribe: jest.fn(),
                    },
                    notification: {
                        asyncUpdate: false,
                        get() {
                            return context.dataProvidersResponse.publish.get;
                        },
                        set: jest.fn(),
                        delete: jest.fn(),
                        subscribe: jest.fn(),
                    },
                },
                scheduler: {
                    state: {},
                    errors: {},
                    instance: null,
                },
                preferences: {
                    debug: true,
                },
            },
            commit: jest.fn(),
            dispatch: jest.fn(),
            fetchResponse: {},
            dataProvidersResponse: {
                graph: {
                    get: {},
                },
                publish: {
                    get: {},
                },
                preferences: {
                    get: {},
                },
            },
        };
        global.fetch = async () => {
            return {
                json: async () => {
                    return context.fetchResponse;
                },
            };
        };
    });
    it("Should fectch vector and graph resources from the public registry and commit getPublicRegistry", async () => {
        context.fetchResponse = {
            items: [
                {
                    type: "publishedVector",
                    artifact: "1234",
                },
                {
                    type: "publishedGraph",
                    artifact: "3421",
                }
            ],
        };
        await actions.getPublicRegistry(context, {
            url: "1234",
            parent: {
                url: "1234",
            }
        });
        expect(context.commit.mock.calls[0]).toEqual(["setRegistry", {"parent": {"url": "1234"}, "toc": {"items": [{"artifact": "1234", "type": "publishedVector"}, {"artifact": "3421", "type": "publishedGraph"}], "url": "1234"}, "url": "1234"}]);
    });
    it("Should fectch TOC resources from the public registry and commit getPublicRegistry", async () => {
        context.fetchResponse = {
            items: [
                {
                    type: "toc",
                    artifact: "1234",
                }
            ],
        };
        await actions.getPublicRegistry(context, {
            url: "1234",
            parent: {
                url: "1234",
            }
        });
        expect(context.commit.mock.calls[0]).toEqual(["setRegistry", {"parent": {"url": "1234"}, "toc": {"items": [{"artifact": "1234", "type": "toc", "url": "1234"}], "url": "1234"}, "url": "1234"}]);
        expect(context.dispatch.mock.calls[0]).toEqual(["getPublicRegistry", {"parent": {"artifact": "1234", "type": "toc", "url": "1234"}, "url": "1234"}]);
    });
    it("Should fectch vector and graph resources from the public registry and commit getPublicRegistry", async () => {
        const setAttribute = jest.fn();
        const removeChild = jest.fn();
        const appendChild = jest.fn();
        const click = jest.fn();
        context.dataProvidersResponse.publish.get = {
            foo: "bar",
        };
        Object.defineProperty(document.body, "appendChild", {
            value: (e) => {
                appendChild(e);
            },
        });
        Object.defineProperty(document.body, "removeChild", {
            value: (e) => {
                removeChild(e);
            },
        });
        Object.defineProperty(document, "createElement", {
            value: () => {
                return {
                    click,
                    setAttribute,
                };
            },
        });
        await actions.download(context, {
            type: "artifact",
            id: "1234",
            version: 1,
        });
        expect(setAttribute).toHaveBeenCalledWith("download", "Untitled_1234_1_artifact.json");
        expect(setAttribute).toHaveBeenCalledWith("href", "data:application/json;charset=utf-8,%7B%7D");
        expect(appendChild).toHaveBeenCalled();
        expect(click).toHaveBeenCalled();
        expect(removeChild).toHaveBeenCalled();
    });
    it("Should instantiate a graph scheduler", () => {
        actions.instantiateGraph(context);
        expect(context.commit).toHaveBeenCalledWith("addLogItem", {"event": "Scheduler started", "eventName": "debug"});
        expect(context.commit).toHaveBeenCalledWith("addLogItem", {"event": "Startup parameters set", "eventName": "debug"});
        expect(context.commit).toHaveBeenCalledWith("addLogItem", {"event": "Scheduler: Add event beginconnector", "eventName": "debug"});
    });
    it("Should call url on the scheduler when graphUrl is called", async (done) => {
        context.state.scheduler.instance = {
            url: jest.fn(),
        };
        await actions.graphUrl(context, "8a50a102-c5ac-4b27-bec9-d70b79b80cff");
        expect(context.state.scheduler.instance.url).toHaveBeenCalledWith("8a50a102-c5ac-4b27-bec9-d70b79b80cff");
        done();
    });
    it("Should publish a graph when publishedGraph is called, then call getToc", async () => {
        await actions.publishGraph(context);
        expect(JSON.stringify(context.state.dataProviders.publish.set.mock.calls[0][1])).toMatch(/4a477b3e-2ff6-411b-abb2-b7055b0b769b/);
        expect(context.dispatch).toHaveBeenCalledWith("getToc");
    });
    it("Should publish a vector when publishVector is called", async () => {
        await actions.publishVector(context, "8a50a102-c5ac-4b27-bec9-d70b79b80cff");
        expect(JSON.stringify(context.state.dataProviders.publish.set.mock.calls[0][1])).toMatch(/8a50a102-c5ac-4b27-bec9-d70b79b80cff/);
        expect(context.dispatch).toHaveBeenCalledWith("getToc");
    });
    it("Should fetch toc from the data provider.", async () => {
        context.dataProvidersResponse.publish.get = "foo";
        await actions.getToc(context);
        expect(context.commit).toHaveBeenCalledWith("setToc", "foo");
    });
    it("Should write a new toc document if dataProviders.graph.get throws an error with 'not found'.", async () => {
        global.console.warn = () => {};
        context.state.dataProviders.graph.get = () => {
            throw new Error("Resource not found");
        };
        await actions.getToc(context);
        expect(context.commit).toHaveBeenCalledWith("setToc", {});
    });
    it("Should create a new graph and dispatch save.", async () => {
        await actions.create(context);
        expect(context.dispatch.mock.calls[0][0]).toEqual("save");
        expect(context.dispatch.mock.calls[0][1].properties.icon).toEqual("mdi-graph");
    });
    it("Should remove an artifact when calling removeArtifact.", async () => {
        await actions.removeArtifact(context, {
            id: "foo",
            version: 1,
        });
        expect(context.state.dataProviders.publish.delete).toHaveBeenCalledWith("artifacts/foo.1");
        expect(context.dispatch).toHaveBeenCalledWith("getToc");
    });
    it("Should remove a graph when calling remove.", async () => {
        await actions.remove(context, "foo");
        expect(context.state.dataProviders.graph.delete).toHaveBeenCalledWith("foo");
        expect(context.dispatch).toHaveBeenCalledWith("getToc");
    });
    it("Should save preferences when calling savePreferences.", async () => {
        await actions.savePreferences(context);
        expect(context.state.dataProviders.preferences.set).toHaveBeenCalledWith("preferences", {"preferences": {"debug": true}});
    });
    it("Should save diff to the graph to the event store, no async update response. (!context.state.dataProviders.graph.asyncUpdate)", async () => {
        context.state.graph = {id: "123", foo: "bar", version: 0};
        context.state.remoteSnapshot = {id: "123", foo: "baz", version: 0};
        actions.save(context);
        // save debounce requires waiting
        setTimeout(() => {
            expect(context.state.dataProviders.graph.set).toHaveBeenCalled();
            expect(context.state.dataProviders.graph.set.mock.calls[0][1].changes[0]).toEqual({"kind": "E", "lhs": "baz", "path": ["foo"], "rhs": "bar"});
            expect(context.commit).toHaveBeenCalledWith("setGraphVersion", 1);
        }, 600);
    });
    it("Should save diff to the graph to the event store, expect async response. (context.state.dataProviders.graph.asyncUpdate)", async () => {
        context.state.graph = {id: "123", foo: "bar", version: 0};
        context.state.remoteSnapshot = {id: "123", foo: "baz", version: 0};
        context.state.dataProviders.graph.asyncUpdate = true;
        actions.save(context);
        // save debounce requires waiting
        setTimeout(() => {
            expect(context.state.dataProviders.graph.set).toHaveBeenCalled();
            expect(context.state.dataProviders.graph.set.mock.calls[0][1].changes[0]).toEqual({"kind": "E", "lhs": "baz", "path": ["foo"], "rhs": "bar"});
            expect(context.state.dataProviders.graph.set.mock.calls[0][1].changes[1]).not.toEqual({"kind": "E", "lhs": 0, "path": ["version"], "rhs": 1});
        }, 600);
    });
    it("Should save diff by passing in arbitrary graph state.", async () => {
        context.state.remoteSnapshot = {};
        context.state.graphSnapshot = {};
        actions.save(context, {id: "123", foo: "fiz", version: 0});
        setTimeout(() => {
            expect(context.commit.mock.calls[0][0]).toEqual("resetLoadedState");
            expect(context.commit.mock.calls[0][1]).toEqual({id: "123", foo: "fiz", version: 0});
        }, 600);
    });
    it("Should commit open and dispatch instantiateGraph when calling open.", async () => {
        context.dataProvidersResponse.graph.get = "bar";
        await actions.open(context, {
            graphId: "foo",
        });
        expect(context.commit).toHaveBeenCalledWith("open", "bar");
        expect(context.dispatch).toHaveBeenCalledWith("instantiateGraph");
    });
    it("Should add a vector item from a remote source: URL.", async () => {
        global.fetch = async () => {
            return {
                json: async () => {
                    return "item";
                },
            };
        };
        await actions.addItem(context, {
            id: "1234",
            version: 1,
            type: "publishedVector",
            url: "/someUrl",
        });
        expect(context.commit).toHaveBeenCalledWith("addVectorItem", {"id": "1234", "item": "item", "type": "publishedVector", "url": "/someUrl", "version": 1});
    });
    it("Should add a vector item from a remote source: URL.", async () => {
        global.fetch = async () => {
            return {
                json: async () => {
                    return "item";
                },
            };
        };
        await actions.addItem(context, {
            id: "1234",
            version: 1,
            type: "publishedGraph",
            url: "/someUrl",
        });
        expect(context.commit).toHaveBeenCalledWith("addGraphItem", {"id": "1234", "item": "item", "type": "publishedGraph", "url": "/someUrl", "version": 1});
    });
    it("Should commit setPresentation to toggle presentation when togglePresentation is called.", () => {
        actions.togglePresentation(context);
        expect(context.commit).toHaveBeenCalledWith("setPresentation", true);
    });
    it("Should commit setLock to toggle locked when toggleLock is called.", () => {
        actions.toggleLock(context);
        expect(context.commit).toHaveBeenCalledWith("setLock", true);
    });
    it("Should commit setPreferences and dispatch savePreferences when preferences is called.", () => {
        actions.preferences(context, "foo");
        expect(context.commit).toHaveBeenCalledWith("setPreferences", "foo");
        expect(context.dispatch).toHaveBeenCalledWith("savePreferences");
    });
    [
        {key: "setLoadingStatus"},
        {key: "setDataProviders"},
        {key: "clearError"},
        {key: "raiseError"},
        {key: "changeConnectorOrder", save: true},
        {key: "deleteConnector", save: true},
        {key: "updateVectorFields", save: true},
        {key: "createNewVector", save: true},
        {key: "updateGraphProperties", save: true},
        {key: "updateVectorProperties", save: true},
        {key: "changeInputOrder", save: true},
        {key: "changeOutputOrder", save: true},
        {key: "addInput", save: true},
        {key: "addOutput", save: true},
        {key: "removeInput", save: true},
        {key: "removeOutput", save: true},
        {key: "updateTemplate", save: true},
        {key: "undo", save: true, noParam: true},
        {key: "redo", save: true, noParam: true},
        {key: "moveHistoryPosition", save: true},
        {key: "duplicateSelection", save: true, noParam: true},
        {key: "pasteVectors", save: true},
        {key: "bringForward", save: true, noParam: true},
        {key: "sendBackward", save: true, noParam: true},
        {key: "bringToFront", save: true, noParam: true},
        {key: "sendToBack", save: true, noParam: true},
        {key: "groupSelected", save: true, noParam: true},
        {key: "ungroupSelected", save: true, noParam: true},
        {key: "deleteSelected", save: true, noParam: true},
        {key: "hoveredPort"},
        {key: "hoveredVector"},
        {key: "selectConnector"},
        {key: "hoveredConnector"},
        {key: "translating"},
        {key: "keyup"},
        {key: "keydown"},
        {key: "view"},
        {key: "mouse"},
        {key: "lut"},
        {key: "lut"},
        {key: "graph", save: true},
    ].forEach((d) => {
        it("Should call commit " + d.key + " when action "+ d.key + " action is called." + (d.save ? " And dispatch save." : ""), () => {
            if (d.noParam) {
                actions[d.key](context);
                expect(context.commit).toHaveBeenCalledWith(d.key);
            } else {
                actions[d.key](context, "foo");
                expect(context.commit).toHaveBeenCalledWith(d.key, "foo");
            }
            if (d.save) {
                expect(context.dispatch).toHaveBeenCalledWith("save");
            }
        });
    });
    it("Should subscibe to dataProviders when calling subscribePreferences action.", async () => {
        actions.subscribePreferences(context);
        expect(context.state.dataProviders.preferences.subscribe).toHaveBeenCalled();
    });
    it("Should subscibe to dataProviders when calling subscribeToc action.", async () => {
        actions.subscribeToc(context);
        expect(context.state.dataProviders.notification.subscribe).toHaveBeenCalled();
    });
    it("Should subscibe to dataProviders when calling subscribe action.", async () => {
        actions.subscribe(context, "foo");
        expect(context.state.dataProviders.notification.subscribe).toHaveBeenCalled();
    });
});
