import {Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
import * as vueTestUtils from "@vue/test-utils";
import Vue from "vue";
import Vuex from "vuex";
import Vuetify from "vuetify";
declare global {
    interface Window {
        mocha: any;
    }
}
// TODO: This all needs to be web worker to stop mem sharing
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers
export default function test(context: any, vector: any) {
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
            // TODO: provide utils to mock set interface
            // "scheduler", "graph", "cache", "vector", "field",
            // "state", "value", "edges", "data", "properties", "require"
            window.mocha.checkLeaks();
            const componentInstance = context.getters.getGraphReference(vector.__contextId);
            const V = Vue as any;
            const component = V.options.components["vector-" + vector.id];
            const setFn = new Function(vector.template.set);
            const testFn = new Function("scheduler", "graph", "vector", "component",
                "set", "componentInstance", "Vuex", "VueTestUtils", "Vuetify", vector.template.tests);
            try {
                Vue.use(Vuetify);
                testFn(componentInstance.$store.state.scheduler, componentInstance.$store.state.graph,
                    vector, component, setFn, componentInstance, Vuex, vueTestUtils, Vuetify);
            } catch (err) {
                context.commit("raiseError", new Error(err));
            }
            window.mocha.run();
        }, 10);
    }
    start();
}
