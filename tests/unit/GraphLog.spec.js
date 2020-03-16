// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import GraphLog from "../../src/components/GraphLog.vue";
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
describe("GraphLog.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        logs = JSON.parse(JSON.stringify(logsJson));
        storeConfig = {
            state: {
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
                updateGraphLog: jest.fn(),
                publishGraph: jest.fn(),
                save: jest.fn(),
            },
            mutations: {
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
        wrapper = mount(GraphLog, {
            localVue,
            store,
            vuetify,
            propsData: {},
        });
        actions = storeConfig.actions;
        mutations = storeConfig.mutations;
        state = storeConfig.state;
    });
    describe("GraphLog Methods", () => {
        it("Should render graph logs", (done) => {
            expect(wrapper.html()).toMatch(">1<");
            expect(wrapper.html()).toMatch("Info");
            expect(wrapper.html()).toMatch("bar");
            done();
        });
    });
});
