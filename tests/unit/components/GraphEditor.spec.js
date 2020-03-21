// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import GraphEditor from "@/components/GraphEditor.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../../stubs/acid.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let state;
let acid;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("GraphEditor.vue", () => {
    beforeEach(() => {
        storeConfig = {
            state: {
                pathPrefix: "/graph-editor/",
                translating: {},
                keys: {},
                graph: {
                    vectors: [],
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
            },
            actions: {
                open: jest.fn(),
                getToc: jest.fn(),
                preferences: jest.fn(),
                view: jest.fn(),
                mouse: jest.fn(),
                translating: jest.fn(),
                keyup: jest.fn(),
                keydown: jest.fn(),
            },
            mutations: {},
            getters: {},
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = mount(GraphEditor, {
            localVue,
            store,
            vuetify,
            propsData: {
                route: {
                    path: "/graph-editor/1234"
                },
            },
        });
        actions = storeConfig.actions;
        state = storeConfig.state;
        acid = JSON.parse(JSON.stringify(acidJson));
    });
    describe("Graph Edtior Methods", () => {
        it("Should attempt to open the current document and fetch the local TOC", (done) => {
            expect(actions.getToc).toHaveBeenCalled();
            expect(actions.open.mock.calls[0][1].graphId).toEqual("1234");
            done();
        });
        it("Calling openGraph should invoke window.open /graphs target _graphs", (done) => {
            window.open = jest.fn();
            wrapper.vm.openGraph();
            expect(window.open).toHaveBeenCalledWith("/graph-editor/graphs", "_graphs");
            done();
        });
        it("Calling toggleGrid should invert the showGrid boolean on the state as an argument to prefrences action", (done) => {
            wrapper.vm.toggleGrid();
            expect(actions.preferences).toHaveBeenCalled();
            expect(actions.preferences.mock.calls[0][1]).toEqual({appearance: {showGrid: true}});
            done();
        });
        it("Calling zoomOut should zoom out - .10 by setting the view", (done) => {
            wrapper.vm.zoomOut();
            expect(actions.view).toHaveBeenCalled();
            expect(actions.view.mock.calls[0][1]).toEqual({x: 0, y: 0, k: 0.9});
            done();
        });
        it("Calling zoomIn should zoom in + .10 by setting the view", (done) => {
            wrapper.vm.zoomIn();
            expect(actions.view).toHaveBeenCalled();
            expect(actions.view.mock.calls[0][1]).toEqual({x: 0, y: 0, k: 1.1});
            done();
        });
        it("Calling resetZoom should set the zoom to 1 by setting the view", (done) => {
            wrapper.vm.resetZoom();
            expect(actions.view).toHaveBeenCalled();
            expect(actions.view.mock.calls[0][1]).toEqual({x: 0, y: 0, k: 1});
            done();
        });
        it("Calling isGraphTarget when state is locked and target className is vector should return false", (done) => {
            state.locked = true;
            expect(wrapper.vm.isGraphTarget({
                target: {
                    className: "vector",
                }
            })).toEqual(false);
            done();
        });
        it("Calling isGraphTarget when state is unlocked and target className is vector should return true", (done) => {
            state.locked = false;
            expect(wrapper.vm.isGraphTarget({
                target: {
                    className: "vector",
                }
            })).toEqual(true);
            done();
        });
        it("Calling isGraphTarget when state is locked and target's ancestor className is vector should return true", (done) => {
            state.locked = true;
            expect(wrapper.vm.isGraphTarget({
                target: {
                    className: "not-vector",
                    parentNode: {
                        className: "vector",
                    }
                }
            })).toEqual(false);
            done();
        });
        ["no-graph-target", "v-list", "v-menu"].forEach((className) => {
            it(`Calling isGraphTarget when target class name is ${className} should return false`, (done) => {
                expect(wrapper.vm.isGraphTarget({
                    target: {
                        className,
                    }
                })).toEqual(false);
                done();
            });
        });
        it("When showHelp is false, pressing the left mouse button should take a translation snapshot and dispatch mouse button change action", (done) => {
            wrapper.vm.mousedown({
                clientX: 100,
                clientY: 100,
                button: 0,
                target: {
                    className: "not-vector",
                },
            });
            expect(actions.translating.mock.calls[0][1]).toEqual({mouse: {x: 0, y: 0}, vectors: [], view: {x: 0, y: 0}});
            expect(actions.mouse).toHaveBeenCalled();
            expect(actions.mouse.mock.calls[0][1]).toEqual({lmb: true, mmb: false, rmb: false, x: 0, y: 0});
            done();
        });
        it("Should transmit a mouse event with the mouse button up on mouseup.", (done) => {
            wrapper.vm.mouseup({
                clientX: 100,
                clientY: 100,
                button: 0,
                target: {
                    className: "vector",
                },
            });
            expect(actions.mouse.mock.calls[0][1]).toEqual({lmb: false, mmb: false, rmb: false, x: 0, y: 0});
            done();
        });
        it("Should scale correctly on scale method.", (done) => {
            wrapper.vm.scale({
                clientX: 100,
                clientY: 100,
                wheelDelta: 120,
                button: 0,
                target: {
                    className: "vector",
                },
            });
            expect(actions.view.mock.calls[0][1]).toEqual({k: 1.01, x: -1, y: -1});
            done();
        });
        it("Should return a set of copied vectors with truncated connector list ready for copy.", (done) => {
            const vectors = wrapper.vm.copyVectors(acid.vectors.filter(v => v.id === "v1"));
            expect(vectors[0].edges[0].connectors.length).toEqual(0);
            done();
        });
        it("Should dispatch a keyup message.", (done) => {
            wrapper.vm.keyup({
                keyCode: 34,
                target: document.body,
            });
            expect(actions.keyup.mock.calls[0][1]).toEqual({keyCode: 34, target: document.body});
            done();
        });
        it("Should dispatch a keydown message.", (done) => {
            wrapper.vm.keydown({
                keyCode: 34,
                target: document.body,
            });
            expect(actions.keydown.mock.calls[0][1]).toEqual({keyCode: 34, target: document.body});
            done();
        });
    });
});
