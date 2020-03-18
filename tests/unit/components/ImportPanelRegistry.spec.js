// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import ImportPanelRegistry from "@/components/ImportPanelRegistry.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../../stubs/acid.json";
import registryJson from "../../stubs/registry.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let acid;
let registry;
let state;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("ImportPanelRegistry.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        registry = JSON.parse(JSON.stringify(registryJson));
        storeConfig = {
            state: {
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
        wrapper = mount(ImportPanelRegistry, {
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
        it("Should call getPublicRegistry action on load", (done) => {
            expect(actions.getPublicRegistry.mock.calls[0][1]).toEqual({
                url: "https://unpkg.com/@plastic-io/registry@1.0.3",
                parent: "root",
            });
            done();
        });
        // it("Should parse items object and return a list of grouped items", (done) => {
        it("Should contain a list of items from the selected Registry", (done) => {
            state.registry = registry;
            wrapper.vm.$nextTick(() => {
                expect(wrapper.html()).toMatch("./standard/index.json");
                done();
            });
        });
        it("Should contain a list of items from the selected Registry grouped by ID", (done) => {
            state.registry = registry;
            const items = wrapper.vm.groupItems(registry["./standard/index.json"].toc.items[1].items);
            expect(JSON.stringify(items, null, "\t")).not.toContain("Number_09835674-9558-4d3c-a18b-d5f63ee3e35e_490");
            done();
        });
        it("Should show a detail list of items filtered on ID", (done) => {
            state.registry = registry;
            const toc = registry["./standard/index.json"].toc;
            const items = wrapper.vm.detailItems(toc.items[1].items, toc.items[1].items[2]);
            expect(items.length).toEqual(2);
            done();
        });
        it("Should drag start with item data", (done) => {
            state.registry = registry;
            const item = registry["./standard/index.json"].toc.items[1].items[2];
            const e = {
                dataTransfer: {
                    setData: jest.fn(),
                    dropEffect: null,
                },
            };
            wrapper.vm.dragStart(e, item);
            expect(e.dataTransfer.setData).toHaveBeenCalledWith("application/json+plastic-io", JSON.stringify(item));
            expect(e.dataTransfer.dropEffect).toEqual("link");
            done();
        });
    });
});
