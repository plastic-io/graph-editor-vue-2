// import Vue from "vue";
import { shallowMount, createLocalVue } from "@vue/test-utils";
import EdgeProperties from "@/components/EdgeProperties.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import logsJson from "../../stubs/logs.json";
import acidJson from "../../stubs/acid.json";
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
describe("EdgeProperties.vue", () => {
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
                selectedVectors: [
                    acid.vectors[0],
                ],
                ioTypes: [
                    "Object",
                    "String",
                    "Boolean",
                    "Number",
                    "null",
                    "undefined",
                ],
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
                    x: 10,
                    y: 0
                },
                view: {
                    x: 0,
                    y: 0,
                    k: 1,
                },
                selectedVector: acid.vectors[0],
            },
            actions: {
                deleteConnector: jest.fn(),
                selectConnector: jest.fn(),
                hoveredConnector: jest.fn(),
                moveHistoryPosition: jest.fn(),
                changeConnectorOrder: jest.fn(),
                changeOutputOrder: jest.fn(),
                changeInputOrder: jest.fn(),
                addOutput: jest.fn(),
                addInput: jest.fn(),
                removeInput: jest.fn(),
                removeOutput: jest.fn(),
                updateVectorFields: jest.fn(),
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
        wrapper = shallowMount(EdgeProperties, {
            localVue,
            store,
            vuetify,
            propsData: {},
        });
        actions = storeConfig.actions;
        mutations = storeConfig.mutations;
        state = storeConfig.state;
    });
    describe("EdgeProperties Methods", () => {
        it("Should edge properties", (done) => {
            expect(wrapper.html()).toMatch("help-topic=\"edge\"");
            done();
        });
        it("Should warn about removing connectors that are still in use", (done) => {
            wrapper.vm.remove("output", {
                name: "proxy",
            }, false);
            wrapper.vm.$nextTick(() => {
                expect(wrapper.vm.showMessage).toEqual(true);
            });
            done();
        });
        it("Should removing an output connector that is still in use when override is used", (done) => {
            wrapper.vm.remove("outputs", {
                name: "proxy",
            }, true);
            expect(actions.removeOutput).toHaveBeenCalled();
            done();
        });
        it("Should removing an input connector that is still in use when override is used", (done) => {
            wrapper.vm.remove("inputs", {
                name: "proxy",
            }, true);
            expect(actions.removeInput).toHaveBeenCalled();
            done();
        });
        it("Should call addInput when add is called on an input", (done) => {
            wrapper.vm.add("inputs", {
                name: "proxy",
            });
            expect(actions.addInput).toHaveBeenCalled();
            done();
        });
        it("Should call addOutput when add is called on an output", (done) => {
            wrapper.vm.add("outputs", {
                name: "proxy",
            });
            expect(actions.addOutput).toHaveBeenCalled();
            done();
        });
        it("Should call changeInputOrder when moveDown is called on an output", (done) => {
            wrapper.vm.moveDown("outputs", {
                name: "proxy",
            });
            expect(actions.changeOutputOrder).toHaveBeenCalled();
            done();
        });
        it("Should call changeInputOrder when moveDown is called on an input", (done) => {
            wrapper.vm.moveDown("inputs", {
                name: "proxy",
            });
            expect(actions.changeInputOrder).toHaveBeenCalled();
            done();
        });
        it("Should call changeInputOrder when moveUp is called on an output", (done) => {
            wrapper.vm.moveUp("outputs", {
                name: "proxy",
            });
            expect(actions.changeOutputOrder).toHaveBeenCalled();
            done();
        });
        it("Should call changeInputOrder when moveUp is called on an input", (done) => {
            wrapper.vm.moveUp("inputs", {
                name: "proxy",
            });
            expect(actions.changeInputOrder).toHaveBeenCalled();
            done();
        });
        it("Should get a list of output connectors when getConnectors is called", (done) => {
            const connectors = wrapper.vm.getConnectors("outputs", "proxy");
            expect(connectors[0].connector.field).toEqual("proxy");
            done();
        });
        it("Should get a list of input connectors when getConnectors is called", (done) => {
            const connectors = wrapper.vm.getConnectors("inputs", "proxy");
            expect(connectors[0].connector.field).toEqual("proxy");
            done();
        });
        it("Should call connectorSelect when connectorSelect is called", (done) => {
            wrapper.vm.connectorSelect("foo");
            expect(actions.selectConnector).toHaveBeenCalled();
            done();
        });
        it("Should call deleteConnector when removeConnector is called", (done) => {
            wrapper.vm.removeConnector("foo");
            expect(actions.deleteConnector).toHaveBeenCalled();
            done();
        });
        it("Should call changeConnectorOrder when moveConnectorDown is called", (done) => {
            wrapper.vm.moveConnectorDown({
                connector: {id: "1234"},
                vector: {id: "1234"},
            });
            expect(actions.changeConnectorOrder).toHaveBeenCalled();
            done();
        });
        it("Should call changeConnectorOrder when moveConnectorUp is called", (done) => {
            wrapper.vm.moveConnectorUp({
                connector: {id: "1234"},
                vector: {id: "1234"},
            });
            expect(actions.changeConnectorOrder).toHaveBeenCalled();
            done();
        });
        it("Should get info about an output connector", (done) => {
            const info = wrapper.vm.output({
                field: "proxy",
            });
            expect(info.field.external).toEqual(false);
            done();
        });
        it("Should get info about an input connector", (done) => {
            const info = wrapper.vm.input({
                vectorId: "v3",
                field: "proxy",
            });
            expect(info.field.external).toEqual(false);
            done();
        });
    });
});
