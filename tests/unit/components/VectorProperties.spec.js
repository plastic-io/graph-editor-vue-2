// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import VectorProperties from "@/components/VectorProperties.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acid from "../../stubs/acid.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let state;
let mutations;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("VectorProperties.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        const graph = acid;
        storeConfig = {
            state: {
                translating: {},
                keys: {},
                graph: graph,
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
                updateVectorProperties: jest.fn(),
            },
            mutations: {
                updateVectorUrl: jest.fn(),
            },
            getters: {},
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = mount(VectorProperties, {
            localVue,
            store,
            vuetify,
            propsData: {},
        });
        actions = storeConfig.actions;
        mutations = storeConfig.mutations;
        state = storeConfig.state;
    });
    describe("VectorProperties Methods", () => {
        it("Should set the URL of the vector", (done) => {
            wrapper.vm.vector = JSON.parse(JSON.stringify(state.graph.vectors[0]));
            wrapper.vm.updateVectorUrl("foo");
            wrapper.vm.$nextTick(() => {
                expect(mutations.updateVectorUrl.mock.calls[0][1]).toEqual({
                    vectorId: "v1",
                    url: "index"
                });
                done();
            });
        });
        it("Should set the URL of the vector", (done) => {
            state.selectedVector = JSON.parse(JSON.stringify(state.graph.vectors[0]));
            wrapper.vm.$nextTick(() => {
                expect(wrapper.vm.vector.id).toEqual("v1");
                done();
            });
        });
        it("Should invoke updateVectorProperties when properties are updated", (done) => {
            state.selectedVector = JSON.parse(JSON.stringify(state.graph.vectors[0]));
            wrapper.vm.vector = JSON.parse(JSON.stringify(state.graph.vectors[0]));
            wrapper.vm.vector.properties = {
                x: 0,
                y: 0,
                presentation: {
                    x: 0,
                    y: 0,
                }
            };
            expect(actions.updateVectorProperties).toHaveBeenCalled();
            done();
        });
    });
});
