import {Vector} from "@plastic-io/plastic-io"; // eslint-disable-line
declare global {
    interface Window {
        mocha: any;
    }
}
export default function test(context: any, vector: any) {
    context.commit("showTests");
    const log = console.log.bind(console);
    console.log = (...args: any) => {
        const val =  [...args][0];
        if (val[0] === "[") {
            context.commit("addTestOutput", JSON.parse(val));
        }
        log(...args);
    };
    function start() {
        setTimeout(() => {
            if (!window.mocha) {
                return start();
            }
            window.mocha.setup({
                reporter: "json-stream",
                ui: "bdd"
            });
            window.mocha.checkLeaks();
            try {
                eval(vector.template.tests);
            } catch (err) {
                context.commit("raiseError", new Error(err));
            }
            window.mocha.run();
        }, 10);
    }
    start();
}
