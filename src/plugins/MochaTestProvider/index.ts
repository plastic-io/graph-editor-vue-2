/*
Example plugin
    module.exports = function (hostStore, config) {
        return {
            install: () => {
                const store = {
                    namespaced: true,
                    state: {
                        status: "PENDING",
                    },
                    mutations: {
                        SET_STATUS(state, e) {
                            state.status = e;
                        },
                    },
                    actions: {
                        changeStatus(context, e) {
                            context.commit("SET_STATUS", e);
                        }
                    },
                };
                // add graph editor plugins
                context.commit("addPlugin", {
                    type: "vectorProperties",
                    icon: "mdi-flask",
                    component: TestView,
                });
                // add custom store
                hostStore.registerModule('slg-vuex-module-template', store);
            }
        };
    };
*/
import {Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
import VectorTests from "./VectorTests.vue";
import GraphTests from "./GraphTests.vue";
declare global {
    interface Window {
        mocha: any;
    }
}
// TODO: This all needs to be web worker to stop mem sharing
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
function test(context: any, vector: any) {
    context.commit("showTests");
    function start() {
        setTimeout(() => {
            if (!window.mocha) {
                return start();
            }
            window.mocha.setup({
                reporter: "json-stream",
                ui: "bdd",
                cleanReferencesAfterRun: false,
            });
            // TODO: provide utils to mock vue client interface
            window.mocha.checkLeaks();
            const componentInstance = context.getters.getGraphReference(vector.__contextId);
            const setFn = new Function(vector.template.set);
            const testFn = new Function("scheduler", "graph", "vector", "set", "componentInstance", vector.template.tests);
            try {
                testFn(componentInstance.$store.state.scheduler, componentInstance.$store.state.graph,
                    vector, setFn, componentInstance);
            } catch (err) {
                context.commit("raiseError", new Error(err));
            }
            window.mocha.run();
        }, 10);
    }
    start();
}
export default function (context: any) {
    return {
        install() {
            const store = {
                actions: {
                    runVectorTest(context: any, vector: any) {
                        test(context, vector);
                    },
                },
            };
            context.commit("addPlugin", {
                type: "vectorProperties",
                icon: "mdi-flask",
                component: VectorTests,
            });
            context.commit("addPlugin", {
                type: "graphProperties",
                icon: "mdi-flask",
                component: GraphTests,
            });
            context.registerModule("mocha-tests", store);
        },
    };
}
