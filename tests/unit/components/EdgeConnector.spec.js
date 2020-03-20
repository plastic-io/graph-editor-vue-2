// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import EdgeConnector from "@/components/EdgeConnector.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import logsJson from "../../stubs/logs.json";
import acidJson from "../../stubs/acid.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let acid;
let logs;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("EdgeConnector.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        logs = JSON.parse(JSON.stringify(logsJson));
        storeConfig = {
            state: {
                selectedConnectors: [],
                hoveredConnector: null,
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
        wrapper = mount(EdgeConnector, {
            localVue,
            store,
            vuetify,
            propsData: {
                connector: acid.vectors[0].edges[0].connectors[0],
                vector: acid.vectors[0],
                edge: acid.vectors[0].edges[0],
            },
        });
    });
    describe("EdgeConnector Methods", () => {
        it("Should edge properties", (done) => {
            done();
        });
        it("Should increment calls when redraw is called", (done) => {
            wrapper.vm.redraw();
            wrapper.vm.$nextTick(() => {
                expect(wrapper.vm.calls).toEqual(2);
            });
            done();
        });
    });
});
