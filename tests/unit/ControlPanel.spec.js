// import Vue from "vue";
import { shallowMount, createLocalVue } from "@vue/test-utils";
import ControlPanel from "../../src/components/ControlPanel.vue";
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
describe("ControlPanel.vue", () => {
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
                    x: 10,
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
        wrapper = shallowMount(ControlPanel, {
            localVue,
            store,
            vuetify,
            propsData: {},
        });
        actions = storeConfig.actions;
        mutations = storeConfig.mutations;
        state = storeConfig.state;
    });
    describe("ControlPanel Methods", () => {
        it("Should render control panel", (done) => {
            expect(wrapper.html()).toMatch("Vector Set Code");
            expect(wrapper.html()).toMatch("Graph Logs and State");
            expect(wrapper.html()).toMatch("help-topic=\"dragResizePanel\"");
            done();
        });
        it("Should open a panel when selectPanel is called with a panel name", (done) => {
            wrapper.vm.selectPanel("set");
            wrapper.vm.$nextTick(() => {
                expect(wrapper.html()).toMatch("No Vectors Selected");
                done();
            });
        });
        it("Should open a panel when selectPanel is called with a panel name", (done) => {
            wrapper.vm.startPanelDrag();
            wrapper.vm.$nextTick(() => {
                expect(wrapper.vm.panelDragging).not.toEqual(undefined);
                done();
            });
        });
        it("Should move a panel when the mouse moves", (done) => {
            wrapper.vm.startPanelDrag();
            state.mouse.x = 100;
            wrapper.vm.mouseTranslate();
            wrapper.vm.$nextTick(() => {
                expect(wrapper.vm.navWidth).toEqual(540);
                done();
            });
        });
    });
});
