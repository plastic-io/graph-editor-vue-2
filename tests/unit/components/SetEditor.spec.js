// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import SetEditor from "@/components/SetEditor.vue";
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
describe("SetEditor.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        storeConfig = {
            state: {
                selectedVector: null,
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
                updateTemplate: jest.fn(),
            },
            mutations: {},
            getters: {},
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = mount(SetEditor, {
            localVue,
            store,
            vuetify,
            propsData: {
                width: 500,
            },
        });
        actions = storeConfig.actions;
        state = storeConfig.state;
    });
    describe("Graph Edtior Methods", () => {
        it("Should not set a value if there is no selected vector.", (done) => {
            wrapper.vm.setValue();
            expect(wrapper.vm.value).toEqual("");
            done();
        });
        it("Should set a value if there is a selected vector.", (done) => {
            state.selectedVector = acid.vectors[0];
            global.console.warn = jest.fn();
            wrapper.vm.setValue();
            expect(wrapper.vm.value).toEqual(acid.vectors[0].template.set);
            done();
        });
        it("Should send action updateTemplate a new template object when save is clicked.", (done) => {
            acid.vectors[0].template.set = "foo";
            state.selectedVector = acid.vectors[0];
            global.console.error = jest.fn();
            global.console.warn = jest.fn();
            wrapper.vm.$nextTick(() => {
                wrapper.vm.save();
                expect(actions.updateTemplate.mock.calls[0][1]).toEqual({id: "v1", key: "set", value: "foo"});
                done();
            });
        });
        it("Should send action updateTemplate a new template object when CTRL/CMD S is clicked, preventDefault should be called too.", (done) => {
            acid.vectors[0].template.set = "foo";
            state.selectedVector = acid.vectors[0];
            global.console.error = jest.fn();
            global.console.warn = jest.fn();
            wrapper.vm.$nextTick(() => {
                const e = {
                    keyCode: 83,
                    metaKey: true,
                    preventDefault: jest.fn(),
                };
                wrapper.vm.keydown(e);
                expect(actions.updateTemplate.mock.calls[0][1]).toEqual({id: "v1", key: "set", value: "foo"});
                expect(e.preventDefault).toHaveBeenCalled();
                done();
            });
        });
    });
});
