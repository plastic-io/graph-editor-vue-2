import {Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
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
            // TODO: provide utils to mock vue client interface
            window.mocha.checkLeaks();
            const componentInstance = context.getters.getGraphReference(vector.__contextId);
            const component = componentInstance.options.components["vector-" + vector.id];
            const setFn = new Function(vector.template.set);
            const testFn = new Function("scheduler", "graph", "vector", "component",
                "set", "componentInstance", vector.template.tests);
            try {
                testFn(componentInstance.$store.state.scheduler, componentInstance.$store.state.graph,
                    vector, component, setFn, componentInstance);
            } catch (err) {
                context.commit("raiseError", new Error(err));
            }
            window.mocha.run();
        }, 10);
    }
    start();
}
