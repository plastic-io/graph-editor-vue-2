import {Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
import * as vueTestUtils from "@vue/test-utils";
declare global {
    interface Window {
        mocha: any;
    }
}
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
            window.mocha.checkLeaks();
            console.log("test vector", vector);
            const testFn = new Function("VueTestUtils", vector.template.tests);
            try {
                testFn(vueTestUtils);
            } catch (err) {
                context.commit("raiseError", new Error(err));
            }
            window.mocha.run();
        }, 10);
    }
    start();
}
