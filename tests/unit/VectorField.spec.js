// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import VectorField from "../../src/components/VectorField.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../stubs/acid.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let acid;
let state;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("VectorField.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        storeConfig = {
            state: {
                translating: {},
                keys: {},
                graph: acid,
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
                hoveredPort: jest.fn(),
            },
            mutations: {},
            getters: {},
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = mount(VectorField, {
            localVue,
            store,
            vuetify,
            propsData: {
                field: {
                    name: "proxy",
                },
                vector: acid.vectors[0],
                type: "output",
            },
        });
        actions = storeConfig.actions;
        state = storeConfig.state;
    });
    describe("Vector Field Methods", () => {
        it("Should unhover a hovered port by calling hoveredPort with null", (done) => {
            wrapper.vm.unhoverPort();
            expect(actions.hoveredPort.mock.calls[0][1]).toEqual(null);
            done();
        });
        it("Should hover a hovered port by calling hoveredPort with null", (done) => {
            wrapper.vm.hoverPort();
            expect(actions.hoveredPort.mock.calls[0][1].type).toEqual("output");
            expect(actions.hoveredPort.mock.calls[0][1].vector).toEqual(acid.vectors[0]);
            expect(actions.hoveredPort.mock.calls[0][1].edge).toEqual(acid.vectors[0].edges[0]);
            expect(actions.hoveredPort.mock.calls[0][1].field).toEqual({
                name: "proxy",
            });
            done();
        });
    });
});
