// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import ImportPanelList from "@/components/ImportPanelList.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../../stubs/acid.json";
import localTocJson from "../../stubs/localToc.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let acid;
let localToc;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("ImportPanelList.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        localToc = JSON.parse(JSON.stringify(localTocJson));
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
        wrapper = mount(ImportPanelList, {
            localVue,
            store,
            vuetify,
            propsData: {
                list: localToc,
            },
        });
    });
    describe("Vector Field Methods", () => {
        it("Should show a transformed list of the items passed in.", (done) => {
            wrapper.vm.selectedItem = 
            wrapper.vm.$nextTick(() => {
                expect(wrapper.html()).toMatch("Sends the string BANG");
                done();
            });
        });
        it("Should drag start with item data", (done) => {
            const item = {
                foo: "bar",
            };
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
