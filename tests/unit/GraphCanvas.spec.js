// import Vue from "vue";
import { shallowMount, createLocalVue } from "@vue/test-utils";
import GraphCanvas from "../../src/components/GraphCanvas.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import logsJson from "../stubs/logs.json";
import acidJson from "../stubs/acid.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let state;
let acid;
let logs;
let mutations;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("GraphCanvas.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        logs = JSON.parse(JSON.stringify(logsJson));
        storeConfig = {
            state: {
                selectedConnectors: [],
                hoveredConnector: [],
                errorConnectors: [],
                watchConnectors: [],
                activityConnectors: [],
                movingConnector: null,
                loading: {},
                presentation: false,
                jsonMimeType: "application/json",
                vectorMimeType: "application/json+plastic-io",
                historyPosition: 0,
                addingConnector: null,
                selectionRect: {visible: false},
                boundingRect: {visible: false},
                selectedVectors: [],
                graphSnapshot: acid,
                log: logs,
                domainTags: [],
                translating: {},
                keys: {},
                graph: acid,
                locked: false,
                scheduler: {
                    state: {
                        foo: "bar",
                    },
                },
                preferences: {
                    appearance: {
                        showGrid: false,
                        connectors: {
                            strokeStyle: "green",
                        }
                    },
                },
                mouse: {
                    lmb: false,
                    rmb: false,
                    mmb: false,
                    x: 0,
                    y: 0
                },
                view: {
                    x: 0,
                    y: 0,
                    k: 1,
                },
                selectedVector: null,
            },
            actions: {
                createNewVector: jest.fn(),
                addItem: jest.fn(),
                importItem: jest.fn(),
            },
            mutations: {
                setArtifact: jest.fn(),
                selectVector: jest.fn(),
            },
            getters: {
                getField: () => {
                    return jest.fn();
                },
            },
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = shallowMount(GraphCanvas, {
            localVue,
            store,
            vuetify,
            propsData: {},
        });
        actions = storeConfig.actions;
        mutations = storeConfig.mutations;
        state = storeConfig.state;
    });
    describe("GraphCanvas Methods", () => {
        it("Should render graph canvas", (done) => {
            expect(wrapper.html()).toMatch("edge-connector-stub");
            expect(wrapper.html()).toMatch("graph-vector-stub vector");
            expect(wrapper.html()).toMatch("transform: translate(0px, 0px) scale(1)");
            done();
        });
        it("Dragover should show dropEffect link", (done) => {
            const e = {
                preventDefault: jest.fn(),
                dataTransfer: {
                    dropEffect: null,
                }
            };
            wrapper.vm.dragOver(e);
            expect(e.dataTransfer.dropEffect).toEqual("link");
            expect(e.preventDefault).toHaveBeenCalled();
            done();
        });
        it("Drop file should produce a call to importItem action with the data", (done) => {
            const e = {
                clientX: 100,
                clientY: 100,
                dataTransfer: {
                    getData(mimeType) {
                        if (mimeType === state.jsonMimeType) {
                            return JSON.stringify({
                                type: "newVector"
                            });
                        }
                    },
                },
            };
            wrapper.vm.drop(e);
            expect(actions.importItem.mock.calls[0][1]).toEqual({"item": {"type": "newVector"}});
            done();
        });
        it("Drop new vector should produce a call to createNewVector action with the data", (done) => {
            const e = {
                clientX: 100,
                clientY: 100,
                dataTransfer: {
                    getData(mimeType) {
                        if (mimeType === state.vectorMimeType) {
                            return JSON.stringify({
                                type: "newVector"
                            });
                        }
                    },
                },
            };
            wrapper.vm.drop(e);
            expect(actions.createNewVector.mock.calls[0][1]).toEqual({"x": 100, "y": 100});
            done();
        });
        it("Drop plastic item should produce a call to addItem action with the data", (done) => {
            const e = {
                clientX: 100,
                clientY: 100,
                dataTransfer: {
                    getData(mimeType) {
                        if (mimeType === state.vectorMimeType) {
                            return JSON.stringify({
                                type: "publishedGraph"
                            });
                        }
                    },
                },
            };
            wrapper.vm.drop(e);
            expect(actions.addItem.mock.calls[0][1]).toEqual({"x": 100, "y": 100, type: "publishedGraph"});
            done();
        });        
    });
});
