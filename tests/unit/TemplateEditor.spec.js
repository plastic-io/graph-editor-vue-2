// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import TemplateEditor from "../../src/components/TemplateEditor.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../stubs/acid.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let state;
let acid;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("TemplateEditor.vue", () => {
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
        wrapper = mount(TemplateEditor, {
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
    });
});
