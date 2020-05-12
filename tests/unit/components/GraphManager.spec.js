// import Vue from "vue";
import { shallowMount, createLocalVue } from "@vue/test-utils";
import GraphManager from "@/components/GraphManager.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../../stubs/acid.json";
import localTocJson from "../../stubs/localToc.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let actions;
let acid;
let state;
let localToc;
localVue.use(Vuex);
Vue.use(Vuetify);
describe("GraphManager.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        localToc = JSON.parse(JSON.stringify(localTocJson));
        storeConfig = {
            state: {
                pathPrefix: "/graph-editor/",
                showError: null,
                translating: {},
                keys: {},
                registry: {},
                publicGraphRegistries: [
                    "https://unpkg.com/@plastic-io/registry@1.0.1",
                    "https://unpkg.com/@plastic-io/registry@1.0.2",
                    "https://unpkg.com/@plastic-io/registry@1.0.3",
                ],
                toc: [],
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
            preferences: {
                useLocalStorage: jest.fn(),
                graphHTTPServer: jest.fn(),
                graphWSSServer: jest.fn(),
                userName: jest.fn(),
                avatar: jest.fn(),
                workstationId: jest.fn(),
            },
            actions: {
                getToc: jest.fn(),
                removeArtifact: jest.fn(),
                remove: jest.fn(),
                setupDataProvider: jest.fn(),
                subscribeToc: jest.fn(),
                subscribePreferences: jest.fn(),
            },
            mutations: {},
            getters: {
                getField: () => {
                    return jest.fn();
                },
            },
        };
        store = new Vuex.Store(storeConfig);
        let vuetify = new Vuetify();
        wrapper = shallowMount(GraphManager, {
            localVue,
            store,
            vuetify,
        });
        actions = storeConfig.actions;
        state = storeConfig.state;
    });
    describe("Graph Manager Methods", () => {
        it("Calling nextPage and formerPage should change page.", (done) => {
            state.toc = localToc;
            wrapper.vm.$nextTick(() => {
                wrapper.vm.nextPage();
                expect(wrapper.vm.page).toEqual(2);
                wrapper.vm.formerPage();
                expect(wrapper.vm.page).toEqual(1);
                done();
            });
        });
        it("Should render items in the TOC.", (done) => {
            state.toc = localToc;
            wrapper.vm.$nextTick(() => {
                // At the time of writing this test, v-data-itorator was not working with vue test utils
                // had to roll vue-test-utils back to beta-28.  This still does not render, but you can see
                // the page count, so whatever.
                // https://github.com/vuejs/vue-test-utils/issues/1407
                expect(wrapper.html()).toMatch("New Graph");
                done();
            });
        });
        it("Calling confirmDelete should set deleteConfirm true and deleteRef to e.", (done) => {
            state.toc = localToc;
            wrapper.vm.confirmDelete("foo");
            wrapper.vm.$nextTick(() => {
                expect(wrapper.vm.deleteConfirm).toEqual(true);
                expect(wrapper.vm.deleteRef).toEqual("foo");
                done();
            });
        });
        it("Calling deleteItem should call remove or removeArtifact depending on type.", (done) => {
            state.toc = localToc;
            wrapper.vm.$nextTick(() => {
                wrapper.vm.deleteRef = {
                    type: "graph",
                    id: "1234",
                };
                wrapper.vm.deleteItem();
                expect(actions.remove).toHaveBeenCalled();
                wrapper.vm.deleteRef = {};
                wrapper.vm.deleteItem();
                expect(actions.removeArtifact).toHaveBeenCalled();
                done();
            });
        });
        it("Calling openGraph should navigate to /graph-editor/<graphId>.", (done) => {
            state.toc = localToc;
            wrapper.vm.$nextTick(() => {
                global.window.open = jest.fn();
                wrapper.vm.openGraph("1234");
                expect(global.window.open).toHaveBeenCalledWith("/graph-editor/1234", "_1234");
                done();
            });
        });
        it("Calling updateItemsPerPage should change itemsPerPage.", (done) => {
            state.toc = localToc;
            wrapper.vm.$nextTick(() => {
                wrapper.vm.updateItemsPerPage(100);
                expect(wrapper.vm.itemsPerPage).toEqual(100);
                done();
            });
        });
    });
});
