// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import HelpOverlay from "../../src/components/HelpOverlay.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../stubs/acid.json";
import eventsJson from "../stubs/events.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let state;
let mutations;
let events;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("HelpOverlay.vue", () => {
    beforeEach(() => {
        events = JSON.parse(JSON.stringify(eventsJson));
        document.body.setAttribute("data-app", true);
        storeConfig = {
            state: {
                showHelp: false,
                translating: {},
                keys: {},
                events: events,
                graph: {
                    id: "321",
                    version: 0,
                    vectors: [{
                        id: "123",
                        properties: {
                            x: 0,
                            y: 0,
                            presentation: {
                                x: 0,
                                y: 0,
                            },
                        },
                    }],
                },
                locked: false,
                helpTopics: {
                    foo: {
                        title: "bar",
                        html: "bar",
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
                updateHelpOverlay: jest.fn(),
            },
            mutations: {
                updateVectorUrl: jest.fn(),
            },
            getters: {},
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = mount(HelpOverlay, {
            localVue,
            store,
            vuetify,
            propsData: {},
        });
        actions = storeConfig.actions;
        mutations = storeConfig.mutations;
        state = storeConfig.state;
    });
    describe("HelpOverlay Methods", () => {
        it("Should not draw the help overlay", (done) => {
            expect(wrapper.html()).toEqual(undefined);
            done();
        });
        it("Should draw the help overlay", (done) => {
            state.showHelp = true;
            wrapper.vm.$nextTick(() => {
                expect(wrapper.html()).toMatch("No help topic currently exists for this item.");
                done();
            });
        });
        it("Should draw the help overlay with the given topic", (done) => {
            state.showHelp = true;
            wrapper.vm.setTopic("foo");
            wrapper.vm.drawHelp();
            wrapper.vm.$nextTick(() => {
                expect(wrapper.html()).toMatch("bar");
                done();
            });
        });
    });
});
