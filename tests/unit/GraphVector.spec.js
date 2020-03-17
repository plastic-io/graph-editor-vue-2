// import Vue from "vue";
import { mount, createLocalVue } from "@vue/test-utils";
import GraphVector from "../../src/components/GraphVector.vue";
import Vuetify from "vuetify";
import Vue from "vue";
import Vuex from "vuex";
import acidJson from "../stubs/acid.json";
import graphJson from "../stubs/graph.json";
import vectorArtifactJson from "../stubs/vectorArtifact.json";
import graphArtifactJson from "../stubs/graphArtifact.json";
import vectorArtifactGraphJson from "../stubs/vectorArtifactGraph.json";
import graphArtifactGraphJson from "../stubs/graphArtifactGraph.json";
import registryJson from "../stubs/registry.json";
import localTocJson from "../stubs/localToc.json";
const localVue = createLocalVue();
let store;
let storeConfig;
let wrapper;
let graph;
let vectorArtifactGraph;
let vectorArtifact;
let graphArtifactGraph;
let graphArtifact;
let actions;
let acid;
let registry;
let state;
let localToc;
const remoteArtifacts = {};
localVue.use(Vuex);
Vue.use(Vuetify);
describe("GraphVector.vue", () => {
    beforeEach(() => {
        document.body.setAttribute("data-app", true);
        acid = JSON.parse(JSON.stringify(acidJson));
        registry = JSON.parse(JSON.stringify(registryJson));
        localToc = JSON.parse(JSON.stringify(localTocJson));
        graph = JSON.parse(JSON.stringify(graphJson));
        vectorArtifact = JSON.parse(JSON.stringify(vectorArtifactJson));
        vectorArtifactGraph = JSON.parse(JSON.stringify(vectorArtifactGraphJson));
        graphArtifactGraph = JSON.parse(JSON.stringify(graphArtifactGraphJson));
        graphArtifact = JSON.parse(JSON.stringify(graphArtifactJson));
        remoteArtifacts["artifacts/67f24682-0eef-4e78-b454-35e462226eca.486"] = vectorArtifact;
        remoteArtifacts["artifacts/8a70164d-8ecd-4fd6-b363-200db305e751.114"] = graphArtifact;
        remoteArtifacts["artifacts/7873a1b2-8d42-439d-ba45-57b5a514990e.488"] = vectorArtifact;
        remoteArtifacts["artifacts/09835674-9558-4d3c-a18b-d5f63ee3e35e.502"] = vectorArtifact;
        remoteArtifacts["artifacts/665d4b45-a919-4f14-aac2-b8dd970385e8.487"] = vectorArtifact;
        remoteArtifacts["artifacts/c187d1ed-0c85-4303-97d9-8348511c01c9.98"] = vectorArtifact;
        storeConfig = {
            state: {
                presentation: false,
                dataProviders: {
                    publish: {
                        async get(url) {
                            return remoteArtifacts[url];
                        }
                    },
                },
                hoveredVector: null,
                selectedVectors: [],
                showError: null,
                translating: {},
                keys: {},
                scheduler: {
                    errors: {},
                },
                registry: {},
                publicGraphRegistries: [
                    "https://unpkg.com/@plastic-io/registry@1.0.1",
                    "https://unpkg.com/@plastic-io/registry@1.0.2",
                    "https://unpkg.com/@plastic-io/registry@1.0.3",
                ],
                toc: [],
                graph: vectorArtifactGraph,
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
                getToc: jest.fn(),
                removeArtifact: jest.fn(),
                hoveredVector: jest.fn(),
                remove: jest.fn(),
            },
            mutations: {
                clearSchedulerErrorItem: jest.fn(),
                clearSchedulerError: jest.fn(),
                setArtifact: jest.fn(),
                updateVectorData: jest.fn(),
                clearArtifact: jest.fn(),
            },
            getters: {
                getVectorById: jest.fn(),
            },
        };
        store = new Vuex.Store(storeConfig);
        state = storeConfig.state;
        actions = storeConfig.actions;
        let vuetify = new Vuetify();
        wrapper = mount(GraphVector, {
            localVue,
            store,
            vuetify,
            propsData: {
                vector: state.graph.vectors[0],
            },
        });
    });
    describe("Graph Manager Methods", () => {
        it("Should render a vector.", (done) => {
            setTimeout(() => {
                let vuetify = new Vuetify();
                wrapper = mount(GraphVector, {
                    localVue,
                    store,
                    vuetify,
                    propsData: {
                        vector: state.graph.vectors[0],
                    },
                });
                expect(wrapper.html()).toMatch("HELLO");
                done();
            }, 100);
        });
        it("Should render a preloaded linked vector.", (done) => {
            wrapper.setProps({
                vector: state.graph.vectors.find(v => v.id === "3adabde1-85ec-441f-8bdb-6a6c4f690179"),
            });
            setTimeout(() => {
                expect(wrapper.html()).toMatch("this.multiline");
                done();
            }, 100);
        });
        it("Should render a linked vector.", (done) => {
            const vect = state.graph.vectors.find(v => v.id === "3adabde1-85ec-441f-8bdb-6a6c4f69017b");
            let vuetify = new Vuetify();
            wrapper = mount(GraphVector, {
                localVue,
                store,
                vuetify,
                propsData: {
                    vector: vect,
                },
            });
            setTimeout(() => {
                expect(wrapper.html()).toMatch("this.multiline");
                done();
            }, 100);
        });
        it("Should render a preloaded linked graph.", (done) => {
            state.graph = graphArtifactGraph;
            wrapper.setProps({
                vector: state.graph.vectors.find(v => v.id === "b3bb8859-ea48-4873-98a4-0bc9a58a8bc5"),
            });
            setTimeout(() => {
                // should load the remote vector
                expect(wrapper.html()).toMatch("vector-8a50a102-c5ac-4b27-bec9-d70b79b80cff");
                done();
            }, 100);
        });
        it("Should render a linked graph.", (done) => {
            state.graph = graphArtifactGraph;
            let vuetify = new Vuetify();
            wrapper = mount(GraphVector, {
                localVue,
                store,
                vuetify,
                propsData: {
                    vector: state.graph.vectors.find(v => v.id === "b3bb8859-ea48-4873-98a4-0bc9a58a8bcb"),
                },
            });
            setTimeout(() => {
                // should load the remote vector
                expect(wrapper.html()).toMatch("mdi-code-string");
                done();
            }, 100);
        });
        it("Should dispatch hoveredVector actions when hover is called.", (done) => {
            state.graph = graphArtifactGraph;
            wrapper.vm.hover();
            expect(actions.hoveredVector.mock.calls[0][1].id).toEqual("8a50a102-c5ac-4b27-bec9-d70b79b80cff");
            done();
        });
        it("Should dispatch hoveredVector actions when unhover is called.", (done) => {
            state.graph = graphArtifactGraph;
            wrapper.vm.unhover();
            expect(actions.hoveredVector.mock.calls[0][1]).toEqual(null);
            done();
        });
    });
});
