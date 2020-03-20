// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import HelpOverlay from "@/components/HelpOverlay.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import eventsJson from "../../stubs/events.json";
import helpTopics from "@/helpTopics";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let state;
let events;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("HelpOverlay.vue", () => {
    let ctx;
    beforeEach(() => {
        ctx = {
            arc: jest.fn(),
            beginPath: jest.fn(),
            fill: jest.fn(),
            closePath: jest.fn(),
            stroke: jest.fn(),
            lineTo: jest.fn(),
            moveTo: jest.fn(),
            bezierCurveTo: jest.fn(),
            clearRect: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            setTransform: jest.fn(),
        };
        global.document.querySelector = () => {
            return global.document.getElementById();
        };
        global.document.querySelectorAll = () => {
            return [
                global.document.getElementById(),
            ];
        };
        global.document.getElementById = () => {
            return {
                offsetHeight: 100,
                offsetWidth: 100,
                getAttribute() {
                    return "foo";
                },
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
        wrapper.vm.$refs.card = {
            $el: global.document.getElementById(),
        };
        wrapper.vm.$refs.canvas = {
            height: 500,
            width: 500,
            getContext() {
                return ctx;
            }
        };
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
        it("Should contain a bunch of help topics", () => {
            expect(Object.keys(helpTopics).length > 50).toEqual(true);
        });
    });
});
