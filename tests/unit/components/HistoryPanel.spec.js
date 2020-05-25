// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import HistoryPanel from "@/components/HistoryPanel.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import eventsJson from "../../stubs/events.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let state;
let events;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("HistoryPanel.vue", () => {
    beforeEach(() => {
        events = JSON.parse(JSON.stringify(eventsJson));
        document.body.setAttribute("data-app", true);
        storeConfig = {
            state: {
                translating: {},
                keys: {},
                events: events,
                graphSnapshot: {
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
                updateHistoryPanel: jest.fn(),
            },
            mutations: {
                updateVectorUrl: jest.fn(),
            },
            getters: {},
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = mount(HistoryPanel, {
            localVue,
            store,
            vuetify,
            propsData: {},
        });
        state = storeConfig.state;
    });
    describe("HistoryPanel Methods", () => {
        it("Should display a list of events", (done) => {
            expect(wrapper.html()).toMatch("Move Vectors");
            done();
        });
    });
});
