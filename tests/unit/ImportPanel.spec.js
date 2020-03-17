// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import ImportPanel from "../../src/components/ImportPanel.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../stubs/acid.json";
import registryJson from "../stubs/registry.json";
import localTocJson from "../stubs/localToc.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let acid;
let registry;
let state;
let localToc;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("ImportPanel.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        registry = JSON.parse(JSON.stringify(registryJson));
        localToc = JSON.parse(JSON.stringify(localTocJson));
        storeConfig = {
            state: {
                toc: localToc,
                translating: {},
                keys: {},
                registry: {},
                publicGraphRegistries: [
                    "https://unpkg.com/@plastic-io/registry@1.0.1",
                    "https://unpkg.com/@plastic-io/registry@1.0.2",
                    "https://unpkg.com/@plastic-io/registry@1.0.3",
                ],
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
                getPublicRegistry: jest.fn(),
            },
            mutations: {},
            getters: {},
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = mount(ImportPanel, {
            localVue,
            sync: false,
            store,
            vuetify,
            propsData: {
                list: localToc,
            },
        });
        actions = storeConfig.actions;
        state = storeConfig.state;
    });
    describe("Vector Field Methods", () => {
        it("Should render the local toc.", (done) => {
            expect(wrapper.html()).toMatch("Sends the string BANG");
            done();
        });
        it("Should update the local toc when state toc has changed.", (done) => {
            let vuetify = new Vuetify();
            wrapper = mount(ImportPanel, {
                sync: false,
                localVue,
                store,
                vuetify,
                propsData: {
                    list: {},
                },
            });
            wrapper.vm.$nextTick(() => {
                expect(wrapper.html()).not.toMatch("Sends the string BANG");
                done();
            });
        });
    });
});
